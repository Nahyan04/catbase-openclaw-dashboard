import os from "node:os";
import path from "node:path";
import nodefs from "node:fs";
import nodefsPromises from "node:fs/promises";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("lib/workspace/fs", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = nodefs.mkdtempSync(path.join(os.tmpdir(), "catbase-test-"));
    vi.stubEnv("OPENCLAW_WORKSPACE", tmpDir);
    vi.stubEnv("OPENCLAW_GATEWAY_URL", "ws://127.0.0.1:18789");
    vi.resetModules();
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    vi.resetModules();
    // Remove tmp dir
    await nodefsPromises.rm(tmpDir, { recursive: true, force: true });
  });

  it("readFileSafe returns null for a missing file", async () => {
    const { readFileSafe } = await import("@/lib/workspace/fs");
    const result = await readFileSafe(path.join(tmpDir, "nonexistent.txt"));
    expect(result).toBeNull();
  });

  it("readDirSafe returns [] for a missing directory", async () => {
    const { readDirSafe } = await import("@/lib/workspace/fs");
    const result = await readDirSafe(path.join(tmpDir, "missing-dir"));
    expect(result).toEqual([]);
  });

  it("readFileSafe returns file content for a valid file", async () => {
    const filePath = path.join(tmpDir, "hello.txt");
    await nodefsPromises.writeFile(filePath, "hello world", "utf-8");

    const { readFileSafe } = await import("@/lib/workspace/fs");
    const result = await readFileSafe(filePath);
    expect(result).toBe("hello world");
  });

  it("readFileSafe throws WorkspaceBoundaryError for path traversal", async () => {
    const { readFileSafe, WorkspaceBoundaryError } = await import(
      "@/lib/workspace/fs"
    );
    // Construct a traversal path that resolves outside tmpDir
    const traversal = path.join(tmpDir, "..", "..", "etc", "passwd");
    await expect(readFileSafe(traversal)).rejects.toBeInstanceOf(
      WorkspaceBoundaryError,
    );
  });

  it("existsSafe returns true for a present file and false for an absent one", async () => {
    const presentPath = path.join(tmpDir, "present.txt");
    await nodefsPromises.writeFile(presentPath, "data", "utf-8");

    const { existsSafe } = await import("@/lib/workspace/fs");

    expect(await existsSafe(presentPath)).toBe(true);
    expect(await existsSafe(path.join(tmpDir, "absent.txt"))).toBe(false);
  });

  it("all three functions return failure values when OPENCLAW_WORKSPACE is empty", async () => {
    vi.stubEnv("OPENCLAW_WORKSPACE", "");
    vi.resetModules();

    const { readFileSafe, readDirSafe, existsSafe } = await import(
      "@/lib/workspace/fs"
    );

    // Use an absolute path that would normally be valid so we're certain
    // the guard — not a read error — causes the failure return.
    expect(await readFileSafe("/etc/hosts")).toBeNull();
    expect(await readDirSafe("/etc")).toEqual([]);
    expect(await existsSafe("/etc/hosts")).toBe(false);
  });
});
