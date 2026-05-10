import { fileURLToPath } from "url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: {
      // Replace the Next.js "server-only" guard with a no-op in test — vitest
      // runs in Node, not in the Next.js bundler, so the real package throws.
      "server-only": fileURLToPath(
        new URL("./test-utils/server-only-shim.ts", import.meta.url),
      ),
      // @openclaw/sdk is not yet published on npm. Point Vite's import-analysis
      // at a local shim so the specifier resolves at transform time. Individual
      // tests override this with vi.mock("@openclaw/sdk", ...) to control behaviour.
      "@openclaw/sdk": fileURLToPath(
        new URL("./test-utils/openclaw-sdk-shim.ts", import.meta.url),
      ),
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
});
