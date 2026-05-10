import type { AgentInfo } from "@/lib/agents/registry";
import type { PresenceState, AgentStatus } from "@/lib/agents/presence";
import { RoomScene } from "./sprites/room-scene";
import { PixelDot } from "@/components/pixel/pixel-badge";

const STATUS_LABEL: Record<AgentStatus, string> = {
  active: "ACTIVE",
  standby: "STANDBY",
  idle: "ASLEEP",
  error: "FAULT",
};

const STATUS_DOT: Record<AgentStatus, string> = {
  active: "#7ec8d4",
  standby: "#e8c97a",
  idle: "#a8c5a0",
  error: "#f2a7b8",
};

interface RoomProps {
  agent: AgentInfo;
  presence: PresenceState;
}

export function Room({ agent, presence }: RoomProps) {
  const { status } = presence;
  const accent = agent.accentColor;

  return (
    <article
      className="pixel-frame relative bg-bg-card overflow-hidden flex flex-col"
      style={{
        ["--pixel-frame-color" as string]: accent,
        ["--pixel-frame-shadow" as string]: `${accent}66`,
      }}
      aria-label={`${agent.name}'s room`}
    >
      {/* Status header bar */}
      <header
        className="flex items-center justify-between px-3 py-2 border-b-2"
        style={{ borderColor: accent, backgroundColor: `${accent}22` }}
      >
        <span
          className="font-pixel text-[9px] uppercase tracking-widest"
          style={{ color: "#3d3530" }}
        >
          {agent.name}
        </span>
        <span className="inline-flex items-center gap-1.5 font-pixel text-[7px] uppercase tracking-wider text-text-secondary">
          <PixelDot color={STATUS_DOT[status]} />
          {STATUS_LABEL[status]}
        </span>
      </header>

      {/* Room scene */}
      <div className="relative bg-[#faf3e6]">
        <RoomScene agent={agent} status={status} />
      </div>

      {/* Role footer */}
      <footer className="px-3 py-1.5 border-t border-border-warm flex items-center justify-between">
        <span className="font-mono text-[10px] text-text-secondary truncate">
          {agent.role}
        </span>
        <span className="font-pixel text-[7px] tracking-wider text-text-muted uppercase">
          rm.0{agentRoomNumber(agent.id)}
        </span>
      </footer>
    </article>
  );
}

function agentRoomNumber(id: string): string {
  switch (id) {
    case "alyvis": return "1";
    case "ohara": return "2";
    case "nyssa": return "3";
    case "sonic": return "4";
    case "picasso": return "5";
    case "dear-diary": return "6";
    default: return "0";
  }
}
