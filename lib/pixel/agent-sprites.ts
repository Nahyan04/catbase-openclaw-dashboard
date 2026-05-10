import type { AgentId } from "@/lib/theme";
import type { Palette } from "./pixel-map";
import {
  TABBY_STRIPES,
  TORTIE_PATCHES,
  GLASSES,
  COLLAR_LAVENDER,
  CALICO_PATCHES,
  PAINT_SMUDGE,
  COLOR_POINTS,
  TICKING,
  HEADSET,
} from "./cat-overlays";
import { TAIL_LONG, TAIL_BOB, EAR_ROUND, EAR_FOLDED, EAR_TUFTED } from "./cat-base";

export interface SpriteLayer {
  rows: string[];
  palette: Palette;
  className?: string;
}

export interface AgentSpriteConfig {
  basePalette: Palette;
  ears: SpriteLayer;
  tail?: SpriteLayer;
  overlays: SpriteLayer[];
  errorBubbleColor: string;
}

const OUTLINE = "#3d3530";
const NOSE_PINK = "#e8a0a0";

export const AGENT_SPRITES: Record<AgentId, AgentSpriteConfig> = {
  alyvis: {
    basePalette: {
      B: "#9baabd",
      S: "#7a8aa0",
      W: "#cdd8e4",
      K: OUTLINE,
      E: "#a8c5a0",
      P: NOSE_PINK,
    },
    ears: { rows: EAR_ROUND, palette: { B: "#9baabd", W: "#f2a7b8" } },
    tail: { rows: TAIL_LONG, palette: { B: "#9baabd", S: "#7a8aa0" } },
    overlays: [
      { rows: TABBY_STRIPES, palette: { T: "#6d7e94" } },
      { rows: HEADSET, palette: { H: "#3d3530", M: "#7ec8d4" } },
    ],
    errorBubbleColor: "#9baabd",
  },
  ohara: {
    basePalette: {
      B: "#c4956a",
      S: "#8a5a3a",
      W: "#e8d5b8",
      K: OUTLINE,
      E: "#5a3d2e",
      P: NOSE_PINK,
    },
    ears: { rows: EAR_FOLDED, palette: { B: "#c4956a", W: "#f2a7b8" } },
    tail: { rows: TAIL_LONG, palette: { B: "#c4956a", S: "#8a5a3a" } },
    overlays: [
      { rows: TORTIE_PATCHES, palette: { D: "#3d2218" } },
      { rows: GLASSES, palette: { G: "#3d3530" } },
    ],
    errorBubbleColor: "#c4956a",
  },
  nyssa: {
    basePalette: {
      B: "#2a2421",
      S: "#15110e",
      W: "#3d3530",
      K: "#000000",
      E: "#f4a76a",
      P: "#a06060",
    },
    ears: { rows: EAR_ROUND, palette: { B: "#2a2421", W: "#5a4540" } },
    tail: { rows: TAIL_LONG, palette: { B: "#2a2421", S: "#15110e" } },
    overlays: [{ rows: COLLAR_LAVENDER, palette: { C: "#b8a0d4", B: "#e8c97a" } }],
    errorBubbleColor: "#b8a0d4",
  },
  sonic: {
    basePalette: {
      B: "#f4a76a",
      S: "#b87a4a",
      W: "#fbcfa0",
      K: OUTLINE,
      E: "#e8c97a",
      P: NOSE_PINK,
    },
    ears: { rows: EAR_TUFTED, palette: { B: "#f4a76a", W: "#fbcfa0" } },
    tail: { rows: TAIL_LONG, palette: { B: "#f4a76a", S: "#b87a4a" } },
    overlays: [{ rows: TICKING, palette: { I: "#8a5a3a" } }],
    errorBubbleColor: "#f4a76a",
  },
  picasso: {
    basePalette: {
      B: "#f5ede0",
      S: "#d4ccc0",
      W: "#ffffff",
      K: OUTLINE,
      E: "#7a8aa0",
      P: NOSE_PINK,
    },
    ears: { rows: EAR_ROUND, palette: { B: "#f5ede0", W: "#f2a7b8" } },
    tail: { rows: TAIL_BOB, palette: { B: "#f5ede0" } },
    overlays: [
      { rows: CALICO_PATCHES, palette: { O: "#f4a76a", K: "#3d3530" } },
      { rows: PAINT_SMUDGE, palette: { M: "#f2a7b8" } },
    ],
    errorBubbleColor: "#f2a7b8",
  },
  "dear-diary": {
    basePalette: {
      B: "#f5ede0",
      S: "#d4ccc0",
      W: "#ffffff",
      K: OUTLINE,
      E: "#7ec8d4",
      P: NOSE_PINK,
    },
    ears: { rows: EAR_ROUND, palette: { B: "#b8a8a0", W: "#f2a7b8" } },
    tail: { rows: TAIL_LONG, palette: { B: "#f5ede0", S: "#b8a8a0" } },
    overlays: [{ rows: COLOR_POINTS, palette: { N: "#b8a8a0" } }],
    errorBubbleColor: "#7ec8d4",
  },
};
