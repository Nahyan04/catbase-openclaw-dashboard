import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { paths } from "./paths";

/**
 * Thrown when a caller passes a path that resolves outside the allowed roots
 * (the workspace directory or its parent). This is a programmer error, not a
 * runtime condition — the "never throw" contract of the safe wrappers does NOT
 * apply to this error.
 */
export class WorkspaceBoundaryError extends Error {
  constructor(resolvedPath: string) {
    super(
      `Path traversal detected: "${resolvedPath}" is outside the allowed workspace roots.`,
    );
    this.name = "WorkspaceBoundaryError";
  }
}

/**
 * Returns the list of allowed root prefixes derived from the current workspace
 * configuration. An empty array means workspace is not configured.
 */
function allowedRoots(): string[] {
  const roots: string[] = [];
  if (paths.workspace) {
    roots.push(paths.workspace);
    const parent = path.dirname(paths.workspace);
    if (parent && parent !== paths.workspace) {
      roots.push(parent);
    }
  }
  return roots;
}

/**
 * Asserts that `resolved` starts with one of the allowed roots. Throws
 * `WorkspaceBoundaryError` if not. Returns `false` when the workspace is not
 * configured (caller should short-circuit to their failure value).
 */
function assertAllowed(resolved: string): boolean {
  const roots = allowedRoots();
  if (roots.length === 0) {
    // Workspace not configured — no FS access is permitted.
    return false;
  }
  const allowed = roots.some(
    (root) => resolved === root || resolved.startsWith(root + path.sep),
  );
  if (!allowed) {
    throw new WorkspaceBoundaryError(resolved);
  }
  return true;
}

/**
 * Reads a file as UTF-8. Returns `null` on missing file or any read error.
 *
 * @throws {WorkspaceBoundaryError} if the resolved path is outside the allowed
 *   workspace roots (programmer error — must be caught explicitly if desired).
 */
export async function readFileSafe(filePath: string): Promise<string | null> {
  const resolved = path.resolve(filePath);
  const ok = assertAllowed(resolved);
  if (!ok) return null;
  try {
    return await fs.readFile(resolved, "utf-8");
  } catch {
    return null;
  }
}

/**
 * Lists directory entries. Returns `[]` on missing directory or any error.
 *
 * @throws {WorkspaceBoundaryError} if the resolved path is outside the allowed
 *   workspace roots (programmer error — must be caught explicitly if desired).
 */
export async function readDirSafe(dirPath: string): Promise<string[]> {
  const resolved = path.resolve(dirPath);
  const ok = assertAllowed(resolved);
  if (!ok) return [];
  try {
    return await fs.readdir(resolved);
  } catch {
    return [];
  }
}

/**
 * Checks whether a path exists (via `fs.access`). Returns `false` on missing
 * path or any error.
 *
 * @throws {WorkspaceBoundaryError} if the resolved path is outside the allowed
 *   workspace roots (programmer error — must be caught explicitly if desired).
 */
export async function existsSafe(filePath: string): Promise<boolean> {
  const resolved = path.resolve(filePath);
  const ok = assertAllowed(resolved);
  if (!ok) return false;
  try {
    await fs.access(resolved);
    return true;
  } catch {
    return false;
  }
}
