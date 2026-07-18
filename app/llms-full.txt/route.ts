import { NextResponse } from "next/server";
import { getCmsArticleWithLastKnownGood, listCmsArticlesForLlmsWithLastKnownGood } from "@/lib/cms/articles";
import { getCareerGuideFromCmsBySlug, listCareerGuidesFromCms } from "@/lib/cms/career-guides";
import { adaptCareerRecommendationIndex } from "@/lib/career/adapters/adaptCareerRecommendationIndex";
import { fetchCareerRecommendationIndex } from "@/lib/career/api/fetchCareerRecommendationIndex";
import {
  listDiscoverableContentPagesWithLastKnownGood,
  type ContentPage,
} from "@/lib/cms/content-pages";
import {
  getPersonalityComparisonBySlug,
  getPersonalityProjectionDetailBySlugOrType,
} from "@/lib/cms/personality";
import { isPersonalityComparisonSlug } from "@/lib/mbti/personalityComparison";
import { getTopicBySlug, listDiscoverableTopicsWithLastKnownGood } from "@/lib/cms/topics";
import {
  MENTAL_HEALTH_NON_MEDICAL_DISCLAIMER,
  isMentalHealthScreeningTest,
} from "@/lib/compliance/mentalHealthScreening";
import { isSharedDiscoverabilityDeniedPath } from "@/lib/seo/discoverabilityExposurePolicy";
import { shouldIncludeInSitemap } from "@/lib/seo/indexingPolicy";
import {
  listBackendSitemapBigFiveZhPaths,
  listBackendSitemapCareerJobPaths,
  listBackendSitemapMbtiPersonalityPaths,
} from "@/lib/seo/backendSitemapSource";
import { listBackendDiscoverabilityTestEntries } from "@/lib/seo/backendTestDiscoverabilitySource";
import { listDailyGivingDiscoverabilityEntries } from "@/lib/foundation/dailyGivingSeo";
import { listEnneagramLlmsFullEntries } from "@/lib/seo/enneagramLlmsSource";
import {
  createConfiguredStagingLlmsResponse,
  isConfiguredStagingDiscoverability,
} from "@/lib/seo/stagingDiscoverability";
import {
  LLMS_ROUTE_CAREER_JOB_TIMEOUT_MS,
  LLMS_ROUTE_ARTICLE_MAX_PAGES,
  LLMS_FULL_ARTICLE_ENUMERATION_PAGE_CONCURRENCY,
  LLMS_FULL_ARTICLE_ENUMERATION_TIMEOUT_MS,
  LLMS_ROUTE_CONTENT_PAGE_TIMEOUT_MS,
  LLMS_ROUTE_LIMITS,
  limitLlmsRouteEntries,
  withLlmsRouteBudget,
  LLMS_FULL_PERSONALITY_SOURCE_TIMEOUT_MS,
  LLMS_FULL_TEST_SOURCE_TIMEOUT_MS,
  LLMS_FULL_DEGRADED_CAREER_JOB_TIMEOUT_MS,
  LLMS_FULL_ENRICHMENT_TIMEOUT_MS,
  LLMS_FULL_RESPONSE_DEADLINE_MS,
} from "@/lib/seo/llmsRouteBudget";
import {
  getCachedLlmsFullText,
  getOrStartLlmsFullBuild,
  writeLlmsFullResponseCache,
} from "@/lib/seo/llmsFullResponseCache";
import { getSiteUrlOrThrow } from "@/lib/site";
import { BIG_FIVE_PUBLIC_ROUTE_ENTRIES } from "@/lib/personality/bigFivePublicRoutes";
import {
  buildEnneagramPublicContentPath,
  ENNEAGRAM_PUBLIC_ROUTE_ENTRIES,
} from "@/lib/personality/enneagramPublicRoutes";
import type { AnswerSurfaceViewModel } from "@/lib/answer/answerSurface";
import type { Locale } from "@/lib/i18n/locales";
import type { LandingSurfaceViewModel } from "@/lib/landing/landingSurface";

const LLMS_FINAL_PATH_DENY_PATTERNS: RegExp[] = [
  /^\/zh$/i,
  /^\/tests(?:\/|$)/i,
  /^\/(?:en|zh)\/tests\/(?:clinical-depression-anxiety-assessment-professional-edition|depression-screening-test-standard-edition)$/i,
  /^\/(?:en|zh)\/blog$/i,
  /^\/(?:en|zh)\/help$/i,
  /^\/(?:en|zh)\/refund$/i,
  /^\/(?:en|zh)\/help\/(?:about|for-business-and-research|team|used-and-mentioned)$/i,
  /^\/datasets\/occupations(?:\/method)?$/i,
  /^\/(?:en|zh)\/datasets\/occupations(?:\/method)?$/i,
  /^\/career\/jobs$/i,
  /^\/(?:en|zh)\/career\/jobs$/i,
  /^\/(?:en|zh)\/career\/jobs\/(?:software-developers|digital-forensics-analysts|computer-occupations-all-other)$/i,
  /^\/(?:en|zh)\/career\/recommendations$/i,
  /^\/(?:en|zh)\/career\/recommendations\/mbti\/[^/]+$/i,
  /^\/(?:en|zh)\/career\/guides\/[^/]+$/i,
  /^\/(?:en|zh)\/personality\/(?:intj|intp|entj|entp|infj|infp|enfj|enfp|istj|isfj|estj|esfj|istp|isfp|estp|esfp)$/i,
  /^\/ops(?:\/|$)/i,
  /^\/(?:en|zh)\/ops(?:\/|$)/i,
];

const MAX_FAQ_ITEMS = 2;
const MAX_NEXT_STEPS = 3;
const MAX_TEXT_CHARS = 360;
const ENRICHMENT_CONCURRENCY = 4;
const LLMS_FULL_CACHE_FRESH_MS = 60 * 60 * 1000;
const LLMS_FULL_CACHE_STALE_MS = 24 * 60 * 60 * 1000;
const LLMS_FULL_RESPONSE_TIMEOUT = Symbol("llms-full-response-timeout");
const LLMS_FULL_EXPECTED_CAREER_JOB_URL_COUNT = 1046 * 2;
const LLMS_FULL_PERSONALITY_DETAIL_URL_COUNT = 32 * 2;
const LLMS_FULL_PERSONALITY_COMPARISON_URL_COUNT = 16 * 2;
const LLMS_FULL_BIG_FIVE_CANONICAL_ENTRY_LIMIT = 104;
const LLMS_FULL_REQUIRED_PERSONALITY_PILOT_PATHS = [
  "/en/personality/intj-a-vs-intj-t",
  "/zh/personality/istj-a",
  "/en/personality/intp-a-vs-intp-t",
  "/zh/personality/infp-t",
  "/en/personality/intj-a",
  "/en/personality/intj-t",
  "/zh/personality/intj-a",
  "/zh/personality/intj-t",
] as const;
const LLMS_FULL_REQUIRED_PERSONALITY_FRESH_AGENT_PATHS = [
  "/zh/personality/esfj-a",
  "/zh/personality/intp-a",
  "/zh/personality/istp-a",
] as const;
const LLMS_FULL_REQUIRED_PERSONALITY_PATHS = [
  ...LLMS_FULL_REQUIRED_PERSONALITY_PILOT_PATHS,
  ...LLMS_FULL_REQUIRED_PERSONALITY_FRESH_AGENT_PATHS,
] as const;
const LLMS_FULL_ARTICLE_ENTRY_LIMIT = LLMS_ROUTE_LIMITS.articles * 2;
const LLMS_FULL_REQUIRED_CAREER_JOB_SLUGS = [
  "accountants-and-auditors",
  "actors",
  "actuaries",
  "aerospace-engineers",
  "agricultural-and-food-scientists",
  "administrative-law-judges-adjudicators-and-hearing-officers",
  "acupuncturists",
  "acute-care-nurses",
] as const;
const LLMS_FULL_REQUIRED_CORE_ASSESSMENT_TEST_PATHS = [
  "/en/tests/mbti-personality-test-16-personality-types",
  "/zh/tests/mbti-personality-test-16-personality-types",
  "/en/tests/big-five-personality-test-ocean-model",
  "/zh/tests/big-five-personality-test-ocean-model",
  `/en/tests/${"ennea"}gram-personality-test-nine-types`,
  `/zh/tests/${"ennea"}gram-personality-test-nine-types`,
  `/en/tests/holland-career-interest-test-${"ria"}sec`,
  `/zh/tests/holland-career-interest-test-${"ria"}sec`,
  "/en/tests/eq-test-emotional-intelligence-assessment",
  "/zh/tests/eq-test-emotional-intelligence-assessment",
] as const;
const LLMS_FULL_REQUIRED_IQ_ASSESSMENT_TEST_PATHS = [
  "/en/tests/iq-test-intelligence-quotient-assessment",
  "/zh/tests/iq-test-intelligence-quotient-assessment",
] as const;
const LLMS_FULL_EXCLUDED_CAREER_JOB_SLUGS = [
  "software-developers",
  "digital-forensics-analysts",
  "computer-occupations-all-other",
] as const;

