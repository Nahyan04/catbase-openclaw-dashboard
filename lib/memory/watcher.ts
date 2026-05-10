import "server-only";
import { EventEmitter } from "node:events";
import path from "node:path";
import { paths } from "@/lib/workspace/paths";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MemoryEvent = {
  event: string;
  data: { path: string; kind: "memory" };
  at: string; // ISO string
};

// ---------------------------------------------------------------------------
// Module-level state (lazy)
// ---------------------------------------------------------------------------

const emitter = new EventEmitter();
emitter.setMaxListeners(100);

let watcherStarted = false;

/**
 * Lazily initialise the chokidar watcher. Called on first subscribe.
 * Safe to call multiple times — the guard ensures only one watcher is created.
 */
async function ensureWatcher(): Promise<void> {
  if (watcherStarted) return;
  if (!paths.memoryDir) return; // workspace not configured — nothing to watch

  watcherStarted = true;

  // Dynamic import keeps chokidar out of module-load in build/test contexts.
  const chokidar = await import("chokidar");

  // Watch the daily memory directory.
  const watchPaths: string[] = [paths.memoryDir];

  // Also watch the parent directory for the long-term MEMORY.md file so we
  // catch changes to it. We filter the events below to only emit for the
  // MEMORY.md file or files inside memoryDir.
  if (paths.memoryRoot) {
    const memoryRootParent = path.dirname(paths.memoryRoot);
    if (memoryRootParent && !watchPaths.includes(memoryRootParent)) {
      watchPaths.push(memoryRootParent);
    }
  }

  const watcher = chokidar.watch(watchPaths, {
    ignoreInitial: true,
    persistent: false,
    depth: 0, // only the directories themselves, not subdirectories
  });

  const emit = (filePath: string) => {
    // Only emit for files we care about.
    const isMemoryDir = filePath.startsWith(paths.memoryDir + path.sep) || filePath === paths.memoryDir;
    const isMemoryRoot = paths.memoryRoot && filePath === paths.memoryRoot;
    if (!isMemoryDir && !isMemoryRoot) return;

    emitter.emit("memory", {
      event: "workspace:memory:changed",
      data: { path: filePath, kind: "memory" as const },
      at: new Date().toISOString(),
    } satisfies MemoryEvent);
  };

  watcher.on("add", emit);
  watcher.on("change", emit);
  watcher.on("unlink", emit);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns an async iterable that yields `MemoryEvent` objects whenever a
 * memory file changes. The iterable runs indefinitely; drop the reference or
 * call `return()` on the iterator to stop.
 *
 * When `paths.memoryDir` is empty (workspace not configured), yields nothing
 * and ends immediately.
 */
export async function* subscribeMemoryEvents(): AsyncGenerator<MemoryEvent> {
  if (!paths.memoryDir) {
    // Workspace not configured — yield nothing.
    return;
  }

  await ensureWatcher();

  const queue: MemoryEvent[] = [];
  let notify: (() => void) | null = null;

  const handler = (ev: MemoryEvent) => {
    queue.push(ev);
    notify?.();
    notify = null;
  };

  emitter.on("memory", handler);

  try {
    while (true) {
      // Drain everything currently in the queue.
      while (queue.length > 0) {
        yield queue.shift()!;
      }
      // Wait for the next event.
      await new Promise<void>((resolve) => {
        notify = resolve;
      });
    }
  } finally {
    emitter.off("memory", handler);
  }
}
