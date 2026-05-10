"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { KnowledgeSearch } from "./search";
import { MemoryTimeline } from "./memory-timeline";
import { DocsIndex } from "./docs-index";
import { useEventSource } from "@/lib/hooks/use-event-source";
import type { MemoryView } from "@/lib/memory/loader";
import type { DocsView } from "@/lib/docs/loader";

export function KnowledgeShell() {
  const [query, setQuery] = useState("");
  const queryClient = useQueryClient();

  const memoryQuery = useQuery<MemoryView>({
    queryKey: ["memory"],
    queryFn: () => fetch("/api/memory").then((r) => r.json()),
  });

  const docsQuery = useQuery<DocsView>({
    queryKey: ["docs"],
    queryFn: () => fetch("/api/docs").then((r) => r.json()),
  });

  // Refetch memory when the workspace watcher signals a change.
  const { lastEvent } = useEventSource("/api/events");

  useEffect(() => {
    if (!lastEvent) return;
    if (lastEvent.event === "workspace:memory:changed") {
      queryClient.invalidateQueries({ queryKey: ["memory"] });
    }
  }, [lastEvent, queryClient]);

  return (
    <div className="flex flex-col gap-4">
      <KnowledgeSearch value={query} onChange={setQuery} />

      <Tabs defaultValue="memory">
        <TabsList>
          <TabsTrigger value="memory">Memory</TabsTrigger>
          <TabsTrigger value="docs">Docs</TabsTrigger>
        </TabsList>

        <TabsContent value="memory" className="mt-4">
          {memoryQuery.isLoading ? (
            <p className="text-sm text-text-muted animate-pulse">
              Loading memory…
            </p>
          ) : memoryQuery.isError || !memoryQuery.data ? (
            <p className="text-sm text-accent-pink">
              Failed to load memory.
            </p>
          ) : (
            <MemoryTimeline view={memoryQuery.data} query={query} />
          )}
        </TabsContent>

        <TabsContent value="docs" className="mt-4">
          {docsQuery.isLoading ? (
            <p className="text-sm text-text-muted animate-pulse">
              Loading docs…
            </p>
          ) : docsQuery.isError || !docsQuery.data ? (
            <p className="text-sm text-accent-pink">Failed to load docs.</p>
          ) : (
            <DocsIndex view={docsQuery.data} query={query} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
