import { buildApiUrl } from "@/lib/api-base";
import { normalizeCareerJobSlug } from "@/lib/career/slugSafety";
import { shouldIncludeInSitemap } from "@/lib/seo/indexingPolicy";
import {
  clearMbtiAuthorityLastKnownGood,
  readMbtiAuthorityLastKnownGood,
  writeMbtiAuthorityLastKnownGood,
} from "@/lib/seo/backendSitemapMbtiAuthorityCache";
import { BIG_FIVE_PUBLIC_ROUTE_ENTRIES } from "@/lib/personality/bigFivePublicRoutes";

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
const BIG_FIVE_PUBLIC_ASSET_RE = /^\/(en|zh)\/personality\/big-five(?:\/(.+))?$/i;
const ENNEAGRAM_PUBLIC_ASSET_RE =
  /^\/(?:en|zh)\/personality\/enneagram(?:\/(?:type-[1-9]|centers\/(?:gut|heart|head)|wings\/(?:1w9|1w2|2w1|2w3|3w2|3w4|4w3|4w5|5w4|5w6|6w5|6w7|7w6|7w8|8w7|8w9|9w8|9w1)|type-[1-9]\/instincts\/(?:self-preservation|social|one-to-one)))?$/i;
const MBTI_PERSONALITY_DETAIL_RE = /^\/(?:en|zh)\/personality\/([a-z]{4})-([at])$/i;
const MBTI_PERSONALITY_AT_COMPARISON_RE = /^\/(?:en|zh)\/personality\/([a-z]{4})-a-vs-([a-z]{4})-t$/i;
const MBTI_PERSONALITY_CROSS_TYPE_COMPARISON_RE = /^\/(?:en|zh)\/personality\/([a-z]{4})-vs-([a-z]{4})$/i;
const MBTI_BASE_TYPES = new Set([
  "intj", "intp", "entj", "entp", "infj", "infp", "enfj", "enfp",
  "istj", "isfj", "estj", "esfj", "istp", "isfp", "estp", "esfp",
]);
const BACKEND_SITEMAP_CANONICAL_HOSTS = new Set(["fermatmind.com", "www.fermatmind.com"]);
const EXCLUDED_CAREER_JOB_DETAIL_SLUGS = new Set([
  "software-developers",
  "digital-forensics-analysts",
  "computer-occupations-all-other",
]);

