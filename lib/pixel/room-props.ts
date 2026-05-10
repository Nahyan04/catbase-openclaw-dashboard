// Pixel decor props rendered inside agent rooms. Each prop is a small pixel
// map with its own palette. Coordinates are local to the prop's own viewBox;
// callers pass offsetX/offsetY when composing into a room scene.

// ----------- shared cat-life props (room decoration) -----------

export const CAT_BED: string[] = [
  "................",
  "................",
  "...BBBBBBBBBB...",
  "..BCCCCCCCCCCB..",
  ".BCWWWWWWWWWWCB.",
  ".BCWWWWWWWWWWCB.",
  "..BCCCCCCCCCCB..",
  "...BBBBBBBBBB...",
];

export const CAT_BED_PALETTE = {
  B: "#3d3530",
  C: "#c4956a",
  W: "#f5e8d4",
};

export const FOOD_BOWL: string[] = [
  "............",
  "............",
  ".BBBBBBBBBB.",
  "BFFFFFFFFFFB",
  "BFFFFFFFFFFB",
  ".BBBBBBBBBB.",
];

export const FOOD_BOWL_PALETTE = {
  B: "#3d3530",
  F: "#d4a868",
};

export const SCRATCH_POST: string[] = [
  "...BBBB...",
  "..BWWWWB..",
  "..BWWWWB..",
  "..BWWWWB..",
  "...BBBB...",
  ".....B....",
  ".....B....",
  ".....B....",
  "...BBBBB..",
  "..BBBBBBB.",
];

export const SCRATCH_POST_PALETTE = {
  B: "#5a3d2e",
  W: "#c4956a",
};

export const YARN_BALL: string[] = [
  "...BBBB...",
  "..BYYYYB..",
  ".BYYsYYsB.",
  ".BYsYYsYB.",
  ".BYYYYYYB.",
  "..BYYYYB..",
  "...BBBB...",
];

export const YARN_BALL_PALETTE = {
  B: "#3d3530",
  Y: "#f2a7b8",
  s: "#c97e90",
};

export const FISH_TOY: string[] = [
  "................",
  "................",
  "....BBBB....BB..",
  "...BCCCCB..BCCB.",
  "..BCCCCCCB.BCCB.",
  "...BCCCCB..BCB..",
  "....BBBB....BB..",
];

export const FISH_TOY_PALETTE = {
  B: "#3d3530",
  C: "#7ec8d4",
};

export const PAW_PRINT: string[] = [
  ".PP.PP.",
  ".PP.PP.",
  ".......",
  "..PPP..",
  ".PPPPP.",
  ".PPPPP.",
];

export const PAW_PRINT_PALETTE = {
  P: "#3d35304d",
};

// ----------- per-agent role props -----------

export const BOOKSHELF: string[] = [
  "BBBBBBBBBBBBBBBB",
  "BRRRBGGGBYYYBBBB",
  "BRRRBGGGBYYYBBBB",
  "BRRRBGGGBYYYBBBB",
  "BBBBBBBBBBBBBBBB",
  "BMMMBPPPBBBBBOOO",
  "BMMMBPPPBBBBBOOO",
  "BMMMBPPPBBBBBOOO",
  "BBBBBBBBBBBBBBBB",
  "BCCCBNNNBVVVBTTT",
  "BCCCBNNNBVVVBTTT",
  "BCCCBNNNBVVVBTTT",
  "BBBBBBBBBBBBBBBB",
];

export const BOOKSHELF_PALETTE = {
  B: "#5a3d2e",
  R: "#c54a4a",
  G: "#7a9a5a",
  Y: "#e8c97a",
  M: "#9a5a8a",
  P: "#7a8aa0",
  O: "#f4a76a",
  C: "#7ec8d4",
  N: "#3d3530",
  V: "#c97a4a",
  T: "#a8c5a0",
};

export const CALCULATOR: string[] = [
  "BBBBBBBBBBB",
  "BCCCCCCCCCB",
  "BCKKKKKKKCB",
  "BCK0K0K0KCB",
  "BCKKKKKKKCB",
  "BCK0K0K0KCB",
  "BCKKKKKKKCB",
  "BBBBBBBBBBB",
];

export const CALCULATOR_PALETTE = {
  B: "#3d3530",
  C: "#b8a0d4",
  K: "#1a1612",
  "0": "#7ec8d4",
};

export const COIN_STACK: string[] = [
  "..........",
  "..GGGGGG..",
  ".GgGGGGgG.",
  "..GGGGGG..",
  ".GgGGGGgG.",
  "..GGGGGG..",
  ".GgGGGGgG.",
  "..GGGGGG..",
];

export const COIN_STACK_PALETTE = {
  G: "#e8c97a",
  g: "#b89856",
};

export const TELESCOPE: string[] = [
  ".....BBBB",
  "....BCCCB",
  "...BCCCB.",
  "..BCCCB..",
  ".BCCCB...",
  "BBBBB....",
  "..BB.....",
  ".BBBB....",
  "BBBBBB...",
];

export const TELESCOPE_PALETTE = {
  B: "#3d3530",
  C: "#7a8aa0",
};

export const NEWSPAPER: string[] = [
  "BBBBBBBBBB",
  "BWWWWWWWWB",
  "BWLLLLWLLB",
  "BWWWWWWWWB",
  "BWLLWLLLLB",
  "BWWWWWWWWB",
  "BWLLLLLLWB",
  "BBBBBBBBBB",
];

export const NEWSPAPER_PALETTE = {
  B: "#3d3530",
  W: "#f5ede0",
  L: "#8c7e72",
};

