"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { MarkdownProse } from "@/components/ui/markdown-prose";

interface MemoryCardProps {
  /** Pinned variant for MEMORY.md — always expanded, distinct styling. */
  pinned?: boolean;
  title: string;
  /** Short label like "09:15" for daily entries; omitted for pinned. */
  time?: string;
  content: string;
  mtime?: string;
}

/** Returns the first non-empty, non-heading line of a markdown body — used as a one-line preview when collapsed. */
function firstLine(body: string): string {
  const lines = body.split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("#")) continue;
    return line.replace(/^[-*+]\s+/, "").slice(0, 140);
  }
  return "";
}

export function MemoryCard({
  pinned = false,
  title,
  time,
  content,
  mtime,
}: MemoryCardProps) {
  const [open, setOpen] = useState(pinned);
  const preview = firstLine(content);

  if (pinned) {
    return (
      <Card className="ring-1 ring-accent-sage/40 bg-bg-card">
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-accent-sage/20 text-text-primary border-transparent">
                Pinned
              </Badge>
              <h3 className="font-medium text-text-primary">{title}</h3>
            </div>
            {mtime && (
              <span className="text-xs text-text-muted">
                Updated {new Date(mtime).toLocaleDateString()}
              </span>
            )}
          </div>
          <MarkdownProse content={content} size="sm" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-bg-card hover:bg-bg-card/95 transition-colors">
      <CardContent className="py-1">
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger
            render={
              <button
                type="button"
                className="w-full text-left flex items-start gap-3 py-1 cursor-pointer"
              />
            }
          >
            {time && (
              <span className="font-mono text-xs text-text-secondary tabular-nums mt-0.5 shrink-0 w-12">
                {time}
              </span>
            )}
            <span
              className={[
                "flex-1 min-w-0 text-sm",
                open
                  ? "text-text-primary font-medium"
                  : "text-text-secondary truncate",
              ].join(" ")}
            >
              {open ? title : preview || title}
            </span>
            <span
              aria-hidden="true"
              className={[
                "text-text-muted text-xs mt-1 transition-transform shrink-0",
                open ? "rotate-90" : "",
              ].join(" ")}
            >
              ›
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <MarkdownProse
              content={content}
              size="sm"
              className="mt-2 pl-[3.75rem]"
            />
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
