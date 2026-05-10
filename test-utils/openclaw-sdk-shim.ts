/**
 * Shim for "@openclaw/sdk" — the package is not yet published on npm.
 * In test environments this file is aliased by vitest.config.ts so that
 * Vite's import-analysis step can resolve the specifier.
 * Individual tests override this with vi.mock("@openclaw/sdk", ...) to
 * supply the desired behaviour.
 */
export class OpenClaw {
  constructor(_opts: { url: string; token: string }) {}
  async connect() {}
  async disconnect() {}
  agents = { list: async () => [] };
  sessions = { list: async () => [] };
  runs = {
    list: async () => [],
    create: async () => ({}),
    update: async () => ({}),
  };
  artifacts = { list: async () => [] };
  events() {
    return { [Symbol.asyncIterator]: () => ({ next: async () => ({ done: true as const, value: undefined }) }) };
  }
}
