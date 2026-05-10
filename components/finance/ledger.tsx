import type { LedgerView } from "@/lib/finance/ledger";

function fmtUsd(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function fmtDate(iso: string): string {
  return iso.length >= 10 ? iso.slice(0, 10) : iso;
}

function BarRow({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <span className="font-pixel text-[8px] uppercase tracking-widest text-text-muted">
          {label}
        </span>
        <span className="font-pixel-mono text-[12px] text-text-primary">
          {fmtUsd(value)}
        </span>
      </div>
      <div className="h-3 w-full bg-bg-hover overflow-hidden pixel-frame-tight" style={{ ["--pixel-frame-color" as string]: "#e8e0d4" }}>
        <div className="h-full" style={{ width: `${pct * 100}%`, background: color }} />
      </div>
    </div>
  );
}

export function Ledger({ view }: { view: LedgerView }) {
  if (view.scaffoldNeeded) {
    return (
      <div
        className="pixel-frame-tight bg-bg-card px-4 py-6 text-center"
        style={{ ["--pixel-frame-color" as string]: "#e8c97a" }}
      >
        <p className="font-pixel text-[10px] uppercase tracking-widest text-text-muted mb-2">
          ledger empty
        </p>
        <p className="font-pixel-mono text-[12px] text-text-secondary">
          Drop <code>budget.json</code>, <code>actuals.json</code>, and{" "}
          <code>transactions.json</code> into the workspace{" "}
          <code>finance/</code> directory to populate this view.
        </p>
      </div>
    );
  }

  const burn =
    view.actuals?.monthlyBurnUsd ?? view.budget?.monthlyBurnUsd ?? null;
  const cash = view.actuals?.cashOnHandUsd ?? null;
  const max = Math.max(burn ?? 0, cash ?? 0, 1);

  return (
    <div className="flex flex-col gap-5">
      {(burn !== null || cash !== null) && (
        <div className="flex flex-col gap-3">
          {cash !== null && (
            <BarRow label="Cash on hand" value={cash} max={max} color="#a8c5a0" />
          )}
          {burn !== null && (
            <BarRow label="Monthly burn" value={burn} max={max} color="#f2a7b8" />
          )}
        </div>
      )}

      {view.runwayMonths !== null && (
        <div className="pixel-frame-tight bg-[#1a1612] px-5 py-4 text-center" style={{ ["--pixel-frame-color" as string]: "#7ec8d4" }}>
          <p className="font-pixel text-[8px] uppercase tracking-widest text-[#7ec8d4] mb-2">
            Runway
          </p>
          <p className="font-pixel text-[26px] text-[#f5e8d4] leading-none">
            {view.runwayMonths.toFixed(1)} months
          </p>
        </div>
      )}

      {view.transactions.length > 0 && (
        <div>
          <p className="font-pixel text-[8px] uppercase tracking-widest text-text-muted mb-2">
            Recent transactions
          </p>
          <ul className="font-pixel-mono text-[12px] divide-y divide-border-warm/40">
            {view.transactions.slice(-8).reverse().map((t, i) => (
              <li key={`${t.date}-${i}`} className="flex items-baseline justify-between gap-3 py-2">
                <span className="text-text-muted">{fmtDate(t.date)}</span>
                <span className="text-text-secondary flex-1 truncate">
                  {t.description}
                </span>
                <span
                  className={
                    t.amountUsd >= 0 ? "text-accent-sage" : "text-accent-pink"
                  }
                >
                  {t.amountUsd >= 0 ? "+" : "−"}
                  {fmtUsd(Math.abs(t.amountUsd))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {view.transactions.length === 0 &&
        view.budget === null &&
        view.actuals === null && (
          <p className="font-pixel-mono text-[12px] text-text-muted text-center py-4">
            {"// ledger directory exists but is empty"}
          </p>
        )}
    </div>
  );
}
