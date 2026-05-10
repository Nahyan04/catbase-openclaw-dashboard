import type { AgentInfo } from "@/lib/agents/registry";
import type { AgentStatus } from "@/lib/agents/presence";
import { PixelMap } from "@/lib/pixel/pixel-map";
import { CAT_BODY_AWAKE, CAT_BODY_SLEEP } from "@/lib/pixel/cat-base";
import { AGENT_SPRITES } from "@/lib/pixel/agent-sprites";
import {
  CAT_BED, CAT_BED_PALETTE,
  FOOD_BOWL, FOOD_BOWL_PALETTE,
  WINDOW_DAY, WINDOW_DAY_PALETTE,
  WINDOW_NIGHT, WINDOW_NIGHT_PALETTE,
  BOOKSHELF, BOOKSHELF_PALETTE,
  CALCULATOR, CALCULATOR_PALETTE,
  COIN_STACK, COIN_STACK_PALETTE,
  TELESCOPE, TELESCOPE_PALETTE,
  NEWSPAPER, NEWSPAPER_PALETTE,
  EASEL, EASEL_PALETTE,
  PAINT_PALETTE, PAINT_PALETTE_PALETTE,
  PLANNER, PLANNER_PALETTE,
  PENCIL, PENCIL_PALETTE,
  MONITOR, MONITOR_PALETTE,
  ROUTER, ROUTER_PALETTE,
  PAPER_STACK, PAPER_STACK_PALETTE,
  PLANT, PLANT_PALETTE,
  YARN_BALL, YARN_BALL_PALETTE,
  SCRATCH_POST, SCRATCH_POST_PALETTE,
  FISH_TOY, FISH_TOY_PALETTE,
} from "@/lib/pixel/room-props";

interface RoomSceneProps {
  agent: AgentInfo;
  status: AgentStatus;
  className?: string;
}

const VB_W = 128;
const VB_H = 80;

// Floor line and key baselines. Items snap to these so nothing floats.
const FLOOR_Y = 54;
const DESK_TOP_Y = 44; // top edge of the desk surface — items sit with their bottom here
const DESK_X = 76;
const DESK_W = 48;
const BED_X = 4;
const BED_TOP_Y = 62; // top edge of the cat bed sprite on the floor

interface PropPlacement {
  rows: string[];
  palette: Record<string, string>;
  x: number;
  y: number;
}

interface RoomConfig {
  wallTint: string;
  wallStripe: string;
  floor: string;
  floorDark: string;
  props: PropPlacement[];
}

function tint(hex: string, alphaHex: string): string {
  return hex + alphaHex;
}

// Place a sprite so its bottom row sits at `bottomY`.
function onSurface(
  rows: string[],
  palette: Record<string, string>,
  x: number,
  bottomY: number,
): PropPlacement {
  return { rows, palette, x, y: bottomY - rows.length };
}

