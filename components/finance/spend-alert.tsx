import type { SpendView } from "@/lib/finance/spend";

function trailingWeekCost(view: SpendView): number {
  const days = view.daily.slice(-7);
  let total = 0;
  for (const d of days) {
    for (const id of Object.keys(d.byAgent)) {
      total += d.byAgent[id as keyof typeof d.byAgent].costUsd;
    }
  }
  return total;
}

export function SpendAlert({
  view,
  threshold,
}: {
  view: SpendView;
  threshold: number;
}) {
  const weekly = trailingWeekCost(view);
  if (weekly < threshold) return null;
  const overBy = weekly - threshold;

  return (
    <div
      className="pixel-frame-tight bg-[#fdecef] px-4 py-3 flex items-center justify-between gap-4"
      style={{ ["--pixel-frame-color" as string]: "#f2a7b8" }}
      role="alert"
    >
      <div>
        <p className="font-pixel text-[10px] uppercase tracking-widest text-[#a44d63]">
          ⚠ weekly spend cap
        </p>
        <p className="font-pixel-mono text-[12px] text-text-primary mt-1">
          ${weekly.toFixed(2)} spent in the last 7 days — ${overBy.toFixed(2)}{" "}
          over the ${threshold.toFixed(0)} threshold.
        </p>
      </div>
    </div>
  );
}
