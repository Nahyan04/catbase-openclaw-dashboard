"use client";

import { Kanban } from "@/components/work/kanban";

export default function WorkPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-text-primary">Work</h1>
      <Kanban />
      {/* Calendar (Task 3.4) will be added as a tab or right-side panel */}
    </div>
  );
}