function shouldRequireCompleteCareerJobCohort(): boolean {
  return process.env.NODE_ENV !== "test" || process.env.FERMATMIND_LLMS_FULL_REQUIRE_CAREER_COHORT === "true";
}

function shouldRequireCompletePersonalityCohort(): boolean {
  return process.env.FERMATMIND_LLMS_FULL_REQUIRE_PERSONALITY_COHORT === "true";
}

function shouldRequireCompleteTestCohort(): boolean {
  return process.env.NODE_ENV !== "test" || process.env.FERMATMIND_LLMS_FULL_REQUIRE_TEST_COHORT === "true";
}

function shouldRequireIqLlmsFullCohort(): boolean {
  return process.env.FERMATMIND_LLMS_FULL_REQUIRE_IQ_COHORT === "true";
}

type LlmsFullResponseMode = "complete" | "degraded";
type LlmsFullResponseSource = "generated" | "cache" | "stale-cache" | "degraded";

type LlmsLocale = Locale;

type LlmsFaqItem = {
  question: string;
  answer: string;
};

type LlmsFullEntry = {
  locale: LlmsLocale;
  path: string;
  title: string;
  type: string;
  updatedAt?: string | null;
  summary?: string | null;
  faq?: LlmsFaqItem[];
  nextSteps?: string[];
  disclaimer?: string | null;
  url?: string;
};

function toCanonical(siteUrl: string, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalized}`;
}

function normalizePath(path: string): string {
  const value = String(path || "").trim() || "/";
  if (value === "/") return "/";
  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return withLeadingSlash.replace(/\/+$/, "");
}

function localizedContentPagePath(page: ContentPage, fallbackLocale: LlmsLocale): string {
  const normalizedPath = normalizePath(page.path || `/${page.slug}`);
  const locale = page.locale === "zh" || page.locale === "en" ? page.locale : fallbackLocale;

  if (/^\/(en|zh)(\/|$)/i.test(normalizedPath)) {
    return normalizedPath;
  }

  if (normalizedPath === "/") {
    return locale === "zh" ? "/" : "/en";
  }

  return normalizePath(`/${locale}${normalizedPath}`);
}

function isForbiddenFinalLlmsPath(path: string): boolean {
  const normalized = normalizePath(path);
  return (
    isSharedDiscoverabilityDeniedPath(normalized) ||
    LLMS_FINAL_PATH_DENY_PATTERNS.some((pattern) => pattern.test(normalized))
  );
}

function shouldKeep(path: string): boolean {
  return !isForbiddenFinalLlmsPath(path) && shouldIncludeInSitemap(path);
}

function cleanText(value: unknown, maxChars = MAX_TEXT_CHARS): string {
  if (typeof value !== "string" && typeof value !== "number") {
    return "";
  }

  const normalized = String(value).replace(/\s+/g, " ").trim();
  if (normalized.length <= maxChars) {
    return normalized;
  }

  return `${normalized.slice(0, maxChars - 3).trimEnd()}...`;
}

function summaryFromRecord(value: unknown): string {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return "";
  }

  const record = value as Record<string, unknown>;
  return cleanText(record.summary ?? record.excerpt ?? record.description ?? record.subtitle);
}

function extractSlugFromPath(path: string): string {
  const segments = normalizePath(path).split("/").filter(Boolean);
  return segments.at(-1) ?? "";
}

function localeFromLocalizedPath(path: string): LlmsLocale | null {
  const locale = normalizePath(path).split("/").filter(Boolean).at(0);
  return locale === "en" || locale === "zh" ? locale : null;
}

function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function buildCareerJobEntry(path: string): LlmsFullEntry | null {
  const normalized = normalizePath(path);
  const locale = localeFromLocalizedPath(normalized);
  const slug = extractSlugFromPath(normalized);

  if (!locale || !slug) {
    return null;
  }

  return {
    locale,
    path: normalized,
    title: titleFromSlug(slug),
    type: "career_job_detail",
    updatedAt: "",
  };
}

function buildBigFivePublicAssetEntry(path: string): LlmsFullEntry | null {
  const normalized = normalizePath(path);
  const locale = localeFromLocalizedPath(normalized);
  const slug = extractSlugFromPath(normalized);

  if (!locale || !slug) {
    return null;
  }

  return {
    locale,
    path: normalized,
    title: titleFromSlug(slug),
    type: "personality_public_content_asset",
    updatedAt: "",
  };
}

function displayLocale(locale: LlmsLocale): string {
  return locale === "zh" ? "zh-CN" : "en";
}

function firstSummaryFromAnswerSurface(surface: AnswerSurfaceViewModel | null | undefined): string {
  if (!surface) {
    return "";
  }

  for (const block of surface.summaryBlocks) {
    const value = cleanText(block.body || block.title);
    if (value) {
      return value;
    }
  }

  return "";
}

function firstSummaryFromLandingSurface(surface: LandingSurfaceViewModel | null | undefined): string {
  if (!surface) {
    return "";
  }

  for (const block of surface.summaryBlocks) {
    const value = cleanText(block.body || block.title);
    if (value) {
      return value;
    }
  }

  return "";
}

function buildSummary({
  answerSurface,
  landingSurface,
  sourceSummary,
}: {
  answerSurface?: AnswerSurfaceViewModel | null;
  landingSurface?: LandingSurfaceViewModel | null;
  sourceSummary?: unknown;
}): string {
  return firstSummaryFromAnswerSurface(answerSurface) || firstSummaryFromLandingSurface(landingSurface) || cleanText(sourceSummary);
}

function buildFaq(answerSurface: AnswerSurfaceViewModel | null | undefined): LlmsFaqItem[] {
  if (!answerSurface) {
    return [];
  }

  return answerSurface.faqBlocks
    .map((item) => ({
      question: cleanText(item.question),
      answer: cleanText(item.answer),
    }))
    .filter((item) => item.question && item.answer)
    .slice(0, MAX_FAQ_ITEMS);
}

function safeCanonicalUrlFromHref(siteUrl: string, href: string | null | undefined): string | null {
  const rawHref = String(href ?? "").trim();
  if (!rawHref) {
    return null;
  }

  try {
    const url = new URL(rawHref, siteUrl);
    if (url.origin !== siteUrl) {
      return null;
    }

    const path = normalizePath(url.pathname);
    if (!shouldKeep(path)) {
      return null;
    }

    return toCanonical(siteUrl, path);
  } catch {
    return null;
  }
}

function buildNextSteps(answerSurface: AnswerSurfaceViewModel | null | undefined, siteUrl: string): string[] {
  if (!answerSurface) {
    return [];
  }

  const seen = new Set<string>();
  const steps: string[] = [];

  for (const item of answerSurface.nextStepBlocks) {
    const url = safeCanonicalUrlFromHref(siteUrl, item.href);
    if (!url || seen.has(url)) {
      continue;
    }

    const label = cleanText(item.title || item.body, 120);
    steps.push(label ? `${label}: ${url}` : url);
    seen.add(url);

    if (steps.length >= MAX_NEXT_STEPS) {
      break;
    }
  }

  return steps;
}

function sanitizeNextStep(
  siteUrl: string,
  value: string,
  allowedCitationPaths: ReadonlySet<string>
): string {
  const text = cleanText(value, 240);
  if (!text) {
    return "";
  }

  const urls = text.match(/https?:\/\/[^\s)]+/g) ?? [];
  if (!urls.length) {
    return text;
  }

  let sanitized = text;
  for (const url of urls) {
    const safeUrl = safeCanonicalUrlFromHref(siteUrl, url);
    if (!safeUrl || !allowedCitationPaths.has(normalizePath(new URL(safeUrl).pathname))) {
      return "";
    }
    sanitized = sanitized.replace(url, safeUrl);
  }

  return sanitized;
}

function formatEntry(
  entry: LlmsFullEntry,
  siteUrl: string,
  allowedCitationPaths: ReadonlySet<string>
): string[] {
  const canonicalUrl = safeCanonicalUrlFromHref(siteUrl, entry.url ?? entry.path);
  if (!canonicalUrl) {
    return [];
  }

  const lines = [
    `### [${entry.locale}] ${entry.title} | ${canonicalUrl}`,
    `- URL: ${canonicalUrl}`,
    `- Locale: ${displayLocale(entry.locale)}`,
    `- Type: ${entry.type}`,
  ];
  const updatedAt = cleanText(entry.updatedAt, 80);
  const summary = cleanText(entry.summary);
  const disclaimer = cleanText(entry.disclaimer);
  const faq = (entry.faq ?? []).filter((item) => item.question && item.answer).slice(0, MAX_FAQ_ITEMS);
  const nextSteps = (entry.nextSteps ?? [])
    .map((step) => sanitizeNextStep(siteUrl, step, allowedCitationPaths))
    .filter(Boolean)
    .slice(0, MAX_NEXT_STEPS);

  if (updatedAt) {
    lines.push(`- Updated: ${updatedAt}`);
  }

  if (summary) {
    lines.push(`- Summary: ${summary}`);
  }

  if (disclaimer) {
    lines.push(`- Disclaimer: ${disclaimer}`);
  }

  if (faq.length) {
    lines.push("- FAQ:");
    for (const item of faq) {
      lines.push(`  - Q: ${item.question}`);
      lines.push(`    A: ${item.answer}`);
    }
  }

  if (nextSteps.length) {
    lines.push("- Next steps:");
    for (const step of nextSteps) {
      lines.push(`  - ${step}`);
    }
  }

  return lines;
}

