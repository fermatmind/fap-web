import { buildApiUrl } from "@/lib/api-base";
import { shouldIncludeInSitemap } from "@/lib/seo/indexingPolicy";

type BackendSitemapSourceItem = {
  loc?: unknown;
};

type BackendSitemapSourcePayload = {
  items?: BackendSitemapSourceItem[];
};

const BACKEND_SITEMAP_SOURCE_TIMEOUT_MS = 20_000;
const SOFTWARE_DEVELOPERS_DETAIL_RE = /^\/(?:en|zh)\/career\/jobs\/software-developers$/i;
const CAREER_JOB_DETAIL_RE = /^\/(?:en|zh)\/career\/jobs\/[^/]+$/i;

let careerJobPathCache: string[] | null = null;

function normalizePath(path: string): string {
  const value = String(path || "").trim() || "/";
  if (value === "/") return "/";
  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return withLeadingSlash.replace(/\/+$/, "");
}

function extractPathFromCanonicalUrl(value: unknown): string {
  const rawValue = String(value ?? "").trim();
  if (!rawValue) {
    return "";
  }

  try {
    const url = /^https?:\/\//i.test(rawValue)
      ? new URL(rawValue)
      : new URL(rawValue, "https://fermatmind.com");
    return normalizePath(url.pathname);
  } catch {
    return "";
  }
}

function isCareerJobDetailPath(path: string): boolean {
  return CAREER_JOB_DETAIL_RE.test(normalizePath(path));
}

function shouldKeepCareerJobDetailPath(path: string): boolean {
  const normalized = normalizePath(path);

  return (
    isCareerJobDetailPath(normalized) &&
    !SOFTWARE_DEVELOPERS_DETAIL_RE.test(normalized) &&
    shouldIncludeInSitemap(normalized, {
      indexEligible: true,
      indexState: "indexed",
    })
  );
}

async function fetchBackendSitemapSource(): Promise<BackendSitemapSourcePayload> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), BACKEND_SITEMAP_SOURCE_TIMEOUT_MS);

  try {
    const response = await fetch(buildApiUrl("/v0.5/seo/sitemap-source"), {
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch backend sitemap source: ${response.status}`);
    }

    return (await response.json()) as BackendSitemapSourcePayload;
  } finally {
    clearTimeout(timer);
  }
}

export function extractBackendSitemapCareerJobPaths(payload: BackendSitemapSourcePayload): string[] {
  const items = Array.isArray(payload.items) ? payload.items : [];
  const paths = new Set<string>();

  for (const item of items) {
    const path = extractPathFromCanonicalUrl(item?.loc);
    if (shouldKeepCareerJobDetailPath(path)) {
      paths.add(path);
    }
  }

  return [...paths].sort((left, right) => left.localeCompare(right));
}

export async function listBackendSitemapCareerJobPaths(): Promise<string[]> {
  if (careerJobPathCache) {
    return careerJobPathCache;
  }

  const payload = await fetchBackendSitemapSource();
  careerJobPathCache = extractBackendSitemapCareerJobPaths(payload);

  return careerJobPathCache;
}
