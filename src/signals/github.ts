import { config } from "../config.js";
import type { Decision } from "../decision.js";

// Is the latest run on the watched branch failing. One run, one verdict.
export async function githubDecision(): Promise<Decision | null> {
  const { owner, repo, branch } = config.github;
  const url = `https://api.github.com/repos/${owner}/${repo}/actions/runs?branch=${encodeURIComponent(branch)}&per_page=1`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "pulse-dashboard",
      Accept: "application/vnd.github+json",
    },
  });
  if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);

  const data = (await res.json()) as {
    workflow_runs?: Array<{ conclusion: string | null; html_url: string; name: string }>;
  };
  const latest = data.workflow_runs?.[0];
  if (!latest || latest.conclusion !== "failure") return null;

  return {
    action: "Fix deployment first.",
    reason: `"${latest.name}" is failing on ${branch}.`,
    priority: 100,
    url: latest.html_url,
  };
}
