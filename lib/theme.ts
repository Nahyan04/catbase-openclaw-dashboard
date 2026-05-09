// These hex values match the --color-agent-* tokens defined in app/globals.css

export type AgentId =
  | "alyvis"
  | "ohara"
  | "nyssa"
  | "sonic"
  | "picasso"
  | "dearDiary";

export const AGENT_ACCENTS: Record<AgentId, string> = {
  alyvis: "#9baabd",
  ohara: "#c4956a",
  nyssa: "#b8a0d4",
  sonic: "#f4a76a",
  picasso: "#f2a7b8",
  dearDiary: "#e8c97a",
};
