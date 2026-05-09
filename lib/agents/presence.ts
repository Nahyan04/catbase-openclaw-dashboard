import type { AgentInfo, AgentId } from "@/lib/agents/registry";
import type { OpenClawSession, OpenClawRun, RunStatus } from "@/lib/openclaw/types";

export type AgentStatus = "active" | "idle" | "standby" | "error";

export interface PresenceState {
  status: AgentStatus;
  lastRunAt: string | null;     // ISO of most recent run's finishedAt, startedAt, or createdAt
  nextRunAt: string | null;     // ISO of nearest future scheduledFor
  lastRunStatus: RunStatus | null;
}

export type PresenceMap = Record<AgentId, PresenceState>;

/**
 * Returns the effective timestamp for a run, used for sorting and lastRunAt.
 * Priority: finishedAt > startedAt > createdAt
 */
function effectiveTimestamp(run: OpenClawRun): string {
  return run.finishedAt ?? run.startedAt ?? run.createdAt;
}

/**
 * Pure function — no I/O. Computes per-agent presence from raw SDK data.
 *
 * @param agents   All known agents (all 6 from the registry).
 * @param sessions Open/closed sessions returned by sessions.list().
 * @param runs     All runs returned by runs.list().
 * @param now      Override for "current time"; defaults to new Date() but
 *                 callers should pass a fixed value in tests.
 */
export function computePresence(
  agents: AgentInfo[],
  sessions: OpenClawSession[],
  runs: OpenClawRun[],
  now: Date = new Date(),
): PresenceMap {
  const nowMs = now.getTime();
  const twelveHoursMs = 12 * 60 * 60 * 1000;

  // Pre-group by agentId for O(n) lookups.
  const sessionsByAgent = new Map<string, OpenClawSession[]>();
  for (const session of sessions) {
    const list = sessionsByAgent.get(session.agentId) ?? [];
    list.push(session);
    sessionsByAgent.set(session.agentId, list);
  }

  // Group runs by agentId, sorted descending by effective timestamp.
  const runsByAgent = new Map<string, OpenClawRun[]>();
  for (const run of runs) {
    const list = runsByAgent.get(run.agentId) ?? [];
    list.push(run);
    runsByAgent.set(run.agentId, list);
  }
  for (const [agentId, agentRuns] of runsByAgent) {
    agentRuns.sort((a, b) =>
      new Date(effectiveTimestamp(b)).getTime() -
      new Date(effectiveTimestamp(a)).getTime(),
    );
    runsByAgent.set(agentId, agentRuns);
  }

  const result: Partial<PresenceMap> = {};

  for (const agent of agents) {
    const agentSessions = sessionsByAgent.get(agent.id) ?? [];
    const agentRuns = runsByAgent.get(agent.id) ?? [];

    // ---- Determine status (first match wins) --------------------------------

    // active: open session (no closedAt) OR any run in "running" state
    const hasOpenSession = agentSessions.some((s) => !s.closedAt);
    const hasRunningRun = agentRuns.some((r) => r.status === "running");
    const isActive = hasOpenSession || hasRunningRun;

    let status: AgentStatus;

    if (isActive) {
      status = "active";
    } else {
      // error: most recent completed/failed run has status "failed"
      const lastFinishedRun = agentRuns.find(
        (r) => r.status === "completed" || r.status === "failed",
      );
      const isError = lastFinishedRun?.status === "failed";

      if (isError) {
        status = "error";
      } else {
        // standby: has a scheduledFor within the next 12 hours
        const hasUpcomingSchedule = agentRuns.some((r) => {
          if (!r.scheduledFor) return false;
          const scheduledMs = new Date(r.scheduledFor).getTime();
          return scheduledMs > nowMs && scheduledMs <= nowMs + twelveHoursMs;
        });

        status = hasUpcomingSchedule ? "standby" : "idle";
      }
    }

    // ---- lastRunAt ----------------------------------------------------------
    // Most recent effective timestamp across all runs for this agent.
    let lastRunAt: string | null = null;
    if (agentRuns.length > 0) {
      // agentRuns is already sorted descending, so first is the most recent.
      lastRunAt = effectiveTimestamp(agentRuns[0]);
    }

    // ---- nextRunAt ----------------------------------------------------------
    // Smallest future scheduledFor.
    let nextRunAt: string | null = null;
    let nextRunAtMs = Infinity;
    for (const run of agentRuns) {
      if (!run.scheduledFor) continue;
      const scheduledMs = new Date(run.scheduledFor).getTime();
      if (scheduledMs > nowMs && scheduledMs < nextRunAtMs) {
        nextRunAtMs = scheduledMs;
        nextRunAt = run.scheduledFor;
      }
    }

    // ---- lastRunStatus ------------------------------------------------------
    // Status of the most recent run (by effective timestamp).
    const lastRunStatus: RunStatus | null =
      agentRuns.length > 0 ? agentRuns[0].status : null;

    result[agent.id] = { status, lastRunAt, nextRunAt, lastRunStatus };
  }

  return result as PresenceMap;
}
