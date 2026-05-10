"use client";

import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNowStrict } from "date-fns";
import { AGENTS } from "@/lib/agents/registry";
import type { PresenceMap, AgentStatus } from "@/lib/agents/presence";
import { PixelDot } from "@/components/pixel/pixel-badge";

async function fetchPresence(): Promise<PresenceMap> {
  const res = await fetch("/api/presence");
  if (!res.ok) throw new Error(`Presence API returned ${res.status}`);
  return res.json() as Promise<PresenceMap>;
}

const STATUS_COLOR: Record<AgentStatus, string> = {
  active: "#7ec8d4",
  idle: "#a8c5a0",
  standby: "#e8c97a",
  error: "#f2a7b8",
};

function fmtRelative(iso: string, future = false): string {
  const date = new Date(iso);
  const dist = formatDistanceToNowStrict(date, { roundingMethod: "floor" });
  const compressed = dist
    .replace(/ seconds?/, "s")
    .replace(/ minutes?/, "m")
    .replace(/ hours?/, "h")
    .replace(/ days?/, "d")
    .replace(/ months?/, "mo")
    .replace(/ years?/, "y");
  return future ? `next in ${compressed}` : `${compressed} ago`;
}

function buildTickerSegment(
  agent: (typeof AGENTS)[number],
  presence: PresenceMap | undefined,
): React.ReactNode {
  const state = presence?.[agent.id as keyof PresenceMap];
  const status: AgentStatus = state?.status ?? "idle";

  const timePart: string | null = (() => {
    if (state?.nextRunAt && (status === "standby" || status === "idle")) {
      return fmtRelative(state.nextRunAt, true);
    }
    if (state?.lastRunAt) {
      return `last run ${fmtRelative(state.lastRunAt, false)}`;
    }
    return null;
  })();

  return (
    <span key={agent.id} className="inline-flex items-center gap-1.5 font-pixel-mono text-[14px]">
      <PixelDot color={STATUS_COLOR[status]} size={6} />
      <span style={{ color: agent.accentColor }} className="font-semibold">
        {agent.name}
      </span>
      <span className="text-text-muted">::</span>
      <span style={{ color: STATUS_COLOR[status] }} className="font-bold uppercase tracking-wider">
        {status}
      </span>
      {timePart && (
        <>
          <span className="text-text-muted opacity-60">·</span>
          <span className="text-text-secondary">{timePart}</span>
        </>
      )}
    </span>
  );
}

export function Ticker() {
  const { data } = useQuery<PresenceMap>({
    queryKey: ["presence"],
    queryFn: fetchPresence,
    refetchInterval: 10_000,
  });

  const separator = (
    <span className="mx-4 text-text-muted opacity-60 font-pixel text-[8px] select-none" aria-hidden="true">
      ◆
    </span>
  );

  const segments = AGENTS.map((agent) => buildTickerSegment(agent, data));

  const tickerContent = (
    <span className="inline-flex items-center">
      {segments.map((seg, i) => (
        <span key={i} className="inline-flex items-center">
          {seg}
          {i < segments.length - 1 && separator}
        </span>
      ))}
      <span className="mx-4 text-text-muted opacity-60 font-pixel text-[8px] select-none" aria-hidden="true">◆</span>
    </span>
  );

  return (
    <div
      className="pixel-frame-tight scanlines bg-[#1a1612] py-2 text-[#f5e8d4] overflow-hidden"
      style={{ ["--pixel-frame-color" as string]: "#3d3530" }}
      role="marquee"
      aria-label="Live agent status"
    >
      <div className="flex items-center">
        <span className="font-pixel text-[8px] uppercase tracking-widest px-3 py-1 bg-[#a8c5a0] text-[#1a1612] flex-shrink-0">
          ● LIVE
        </span>
        <div className="overflow-hidden flex-1">
          <div className="ticker-marquee whitespace-nowrap inline-flex">
            <span className="px-4">{tickerContent}</span>
            <span className="px-4" aria-hidden="true">{tickerContent}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
