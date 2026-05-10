import { ConnectionStatus } from "@/components/connection-status";
import { NavItem } from "@/components/nav-item";
import { CatSprite } from "@/components/home/sprites/cat-sprite";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: "▣" },
  { href: "/work", label: "Work", icon: "▤" },
  { href: "/projects", label: "Projects", icon: "◈" },
  { href: "/knowledge", label: "Knowledge", icon: "✦" },
  { href: "/finance", label: "Finance", icon: "$" },
];

export function Sidebar() {
  return (
    <aside
      className="h-screen flex flex-col gap-5 p-4 shrink-0 border-r-2"
      style={{
        width: "240px",
        backgroundColor: "var(--color-bg-sidebar)",
        borderRightColor: "#3d3530",
      }}
    >
      {/* Mascot avatar — Alyvis as house mascot */}
      <div
        className="pixel-frame-tight relative bg-[#cbd6e4] flex items-center justify-center self-center mt-1"
        style={{
          width: "76px",
          height: "76px",
          ["--pixel-frame-color" as string]: "#3d3530",
        }}
      >
        <CatSprite agentId="alyvis" status="active" size={56} showBubble={false} />
      </div>

      {/* Title */}
      <div className="flex flex-col items-center gap-2">
        <span
          className="font-pixel text-[9px] uppercase tracking-[0.2em] px-3 py-2 bg-[#3d3530] text-[#f5e8d4]"
          style={{
            boxShadow: "2px 2px 0 0 rgba(168, 197, 160, 0.7)",
          }}
        >
          MISSION
          <br />
          CONTROL
        </span>
        <ConnectionStatus />
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1.5 mt-2">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </nav>

      {/* Footer mark */}
      <div className="mt-auto pt-3 border-t border-border-warm">
        <div className="flex items-center justify-between font-pixel text-[7px] tracking-widest uppercase text-text-muted">
          <span>CATBASE</span>
          <span>v1.0</span>
        </div>
        <p className="font-pixel-mono text-[12px] text-text-muted mt-1 leading-tight">
          {"// 6 cats. 1 mission."}
        </p>
      </div>
    </aside>
  );
}
