import type { CSSProperties } from "react";

export type Palette = Record<string, string>;

export interface PixelMapProps {
  rows: string[];
  palette: Palette;
  offsetX?: number;
  offsetY?: number;
  className?: string;
  style?: CSSProperties;
}

export function PixelMap({
  rows,
  palette,
  offsetX = 0,
  offsetY = 0,
  className,
  style,
}: PixelMapProps) {
  const cells: React.ReactNode[] = [];

  rows.forEach((row, y) => {
    let runStart = -1;
    let runColor = "";

    const flush = (endX: number) => {
      if (runStart >= 0 && runColor) {
        cells.push(
          <rect
            key={`${y}-${runStart}`}
            x={offsetX + runStart}
            y={offsetY + y}
            width={endX - runStart}
            height={1}
            fill={runColor}
          />,
        );
      }
      runStart = -1;
      runColor = "";
    };

    for (let x = 0; x < row.length; x += 1) {
      const char = row[x];
      const color = palette[char];
      if (!color) {
        flush(x);
        continue;
      }
      if (color !== runColor) {
        flush(x);
        runStart = x;
        runColor = color;
      }
    }
    flush(row.length);
  });

  return (
    <g className={className} style={style}>
      {cells}
    </g>
  );
}
