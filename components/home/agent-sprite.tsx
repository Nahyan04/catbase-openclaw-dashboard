/**
 * Placeholder sprite component for each agent cat.
 * This is throwaway scaffolding — v1 uses a tinted initial box.
 * Final pixel-art swap happens when the artist delivers PNGs.
 * See public/sprites/README.txt for the sprite naming convention.
 */

import type { AgentInfo } from "@/lib/agents/registry";
import type { AgentStatus } from "@/lib/agents/presence";

interface AgentSpriteProps {
  agent: AgentInfo;
  status: AgentStatus;
}

export function AgentSprite({ agent, status }: AgentSpriteProps) {
  const initial = agent.name[0].toUpperCase();

  // Opacity varies by status to signal activity level
  const opacityMap: Record<AgentStatus, number> = {
    active: 1,
    standby: 0.65,
    idle: 0.4,
    error: 0.45,
  };

  const opacity = opacityMap[status];

  return (
    <div className="relative inline-flex items-center gap-1">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm select-none"
        style={{
          backgroundColor: agent.accentColor,
          opacity,
          boxShadow: status === "active" ? `0 0 0 2px ${agent.accentColor}` : undefined,
        }}
        title={`${agent.name} — ${status}`}
        aria-label={`${agent.name} sprite (${status})`}
      >
        {initial}
        {status === "error" && (
          <span
            className="absolute -top-1 -right-1 text-xs leading-none"
            aria-label="error"
          >
            ⚠️
          </span>
        )}
      </div>
      {status === "idle" && (
        <span className="text-xs text-text-muted select-none" aria-hidden="true">
          💤
        </span>
      )}
    </div>
  );
}
