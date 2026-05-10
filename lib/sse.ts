import "server-only";

const KEEPALIVE_INTERVAL_MS = 15_000;

/**
 * Streams an AsyncIterable of SSE events as a Response.
 *
 * Each event is encoded as:
 *   event: <name>\ndata: <JSON>\n\n
 *
 * A `: keepalive\n\n` comment is sent every 15 s to prevent
 * intermediate-proxy timeouts.
 *
 * The stream closes when:
 *   - the events iterable is exhausted, or
 *   - signal.aborted becomes true.
 */
export function streamSse(
  events: AsyncIterable<{ event: string; data: unknown }>,
  signal?: AbortSignal,
): Response {
  const encoder = new TextEncoder();

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      let keepaliveTimer: ReturnType<typeof setInterval> | null = null;

      const enqueue = (chunk: string) => {
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          // Stream already closed — ignore.
        }
      };

      const close = () => {
        if (keepaliveTimer !== null) {
          clearInterval(keepaliveTimer);
          keepaliveTimer = null;
        }
        try {
          controller.close();
        } catch {
          // Already closed — ignore.
        }
      };

      // Abort signal handler.
      if (signal?.aborted) {
        close();
        return;
      }

      const onAbort = () => close();
      signal?.addEventListener("abort", onAbort, { once: true });

      // Keepalive comment every 15 s.
      keepaliveTimer = setInterval(() => {
        if (signal?.aborted) {
          close();
          return;
        }
        enqueue(": keepalive\n\n");
      }, KEEPALIVE_INTERVAL_MS);

      try {
        for await (const { event, data } of events) {
          if (signal?.aborted) break;
          enqueue(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        }
      } finally {
        signal?.removeEventListener("abort", onAbort);
        close();
      }
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
