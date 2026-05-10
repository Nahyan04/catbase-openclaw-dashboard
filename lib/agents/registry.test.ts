import { describe, it, expect } from "vitest";
import { AGENTS, getAgent } from "@/lib/agents/registry";
import { AGENT_ACCENTS } from "@/lib/theme";

describe("AGENTS registry", () => {
  it("has all 6 agents with unique ids", () => {
    expect(AGENTS).toHaveLength(6);
    const ids = AGENTS.map((a) => a.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(6);
  });

  it("each agent's accentColor matches AGENT_ACCENTS[id]", () => {
    for (const agent of AGENTS) {
      expect(agent.accentColor).toBe(AGENT_ACCENTS[agent.id]);
    }
  });

  it("Alyvis feedsInto contains every other agent id and only those", () => {
    const alyvis = getAgent("alyvis");
    expect(alyvis).toBeDefined();

    const otherIds = AGENTS.filter((a) => a.id !== "alyvis").map((a) => a.id);
    expect(alyvis!.feedsInto).toHaveLength(otherIds.length);
    expect(alyvis!.feedsInto.sort()).toEqual(otherIds.sort());
  });
});
