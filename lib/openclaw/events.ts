import "server-only";

import { getOpenClaw, getConnectionStatus } from "@/lib/openclaw/client";

/** Backoff delays in milliseconds, capped at the last entry. */
const BACKOFF_MS = [1_000, 2_000, 5_000, 10_000, 30_000] as const;

function now(): string {
  return new Date().toISOString();
}

/** Resolves after `ms` milliseconds, or rejects if `signal` is aborted first. */
function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

/**
 * Async generator that subscribes to gateway events via the OpenClaw SDK.
 *
 * Yields:
 *   - gateway:opening    — immediately on call
 *   - gateway:no-credentials — when no token is configured (then ends)
 *   - gateway:disconnected   — when the client is unavailable or loses connection
 *   - <any OpenClawEvent>    — forwarded from client.events()
 *
 * Reconnects with exponential backoff on iterator errors.
 * Ends cleanly when signal is aborted.
 */
export async function* subscribeToGateway(
  signal?: AbortSignal,
): AsyncGenerator<{ event: string; data: unknown; at: string }> {
  // Always emit gateway:opening first.
  yield { event: "gateway:opening", data: {}, at: now() };

  if (signal?.aborted) return;

  // Try to acquire the SDK client.
  const client = await getOpenClaw();

  if (client === null) {
    if (getConnectionStatus() === "no-credentials") {
      yield { event: "gateway:no-credentials", data: {}, at: now() };
    } else {
      yield {
        event: "gateway:disconnected",
        data: { reason: "client-unavailable" },
        at: now(),
      };
    }
    return;
  }

  // Stream events with reconnect + backoff.
  let attempt = 0;

  while (!signal?.aborted) {
    // Re-acquire the client on reconnect attempts (attempt > 0).
    const activeClient = attempt === 0 ? client : await getOpenClaw();

    if (activeClient === null) {
      if (signal?.aborted) return;
      yield {
        event: "gateway:disconnected",
        data: { reason: "client-unavailable" },
        at: now(),
      };
      // Backoff before retry.
      const delay = BACKOFF_MS[Math.min(attempt, BACKOFF_MS.length - 1)];
      attempt++;
      try {
        await sleep(delay, signal);
      } catch {
        // Aborted during sleep.
        return;
      }
      continue;
    }

    try {
      for await (const sdkEvent of activeClient.events()) {
        if (signal?.aborted) return;
        yield {
          event: sdkEvent.event,
          data: sdkEvent.data,
          at: sdkEvent.at ?? now(),
        };
      }
      // Iterator exhausted cleanly — exit the reconnect loop.
      return;
    } catch (err: unknown) {
      if (signal?.aborted) return;

      const reason =
        err instanceof Error ? err.message : String(err);

      yield {
        event: "gateway:disconnected",
        data: { reason },
        at: now(),
      };

      // Backoff before retry.
      const delay = BACKOFF_MS[Math.min(attempt, BACKOFF_MS.length - 1)];
      attempt++;
      try {
        await sleep(delay, signal);
      } catch {
        // Aborted during sleep.
        return;
      }
    }
  }
}
