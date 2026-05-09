import "server-only";

import { listFromSdk, createInSdk, updateInSdk } from "./sdk";
import { listFromSqlite } from "./sqlite";

export type TaskRow = {
  id: string;
  title: string;
  agentId: string;
  status: "backlog" | "in_progress" | "done";
  priority: "low" | "normal" | "high";
  createdAt: string;
  scheduledFor?: string;
};

/**
 * List all tasks. Prefers the SDK path (works in stub mode via fixture-backed
 * client). Falls back to SQLite read-only if the SDK is unavailable (null).
 */
export async function listTasks(): Promise<TaskRow[]> {
  const sdkResult = await listFromSdk();
  if (sdkResult !== null) return sdkResult;

  // SDK unavailable — attempt SQLite read (best-effort, may return []).
  return listFromSqlite();
}

/**
 * Create a new task. SDK only in Phase 3.1; SQLite write fallback is deferred
 * to Phase 3.2 where the persistence policy decision will be made.
 */
export async function createTask(input: {
  title: string;
  agentId: string;
  priority?: "low" | "normal" | "high";
}): Promise<TaskRow> {
  const sdkResult = await createInSdk(input);
  if (sdkResult !== null) return sdkResult;

  // SDK unavailable — return a synthetic row (non-persisted).
  const now = new Date().toISOString();
  return {
    id: `local-${Date.now()}`,
    title: input.title,
    agentId: input.agentId,
    status: "backlog",
    priority: input.priority ?? "normal",
    createdAt: now,
  };
}

/**
 * Update a task's status or title. SDK only in Phase 3.1.
 * Returns null when the task is not found (SDK returns null / throws).
 */
export async function updateTask(
  id: string,
  patch: { status?: TaskRow["status"]; title?: string },
): Promise<TaskRow | null> {
  return updateInSdk(id, patch);
}
