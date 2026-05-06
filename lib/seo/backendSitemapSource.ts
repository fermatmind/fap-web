import { buildApiUrl } from "@/lib/api-base";
import { normalizeCareerJobSlug } from "@/lib/career/slugSafety";
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
const CAREER_JOB_DETAIL_PARTS_RE = /^\/(en|zh)\/career\/jobs\/([^/]+)$/i;
const BACKEND_SITEMAP_CANONICAL_HOSTS = new Set(["fermatmind.com", "www.fermatmind.com"]);

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
  const pathsBySlug = new Map<string, Partial<Record<"en" | "zh", string>>>();

  for (const item of items) {
    const path = extractPathFromCanonicalUrl(item?.loc);
    const parsed = parseCareerJobDetailPath(path);
    if (parsed && shouldKeepCareerJobDetailPath(parsed.path)) {
      pathsBySlug.set(parsed.slug, {
        ...pathsBySlug.get(parsed.slug),
        [parsed.locale]: parsed.path,
      });
    }
  }

  return [...pathsBySlug.values()]
    .filter((paths): paths is Record<"en" | "zh", string> => Boolean(paths.en && paths.zh))
    .flatMap((paths) => [paths.en, paths.zh])
    .sort((left, right) => left.localeCompare(right));
}

export async function listBackendSitemapCareerJobPaths(): Promise<string[]> {
  if (careerJobPathCache) {
    return careerJobPathCache;
  }

  const payload = await fetchBackendSitemapSource();
  careerJobPathCache = extractBackendSitemapCareerJobPaths(payload);

  return careerJobPathCache;
}
