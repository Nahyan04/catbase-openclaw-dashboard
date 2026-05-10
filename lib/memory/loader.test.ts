import os from "node:os";
import path from "node:path";
import nodefs from "node:fs";
import nodefsPromises from "node:fs/promises";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("lib/memory/loader", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = nodefs.mkdtempSync(path.join(os.tmpdir(), "catbase-memory-test-"));
    vi.stubEnv("OPENCLAW_WORKSPACE", tmpDir);
    vi.stubEnv("OPENCLAW_STUB", ""); // ensure stub mode is off so OPENCLAW_WORKSPACE is used
    vi.stubEnv("OPENCLAW_GATEWAY_URL", "ws://127.0.0.1:18789");
    vi.resetModules();
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    vi.resetModules();
    await nodefsPromises.rm(tmpDir, { recursive: true, force: true });
  });

  it("loads longTerm + two daily entries sorted DESC when both exist", async () => {
    // Write MEMORY.md
    await nodefsPromises.writeFile(
      path.join(tmpDir, "MEMORY.md"),
      "# Long-Term Memory\n\n- Some fact",
      "utf-8",
    );

    // Write memory/ dir with two files on the same day
    await nodefsPromises.mkdir(path.join(tmpDir, "memory"));
    await nodefsPromises.writeFile(
      path.join(tmpDir, "memory", "2026-05-09-0915.md"),
      "# 09:15 entry",
      "utf-8",
    );
    await nodefsPromises.writeFile(
      path.join(tmpDir, "memory", "2026-05-09-1306.md"),
      "# 13:06 entry",
      "utf-8",
    );

    const { listMemoryEntries } = await import("@/lib/memory/loader");
    const view = await listMemoryEntries();

    // longTerm should be populated
    expect(view.longTerm).not.toBeNull();
    expect(view.longTerm?.content).toContain("Long-Term Memory");
    expect(view.longTerm?.mtime).toBeTruthy();

    // One day group
    expect(view.days).toHaveLength(1);
    expect(view.days[0].date).toBe("2026-05-09");

    // Two entries, sorted DESC by time (13:06 first)
    expect(view.days[0].entries).toHaveLength(2);
    expect(view.days[0].entries[0].time).toBe("13:06");
    expect(view.days[0].entries[1].time).toBe("09:15");
  });

  it("returns days: [], longTerm: null when memory/ directory is missing", async () => {
    // No MEMORY.md, no memory/ dir
    const { listMemoryEntries } = await import("@/lib/memory/loader");
    const view = await listMemoryEntries();

    expect(view.longTerm).toBeNull();
    expect(view.days).toEqual([]);
  });

  it("ignores files in memory/ that do not match YYYY-MM-DD-HHMM.md pattern", async () => {
    // Write memory/ dir with a non-matching file
    await nodefsPromises.mkdir(path.join(tmpDir, "memory"));
    await nodefsPromises.writeFile(
      path.join(tmpDir, "memory", "notes.md"),
      "# Notes",
      "utf-8",
    );
    // Also add a valid file so we know filtering works selectively
    await nodefsPromises.writeFile(
      path.join(tmpDir, "memory", "2026-05-09-1000.md"),
      "# 10:00 entry",
      "utf-8",
    );

    const { listMemoryEntries } = await import("@/lib/memory/loader");
    const view = await listMemoryEntries();

    // Only the valid file should appear
    expect(view.days).toHaveLength(1);
    expect(view.days[0].entries).toHaveLength(1);
    expect(view.days[0].entries[0].filename).toBe("2026-05-09-1000.md");
  });
});
