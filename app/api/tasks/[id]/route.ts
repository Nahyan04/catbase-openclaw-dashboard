import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { updateTask } from "@/lib/tasks/source";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z.object({
  status: z.enum(["backlog", "in_progress", "done"]).optional(),
  title: z.string().min(1).max(200).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const row = await updateTask(id, parsed.data);

  if (row === null) {
    return NextResponse.json(
      { error: "tasks DB not writable; use OpenClaw to create tasks" },
      { status: 503 },
    );
  }

  return NextResponse.json(row);
}
