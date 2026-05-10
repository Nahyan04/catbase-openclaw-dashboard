import "server-only";

import { env } from "@/lib/env";

export type Tweet = {
  id: string;
  text: string;
  authorId?: string;
  authorHandle?: string;
  createdAt?: string;
  likes?: number;
  retweets?: number;
};

export type DigestResult =
  | { skipped: "no-credentials" }
  | { skipped: "no-list-id" }
  | { ok: true; tweets: Tweet[] }
  | { ok: false; error: string };

const API_BASE = "https://api.twitter.com/2";
const DEFAULT_LIMIT = 20;

type V2User = { id: string; username?: string };
type V2Metrics = { like_count?: number; retweet_count?: number };
type V2Tweet = {
  id: string;
  text: string;
  author_id?: string;
  created_at?: string;
  public_metrics?: V2Metrics;
};
type V2ListResponse = {
  data?: V2Tweet[];
  includes?: { users?: V2User[] };
};

/**
 * Pull the latest top-N tweets from the configured Twitter list.
 *
 * NOTE: When Sonic is running locally it writes its SCAN-mode digest to
 * `paths.docsDir/sonic/scan-YYYY-MM-DD.md` and the dashboard reads the
 * markdown directly — this adapter is only invoked when no such file exists.
 * See README → Integrations → Twitter/X for the divide of responsibilities.
 */
export async function getDailyDigest(opts?: {
  limit?: number;
}): Promise<DigestResult> {
  const token = env.TWITTER_API_KEY;
  if (!token) return { skipped: "no-credentials" };

  const listId = env.TWITTER_LIST_ID;
  if (!listId) return { skipped: "no-list-id" };

  const limit = Math.min(100, Math.max(1, opts?.limit ?? DEFAULT_LIMIT));

  try {
    const params = new URLSearchParams({
      max_results: String(limit),
      "tweet.fields": "created_at,public_metrics,author_id",
      expansions: "author_id",
      "user.fields": "username",
    });

    const res = await fetch(
      `${API_BASE}/lists/${encodeURIComponent(listId)}/tweets?${params}`,
      {
        headers: { authorization: `Bearer ${token}` },
        // Twitter API recommends ~10s timeout; Next 16 fetch supports cache: 'no-store'.
        cache: "no-store",
      },
    );

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return {
        ok: false,
        error: `twitter ${res.status}: ${body.slice(0, 200)}`,
      };
    }

    const json = (await res.json()) as V2ListResponse;
    const users = new Map(
      (json.includes?.users ?? []).map((u) => [u.id, u.username]),
    );

    const tweets: Tweet[] = (json.data ?? []).map((t) => ({
      id: t.id,
      text: t.text,
      authorId: t.author_id,
      authorHandle: t.author_id ? users.get(t.author_id) : undefined,
      createdAt: t.created_at,
      likes: t.public_metrics?.like_count,
      retweets: t.public_metrics?.retweet_count,
    }));

    // Rank: like_count + 2*retweet_count, descending. Stable for ties.
    const ranked = tweets
      .map((t, i) => ({
        t,
        i,
        score: (t.likes ?? 0) + 2 * (t.retweets ?? 0),
      }))
      .sort((a, b) => (b.score - a.score) || (a.i - b.i))
      .map((x) => x.t)
      .slice(0, limit);

    return { ok: true, tweets: ranked };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
