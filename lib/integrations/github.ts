import "server-only";

import { Octokit } from "@octokit/rest";
import { env } from "@/lib/env";

export type RepoActivity = {
  owner: string;
  repo: string;
  /** Commits authored in the last 7 days. */
  commitsLastWeek: number;
  openIssues: number;
  openPullRequests: number;
  /** ISO timestamp of the most recent commit, when available. */
  lastCommitAt?: string;
};

export type ActivityResult =
  | { skipped: "no-token" }
  | { ok: true; activity: RepoActivity }
  | { ok: false; error: string };

let cached: { token: string; client: Octokit } | null = null;

function getOctokit(): Octokit | null {
  const token = env.GITHUB_TOKEN;
  if (!token) return null;
  if (cached?.token === token) return cached.client;
  const client = new Octokit({ auth: token });
  cached = { token, client };
  return client;
}

function parseRepo(slug: string): { owner: string; repo: string } | null {
  const trimmed = slug.trim();
  const idx = trimmed.indexOf("/");
  if (idx <= 0 || idx === trimmed.length - 1) return null;
  const owner = trimmed.slice(0, idx);
  const repo = trimmed.slice(idx + 1);
  if (owner.includes("/") || repo.includes("/")) return null;
  return { owner, repo };
}

const ACTIVITY_TTL_MS = 5 * 60 * 1000;
type CacheEntry = { at: number; result: ActivityResult };
const activityCache = new Map<string, CacheEntry>();

/**
 * Fetch recent activity for a repo: commits in the last 7 days, open issue
 * count, open PR count. Cached in-memory for 5 minutes per slug.
 */
export async function getRepoActivity(input: {
  owner: string;
  repo: string;
}): Promise<ActivityResult>;
export async function getRepoActivity(slug: string): Promise<ActivityResult>;
export async function getRepoActivity(
  input: string | { owner: string; repo: string },
): Promise<ActivityResult> {
  const parsed =
    typeof input === "string" ? parseRepo(input) : input;
  if (!parsed) return { ok: false, error: "invalid repo slug" };

  const key = `${parsed.owner}/${parsed.repo}`;
  const hit = activityCache.get(key);
  if (hit && Date.now() - hit.at < ACTIVITY_TTL_MS) {
    return hit.result;
  }

  const client = getOctokit();
  if (!client) return { skipped: "no-token" };

  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [commitsRes, issuesAndPrs] = await Promise.all([
      client.repos.listCommits({
        owner: parsed.owner,
        repo: parsed.repo,
        since,
        per_page: 100,
      }),
      // search.issuesAndPullRequests counts both with one call apiece.
      Promise.all([
        client.search.issuesAndPullRequests({
          q: `repo:${parsed.owner}/${parsed.repo} is:issue is:open`,
          per_page: 1,
        }),
        client.search.issuesAndPullRequests({
          q: `repo:${parsed.owner}/${parsed.repo} is:pr is:open`,
          per_page: 1,
        }),
      ]),
    ]);

    const [issuesRes, prsRes] = issuesAndPrs;

    const commits = commitsRes.data;
    const lastCommitAt =
      commits[0]?.commit.author?.date ??
      commits[0]?.commit.committer?.date ??
      undefined;

    const result: ActivityResult = {
      ok: true,
      activity: {
        owner: parsed.owner,
        repo: parsed.repo,
        commitsLastWeek: commits.length,
        openIssues: issuesRes.data.total_count,
        openPullRequests: prsRes.data.total_count,
        lastCommitAt,
      },
    };

    activityCache.set(key, { at: Date.now(), result });
    return result;
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : String(err);
    const result: ActivityResult = { ok: false, error: errorMessage };
    activityCache.set(key, { at: Date.now(), result });
    return result;
  }
}
