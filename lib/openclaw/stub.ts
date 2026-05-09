import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import type {
  OpenClawAgent,
  OpenClawArtifact,
  OpenClawClient,
  OpenClawEvent,
  OpenClawRun,
  OpenClawSession,
  RunStatus,
} from "@/lib/openclaw/types";

function fixturesDir(): string {
  return path.join(process.cwd(), "fixtures");
}

async function readJson<T>(filename: string): Promise<T> {
  const filePath = path.join(fixturesDir(), filename);
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

export function createStubClient(): OpenClawClient {
  return {
    agents: {
      async list(): Promise<OpenClawAgent[]> {
        return readJson<OpenClawAgent[]>("agents.json");
      },
    },

    sessions: {
      async list(): Promise<OpenClawSession[]> {
        return readJson<OpenClawSession[]>("sessions.json");
      },
    },

    runs: {
      async list(opts?: {
        scheduled?: boolean;
        from?: string;
        to?: string;
      }): Promise<OpenClawRun[]> {
        let runs = await readJson<OpenClawRun[]>("runs.json");

        if (opts?.scheduled === true) {
          runs = runs.filter((r) => r.scheduledFor != null);
        }

        if (opts?.from) {
          const from = new Date(opts.from).getTime();
          runs = runs.filter((r) => new Date(r.createdAt).getTime() >= from);
        }

        if (opts?.to) {
          const to = new Date(opts.to).getTime();
          runs = runs.filter((r) => new Date(r.createdAt).getTime() <= to);
        }

        return runs;
      },

      // NOTE: The stub does NOT persist created runs. This method mints a
      // plausible object so callers do not break, but the run will not appear
      // in subsequent `list()` calls and will not survive a server restart.
      async create(input: {
        agentId: string;
        title?: string;
        status?: RunStatus;
        input?: unknown;
      }): Promise<OpenClawRun> {
        const now = new Date().toISOString();
        return {
          id: `stub-run-${Date.now()}`,
          agentId: input.agentId,
          title: input.title,
          status: input.status ?? "queued",
          createdAt: now,
          input: input.input,
        };
      },

      // NOTE: The stub does NOT persist updates. This method returns a
      // synthetic merged object so callers do not break, but the change will
      // not be reflected in subsequent `list()` calls.
      async update(
        id: string,
        patch: Partial<Pick<OpenClawRun, "status" | "title">>,
      ): Promise<OpenClawRun> {
        const runs = await readJson<OpenClawRun[]>("runs.json");
        const existing = runs.find((r) => r.id === id);
        const base: OpenClawRun = existing ?? {
          id,
          agentId: "unknown",
          status: "queued",
          createdAt: new Date().toISOString(),
        };
        return { ...base, ...patch };
      },
    },

    artifacts: {
      // Artifacts will be loaded from the filesystem in Phase 4.
      // No fixture file needed yet — return empty until then.
      async list(): Promise<OpenClawArtifact[]> {
        return [];
      },
    },

    async *events(): AsyncIterable<OpenClawEvent> {
      // Yield synthetic events based on the current fixture state, then keep
      // the iterable alive (but idle) until the caller stops iterating.

      let runs: OpenClawRun[] = [];
      let sessions: OpenClawSession[] = [];

      try {
        runs = await readJson<OpenClawRun[]>("runs.json");
        sessions = await readJson<OpenClawSession[]>("sessions.json");
      } catch {
        // Fixture read failure — yield nothing and exit cleanly.
        return;
      }

      const now = new Date().toISOString();

      // Emit agent:run-end for every completed run.
      for (const run of runs.filter((r) => r.status === "completed")) {
        yield {
          event: "agent:run-end",
          data: { runId: run.id, agentId: run.agentId },
          at: run.finishedAt ?? now,
        };
      }

      // Emit session:open for every active session.
      for (const session of sessions) {
        yield {
          event: "session:open",
          data: { sessionId: session.id, agentId: session.agentId },
          at: session.openedAt,
        };
      }

      // Stay alive without burning CPU. The caller (e.g. subscribeToGateway)
      // can stop iterating at any time via its for-await loop exit.
      await new Promise<never>(() => {
        // Intentionally never resolves — the generator exits when the caller
        // stops consuming it (break / return from the for-await).
      });
    },

    async connect(): Promise<void> {
      // No-op in stub mode.
    },

    async disconnect(): Promise<void> {
      // No-op in stub mode.
    },
  };
}
