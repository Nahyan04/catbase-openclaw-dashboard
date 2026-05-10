import { AGENTS } from "@/lib/agents/registry";
import type { PresenceMap, PresenceState } from "@/lib/agents/presence";
import { PixelMap } from "@/lib/pixel/pixel-map";
import { CAT_BODY_AWAKE, CAT_BODY_SLEEP } from "@/lib/pixel/cat-base";
import { AGENT_SPRITES } from "@/lib/pixel/agent-sprites";
import {
  MONITOR, MONITOR_PALETTE,
  CAT_BED, CAT_BED_PALETTE,
} from "@/lib/pixel/room-props";

interface CommandRoomProps {
  presence: Partial<PresenceMap>;
}

const VB_W = 320;
const VB_H = 104;
const FLOOR_Y = 56;

const IDLE_PRESENCE: PresenceState = {
  status: "idle",
  lastRunAt: null,
  nextRunAt: null,
  lastRunStatus: null,
};

// Six floor stations spread across the long command-room floor.
// Each position is the cat sprite's offset; a cat bed will be drawn just below it.
const POSITIONS: Array<{ agentId: string; x: number }> = [
  { agentId: "alyvis", x: 28 },
  { agentId: "ohara", x: 80 },
  { agentId: "nyssa", x: 132 },
  { agentId: "sonic", x: 184 },
  { agentId: "picasso", x: 236 },
  { agentId: "dear-diary", x: 280 },
];

// Cat sprite paws sit at row 23; feet land on FLOOR_Y when offsetY = FLOOR_Y - 23.
const CAT_Y_AWAKE = FLOOR_Y - 23;
// Sleeping body is visible across rows 6–16; sit the body on top of the bed sprite.
const BED_TOP_Y = FLOOR_Y + 14;
const CAT_Y_SLEEP = BED_TOP_Y - 14;

export function CommandRoom({ presence }: CommandRoomProps) {
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

        {/* Big mission monitors mounted high on the wall */}
        {[36, 92, 148, 204, 260].map((x, i) => (
          <g key={`m-${i}`} transform={`translate(${x} 6)`}>
            <PixelMap rows={MONITOR} palette={MONITOR_PALETTE} />
          </g>
        ))}

        {/* Wainscot line where wall meets floor */}
        <rect x={0} y={FLOOR_Y - 2} width={VB_W} height={1} fill="#5a3d2e" />
        <rect x={0} y={FLOOR_Y - 1} width={VB_W} height={1} fill="#ffffff" opacity={0.4} />

        {/* Floor */}
        <rect x={0} y={FLOOR_Y} width={VB_W} height={VB_H - FLOOR_Y} fill="#d9b896" />

        {/* Floorboards */}
        {[FLOOR_Y + 8, FLOOR_Y + 18, FLOOR_Y + 30, FLOOR_Y + 40].map((y, i) => (
          <rect key={`fb-${i}`} x={0} y={y} width={VB_W} height={1} fill="#b88e6a" opacity={0.55} />
        ))}

        {/* Vertical board seams */}
        {[40, 88, 136, 184, 232, 280].map((x, i) => (
          <rect key={`vb-${i}`} x={x} y={FLOOR_Y + 1} width={1} height={VB_H - FLOOR_Y - 2} fill="#b88e6a" opacity={0.4} />
        ))}

        {/* Center rug for warmth */}
        <rect x={108} y={FLOOR_Y + 6} width={104} height={VB_H - FLOOR_Y - 10} fill="#a8c5a0" opacity={0.45} />
        <rect x={112} y={FLOOR_Y + 8} width={96} height={2} fill="#7ec8d4" opacity={0.7} />
        <rect x={112} y={VB_H - 12} width={96} height={2} fill="#7ec8d4" opacity={0.7} />

        {/* Beds — one per station, only visible when the cat is asleep */}
        {POSITIONS.map(({ agentId, x }) => {
          const agent = AGENTS.find((a) => a.id === agentId);
          if (!agent) return null;
          const state = presence[agent.id as keyof PresenceMap] ?? IDLE_PRESENCE;
          if (state.status !== "idle") return null;
          return (
            <PixelMap
              key={`bed-${agentId}`}
              rows={CAT_BED}
              palette={CAT_BED_PALETTE}
              offsetX={x + 4}
              offsetY={BED_TOP_Y}
            />
          );
        })}

        {/* Cats on the floor — sleeping cats curl on beds, active cats sit upright */}
        {POSITIONS.map(({ agentId, x }) => {
          const agent = AGENTS.find((a) => a.id === agentId);
          if (!agent) return null;
          const state = presence[agent.id as keyof PresenceMap] ?? IDLE_PRESENCE;
          const config = AGENT_SPRITES[agent.id];
          const isSleeping = state.status === "idle";
          const bodyRows = isSleeping ? CAT_BODY_SLEEP : CAT_BODY_AWAKE;
          const y = isSleeping ? CAT_Y_SLEEP : CAT_Y_AWAKE;
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
                <g className="pixel-z" style={{ transformOrigin: "20px 0px" }}>
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
