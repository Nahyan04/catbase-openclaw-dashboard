import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { paths } from "@/lib/workspace/paths";
import { readFileSafe, readDirSafe } from "@/lib/workspace/fs";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MemoryEntry = {
  filename: string;
  time: string; // "HH:MM"
  content: string;
  mtime: string; // ISO string
};

export type MemoryDay = {
  date: string; // "YYYY-MM-DD"
  entries: MemoryEntry[];
};

export type MemoryView = {
  longTerm: { content: string; mtime: string } | null;
  days: MemoryDay[];
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Filename pattern: YYYY-MM-DD-HHMM.md */
const FILE_RE = /^(\d{4})-(\d{2})-(\d{2})-(\d{2})(\d{2})\.md$/;

/**
 * Like fs.stat() but returns null on any error rather than throwing.
 * Kept inline here — can be hoisted to lib/workspace/fs later if needed.
 */
async function statSafe(
  filePath: string,
): Promise<{ mtime: Date } | null> {
  try {
    return await fs.stat(filePath);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Main loader
// ---------------------------------------------------------------------------

export async function listMemoryEntries(): Promise<MemoryView> {
  // --- long-term memory (MEMORY.md) ---
  let longTerm: MemoryView["longTerm"] = null;
  if (paths.memoryRoot) {
    const content = await readFileSafe(paths.memoryRoot);
    if (content !== null) {
      const stat = await statSafe(paths.memoryRoot);
      longTerm = {
        content,
        mtime: stat ? stat.mtime.toISOString() : new Date().toISOString(),
      };
    }
  }

  // --- daily entries ---
  const days: MemoryDay[] = [];

  if (!paths.memoryDir) {
    return { longTerm, days };
  }

  const filenames = await readDirSafe(paths.memoryDir);
  const matchedFiles = filenames.filter((f) => FILE_RE.test(f));

  if (matchedFiles.length === 0) {
    return { longTerm, days };
  }

  // Map from date → entries
  const byDate = new Map<string, MemoryEntry[]>();

  for (const filename of matchedFiles) {
    const match = FILE_RE.exec(filename);
    if (!match) continue;

    const [, yyyy, mm, dd, hh, min] = match;
    const date = `${yyyy}-${mm}-${dd}`;
    const time = `${hh}:${min}`;
    const filePath = path.join(paths.memoryDir, filename);

    const content = await readFileSafe(filePath);
    if (content === null) continue;

    const stat = await statSafe(filePath);
    const mtime = stat ? stat.mtime.toISOString() : new Date().toISOString();

    const entry: MemoryEntry = { filename, time, content, mtime };

    const existing = byDate.get(date);
    if (existing) {
      existing.push(entry);
    } else {
      byDate.set(date, [entry]);
    }
  }

  // Build sorted days array
  for (const [date, entries] of byDate) {
    // Sort entries within day DESC by time
    entries.sort((a, b) => (a.time < b.time ? 1 : a.time > b.time ? -1 : 0));
    days.push({ date, entries });
  }

  // Sort days DESC
  days.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  return { longTerm, days };
}
