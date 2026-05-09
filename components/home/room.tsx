import type { AgentInfo } from "@/lib/agents/registry";
import type { PresenceState } from "@/lib/agents/presence";
import { AgentSprite } from "./agent-sprite";

// Emoji props per agent, matching the registry description
const AGENT_PROP_EMOJI: Record<string, string> = {
  ohara: "📚",
  nyssa: "🧮",
  picasso: "🎨",
  "dear-diary": "📅",
  sonic: "🔭",
  alyvis: "💻",
};

interface RoomProps {
  agent: AgentInfo;
  presence: PresenceState;
}

export function Room({ agent, presence }: RoomProps) {
  const { status } = presence;
  const propEmoji = AGENT_PROP_EMOJI[agent.id] ?? "📦";

  // 12% alpha hex tint for the room background
  const bgColor = agent.accentColor + "1F";

  // Position the sprite based on status
  const isAtDesk = status === "active" || status === "error";
  const isInBed = status === "idle";

  return (
    <div
      className="relative border-2 rounded-lg p-2 min-h-32 flex flex-col"
      style={{ borderColor: agent.accentColor, backgroundColor: bgColor }}
    >
      {/* Room label — top left */}
      <span className="text-xs uppercase tracking-wider text-text-secondary font-semibold z-10">
        {agent.name}
      </span>

      {/* Agent prop — top right */}
      <span
        className="absolute top-2 right-2 text-base leading-none select-none"
        aria-label={`${agent.name}'s prop`}
      >
        {propEmoji}
      </span>

      {/* Cat bed — bottom left */}
      <div className="absolute bottom-2 left-2 flex items-center gap-1">
        <span className="text-base leading-none select-none" aria-label="cat bed">
          🛏️
        </span>
        {/* Z floats when idle/in bed */}
        {isInBed && (
          <span className="text-xs text-text-muted animate-pulse select-none" aria-hidden="true">
            Z
          </span>
        )}
      </div>

      {/* Agent sprite — positioned by status */}
      <div
        className={`absolute ${isAtDesk ? "bottom-2 right-2" : isInBed ? "bottom-2 left-8" : "bottom-6 right-6"}`}
        aria-label={`${agent.name} is ${status}`}
      >
        <AgentSprite agent={agent} status={status} />
      </div>

      {/* Desk indicator when active/error */}
      {isAtDesk && (
        <div
          className="absolute bottom-2 right-10 text-xs text-text-muted select-none"
          aria-hidden="true"
        >
          🖥️
        </div>
      )}

      {/* Role label — bottom center */}
      <div className="flex-1" />
      <span className="text-xs text-text-muted mt-auto pr-8 pb-0 truncate" title={agent.role}>
        {agent.role}
      </span>
    </div>
  );
}
