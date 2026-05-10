import type { CSSProperties, ReactNode } from "react";

interface PixelBadgeProps {
  children: ReactNode;
  accent?: string;
  fill?: string;
  textColor?: string;
  className?: string;
}

export function PixelBadge({
  children,
  accent = "#3d3530",
  fill = "transparent",
  textColor,
  className,
}: PixelBadgeProps) {
  const style: CSSProperties = {
    backgroundColor: fill,
    color: textColor ?? accent,
    boxShadow: `inset 0 0 0 1.5px ${accent}, 2px 2px 0 0 ${accent}33`,
  };
  return (
    <span
      className={`font-pixel inline-flex items-center px-2 py-1 text-[8px] uppercase leading-none tracking-wider ${className ?? ""}`}
      style={style}
    >
      {children}
    </span>
  );
}

export function PixelDot({ color, size = 8 }: { color: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 4 4"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      className="pixel inline-block"
      aria-hidden="true"
    >
      <rect x={1} y={0} width={2} height={1} fill={color} />
      <rect x={0} y={1} width={4} height={2} fill={color} />
      <rect x={1} y={3} width={2} height={1} fill={color} />
    </svg>
  );
}