function buildRoom(agent: AgentInfo): RoomConfig {
  const accent = agent.accentColor;
  const id = agent.id;

  // shared: cat bed + food bowl on the floor
  const bed: PropPlacement = { rows: CAT_BED, palette: CAT_BED_PALETTE, x: BED_X, y: BED_TOP_Y };
  const bowl: PropPlacement = onSurface(FOOD_BOWL, FOOD_BOWL_PALETTE, 30, FLOOR_Y + 16);

  const baseProps = (more: PropPlacement[]): PropPlacement[] => [bed, bowl, ...more];

  const floors = { floor: "#d9b896", floorDark: "#b88e6a" };
  const walls = { wallTint: tint(accent, "26"), wallStripe: tint(accent, "44") };

  if (id === "alyvis") {
    return {
      ...walls, ...floors,
      props: baseProps([
        // window high on the wall
        { rows: WINDOW_DAY, palette: WINDOW_DAY_PALETTE, x: 14, y: 6 },
        // small router on the wall to the right of the window
        { rows: ROUTER, palette: ROUTER_PALETTE, x: 44, y: 14 },
        // dual monitors sitting on the desk surface
        onSurface(MONITOR, MONITOR_PALETTE, DESK_X + 6, DESK_TOP_Y),
        onSurface(MONITOR, MONITOR_PALETTE, DESK_X + 26, DESK_TOP_Y),
      ]),
    };
  }

  if (id === "ohara") {
    return {
      ...walls, ...floors,
      props: baseProps([
        // bookshelf hung high on the wall to the left
        { rows: BOOKSHELF, palette: BOOKSHELF_PALETTE, x: 4, y: 4 },
        // window to the right of the shelf
        { rows: WINDOW_DAY, palette: WINDOW_DAY_PALETTE, x: 44, y: 10 },
        // paper stack + plant sitting on the desk
        onSurface(PAPER_STACK, PAPER_STACK_PALETTE, DESK_X + 4, DESK_TOP_Y),
        onSurface(PLANT, PLANT_PALETTE, DESK_X + 22, DESK_TOP_Y),
        // yarn ball on the floor
        onSurface(YARN_BALL, YARN_BALL_PALETTE, 28, FLOOR_Y + 18),
      ]),
    };
  }

  if (id === "nyssa") {
    return {
      ...walls, ...floors,
      props: baseProps([
        // night sky window
        { rows: WINDOW_NIGHT, palette: WINDOW_NIGHT_PALETTE, x: 14, y: 6 },
        // scratch post standing on the floor on the left
        onSurface(SCRATCH_POST, SCRATCH_POST_PALETTE, 50, FLOOR_Y + 22),
        // coin stacks + calculator on the desk
        onSurface(COIN_STACK, COIN_STACK_PALETTE, DESK_X + 4, DESK_TOP_Y),
        onSurface(COIN_STACK, COIN_STACK_PALETTE, DESK_X + 16, DESK_TOP_Y),
        onSurface(CALCULATOR, CALCULATOR_PALETTE, DESK_X + 30, DESK_TOP_Y),
      ]),
    };
  }

  if (id === "sonic") {
    return {
      ...walls, ...floors,
      props: baseProps([
        { rows: WINDOW_DAY, palette: WINDOW_DAY_PALETTE, x: 14, y: 6 },
        // telescope on the desk pointed up
        onSurface(TELESCOPE, TELESCOPE_PALETTE, DESK_X + 4, DESK_TOP_Y),
        // newspapers stacked next to it
        onSurface(NEWSPAPER, NEWSPAPER_PALETTE, DESK_X + 20, DESK_TOP_Y),
        onSurface(NEWSPAPER, NEWSPAPER_PALETTE, DESK_X + 32, DESK_TOP_Y),
        // fish toy on the floor
        onSurface(FISH_TOY, FISH_TOY_PALETTE, 26, FLOOR_Y + 18),
      ]),
    };
  }

  if (id === "picasso") {
    return {
      ...walls, ...floors,
      props: baseProps([
        { rows: WINDOW_DAY, palette: WINDOW_DAY_PALETTE, x: 14, y: 6 },
        // easel stands on the floor mid-room (between bed and desk)
        onSurface(EASEL, EASEL_PALETTE, 50, FLOOR_Y + 24),
        // paint palette sits on the desk
        onSurface(PAINT_PALETTE, PAINT_PALETTE_PALETTE, DESK_X + 6, DESK_TOP_Y),
        onSurface(PAPER_STACK, PAPER_STACK_PALETTE, DESK_X + 22, DESK_TOP_Y),
        // yarn ball on the floor
        onSurface(YARN_BALL, YARN_BALL_PALETTE, 28, FLOOR_Y + 18),
      ]),
    };
  }

  // dear-diary
  return {
    ...walls, ...floors,
    props: baseProps([
      { rows: WINDOW_DAY, palette: WINDOW_DAY_PALETTE, x: 14, y: 6 },
      // potted plant on the floor next to the bed
      onSurface(PLANT, PLANT_PALETTE, 46, FLOOR_Y + 22),
      // planner + pencil on the desk
      onSurface(PLANNER, PLANNER_PALETTE, DESK_X + 4, DESK_TOP_Y),
      onSurface(PENCIL, PENCIL_PALETTE, DESK_X + 22, DESK_TOP_Y),
      // fish toy near the food bowl
      onSurface(FISH_TOY, FISH_TOY_PALETTE, 24, FLOOR_Y + 18),
    ]),
  };
}

