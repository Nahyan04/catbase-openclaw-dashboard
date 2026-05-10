import "server-only";

import fs from "node:fs";
import { paths } from "@/lib/workspace/paths";
import type { TaskRow } from "./source";

/**
 * We don't yet have a finalised schema for the OpenClaw `runs` table, so we
 * introspect the actual column list at runtime instead of hardcoding it.
 * The strategy:
 *   1. Open the DB in read-only mode.
 *   2. Run `PRAGMA table_info(runs)` to get the real column names.
 *   3. Map well-known aliases (e.g. `name` → `title`, `agent_id` → `agentId`).
 *   4. Build a SELECT only for the columns we need.
 *   5. If any required column is missing, log a warning and return [].
 *
 * This means we never crash on a schema mismatch — we just return empty.
 */

interface PragmaRow {
  name: string;
}

interface RawRun {
  id: string;
  title?: string;
  name?: string;
  agentId?: string;
  agent_id?: string;
  status?: string;
  priority?: string;
  createdAt?: string;
  created_at?: string;
  scheduledFor?: string;
  scheduled_for?: string;
}

function coerceTimestamp(value: string | null | undefined): string {
  if (!value) return new Date().toISOString();
  // If it already looks like ISO, return as-is.
  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return value;
  // Otherwise convert, logging a warning.
  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) {
    console.warn(`[tasks/sqlite] Non-parseable timestamp "${value}", using current time.`);
    return new Date().toISOString();
  }
  console.warn(`[tasks/sqlite] Non-ISO timestamp "${value}" converted to ISO.`);
  return parsed.toISOString();
}

function coercePriority(value: string | null | undefined): TaskRow["priority"] {
  if (value === "low" || value === "normal" || value === "high") return value;
  return "normal";
}

function coerceStatus(value: string | null | undefined): TaskRow["status"] {
  if (value === "backlog" || value === "in_progress" || value === "done") return value;
  // Map SDK-style statuses that might be stored in SQLite.
  if (value === "queued") return "backlog";
  if (value === "running") return "in_progress";
  if (value === "completed" || value === "failed" || value === "cancelled") return "done";
  return "backlog";
}

export async function listFromSqlite(): Promise<TaskRow[]> {
  const dbPath = paths.tasksDb;

  // No path configured → nothing to read.
  if (!dbPath) return [];

  // DB file doesn't exist → nothing to read, not an error.
  if (!fs.existsSync(dbPath)) return [];

  let Database: typeof import("better-sqlite3");
  try {
    Database = (await import("better-sqlite3")).default;
  } catch {
    console.warn("[tasks/sqlite] better-sqlite3 not available, skipping.");
    return [];
  }

  let db: import("better-sqlite3").Database | null = null;
  try {
    db = new Database(dbPath, { readonly: true, fileMustExist: true });

    // Introspect columns.
    const pragmaRows = db
      .prepare("PRAGMA table_info(runs)")
      .all() as PragmaRow[];

    if (pragmaRows.length === 0) {
      // Table doesn't exist.
      console.warn("[tasks/sqlite] runs table not found, skipping.");
      return [];
    }

    const colSet = new Set(pragmaRows.map((r) => r.name));

    // Resolve each required field to an actual column name (or alias).
    const resolve = (candidates: string[]): string | null => {
      for (const c of candidates) {
        if (colSet.has(c)) return c;
      }
      return null;
    };

    const idCol = resolve(["id"]);
    const titleCol = resolve(["title", "name"]);
    const agentIdCol = resolve(["agentId", "agent_id"]);
    const statusCol = resolve(["status"]);
    const priorityCol = resolve(["priority"]);
    const createdAtCol = resolve(["createdAt", "created_at"]);
    const scheduledForCol = resolve(["scheduledFor", "scheduled_for"]);

    // Required columns — abort if any are missing.
    const required: Array<[string, string | null]> = [
      ["id", idCol],
      ["title/name", titleCol],
      ["agentId/agent_id", agentIdCol],
      ["status", statusCol],
      ["createdAt/created_at", createdAtCol],
    ];

    for (const [label, col] of required) {
      if (!col) {
        console.warn(`[tasks/sqlite] runs table missing column "${label}", skipping`);
        return [];
      }
    }

    // Build SELECT with only the columns we need.
    const selectParts = [
      `${idCol} AS id`,
      `${titleCol} AS title`,
      `${agentIdCol} AS agentId`,
      `${statusCol} AS status`,
      priorityCol ? `${priorityCol} AS priority` : "NULL AS priority",
      `${createdAtCol} AS createdAt`,
      scheduledForCol
        ? `${scheduledForCol} AS scheduledFor`
        : "NULL AS scheduledFor",
    ];

    const rows = db
      .prepare(`SELECT ${selectParts.join(", ")} FROM runs`)
      .all() as RawRun[];

    return rows.map((row) => ({
      id: String(row.id),
      title: String(row.title ?? row.name ?? row.id),
      agentId: String(row.agentId ?? row.agent_id ?? ""),
      status: coerceStatus(row.status),
      priority: coercePriority(row.priority),
      createdAt: coerceTimestamp(row.createdAt ?? row.created_at),
      scheduledFor: row.scheduledFor ?? row.scheduled_for ?? undefined,
    }));
  } catch (err) {
    console.warn("[tasks/sqlite] read failed:", err);
    return [];
  } finally {
    db?.close();
  }
}
