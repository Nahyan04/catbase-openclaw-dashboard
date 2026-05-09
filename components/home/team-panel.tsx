import { AGENTS } from "@/lib/agents/registry";
import type { PresenceMap } from "@/lib/agents/presence";
import { AgentCard } from "@/components/home/agent-card";
import { Pipeline } from "@/components/home/pipeline";

interface TeamPanelProps {
  presence: Partial<PresenceMap>;
}

export function TeamPanel({ presence }: TeamPanelProps) {
  return (
    <div className="mt-4 space-y-6">
      {/* Pipeline diagram */}
      <Pipeline />

      {/* Agent grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {AGENTS.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            presence={presence[agent.id]}
          />
        ))}
      </div>
    </div>
  );
}
