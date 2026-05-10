"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  closestCenter,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TaskCard } from "./task-card";
import { NewTaskDialog } from "./new-task-dialog";
import type { TaskRow } from "@/lib/tasks/source";

interface TasksResponse {
  backlog: TaskRow[];
  in_progress: TaskRow[];
  done: TaskRow[];
  total: number;
}

const COLUMNS: { id: TaskRow["status"]; label: string }[] = [
  { id: "backlog", label: "Backlog" },
  { id: "in_progress", label: "In Progress" },
  { id: "done", label: "Done" },
];

interface KanbanColumnProps {
  id: TaskRow["status"];
  label: string;
  tasks: TaskRow[];
  showNewTask?: boolean;
}

function KanbanColumn({ id, label, tasks, showNewTask }: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div className="flex-1 min-w-0 flex flex-col gap-3">
      {/* Column header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
          {label}
          <span className="ml-2 text-text-muted font-normal normal-case tracking-normal">
            ({tasks.length})
          </span>
        </span>
        {showNewTask && <NewTaskDialog />}
      </div>

      {/* Droppable column body */}
      <div
        ref={setNodeRef}
        className={[
          "space-y-2 min-h-[200px] rounded-lg p-2 transition-colors",
          isOver
            ? "bg-accent-sage/10 ring-1 ring-accent-sage/30"
            : "bg-bg-sidebar/50",
        ].join(" ")}
      >
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        {tasks.length === 0 && (
          <p className="text-xs text-text-muted text-center pt-8">
            Drop tasks here
          </p>
        )}
      </div>
    </div>
  );
}

export function Kanban() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<TasksResponse>({
    queryKey: ["tasks"],
    queryFn: () => fetch("/api/tasks").then((r) => r.json()),
  });

  const mutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: TaskRow["status"];
    }) =>
      fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }).then((r) => r.json()),

    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previous = queryClient.getQueryData<TasksResponse>(["tasks"]);

      queryClient.setQueryData<TasksResponse>(["tasks"], (old) => {
        if (!old) return old;
        // Remove task from all columns, then insert into target
        let movedTask: TaskRow | undefined;
        const removeFrom = (arr: TaskRow[]) =>
          arr.filter((t) => {
            if (t.id === id) {
              movedTask = t;
              return false;
            }
            return true;
          });

        const next: TasksResponse = {
          backlog: removeFrom(old.backlog),
          in_progress: removeFrom(old.in_progress),
          done: removeFrom(old.done),
          total: old.total,
        };

        if (movedTask) {
          const updated = { ...movedTask, status };
          next[status] = [...next[status], updated];
        }

        return next;
      });

      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(["tasks"], ctx.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const draggedId = active.id as string;
    const targetStatus = over.id as TaskRow["status"];

    // Find which column the task is currently in
    const allStatuses: TaskRow["status"][] = ["backlog", "in_progress", "done"];
    let currentStatus: TaskRow["status"] | undefined;

    if (data) {
      for (const col of allStatuses) {
        if (data[col].some((t) => t.id === draggedId)) {
          currentStatus = col;
          break;
        }
      }
    }

    if (currentStatus && currentStatus !== targetStatus) {
      mutation.mutate({ id: draggedId, status: targetStatus });
    }
  }

  if (isLoading) {
    return (
      <div className="text-sm text-text-muted animate-pulse">
        Loading tasks…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-sm text-accent-pink">
        Failed to load tasks.
      </div>
    );
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex gap-4">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            label={col.label}
            tasks={data[col.id]}
            showNewTask={col.id === "backlog"}
          />
        ))}
      </div>
      <DragOverlay />
    </DndContext>
  );
}
