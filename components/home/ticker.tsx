"use client";

import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNowStrict } from "date-fns";
import { AGENTS } from "@/lib/agents/registry";
import type { PresenceMap, AgentStatus } from "@/lib/agents/presence";

async function fetchPresence(): Promise<PresenceMap> {
  const res = await fetch("/api/presence");
  if (!res.ok) throw new Error(`Presence API returned ${res.status}`);
  return res.json() as Promise<PresenceMap>;
}

const STATUS_COLOR: Record<AgentStatus, string> = {
  active: "#7ec8d4",   // cyan
  idle: "#a8c5a0",     // sage
  standby: "#d4cbbf",  // beige-grey
  error: "#f2a7b8",    // pink
};

function fmtRelative(iso: string, future = false): string {
  const date = new Date(iso);
  const dist = formatDistanceToNowStrict(date, { roundingMethod: "floor" });
  // formatDistanceToNowStrict returns e.g. "2 minutes", "1 hour"
  // Compress to "2m", "1h", "3d", etc.
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
    <span key={agent.id} className="inline-flex items-center gap-1">
      <span style={{ color: agent.accentColor }} className="font-semibold">
        {agent.name}
      </span>
      <span>:</span>
      <span style={{ color: STATUS_COLOR[status] }} className="font-semibold uppercase">
        {status}
      </span>
      {timePart && (
        <>
          <span className="opacity-50 mx-0.5">·</span>
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
    <span className="mx-4 opacity-40 select-none" aria-hidden="true">
      ·
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
      {/* trailing separator before second copy */}
      <span className="mx-4 opacity-40 select-none" aria-hidden="true">·</span>
    </span>
  );

  return (
    <div
      className="overflow-hidden border-t border-border-warm bg-bg-card py-2 text-sm text-text-primary"
      role="marquee"
      aria-label="Live agent status"
    >
      <div className="ticker-marquee whitespace-nowrap inline-flex">
        <span className="px-4">{tickerContent}</span>
        <span className="px-4" aria-hidden="true">{tickerContent}</span>
      </div>
    </div>
  );
}
