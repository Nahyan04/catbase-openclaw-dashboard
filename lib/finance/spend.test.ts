import { describe, it, expect, vi, beforeEach } from "vitest";
import type { OpenClawRun } from "@/lib/openclaw/types";
import { priceFor } from "@/lib/finance/prices";
import { getAgent } from "@/lib/agents/registry";

// Anchor "today" to a fixed UTC date so the seven-day window is deterministic.
const ANCHOR = new Date("2026-05-10T12:00:00Z");

function isoForDay(offsetDaysBack: number): string {
  const d = new Date(ANCHOR);
  d.setUTCDate(d.getUTCDate() - offsetDaysBack);
  d.setUTCHours(10, 0, 0, 0);
  return d.toISOString();
}

function dateKeyFor(offsetDaysBack: number): string {
  const d = new Date(ANCHOR);
  d.setUTCDate(d.getUTCDate() - offsetDaysBack);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function expectedCostForRun(run: OpenClawRun): number {
  const agent = getAgent(run.agentId);
  const price = priceFor(run.model ?? agent?.defaultModel);
  const tIn = (run.tokensIn ?? 0) / 1_000_000;
  const tOut = (run.tokensOut ?? 0) / 1_000_000;
  return tIn * price.inputPerMTokens + tOut * price.outputPerMTokens;
}

describe("getSpend — runs aggregation fallback", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    vi.setSystemTime(ANCHOR);
  });

  it("aggregates 7 runs across 7 days for 2 agents into daily and totals", async () => {
    // Synthetic runs: one per day for the past 7 days, alternating agents.
    const fakeRuns: OpenClawRun[] = [];
    for (let i = 0; i < 7; i++) {
      const agentId = i % 2 === 0 ? "alyvis" : "ohara";
      fakeRuns.push({
        id: `run-${i}`,
        agentId,
        title: `Synthetic run ${i}`,
        status: "completed",
        priority: "normal",
        createdAt: isoForDay(i),
        finishedAt: isoForDay(i),
        tokensIn: 1000 * (i + 1),
        tokensOut: 500 * (i + 1),
      });
    }

    vi.doMock("@/lib/openclaw/client", () => ({
      getOpenClaw: vi.fn().mockResolvedValue({
        runs: {
          list: vi.fn().mockResolvedValue(fakeRuns),
          create: vi.fn(),
          update: vi.fn(),
        },
        // No `usage` namespace → forces the runs fallback path.
      }),
    }));

    const { getSpend } = await import("@/lib/finance/spend");
    const view = await getSpend({ days: 7 });

    // 7 inclusive day buckets.
    expect(view.daily).toHaveLength(7);

    // Buckets are sorted ascending; oldest is index 0 (offset 6 days back).
    expect(view.daily[0].date).toBe(dateKeyFor(6));
    expect(view.daily[6].date).toBe(dateKeyFor(0));

    // Per-day token counts match the input runs.
    let summedTokens = 0;
    let summedCost = 0;
    for (const run of fakeRuns) {
      const offset = fakeRuns.indexOf(run);
      const key = dateKeyFor(offset);
      const bucket = view.daily.find((d) => d.date === key);
      expect(bucket, `missing bucket ${key}`).toBeDefined();
      const agent = run.agentId as "alyvis" | "ohara";
      const tokens = (run.tokensIn ?? 0) + (run.tokensOut ?? 0);
      expect(bucket!.byAgent[agent].tokens).toBe(tokens);
      const expectedCost = expectedCostForRun(run);
      expect(bucket!.byAgent[agent].costUsd).toBeCloseTo(expectedCost, 10);
      // Other agents on this day should be zero.
      const allAgents = [
        "alyvis",
        "ohara",
        "nyssa",
        "sonic",
        "picasso",
        "dear-diary",
      ] as const;
      for (const a of allAgents) {
        if (a === agent) continue;
        expect(bucket!.byAgent[a].tokens).toBe(0);
        expect(bucket!.byAgent[a].costUsd).toBe(0);
      }
      summedTokens += tokens;
      summedCost += expectedCost;
    }

    expect(view.totals.tokens).toBe(summedTokens);
    expect(view.totals.costUsd).toBeCloseTo(summedCost, 10);

    // Spot-check a single cost calculation against the price table:
    // run-0 → alyvis (defaultModel = claude-opus-4-7), tokensIn 1000, tokensOut 500
    // input cost = (1000 / 1e6) * 15 = 0.015
    // output cost = (500 / 1e6) * 75 = 0.0375
    const day0 = view.daily.find((d) => d.date === dateKeyFor(0));
    expect(day0!.byAgent.alyvis.costUsd).toBeCloseTo(0.015 + 0.0375, 10);
  });

  it("returns empty daily buckets and zero totals when getOpenClaw returns null", async () => {
    vi.doMock("@/lib/openclaw/client", () => ({
      getOpenClaw: vi.fn().mockResolvedValue(null),
    }));

    const { getSpend } = await import("@/lib/finance/spend");
    const view = await getSpend({ days: 7 });

    expect(view.daily).toHaveLength(7);
    expect(view.totals).toEqual({ tokens: 0, costUsd: 0 });
    for (const bucket of view.daily) {
      for (const agent of Object.keys(bucket.byAgent)) {
        const a = agent as keyof typeof bucket.byAgent;
        expect(bucket.byAgent[a]).toEqual({ tokens: 0, costUsd: 0 });
      }
    }
  });

  it("drops runs whose agentId is not part of the known crew", async () => {
    const runs: OpenClawRun[] = [
      {
        id: "run-known",
        agentId: "alyvis",
        title: "known",
        status: "completed",
        priority: "normal",
        createdAt: isoForDay(0),
        finishedAt: isoForDay(0),
        tokensIn: 1000,
        tokensOut: 500,
      },
      {
        id: "run-unknown",
        agentId: "ghost-agent",
        title: "unknown",
        status: "completed",
        priority: "normal",
        createdAt: isoForDay(0),
        finishedAt: isoForDay(0),
        tokensIn: 999_999,
        tokensOut: 999_999,
      },
    ];

    vi.doMock("@/lib/openclaw/client", () => ({
      getOpenClaw: vi.fn().mockResolvedValue({
        runs: {
          list: vi.fn().mockResolvedValue(runs),
          create: vi.fn(),
          update: vi.fn(),
        },
      }),
    }));

    const { getSpend } = await import("@/lib/finance/spend");
    const view = await getSpend({ days: 7 });

    // Only the known run's tokens should appear in totals.
    expect(view.totals.tokens).toBe(1500);
  });
});

