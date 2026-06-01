import { buildApiUrl } from "@/lib/api-base";
import { normalizeCareerJobSlug } from "@/lib/career/slugSafety";
import { shouldIncludeInSitemap } from "@/lib/seo/indexingPolicy";

type BackendSitemapSourceItem = {
  loc?: unknown;
};

type BackendSitemapSourcePayload = {
  items?: BackendSitemapSourceItem[];
};

type BackendSitemapCareerJobPathOptions = {
  limit?: number;
  signal?: AbortSignal;
};

const BACKEND_SITEMAP_SOURCE_TIMEOUT_MS = 20_000;
const CAREER_JOB_DETAIL_RE = /^\/(?:en|zh)\/career\/jobs\/[^/]+$/i;
const CAREER_JOB_DETAIL_PARTS_RE = /^\/(en|zh)\/career\/jobs\/([^/]+)$/i;
const BACKEND_SITEMAP_CANONICAL_HOSTS = new Set(["fermatmind.com", "www.fermatmind.com"]);
const EXCLUDED_CAREER_JOB_DETAIL_SLUGS = new Set([
  "software-developers",
  "digital-forensics-analysts",
  "computer-occupations-all-other",
]);

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
    const url = new URL(rawValue);
    const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
    if (url.protocol !== "https:" || !BACKEND_SITEMAP_CANONICAL_HOSTS.has(hostname)) {
      return "";
    }

    return normalizePath(url.pathname);
  } catch {
    return "";
  }
}

function isCareerJobDetailPath(path: string): boolean {
  return CAREER_JOB_DETAIL_RE.test(normalizePath(path));
}

function parseCareerJobDetailPath(path: string): { locale: "en" | "zh"; slug: string; path: string } | null {
  const normalized = normalizePath(path);
  const match = normalized.match(CAREER_JOB_DETAIL_PARTS_RE);
  const locale = match?.[1]?.toLowerCase();
  const slug = normalizeCareerJobSlug(match?.[2]);

  if ((locale !== "en" && locale !== "zh") || !slug) {
    return null;
  }

  return {
    locale,
    slug,
    path: normalized,
  };
}

function shouldKeepCareerJobDetailPath(path: string): boolean {
  const normalized = normalizePath(path);
  const parsed = parseCareerJobDetailPath(normalized);

  return (
    isCareerJobDetailPath(normalized) &&
    Boolean(parsed) &&
    !EXCLUDED_CAREER_JOB_DETAIL_SLUGS.has(parsed?.slug ?? "") &&
    shouldIncludeInSitemap(normalized, {
      indexEligible: true,
      indexState: "indexed",
    })
  );
}

function limitCareerJobCandidatePaths(paths: string[], limit: number | undefined): string[] {
  if (!Number.isFinite(limit)) {
    return paths;
  }

  const normalizedLimit = Math.floor(Number(limit));
  if (normalizedLimit <= 0) {
    return [];
  }

  return paths.slice(0, normalizedLimit);
}

function createTimeoutSignal(parentSignal: AbortSignal | undefined): { signal: AbortSignal; cleanup: () => void } {
  const controller = new AbortController();
  const abortFromParent = () => controller.abort();

  if (parentSignal?.aborted) {
    controller.abort();
  } else {
    parentSignal?.addEventListener("abort", abortFromParent, { once: true });
  }

  const timer = setTimeout(() => controller.abort(), BACKEND_SITEMAP_SOURCE_TIMEOUT_MS);

  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timer);
      parentSignal?.removeEventListener("abort", abortFromParent);
    },
  };
}

async function fetchBackendSitemapSource(signal?: AbortSignal): Promise<BackendSitemapSourcePayload> {
  const timeoutSignal = createTimeoutSignal(signal);

  try {
    const response = await fetch(buildApiUrl("/v0.5/seo/sitemap-source"), {
      headers: {
        Accept: "application/json",
      },
      signal: timeoutSignal.signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch backend sitemap source: ${response.status}`);
    }

    return (await response.json()) as BackendSitemapSourcePayload;
  } finally {
    timeoutSignal.cleanup();
  }
}

export function extractBackendSitemapCareerJobPaths(payload: BackendSitemapSourcePayload): string[] {
  const items = Array.isArray(payload.items) ? payload.items : [];
  const paths = new Set<string>();

  for (const item of items) {
    const path = extractPathFromCanonicalUrl(item?.loc);
    const parsed = parseCareerJobDetailPath(path);
    if (parsed && shouldKeepCareerJobDetailPath(parsed.path)) {
      paths.add(parsed.path);
    }
  }

  return [...paths].sort((left, right) => left.localeCompare(right));
}

export async function listBackendSitemapCareerJobPaths(
  options: BackendSitemapCareerJobPathOptions = {}
): Promise<string[]> {
  const shouldUseCache = options.limit === undefined && !options.signal;
  if (shouldUseCache && careerJobPathCache) {
    return careerJobPathCache;
  }

  const payload = await fetchBackendSitemapSource(options.signal);
  const filteredPaths = limitCareerJobCandidatePaths(extractBackendSitemapCareerJobPaths(payload), options.limit);

  if (shouldUseCache) {
    careerJobPathCache = filteredPaths;
  }

  return filteredPaths;
}