export const EASEL: string[] = [
  "..BBBBBBBBBBBB.",
  "..BWWWWWWWWWWB.",
  "..BWORRRWWWWWB.",
  "..BWORRRWWLBWB.",
  "..BWWWWWWLBLWB.",
  "..BWWPPWWWBLWB.",
  "..BWWPPWWWWWWB.",
  "..BBBBBBBBBBBB.",
  "...B.B....B.B..",
  "...B.B....B.B..",
  "...B.B....B.B..",
  "..BB.BB..BB.BB.",
];

export const EASEL_PALETTE = {
  B: "#5a3d2e",
  W: "#f5ede0",
  O: "#f4a76a",
  R: "#c54a4a",
  P: "#a8c5a0",
  L: "#7ec8d4",
};

export const PAINT_PALETTE: string[] = [
  ".BBBBBBBB.",
  "BWWWWWWWWB",
  "BWRWGWBWWB",
  "BWWWWWWWWB",
  "BWWWWWWWWB",
  ".BBBBBBBB.",
];

export const PAINT_PALETTE_PALETTE = {
  B: "#5a3d2e",
  W: "#f5ede0",
  R: "#c54a4a",
  G: "#7a9a5a",
  B2: "#7a8aa0",
};

export const PLANNER: string[] = [
  "BBBBBBBBBBBBBBB",
  "BWWWWWWWWWWWWWB",
  "BWPPPPPPPPPPPWB",
  "BWPLLLLLLLLLPWB",
  "BWPLLLLLLLLLPWB",
  "BWPLLLLLLLLLPWB",
  "BWWWWWWWWWWWWWB",
  "BWLLLLLLLLLLLWB",
  "BWLLLLLLLLLLLWB",
  "BBBBBBBBBBBBBBB",
];

export const PLANNER_PALETTE = {
  B: "#5a3d2e",
  W: "#f5ede0",
  P: "#e8c97a",
  L: "#8c7e72",
};

export const PENCIL: string[] = [
  "..........YYYR",
  ".........YYYYR",
  "BBBBBBBBBYYYYR",
  "BBBBBBBBBYYYYR",
  ".........YYYYR",
  "..........YYYR",
];

export const PENCIL_PALETTE = {
  B: "#e8c97a",
  Y: "#3d3530",
  R: "#c54a4a",
};

// Pixel monitor — used for Alyvis's command desk + as a generic "screen" decor
export const MONITOR: string[] = [
  "BBBBBBBBBBBBBBBB",
  "BSSSSSSSSSSSSSSB",
  "BSGGGGGGGGGGGGSB",
  "BSGCCCCCCCCCCGSB",
  "BSGCKKKCKKCKCGSB",
  "BSGCCCCCCCCCCGSB",
  "BSGCKKCKKKCKKGSB",
  "BSGCCCCCCCCCCGSB",
  "BSGGGGGGGGGGGGSB",
  "BSSSSSSSSSSSSSSB",
  "BBBBBBBBBBBBBBBB",
  "....BBBBBBBB....",
  "...BBBBBBBBBB...",
];

export const MONITOR_PALETTE = {
  B: "#3d3530",
  S: "#15110e",
  G: "#7ec8d4",
  C: "#0a1a2a",
  K: "#a8c5a0",
};

export const ROUTER: string[] = [
  "..BBBBBB..",
  ".BCCCCCCB.",
  "BCCKCCKCCB",
  "BCCKCCKCCB",
  ".BCCCCCCB.",
  ".B.A..A.B.",
];

export const ROUTER_PALETTE = {
  B: "#3d3530",
  C: "#9baabd",
  K: "#7ec8d4",
  A: "#5a4a40",
};

// shelves with stacked items
export const PAPER_STACK: string[] = [
  ".BBBBBBBBB.",
  "BWWWWWWWWWB",
  "BBBBBBBBBBB",
  "BWWWWWWWWWB",
  "BBBBBBBBBBB",
  "BWWWWWWWWWB",
  "BBBBBBBBBBB",
];

export const PAPER_STACK_PALETTE = {
  B: "#3d3530",
  W: "#f5ede0",
};

// generic small plant in a pot
export const PLANT: string[] = [
  ".....GG.....",
  "....GGGG....",
  "...GGGGGG...",
  "..GGGGGGGG..",
  "...GGGGGG...",
  "....GGGG....",
  ".....BB.....",
  "....BBBB....",
  "...BBBBBB...",
  "....BBBB....",
];

export const PLANT_PALETTE = {
  G: "#7a9a5a",
  B: "#8a5a3a",
};

// window with curtains showing pixel night sky / day sky
export const WINDOW_DAY: string[] = [
  "BBBBBBBBBBBBBBBB",
  "BCCCCCCCCCCCCCCB",
  "BCSSSSSSSSSSSSCB",
  "BCSSSSCCCSSSSSCB",
  "BCSSCCCCCCCSSSCB",
  "BCSCCCCCCCCCSSCB",
  "BCSSSSSSSSSSSSCB",
  "BCSSSSSSSSSSSSCB",
  "BBBBBBBBBBBBBBBB",
];

export const WINDOW_DAY_PALETTE = {
  B: "#5a3d2e",
  C: "#7ec8d4",
  S: "#cde8ee",
};

export const WINDOW_NIGHT: string[] = [
  "BBBBBBBBBBBBBBBB",
  "BCCCCCCCCCCCCCCB",
  "BCNNN.NNNNNN.NCB",
  "BCN.NNNN.NNNNNCB",
  "BCNN.MMM..NNNNCB",
  "BCNNNMMMNNN.NNCB",
  "BCNN.NNNNNN.NNCB",
  "BCNNNNN.NNNNNNCB",
  "BBBBBBBBBBBBBBBB",
];

export const WINDOW_NIGHT_PALETTE = {
  B: "#5a3d2e",
  C: "#1a2438",
  N: "#1a2438",
  M: "#e8c97a",
};
