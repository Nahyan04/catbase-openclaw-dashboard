import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("lib/env", () => {
  beforeEach(() => {
    // Reset module registry so that each test re-executes env.ts from scratch
    vi.resetModules();
  });

  afterEach(() => {
    // Restore all stubbed env vars after each test
    vi.unstubAllEnvs();
  });

  it("parses cleanly when required vars are set", async () => {
    vi.stubEnv("OPENCLAW_GATEWAY_URL", "ws://127.0.0.1:18789");
    vi.stubEnv("OPENCLAW_WORKSPACE", "/home/user/.openclaw/workspace");

    const { env } = await import("@/lib/env");

    expect(env.OPENCLAW_GATEWAY_URL).toBe("ws://127.0.0.1:18789");
    expect(env.OPENCLAW_WORKSPACE).toBe("/home/user/.openclaw/workspace");
  });

  it("throws when NEXT_PUBLIC_OPENCLAW_GATEWAY_TOKEN is defined", async () => {
    vi.stubEnv("NEXT_PUBLIC_OPENCLAW_GATEWAY_TOKEN", "leaked-token");

    await expect(import("@/lib/env")).rejects.toThrow(
      "NEXT_PUBLIC_OPENCLAW_GATEWAY_TOKEN must never be defined",
    );
  });

  it("returns undefined for optional vars when they are not set", async () => {
    vi.stubEnv("OPENCLAW_GATEWAY_URL", "ws://127.0.0.1:18789");
    vi.stubEnv("OPENCLAW_WORKSPACE", "/home/user/.openclaw/workspace");
    // Ensure optional vars are absent (vitest 4 accepts string | undefined)
    vi.stubEnv("OPENCLAW_GATEWAY_TOKEN", undefined);
    vi.stubEnv("DISCORD_WEBHOOK_URL", undefined);
    vi.stubEnv("GITHUB_TOKEN", undefined);
    vi.stubEnv("TWITTER_API_KEY", undefined);
    vi.stubEnv("GOOGLE_CALENDAR_CREDENTIALS", undefined);

    const { env } = await import("@/lib/env");

    expect(env.OPENCLAW_GATEWAY_TOKEN).toBeUndefined();
    expect(env.DISCORD_WEBHOOK_URL).toBeUndefined();
    expect(env.GITHUB_TOKEN).toBeUndefined();
    expect(env.TWITTER_API_KEY).toBeUndefined();
    expect(env.GOOGLE_CALENDAR_CREDENTIALS).toBeUndefined();
  });

  it("uses the default gateway URL when OPENCLAW_GATEWAY_URL is not set", async () => {
    vi.stubEnv("OPENCLAW_GATEWAY_URL", undefined);
    vi.stubEnv("OPENCLAW_WORKSPACE", "/some/path");

    const { env } = await import("@/lib/env");

    expect(env.OPENCLAW_GATEWAY_URL).toBe("ws://127.0.0.1:18789");
  });

  it("throws when OPENCLAW_GATEWAY_URL is not a valid URL", async () => {
    vi.stubEnv("OPENCLAW_GATEWAY_URL", "not-a-url");
    vi.stubEnv("OPENCLAW_WORKSPACE", "/tmp/ws");
    await expect(import("@/lib/env")).rejects.toThrow();
  });
});
