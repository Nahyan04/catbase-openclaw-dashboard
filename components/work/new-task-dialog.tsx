"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AGENTS } from "@/lib/agents/registry";
import type { AgentId } from "@/lib/agents/registry";

export function NewTaskDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [agentId, setAgentId] = useState<AgentId>(AGENTS[0].id);
  const [priority, setPriority] = useState<"low" | "normal" | "high">("normal");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), agentId, priority }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error ?? "Failed to create task");
      }
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setTitle("");
      setAgentId(AGENTS[0].id);
      setPriority("normal");
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => setOpen(nextOpen)}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="sm">
            + Task
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Title */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="task-title"
              className="text-xs font-medium text-text-secondary uppercase tracking-wide"
            >
              Title
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              required
              placeholder="What needs to be done?"
              className="rounded-md border border-border-warm bg-bg-card px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-cyan/50"
            />
          </div>

          {/* Agent */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="task-agent"
              className="text-xs font-medium text-text-secondary uppercase tracking-wide"
            >
              Agent
            </label>
            <select
              id="task-agent"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value as AgentId)}
              className="rounded-md border border-border-warm bg-bg-card px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-cyan/50"
            >
              {AGENTS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} — {a.role}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
              Priority
            </span>
            <div className="flex items-center gap-4">
              {(["low", "normal", "high"] as const).map((p) => (
                <label
                  key={p}
                  className="flex items-center gap-1.5 text-sm text-text-primary cursor-pointer"
                >
                  <input
                    type="radio"
                    name="priority"
                    value={p}
                    checked={priority === p}
                    onChange={() => setPriority(p)}
                    className="accent-[#7ec8d4]"
                  />
                  <span className="capitalize">{p}</span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs text-accent-pink">{error}</p>
          )}

          <DialogFooter>
            <Button
              type="submit"
              variant="default"
              disabled={submitting}
            >
              {submitting ? "Adding…" : "Add Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
