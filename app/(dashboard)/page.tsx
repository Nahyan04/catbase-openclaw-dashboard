"use client";

import { useQuery } from "@tanstack/react-query";
import { House } from "@/components/home/house";
import { Ticker } from "@/components/home/ticker";
import type { PresenceMap } from "@/lib/agents/presence";

async function fetchPresence(): Promise<PresenceMap> {
  const res = await fetch("/api/presence");
  if (!res.ok) throw new Error(`Presence API returned ${res.status}`);
  return res.json() as Promise<PresenceMap>;
}

export default function Home() {
  const { data, isError } = useQuery<PresenceMap>({
    queryKey: ["presence"],
    queryFn: fetchPresence,
    refetchInterval: 10_000,
  });

  return (
    <div className="min-h-screen bg-bg-parchment px-8 py-10">
      <h1 className="text-3xl font-bold text-text-primary mb-8 tracking-tight">
        Home
      </h1>

      {isError && (
        <div className="mb-4 px-4 py-2 rounded border border-status-error bg-status-error/10 text-sm text-text-secondary">
          Could not load presence — retrying...
        </div>
      )}

      {/* Render house with live presence or idle skeleton while loading */}
      <House presence={data ?? {}} />

      {/* Live agent status ticker */}
      <div className="mt-6">
        <Ticker />
      </div>
    </div>
  );
}