let careerJobPathCache: string[] | null = null;
let bigFivePublicAssetPathCache: string[] | null = null;
let enneagramPublicAssetPathCache: string[] | null = null;

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
    if (url.protocol !== "https:" || !BACKEND_SITEMAP_CANONICAL_HOSTS.has(hostname) || url.search || url.hash) {
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

const BIG_FIVE_CANONICAL_ROUTE_SLUGS = new Set(BIG_FIVE_PUBLIC_ROUTE_ENTRIES.map((entry) => entry.routeSlug));
const BIG_FIVE_EXPECTED_CANONICAL_PATHS = new Set(BIG_FIVE_PUBLIC_ROUTE_ENTRIES.flatMap((entry) => [
  `/en/personality/big-five${entry.pathSuffix}`,
  `/zh/personality/big-five${entry.pathSuffix}`,
]));

function shouldKeepBigFivePublicAssetPath(path: string): boolean {
  const normalized = normalizePath(path);
  const match = normalized.match(BIG_FIVE_PUBLIC_ASSET_RE);
  const locale = match?.[1]?.toLowerCase();
  const routeSlug = (match?.[2] ?? "").toLowerCase();

  return (
    (locale === "en" || locale === "zh") &&
    BIG_FIVE_CANONICAL_ROUTE_SLUGS.has(routeSlug) &&
    shouldIncludeInSitemap(normalized, {
      indexEligible: true,
      indexState: "indexed",
    })
  );
}

function shouldKeepEnneagramPublicAssetPath(path: string): boolean {
  const normalized = normalizePath(path);

  return (
    ENNEAGRAM_PUBLIC_ASSET_RE.test(normalized) &&
    shouldIncludeInSitemap(normalized, {
      indexEligible: true,
      indexState: "indexed",
    })
  );
}

function shouldKeepMbtiPersonalityPath(path: string): boolean {
  const normalized = normalizePath(path);
  const detail = normalized.match(MBTI_PERSONALITY_DETAIL_RE);
  const atComparison = normalized.match(MBTI_PERSONALITY_AT_COMPARISON_RE);
  const crossTypeComparison = normalized.match(MBTI_PERSONALITY_CROSS_TYPE_COMPARISON_RE);
  const hasValidType = detail
    ? MBTI_BASE_TYPES.has(detail[1].toLowerCase())
    : atComparison
      ? atComparison[1].toLowerCase() === atComparison[2].toLowerCase() && MBTI_BASE_TYPES.has(atComparison[1].toLowerCase())
      : crossTypeComparison
        ? MBTI_BASE_TYPES.has(crossTypeComparison[1].toLowerCase()) &&
          MBTI_BASE_TYPES.has(crossTypeComparison[2].toLowerCase()) &&
          crossTypeComparison[1].toLowerCase() !== crossTypeComparison[2].toLowerCase()
        : false;

  return hasValidType && shouldIncludeInSitemap(normalized, {
    indexEligible: true,
    indexState: "indexed",
  });
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

function limitCandidatePaths(paths: string[], limit: number | undefined): string[] {
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

export function extractBackendSitemapBigFiveZhPaths(payload: BackendSitemapSourcePayload): string[] {
  const items = Array.isArray(payload.items) ? payload.items : [];
  const paths = new Set<string>();

  for (const item of items) {
    const path = extractPathFromCanonicalUrl(item?.loc);
    if (shouldKeepBigFivePublicAssetPath(path)) {
      paths.add(normalizePath(path));
    }
  }

  return [...paths].sort((left, right) => left.localeCompare(right));
}

export function isCompleteBackendSitemapBigFiveCohort(paths: readonly string[]): boolean {
  const actual = new Set(paths.map((path) => normalizePath(path)));

  return actual.size === BIG_FIVE_EXPECTED_CANONICAL_PATHS.size
    && BIG_FIVE_EXPECTED_CANONICAL_PATHS.size === 104
    && [...BIG_FIVE_EXPECTED_CANONICAL_PATHS].every((path) => actual.has(path));
}

export function extractBackendSitemapEnneagramPublicAssetPaths(payload: BackendSitemapSourcePayload): string[] {
  const items = Array.isArray(payload.items) ? payload.items : [];
  const paths = new Set<string>();

  for (const item of items) {
    const path = extractPathFromCanonicalUrl(item?.loc);
    if (shouldKeepEnneagramPublicAssetPath(path)) {
      paths.add(normalizePath(path));
    }
  }

  return [...paths].sort((left, right) => left.localeCompare(right));
}

export function extractBackendSitemapEnneagramZhPaths(payload: BackendSitemapSourcePayload): string[] {
  return extractBackendSitemapEnneagramPublicAssetPaths(payload).filter((path) => path.startsWith("/zh/"));
}

export function extractBackendSitemapMbtiPersonalityPaths(payload: BackendSitemapSourcePayload): string[] {
  const items = Array.isArray(payload.items) ? payload.items : [];
  const paths = new Set<string>();

  for (const item of items) {
    const path = extractPathFromCanonicalUrl(item?.loc);
    if (shouldKeepMbtiPersonalityPath(path)) {
      paths.add(normalizePath(path));
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

export async function listBackendSitemapBigFiveZhPaths(
  options: BackendSitemapCareerJobPathOptions = {}
): Promise<string[]> {
  const shouldUseCache = options.limit === undefined && !options.signal;
  if (shouldUseCache && bigFivePublicAssetPathCache && isCompleteBackendSitemapBigFiveCohort(bigFivePublicAssetPathCache)) {
    return bigFivePublicAssetPathCache;
  }

  const payload = await fetchBackendSitemapSource(options.signal);
  const canonicalPaths = extractBackendSitemapBigFiveZhPaths(payload);
  if (!isCompleteBackendSitemapBigFiveCohort(canonicalPaths)) {
    throw new Error(`Incomplete Big Five sitemap authority cohort: expected 104 canonical paths, received ${canonicalPaths.length}.`);
  }

  const filteredPaths = limitCandidatePaths(canonicalPaths, options.limit);

  if (shouldUseCache) {
    bigFivePublicAssetPathCache = canonicalPaths;
  }

  return filteredPaths;
}

export async function listBackendSitemapEnneagramPublicAssetPaths(
  options: BackendSitemapCareerJobPathOptions = {}
): Promise<string[]> {
  const shouldUseCache = options.limit === undefined && !options.signal;
  if (shouldUseCache && enneagramPublicAssetPathCache) {
    return enneagramPublicAssetPathCache;
  }

  const payload = await fetchBackendSitemapSource(options.signal);
  const filteredPaths = limitCandidatePaths(extractBackendSitemapEnneagramPublicAssetPaths(payload), options.limit);

  if (shouldUseCache) {
    enneagramPublicAssetPathCache = filteredPaths;
  }

  return filteredPaths;
}

export async function listBackendSitemapEnneagramZhPaths(
  options: BackendSitemapCareerJobPathOptions = {}
): Promise<string[]> {
  if (!options.signal) {
    const paths = await listBackendSitemapEnneagramPublicAssetPaths();
    return limitCandidatePaths(paths.filter((path) => path.startsWith("/zh/")), options.limit);
  }

  const payload = await fetchBackendSitemapSource(options.signal);
  return limitCandidatePaths(extractBackendSitemapEnneagramZhPaths(payload), options.limit);
}

export async function listBackendSitemapMbtiPersonalityPaths(
  options: BackendSitemapCareerJobPathOptions = {}
): Promise<string[]> {
  try {
    const payload = await fetchBackendSitemapSource(options.signal);
    const canonicalPaths = extractBackendSitemapMbtiPersonalityPaths(payload);

    if (canonicalPaths.length === 0) {
      await clearMbtiAuthorityLastKnownGood();
      return [];
    }

    await writeMbtiAuthorityLastKnownGood(canonicalPaths);
    return limitCandidatePaths(canonicalPaths, options.limit);
  } catch (error) {
    const cachedPaths = await readMbtiAuthorityLastKnownGood();
    if (cachedPaths.length > 0) {
      return limitCandidatePaths(cachedPaths, options.limit);
    }

    throw error;
  }
}
