import { AGENTS } from "@/lib/agents/registry";
import type { PresenceMap, PresenceState } from "@/lib/agents/presence";
import { Room } from "./room";

interface HouseProps {
  presence: Partial<PresenceMap>;
}

const IDLE_PRESENCE: PresenceState = {
  status: "idle",
  lastRunAt: null,
  nextRunAt: null,
  lastRunStatus: null,
};

// 3×3 grid layout:
//  [ohara]      [alyvis]    [sonic]
//  [nyssa]      [COMMAND]   [picasso]
//  [           dear-diary          ]
type GridCell =
  | { type: "agent"; agentId: string }
  | { type: "command" }
  | { type: "span"; agentId: string };

const GRID: GridCell[] = [
  { type: "agent", agentId: "ohara" },
  { type: "agent", agentId: "alyvis" },
  { type: "agent", agentId: "sonic" },
  { type: "agent", agentId: "nyssa" },
  { type: "command" },
  { type: "agent", agentId: "picasso" },
  { type: "span", agentId: "dear-diary" },
];

export function House({ presence }: HouseProps) {
  const agentMap = Object.fromEntries(AGENTS.map((a) => [a.id, a]));

  return (
    <div
      className="grid gap-3 w-full"
      style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
      role="region"
      aria-label="CATBASE floor plan"
    >
      {GRID.map((cell, idx) => {
        if (cell.type === "command") {
          return (
            <div
              key="command-room"
              className="relative border-2 border-dashed rounded-lg p-2 min-h-32 flex flex-col items-center justify-center gap-1"
              style={{ borderColor: "#b0a499", backgroundColor: "#b0a4991F" }}
            >
              <span className="text-lg select-none" aria-hidden="true">🐾</span>
              <span className="text-xs uppercase tracking-widest text-text-secondary font-semibold text-center">
                Command Room
              </span>
              <span className="text-xs text-text-muted text-center">shared workstation</span>
            </div>
          );
        }

        if (cell.type === "span") {
          const agent = agentMap[cell.agentId];
          if (!agent) return null;
          const state = presence[agent.id as keyof PresenceMap] ?? IDLE_PRESENCE;
          return (
            <div key={agent.id} style={{ gridColumn: "1 / -1" }}>
              <Room agent={agent} presence={state} />
            </div>
          );
        }

        // type === "agent"
        const agent = agentMap[(cell as { type: "agent"; agentId: string }).agentId];
        if (!agent) return null;
        const state = presence[agent.id as keyof PresenceMap] ?? IDLE_PRESENCE;
        return <Room key={agent.id} agent={agent} presence={state} />;
      })}
    </div>
  );
}
