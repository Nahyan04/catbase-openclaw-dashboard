"use client";

import { Kanban } from "@/components/work/kanban";
import { Calendar } from "@/components/work/calendar";
import { PageHeader } from "@/components/pixel/page-header";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

export default function WorkPage() {
  return (
    <div className="px-6 sm:px-8 py-8">
      <PageHeader
        title="Work"
        subtitle="// kanban board + scheduled tasks across the crew"
        glyph="▤"
        accent="#7ec8d4"
      />
      <Tabs defaultValue="kanban" className="gap-4">
        <TabsList className="bg-bg-card pixel-frame-tight" style={{ ["--pixel-frame-color" as string]: "#3d3530" }}>
          <TabsTrigger value="kanban" className="font-pixel text-[9px] uppercase tracking-wider">Kanban</TabsTrigger>
          <TabsTrigger value="calendar" className="font-pixel text-[9px] uppercase tracking-wider">Calendar</TabsTrigger>
        </TabsList>
        <TabsContent value="kanban">
          <Kanban />
        </TabsContent>
        <TabsContent value="calendar">
          <Calendar />
        </TabsContent>
      </Tabs>
    </div>
  );
}
