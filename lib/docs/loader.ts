import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { paths } from "@/lib/workspace/paths";
import { existsSafe, readFileSafe } from "@/lib/workspace/fs";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DocEntry = {
  path: string;
  title: string;
  author?: string;
  tags: string[];
  date?: string;
  mtime: string;
};

export type DocsView = {
  entries: DocEntry[];
  scaffoldNeeded: boolean;
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Recursively walks `dir` for .md and .txt files.
 * Does not follow symlinks.
 * Returns absolute file paths.
 */
async function walkDocs(dir: string): Promise<string[]> {
  const dirents = await fs.readdir(dir, {
    recursive: true,
    withFileTypes: true,
  });

  const files: string[] = [];
  for (const entry of dirents) {
    if (entry.isSymbolicLink()) continue;
    if (!entry.isFile()) continue;
    if (!entry.name.endsWith(".md") && !entry.name.endsWith(".txt")) continue;
    files.push(path.join(entry.parentPath, entry.name));
  }
  return files;
}

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

// ---------------------------------------------------------------------------
// Main loader
// ---------------------------------------------------------------------------

export async function listDocEntries(): Promise<DocsView> {
  // If workspace not configured or docs dir doesn't exist → scaffoldNeeded
  if (!paths.docsDir) {
    return { entries: [], scaffoldNeeded: true };
  }

  const exists = await existsSafe(paths.docsDir);
  if (!exists) {
    return { entries: [], scaffoldNeeded: true };
  }

  const filePaths = await walkDocs(paths.docsDir);
  const entries: DocEntry[] = [];

  for (const filePath of filePaths) {
    const content = await readFileSafe(filePath);
    if (content === null) continue;

    const parsed = matter(content);
    const data = parsed.data as Record<string, unknown>;

    const basename = path.basename(filePath, path.extname(filePath));
    const title =
      typeof data.title === "string" && data.title ? data.title : basename;

    const author =
      typeof data.author === "string" && data.author ? data.author : undefined;

    const tags: string[] = Array.isArray(data.tags)
      ? (data.tags as unknown[])
          .filter((t): t is string => typeof t === "string")
      : [];

    const date =
      typeof data.date === "string" && data.date
        ? data.date
        : data.date instanceof Date
          ? (data.date as Date).toISOString()
          : undefined;

    const stat = await statSafe(filePath);
    const mtime = stat ? stat.mtime.toISOString() : new Date().toISOString();

    entries.push({ path: filePath, title, author, tags, date, mtime });
  }

  // Sort by date desc, falling back to mtime desc
  entries.sort((a, b) => {
    const aKey = a.date ?? a.mtime;
    const bKey = b.date ?? b.mtime;
    if (aKey < bKey) return 1;
    if (aKey > bKey) return -1;
    return 0;
  });

  return { entries, scaffoldNeeded: false };
}
