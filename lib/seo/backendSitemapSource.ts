import { buildApiUrl } from "@/lib/api-base";
import { normalizeCareerJobSlug } from "@/lib/career/slugSafety";
import { shouldIncludeInSitemap } from "@/lib/seo/indexingPolicy";

type BackendSitemapSourceItem = {
  loc?: unknown;
};

type BackendSitemapSourcePayload = {
  items?: BackendSitemapSourceItem[];
};

type CareerSeoAuthorityPayload = {
  meta?: {
    robots?: unknown;
  };
  seo_surface_v1?: {
    robots_policy?: unknown;
    indexability_state?: unknown;
    sitemap_state?: unknown;
    llms_exposure_state?: unknown;
  };
};

type BackendSitemapCareerJobPathOptions = {
  limit?: number;
  signal?: AbortSignal;
};

const BACKEND_SITEMAP_SOURCE_TIMEOUT_MS = 20_000;
const CAREER_SEO_AUTHORITY_CONCURRENCY = 8;
const SOFTWARE_DEVELOPERS_DETAIL_RE = /^\/(?:en|zh)\/career\/jobs\/software-developers$/i;
const CAREER_JOB_DETAIL_RE = /^\/(?:en|zh)\/career\/jobs\/[^/]+$/i;
const CAREER_JOB_DETAIL_PARTS_RE = /^\/(en|zh)\/career\/jobs\/([^/]+)$/i;
const BACKEND_SITEMAP_CANONICAL_HOSTS = new Set(["fermatmind.com", "www.fermatmind.com"]);

let careerJobPathCache: string[] | null = null;
const careerJobSeoAuthorityCache = new Map<string, Promise<CareerSeoAuthorityPayload | null>>();

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

  return (
    isCareerJobDetailPath(normalized) &&
    !SOFTWARE_DEVELOPERS_DETAIL_RE.test(normalized) &&
    shouldIncludeInSitemap(normalized, {
      indexEligible: true,
      indexState: "indexed",
    })
  );
}

function toSeoAuthorityApiLocale(locale: "en" | "zh"): string {
  return locale === "zh" ? "zh-CN" : "en-US";
}

function normalizeText(value: unknown): string {
  if (typeof value !== "string" && typeof value !== "number") {
    return "";
  }

  return String(value).trim();
}

function hasToken(value: unknown, token: string): boolean {
  return normalizeText(value)
    .toLowerCase()
    .split(",")
    .map((part) => part.trim())
    .includes(token);
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

async function fetchCareerJobSeoAuthority(
  locale: "en" | "zh",
  slug: string,
  signal?: AbortSignal
): Promise<CareerSeoAuthorityPayload | null> {
  const cacheKey = `${locale}:${slug}`;
  const shouldUseCache = !signal;

  if (shouldUseCache && careerJobSeoAuthorityCache.has(cacheKey)) {
    return careerJobSeoAuthorityCache.get(cacheKey) ?? null;
  }

  const promise = (async () => {
    const timeoutSignal = createTimeoutSignal(signal);

    try {
      const params = new URLSearchParams({
        locale: toSeoAuthorityApiLocale(locale),
        org_id: "0",
      });
      const response = await fetch(buildApiUrl(`/v0.5/career-jobs/${encodeURIComponent(slug)}/seo?${params.toString()}`), {
        headers: {
          Accept: "application/json",
        },
        signal: timeoutSignal.signal,
      });

      if (!response.ok) {
        return null;
      }

      return (await response.json()) as CareerSeoAuthorityPayload;
    } catch {
      return null;
    } finally {
      timeoutSignal.cleanup();
    }
  })();

  if (shouldUseCache) {
    careerJobSeoAuthorityCache.set(cacheKey, promise);
  }

  return promise;
}

function isCareerJobSeoAuthorityDiscoverable(payload: CareerSeoAuthorityPayload | null): boolean {
  if (!payload) {
    return false;
  }

  const surface = payload.seo_surface_v1;
  const robotsPolicy = normalizeText(surface?.robots_policy || payload.meta?.robots);
  const indexabilityState = normalizeText(surface?.indexability_state).toLowerCase();
  const sitemapState = normalizeText(surface?.sitemap_state).toLowerCase();
  const llmsExposureState = normalizeText(surface?.llms_exposure_state).toLowerCase();

  if (hasToken(robotsPolicy, "noindex")) {
    return false;
  }

  if (robotsPolicy && !hasToken(robotsPolicy, "index")) {
    return false;
  }

  if (indexabilityState && indexabilityState !== "indexable") {
    return false;
  }

  if (sitemapState && sitemapState !== "included") {
    return false;
  }

  if (llmsExposureState && llmsExposureState !== "allow") {
    return false;
  }

  return true;
}

async function filterCareerJobPathsBySeoAuthority(paths: string[], signal?: AbortSignal): Promise<string[]> {
  const results = new Array<string | null>(paths.length).fill(null);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < paths.length && !signal?.aborted) {
      const index = nextIndex;
      nextIndex += 1;
      const path = paths[index] ?? "";
      const parsed = parseCareerJobDetailPath(path);
      if (!parsed) {
        results[index] = null;
        continue;
      }

      const authority = await fetchCareerJobSeoAuthority(parsed.locale, parsed.slug, signal);
      results[index] = isCareerJobSeoAuthorityDiscoverable(authority) ? parsed.path : null;
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CAREER_SEO_AUTHORITY_CONCURRENCY, paths.length) }, () => worker())
  );

  return results.filter((path): path is string => Boolean(path)).sort((left, right) => left.localeCompare(right));
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
  const candidatePaths = limitCareerJobCandidatePaths(extractBackendSitemapCareerJobPaths(payload), options.limit);
  const filteredPaths = await filterCareerJobPathsBySeoAuthority(candidatePaths, options.signal);

  if (shouldUseCache) {
    careerJobPathCache = filteredPaths;
  }

  return filteredPaths;
}
