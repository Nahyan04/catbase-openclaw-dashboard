import { NextResponse } from "next/server";
import { getOpenClaw } from "@/lib/openclaw/client";
import { AGENTS, type AgentInfo } from "@/lib/agents/registry";
import { computePresence } from "@/lib/agents/presence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const oc = await getOpenClaw();

  if (!oc) {
    return NextResponse.json({});
  }

  const [sdkAgents, sessions, runs] = await Promise.all([
    oc.agents.list(),
    oc.sessions.list(),
    oc.runs.list(),
  ]);

  // computePresence takes AgentInfo[] (the rich registry type).
  // When the SDK returns 6+ agents we filter the registry to that set;
  // when it returns fewer (stub always returns 6, so this is a safety net
  // for future partial deployments) we include all registry agents.
  const agents: AgentInfo[] =
    sdkAgents.length >= 6
      ? AGENTS.filter((a) => sdkAgents.some((sa) => sa.id === a.id))
      : AGENTS;

  // Ensure we never produce a map with fewer than 6 entries.
  const agentsForPresence = agents.length >= 6 ? agents : AGENTS;

  return NextResponse.json(computePresence(agentsForPresence, sessions, runs));
}
