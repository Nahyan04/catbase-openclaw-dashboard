"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProjectCard } from "./project-card";
import type { ProjectsView } from "@/lib/projects/loader";

async function fetchProjects(): Promise<ProjectsView> {
  const res = await fetch("/api/projects");
  if (!res.ok) {
    throw new Error(`Failed to load projects (${res.status})`);
  }
  return (await res.json()) as ProjectsView;
}

async function scaffoldProjects(): Promise<{ created: boolean; reason?: string }> {
  const res = await fetch("/api/projects/scaffold", { method: "POST" });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof body?.reason === "string" ? body.reason : "scaffold-failed",
    );
  }
  return body;
}

function EmptyState() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: scaffoldProjects,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  return (
    <Card className="bg-bg-card border-border-warm">
      <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <p className="text-text-primary font-medium">No projects yet</p>
        <Button
          variant="outline"
          size="sm"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? "Scaffolding…" : "Scaffold projects directory"}
        </Button>
        {mutation.isError ? (
          <p className="text-xs text-accent-pink">
            Could not scaffold — workspace may be unconfigured.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function ProjectsGrid() {
  const query = useQuery<ProjectsView>({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  if (query.isLoading) {
    return (
      <p className="text-sm text-text-muted animate-pulse">
        Loading projects…
      </p>
    );
  }

  if (query.isError || !query.data) {
    return (
      <p className="text-sm text-text-muted">Couldn&apos;t load projects.</p>
    );
  }

  const view = query.data;

  if (view.scaffoldNeeded || view.entries.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {view.entries.map((entry) => (
        <ProjectCard key={entry.slug} entry={entry} />
      ))}
    </div>
  );
}
