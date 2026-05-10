import "server-only";

import { getOpenClaw } from "@/lib/openclaw/client";
import { getAgent } from "@/lib/agents/registry";
import type { AgentId } from "@/lib/theme";
import { priceFor } from "@/lib/finance/prices";
import type { OpenClawRun } from "@/lib/openclaw/types";

export type AgentSpend = { tokens: number; costUsd: number };
export type DailySpend = { date: string; byAgent: Record<AgentId, AgentSpend> };
export type SpendView = {
  daily: DailySpend[];
  totals: { tokens: number; costUsd: number };
};

const KNOWN_AGENT_IDS: AgentId[] = [
  "alyvis",
  "ohara",
  "nyssa",
  "sonic",
  "picasso",
  "dear-diary",
];

function isKnownAgentId(id: string): id is AgentId {
  return (KNOWN_AGENT_IDS as string[]).includes(id);
}

function emptyByAgent(): Record<AgentId, AgentSpend> {
  return {
    alyvis: { tokens: 0, costUsd: 0 },
    ohara: { tokens: 0, costUsd: 0 },
    nyssa: { tokens: 0, costUsd: 0 },
    sonic: { tokens: 0, costUsd: 0 },
    picasso: { tokens: 0, costUsd: 0 },
    "dear-diary": { tokens: 0, costUsd: 0 },
  };
}

/** Format a Date as YYYY-MM-DD in UTC. */
function dateKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Resolve [from, to] inclusive. Defaults to last `days` ending today (UTC). */
function resolveRange(opts: { days?: number; from?: Date; to?: Date }): {
  from: Date;
  to: Date;
} {
  if (opts.from && opts.to) {
    return { from: opts.from, to: opts.to };
  }
  const days = opts.days ?? 30;
  const to = opts.to ?? new Date();
  const toUtc = new Date(
    Date.UTC(
      to.getUTCFullYear(),
      to.getUTCMonth(),
      to.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );
  const fromUtc =
    opts.from ??
    new Date(
      Date.UTC(
        to.getUTCFullYear(),
        to.getUTCMonth(),
        to.getUTCDate() - (days - 1),
        0,
        0,
        0,
        0,
      ),
    );
  return { from: fromUtc, to: toUtc };
}

/** Build an inclusive list of YYYY-MM-DD keys covering [from, to]. */
function dateRangeKeys(from: Date, to: Date): string[] {
  const keys: string[] = [];
  const cursor = new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()),
  );
  const endKey = dateKey(to);
  // Safety cap: don't loop past 1 year of days.
  for (let i = 0; i < 366; i++) {
    const k = dateKey(cursor);
    keys.push(k);
    if (k === endKey) break;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return keys;
}

function emptyDaily(from: Date, to: Date): DailySpend[] {
  return dateRangeKeys(from, to).map((date) => ({
    date,
    byAgent: emptyByAgent(),
  }));
}

function costForRun(run: OpenClawRun): number {
  const tokensIn = run.tokensIn ?? 0;
  const tokensOut = run.tokensOut ?? 0;
  const agent = getAgent(run.agentId);
  const modelId = run.model ?? agent?.defaultModel;
  const price = priceFor(modelId);
  return (
    (tokensIn / 1_000_000) * price.inputPerMTokens +
    (tokensOut / 1_000_000) * price.outputPerMTokens
  );
}

/**
 * Aggregate token spend across the agent crew within a date range.
 *
 * Source priority:
 *   1. `oc.usage.byAgent({ from, to })` if the SDK exposes it.
 *   2. Fallback: list runs within range, sum tokensIn/tokensOut, multiply by
 *      per-model price (per run's `model`, or the agent's `defaultModel`).
 *
 * Runs whose `agentId` is not part of the known crew are dropped from the
 * aggregation. When the gateway is unreachable, returns an empty SpendView
 * with all dates in range filled out (so the chart can still render).
 */
export async function getSpend(opts: {
  days?: number;
  from?: Date;
  to?: Date;
}): Promise<SpendView> {
  const { from, to } = resolveRange(opts);
  const fromIso = from.toISOString();
  const toIso = to.toISOString();

  const oc = await getOpenClaw();
  const daily = emptyDaily(from, to);
  const dailyByDate = new Map(daily.map((d) => [d.date, d]));

  if (!oc) {
    return {
      daily,
      totals: { tokens: 0, costUsd: 0 },
    };
  }

  // Source 1 — SDK usage namespace.
  if (oc.usage?.byAgent) {
    try {
      const usage = await oc.usage.byAgent({ from: fromIso, to: toIso });
      let totalTokens = 0;
      let totalCost = 0;
      for (const entry of usage) {
        if (!isKnownAgentId(entry.agentId)) continue;
        const bucket = dailyByDate.get(entry.date);
        if (!bucket) continue;
        bucket.byAgent[entry.agentId].tokens += entry.tokens;
        bucket.byAgent[entry.agentId].costUsd += entry.costUsd;
        totalTokens += entry.tokens;
        totalCost += entry.costUsd;
      }
      return {
        daily,
        totals: { tokens: totalTokens, costUsd: totalCost },
      };
    } catch {
      // Fall through to runs-based aggregation.
    }
  }

  // Source 2 — sum runs.
  let runs: OpenClawRun[] = [];
  try {
    runs = await oc.runs.list({ from: fromIso, to: toIso });
  } catch {
    return { daily, totals: { tokens: 0, costUsd: 0 } };
  }

  let totalTokens = 0;
  let totalCost = 0;

  for (const run of runs) {
    const tokensIn = run.tokensIn ?? 0;
    const tokensOut = run.tokensOut ?? 0;
    const tokens = tokensIn + tokensOut;
    if (tokens === 0) continue;
    if (!isKnownAgentId(run.agentId)) continue;

    const when = run.finishedAt ?? run.createdAt;
    const whenDate = new Date(when);
    if (Number.isNaN(whenDate.getTime())) continue;
    if (whenDate.getTime() < from.getTime()) continue;
    if (whenDate.getTime() > to.getTime()) continue;

    const key = dateKey(whenDate);
    const bucket = dailyByDate.get(key);
    if (!bucket) continue;

    const cost = costForRun(run);
    bucket.byAgent[run.agentId].tokens += tokens;
    bucket.byAgent[run.agentId].costUsd += cost;
    totalTokens += tokens;
    totalCost += cost;
  }

  return {
    daily,
    totals: { tokens: totalTokens, costUsd: totalCost },
  };
}
