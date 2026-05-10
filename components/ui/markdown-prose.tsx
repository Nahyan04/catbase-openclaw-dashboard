"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownProseProps {
  content: string;
  /** "sm" tunes heading sizes for compact contexts (memory cards); "md" is for full doc viewers. */
  size?: "sm" | "md";
  className?: string;
}

const SHARED =
  "text-sm text-text-primary leading-relaxed " +
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

const HEADINGS_SM =
  "[&_h1]:text-lg [&_h1]:font-medium [&_h1]:text-text-primary [&_h1]:mt-3 [&_h1]:mb-2 " +
  "[&_h2]:text-base [&_h2]:font-medium [&_h2]:text-text-primary [&_h2]:mt-3 [&_h2]:mb-1.5 " +
  "[&_h3]:text-sm [&_h3]:font-medium [&_h3]:text-text-primary [&_h3]:mt-2 [&_h3]:mb-1";

const HEADINGS_MD =
  "[&_h1]:text-xl [&_h1]:font-medium [&_h1]:text-text-primary [&_h1]:mt-4 [&_h1]:mb-2 " +
  "[&_h2]:text-lg [&_h2]:font-medium [&_h2]:text-text-primary [&_h2]:mt-3 [&_h2]:mb-1.5 " +
  "[&_h3]:text-base [&_h3]:font-medium [&_h3]:text-text-primary [&_h3]:mt-3 [&_h3]:mb-1";

export function MarkdownProse({
  content,
  size = "md",
  className,
}: MarkdownProseProps) {
  const headings = size === "sm" ? HEADINGS_SM : HEADINGS_MD;
  const classes = [SHARED, headings, className].filter(Boolean).join(" ");
  return (
    <div className={classes}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
