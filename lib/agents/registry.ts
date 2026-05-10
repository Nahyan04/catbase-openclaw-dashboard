import { AGENT_ACCENTS, type AgentId } from "@/lib/theme";

export type SchedulePolicy = "ALWAYS-ON" | "SCHEDULED" | "ON-DEMAND";

export interface AgentInfo {
  id: AgentId;
  name: string;
  role: string;
  breed: string;
  accentColor: string;
  prop: string;
  defaultModel: string;
  schedule: string;
  schedulePolicy: SchedulePolicy;
  description: string;
  feedsInto: AgentId[];
}

export const AGENTS: AgentInfo[] = [
  {
    id: "alyvis",
    name: "Alyvis",
    role: "Chief of Staff",
    breed: "British Shorthair — grey tabby",
    accentColor: AGENT_ACCENTS.alyvis,
    prop: "tiny pixel computer (command-center workstation)",
    defaultModel: "claude-opus-4-7",
    schedule: "Always on",
    schedulePolicy: "ALWAYS-ON",
    description:
      "POC for the crew. Routes work, surfaces output from other agents, runs the daily plan, and fields ad-hoc requests.",
    feedsInto: ["ohara", "nyssa", "sonic", "picasso", "dear-diary"],
  },
  {
    id: "ohara",
    name: "Ohara",
    role: "Librarian",
    breed: "Scottish Fold — tortoiseshell w/ glasses",
    accentColor: AGENT_ACCENTS.ohara,
    prop: "bookshelf",
    defaultModel: "claude-sonnet-4-6",
    schedule: "On demand",
    schedulePolicy: "ON-DEMAND",
    description:
      "Owns long-term memory. Files daily memories into the workspace, surfaces what's been written before, answers 'have we seen this?' lookups.",
    feedsInto: ["alyvis"],
  },
  {
    id: "nyssa",
    name: "NYSSA",
    role: "Financial Advisor",
    breed: "Bombay — sleek black",
    accentColor: AGENT_ACCENTS.nyssa,
    prop: "calculator",
    defaultModel: "claude-sonnet-4-6",
    schedule: "Daily · 6am",
    schedulePolicy: "SCHEDULED",
    description:
      "Tracks token spend across the crew and the startup ledger. Alerts when weekly spend approaches the cap.",
    feedsInto: ["alyvis"],
  },
  {
    id: "sonic",
    name: "Sonic",
    role: "Researcher + News Scout",
    breed: "Abyssinian — ruddy brown",
    accentColor: AGENT_ACCENTS.sonic,
    prop: "telescope or newspaper stack",
    defaultModel: "claude-sonnet-4-6",
    schedule: "Daily · 7am SCAN, on-demand DEEP",
    schedulePolicy: "SCHEDULED",
    description:
      "Two modes — SCAN: morning Twitter/X digest into Knowledge. DEEP: assigned research briefs with credible-source rules.",
    feedsInto: ["alyvis", "picasso", "ohara"],
  },
  {
    id: "picasso",
    name: "Picasso",
    role: "Content Creator",
    breed: "Japanese Bobtail — calico",
    accentColor: AGENT_ACCENTS.picasso,
    prop: "paint easel",
    defaultModel: "claude-sonnet-4-6",
    schedule: "On demand",
    schedulePolicy: "ON-DEMAND",
    description:
      "Slides, image briefs, video scripts, deck mockups. Creative chaos energy.",
    feedsInto: ["alyvis"],
  },
  {
    id: "dear-diary",
    name: "Dear Diary",
    role: "Planner / Personal Assistant",
    breed: "Ragdoll — cream/blue-point",
    accentColor: AGENT_ACCENTS["dear-diary"],
    prop: "tiny planner",
    defaultModel: "claude-sonnet-4-6",
    schedule: "Daily · 8am",
    schedulePolicy: "SCHEDULED",
    description:
      "Calendar, meetings, itinerary, study planning. Gentle, organized; writes the day's plan.",
    feedsInto: ["alyvis"],
  },
];

const AGENTS_BY_ID: Record<string, AgentInfo> = Object.fromEntries(
  AGENTS.map((a) => [a.id, a]),
);

export function getAgent(id: string): AgentInfo | undefined {
  return AGENTS_BY_ID[id];
}

export type { AgentId };
