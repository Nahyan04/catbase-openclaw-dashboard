import { AGENT_ACCENTS, type AgentId } from "@/lib/theme";

type Swatch = { label: string; hex: string };

function SwatchBox({ label, hex, className }: { label: string; hex: string; className?: string }) {
  return (
    <div className="flex flex-col items-start gap-1">
      <div
        className={`w-16 h-16 rounded border border-border-warm ${className ?? ""}`}
        style={className ? undefined : { backgroundColor: hex }}
      />
      <span className="text-xs text-text-secondary font-mono leading-tight">{label}</span>
      <span className="text-xs text-text-muted font-mono">{hex}</span>
    </div>
  );
}

function SwatchSection({ title, swatches }: { title: string; swatches: Swatch[] }) {
  return (
    <section className="mb-8">
      <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-widest mb-4">
        {title}
      </h2>
      <div className="flex flex-wrap gap-4">
        {swatches.map((s) => (
          <SwatchBox key={s.label} label={s.label} hex={s.hex} />
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const baseSwatches: Swatch[] = [
    { label: "bg-parchment", hex: "#faf7f2" },
    { label: "bg-sidebar", hex: "#f3ede3" },
    { label: "bg-card", hex: "#ffffff" },
    { label: "bg-hover", hex: "#f0e9de" },
    { label: "border-warm", hex: "#e8e0d4" },
  ];

  const accentSwatches: Swatch[] = [
    { label: "accent-sage", hex: "#a8c5a0" },
    { label: "accent-cyan", hex: "#7ec8d4" },
    { label: "accent-pink", hex: "#f2a7b8" },
  ];

  const textSwatches: Swatch[] = [
    { label: "text-primary", hex: "#3d3530" },
    { label: "text-secondary", hex: "#8c7e72" },
    { label: "text-muted", hex: "#b0a499" },
  ];

  const statusSwatches: Swatch[] = [
    { label: "status-active", hex: "#7ec8d4" },
    { label: "status-ok", hex: "#a8c5a0" },
    { label: "status-standby", hex: "#d4cbbf" },
    { label: "status-error", hex: "#f2a7b8" },
  ];

  const agentSwatches: Swatch[] = (Object.entries(AGENT_ACCENTS) as [AgentId, string][]).map(
    ([id, hex]) => ({ label: `agent-${id}`, hex })
  );

  return (
    <main className="min-h-screen bg-bg-parchment px-8 py-10">
      <h1 className="text-2xl font-bold text-text-primary mb-8 tracking-tight">
        CATBASE — palette check
      </h1>
      <SwatchSection title="Base" swatches={baseSwatches} />
      <SwatchSection title="Accents" swatches={accentSwatches} />
      <SwatchSection title="Text" swatches={textSwatches} />
      <SwatchSection title="Status" swatches={statusSwatches} />
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-widest mb-4">
          Agents
        </h2>
        <div className="flex flex-wrap gap-4">
          {agentSwatches.map((s) => (
            <div key={s.label} className="flex flex-col items-start gap-1">
              <div
                className="w-16 h-16 rounded border border-border-warm"
                style={{ backgroundColor: s.hex }}
              />
              <span className="text-xs text-text-secondary font-mono leading-tight">{s.label}</span>
              <span className="text-xs text-text-muted font-mono">{s.hex}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
