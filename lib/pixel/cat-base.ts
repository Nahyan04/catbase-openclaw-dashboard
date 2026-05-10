// Shared 24x24 front-sitting cat body. Per-agent files override palette and
// can swap ear style + drop in overlay layers (glasses, collar, smudge, etc).

export type EarStyle = "round" | "folded" | "tufted" | "small";

export const CAT_BODY_AWAKE: string[] = [
  //123456789012345678901234
  "........................", // 0
  "........................", // 1
  "........................", // 2  (ear slot — overlay paints here)
  "........................", // 3
  "........................", // 4
  "........................", // 5
  "..BBBBBBBBBBBBBBBBB.....", // 6  head crown
  ".BBBBBBBBBBBBBBBBBBB....", // 7
  ".BWWBBBBBBBBBBBBBBWWB...", // 8  cheek patches start
  "BBWWBKKBBBBBBBBKKBWWBB..", // 9  eyes
  "BBWWBKEKBBBBBBKEKBWWBB..", // 10 eye highlight
  ".BBBBKKBBBBBBBBKKBBBB...", // 11
  ".BBBBBBBBBPPBBBBBBBBB...", // 12 nose pink
  ".BBBBBBBBPPPBBBBBBBBB...", // 13
  "..BBBBBBBBSSSBBBBBBB....", // 14 mouth
  "..BBBBBBBBBBBBBBBBBB....", // 15
  "..BBBBBBBBBBBBBBBBBB....", // 16 chin/neck
  "..SBBBBBBBBBBBBBBBBS....", // 17 body sides shadow
  ".SBBBBBBBBBBBBBBBBBBS...", // 18 body widens
  ".SBBBBBBBBBBBBBBBBBBS...", // 19
  ".SBWWBBBBBBBBBBBBWWBS...", // 20 belly highlight
  ".SBPPBBBBBBBBBBBPPBBS...", // 21 paws
  ".SBBPPSBBBBBBBBSPPBBS...", // 22 paw pads
  "..SBBBSSSSSSSSSSBBBS....", // 23 floor contact
];

// Curled cat (idle pose) — viewed from the side, 24x24
export const CAT_BODY_SLEEP: string[] = [
  "........................",
  "........................",
  "........................",
  "........................",
  "........................",
  "........................",
  "........BBBB............",
  ".......BBWWBB...........",
  "......BBWBKBB...........",
  ".....BBBBBBBBB..........", // head curled
  "....BBBBBBBBBBBB........",
  "...BBSSSSSSSSSSSBB......",
  "..BSSSSSSSSSSSSSSSS.....", // body curl
  "..BSSSSSSSSSSSSSSSSB....",
  "..BBSSSSSSSSSSSSSSBB....",
  "...BBBSSSSSSSSSSBBB.....",
  "....BBBBBBBBBBBBB.......",
  "........................",
  "........................",
  "........................",
  "........................",
  "........................",
  "........................",
  "........................",
];

// Tail attached to right side of awake body, optional per-cat
export const TAIL_LONG: string[] = [
  "........................",
  "........................",
  "........................",
  "........................",
  "........................",
  "........................",
  "........................",
  "........................",
  "........................",
  "........................",
  "........................",
  "........................",
  "....................BB..", // 12
  "...................BSSB.", // 13
  "..................BSSSB.", // 14
  ".................BSSSB..", // 15
  "................BSSSB...", // 16
  "...............BSSSB....", // 17
  "..............BSSSB.....", // 18
  ".............BSSSB......", // 19
  "............BSSSB.......", // 20
  "...........BSSBB........", // 21
  "..........BSBB..........", // 22
  "........................", // 23
];

export const TAIL_BOB: string[] = [
  "........................",
  "........................",
  "........................",
  "........................",
  "........................",
  "........................",
  "........................",
  "........................",
  "........................",
  "........................",
  "........................",
  "........................",
  "........................",
  "........................",
  "........................",
  "........................",
  "........................",
  "........................",
  "........................",
  "....................BB..",
  "....................BB..",
  "....................B...",
  "........................",
  "........................",
];

// Ear overlays — paint into the rows 2-5 slot left empty by the base body.
// Every cat config sets one of these as its earOverride.

// Each ear overlay is a full 24x24 map with pixels in rows 2-5 only.
// W (highlight) renders behind the body's head edge — for inner ear pink.

export const EAR_ROUND: string[] = [
  "........................",
  "........................",
  "....BB........BB........",
  "...BWWB......BWWB.......",
  "...BWWB......BWWB.......",
  "..BBWWB......BWWBB......",
  "........................",
];

export const EAR_FOLDED: string[] = [
  "........................",
  "........................",
  "........................",
  "........................",
  "....BB........BB........",
  "...BWWB......BWWB.......",
  "........................",
];

export const EAR_TUFTED: string[] = [
  "........................",
  "........................",
  "....B...........B.......",
  "....BB........BB........",
  "...BBBB......BBBB.......",
  "..BBWWBB....BBWWBB......",
  "........................",
];
