import "server-only";

import { getOpenClaw } from "@/lib/openclaw/client";
import type { RunStatus } from "@/lib/openclaw/types";
import type { TaskRow } from "./source";

function mapStatus(sdkStatus: RunStatus): TaskRow["status"] {
  switch (sdkStatus) {
    case "queued":
      return "backlog";
    case "running":
      return "in_progress";
    case "completed":
    case "failed":
    case "cancelled":
      return "done";
  }
}

function mapPriority(
  p: "low" | "normal" | "high" | undefined,
): TaskRow["priority"] {
  return p ?? "normal";
}

export async function listFromSdk(): Promise<TaskRow[] | null> {
  const oc = await getOpenClaw();
  if (!oc) return null;

  try {
    const runs = await oc.runs.list();
    return runs.map((r) => ({
      id: r.id,
      title: r.title ?? r.id,
      agentId: r.agentId,
      status: mapStatus(r.status),
      priority: mapPriority(r.priority),
      createdAt: r.createdAt,
      scheduledFor: r.scheduledFor,
    }));
  } catch {
    return null;
  }
}

export async function createInSdk(input: {
  title: string;
  agentId: string;
  priority?: "low" | "normal" | "high";
}): Promise<TaskRow | null> {
  const oc = await getOpenClaw();
  if (!oc) return null;

  try {
    const run = await oc.runs.create({
      agentId: input.agentId,
      title: input.title,
      status: "queued",
    });
    return {
      id: run.id,
      title: run.title ?? run.id,
      agentId: run.agentId,
      status: mapStatus(run.status),
      priority: mapPriority(input.priority),
      createdAt: run.createdAt,
      scheduledFor: run.scheduledFor,
    };
  } catch {
    return null;
  }
}

export async function updateInSdk(
  id: string,
  patch: { status?: TaskRow["status"]; title?: string },
): Promise<TaskRow | null> {
  const oc = await getOpenClaw();
  if (!oc) return null;

  // Map TaskRow status back to RunStatus for the SDK call.
  let sdkStatus: RunStatus | undefined;
  if (patch.status === "backlog") sdkStatus = "queued";
  else if (patch.status === "in_progress") sdkStatus = "running";
  else if (patch.status === "done") sdkStatus = "completed";

  try {
    const run = await oc.runs.update(id, {
      ...(sdkStatus !== undefined ? { status: sdkStatus } : {}),
      ...(patch.title !== undefined ? { title: patch.title } : {}),
    });
    return {
      id: run.id,
      title: run.title ?? run.id,
      agentId: run.agentId,
      status: mapStatus(run.status),
      priority: mapPriority(run.priority),
      createdAt: run.createdAt,
      scheduledFor: run.scheduledFor,
    };
  } catch {
    return null;
  }
}
