import "server-only";
import { z } from "zod";

// Defence-in-depth: fail fast if someone accidentally marks the gateway token
// as a public env var — it must never reach the client bundle.
if (process.env.NEXT_PUBLIC_OPENCLAW_GATEWAY_TOKEN !== undefined) {
  throw new Error(
    "NEXT_PUBLIC_OPENCLAW_GATEWAY_TOKEN must never be defined — the gateway token is server-side only.",
  );
}

const schema = z.object({
  OPENCLAW_GATEWAY_URL: z.string().url(),
  OPENCLAW_GATEWAY_TOKEN: z.string().optional(),
  // empty string is the "not configured" sentinel; downstream FS code degrades to empty workspace
  OPENCLAW_WORKSPACE: z.string().min(0),
  // truthy values: "1". Empty/unset means stub mode is off. Used by lib/openclaw/client.ts (Task 1.6).
  OPENCLAW_STUB: z.string().optional(),
  DISCORD_WEBHOOK_URL: z.string().optional(),
  GOOGLE_CALENDAR_CREDENTIALS: z.string().optional(),
  GITHUB_TOKEN: z.string().optional(),
  TWITTER_API_KEY: z.string().optional(),
  TWITTER_LIST_ID: z.string().optional(),
  // Weekly USD spend that triggers the pink alert banner on the Finance screen.
  SPEND_ALERT_USD_PER_WEEK: z.coerce.number().positive().default(50),
});

// Provide sensible defaults so that `next dev` works without a .env file.
// Downstream code that reads OPENCLAW_WORKSPACE treats an empty string as
// "workspace not configured" and degrades gracefully with an empty-state UI.
const raw = {
  OPENCLAW_GATEWAY_URL:
    process.env.OPENCLAW_GATEWAY_URL ?? "ws://127.0.0.1:18789",
  OPENCLAW_GATEWAY_TOKEN: process.env.OPENCLAW_GATEWAY_TOKEN,
  OPENCLAW_WORKSPACE: process.env.OPENCLAW_WORKSPACE ?? "",
  OPENCLAW_STUB: process.env.OPENCLAW_STUB,
  DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL,
  GOOGLE_CALENDAR_CREDENTIALS: process.env.GOOGLE_CALENDAR_CREDENTIALS,
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  TWITTER_API_KEY: process.env.TWITTER_API_KEY,
  TWITTER_LIST_ID: process.env.TWITTER_LIST_ID,
  SPEND_ALERT_USD_PER_WEEK: process.env.SPEND_ALERT_USD_PER_WEEK ?? 50,
};

export const env = schema.parse(raw);
export type Env = z.infer<typeof schema>;
