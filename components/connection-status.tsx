"use client";

import { useQuery } from "@tanstack/react-query";

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
    label = "Status check failed";
  } else if (!data) {
    // Loading state — show neutral standby
    dotColor = "var(--color-status-standby)";
    label = "Connecting…";
  } else if (data.gateway === "connected" && data.workspace === "ok") {
    dotColor = "var(--color-status-active)";
    label = "Connected";
  } else if (data.gateway === "no-credentials") {
    dotColor = "var(--color-status-standby)";
    label = "No credentials";
  } else if (data.gateway !== "connected" && data.workspace !== "ok") {
    dotColor = "var(--color-status-error)";
    label = "Disconnected";
  } else if (data.gateway !== "connected") {
    dotColor = "var(--color-status-error)";
    label = "Gateway disconnected";
  } else {
    dotColor = "var(--color-status-error)";
    label = "Workspace missing";
  }

  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
      style={{ backgroundColor: "var(--color-bg-hover)" }}
    >
      <span
        className="inline-block w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: dotColor }}
      />
      <span
        className="font-mono leading-none"
        style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}
      >
        {label}
      </span>
    </div>
  );
}
