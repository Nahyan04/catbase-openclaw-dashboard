import { describe, it, expect } from "vitest";
import { computePresence } from "@/lib/agents/presence";
import { AGENTS } from "@/lib/agents/registry";
import type { OpenClawSession, OpenClawRun } from "@/lib/openclaw/types";

// Fixed "now" used across all tests for deterministic assertions.
const NOW = new Date("2026-05-09T13:30:00Z");

// ---- Helpers -----------------------------------------------------------------

function makeSession(agentId: string, opts: { closedAt?: string } = {}): OpenClawSession {
  return {
    id: `sess-${agentId}-${Date.now()}-${Math.random()}`,
    agentId,
    openedAt: "2026-05-09T13:00:00Z",
    ...opts,
  };
}

function makeRun(
  agentId: string,
  overrides: Partial<OpenClawRun> = {},
): OpenClawRun {
  return {
    id: `run-${agentId}-${Date.now()}-${Math.random()}`,
    agentId,
    status: "completed",
    createdAt: "2026-05-09T10:00:00Z",
    ...overrides,
  };
}

// ---- Tests -------------------------------------------------------------------

describe("computePresence", () => {
  it("1. active — open session exists for the agent", () => {
    const sessions: OpenClawSession[] = [
      // Alyvis has an open session (no closedAt).
      makeSession("alyvis"),
    ];
    const runs: OpenClawRun[] = [];

    const map = computePresence(AGENTS, sessions, runs, NOW);

    expect(map["alyvis"].status).toBe("active");
    // Other agents that have no session/runs should be idle.
    expect(map["ohara"].status).toBe("idle");
  });

  it("2. active — run in 'running' state, regardless of session", () => {
    const sessions: OpenClawSession[] = [];
    const runs: OpenClawRun[] = [
      makeRun("ohara", {
        status: "running",
        startedAt: "2026-05-09T13:29:00Z",
      }),
    ];

    const map = computePresence(AGENTS, sessions, runs, NOW);

    expect(map["ohara"].status).toBe("active");
    // Alyvis has nothing — should be idle.
    expect(map["alyvis"].status).toBe("idle");
  });

  it("3. error — most recent finished run has status 'failed', no active state", () => {
    const sessions: OpenClawSession[] = [];
    const runs: OpenClawRun[] = [
      // Older completed run.
      makeRun("sonic", {
        status: "completed",
        createdAt: "2026-05-09T10:00:00Z",
        finishedAt: "2026-05-09T10:30:00Z",
      }),
      // Newer failed run — this is the most recent by finishedAt.
      makeRun("sonic", {
        status: "failed",
        createdAt: "2026-05-09T11:30:00Z",
        finishedAt: "2026-05-09T11:31:22Z",
      }),
    ];

    const map = computePresence(AGENTS, sessions, runs, NOW);

    expect(map["sonic"].status).toBe("error");
    expect(map["sonic"].lastRunStatus).toBe("failed");
  });

  it("4. standby — next scheduledFor is within 12h, no active/error state", () => {
    const sessions: OpenClawSession[] = [];
    // scheduledFor is 2 hours after NOW (within the 12-hour window).
    const scheduledFor = "2026-05-09T15:30:00Z";
    const runs: OpenClawRun[] = [
      makeRun("nyssa", {
        status: "queued",
        createdAt: "2026-05-09T13:30:00Z",
        scheduledFor,
      }),
    ];

    const map = computePresence(AGENTS, sessions, runs, NOW);

    expect(map["nyssa"].status).toBe("standby");
    expect(map["nyssa"].nextRunAt).toBe(scheduledFor);
  });

  it("5. idle — nothing matches any active/error/standby condition", () => {
    // picasso has only an old completed run and no upcoming schedule.
    const sessions: OpenClawSession[] = [];
    const runs: OpenClawRun[] = [
      makeRun("picasso", {
        status: "completed",
        createdAt: "2026-05-09T10:00:00Z",
        finishedAt: "2026-05-09T10:38:19Z",
      }),
    ];

    const map = computePresence(AGENTS, sessions, runs, NOW);

    expect(map["picasso"].status).toBe("idle");
    expect(map["picasso"].lastRunStatus).toBe("completed");
    expect(map["picasso"].nextRunAt).toBeNull();
  });

  it("6. all agents appear in the output with empty inputs (idle, null timestamps)", () => {
    const map = computePresence(AGENTS, [], [], NOW);

    for (const agent of AGENTS) {
      expect(map[agent.id]).toBeDefined();
      expect(map[agent.id].status).toBe("idle");
      expect(map[agent.id].lastRunAt).toBeNull();
      expect(map[agent.id].nextRunAt).toBeNull();
      expect(map[agent.id].lastRunStatus).toBeNull();
    }
  });

  it("7. standby not triggered when scheduledFor is beyond 12h window", () => {
    const sessions: OpenClawSession[] = [];
    // scheduledFor is 25 hours from NOW — outside the 12-hour window.
    const runs: OpenClawRun[] = [
      makeRun("dear-diary", {
        status: "queued",
        scheduledFor: "2026-05-10T14:30:00Z",
      }),
    ];

    const map = computePresence(AGENTS, sessions, runs, NOW);

    expect(map["dear-diary"].status).toBe("idle");
  });

  it("8. closed session does not trigger active status", () => {
    const sessions: OpenClawSession[] = [
      makeSession("picasso", { closedAt: "2026-05-09T12:00:00Z" }),
    ];
    const runs: OpenClawRun[] = [];

    const map = computePresence(AGENTS, sessions, runs, NOW);

    expect(map["picasso"].status).toBe("idle");
  });
});
