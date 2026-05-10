import type { AgentInfo } from "@/lib/agents/registry";
import type { PresenceState, AgentStatus } from "@/lib/agents/presence";
import { getAgent } from "@/lib/agents/registry";
import { CatSprite } from "@/components/home/sprites/cat-sprite";
import { PixelBadge, PixelDot } from "@/components/pixel/pixel-badge";

const STATUS_COLOR: Record<AgentStatus, string> = {
  active: "#7ec8d4",
  idle: "#a8c5a0",
  standby: "#e8c97a",
  error: "#f2a7b8",
};

const STATUS_LABEL: Record<AgentStatus, string> = {
  active: "ACTIVE",
  idle: "ASLEEP",
  standby: "STANDBY",
  error: "FAULT",
};

interface AgentCardProps {
  agent: AgentInfo;
  presence?: PresenceState;
}

export function AgentCard({ agent, presence }: AgentCardProps) {
  const status: AgentStatus = presence?.status ?? "idle";
  const statusColor = STATUS_COLOR[status];

  const feedsIntoNames = agent.feedsInto
    .map((id) => getAgent(id))
    .filter(Boolean)
    .map((a) => a!.name)
    .join(", ");

  return (
    <article
      className="pixel-frame bg-bg-card p-4 flex gap-4 relative"
      style={{
        ["--pixel-frame-color" as string]: agent.accentColor,
      }}
    >
      {/* Avatar slot — pixel cat at full detail */}
      <div
        className="flex-shrink-0 pixel-frame-tight w-[88px] h-[88px] flex items-center justify-center"
        style={{
          backgroundColor: `${agent.accentColor}22`,
          ["--pixel-frame-color" as string]: agent.accentColor,
        }}
      >
        <CatSprite agentId={agent.id} status={status} size={72} showBubble={false} />
      </div>

      {/* Content stack */}
      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <h3
            className="font-pixel text-[12px] uppercase tracking-wider leading-none"
            style={{ color: agent.accentColor }}
          >
            {agent.name}
          </h3>
          <span className="inline-flex items-center gap-1 font-pixel text-[7px] uppercase tracking-wider" style={{ color: statusColor }}>
            <PixelDot color={statusColor} size={6} />
            {STATUS_LABEL[status]}
          </span>
        </div>
        <p className="text-xs text-text-secondary font-mono leading-snug">{agent.role}</p>

        <div className="flex flex-wrap gap-1.5 mt-1.5">
          <PixelBadge accent="#3d3530">{agent.defaultModel}</PixelBadge>
          <PixelBadge accent="#7ec8d4">{agent.schedule}</PixelBadge>
          <PixelBadge accent={agent.accentColor} fill={`${agent.accentColor}1a`}>
            {agent.schedulePolicy}
          </PixelBadge>
        </div>

        <p className="text-sm text-text-secondary mt-2 leading-relaxed">
          {agent.description}
        </p>

        {feedsIntoNames && (
          <div className="font-pixel-mono text-[12px] text-text-muted mt-2">
            <span className="text-[#f4a76a]">→</span> feeds {feedsIntoNames}
          </div>
        )}
      </div>
    </article>
  );
}
