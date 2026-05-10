"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AGENT_ACCENTS, type AgentId } from "@/lib/theme";
import { AGENTS } from "@/lib/agents/registry";
import type { SpendView } from "@/lib/finance/spend";

type ChartRow = { date: string } & Record<AgentId, number>;

const AGENT_ORDER: AgentId[] = AGENTS.map((a) => a.id);

function toRows(view: SpendView): ChartRow[] {
  return view.daily.map((d) => {
    const row: ChartRow = {
      date: d.date.slice(5),
      alyvis: 0,
      ohara: 0,
      nyssa: 0,
      sonic: 0,
      picasso: 0,
      "dear-diary": 0,
    };
    for (const id of AGENT_ORDER) {
      row[id] = round(d.byAgent[id]?.costUsd ?? 0);
    }
    return row;
  });
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function formatUsd(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function SpendChart({ view }: { view: SpendView }) {
  const rows = toRows(view);

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#e8e0d4" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#8c7e72"
            tick={{ fontSize: 11, fontFamily: "var(--font-pixel-mono)" }}
            tickLine={false}
            axisLine={{ stroke: "#e8e0d4" }}
          />
          <YAxis
            stroke="#8c7e72"
            tick={{ fontSize: 11, fontFamily: "var(--font-pixel-mono)" }}
            tickLine={false}
            axisLine={{ stroke: "#e8e0d4" }}
            tickFormatter={(v: number) => `$${v}`}
            width={48}
          />
          <Tooltip
            cursor={{ fill: "#f0e9de" }}
            contentStyle={{
              background: "#ffffff",
              border: "1.5px solid #3d3530",
              borderRadius: 0,
              fontFamily: "var(--font-pixel-mono)",
              fontSize: 12,
              color: "#3d3530",
              boxShadow: "2px 2px 0 0 #3d353033",
            }}
            formatter={(value, name) => {
              const num = typeof value === "number" ? value : Number(value ?? 0);
              return [formatUsd(num), String(name ?? "")];
            }}
          />
          <Legend
            wrapperStyle={{
              fontFamily: "var(--font-pixel-mono)",
              fontSize: 11,
              color: "#8c7e72",
              paddingTop: 8,
            }}
            iconType="square"
          />
          {AGENT_ORDER.map((id) => (
            <Bar
              key={id}
              dataKey={id}
              stackId="agents"
              fill={AGENT_ACCENTS[id]}
              name={AGENTS.find((a) => a.id === id)?.name ?? id}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
