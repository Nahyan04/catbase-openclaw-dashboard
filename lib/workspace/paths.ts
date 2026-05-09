import "server-only";
import path from "node:path";
import { env } from "@/lib/env";

const workspace = env.OPENCLAW_WORKSPACE;
const workspaceParent = workspace ? path.dirname(workspace) : "";

export const paths = {
  /** Absolute path of the workspace root (empty string when not configured). */
  workspace,

  /** <workspace>/memory */
  memoryDir: workspace ? path.join(workspace, "memory") : "",

  /** <workspace>/MEMORY.md */
  memoryRoot: workspace ? path.join(workspace, "MEMORY.md") : "",

  /** <workspace>/USER.md */
  userMd: workspace ? path.join(workspace, "USER.md") : "",

  /** <workspace>/AGENTS.md */
  agentsMd: workspace ? path.join(workspace, "AGENTS.md") : "",

  /** <workspace>/docs */
  docsDir: workspace ? path.join(workspace, "docs") : "",

  /** <workspace>/projects */
  projectsDir: workspace ? path.join(workspace, "projects") : "",

  /** <workspace>/finance */
  financeDir: workspace ? path.join(workspace, "finance") : "",

  /** <workspaceParent>/tasks/runs.sqlite — e.g. ~/.openclaw/tasks/runs.sqlite */
  tasksDb: workspaceParent
    ? path.join(workspaceParent, "tasks", "runs.sqlite")
    : "",

  /** <workspaceParent>/openclaw.json — e.g. ~/.openclaw/openclaw.json */
  gatewayConfig: workspaceParent
    ? path.join(workspaceParent, "openclaw.json")
    : "",
};