describe("getSpend — SDK usage namespace", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    vi.setSystemTime(ANCHOR);
  });

  it("uses oc.usage.byAgent when available", async () => {
    const usage = [
      {
        agentId: "alyvis",
        date: dateKeyFor(0),
        tokens: 5000,
        costUsd: 0.42,
      },
      {
        agentId: "ohara",
        date: dateKeyFor(1),
        tokens: 3000,
        costUsd: 0.18,
      },
    ];

    const byAgent = vi.fn().mockResolvedValue(usage);
    const runsList = vi.fn();

    vi.doMock("@/lib/openclaw/client", () => ({
      getOpenClaw: vi.fn().mockResolvedValue({
        runs: { list: runsList, create: vi.fn(), update: vi.fn() },
        usage: { byAgent },
      }),
    }));

    const { getSpend } = await import("@/lib/finance/spend");
    const view = await getSpend({ days: 7 });

    expect(byAgent).toHaveBeenCalledTimes(1);
    expect(runsList).not.toHaveBeenCalled();

    const day0 = view.daily.find((d) => d.date === dateKeyFor(0));
    expect(day0!.byAgent.alyvis).toEqual({ tokens: 5000, costUsd: 0.42 });
    const day1 = view.daily.find((d) => d.date === dateKeyFor(1));
    expect(day1!.byAgent.ohara).toEqual({ tokens: 3000, costUsd: 0.18 });
    expect(view.totals.tokens).toBe(8000);
    expect(view.totals.costUsd).toBeCloseTo(0.6, 10);
  });
});