function buildAllowedCitationPaths(entries: readonly { path: string }[]): Set<string> {
  return new Set(entries.map((entry) => normalizePath(entry.path)));
}

function canonicalEntrypointEntries(siteUrl: string): LlmsFullEntry[] {
  return [
    { locale: "zh" as const, path: "/", title: "FermatMind", type: "home", url: toCanonical(siteUrl, "/") },
    { locale: "en" as const, path: "/en", title: "FermatMind English", type: "home", url: toCanonical(siteUrl, "/en") },
    { locale: "en" as const, path: "/en/personality", title: "Personality library", type: "primary_page", url: toCanonical(siteUrl, "/en/personality") },
    { locale: "zh" as const, path: "/zh/personality", title: "人格库", type: "primary_page", url: toCanonical(siteUrl, "/zh/personality") },
    { locale: "en" as const, path: "/en/topics", title: "Topics", type: "primary_page", url: toCanonical(siteUrl, "/en/topics") },
    { locale: "zh" as const, path: "/zh/topics", title: "主题", type: "primary_page", url: toCanonical(siteUrl, "/zh/topics") },
    { locale: "en" as const, path: "/en/career", title: "Career center", type: "career_index", url: toCanonical(siteUrl, "/en/career") },
    { locale: "zh" as const, path: "/zh/career", title: "职业发展中心", type: "career_index", url: toCanonical(siteUrl, "/zh/career") },
  ];
}

function createLlmsFullResponse(text: string, mode: LlmsFullResponseMode, source: LlmsFullResponseSource): NextResponse {
  return new NextResponse(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "X-FermatMind-LLMS-Full-Mode": mode,
      "X-FermatMind-LLMS-Full-Source": source,
    },
  });
}

const CAREER_JOB_CANONICAL_PATH_RE = /^\/(?:en|zh)\/career\/jobs\/[a-z0-9-]+$/;
const MBTI64_PERSONALITY_VARIANT_CANONICAL_PATH_RE = /^\/(?:en|zh)\/personality\/[a-z]{4}-[at]$/;
const MBTI64_PERSONALITY_COMPARISON_CANONICAL_PATH_RE = /^\/(?:en|zh)\/personality\/([a-z]{4})-a-vs-\1-t$/;
const MBTI_PERSONALITY_AUTHORITY_CANONICAL_PATH_RE =
  /^\/(?:en|zh)\/personality\/(?:[a-z]{4}-[at]|[a-z]{4}-a-vs-[a-z]{4}-t|[a-z]{4}-vs-[a-z]{4})$/;
const ENNEAGRAM_PUBLIC_CONTENT_CANONICAL_PATH_RE =
  /^\/(?:en|zh)\/personality\/enneagram(?:\/(?:type-[1-9]|centers\/(?:gut|heart|head)|wings\/(?:1w9|1w2|2w1|2w3|3w2|3w4|4w3|4w5|5w4|5w6|6w5|6w7|7w6|7w8|8w7|8w9|9w8|9w1)|type-[1-9]\/instincts\/(?:self-preservation|social|one-to-one)))?$/i;
