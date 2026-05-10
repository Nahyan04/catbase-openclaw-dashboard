"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { DocEntry } from "@/lib/docs/loader";
import { getAgent } from "@/lib/agents/registry";
import type { AgentId } from "@/lib/theme";

interface DocViewerProps {
  open: boolean;
  doc: DocEntry | null;
  onOpenChange: (next: boolean) => void;
}

const PROSE_CLASSES =
  "text-sm text-text-primary leading-relaxed " +
  "[&_h1]:text-xl [&_h1]:font-medium [&_h1]:text-text-primary [&_h1]:mt-4 [&_h1]:mb-2 " +
  "[&_h2]:text-lg [&_h2]:font-medium [&_h2]:text-text-primary [&_h2]:mt-3 [&_h2]:mb-1.5 " +
  "[&_h3]:text-base [&_h3]:font-medium [&_h3]:text-text-primary [&_h3]:mt-3 [&_h3]:mb-1 " +
  "[&_p]:my-2 " +
  "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 " +
  "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 " +
  "[&_li]:my-0.5 " +
  "[&_a]:text-accent-cyan [&_a]:underline [&_a]:underline-offset-2 " +
  "[&_code]:bg-bg-hover [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono " +
  "[&_pre]:bg-bg-hover [&_pre]:p-3 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_pre]:my-2 " +
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0 " +
  "[&_blockquote]:border-l-2 [&_blockquote]:border-border-warm [&_blockquote]:pl-3 [&_blockquote]:text-text-secondary [&_blockquote]:my-2 " +
  "[&_table]:my-2 [&_th]:text-left [&_th]:font-medium [&_th]:px-2 [&_th]:py-1 [&_th]:border-b [&_th]:border-border-warm " +
  "[&_td]:px-2 [&_td]:py-1 [&_td]:border-b [&_td]:border-border-warm/50 " +
  "[&_hr]:my-3 [&_hr]:border-border-warm";

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

  const agent = doc?.author ? getAgent(doc.author as AgentId) : undefined;

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
                {agent ? (
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
                ) : doc.author ? (
                  <Badge variant="outline">{doc.author}</Badge>
                ) : null}
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
                <div className={PROSE_CLASSES}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
