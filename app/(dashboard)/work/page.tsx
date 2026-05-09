"use client";

import { Kanban } from "@/components/work/kanban";
import { Calendar } from "@/components/work/calendar";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

export default function WorkPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-text-primary">Work</h1>
      <Tabs defaultValue="kanban">
        <TabsList>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
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