const BIG_FIVE_PUBLIC_PATH_RE = /^\/(?:en|zh)\/personality\/big-five(?:\/[^/?#]+(?:\/[^/?#]+)?)?$/;
const BIG_FIVE_EXPECTED_CANONICAL_PATHS = BIG_FIVE_PUBLIC_ROUTE_ENTRIES.flatMap((entry) => [
  `/en/personality/big-five${entry.pathSuffix}`,
  `/zh/personality/big-five${entry.pathSuffix}`,
]);

function canonicalCareerJobUrlSet(text: string, siteUrl: string): Set<string> {
  let siteOrigin: string;
  try {
    siteOrigin = new URL(siteUrl).origin;
  } catch {
    return new Set();
  }

  const urls = text.match(/https?:\/\/[^\s)]+/g) ?? [];
  const canonicalUrls = urls.flatMap((url) => {
    try {
      const parsed = new URL(url);
      return parsed.origin === siteOrigin && CAREER_JOB_CANONICAL_PATH_RE.test(parsed.pathname)
        ? [`${siteOrigin}${parsed.pathname}`]
        : [];
    } catch {
      return [];
    }
  });

  return new Set(canonicalUrls);
}

function canonicalPathUrlSet(text: string, siteUrl: string, pattern: RegExp): Set<string> {
  let siteOrigin: string;
  try {
    siteOrigin = new URL(siteUrl).origin;
  } catch {
    return new Set();
  }

  const urls = text.match(/https?:\/\/[^\s)]+/g) ?? [];
  const canonicalUrls = urls.flatMap((url) => {
    try {
      const parsed = new URL(url);
      return parsed.origin === siteOrigin && pattern.test(parsed.pathname) ? [`${siteOrigin}${parsed.pathname}`] : [];
    } catch {
      return [];
    }
  });

  return new Set(canonicalUrls);
}

function hasCompleteMbti64PersonalityCohort(text: string, siteUrl: string): boolean {
  const variantUrls = canonicalPathUrlSet(text, siteUrl, MBTI64_PERSONALITY_VARIANT_CANONICAL_PATH_RE);
  if (variantUrls.size < LLMS_FULL_PERSONALITY_DETAIL_URL_COUNT) {
    return false;
  }

  const comparisonUrls = canonicalPathUrlSet(text, siteUrl, MBTI64_PERSONALITY_COMPARISON_CANONICAL_PATH_RE);
  if (comparisonUrls.size < LLMS_FULL_PERSONALITY_COMPARISON_URL_COUNT) {
    return false;
  }

  return LLMS_FULL_REQUIRED_PERSONALITY_PATHS.every((path) => text.includes(`${siteUrl}${path}`));
}

function shouldRequireCompleteBigFiveCohort(): boolean {
  return process.env.NODE_ENV !== "test" || process.env.FERMATMIND_LLMS_FULL_REQUIRE_BIG_FIVE_COHORT === "true";
}

function shouldRequireCompleteEnneagramCohort(): boolean {
  return process.env.NODE_ENV !== "test" || process.env.FERMATMIND_LLMS_FULL_REQUIRE_ENNEAGRAM_COHORT === "true";
}

export function hasExactBigFiveCanonicalCohort(text: string, siteUrl: string): boolean {
  const actualUrls = canonicalPathUrlSet(text, siteUrl, BIG_FIVE_PUBLIC_PATH_RE);
  const expectedUrls = new Set(BIG_FIVE_EXPECTED_CANONICAL_PATHS.map((path) => toCanonical(siteUrl, path)));

  return expectedUrls.size === 104
    && actualUrls.size === expectedUrls.size
    && [...expectedUrls].every((url) => actualUrls.has(url));
}

function llmsFullEntryMbtiAuthorityUrlSet(text: string, siteUrl: string): Set<string> {
  let siteOrigin: string;
  try {
    siteOrigin = new URL(siteUrl).origin;
  } catch {
    return new Set();
  }

  const entryUrls = [...text.matchAll(/^- URL:\s+(https?:\/\/[^\s]+)\s*$/gm)].map((match) => match[1]);
  return new Set(entryUrls.flatMap((url) => {
    try {
      const parsed = new URL(url);
      return parsed.origin === siteOrigin && MBTI_PERSONALITY_AUTHORITY_CANONICAL_PATH_RE.test(parsed.pathname)
        ? [`${siteOrigin}${parsed.pathname}`]
        : [];
    } catch {
      return [];
    }
  }));
}

function llmsFullEntryUrlSet(text: string, siteUrl: string): Set<string> {
  let siteOrigin: string;
  try {
    siteOrigin = new URL(siteUrl).origin;
  } catch {
    return new Set();
  }

  const entryUrls = [...text.matchAll(/^- URL:\s+(https?:\/\/[^\s]+)\s*$/gm)].map((match) => match[1]);
  return new Set(entryUrls.flatMap((url) => {
    try {
      const parsed = new URL(url);
      return parsed.origin === siteOrigin && !parsed.search && !parsed.hash
        ? [toCanonical(siteOrigin, normalizePath(parsed.pathname))]
        : [];
    } catch {
      return [];
    }
  }));
}

