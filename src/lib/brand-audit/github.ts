import type { RepoContributor } from "./types";

// Minimal GitHub read client (no dep). Optional GITHUB_TOKEN raises the rate limit
// and reaches private ZAO repos. Never throws raw - returns a typed result.

const API = "https://api.github.com";

function headers(): HeadersInit {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

export interface RepoInfo {
  owner: string;
  name: string;
  url: string;
  defaultBranch: string;
  stars: number;
  description: string | null;
  contributors: RepoContributor[];
}

// Reject a path segment that could traverse the GitHub API path once
// interpolated into `${API}/repos/${owner}/${repo}`. `..` normalizes the URL to a
// different endpoint (reachable with the server's GITHUB_TOKEN), and a dot-only
// segment is never a real owner/repo.
function unsafeSegment(s: string): boolean {
  return s === "" || s.includes("..") || /^\.+$/.test(s);
}

export function parseRepoRef(input: string): { owner: string; repo: string } | null {
  const trimmed = input.trim();
  // accept "owner/repo" or a github URL
  const url = trimmed.match(/github\.com\/([^/]+)\/([^/#?]+)/i);
  if (url) {
    const owner = url[1];
    const repo = url[2].replace(/\.git$/, "");
    return unsafeSegment(owner) || unsafeSegment(repo) ? null : { owner, repo };
  }
  const slug = trimmed.match(/^([\w.-]+)\/([\w.-]+)$/);
  if (slug) {
    return unsafeSegment(slug[1]) || unsafeSegment(slug[2]) ? null : { owner: slug[1], repo: slug[2] };
  }
  return null;
}

export async function fetchRepo(owner: string, repo: string): Promise<RepoInfo> {
  const repoRes = await fetch(`${API}/repos/${owner}/${repo}`, {
    headers: headers(),
  });
  if (!repoRes.ok) {
    throw new Error(`GitHub repo fetch failed: ${repoRes.status}`);
  }
  const r = (await repoRes.json()) as {
    full_name: string;
    html_url: string;
    default_branch: string;
    stargazers_count: number;
    description: string | null;
  };

  // Top contributors (first page = up to 100, by contributions).
  const contribRes = await fetch(
    `${API}/repos/${owner}/${repo}/contributors?per_page=100`,
    { headers: headers() },
  );
  let contributors: RepoContributor[] = [];
  if (contribRes.ok) {
    const c = (await contribRes.json()) as {
      login: string;
      contributions: number;
      html_url: string;
    }[];
    contributors = c.map((x) => ({
      login: x.login,
      contributions: x.contributions,
      url: x.html_url,
    }));
  }

  return {
    owner,
    name: repo,
    url: r.html_url,
    defaultBranch: r.default_branch,
    stars: r.stargazers_count,
    description: r.description,
    contributors,
  };
}
