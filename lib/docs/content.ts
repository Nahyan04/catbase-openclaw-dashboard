import "server-only";
import path from "node:path";
import { paths } from "@/lib/workspace/paths";
import { readFileSafe } from "@/lib/workspace/fs";

/**
 * Result of a {@link readDocContent} call.
 *
 * - `ok: true` — file was read successfully; `content` holds the UTF-8 body.
 * - `ok: false` — failure with a discriminating `reason`:
 *   - `"not-configured"` — no docs directory is configured (workspace missing).
 *   - `"invalid-path"` — the requested path resolved outside `docsDir`
 *     (path-traversal attempt or absolute path to a different location).
 *   - `"not-found"` — the file does not exist or could not be read.
 */
export type DocContentResult =
  | { ok: true; content: string; absolutePath: string }
  | { ok: false; reason: "not-configured" | "invalid-path" | "not-found" };

/**
 * Reads a doc by relative path under the configured docs directory.
 *
 * Path-traversal guard: the supplied path is resolved against `paths.docsDir`
 * and the resulting absolute path is required to be either equal to `docsDir`
 * itself (rejected) or a descendant prefixed by `docsDir + sep`. Any attempt
 * to escape (e.g. `..`, absolute paths to other dirs) returns `invalid-path`.
 *
 * Accepts either a relative path (preferred — e.g. `"sub/foo.md"`) or an
 * absolute path that already lies inside `docsDir` (the loader emits these
 * as `DocEntry.path`).
 */
export async function readDocContent(
  requestedPath: string,
): Promise<DocContentResult> {
  if (!paths.docsDir) {
    return { ok: false, reason: "not-configured" };
  }

  if (!requestedPath || typeof requestedPath !== "string") {
    return { ok: false, reason: "invalid-path" };
  }

  // Resolve relative paths against docsDir; absolute paths stay as-is.
  const candidate = path.isAbsolute(requestedPath)
    ? requestedPath
    : path.join(paths.docsDir, requestedPath);
  const resolved = path.resolve(candidate);

  // Require strict descendant of docsDir.
  const docsDirResolved = path.resolve(paths.docsDir);
  const inside =
    resolved === docsDirResolved ||
    resolved.startsWith(docsDirResolved + path.sep);
  if (!inside) {
    return { ok: false, reason: "invalid-path" };
  }
  if (resolved === docsDirResolved) {
    // Don't return a directory.
    return { ok: false, reason: "invalid-path" };
  }

  const content = await readFileSafe(resolved);
  if (content === null) {
    return { ok: false, reason: "not-found" };
  }

  return { ok: true, content, absolutePath: resolved };
}
