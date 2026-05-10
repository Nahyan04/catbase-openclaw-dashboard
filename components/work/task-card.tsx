"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { formatDistanceToNow } from "date-fns";
import { getAgent } from "@/lib/agents/registry";
import type { TaskRow } from "@/lib/tasks/source";

interface TaskCardProps {
  task: TaskRow;
}

const PRIORITY_COLORS: Record<TaskRow["priority"], string> = {
  low: "#a8c5a0",    // accent-sage
  normal: "#7ec8d4", // accent-cyan
  high: "#f2a7b8",   // accent-pink
};

const PRIORITY_LABELS: Record<TaskRow["priority"], string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
};

export function TaskCard({ task }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: task.id });

  const agent = getAgent(task.agentId);

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? "grabbing" : "grab",
  };

  const createdAt = (() => {
    try {
      return formatDistanceToNow(new Date(task.createdAt), { addSuffix: true });
    } catch {
      return "";
    }
  })();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-bg-card border border-border-warm rounded-lg p-3 shadow-sm hover:shadow-md hover:border-accent-sage/40 transition-all select-none"
    >
      {/* Title */}
      <p className="text-sm font-medium text-text-primary leading-snug mb-2">
        {task.title}
      </p>

      {/* Agent chip */}
      <div className="flex items-center gap-1.5 mb-2">
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: agent?.accentColor ?? "#b0a499" }}
        />
        <span className="text-xs text-text-secondary">
          {agent?.name ?? task.agentId}
        </span>
      </div>

      {/* Priority + timestamp */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
          />
          <span className="text-xs text-text-muted">
            {PRIORITY_LABELS[task.priority]}
          </span>
        </div>
        {createdAt && (
          <span className="text-xs text-text-muted">{createdAt}</span>
        )}
      </div>
    </div>
  );
}
