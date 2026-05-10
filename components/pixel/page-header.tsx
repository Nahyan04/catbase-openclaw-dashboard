import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  glyph?: string;
  accent?: string;
  right?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  glyph = "▣",
  accent = "#a8c5a0",
  right,
}: PageHeaderProps) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
      <div className="flex items-end gap-4">
        <div
          className="pixel-frame-tight flex items-center justify-center bg-[#3d3530] text-[#f5e8d4] font-pixel shrink-0"
          style={{
            width: "88px",
            height: "88px",
            fontSize: "36px",
            lineHeight: 1,
            ["--pixel-frame-color" as string]: accent,
          }}
        >
          {glyph}
        </div>
        <div className="pb-1">
          <h1
            className="font-pixel text-[26px] sm:text-[34px] uppercase tracking-[0.15em] leading-none text-text-primary"
            style={{ textShadow: `2px 2px 0 ${accent}66` }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="font-pixel-mono text-[14px] text-text-secondary mt-3 leading-snug">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </div>
  );
}
