import { describe, it, expect, vi, beforeEach } from "vitest";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { writeFileSync, unlinkSync } from "node:fs";
import type { OpenClawRun } from "@/lib/openclaw/types";

// ---------------------------------------------------------------------------
// SDK path tests
// ---------------------------------------------------------------------------

describe("listTasks — SDK path", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("maps SDK statuses correctly to TaskRow statuses", async () => {
    const fakeRuns: OpenClawRun[] = [
      {
        id: "r1",
        agentId: "alyvis",
        title: "Queued run",
        status: "queued",
        priority: "normal",
        createdAt: "2026-05-09T10:00:00Z",
      },
      {
        id: "r2",
        agentId: "ohara",
        title: "Running run",
        status: "running",
        priority: "high",
        createdAt: "2026-05-09T11:00:00Z",
      },
      {
        id: "r3",
        agentId: "nyssa",
        title: "Completed run",
        status: "completed",
        priority: "low",
        createdAt: "2026-05-09T09:00:00Z",
        scheduledFor: "2026-05-10T09:00:00Z",
      },
      {
        id: "r4",
        agentId: "sonic",
        title: "Failed run",
        status: "failed",
        priority: "normal",
        createdAt: "2026-05-09T08:00:00Z",
      },
      {
        id: "r5",
        agentId: "picasso",
        title: "Cancelled run",
        status: "cancelled",
        priority: "normal",
        createdAt: "2026-05-09T07:00:00Z",
      },
    ];

    vi.doMock("@/lib/openclaw/client", () => ({
      getOpenClaw: vi.fn().mockResolvedValue({
        runs: {
          list: vi.fn().mockResolvedValue(fakeRuns),
          create: vi.fn(),
          update: vi.fn(),
        },
      }),
    }));

    const { listTasks } = await import("@/lib/tasks/source");
    const rows = await listTasks();

    expect(rows).toHaveLength(5);

    const r1 = rows.find((r) => r.id === "r1");
    expect(r1?.status).toBe("backlog"); // queued → backlog

    const r2 = rows.find((r) => r.id === "r2");
    expect(r2?.status).toBe("in_progress"); // running → in_progress

    const r3 = rows.find((r) => r.id === "r3");
    expect(r3?.status).toBe("done"); // completed → done
    expect(r3?.scheduledFor).toBe("2026-05-10T09:00:00Z");

    const r4 = rows.find((r) => r.id === "r4");
    expect(r4?.status).toBe("done"); // failed → done

    const r5 = rows.find((r) => r.id === "r5");
    expect(r5?.status).toBe("done"); // cancelled → done
  });

  it("returns [] when SDK list() throws", async () => {
    vi.doMock("@/lib/openclaw/client", () => ({
      getOpenClaw: vi.fn().mockResolvedValue({
        runs: {
          list: vi.fn().mockRejectedValue(new Error("network error")),
          create: vi.fn(),
          update: vi.fn(),
        },
      }),
    }));

    const { listTasks } = await import("@/lib/tasks/source");
    const rows = await listTasks();
    // SDK threw → falls back to SQLite → no DB file in test env → [].
    expect(rows).toEqual([]);
  });

  it("falls back to SQLite when SDK is null (returns [] in test environment)", async () => {
    vi.doMock("@/lib/openclaw/client", () => ({
      getOpenClaw: vi.fn().mockResolvedValue(null),
    }));

    const { listTasks } = await import("@/lib/tasks/source");
    // In test env, tasksDb resolves to a non-existent file, so we get [].
    const rows = await listTasks();
    expect(Array.isArray(rows)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// SQLite path tests — using a serialised in-memory DB written to a temp file
// ---------------------------------------------------------------------------

describe("listFromSqlite — SQLite path", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("reads rows from a real SQLite file with standard snake_case schema", async () => {
    const Database = (await import("better-sqlite3")).default;

    const db = new Database(":memory:");
    db.exec(`
      CREATE TABLE runs (
        id TEXT PRIMARY KEY,
        title TEXT,
        agent_id TEXT,
        status TEXT,
        priority TEXT,
        created_at TEXT,
        scheduled_for TEXT
      )
    `);
    db.prepare(
      "INSERT INTO runs VALUES (?, ?, ?, ?, ?, ?, ?)",
    ).run(
      "run-1",
      "Test task",
      "alyvis",
      "queued",
      "high",
      "2026-05-09T10:00:00Z",
      null,
    );
    db.prepare(
      "INSERT INTO runs VALUES (?, ?, ?, ?, ?, ?, ?)",
    ).run(
      "run-2",
      "Another task",
      "ohara",
      "completed",
      "normal",
      "2026-05-09T11:00:00Z",
      "2026-05-10T09:00:00Z",
    );

    const tmpPath = join(
      tmpdir(),
      `test-runs-${randomBytes(4).toString("hex")}.sqlite`,
    );
    writeFileSync(tmpPath, db.serialize());
    db.close();

    vi.doMock("@/lib/workspace/paths", () => ({
      paths: { tasksDb: tmpPath },
    }));

    const { listFromSqlite } = await import("@/lib/tasks/sqlite");
    const rows = await listFromSqlite();

    try {
      unlinkSync(tmpPath);
    } catch {}

    expect(rows).toHaveLength(2);

    const r1 = rows.find((r) => r.id === "run-1");
    expect(r1?.status).toBe("backlog"); // queued → backlog
    expect(r1?.priority).toBe("high");
    expect(r1?.agentId).toBe("alyvis");

    const r2 = rows.find((r) => r.id === "run-2");
    expect(r2?.status).toBe("done"); // completed → done
    expect(r2?.scheduledFor).toBe("2026-05-10T09:00:00Z");
  });

  it("returns [] when the DB file does not exist", async () => {
    vi.doMock("@/lib/workspace/paths", () => ({
      paths: { tasksDb: "/tmp/nonexistent-catbase-runs-xyz.sqlite" },
    }));

    const { listFromSqlite } = await import("@/lib/tasks/sqlite");
    const rows = await listFromSqlite();
    expect(rows).toEqual([]);
  });

  it("returns [] when tasksDb path is empty string", async () => {
    vi.doMock("@/lib/workspace/paths", () => ({
      paths: { tasksDb: "" },
    }));

    const { listFromSqlite } = await import("@/lib/tasks/sqlite");
    const rows = await listFromSqlite();
    expect(rows).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Schema-mismatch test
// ---------------------------------------------------------------------------

describe("listFromSqlite — schema mismatch", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("returns [] and does not throw when agent_id/agentId column is missing", async () => {
    const Database = (await import("better-sqlite3")).default;
    const db = new Database(":memory:");

    // Schema is intentionally missing agent_id / agentId.
    db.exec(`
      CREATE TABLE runs (
        id TEXT PRIMARY KEY,
        title TEXT,
        status TEXT,
        created_at TEXT
      )
    `);
    db.prepare("INSERT INTO runs VALUES (?, ?, ?, ?)").run(
      "run-x",
      "No agent col",
      "queued",
      "2026-05-09T10:00:00Z",
    );

    const tmpPath = join(
      tmpdir(),
      `test-mismatch-${randomBytes(4).toString("hex")}.sqlite`,
    );
    writeFileSync(tmpPath, db.serialize());
    db.close();

    vi.doMock("@/lib/workspace/paths", () => ({
      paths: { tasksDb: tmpPath },
    }));

    const { listFromSqlite } = await import("@/lib/tasks/sqlite");

    let result: unknown;
    let threw = false;
    try {
      result = await listFromSqlite();
    } catch {
      threw = true;
    }

    try {
      unlinkSync(tmpPath);
    } catch {}

    expect(threw).toBe(false);
    expect(result).toEqual([]);
  });
});
