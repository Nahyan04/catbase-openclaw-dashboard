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
          className="pixel-frame-tight flex items-center justify-center bg-[#3d3530] text-[#f5e8d4] font-pixel"
          style={{
            width: "56px",
            height: "56px",
            fontSize: "20px",
            ["--pixel-frame-color" as string]: accent,
          }}
        >
          {glyph}
        </div>
        <div>
          <h1
            className="font-pixel text-[20px] sm:text-[26px] uppercase tracking-[0.15em] leading-none text-text-primary"
            style={{ textShadow: `2px 2px 0 ${accent}66` }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="font-pixel-mono text-[14px] text-text-secondary mt-2 leading-snug">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </div>
  );
}