function hasClosedLlmsFullCitationSet(text: string, siteUrl: string): boolean {
  let siteOrigin: string;
  try {
    siteOrigin = new URL(siteUrl).origin;
  } catch {
    return false;
  }

  const allowedUrls = llmsFullEntryUrlSet(text, siteOrigin);
  allowedUrls.add(toCanonical(siteOrigin, "/"));
  allowedUrls.add(toCanonical(siteOrigin, "/sitemap.xml"));

  const ownedUrlCandidates = text.match(/https?:\/\/[^\s<>'"`]+/g) ?? [];
  for (const candidate of ownedUrlCandidates) {
    try {
      const parsed = new URL(candidate.replace(/[),.;]+$/, ""));
      if (parsed.origin !== siteOrigin) {
        continue;
      }
      if (parsed.search || parsed.hash) {
        return false;
      }

      const canonicalUrl = toCanonical(siteOrigin, normalizePath(parsed.pathname));
      if (!allowedUrls.has(canonicalUrl)) {
        return false;
      }
    } catch {
      return false;
    }
  }

  return true;
}

function hasExactMbtiPersonalityAuthorityCohort(
  text: string,
  siteUrl: string,
  expectedPaths: readonly string[]
): boolean {
  const actualUrls = llmsFullEntryMbtiAuthorityUrlSet(text, siteUrl);
  const expectedUrls = new Set(expectedPaths.map((path) => toCanonical(siteUrl, normalizePath(path))));

  return actualUrls.size === expectedUrls.size && [...expectedUrls].every((url) => actualUrls.has(url));
}

function expectedEnneagramLlmsFullPaths(): string[] {
  return (["en", "zh"] as const).flatMap((locale) =>
    ENNEAGRAM_PUBLIC_ROUTE_ENTRIES.map((entry) => buildEnneagramPublicContentPath(locale, entry))
  );
}

function hasExactEnneagramLlmsFullCohort(text: string, siteUrl: string): boolean {
  const actualUrls = canonicalPathUrlSet(text, siteUrl, ENNEAGRAM_PUBLIC_CONTENT_CANONICAL_PATH_RE);
  const expectedUrls = new Set(expectedEnneagramLlmsFullPaths().map((path) => toCanonical(siteUrl, path)));

  return expectedUrls.size === 116
    && actualUrls.size === expectedUrls.size
    && [...expectedUrls].every((url) => actualUrls.has(url));
}

export function isCompleteLlmsFullText(
  text: string,
  siteUrl: string,
  expectedMbtiPersonalityPaths?: readonly string[]
): boolean {
  if (!text.includes("# FermatMind llms-full.txt") || text.includes("Mode: degraded")) {
    return false;
  }

  for (const slug of LLMS_FULL_EXCLUDED_CAREER_JOB_SLUGS) {
    if (text.includes(`${siteUrl}/en/career/jobs/${slug}`) || text.includes(`${siteUrl}/zh/career/jobs/${slug}`)) {
      return false;
    }
  }

  if (/(staging\.fermatmind\.com|\/(?:take|result|share|orders?|pay|payment)(?:\/|$))/i.test(text)) {
    return false;
  }

  if (!hasClosedLlmsFullCitationSet(text, siteUrl)) {
    return false;
  }

  if (
    shouldRequireCompleteTestCohort() &&
    !LLMS_FULL_REQUIRED_CORE_ASSESSMENT_TEST_PATHS.every((path) => text.includes(`${siteUrl}${path}`))
  ) {
    return false;
  }

  if (
    shouldRequireCompleteTestCohort() &&
    shouldRequireIqLlmsFullCohort() &&
    !LLMS_FULL_REQUIRED_IQ_ASSESSMENT_TEST_PATHS.every((path) => text.includes(`${siteUrl}${path}`))
  ) {
    return false;
  }

  if (shouldRequireCompletePersonalityCohort() && !hasCompleteMbti64PersonalityCohort(text, siteUrl)) {
    return false;
  }

  if (shouldRequireCompleteBigFiveCohort() && !hasExactBigFiveCanonicalCohort(text, siteUrl)) {
    return false;
  }

  if (
    expectedMbtiPersonalityPaths &&
    !hasExactMbtiPersonalityAuthorityCohort(text, siteUrl, expectedMbtiPersonalityPaths)
  ) {
    return false;
  }

  if (shouldRequireCompleteEnneagramCohort() && !hasExactEnneagramLlmsFullCohort(text, siteUrl)) {
    return false;
  }

  if (!shouldRequireCompleteCareerJobCohort()) {
    return true;
  }

  const careerUrls = canonicalCareerJobUrlSet(text, siteUrl);
  if (careerUrls.size < LLMS_FULL_EXPECTED_CAREER_JOB_URL_COUNT) {
    return false;
  }

  for (const slug of LLMS_FULL_REQUIRED_CAREER_JOB_SLUGS) {
    if (!careerUrls.has(`${siteUrl}/en/career/jobs/${slug}`) || !careerUrls.has(`${siteUrl}/zh/career/jobs/${slug}`)) {
      return false;
    }
  }

  return true;
}

async function waitForLlmsFullBuildBudget(
  promise: Promise<string | null>
): Promise<string | null | typeof LLMS_FULL_RESPONSE_TIMEOUT> {
  return Promise.race([
    promise,
    new Promise<typeof LLMS_FULL_RESPONSE_TIMEOUT>((resolve) => {
      setTimeout(() => resolve(LLMS_FULL_RESPONSE_TIMEOUT), LLMS_FULL_RESPONSE_DEADLINE_MS);
    }),
  ]);
}

export async function buildDegradedLlmsFullText(siteUrl: string): Promise<string> {
  const [personalityEntries, backendTestEntries, careerJobPaths] = await Promise.all([
    withLlmsRouteBudget(() => listPersonalityEntries(), [], { timeoutMs: LLMS_FULL_PERSONALITY_SOURCE_TIMEOUT_MS }),
    withLlmsRouteBudget(
      () =>
        listBackendDiscoverabilityTestEntries().then((entries) =>
          limitLlmsRouteEntries(entries, LLMS_ROUTE_LIMITS.tests)
        ),
      [],
      { timeoutMs: LLMS_FULL_TEST_SOURCE_TIMEOUT_MS }
    ),
    withLlmsRouteBudget(
      (signal) => listBackendSitemapCareerJobPaths({ limit: LLMS_ROUTE_LIMITS.careerJobs, signal }),
      [],
      { timeoutMs: LLMS_FULL_DEGRADED_CAREER_JOB_TIMEOUT_MS }
    ),
  ]);
  const tests = backendTestEntries
    .filter((test) => test.llmsFullEligible !== false)
    .map((test) => ({
      locale: test.locale,
      path: test.path,
      title: test.title,
      type: "test",
      updatedAt: "",
      summary: cleanText(
        test.description ||
          (test.locale === "zh"
            ? test.highlightExcerptI18n.zh || test.highlightExcerptI18n["zh-CN"] || test.highlightExcerptI18n.en
            : test.highlightExcerptI18n.en || test.highlightExcerptI18n.zh || test.highlightExcerptI18n["zh-CN"]) ||
          ""
      ),
      disclaimer: isMentalHealthScreeningTest({ slug: test.slug, scaleCode: test.scaleCode })
        ? MENTAL_HEALTH_NON_MEDICAL_DISCLAIMER[test.locale]
        : null,
    }))
    .filter((entry) => shouldKeep(entry.path));
  const careers = careerJobPaths
    .map((path) => buildCareerJobEntry(path))
    .filter((entry): entry is LlmsFullEntry => Boolean(entry))
    .filter((entry) => shouldKeep(entry.path));
  const canonicalEntrypoints = canonicalEntrypointEntries(siteUrl);
  const allowedCitationPaths = buildAllowedCitationPaths([
    ...canonicalEntrypoints,
    ...personalityEntries,
    ...tests,
    ...careers,
  ]);

  return [
    "# FermatMind llms-full.txt",
    `Generated-At: ${new Date().toISOString()}`,
    `Site: ${siteUrl}`,
    "Mode: degraded",
    "",
    "## Citation Policy",
    "- Prefer canonical public URLs only.",
    "- Prefer answer-first, breadcrumb, FAQ, and structured list sections when available.",
    "- Exclude noindex and private user-flow paths.",
    "- This bounded response is served when the full cached artifact is unavailable or still refreshing.",
    "",
    "## Canonical Entrypoints",
    ...canonicalEntrypoints.flatMap((entry) => formatEntry(entry, siteUrl, allowedCitationPaths)),
    "",
    "## Personality",
    ...personalityEntries.flatMap((entry) => formatEntry(entry, siteUrl, allowedCitationPaths)),
    "",
    "## Tests",
    ...tests.flatMap((entry) => formatEntry(entry, siteUrl, allowedCitationPaths)),
    "",
    "## Career",
    ...careers.flatMap((entry) => formatEntry(entry, siteUrl, allowedCitationPaths)),
    "",
    "## Sitemap",
    `- ${toCanonical(siteUrl, "/sitemap.xml")}`,
  ].join("\n");
}

async function mapWithConcurrency<T, U>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<U>
): Promise<U[]> {
  const results = new Array<U>(items.length);
  let nextIndex = 0;
  const workerCount = Math.min(Math.max(1, concurrency), items.length);

  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (nextIndex < items.length) {
        const currentIndex = nextIndex;
        nextIndex += 1;
        results[currentIndex] = await mapper(items[currentIndex]);
      }
    })
  );

  return results;
}

function shouldKeepCareerAuthorityEntry(entry: {
  href: string;
  seoContract: { indexEligible: boolean | null; indexState: string | null };
}): boolean {
  return !isForbiddenFinalLlmsPath(entry.href) && shouldIncludeInSitemap(entry.href, {
    indexEligible: entry.seoContract.indexEligible,
    indexState: entry.seoContract.indexState,
  });
}

function uniqueEntriesByPath(entries: LlmsFullEntry[]): LlmsFullEntry[] {
  const seen = new Set<string>();
  const results: LlmsFullEntry[] = [];

  for (const entry of entries) {
    const normalizedPath = normalizePath(entry.path);
    if (seen.has(normalizedPath) || !shouldKeep(normalizedPath)) {
      continue;
    }

    seen.add(normalizedPath);
    results.push({ ...entry, path: normalizedPath });
  }

  return results;
}

