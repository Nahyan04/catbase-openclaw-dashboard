import { describe, it, expect, beforeEach, vi } from "vitest";

// vi.mock is hoisted before imports, so the mock is in place when client.ts
// does `await import("@openclaw/sdk")` inside getOpenClaw().
vi.mock("@openclaw/sdk", () => ({
  OpenClaw: class MockOpenClaw {
    connect = vi.fn().mockResolvedValue(undefined);
    disconnect = vi.fn().mockResolvedValue(undefined);
    agents = { list: vi.fn().mockResolvedValue([]) };
    sessions = { list: vi.fn().mockResolvedValue([]) };
    runs = {
      list: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
    };
    artifacts = { list: vi.fn().mockResolvedValue([]) };
    events = vi.fn().mockReturnValue({ [Symbol.asyncIterator]: () => ({ next: async () => ({ done: true, value: undefined }) }) });
  },
}));

describe("lib/openclaw/client", () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.unstubAllEnvs();

    // Ensure a valid gateway URL is always present so env.ts parses cleanly.
    vi.stubEnv("OPENCLAW_GATEWAY_URL", "ws://127.0.0.1:18789");
    vi.stubEnv("OPENCLAW_WORKSPACE", "");
    vi.stubEnv("OPENCLAW_STUB", undefined);

    // Re-import and reset the singleton after each module reload.
    const mod = await import("@/lib/openclaw/client");
    mod.resetOpenClawClientForTests();
  });

  it("returns null and status 'no-credentials' when token is missing", async () => {
    vi.stubEnv("OPENCLAW_GATEWAY_TOKEN", undefined);
    vi.resetModules();

    const { getOpenClaw, getConnectionStatus, resetOpenClawClientForTests } =
      await import("@/lib/openclaw/client");
    resetOpenClawClientForTests();

    const result = await getOpenClaw();

    expect(result).toBeNull();
    expect(getConnectionStatus()).toBe("no-credentials");
  });

  it("returns the mocked client and status 'connected' when token is present and connect resolves", async () => {
    vi.stubEnv("OPENCLAW_GATEWAY_TOKEN", "valid-token");
    vi.resetModules();

    const { getOpenClaw, getConnectionStatus, resetOpenClawClientForTests } =
      await import("@/lib/openclaw/client");
    resetOpenClawClientForTests();

    const result = await getOpenClaw();

    expect(result).not.toBeNull();
    expect(getConnectionStatus()).toBe("connected");
  });

  it("returns null and status 'disconnected' when connect rejects", async () => {
    vi.stubEnv("OPENCLAW_GATEWAY_TOKEN", "valid-token");

    // Override the mock so connect() throws for this test only.
    vi.doMock("@openclaw/sdk", () => ({
      OpenClaw: class FailingOpenClaw {
        connect = vi.fn().mockRejectedValue(new Error("connection refused"));
        disconnect = vi.fn().mockResolvedValue(undefined);
        agents = { list: vi.fn() };
        sessions = { list: vi.fn() };
        runs = { list: vi.fn(), create: vi.fn(), update: vi.fn() };
        artifacts = { list: vi.fn() };
        events = vi.fn();
      },
    }));

    vi.resetModules();

    const { getOpenClaw, getConnectionStatus, resetOpenClawClientForTests } =
      await import("@/lib/openclaw/client");
    resetOpenClawClientForTests();

    const result = await getOpenClaw();

    expect(result).toBeNull();
    expect(getConnectionStatus()).toBe("disconnected");
  });

  it("returns null and status 'disconnected' when the SDK module is not found", async () => {
    vi.stubEnv("OPENCLAW_GATEWAY_TOKEN", "valid-token");

    // Simulate MODULE_NOT_FOUND by making the dynamic import reject.
    vi.doMock("@openclaw/sdk", () => {
      throw Object.assign(new Error("Cannot find module '@openclaw/sdk'"), {
        code: "MODULE_NOT_FOUND",
      });
    });

    vi.resetModules();

    const { getOpenClaw, getConnectionStatus, resetOpenClawClientForTests } =
      await import("@/lib/openclaw/client");
    resetOpenClawClientForTests();

    const result = await getOpenClaw();

    expect(result).toBeNull();
    expect(getConnectionStatus()).toBe("disconnected");
  });
});
