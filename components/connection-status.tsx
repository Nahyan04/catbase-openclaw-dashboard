"use client";

import { useQuery } from "@tanstack/react-query";
import { PixelDot } from "@/components/pixel/pixel-badge";

type StatusResponse = {
  gateway: "connected" | "disconnected" | "no-credentials";
  workspace: "ok" | "missing";
  workspacePath?: string;
};

async function fetchStatus(): Promise<StatusResponse> {
  const res = await fetch("/api/status");
  if (!res.ok) throw new Error("Failed to fetch status");
  return res.json() as Promise<StatusResponse>;
}

export function ConnectionStatus() {
  const { data, isError } = useQuery<StatusResponse>({
    queryKey: ["status"],
    queryFn: fetchStatus,
    refetchInterval: 10_000,
    staleTime: 5_000,
  });

  let dotColor: string;
  let label: string;

  if (isError && !data) {
    dotColor = "var(--color-status-error)";
    label = "FAULT";
  } else if (!data) {
    dotColor = "var(--color-status-standby)";
    label = "BOOTING";
  } else if (data.gateway === "connected" && data.workspace === "ok") {
    dotColor = "var(--color-status-active)";
    label = "ONLINE";
  } else if (data.gateway === "no-credentials") {
    dotColor = "var(--color-status-standby)";
    label = "NO TOKEN";
  } else if (data.gateway !== "connected" && data.workspace !== "ok") {
    dotColor = "var(--color-status-error)";
    label = "OFFLINE";
  } else if (data.gateway !== "connected") {
    dotColor = "var(--color-status-error)";
    label = "GW DOWN";
  } else {
    dotColor = "var(--color-status-error)";
    label = "NO WS";
  }

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2 py-1 bg-[#1a1612] text-[#f5e8d4]"
      style={{ boxShadow: "inset 0 0 0 1px #3d3530" }}
    >
      <PixelDot color={dotColor} size={6} />
      <span className="font-pixel text-[7px] uppercase tracking-widest leading-none">
        {label}
      </span>
    </div>
  );
}
