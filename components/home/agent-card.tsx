import type { AgentInfo } from "@/lib/agents/registry";
import type { PresenceState, AgentStatus } from "@/lib/agents/presence";
import { getAgent } from "@/lib/agents/registry";
import { AgentSprite } from "@/components/home/agent-sprite";
import { Badge } from "@/components/ui/badge";

const STATUS_COLOR: Record<AgentStatus, string> = {
  active: "#7ec8d4",
  idle: "#a8c5a0",
  standby: "#d4cbbf",
  error: "#f2a7b8",
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
    <div className="rounded-xl border border-border-warm bg-bg-card p-4 flex gap-3">
      {/* Pixel avatar slot */}
      <div className="flex-shrink-0 pt-0.5">
        <AgentSprite agent={agent} status={status} />
      </div>

      {/* Content stack */}
      <div className="flex flex-col gap-1 min-w-0">
        {/* Name + role */}
        <h3 className="font-semibold text-sm leading-snug" style={{ color: agent.accentColor }}>
          {agent.name}
        </h3>
        <p className="text-xs text-text-secondary leading-snug">{agent.role}</p>

        {/* Badge pills */}
        <div className="flex flex-wrap gap-1.5 mt-1">
          <Badge variant="outline">{agent.defaultModel}</Badge>
          <Badge variant="outline">{agent.schedule}</Badge>
          <Badge
            variant="outline"
            style={{ borderColor: statusColor, color: statusColor }}
          >
            {status.toUpperCase()}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-sm text-text-secondary mt-1 leading-relaxed">
          {agent.description}
        </p>

        {/* Routing info */}
        {feedsIntoNames && (
          <div className="text-xs text-text-muted mt-2">
            feeds into {feedsIntoNames}
          </div>
        )}
      </div>
    </div>
  );
}
