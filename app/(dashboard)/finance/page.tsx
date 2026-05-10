import { PageHeader } from "@/components/pixel/page-header";
import { CatSprite } from "@/components/home/sprites/cat-sprite";
import { SpendChart } from "@/components/finance/spend-chart";
import { SpendTable } from "@/components/finance/spend-table";
import { SpendAlert } from "@/components/finance/spend-alert";
import { Ledger } from "@/components/finance/ledger";
import { getSpend } from "@/lib/finance/spend";
import { readLedger } from "@/lib/finance/ledger";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FinancePage() {
  const [spend, ledger] = await Promise.all([
    getSpend({ days: 30 }),
    readLedger(),
  ]);

  return (
    <div className="px-6 sm:px-8 py-8 flex flex-col gap-6">
      <PageHeader
        title="Finance"
        subtitle="// NYSSA — token spend, ledgers, runway"
        glyph="$"
        accent="#b8a0d4"
        right={
          <div
            className="pixel-frame-tight bg-[#1a1612] flex items-center gap-3 px-3 py-2"
            style={{ ["--pixel-frame-color" as string]: "#b8a0d4" }}
          >
            <CatSprite agentId="nyssa" status="active" size={36} showBubble={false} />
            <div className="flex flex-col">
              <span className="font-pixel text-[8px] uppercase tracking-widest text-[#b8a0d4]">
                NYSSA
              </span>
              <span className="font-pixel-mono text-[12px] text-[#f5e8d4]">on duty</span>
            </div>
          </div>
        }
      />

      <SpendAlert view={spend} threshold={env.SPEND_ALERT_USD_PER_WEEK} />

      <div className="grid gap-6 lg:grid-cols-3">
        <section
          className="pixel-frame bg-bg-card p-5 lg:col-span-2"
          style={{ ["--pixel-frame-color" as string]: "#b8a0d4" }}
        >
          <header className="flex items-baseline justify-between mb-3">
            <h2 className="font-pixel text-[12px] uppercase tracking-widest text-text-primary">
              Token spend — last 30 days
            </h2>
            <span className="font-pixel-mono text-[12px] text-text-secondary">
              ${spend.totals.costUsd.toFixed(2)} total
            </span>
          </header>
          <SpendChart view={spend} />
        </section>

        <section
          className="pixel-frame bg-bg-card p-5"
          style={{ ["--pixel-frame-color" as string]: "#b8a0d4" }}
        >
          <h2 className="font-pixel text-[12px] uppercase tracking-widest text-text-primary mb-3">
            By agent
          </h2>
          <SpendTable view={spend} />
        </section>
      </div>

      <section
        className="pixel-frame bg-bg-card p-5"
        style={{ ["--pixel-frame-color" as string]: "#e8c97a" }}
      >
        <h2 className="font-pixel text-[12px] uppercase tracking-widest text-text-primary mb-4">
          Startup ledger
        </h2>
        <Ledger view={ledger} />
      </section>
    </div>
  );
}
