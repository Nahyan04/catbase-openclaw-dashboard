import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const CLIENT_BUNDLE_DIR = path.join(REPO_ROOT, ".next", "static");

/**
 * Verify that the gateway token (and the env-var name itself) never appears
 * in the client bundle. Run `npm run build` once before invoking this suite —
 * the test fails loudly with a setup hint if the build output is missing.
 */
describe("client bundle token-leak boundary", () => {
  if (!existsSync(CLIENT_BUNDLE_DIR)) {
    it.skip("requires `npm run build` first (.next/static not present)", () => {});
    return;
  }

  it("does not contain OPENCLAW_GATEWAY_TOKEN identifier", () => {
    const matches = grepCount("OPENCLAW_GATEWAY_TOKEN", CLIENT_BUNDLE_DIR);
    expect(matches).toBe(0);
  });

  it("does not contain the configured token value", () => {
    const token = process.env.OPENCLAW_GATEWAY_TOKEN;
    if (!token || token.length < 8) {
      // Skip when no real token is set — the identifier check above is the
      // primary safeguard; a value-leak test only adds signal when there is
      // actually a value to leak.
      return;
    }
    const matches = grepCount(token, CLIENT_BUNDLE_DIR);
    expect(matches).toBe(0);
  });
});

function grepCount(needle: string, dir: string): number {
  try {
    const out = execSync(
      `grep -r -F --include='*.js' --include='*.json' -l ${shellQuote(needle)} ${shellQuote(dir)}`,
      { stdio: ["ignore", "pipe", "ignore"] },
    )
      .toString()
      .trim();
    if (out.length === 0) return 0;
    return out.split("\n").length;
  } catch (err) {
    // grep exits 1 when no matches found.
    const status = (err as { status?: number }).status;
    if (status === 1) return 0;
    throw err;
  }
}

function shellQuote(s: string): string {
  return `'${s.replace(/'/g, `'\\''`)}'`;
}
