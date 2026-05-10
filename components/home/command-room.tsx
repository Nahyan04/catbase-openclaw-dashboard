import { AGENTS } from "@/lib/agents/registry";
import type { PresenceMap, PresenceState } from "@/lib/agents/presence";
import { PixelMap } from "@/lib/pixel/pixel-map";
import { CAT_BODY_AWAKE, CAT_BODY_SLEEP } from "@/lib/pixel/cat-base";
import { AGENT_SPRITES } from "@/lib/pixel/agent-sprites";
import { MONITOR, MONITOR_PALETTE } from "@/lib/pixel/room-props";

interface CommandRoomProps {
  presence: Partial<PresenceMap>;
}

const VB_W = 320;
const VB_H = 96;
const FLOOR_Y = 60;

const IDLE_PRESENCE: PresenceState = {
  status: "idle",
  lastRunAt: null,
  nextRunAt: null,
  lastRunStatus: null,
};

export function CommandRoom({ presence }: CommandRoomProps) {
  // Position each agent in the room, distributed across the wide floor.
  // Active agents are upright; idle ones lie on the floor cushion.
  const positions = [
    { agentId: "alyvis", x: 32, y: FLOOR_Y - 22 },
    { agentId: "ohara", x: 70, y: FLOOR_Y - 22 },
    { agentId: "nyssa", x: 108, y: FLOOR_Y - 22 },
    { agentId: "sonic", x: 168, y: FLOOR_Y - 22 },
    { agentId: "picasso", x: 224, y: FLOOR_Y - 22 },
    { agentId: "dear-diary", x: 272, y: FLOOR_Y - 22 },
  ];

  return (
    <section
      className="pixel-frame bg-bg-card overflow-hidden"
      style={{ ["--pixel-frame-color" as string]: "#3d3530" }}
      aria-label="Shared command room"
    >
      <header
        className="flex items-center justify-between px-4 py-2 border-b-2 border-[#3d3530] bg-[#f5e8d4]"
      >
        <div className="flex items-center gap-2">
          <span aria-hidden className="inline-block w-2 h-2 bg-[#a8c5a0]" />
          <h2 className="font-pixel text-[10px] uppercase tracking-widest text-text-primary">
            Command Room
          </h2>
        </div>
        <span className="font-pixel-mono text-[12px] text-text-secondary tracking-wide">
          {"// shared workstation"}
        </span>
      </header>

      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="pixel block w-full h-auto"
        shapeRendering="crispEdges"
        role="img"
        aria-label="Command room floor"
      >
        {/* Wall */}
        <rect x={0} y={0} width={VB_W} height={FLOOR_Y} fill="#f5e8d4" />

        {/* Wall stripe pattern */}
        {Array.from({ length: 40 }).map((_, i) => (
          <rect
            key={`s-${i}`}
            x={i * 8 + 3}
            y={0}
            width={1}
            height={FLOOR_Y}
            fill="#e8d5b8"
          />
        ))}

        {/* Big mission monitor on the wall — multiple screens */}
        {[40, 96, 152, 208, 264].map((x, i) => (
          <g key={`m-${i}`} transform={`translate(${x} 8)`}>
            <PixelMap rows={MONITOR} palette={MONITOR_PALETTE} />
          </g>
        ))}

        {/* Wainscot */}
        <rect x={0} y={FLOOR_Y - 2} width={VB_W} height={1} fill="#5a3d2e" />
        <rect x={0} y={FLOOR_Y - 1} width={VB_W} height={1} fill="#ffffff" opacity={0.4} />

        {/* Floor */}
        <rect x={0} y={FLOOR_Y} width={VB_W} height={VB_H - FLOOR_Y} fill="#d9b896" />

        {/* Rug in center */}
        <rect x={120} y={FLOOR_Y + 6} width={80} height={VB_H - FLOOR_Y - 8} fill="#a8c5a0" opacity={0.5} />
        <rect x={124} y={FLOOR_Y + 8} width={72} height={2} fill="#7ec8d4" opacity={0.7} />
        <rect x={124} y={VB_H - 10} width={72} height={2} fill="#7ec8d4" opacity={0.7} />

        {/* Floorboards */}
        {[FLOOR_Y + 10, FLOOR_Y + 20, FLOOR_Y + 30].map((y, i) => (
          <rect key={`fb-${i}`} x={0} y={y} width={VB_W} height={1} fill="#b88e6a" opacity={0.5} />
        ))}

        {/* Agents on the floor */}
        {positions.map(({ agentId, x, y }) => {
          const agent = AGENTS.find((a) => a.id === agentId);
          if (!agent) return null;
          const state = presence[agent.id as keyof PresenceMap] ?? IDLE_PRESENCE;
          const config = AGENT_SPRITES[agent.id];
          const isSleeping = state.status === "idle";
          const bodyRows = isSleeping ? CAT_BODY_SLEEP : CAT_BODY_AWAKE;
          return (
            <g key={agent.id} transform={`translate(${x} ${y})`}>
              {!isSleeping && config.tail && (
                <PixelMap rows={config.tail.rows} palette={config.tail.palette} />
              )}
              <PixelMap rows={bodyRows} palette={config.basePalette} />
              {!isSleeping && (
                <PixelMap rows={config.ears.rows} palette={config.ears.palette} />
              )}
              {!isSleeping &&
                config.overlays.map((overlay, idx) => (
                  <PixelMap key={`o-${idx}`} rows={overlay.rows} palette={overlay.palette} />
                ))}
              {isSleeping && (
                <g className="pixel-z">
                  <rect x={20} y={1} width={3} height={1} fill="#3d3530" />
                  <rect x={22} y={2} width={1} height={1} fill="#3d3530" />
                  <rect x={21} y={3} width={1} height={1} fill="#3d3530" />
                  <rect x={20} y={4} width={3} height={1} fill="#3d3530" />
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </section>
  );
}