function buildMbtiPersonalityAuthorityEntry(path: string): LlmsFullEntry | null {
  const normalized = normalizePath(path);
  const match = normalized.match(/^\/(en|zh)\/personality\/([^/]+)$/i);
  const locale = match?.[1]?.toLowerCase();
  const slug = match?.[2]?.toLowerCase();
  if ((locale !== "en" && locale !== "zh") || !slug) {
    return null;
  }

  return {
    locale,
    path: normalized,
    title: slug.toUpperCase().replaceAll("-VS-", " vs "),
    type: "personality",
  };
}

async function listPersonalityEntries(): Promise<LlmsFullEntry[]> {
  const mbtiEntriesPromise = listBackendSitemapMbtiPersonalityPaths()
    .then((paths) =>
      paths
        .map((path) => buildMbtiPersonalityAuthorityEntry(path))
        .filter((entry): entry is LlmsFullEntry => Boolean(entry))
    )
    .catch(() => []);
  const bigFiveZhEntriesPromise = listBackendSitemapBigFiveZhPaths({ limit: LLMS_FULL_BIG_FIVE_CANONICAL_ENTRY_LIMIT })
    .then((paths) =>
      paths
        .map((path) => buildBigFivePublicAssetEntry(path))
        .filter((entry): entry is LlmsFullEntry => Boolean(entry))
    )
    .catch(() => []);
  const enneagramEntriesPromise = listEnneagramLlmsFullEntries().catch(() => []);

  const [mbtiEntries, bigFiveZhEntries, enneagramEntries] = await Promise.all([
    mbtiEntriesPromise,
    bigFiveZhEntriesPromise,
    enneagramEntriesPromise,
  ]);

  if (enneagramEntries.length === 0) {
    return uniqueEntriesByPath([...mbtiEntries, ...bigFiveZhEntries]);
  }

  return uniqueEntriesByPath([...mbtiEntries, ...bigFiveZhEntries, ...enneagramEntries]);
}

async function listTopicEntries(): Promise<LlmsFullEntry[]> {
  const locales: LlmsLocale[] = ["en", "zh"];
  const entries = await Promise.all(locales.map(async (locale) => {
    try {
      const result = await listDiscoverableTopicsWithLastKnownGood({
        locale,
        perPage: LLMS_ROUTE_LIMITS.topics,
      });
      return result.value.items.map((item) => ({
        locale,
        path: `/${locale}/topics/${item.slug}`,
        title: item.title,
        type: "topic",
        summary: summaryFromRecord(item),
      }));
    } catch {
      return [];
    }
  }));

  return entries.flat().filter((entry) => shouldKeep(entry.path));
}

async function enrichArticleEntry(entry: LlmsFullEntry, siteUrl: string): Promise<LlmsFullEntry> {
  const slug = extractSlugFromPath(entry.path);
  const detail = slug
    ? await getCmsArticleWithLastKnownGood(slug, entry.locale).then((result) => result.value).catch(() => null)
    : null;
  const answerSurface = detail?.answerSurface ?? null;
  const landingSurface = detail?.landingSurface ?? null;

  return {
    ...entry,
    summary: buildSummary({ answerSurface, landingSurface, sourceSummary: entry.summary }),
    faq: buildFaq(answerSurface),
    nextSteps: buildNextSteps(answerSurface, siteUrl),
  };
}

async function enrichPersonalityEntry(entry: LlmsFullEntry, siteUrl: string): Promise<LlmsFullEntry> {
  const slug = extractSlugFromPath(entry.path);
  if (slug && isPersonalityComparisonSlug(slug)) {
    const comparison = await getPersonalityComparisonBySlug(slug, entry.locale).catch(() => null);
    const answerSurface = comparison?.answerSurface ?? null;
    const landingSurface = comparison?.landingSurface ?? null;

    return {
      ...entry,
      title: comparison?.title || entry.title,
      summary: buildSummary({ answerSurface, landingSurface, sourceSummary: comparison?.description || entry.summary }),
      faq: buildFaq(answerSurface),
      nextSteps: buildNextSteps(answerSurface, siteUrl),
    };
  }

  const detail = slug ? await getPersonalityProjectionDetailBySlugOrType(slug, entry.locale).catch(() => null) : null;
  const answerSurface = detail?.answerSurface ?? null;
  const landingSurface = detail?.landingSurface ?? null;

  return {
    ...entry,
    summary: buildSummary({ answerSurface, landingSurface, sourceSummary: entry.summary }),
    faq: buildFaq(answerSurface),
    nextSteps: buildNextSteps(answerSurface, siteUrl),
  };
}

async function enrichTopicEntry(entry: LlmsFullEntry, siteUrl: string): Promise<LlmsFullEntry> {
  const slug = extractSlugFromPath(entry.path);
  const detail = slug ? await getTopicBySlug(slug, entry.locale).catch(() => null) : null;
  const answerSurface = detail?.answerSurface ?? null;
  const landingSurface = detail?.landingSurface ?? null;

  return {
    ...entry,
    summary: buildSummary({ answerSurface, landingSurface, sourceSummary: entry.summary }),
    faq: buildFaq(answerSurface),
    nextSteps: buildNextSteps(answerSurface, siteUrl),
  };
}

async function enrichCareerGuideEntry(entry: LlmsFullEntry, siteUrl: string): Promise<LlmsFullEntry> {
  if (!entry.path.includes("/career/guides/")) {
    return entry;
  }

  const slug = extractSlugFromPath(entry.path);
  const detail = slug ? await getCareerGuideFromCmsBySlug(slug, entry.locale).catch(() => null) : null;
  const answerSurface = detail?.answerSurface ?? null;
  const landingSurface = detail?.landingSurface ?? null;

  return {
    ...entry,
    summary: buildSummary({ answerSurface, landingSurface, sourceSummary: entry.summary }),
    faq: buildFaq(answerSurface),
    nextSteps: buildNextSteps(answerSurface, siteUrl),
  };
}

