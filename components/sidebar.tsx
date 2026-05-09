import { ConnectionStatus } from "@/components/connection-status";
import { NavItem } from "@/components/nav-item";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/work", label: "Work", icon: "✅" },
  { href: "/projects", label: "Projects", icon: "🗂️" },
  { href: "/knowledge", label: "Knowledge", icon: "🧠" },
  { href: "/finance", label: "Finance", icon: "💰" },
];

export function Sidebar() {
  return (
    <aside
      className="h-screen flex flex-col gap-4 p-4 shrink-0"
      style={{ width: "240px", backgroundColor: "var(--color-bg-sidebar)" }}
    >
      {/* Mascot avatar */}
      <div
        className="w-16 h-16 rounded-lg flex items-center justify-center self-center text-3xl"
        style={{ backgroundColor: "var(--color-bg-hover)" }}
      >
        🐱
      </div>

      {/* Title + connection status */}
      <div className="flex flex-col items-center gap-2">
        <span
          className="font-mono text-xs uppercase tracking-widest border px-3 py-1 rounded"
          style={{
            borderColor: "var(--color-border-warm)",
            color: "var(--color-text-primary)",
          }}
        >
          MISSION CONTROL
        </span>
        <ConnectionStatus />
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </nav>
    </aside>
  );
}
