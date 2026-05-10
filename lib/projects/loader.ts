import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { paths } from "@/lib/workspace/paths";
import { existsSafe, readFileSafe } from "@/lib/workspace/fs";
import { AGENTS, type AgentId } from "@/lib/agents/registry";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ProjectEntry = {
  /** absolute file path */
  path: string;
  /** url-safe slug derived from filename without extension */
  slug: string;
  title: string;
  description?: string;
  /** agent IDs referenced in front-matter, validated against AGENTS registry; unknowns dropped silently */
  agents: AgentId[];
  /** raw task references — task IDs like "T-123" or "glob:src/foo/*" patterns; not resolved here */
  tasks: string[];
  /** dates (YYYY-MM-DD) referencing memory entries */
  memories: string[];
  /** absolute or workspace-relative doc paths */
  docs: string[];
  /** 0..1 (clamped) — undefined when not present */
  progress?: number;
  /** optional GitHub repo for Task 7.3 ("owner/repo" format) — extra field, fine to read now */
  github?: string;
  mtime: string;
};

export type ProjectsView = {
  entries: ProjectEntry[];
  scaffoldNeeded: boolean;
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const VALID_AGENT_IDS: ReadonlySet<string> = new Set(AGENTS.map((a) => a.id));

/**
 * Like fs.stat() but returns null on any error rather than throwing.
 */
async function statSafe(filePath: string): Promise<{ mtime: Date } | null> {
  try {
    return await fs.stat(filePath);
  } catch {
    return null;
  }
}

/**
 * Filter an unknown front-matter list into an array of strings.
 */
function toStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string" && v.length > 0);
}

/**
 * Parse a `progress` value that may be a number, a numeric string, or a
 * percentage string ("50%"). Returns a value clamped to [0, 1] or undefined.
 */
function parseProgress(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.min(1, Math.max(0, value));
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length === 0) return undefined;
    if (trimmed.endsWith("%")) {
      const n = Number(trimmed.slice(0, -1));
      if (Number.isFinite(n)) {
        return Math.min(1, Math.max(0, n / 100));
      }
      return undefined;
    }
    const n = Number(trimmed);
    if (Number.isFinite(n)) {
      return Math.min(1, Math.max(0, n));
    }
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Main loader
// ---------------------------------------------------------------------------

export async function listProjectEntries(): Promise<ProjectsView> {
  if (!paths.projectsDir) {
    return { entries: [], scaffoldNeeded: true };
  }

  const exists = await existsSafe(paths.projectsDir);
  if (!exists) {
    return { entries: [], scaffoldNeeded: true };
  }

  let filenames: string[];
  try {
    filenames = await fs.readdir(paths.projectsDir);
  } catch {
    return { entries: [], scaffoldNeeded: true };
  }

  const mdFiles = filenames.filter((f) => f.endsWith(".md"));
  const entries: ProjectEntry[] = [];

  for (const filename of mdFiles) {
    const filePath = path.join(paths.projectsDir, filename);
    const content = await readFileSafe(filePath);
    if (content === null) continue;

    let parsed: ReturnType<typeof matter>;
    try {
      parsed = matter(content);
    } catch {
      continue;
    }
    const data = parsed.data as Record<string, unknown>;

    const slug = path.basename(filename, ".md");
    const title =
      typeof data.title === "string" && data.title ? data.title : slug;

    const description =
      typeof data.description === "string" && data.description
        ? data.description
        : undefined;

    const agents = toStringList(data.agents).filter((a): a is AgentId =>
      VALID_AGENT_IDS.has(a),
    );

    const tasks = toStringList(data.tasks);
    const memories = toStringList(data.memories);
    const docs = toStringList(data.docs);

    const progress = parseProgress(data.progress);

    const github =
      typeof data.github === "string" && data.github ? data.github : undefined;

    const stat = await statSafe(filePath);
    const mtime = stat ? stat.mtime.toISOString() : new Date().toISOString();

    entries.push({
      path: filePath,
      slug,
      title,
      description,
      agents,
      tasks,
      memories,
      docs,
      progress,
      github,
      mtime,
    });
  }

  // Sort alphabetically by title (case-insensitive)
  entries.sort((a, b) =>
    a.title.toLowerCase().localeCompare(b.title.toLowerCase()),
  );

  return { entries, scaffoldNeeded: false };
}
