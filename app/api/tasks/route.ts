import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { listTasks, createTask } from "@/lib/tasks/source";
import { getAgent } from "@/lib/agents/registry";
import type { AgentId } from "@/lib/agents/registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const tasks = await listTasks();

  const grouped: {
    backlog: typeof tasks;
    in_progress: typeof tasks;
    done: typeof tasks;
  } = { backlog: [], in_progress: [], done: [] };

  tasks.forEach((t) => grouped[t.status].push(t));

  return NextResponse.json({ ...grouped, total: tasks.length });
}

const createSchema = z.object({
  title: z.string().min(1).max(200),
  agentId: z.string(),
  priority: z.enum(["low", "normal", "high"]).optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { agentId, title, priority } = parsed.data;

  if (!getAgent(agentId as AgentId)) {
    return NextResponse.json({ error: "Unknown agent" }, { status: 400 });
  }

  const row = await createTask({ title, agentId, priority });

  // createTask always returns a TaskRow (synthetic in stub/SDK mode, or
  // a local fallback when SDK is unavailable). No null path here — the
  // null/503 path only applies to updateTask (see [id]/route.ts).
  return NextResponse.json(row, { status: 201 });
}
