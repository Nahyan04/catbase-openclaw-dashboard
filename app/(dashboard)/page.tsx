"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { House } from "@/components/home/house";
import { Ticker } from "@/components/home/ticker";
import { TeamPanel } from "@/components/home/team-panel";
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

  return (
    <div className="min-h-screen bg-bg-parchment px-8 py-10">
      <h1 className="text-3xl font-bold text-text-primary mb-8 tracking-tight">
        Home
      </h1>

      {isError && (
        <div className="mb-4 px-4 py-2 rounded border border-status-error bg-status-error/10 text-sm text-text-secondary">
          Could not load presence — retrying...
        </div>
      )}

      {/* Render house with live presence or idle skeleton while loading */}
      <House presence={data ?? {}} />

      {/* Live agent status ticker */}
      <div className="mt-6">
        <Ticker />
      </div>

      {/* Team panel — collapsible disclosure */}
      <div className="mt-4">
        <Collapsible open={teamOpen} onOpenChange={setTeamOpen}>
          <CollapsibleTrigger className="inline-flex h-7 items-center rounded-lg px-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-muted hover:text-foreground">
            {teamOpen ? "Hide team" : "Show team"}
          </CollapsibleTrigger>
          <CollapsibleContent keepMounted>
            <TeamPanel presence={data ?? {}} />
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
