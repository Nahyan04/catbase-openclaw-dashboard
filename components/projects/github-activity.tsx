"use client";

import { useEffect, useState } from "react";

type Activity = {
  owner: string;
  repo: string;
  commitsLastWeek: number;
  openIssues: number;
  openPullRequests: number;
  lastCommitAt?: string;
};

type Resp =
  | { ok: true; activity: Activity }
  | { ok: false; error: string }
  | { skipped: "no-token" };

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

export function GithubActivity({ slug }: { slug: string }) {
  const [state, setState] = useState<Resp | null>(null);

  useEffect(() => {
    let aborted = false;
    fetch(`/api/integrations/github/repo?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json() as Promise<Resp>)
      .then((data) => {
        if (!aborted) setState(data);
      })
      .catch(() => {
        if (!aborted) setState({ ok: false, error: "fetch failed" });
      });
    return () => {
      aborted = true;
    };
  }, [slug]);

  if (state === null) {
    return (
      <p className="text-xs text-text-muted font-mono">github: {slug} · …</p>
    );
  }

  if ("skipped" in state) {
    return (
      <p className="text-xs text-text-muted font-mono">
        github: {slug}{" "}
        <span className="text-text-muted">· connect GITHUB_TOKEN</span>
      </p>
    );
  }

  if (!state.ok) {
    return (
      <p className="text-xs text-text-muted font-mono">github: {slug}</p>
    );
  }

  const { commitsLastWeek, openIssues, openPullRequests } = state.activity;

  return (
    <p className="text-xs text-text-muted font-mono">
      github: {slug} ·{" "}
      <span className="text-text-secondary">
        {plural(commitsLastWeek, "commit")} this week,{" "}
        {plural(openIssues, "open issue")}
        {openPullRequests > 0
          ? `, ${plural(openPullRequests, "open PR")}`
          : ""}
      </span>
    </p>
  );
}
