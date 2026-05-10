import type { AgentId } from "@/lib/theme";
import type { AgentStatus } from "@/lib/agents/presence";
import { PixelMap } from "@/lib/pixel/pixel-map";
import { CAT_BODY_AWAKE, CAT_BODY_SLEEP } from "@/lib/pixel/cat-base";
import { AGENT_SPRITES } from "@/lib/pixel/agent-sprites";

interface CatSpriteProps {
  agentId: AgentId;
  status: AgentStatus;
  size?: number;
  className?: string;
  showBubble?: boolean;
}

const VIEWBOX = 24;

export function CatSprite({
  agentId,
  status,
  size = 64,
  className,
  showBubble = true,
}: CatSpriteProps) {
  const config = AGENT_SPRITES[agentId];
  const isSleeping = status === "idle";

  const bodyRows = isSleeping ? CAT_BODY_SLEEP : CAT_BODY_AWAKE;

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      width={size}
      height={size}
      className={`pixel ${className ?? ""}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {/* Tail behind body when awake */}
      {!isSleeping && config.tail && (
        <PixelMap rows={config.tail.rows} palette={config.tail.palette} />
      )}

      {/* Base body */}
      <PixelMap rows={bodyRows} palette={config.basePalette} />

      {/* Ears (round / folded / tufted) */}
      {!isSleeping && (
        <PixelMap rows={config.ears.rows} palette={config.ears.palette} />
      )}

      {/* Breed + accessory overlays */}
      {!isSleeping &&
        config.overlays.map((overlay, idx) => (
          <PixelMap
            key={idx}
            rows={overlay.rows}
            palette={overlay.palette}
            className={overlay.className}
          />
        ))}

      {/* Persistent body markings still show when curled (smudge, color points) */}
      {isSleeping &&
        config.overlays
          .filter((o) =>
            Object.keys(o.palette).some((c) => "MN".includes(c)),
          )
          .map((overlay, idx) => (
            <PixelMap
              key={`s-${idx}`}
              rows={overlay.rows}
              palette={overlay.palette}
            />
          ))}

      {/* Status bubble: ! for error, Z for idle */}
      {showBubble && status === "error" && (
        <g>
          <rect x={18} y={2} width={4} height={4} fill={config.errorBubbleColor} />
          <rect x={20} y={3} width={1} height={1} fill="#fff" />
          <rect x={20} y={5} width={1} height={1} fill="#fff" />
          <rect x={19} y={6} width={1} height={1} fill={config.errorBubbleColor} />
        </g>
      )}
      {showBubble && isSleeping && (
        <g className="pixel-z">
          <rect x={20} y={1} width={3} height={1} fill="#3d3530" />
          <rect x={22} y={2} width={1} height={1} fill="#3d3530" />
          <rect x={21} y={3} width={1} height={1} fill="#3d3530" />
          <rect x={20} y={4} width={3} height={1} fill="#3d3530" />
        </g>
      )}
    </svg>
  );
}
