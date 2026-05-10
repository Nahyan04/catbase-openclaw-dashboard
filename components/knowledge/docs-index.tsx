"use client";

import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DocViewer } from "./doc-viewer";
import type { DocEntry, DocsView } from "@/lib/docs/loader";
import { getAgent } from "@/lib/agents/registry";
import type { AgentId } from "@/lib/theme";

interface DocsIndexProps {
  view: DocsView;
  query: string;
}

function AuthorChip({ author }: { author?: string }) {
  if (!author) return null;
  const agent = getAgent(author as AgentId);
  if (agent) {
    return (
      <Badge
        className="border-transparent text-text-primary"
        style={{ backgroundColor: `${agent.accentColor}33` }}
      >
        <span
          className="h-2 w-2 rounded-full mr-1"
          style={{ backgroundColor: agent.accentColor }}
        />
        {agent.name}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-text-secondary">
      {author}
    </Badge>
  );
}

export function DocsIndex({ view, query }: DocsIndexProps) {
  const [selected, setSelected] = useState<DocEntry | null>(null);

  const trimmed = query.trim();

  const fuse = useMemo(
    () =>
      new Fuse(view.entries, {
        keys: ["title", "author", "tags"],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [view.entries],
  );

  const filtered = useMemo(() => {
    if (!trimmed) return view.entries;
    return fuse.search(trimmed).map((m) => m.item);
  }, [trimmed, fuse, view.entries]);

  const showEmpty = view.scaffoldNeeded || view.entries.length === 0;

  if (showEmpty) {
    return (
      <div className="rounded-xl border border-border-warm bg-bg-card p-8 text-center">
        <p className="text-sm text-text-secondary">
          No docs yet — Sonic and Picasso will populate this as they produce
          content.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        {filtered.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-6">
            No docs match &ldquo;{trimmed}&rdquo;.
          </p>
        ) : (
          filtered.map((doc) => (
            <Card
              key={doc.path}
              className="bg-bg-card hover:bg-bg-hover/50 transition-colors cursor-pointer"
            >
              <CardContent>
                <button
                  type="button"
                  onClick={() => setSelected(doc)}
                  className="w-full text-left flex flex-col gap-1.5"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-sm font-medium text-text-primary truncate">
                      {doc.title}
                    </h3>
                    {doc.date && (
                      <span className="text-xs text-text-muted shrink-0 tabular-nums">
                        {doc.date.slice(0, 10)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <AuthorChip author={doc.author} />
                    {doc.tags.map((t) => (
                      <Badge
                        key={t}
                        variant="outline"
                        className="text-text-secondary"
                      >
                        #{t}
                      </Badge>
                    ))}
                  </div>
                </button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <DocViewer
        open={selected !== null}
        doc={selected}
        onOpenChange={(next) => {
          if (!next) setSelected(null);
        }}
      />
    </>
  );
}
