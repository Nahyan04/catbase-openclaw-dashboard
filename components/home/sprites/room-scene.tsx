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

const FLOOR_Y = 52;

interface RoomConfig {
  wallTint: string;
  wallStripe: string;
  floor: string;
  floorDark: string;
  props: Array<{ rows: string[]; palette: Record<string, string>; x: number; y: number }>;
  catBedPosition: { x: number; y: number };
  deskPosition: { x: number; y: number };
}

function tint(hex: string, alphaHex: string): string {
  return hex + alphaHex;
}

function buildRoom(agent: AgentInfo): RoomConfig {
  const accent = agent.accentColor;

  const baseBed = { rows: CAT_BED, palette: CAT_BED_PALETTE };
  const baseBowl = { rows: FOOD_BOWL, palette: FOOD_BOWL_PALETTE };

  const id = agent.id;

  // common floor decor
  const baseProps = (more: RoomConfig["props"]): RoomConfig["props"] => [
    { rows: baseBed.rows, palette: baseBed.palette, x: 4, y: 60 },
    { rows: baseBowl.rows, palette: baseBowl.palette, x: 32, y: 68 },
    ...more,
  ];

  const desk = { x: 76, y: 50 };
  const bed = { x: 4, y: 60 };

  if (id === "alyvis") {
    return {
      wallTint: tint(accent, "26"),
      wallStripe: tint(accent, "40"),
      floor: "#d9b896",
      floorDark: "#b88e6a",
      props: baseProps([
        { rows: WINDOW_DAY, palette: WINDOW_DAY_PALETTE, x: 14, y: 8 },
        { rows: ROUTER, palette: ROUTER_PALETTE, x: 50, y: 6 },
        { rows: MONITOR, palette: MONITOR_PALETTE, x: 88, y: 28 },
        { rows: MONITOR, palette: MONITOR_PALETTE, x: 104, y: 28 },
        { rows: PAW_PRINT_LITE, palette: { P: "#3d35304d" }, x: 60, y: 70 },
      ]),
      catBedPosition: bed,
      deskPosition: desk,
    };
  }

  if (id === "ohara") {
    return {
      wallTint: tint(accent, "26"),
      wallStripe: tint(accent, "44"),
      floor: "#d9b896",
      floorDark: "#b88e6a",
      props: baseProps([
        { rows: BOOKSHELF, palette: BOOKSHELF_PALETTE, x: 8, y: 8 },
        { rows: WINDOW_DAY, palette: WINDOW_DAY_PALETTE, x: 36, y: 12 },
        { rows: PAPER_STACK, palette: PAPER_STACK_PALETTE, x: 96, y: 30 },
        { rows: PLANT, palette: PLANT_PALETTE, x: 60, y: 42 },
        { rows: YARN_BALL, palette: YARN_BALL_PALETTE, x: 24, y: 70 },
      ]),
      catBedPosition: bed,
      deskPosition: desk,
    };
  }

  if (id === "nyssa") {
    return {
      wallTint: tint(accent, "26"),
      wallStripe: tint(accent, "44"),
      floor: "#d9b896",
      floorDark: "#b88e6a",
      props: baseProps([
        { rows: WINDOW_NIGHT, palette: WINDOW_NIGHT_PALETTE, x: 14, y: 8 },
        { rows: COIN_STACK, palette: COIN_STACK_PALETTE, x: 44, y: 30 },
        { rows: COIN_STACK, palette: COIN_STACK_PALETTE, x: 56, y: 32 },
        { rows: CALCULATOR, palette: CALCULATOR_PALETTE, x: 80, y: 40 },
        { rows: SCRATCH_POST, palette: SCRATCH_POST_PALETTE, x: 28, y: 38 },
      ]),
      catBedPosition: bed,
      deskPosition: desk,
    };
  }

  if (id === "sonic") {
    return {
      wallTint: tint(accent, "26"),
      wallStripe: tint(accent, "40"),
      floor: "#d9b896",
      floorDark: "#b88e6a",
      props: baseProps([
        { rows: WINDOW_DAY, palette: WINDOW_DAY_PALETTE, x: 14, y: 6 },
        { rows: TELESCOPE, palette: TELESCOPE_PALETTE, x: 44, y: 14 },
        { rows: NEWSPAPER, palette: NEWSPAPER_PALETTE, x: 80, y: 36 },
        { rows: NEWSPAPER, palette: NEWSPAPER_PALETTE, x: 92, y: 38 },
        { rows: FISH_TOY, palette: FISH_TOY_PALETTE, x: 24, y: 70 },
      ]),
      catBedPosition: bed,
      deskPosition: desk,
    };
  }

  if (id === "picasso") {
    return {
      wallTint: tint(accent, "26"),
      wallStripe: tint(accent, "44"),
      floor: "#d9b896",
      floorDark: "#b88e6a",
      props: baseProps([
        { rows: WINDOW_DAY, palette: WINDOW_DAY_PALETTE, x: 14, y: 8 },
        { rows: EASEL, palette: EASEL_PALETTE, x: 80, y: 30 },
        { rows: PAINT_PALETTE, palette: PAINT_PALETTE_PALETTE, x: 56, y: 44 },
        { rows: YARN_BALL, palette: YARN_BALL_PALETTE, x: 30, y: 70 },
      ]),
      catBedPosition: bed,
      deskPosition: desk,
    };
  }

  // dear-diary
  return {
    wallTint: tint(accent, "26"),
    wallStripe: tint(accent, "44"),
    floor: "#d9b896",
    floorDark: "#b88e6a",
    props: baseProps([
      { rows: WINDOW_DAY, palette: WINDOW_DAY_PALETTE, x: 14, y: 8 },
      { rows: PLANT, palette: PLANT_PALETTE, x: 44, y: 32 },
      { rows: PLANNER, palette: PLANNER_PALETTE, x: 84, y: 38 },
      { rows: PENCIL, palette: PENCIL_PALETTE, x: 100, y: 50 },
      { rows: FISH_TOY, palette: FISH_TOY_PALETTE, x: 28, y: 70 },
    ]),
    catBedPosition: bed,
    deskPosition: desk,
  };
}

