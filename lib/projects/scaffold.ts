import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { paths } from "@/lib/workspace/paths";

export type ScaffoldResult = {
  created: boolean;
  reason?:
    | "workspace-not-configured"
    | "outside-workspace"
    | "already-exists";
};

const EXAMPLE_FILE = "example.md";

const EXAMPLE_CONTENT = `---
title: Example Project
description: Replace this with what you're working on.
agents: [alyvis]
tasks: []
memories: []
docs: []
progress: 0
---

# Example Project

<!--
Project front-matter schema:
  title:       string (required)
  description: string (optional, one-line)
  agents:      list of agent ids — alyvis, ohara, nyssa, sonic, picasso, dear-diary
  tasks:       list of task IDs (e.g. "T-123") or globs (e.g. "glob:src/**")
  memories:    list of YYYY-MM-DD dates referencing memory log days
  docs:        list of doc paths (relative to workspace) — e.g. "docs/sonic/scan-2026-05-09.md"
  progress:    number 0..1 — manual or computed
  github:      "owner/repo" — repo activity to surface on the card (optional)
-->

What is this project trying to achieve? What does "done" look like?
`;

/**
 * Creates the projects directory and seeds an example.md file. Refuses to run
 * outside the configured workspace.
 */
export async function scaffoldProjects(): Promise<ScaffoldResult> {
  if (!paths.workspace || !paths.projectsDir) {
    return { created: false, reason: "workspace-not-configured" };
  }

  const workspace = path.resolve(paths.workspace);
  const projectsDir = path.resolve(paths.projectsDir);

  if (
    projectsDir !== workspace &&
    !projectsDir.startsWith(workspace + path.sep)
  ) {
    return { created: false, reason: "outside-workspace" };
  }

  // If directory exists with files, do nothing.
  try {
    const existing = await fs.readdir(projectsDir);
    if (existing.length > 0) {
      return { created: false, reason: "already-exists" };
    }
  } catch {
    // Directory does not exist — fall through to creation.
  }

  await fs.mkdir(projectsDir, { recursive: true });
  await fs.writeFile(
    path.join(projectsDir, EXAMPLE_FILE),
    EXAMPLE_CONTENT,
    "utf-8",
  );

  return { created: true };
}
