"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MarkdownProse } from "@/components/ui/markdown-prose";
import { AuthorChip } from "./author-chip";
import type { DocEntry } from "@/lib/docs/loader";

interface DocViewerProps {
  open: boolean;
  doc: DocEntry | null;
  onOpenChange: (next: boolean) => void;
}

export function DocViewer({ open, doc, onOpenChange }: DocViewerProps) {
  const docPath = doc?.path ?? null;

  const {
    data: content,
    isLoading,
    isError,
    error,
  } = useQuery<string, Error>({
    queryKey: ["doc-content", docPath],
    enabled: open && docPath !== null,
    queryFn: async () => {
      const res = await fetch(
        `/api/docs/content?path=${encodeURIComponent(docPath as string)}`,
      );
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as { content: string };
      return data.content;
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        {doc && (
          <>
            <DialogHeader>
              <DialogTitle className="text-text-primary">
                {doc.title}
              </DialogTitle>
              <div className="flex items-center gap-2 flex-wrap mt-1">
                <AuthorChip author={doc.author} />
                {doc.date && (
                  <span className="text-xs text-text-muted">
                    {doc.date.slice(0, 10)}
                  </span>
                )}
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
            </DialogHeader>

            <div className="mt-2">
              {isLoading && (
                <p className="text-sm text-text-muted animate-pulse">
                  Loading…
                </p>
              )}
              {isError && (
                <p className="text-sm text-accent-pink">
                  Failed to load: {error?.message ?? "unknown error"}
                </p>
              )}
              {!isLoading && !isError && content !== undefined && (
                <MarkdownProse content={content} size="md" />
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
