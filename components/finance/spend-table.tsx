import { AGENT_ACCENTS, type AgentId } from "@/lib/theme";
import { AGENTS } from "@/lib/agents/registry";
import { PixelDot } from "@/components/pixel/pixel-badge";
import type { SpendView } from "@/lib/finance/spend";

type Row = {
  agentId: AgentId;
  name: string;
  tokens: number;
  costUsd: number;
};

function aggregate(view: SpendView): Row[] {
  const totals: Record<AgentId, { tokens: number; costUsd: number }> = {
    alyvis: { tokens: 0, costUsd: 0 },
    ohara: { tokens: 0, costUsd: 0 },
    nyssa: { tokens: 0, costUsd: 0 },
    sonic: { tokens: 0, costUsd: 0 },
    picasso: { tokens: 0, costUsd: 0 },
    "dear-diary": { tokens: 0, costUsd: 0 },
  };
  for (const day of view.daily) {
    for (const id of Object.keys(day.byAgent) as AgentId[]) {
      totals[id].tokens += day.byAgent[id].tokens;
      totals[id].costUsd += day.byAgent[id].costUsd;
    }
  }
  return AGENTS.map((a) => ({
    agentId: a.id,
    name: a.name,
    tokens: totals[a.id].tokens,
    costUsd: totals[a.id].costUsd,
  })).sort((a, b) => b.costUsd - a.costUsd);
}

function fmtTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function fmtUsd(n: number): string {
  return `$${n.toFixed(2)}`;
}

export function SpendTable({ view }: { view: SpendView }) {
  const rows = aggregate(view);

  return (
    <table className="w-full font-pixel-mono text-[12px]">
      <thead>
        <tr className="border-b-2 border-border-warm">
          <th className="text-left py-2 px-2 font-pixel text-[8px] uppercase tracking-widest text-text-muted">
            Agent
          </th>
          <th className="text-right py-2 px-2 font-pixel text-[8px] uppercase tracking-widest text-text-muted">
            Tokens
          </th>
          <th className="text-right py-2 px-2 font-pixel text-[8px] uppercase tracking-widest text-text-muted">
            Cost
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.agentId} className="border-b border-border-warm/40 last:border-0">
            <td className="py-2 px-2">
              <span className="inline-flex items-center gap-2">
                <PixelDot color={AGENT_ACCENTS[r.agentId]} size={10} />
                <span style={{ color: AGENT_ACCENTS[r.agentId] }} className="font-pixel text-[10px] uppercase tracking-wider">
                  {r.name}
                </span>
              </span>
            </td>
            <td className="py-2 px-2 text-right text-text-secondary">
              {fmtTokens(r.tokens)}
            </td>
            <td className="py-2 px-2 text-right text-text-primary">
              {fmtUsd(r.costUsd)}
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="border-t-2 border-border-warm">
          <td className="py-2 px-2 font-pixel text-[8px] uppercase tracking-widest text-text-primary">
            Total
          </td>
          <td className="py-2 px-2 text-right text-text-primary">
            {fmtTokens(view.totals.tokens)}
          </td>
          <td className="py-2 px-2 text-right text-text-primary font-pixel text-[10px]">
            {fmtUsd(view.totals.costUsd)}
          </td>
        </tr>
      </tfoot>
    </table>
  );
}
