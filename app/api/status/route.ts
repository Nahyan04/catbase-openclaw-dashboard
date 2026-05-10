import { NextResponse } from "next/server";
import { getOpenClaw, getConnectionStatus } from "@/lib/openclaw/client";
import { existsSafe } from "@/lib/workspace/fs";
import { paths } from "@/lib/workspace/paths";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  // Trigger lazy connect attempt to update connection status.
  await getOpenClaw();
  const gateway = getConnectionStatus();

  const workspaceExists = paths.workspace
    ? await existsSafe(paths.workspace)
    : false;
  const workspace: "ok" | "missing" = workspaceExists ? "ok" : "missing";

  return NextResponse.json({
    gateway,
    workspace,
    workspacePath: paths.workspace,
  });
}
