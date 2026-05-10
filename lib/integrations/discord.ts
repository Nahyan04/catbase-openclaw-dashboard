import "server-only";

import { env } from "@/lib/env";

export type DiscordEmbed = {
  title?: string;
  description?: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  timestamp?: string;
};

export type DiscordMessage = {
  content?: string;
  embeds?: DiscordEmbed[];
};

export type PostResult =
  | { ok: true }
  | { skipped: "no-webhook" }
  | { ok: false; error: string };

/**
 * POST a payload to the configured Discord webhook.
 *
 * Returns `{ skipped: "no-webhook" }` when DISCORD_WEBHOOK_URL is unset so
 * callers can no-op without crashing in dev / unconfigured environments.
 */
export async function postToDiscord(
  message: DiscordMessage,
): Promise<PostResult> {
  const url = env.DISCORD_WEBHOOK_URL;
  if (!url) return { skipped: "no-webhook" };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(message),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return {
        ok: false,
        error: `discord webhook ${res.status}: ${body.slice(0, 200)}`,
      };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ---------------------------------------------------------------------------
// Failed-run alert subscriber
// ---------------------------------------------------------------------------

type RunEndPayload = {
  id?: string;
  agentId?: string;
  title?: string;
  status?: string;
  error?: string;
};

function isRunEndPayload(value: unknown): value is RunEndPayload {
  return typeof value === "object" && value !== null;
}

let started = false;

/**
 * Subscribe (server-side, once per process) to the OpenClaw event stream and
 * post a Discord alert whenever an `agent:run-end` event arrives with status
 * `failed`. No-ops when DISCORD_WEBHOOK_URL is unset, but still subscribes so
 * the subscriber begins emitting the moment the env var is set + restart.
 *
 * Started from `instrumentation.ts` at boot. Idempotent.
 */
export function startFailedRunAlerts(): void {
  if (started) return;
  started = true;

  void runSubscriber();
}

async function runSubscriber(): Promise<void> {
  const { subscribeToGateway } = await import("@/lib/openclaw/events");

  try {
    for await (const evt of subscribeToGateway()) {
      if (evt.event !== "agent:run-end") continue;
      if (!isRunEndPayload(evt.data)) continue;
      if (evt.data.status !== "failed") continue;

      const { id, agentId, title, error } = evt.data;

      const fields: DiscordEmbed["fields"] = [];
      if (agentId) fields.push({ name: "Agent", value: agentId, inline: true });
      if (id) fields.push({ name: "Run", value: id, inline: true });
      if (error) fields.push({ name: "Error", value: error.slice(0, 1000) });

      await postToDiscord({
        embeds: [
          {
            title: `❌ Run failed${title ? `: ${title}` : ""}`,
            color: 0xf2a7b8,
            fields,
            timestamp: evt.at,
          },
        ],
      });
    }
  } catch (err) {
    // Subscriber should not throw — log and exit silently. instrumentation.ts
    // re-bootstraps on the next process restart.
    console.error("[discord] failed-run subscriber crashed:", err);
  }
}