const PAW_PRINT_LITE = [
  ".PP.PP.",
  ".PP.PP.",
  ".......",
];

export function RoomScene({ agent, status, className }: RoomSceneProps) {
  const room = buildRoom(agent);
  const config = AGENT_SPRITES[agent.id];

  const isSleeping = status === "idle";
  const isErroring = status === "error";

  // Cat position: at desk (active/standby/error) or in bed (idle)
  const catPos = isSleeping
    ? { x: room.catBedPosition.x + 2, y: room.catBedPosition.y - 14 }
    : { x: room.deskPosition.x - 4, y: room.deskPosition.y - 22 };

  const bodyRows = isSleeping ? CAT_BODY_SLEEP : CAT_BODY_AWAKE;

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      className={`pixel block w-full h-auto ${className ?? ""}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label={`${agent.name}'s room — ${status}`}
    >
      {/* Wall background */}
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

      {/* Wainscoting line where wall meets floor */}
      <rect x={0} y={FLOOR_Y - 2} width={VB_W} height={1} fill="#3d3530" opacity={0.55} />
      <rect x={0} y={FLOOR_Y - 1} width={VB_W} height={1} fill="#ffffff" opacity={0.3} />

      {/* Floor */}
      <rect x={0} y={FLOOR_Y} width={VB_W} height={VB_H - FLOOR_Y} fill={room.floor} />

      {/* Floorboards */}
      {[FLOOR_Y + 6, FLOOR_Y + 14, FLOOR_Y + 22].map((y, i) => (
        <rect key={`board-${i}`} x={0} y={y} width={VB_W} height={1} fill={room.floorDark} opacity={0.6} />
      ))}

      {/* Vertical floorboard divisions */}
      {[20, 60, 100].map((x, i) => (
        <rect key={`vb-${i}`} x={x} y={FLOOR_Y + 1} width={1} height={VB_H - FLOOR_Y - 2} fill={room.floorDark} opacity={0.4} />
      ))}

      {/* Desk surface */}
      <rect x={room.deskPosition.x - 2} y={room.deskPosition.y - 4} width={48} height={4} fill="#8a5a3a" />
      <rect x={room.deskPosition.x - 2} y={room.deskPosition.y - 1} width={48} height={1} fill="#5a3d2e" />
      <rect x={room.deskPosition.x} y={room.deskPosition.y} width={2} height={20} fill="#5a3d2e" />
      <rect x={room.deskPosition.x + 42} y={room.deskPosition.y} width={2} height={20} fill="#5a3d2e" />

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
