import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOpenClaw } from "@/lib/openclaw/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const bodySchema = z.object({
  projectId: z.string().min(1),
  kind: z.string().min(1).default("next-action"),
});

export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { projectId, kind } = parsed.data;

  const oc = await getOpenClaw();
  if (!oc) {
    return NextResponse.json(
      {
        error: "gateway-unavailable",
        message:
          "OpenClaw gateway is not connected. Configure OPENCLAW_GATEWAY_TOKEN or set OPENCLAW_STUB=1.",
      },
      { status: 503 },
    );
  }

  try {
    const run = await oc.runs.create({
      agentId: "alyvis",
      title: `Next action for ${projectId}`,
      input: { projectId, kind },
    });
    return NextResponse.json({ runId: run.id }, { status: 202 });
  } catch (err) {
    console.warn("[alyvis-ask] runs.create failed:", err);
    return NextResponse.json(
      {
        error: "run-create-failed",
        message: "Failed to queue Alyvis run via gateway.",
      },
      { status: 502 },
    );
  }
}
