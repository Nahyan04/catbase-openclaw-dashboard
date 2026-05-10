"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

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

const PROSE_CLASSES =
  "text-sm text-text-primary leading-relaxed " +
  "[&_h1]:text-lg [&_h1]:font-medium [&_h1]:text-text-primary [&_h1]:mt-3 [&_h1]:mb-2 " +
  "[&_h2]:text-base [&_h2]:font-medium [&_h2]:text-text-primary [&_h2]:mt-3 [&_h2]:mb-1.5 " +
  "[&_h3]:text-sm [&_h3]:font-medium [&_h3]:text-text-primary [&_h3]:mt-2 [&_h3]:mb-1 " +
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
          <div className={PROSE_CLASSES}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
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
            <div className={`${PROSE_CLASSES} mt-2 pl-[3.75rem]`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
