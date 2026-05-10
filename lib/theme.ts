// AgentId values are CSS-token suffixes — they double as Tailwind utility-class fragments (e.g. `bg-agent-${id}`). Hex values mirror --color-agent-* in app/globals.css.

export type AgentId =
  | "alyvis"
  | "ohara"
  | "nyssa"
  | "sonic"
  | "picasso"
  | "dear-diary";

export const AGENT_ACCENTS: Record<AgentId, string> = {
  alyvis: "#9baabd",
  ohara: "#c4956a",
  nyssa: "#b8a0d4",
  sonic: "#f4a76a",
  picasso: "#f2a7b8",
  "dear-diary": "#e8c97a",
};