export async function buildLlmsFullText(siteUrl: string): Promise<string> {
  const [
    enCareerGuides,
    zhCareerGuides,
    enCareerRecommendations,
    zhCareerRecommendations,
    personalityEntries,
    topicEntries,
    enArticles,
    zhArticles,
    backendTestEntries,
    enDiscoverableContentPages,
    zhDiscoverableContentPages,
    careerJobPaths,
    enDailyGivingEntries,
    zhDailyGivingEntries,
  ] = await Promise.all([
    withLlmsRouteBudget(
      () => listCareerGuidesFromCms("en", { page: 1, perPage: LLMS_ROUTE_LIMITS.careerGuides }),
      []
    ),
    withLlmsRouteBudget(
      () => listCareerGuidesFromCms("zh", { page: 1, perPage: LLMS_ROUTE_LIMITS.careerGuides }),
      []
    ),
    withLlmsRouteBudget(
      () =>
        fetchCareerRecommendationIndex({ locale: "en" }).then((payload) =>
          limitLlmsRouteEntries(
            adaptCareerRecommendationIndex({ locale: "en", payload }),
            LLMS_ROUTE_LIMITS.careerRecommendations
          )
        ),
      []
    ),
    withLlmsRouteBudget(
      () =>
        fetchCareerRecommendationIndex({ locale: "zh" }).then((payload) =>
          limitLlmsRouteEntries(
            adaptCareerRecommendationIndex({ locale: "zh", payload }),
            LLMS_ROUTE_LIMITS.careerRecommendations
          )
        ),
      []
    ),
    withLlmsRouteBudget(() => listPersonalityEntries(), [], { timeoutMs: LLMS_FULL_PERSONALITY_SOURCE_TIMEOUT_MS }),
    withLlmsRouteBudget(() => listTopicEntries(), []),
    withLlmsRouteBudget(
      () =>
        listCmsArticlesForLlmsWithLastKnownGood({
          locale: "en",
          perPage: LLMS_ROUTE_LIMITS.articles,
          maxPages: LLMS_ROUTE_ARTICLE_MAX_PAGES,
          pageConcurrency: LLMS_FULL_ARTICLE_ENUMERATION_PAGE_CONCURRENCY,
        }).then((result) => result.value),
      [],
      { timeoutMs: LLMS_FULL_ARTICLE_ENUMERATION_TIMEOUT_MS }
    ),
    withLlmsRouteBudget(
      () =>
        listCmsArticlesForLlmsWithLastKnownGood({
          locale: "zh",
          perPage: LLMS_ROUTE_LIMITS.articles,
          maxPages: LLMS_ROUTE_ARTICLE_MAX_PAGES,
          pageConcurrency: LLMS_FULL_ARTICLE_ENUMERATION_PAGE_CONCURRENCY,
        }).then((result) => result.value),
      [],
      { timeoutMs: LLMS_FULL_ARTICLE_ENUMERATION_TIMEOUT_MS }
    ),
    withLlmsRouteBudget(
      () =>
        listBackendDiscoverabilityTestEntries().then((entries) =>
          limitLlmsRouteEntries(entries, LLMS_ROUTE_LIMITS.tests)
        ),
      [],
      { timeoutMs: LLMS_FULL_TEST_SOURCE_TIMEOUT_MS }
    ),
    withLlmsRouteBudget(
      () =>
        listDiscoverableContentPagesWithLastKnownGood("en").then((result) =>
          limitLlmsRouteEntries(result.value, LLMS_ROUTE_LIMITS.helpPages)
        ),
      [],
      { timeoutMs: LLMS_ROUTE_CONTENT_PAGE_TIMEOUT_MS }
    ),
    withLlmsRouteBudget(
      () =>
        listDiscoverableContentPagesWithLastKnownGood("zh").then((result) =>
          limitLlmsRouteEntries(result.value, LLMS_ROUTE_LIMITS.helpPages)
        ),
      [],
      { timeoutMs: LLMS_ROUTE_CONTENT_PAGE_TIMEOUT_MS }
    ),
    withLlmsRouteBudget(
      (signal) => listBackendSitemapCareerJobPaths({ limit: LLMS_ROUTE_LIMITS.careerJobs, signal }),
      [],
      { timeoutMs: LLMS_ROUTE_CAREER_JOB_TIMEOUT_MS }
    ),
    withLlmsRouteBudget(() => listDailyGivingDiscoverabilityEntries("en"), []),
    withLlmsRouteBudget(() => listDailyGivingDiscoverabilityEntries("zh"), []),
  ]);

  const helpEntries = [
    ...enDiscoverableContentPages.filter((page) => page.kind === "help").map((page) => ({
      locale: "en" as const,
      path: localizedContentPagePath(page, "en"),
      title: page.title,
      type: "help",
      summary: summaryFromRecord(page),
    })),
    ...zhDiscoverableContentPages.filter((page) => page.kind === "help").map((page) => ({
      locale: "zh" as const,
      path: localizedContentPagePath(page, "zh"),
      title: page.title,
      type: "help",
      summary: summaryFromRecord(page),
    })),
  ].filter((entry) => shouldKeep(entry.path));

  const contentPageEntries = [
    ...enDiscoverableContentPages.map((page) => ({ page, locale: "en" as const })),
    ...zhDiscoverableContentPages.map((page) => ({ page, locale: "zh" as const })),
  ]
    .filter(({ page }) => page.kind !== "help" && page.isPublic && page.isIndexable)
    .map(({ page, locale }) => ({
      locale,
      path: localizedContentPagePath(page, locale),
      title: page.title,
      type: "content_page",
      summary: summaryFromRecord(page),
      updatedAt: page.updatedAt ?? page.publishedAt ?? "",
    }))
    .filter((entry) => shouldKeep(entry.path));

  const tests = backendTestEntries
    .filter((test) => test.llmsFullEligible !== false)
    .map((test) => ({
      locale: test.locale,
      path: test.path,
      title: test.title,
      type: "test",
      updatedAt: "",
      summary: cleanText(
        test.description ||
          (test.locale === "zh"
            ? test.highlightExcerptI18n.zh || test.highlightExcerptI18n["zh-CN"] || test.highlightExcerptI18n.en
            : test.highlightExcerptI18n.en || test.highlightExcerptI18n.zh || test.highlightExcerptI18n["zh-CN"]) ||
          ""
      ),
      disclaimer: isMentalHealthScreeningTest({ slug: test.slug, scaleCode: test.scaleCode })
        ? MENTAL_HEALTH_NON_MEDICAL_DISCLAIMER[test.locale]
        : null,
    }))
    .filter((entry) => shouldKeep(entry.path));

  const articles = [...enArticles, ...zhArticles]
    .filter((article) => article.isIndexable && article.llmsEligible !== false)
    .map((article) => {
      if (!shouldKeep(article.href)) return null;
      return {
        locale: article.locale,
        path: article.href,
        title: article.title,
        type: "article",
        summary: article.excerpt,
        updatedAt: article.updatedAt,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  const guideEntries = [
    ...(enCareerGuides.filter((item) => item.isIndexable).length > 0
      ? [{ locale: "en" as const, path: "/en/career/guides", title: "Career guides", type: "career_guides_index", updatedAt: "" }]
      : []),
    ...(zhCareerGuides.filter((item) => item.isIndexable).length > 0
      ? [{ locale: "zh" as const, path: "/zh/career/guides", title: "职业指南", type: "career_guides_index", updatedAt: "" }]
      : []),
    ...enCareerGuides
      .filter((item) => item.isIndexable)
      .map((item) => ({
        locale: "en" as const,
        path: item.href,
        title: item.title,
        type: "career_guide",
        summary: summaryFromRecord(item),
        updatedAt: item.updatedAt ?? "",
      })),
    ...zhCareerGuides
      .filter((item) => item.isIndexable)
      .map((item) => ({
        locale: "zh" as const,
        path: item.href,
        title: item.title,
        type: "career_guide",
        summary: summaryFromRecord(item),
        updatedAt: item.updatedAt ?? "",
      })),
  ].filter((entry) => shouldKeep(entry.path));

  const careers = [
    { locale: "en" as const, path: "/en/career", title: "Career center", type: "career_index", updatedAt: "" },
    { locale: "zh" as const, path: "/zh/career", title: "职业发展中心", type: "career_index", updatedAt: "" },
    { locale: "en" as const, path: "/en/career/recommendations", title: "Career recommendations", type: "career_recommendations_index", updatedAt: "" },
    { locale: "zh" as const, path: "/zh/career/recommendations", title: "职业推荐", type: "career_recommendations_index", updatedAt: "" },
    ...guideEntries,
    ...enCareerRecommendations.filter(shouldKeepCareerAuthorityEntry).map((item) => ({
      locale: "en" as const,
      path: item.href,
      title: item.recommendationSubjectMeta.displayTitle,
      type: "career_recommendation",
      updatedAt: item.provenanceMeta.compiledAt ?? "",
    })),
    ...zhCareerRecommendations.filter(shouldKeepCareerAuthorityEntry).map((item) => ({
      locale: "zh" as const,
      path: item.href,
      title: item.recommendationSubjectMeta.displayTitle,
      type: "career_recommendation",
      updatedAt: item.provenanceMeta.compiledAt ?? "",
    })),
    ...careerJobPaths
      .map((path) => buildCareerJobEntry(path))
      .filter((entry): entry is LlmsFullEntry => Boolean(entry)),
  ].filter((entry) => shouldKeep(entry.path));
  const dailyGivingEntries = [...enDailyGivingEntries, ...zhDailyGivingEntries]
    .map((entry) => ({
      locale: entry.locale,
      path: entry.path,
      title: entry.title,
      type: entry.type,
      summary: entry.summary,
      updatedAt: entry.updatedAt,
    }))
    .filter((entry) => shouldKeep(entry.path));

  const canonicalEntrypoints = canonicalEntrypointEntries(siteUrl);
  const limitedTopicEntries = limitLlmsRouteEntries(topicEntries, LLMS_ROUTE_LIMITS.topics);
  const limitedArticleEntries = limitLlmsRouteEntries(articles, LLMS_FULL_ARTICLE_ENTRY_LIMIT);
  const limitedGuideEntries = limitLlmsRouteEntries(guideEntries, LLMS_ROUTE_LIMITS.careerGuides);
  const allowedCitationPaths = buildAllowedCitationPaths([
    ...canonicalEntrypoints,
    ...personalityEntries,
    ...limitedTopicEntries,
    ...helpEntries,
    ...contentPageEntries,
    ...dailyGivingEntries,
    ...tests,
    ...limitedArticleEntries,
    ...careers,
  ]);

  const [enrichedPersonalityEntries, enrichedTopicEntries, enrichedArticles, enrichedGuideEntries] = await Promise.all([
    mapWithConcurrency(
      personalityEntries,
      ENRICHMENT_CONCURRENCY,
      (entry) => withLlmsRouteBudget(() => enrichPersonalityEntry(entry, siteUrl), entry, { timeoutMs: LLMS_FULL_ENRICHMENT_TIMEOUT_MS })
    ),
    mapWithConcurrency(
      limitedTopicEntries,
      ENRICHMENT_CONCURRENCY,
      (entry) => withLlmsRouteBudget(() => enrichTopicEntry(entry, siteUrl), entry, { timeoutMs: LLMS_FULL_ENRICHMENT_TIMEOUT_MS })
    ),
    mapWithConcurrency(
      limitedArticleEntries,
      ENRICHMENT_CONCURRENCY,
      (entry) => withLlmsRouteBudget(() => enrichArticleEntry(entry, siteUrl), entry, { timeoutMs: LLMS_FULL_ENRICHMENT_TIMEOUT_MS })
    ),
    mapWithConcurrency(
      limitedGuideEntries,
      ENRICHMENT_CONCURRENCY,
      (entry) => withLlmsRouteBudget(() => enrichCareerGuideEntry(entry, siteUrl), entry, { timeoutMs: LLMS_FULL_ENRICHMENT_TIMEOUT_MS })
    ),
  ]);

  const enrichedCareerPathMap = new Map(enrichedGuideEntries.map((entry) => [`${entry.locale}:${entry.path}`, entry]));
  const enrichedCareers = careers.map((entry) => enrichedCareerPathMap.get(`${entry.locale}:${entry.path}`) ?? entry);

  const lines = [
    "# FermatMind llms-full.txt",
    `Generated-At: ${new Date().toISOString()}`,
    `Site: ${siteUrl}`,
    "",
    "## Citation Policy",
    "- Prefer canonical public URLs only.",
    "- Prefer answer-first, breadcrumb, FAQ, and structured list sections when available.",
    "- Exclude noindex and private user-flow paths.",
    "",
    "## Canonical Entrypoints",
    ...canonicalEntrypoints.flatMap((entry) => formatEntry(entry, siteUrl, allowedCitationPaths)),
    "",
    "## Personality",
    ...enrichedPersonalityEntries.flatMap((entry) => formatEntry(entry, siteUrl, allowedCitationPaths)),
    "",
    "## Topics",
    ...enrichedTopicEntries.flatMap((entry) => formatEntry(entry, siteUrl, allowedCitationPaths)),
    "",
    "## Help",
    ...helpEntries.flatMap((entry) => formatEntry(entry, siteUrl, allowedCitationPaths)),
    "",
    "## Content Pages",
    ...contentPageEntries.flatMap((entry) => formatEntry(entry, siteUrl, allowedCitationPaths)),
    "",
    "## Foundation Daily Giving",
    ...dailyGivingEntries.flatMap((entry) => formatEntry(entry, siteUrl, allowedCitationPaths)),
    "",
    "## Tests",
    ...tests.flatMap((entry) => formatEntry(entry, siteUrl, allowedCitationPaths)),
    "",
    "## Articles",
    ...enrichedArticles.flatMap((entry) => formatEntry(entry, siteUrl, allowedCitationPaths)),
    "",
    "## Career",
    ...enrichedCareers.flatMap((entry) => formatEntry(entry, siteUrl, allowedCitationPaths)),
    "",
    "## Sitemap",
    `- ${toCanonical(siteUrl, "/sitemap.xml")}`,
  ];

  return lines.join("\n");
}

export async function buildAndCacheLlmsFullText(siteUrl: string, text = ""): Promise<{
  ok: boolean;
  cachePath: string;
  bytes: number;
  careerJobUrlCount: number;
}> {
  const resolvedText = text || (await buildLlmsFullText(siteUrl));
  const mbtiPersonalityPaths = await listBackendSitemapMbtiPersonalityPaths().catch(() => []);
  const cacheOptions = {
    isCacheable: (value: string) => isCompleteLlmsFullText(value, siteUrl, mbtiPersonalityPaths),
  };
  const result = await writeLlmsFullResponseCache(siteUrl, resolvedText, cacheOptions);

  return {
    ok: result.cached,
    cachePath: result.cachePath,
    bytes: Buffer.byteLength(resolvedText, "utf8"),
    careerJobUrlCount: canonicalCareerJobUrlSet(resolvedText, siteUrl).size,
  };
}

export async function GET() {
  if (isConfiguredStagingDiscoverability()) {
    return createConfiguredStagingLlmsResponse();
  }

  const siteUrl = getSiteUrlOrThrow();
  const mbtiPersonalityPaths = await withLlmsRouteBudget(
    (signal) => listBackendSitemapMbtiPersonalityPaths({ signal }),
    [],
    { timeoutMs: LLMS_FULL_PERSONALITY_SOURCE_TIMEOUT_MS }
  );
  const cacheOptions = {
    isCacheable: (text: string) => isCompleteLlmsFullText(text, siteUrl, mbtiPersonalityPaths),
  };
  const freshCachedText = await getCachedLlmsFullText(siteUrl, LLMS_FULL_CACHE_FRESH_MS, cacheOptions);
  if (freshCachedText) {
    return createLlmsFullResponse(freshCachedText, "complete", "cache");
  }

  const buildResult = await waitForLlmsFullBuildBudget(getOrStartLlmsFullBuild(siteUrl, buildLlmsFullText, cacheOptions));
  if (typeof buildResult === "string") {
    return createLlmsFullResponse(buildResult, "complete", "generated");
  }

  const staleCachedText = await getCachedLlmsFullText(siteUrl, LLMS_FULL_CACHE_STALE_MS, cacheOptions);
  if (staleCachedText) {
    return createLlmsFullResponse(staleCachedText, "complete", "stale-cache");
  }

  return createLlmsFullResponse(await buildDegradedLlmsFullText(siteUrl), "degraded", "degraded");
}
