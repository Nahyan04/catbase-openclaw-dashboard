import "server-only";

import { env } from "@/lib/env";
import { createStubClient } from "@/lib/openclaw/stub";
import type { OpenClawClient } from "@/lib/openclaw/types";

let _client: OpenClawClient | null = null;
let _status: "connected" | "disconnected" | "no-credentials" = "disconnected";

/** Reset the singleton — called by tests between cases. */
export function resetOpenClawClientForTests(): void {
  _client = null;
  _status = "disconnected";
}

export function getConnectionStatus(): "connected" | "disconnected" | "no-credentials" {
  return _status;
}

/**
 * Returns a connected OpenClawClient, or null when:
 *   - credentials are absent
 *   - the SDK package cannot be imported (not yet published)
 *   - the connect() call fails
 *
 * Never throws to callers.
 */
export async function getOpenClaw(): Promise<OpenClawClient | null> {
  // Stub mode: skip credentials check entirely and return a fixture-backed client.
  if (env.OPENCLAW_STUB === "1") {
    if (_client) return _client;
    _client = createStubClient();
    _status = "connected";
    return _client;
  }

  // Return the cached singleton if already connected.
  if (_client !== null) {
    return _client;
  }

  // No credentials → degrade gracefully.
  if (!env.OPENCLAW_GATEWAY_TOKEN) {
    _status = "no-credentials";
    return null;
  }

  // Attempt to import the SDK (may not be installed yet).
  let OpenClaw: new (opts: { url: string; token: string }) => OpenClawClient;
  try {
    const mod = await import("@openclaw/sdk");
    OpenClaw = mod.OpenClaw;
  } catch {
    console.warn("[openclaw] @openclaw/sdk is not installed — running without live gateway.");
    _status = "disconnected";
    return null;
  }

  // Instantiate and connect.
  const client = new OpenClaw({
    url: env.OPENCLAW_GATEWAY_URL,
    token: env.OPENCLAW_GATEWAY_TOKEN,
  });

  try {
    await client.connect();
  } catch (err) {
    console.warn("[openclaw] connect() failed:", err);
    _status = "disconnected";
    return null;
  }

  _client = client;
  _status = "connected";
  return _client;
}
