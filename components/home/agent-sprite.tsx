import type { AgentInfo } from "@/lib/agents/registry";
import type { AgentStatus } from "@/lib/agents/presence";
import { CatSprite } from "./sprites/cat-sprite";

interface AgentSpriteProps {
  agent: AgentInfo;
  status: AgentStatus;
  size?: number;
  showBubble?: boolean;
  className?: string;
}

export function AgentSprite({
  agent,
  status,
  size = 48,
  showBubble = true,
  className,
}: AgentSpriteProps) {
  return (
    <span
      className={`relative inline-flex ${className ?? ""}`}
      title={`${agent.name} — ${status}`}
      aria-label={`${agent.name} sprite (${status})`}
    >
      <CatSprite
        agentId={agent.id}
        status={status}
        size={size}
        showBubble={showBubble}
      />
    </span>
  );
}
