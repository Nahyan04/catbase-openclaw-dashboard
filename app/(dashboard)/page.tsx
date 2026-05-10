"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { House } from "@/components/home/house";
import { Ticker } from "@/components/home/ticker";
import { TeamPanel } from "@/components/home/team-panel";
import { PageHeader } from "@/components/pixel/page-header";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import type { PresenceMap } from "@/lib/agents/presence";
import { useEventSource } from "@/lib/hooks/use-event-source";

const PRESENCE_EVENTS = new Set([
  "agent:run-start",
  "agent:run-end",
  "session:open",
  "session:close",
]);

async function fetchPresence(): Promise<PresenceMap> {
  const res = await fetch("/api/presence");
  if (!res.ok) throw new Error(`Presence API returned ${res.status}`);
  return res.json() as Promise<PresenceMap>;
}

export default function Home() {
  const [teamOpen, setTeamOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isError } = useQuery<PresenceMap>({
    queryKey: ["presence"],
    queryFn: fetchPresence,
    refetchInterval: 10_000,
  });

  const { lastEvent } = useEventSource("/api/events");

  useEffect(() => {
    if (lastEvent && PRESENCE_EVENTS.has(lastEvent.event)) {
      void queryClient.invalidateQueries({ queryKey: ["presence"] });
    }
  }, [lastEvent, queryClient]);

  const activeCount = data
    ? Object.values(data).filter((p) => p.status === "active").length
    : 0;

  return (
    <div className="min-h-screen bg-bg-parchment dotted-pixel-bg px-6 sm:px-8 py-8">
      <PageHeader
        title="Agent Office"
        subtitle="// six cats, one mission — live presence below"
        glyph="◉"
        accent="#a8c5a0"
        right={
          <span className="font-pixel text-[8px] uppercase tracking-widest px-3 py-2 bg-[#1a1612] text-[#a8c5a0]" style={{ boxShadow: "2px 2px 0 0 #3d3530" }}>
            ● {activeCount} ON DUTY
          </span>
        }
      />

      {isError && (
        <div
          className="mb-4 px-4 py-2 font-pixel-mono text-sm text-text-secondary pixel-frame-tight"
          style={{ ["--pixel-frame-color" as string]: "#f2a7b8", backgroundColor: "#fff5f7" }}
        >
          ! presence offline — retrying connection...
        </div>
      )}

      <House presence={data ?? {}} />

      <div className="mt-6">
        <Ticker />
      </div>

      <div className="mt-6">
        <Collapsible open={teamOpen} onOpenChange={setTeamOpen}>
          <CollapsibleTrigger className="inline-flex items-center gap-2 px-3 py-2 font-pixel text-[10px] uppercase tracking-widest text-text-primary bg-bg-card hover:bg-bg-hover transition-colors pixel-frame-tight" style={{ ["--pixel-frame-color" as string]: "#3d3530" }}>
            {teamOpen ? "▼ Hide Roster" : "▶ Show Roster"}
          </CollapsibleTrigger>
          <CollapsibleContent keepMounted>
            <TeamPanel presence={data ?? {}} />
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
