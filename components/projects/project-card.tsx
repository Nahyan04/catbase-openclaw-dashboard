"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthorChip } from "@/components/knowledge/author-chip";
import { MoveForwardButton } from "./move-forward-button";
import { GithubActivity } from "./github-activity";
import type { ProjectEntry } from "@/lib/projects/loader";

interface ProjectCardProps {
  entry: ProjectEntry;
}

function ProgressBar({ value }: { value: number }) {
  const pct = Math.min(1, Math.max(0, value));
  return (
    <div className="h-1.5 w-full rounded-full bg-bg-hover overflow-hidden">
      <div
        className="h-full bg-accent-sage"
        style={{ width: `${pct * 100}%` }}
      />
    </div>
  );
}

export function ProjectCard({ entry }: ProjectCardProps) {
  const tasksCount = entry.tasks.length;
  const memoriesCount = entry.memories.length;
  const docsCount = entry.docs.length;

  return (
    <Card className="bg-bg-card border-border-warm">
      <CardHeader>
        <CardTitle className="text-text-primary">{entry.title}</CardTitle>
        {entry.description ? (
          <p className="text-sm text-text-secondary line-clamp-1">
            {entry.description}
          </p>
        ) : null}
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {entry.progress !== undefined ? (
          <ProgressBar value={entry.progress} />
        ) : null}

        {entry.agents.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {entry.agents.map((agentId) => (
              <AuthorChip key={agentId} author={agentId} />
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
          <Link
            href={`/work?project=${encodeURIComponent(entry.slug)}`}
            className="hover:text-text-primary hover:underline underline-offset-2"
          >
            {tasksCount} tasks
          </Link>
          <Link
            href={`/knowledge?project=${encodeURIComponent(
              entry.slug,
            )}&tab=memory`}
            className="hover:text-text-primary hover:underline underline-offset-2"
          >
            {memoriesCount} memories
          </Link>
          <Link
            href={`/knowledge?project=${encodeURIComponent(
              entry.slug,
            )}&tab=docs`}
            className="hover:text-text-primary hover:underline underline-offset-2"
          >
            {docsCount} docs
          </Link>
        </div>

        {entry.github ? <GithubActivity slug={entry.github} /> : null}

        <div className="pt-1">
          <MoveForwardButton projectId={entry.slug} />
        </div>
      </CardContent>
    </Card>
  );
}