export function RoomScene({ agent, status, className }: RoomSceneProps) {
  const room = buildRoom(agent);
  const config = AGENT_SPRITES[agent.id];

  const isSleeping = status === "idle";
  const isErroring = status === "error";

  // Awake cat — sit on the floor in front of the desk, feet on FLOOR_Y.
  // Sleeping cat — curled on top of the cat bed.
  const catPos = isSleeping
    ? { x: BED_X + 2, y: BED_TOP_Y - 14 } // sleep sprite visible rows 6-16; bottom lands on the bed
    : { x: 44, y: FLOOR_Y - 23 }; // awake sprite paws at row 23 → feet on FLOOR_Y

  const bodyRows = isSleeping ? CAT_BODY_SLEEP : CAT_BODY_AWAKE;

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      className={`pixel block w-full h-auto ${className ?? ""}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label={`${agent.name}'s room — ${status}`}
    >
      {/* Wall */}
      <rect x={0} y={0} width={VB_W} height={FLOOR_Y} fill={room.wallTint} />

      {/* Wallpaper stripes */}
      {Array.from({ length: 16 }).map((_, i) => (
        <rect
          key={`stripe-${i}`}
          x={i * 8 + 3}
          y={0}
          width={1}
          height={FLOOR_Y}
          fill={room.wallStripe}
          opacity={0.4}
        />
      ))}

      {/* Wainscot line where wall meets floor */}
      <rect x={0} y={FLOOR_Y - 2} width={VB_W} height={1} fill="#3d3530" opacity={0.55} />
      <rect x={0} y={FLOOR_Y - 1} width={VB_W} height={1} fill="#ffffff" opacity={0.3} />

      {/* Floor */}
      <rect x={0} y={FLOOR_Y} width={VB_W} height={VB_H - FLOOR_Y} fill={room.floor} />

      {/* Floorboards (horizontal seams) */}
      {[FLOOR_Y + 6, FLOOR_Y + 14, FLOOR_Y + 22].map((y, i) => (
        <rect key={`board-${i}`} x={0} y={y} width={VB_W} height={1} fill={room.floorDark} opacity={0.55} />
      ))}

      {/* Vertical floorboard divisions */}
      {[20, 60, 100].map((x, i) => (
        <rect key={`vb-${i}`} x={x} y={FLOOR_Y + 1} width={1} height={VB_H - FLOOR_Y - 2} fill={room.floorDark} opacity={0.4} />
      ))}

      {/* Desk — surface + legs + apron */}
      <rect x={DESK_X - 2} y={DESK_TOP_Y} width={DESK_W + 4} height={4} fill="#8a5a3a" />
      <rect x={DESK_X - 2} y={DESK_TOP_Y + 3} width={DESK_W + 4} height={1} fill="#5a3d2e" />
      <rect x={DESK_X - 2} y={DESK_TOP_Y + 4} width={DESK_W + 4} height={2} fill="#6d4630" />
      <rect x={DESK_X} y={DESK_TOP_Y + 6} width={2} height={FLOOR_Y - (DESK_TOP_Y + 6)} fill="#5a3d2e" />
      <rect x={DESK_X + DESK_W} y={DESK_TOP_Y + 6} width={2} height={FLOOR_Y - (DESK_TOP_Y + 6)} fill="#5a3d2e" />

      {/* Props */}
      {room.props.map((p, i) => (
        <PixelMap key={`p-${i}`} rows={p.rows} palette={p.palette} offsetX={p.x} offsetY={p.y} />
      ))}

      {/* Cat */}
      <g transform={`translate(${catPos.x} ${catPos.y})`}>
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
        {isErroring && (
          <g>
            <rect x={20} y={2} width={4} height={4} fill={config.errorBubbleColor} />
            <rect x={20} y={3} width={1} height={1} fill="#fff" />
            <rect x={20} y={5} width={1} height={1} fill="#fff" />
          </g>
        )}
      </g>

      {/* Sonic SCAN-mode pulse rings on the wall when active */}
      {agent.id === "sonic" && status === "active" && (
        <g>
          <circle cx={48} cy={20} r={3} fill="none" stroke="#f4a76a" strokeWidth={1} className="radar-ring" opacity={0.9} />
          <circle cx={48} cy={20} r={3} fill="none" stroke="#f4a76a" strokeWidth={1} className="radar-ring" style={{ animationDelay: "0.6s" }} opacity={0.6} />
        </g>
      )}
    </svg>
  );
}
