"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MoveForwardButtonProps {
  projectId: string;
}

type StatusResponse = {
  gateway: "connected" | "disconnected" | "no-credentials";
  workspace: "ok" | "missing";
  workspacePath?: string;
};

type AskResponse = { runId: string };

async function fetchStatus(): Promise<StatusResponse> {
  const res = await fetch("/api/status");
  if (!res.ok) throw new Error("Failed to fetch status");
  return res.json() as Promise<StatusResponse>;
}

async function askAlyvis(projectId: string): Promise<AskResponse> {
  const res = await fetch("/api/agents/alyvis/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, kind: "next-action" }),
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  return res.json() as Promise<AskResponse>;
}

const DEFAULT_LABEL = "What moves this forward today?";

/**
 * Renders the "What moves this forward today?" CTA. Becomes active when the
 * gateway reports connected, and POSTs to /api/agents/alyvis/ask to queue a
 * next-action run.
 */
export function MoveForwardButton({ projectId }: MoveForwardButtonProps) {
  const { data } = useQuery<StatusResponse>({
    queryKey: ["status"],
    queryFn: fetchStatus,
    refetchInterval: 10_000,
    staleTime: 5_000,
  });

  const connected = data?.gateway === "connected";
  const [transientLabel, setTransientLabel] = useState<string | null>(null);

  const mutation = useMutation<AskResponse, Error, void>({
    mutationFn: () => askAlyvis(projectId),
    onSuccess: () => {
      setTransientLabel("Asked Alyvis ✓");
    },
    onError: () => {
      setTransientLabel("Couldn't reach Alyvis");
    },
  });

  useEffect(() => {
    if (!transientLabel) return;
    const t = setTimeout(() => setTransientLabel(null), 3000);
    return () => clearTimeout(t);
  }, [transientLabel]);

  const isPending = mutation.isPending;
  const label = transientLabel
    ? transientLabel
    : isPending
      ? "Asking…"
      : DEFAULT_LABEL;

  if (!connected) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            render={
              <span className="inline-flex" tabIndex={0}>
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  data-project-id={projectId}
                >
                  {DEFAULT_LABEL}
                </Button>
              </span>
            }
          />
          <TooltipContent>Connect to OpenClaw to enable</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      data-project-id={projectId}
      onClick={() => mutation.mutate()}
    >
      {label}
    </Button>
  );
}
