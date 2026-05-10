import { AGENTS } from "@/lib/agents/registry";
import type { PresenceMap, PresenceState } from "@/lib/agents/presence";
import { Room } from "./room";
import { CommandRoom } from "./command-room";

interface HouseProps {
  presence: Partial<PresenceMap>;
}

const IDLE_PRESENCE: PresenceState = {
  status: "idle",
  lastRunAt: null,
  nextRunAt: null,
  lastRunStatus: null,
};

export function House({ presence }: HouseProps) {
  return (
    <div className="space-y-4" role="region" aria-label="CATBASE floor plan">
      {/* Wide command room banner */}
      <CommandRoom presence={presence} />

      {/* 3-col agent room grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {AGENTS.map((agent) => {
          const state = presence[agent.id as keyof PresenceMap] ?? IDLE_PRESENCE;
          return <Room key={agent.id} agent={agent} presence={state} />;
        })}
      </div>
    </div>
  );
}
