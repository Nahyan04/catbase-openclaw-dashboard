import type { CSSProperties, ReactNode } from "react";

interface PixelFrameProps {
  children: ReactNode;
  accent?: string;
  variant?: "default" | "tight" | "inset";
  fill?: string;
  className?: string;
  style?: CSSProperties;
  as?: "div" | "section" | "article" | "aside";
}

export function PixelFrame({
  children,
  accent,
  variant = "default",
  fill = "#ffffff",
  className,
  style,
  as: As = "div",
}: PixelFrameProps) {
  const cls = variant === "tight" ? "pixel-frame-tight" : variant === "inset" ? "pixel-inset" : "pixel-frame";

  const cssVars: CSSProperties = {
    backgroundColor: fill,
    ...(accent
      ? ({ ["--pixel-frame-color" as string]: accent } as CSSProperties)
      : null),
    ...style,
  };

  return (
    <As className={`${cls} ${className ?? ""}`} style={cssVars}>
      {children}
    </As>
  );
}
