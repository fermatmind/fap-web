import { ApiError, apiClient } from "@/lib/api-client";
import type { SeoSurfaceRaw } from "@/lib/api/v0_3";
import { buildDefaultPublicPersonalitySlug } from "@/lib/cms/personality";
import { getCareerGuideBySlug, listCareerGuides, listCareerJobs } from "@/lib/content";
import { localizedPath, normalizeLocale, toApiLocale, type Locale } from "@/lib/i18n/locales";
import { normalizeSeoSurface, type SeoSurfaceViewModel } from "@/lib/seo/seoSurface";
import { canonicalUrl } from "@/lib/site";

type CmsCareerRecommendationListItemApi = {
  runtime_type_code?: string | null;
  canonical_type_code?: string | null;
  display_type?: string | null;
  variant_code?: string | null;
  public_route_slug?: string | null;
  type_name?: string | null;
  nickname?: string | null;
  hero_summary?: string | null;
};

type CmsCareerRecommendationListApiResponse = {
  items?: CmsCareerRecommendationListItemApi[];
};

type CmsCareerRecommendationSectionApi = {
  title?: string | null;
  paragraphs?: unknown;
  items?: unknown;
  intro?: string | null;
  groups?: unknown;
  outro?: string | null;
  bullets?: unknown;
};

type CmsCareerRecommendationMatchedJobApi = {
  slug?: string | null;
  title?: string | null;
  summary?: string | null;
  fit_bucket?: string | null;
  fit_personality_codes?: unknown;
  mbti_primary_codes?: unknown;
  mbti_secondary_codes?: unknown;
};

type CmsCareerRecommendationMatchedGuideApi = {
  slug?: string | null;
  title?: string | null;
  summary?: string | null;
  fit_personality_codes?: unknown;
};

type CmsCareerRecommendationSeoApi = {
  title?: string | null;
  description?: string | null;
  canonical?: string | null;
  alternates?: Record<string, string | null | undefined> | null;
};

type CmsCareerRecommendationDetailApiResponse = CmsCareerRecommendationListItemApi & {
  graph_type_code?: string | null;
  keywords?: unknown;
  career?: {
    summary?: CmsCareerRecommendationSectionApi | null;
    advantages?: CmsCareerRecommendationSectionApi | null;
    weaknesses?: CmsCareerRecommendationSectionApi | null;
    preferred_roles?: CmsCareerRecommendationSectionApi | null;
    upgrade_suggestions?: CmsCareerRecommendationSectionApi | null;
  } | null;
  matched_jobs?: CmsCareerRecommendationMatchedJobApi[];
  matched_guides?: CmsCareerRecommendationMatchedGuideApi[];
  seo?: CmsCareerRecommendationSeoApi | null;
  _meta?: {
    public_route_type?: string | null;
    route_mode?: string | null;
    authority_source?: string | null;
  } | null;
  seo_surface_v1?: SeoSurfaceRaw | null;
};

export type CareerRecommendationListItem = {
  runtimeTypeCode: string;
  canonicalTypeCode: string;
  displayType: string;
  variantCode: string | null;
  publicRouteSlug: string;
  typeName: string;
  nickname: string;
  heroSummary: string;
  href: string;
};

export type CareerRecommendationNarrativeSummary = {
  title: string | null;
  paragraphs: string[];
};

export type CareerRecommendationNarrativeBullet = {
  title: string | null;
  description: string | null;
};

export type CareerRecommendationNarrativeBulletGroup = {
  title: string | null;
  items: CareerRecommendationNarrativeBullet[];
};

export type CareerRecommendationPreferredRoleGroup = {
  groupTitle: string | null;
  description: string | null;
  examples: string[];
};

export type CareerRecommendationPreferredRoles = {
  title: string | null;
  intro: string | null;
  groups: CareerRecommendationPreferredRoleGroup[];
  outro: string | null;
};

export type CareerRecommendationUpgradeBullet = {
  label: string | null;
  content: string | null;
};

export type CareerRecommendationUpgradeSuggestions = {
  title: string | null;
  paragraphs: string[];
  bullets: CareerRecommendationUpgradeBullet[];
};

export type CareerRecommendationMatchedJob = {
  slug: string;
  title: string;
  summary: string;
  fitBucket: "primary" | "secondary" | null;
  fitPersonalityCodes: string[];
  mbtiPrimaryCodes: string[];
  mbtiSecondaryCodes: string[];
  href: string;
};

export type CareerRecommendationMatchedGuide = {
  slug: string;
  title: string;
  summary: string;
  fitPersonalityCodes: string[];
  href: string;
};

export type CareerRecommendationSeoViewModel = {
  meta: {
    title: string;
    description: string;
    canonical: string | null;
    alternates: {
      en: string | null;
      "zh-CN": string | null;
    };
    og: {
      title: string;
      description: string;
      image: string | null;
      type: string;
    };
    twitter: {
      card: string;
      title: string;
      description: string;
      image: string | null;
    };
    robots: string;
  };
  surface: SeoSurfaceViewModel | null;
};

export type CareerRecommendationDetail = CareerRecommendationListItem & {
  graphTypeCode: string;
  keywords: string[];
  career: {
    summary: CareerRecommendationNarrativeSummary;
    advantages: CareerRecommendationNarrativeBulletGroup;
    weaknesses: CareerRecommendationNarrativeBulletGroup;
    preferredRoles: CareerRecommendationPreferredRoles;
    upgradeSuggestions: CareerRecommendationUpgradeSuggestions;
  };
  matchedJobs: CareerRecommendationMatchedJob[];
  matchedGuides: CareerRecommendationMatchedGuide[];
  seo: CareerRecommendationSeoViewModel;
  meta: {
    publicRouteType: string | null;
    routeMode: string | null;
    authoritySource: string | null;
  };
};

const DEFAULT_ORG_ID = "0";
const MBTI_CANONICAL_CODE_RE = /^[IE][NS][FT][JP]$/i;
const MBTI_PUBLIC_ROUTE_RE = /^[IE][NS][FT][JP]-[AT]$/i;

type FallbackCareerJobCandidate = {
  slug: string;
  title: string;
  summary: string;
  fitBucket: "primary" | "secondary";
};

function buildQuery(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    query.set(key, String(value));
  }

  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
}

function normalizeText(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value !== "string" && typeof value !== "number") {
      continue;
    }

    const normalized = String(value).trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function normalizeNullableText(...values: unknown[]): string | null {
  const text = normalizeText(...values);
  return text || null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function isCareerRecommendationListItemApi(value: unknown): value is CmsCareerRecommendationListItemApi {
  return asRecord(value) !== null;
}

function isCareerRecommendationMatchedJobApi(value: unknown): value is CmsCareerRecommendationMatchedJobApi {
  return asRecord(value) !== null;
}

function isCareerRecommendationMatchedGuideApi(value: unknown): value is CmsCareerRecommendationMatchedGuideApi {
  return asRecord(value) !== null;
}

function uniqueStrings(items: string[]): string[] {
  return [...new Set(items.filter(Boolean))];
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return uniqueStrings(value.map((item) => normalizeText(item).toUpperCase()).filter(Boolean));
}

function normalizeParagraphs(value: unknown): string[] {
  if (Array.isArray(value)) {
    return uniqueStrings(
      value
        .map((item) => normalizeText(item))
        .filter(Boolean)
    );
  }

  const raw = normalizeText(value);
  if (!raw) {
    return [];
  }

  return raw
    .split(/\n{2,}/)
    .map((part) => part.replace(/\r\n?/g, "\n").trim())
    .filter(Boolean);
}

function normalizeCareerRecommendationSlug(value: unknown): string {
  return normalizeText(value).toLowerCase();
}

function normalizeAbsoluteUrl(value: string | null | undefined, fallbackPath: string): string | null {
  const normalized = normalizeText(value);
  if (!normalized) {
    return fallbackPath ? canonicalUrl(fallbackPath) : null;
  }

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  if (normalized.startsWith("/")) {
    return canonicalUrl(normalized);
  }

  return fallbackPath ? canonicalUrl(fallbackPath) : null;
}

function normalizeApiLocale(locale: Locale | string): "en" | "zh-CN" {
  return toApiLocale(locale);
}

function normalizeMbtiCanonicalCode(value: unknown): string {
  const normalized = normalizeText(value).toUpperCase();
  return MBTI_CANONICAL_CODE_RE.test(normalized) ? normalized : "";
}

function normalizeMbtiPublicRouteSlug(value: unknown): string {
  const normalized = normalizeCareerRecommendationSlug(value);
  if (MBTI_PUBLIC_ROUTE_RE.test(normalized)) {
    return normalized;
  }

  const canonical = normalizeMbtiCanonicalCode(normalized);
  if (!canonical) {
    return "";
  }

  return buildDefaultPublicPersonalitySlug(canonical);
}

function buildFallbackTypeName(canonicalTypeCode: string, locale: Locale): string {
  return locale === "zh" ? `${canonicalTypeCode} 职业建议` : `${canonicalTypeCode} career guidance`;
}

function buildFallbackHeroSummary(displayType: string, locale: Locale): string {
  return locale === "zh"
    ? `${displayType} 的职业建议在本地回退模式下仍会保留岗位匹配、职业指南和公开回链。`
    : `${displayType} career guidance stays available in local fallback mode with role matches, guides, and public backlinks.`;
}

function buildFallbackJobCandidates(locale: Locale, canonicalTypeCode: string): FallbackCareerJobCandidate[] {
  const localizedJobs = listCareerJobs(locale);
  const primary = localizedJobs
    .filter((job) => job.mbti_primary.includes(canonicalTypeCode))
    .map<FallbackCareerJobCandidate>((job) => ({
      slug: job.slug,
      title: job.title,
      summary: job.summary,
      fitBucket: "primary",
    }));
  const secondary = localizedJobs
    .filter(
      (job) =>
        !job.mbti_primary.includes(canonicalTypeCode) &&
        job.mbti_secondary.includes(canonicalTypeCode)
    )
    .map<FallbackCareerJobCandidate>((job) => ({
      slug: job.slug,
      title: job.title,
      summary: job.summary,
      fitBucket: "secondary",
    }));

  return [...primary, ...secondary].slice(0, 6);
}

function buildFallbackMatchedGuides(
  locale: Locale,
  matchedJobSlugs: string[]
): CareerRecommendationMatchedGuide[] {
  return listCareerGuides(locale)
    .filter(
      (guide) =>
        Array.isArray(guide.related_job_slugs) &&
        guide.related_job_slugs.some((slug) => matchedJobSlugs.includes(String(slug)))
    )
    .slice(0, 3)
    .map((guide) => {
      const localizedGuide = getCareerGuideBySlug(guide.slug, locale) ?? guide;

      return {
        slug: localizedGuide.slug,
        title: localizedGuide.title,
        summary: localizedGuide.summary,
        fitPersonalityCodes: [],
        href: localizedPath(`/career/guides/${localizedGuide.slug}`, locale),
      };
    });
}

function buildFallbackCareerRecommendationList(locale: Locale): CareerRecommendationListItem[] {
  const counts = new Map<string, number>();

  for (const job of listCareerJobs(locale)) {
    for (const code of [...job.mbti_primary, ...job.mbti_secondary]) {
      const normalizedCode = normalizeMbtiCanonicalCode(code);
      if (!normalizedCode) {
        continue;
      }

      counts.set(normalizedCode, (counts.get(normalizedCode) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([canonicalTypeCode]) => {
      const publicRouteSlug = buildDefaultPublicPersonalitySlug(canonicalTypeCode);
      const displayType = publicRouteSlug.toUpperCase();

      return {
        runtimeTypeCode: displayType,
        canonicalTypeCode,
        displayType,
        variantCode: publicRouteSlug.endsWith("-t") ? "T" : "A",
        publicRouteSlug,
        typeName: buildFallbackTypeName(canonicalTypeCode, locale),
        nickname: "",
        heroSummary: buildFallbackHeroSummary(displayType, locale),
        href: buildCareerRecommendationFrontendUrl(locale, publicRouteSlug),
      };
    });
}

function buildFallbackCareerRecommendationDetail(
  localeInput: Locale | string,
  type: string
): CareerRecommendationDetail | null {
  const locale = normalizeLocale(localeInput);
  const publicRouteSlug = normalizeMbtiPublicRouteSlug(type);
  if (!publicRouteSlug) {
    return null;
  }

  const canonicalTypeCode = normalizeMbtiCanonicalCode(publicRouteSlug.slice(0, 4));
  if (!canonicalTypeCode) {
    return null;
  }

  const displayType = publicRouteSlug.toUpperCase();
  const matchedJobs = buildFallbackJobCandidates(locale, canonicalTypeCode).map<CareerRecommendationMatchedJob>((job) => ({
    slug: job.slug,
    title: job.title,
    summary: job.summary,
    fitBucket: job.fitBucket,
    fitPersonalityCodes: [canonicalTypeCode],
    mbtiPrimaryCodes: job.fitBucket === "primary" ? [canonicalTypeCode] : [],
    mbtiSecondaryCodes: job.fitBucket === "secondary" ? [canonicalTypeCode] : [],
    href: localizedPath(`/career/jobs/${job.slug}`, locale),
  }));
  const matchedGuides = buildFallbackMatchedGuides(
    locale,
    matchedJobs.map((job) => job.slug)
  );
  const firstRoleTitles = matchedJobs.slice(0, 3).map((job) => job.title);
  const description =
    locale === "zh"
      ? `${displayType} 的职业建议在本地回退模式下仍会优先展示岗位匹配、公开回链与延续入口。`
      : `${displayType} career guidance remains available in local fallback mode with role fit, public backlinks, and continuity carryover.`;

  return {
    runtimeTypeCode: displayType,
    canonicalTypeCode,
    displayType,
    variantCode: publicRouteSlug.endsWith("-t") ? "T" : "A",
    publicRouteSlug,
    typeName: buildFallbackTypeName(canonicalTypeCode, locale),
    nickname: "",
    heroSummary: buildFallbackHeroSummary(displayType, locale),
    href: buildCareerRecommendationFrontendUrl(locale, publicRouteSlug),
    graphTypeCode: canonicalTypeCode,
    keywords: [canonicalTypeCode, publicRouteSlug, "career"],
    career: {
      summary: {
        title: locale === "zh" ? "职业概览" : "Career summary",
        paragraphs: [
          locale === "zh"
            ? `${displayType} 在职业路径上更适合先查看高结构、高杠杆和可持续复用的岗位场景。`
            : `${displayType} tends to benefit from roles with structured leverage, clear scope, and repeatable execution loops.`,
        ],
      },
      advantages: {
        title: locale === "zh" ? "优势场景" : "Advantages",
        items: [
          {
            title: locale === "zh" ? "岗位匹配仍可用" : "Role fit stays available",
            description:
              locale === "zh"
                ? "即使后端 recommendation authority 暂时不可用，本地回退仍会保留高匹配岗位入口。"
                : "Even without the backend recommendation authority, local fallback keeps high-fit role entries available.",
          },
        ],
      },
      weaknesses: {
        title: locale === "zh" ? "使用边界" : "Watchouts",
        items: [
          {
            title: locale === "zh" ? "仅作为回退层" : "Fallback-only layer",
            description:
              locale === "zh"
                ? "本地回退不会替代正式后端 authority，只用于保证公开路由可读。"
                : "This local layer does not replace the backend authority; it only keeps the public route readable.",
          },
        ],
      },
      preferredRoles: {
        title: locale === "zh" ? "优先查看岗位" : "Preferred roles",
        intro:
          locale === "zh"
            ? "先看这些公开岗位说明，再结合人格页与主题页做判断。"
            : "Start with these public role pages, then validate the decision against the personality and topic pages.",
        groups: [
          {
            groupTitle: locale === "zh" ? "高匹配岗位" : "High-fit roles",
            description:
              locale === "zh"
                ? "这些岗位来自本地数据集中对该 canonical family 的优先匹配。"
                : "These roles come from the local dataset's primary fit for this canonical family.",
            examples: firstRoleTitles,
          },
        ],
        outro:
          locale === "zh"
            ? "回退模式下仍建议优先以岗位内容和职业指南为准。"
            : "In fallback mode, prioritize the role pages and career guides over personality labels alone.",
      },
      upgradeSuggestions: {
        title: locale === "zh" ? "下一步建议" : "Upgrade suggestions",
        paragraphs: [
          locale === "zh"
            ? "把职业推荐页当成公开入口，再回到人格页和帮助页交叉验证。"
            : "Use the career recommendation page as a public entrypoint, then cross-check with the personality and help pages.",
        ],
        bullets: [
          {
            label: locale === "zh" ? "先看岗位" : "Start with roles",
            content:
              locale === "zh"
                ? "先浏览 2-3 个高匹配岗位，再判断你真正想继续的方向。"
                : "Review 2-3 high-fit roles first, then decide which direction is worth pursuing further.",
          },
        ],
      },
    },
    matchedJobs,
    matchedGuides,
    seo: normalizeCareerRecommendationSeo(
      {
        title:
          locale === "zh"
            ? `${displayType} 职业推荐 | FermatMind`
            : `${displayType} Career Recommendations | FermatMind`,
        description,
        canonical: buildCareerRecommendationFrontendUrl(locale, publicRouteSlug),
        alternates: {
          en: buildCareerRecommendationFrontendUrl("en", publicRouteSlug),
          "zh-CN": buildCareerRecommendationFrontendUrl("zh", publicRouteSlug),
        },
      },
      locale,
      publicRouteSlug,
      locale === "zh" ? `${displayType} 职业推荐` : `${displayType} Career Recommendations`,
      description
    ),
    meta: {
      publicRouteType: "32-type",
      routeMode: "local_fallback",
      authoritySource: "career_recommendation_local_fallback.v1",
    },
  };
}

function normalizeMatchedJob(
  raw: CmsCareerRecommendationMatchedJobApi,
  locale: Locale | string
): CareerRecommendationMatchedJob | null {
  const slug = normalizeCareerRecommendationSlug(raw.slug);
  const title = normalizeText(raw.title);
  if (!slug || !title) {
    return null;
  }

  const fitBucket = normalizeText(raw.fit_bucket).toLowerCase();

  return {
    slug,
    title,
    summary: normalizeText(raw.summary),
    fitBucket: fitBucket === "primary" || fitBucket === "secondary" ? fitBucket : null,
    fitPersonalityCodes: normalizeStringArray(raw.fit_personality_codes),
    mbtiPrimaryCodes: normalizeStringArray(raw.mbti_primary_codes),
    mbtiSecondaryCodes: normalizeStringArray(raw.mbti_secondary_codes),
    href: localizedPath(`/career/jobs/${slug}`, normalizeLocale(locale)),
  };
}

function normalizeMatchedGuide(
  raw: CmsCareerRecommendationMatchedGuideApi,
  locale: Locale | string
): CareerRecommendationMatchedGuide | null {
  const slug = normalizeCareerRecommendationSlug(raw.slug);
  const title = normalizeText(raw.title);
  if (!slug || !title) {
    return null;
  }

  return {
    slug,
    title,
    summary: normalizeText(raw.summary),
    fitPersonalityCodes: normalizeStringArray(raw.fit_personality_codes),
    href: localizedPath(`/career/guides/${slug}`, normalizeLocale(locale)),
  };
}

function normalizeBulletGroup(raw: CmsCareerRecommendationSectionApi | null | undefined): CareerRecommendationNarrativeBulletGroup {
  return {
    title: normalizeNullableText(raw?.title),
    items: asArray<Record<string, unknown>>(raw?.items).map((item) => ({
      title: normalizeNullableText(item.title),
      description: normalizeNullableText(item.description, item.body),
    })),
  };
}

function normalizePreferredRoles(raw: CmsCareerRecommendationSectionApi | null | undefined): CareerRecommendationPreferredRoles {
  return {
    title: normalizeNullableText(raw?.title),
    intro: normalizeNullableText(raw?.intro),
    groups: asArray<Record<string, unknown>>(raw?.groups).map((group) => ({
      groupTitle: normalizeNullableText(group.group_title, group.title),
      description: normalizeNullableText(group.description),
      examples: uniqueStrings(asArray(group.examples).map((item) => normalizeText(item)).filter(Boolean)),
    })),
    outro: normalizeNullableText(raw?.outro),
  };
}

function normalizeUpgradeSuggestions(
  raw: CmsCareerRecommendationSectionApi | null | undefined
): CareerRecommendationUpgradeSuggestions {
  return {
    title: normalizeNullableText(raw?.title),
    paragraphs: normalizeParagraphs(raw?.paragraphs),
    bullets: asArray<Record<string, unknown>>(raw?.bullets).map((item) => ({
      label: normalizeNullableText(item.label, item.title),
      content: normalizeNullableText(item.content, item.body),
    })),
  };
}

function normalizeCareerRecommendationSeo(
  raw: CmsCareerRecommendationSeoApi | null | undefined,
  locale: Locale | string,
  slug: string,
  title: string,
  description: string
): CareerRecommendationSeoViewModel {
  const canonicalPath = buildCareerRecommendationFrontendUrl(locale, slug);

  return {
    meta: {
      title: normalizeText(raw?.title, title),
      description: normalizeText(raw?.description, description),
      canonical: normalizeAbsoluteUrl(raw?.canonical, canonicalPath),
      alternates: {
        en: normalizeAbsoluteUrl(raw?.alternates?.en, buildCareerRecommendationFrontendUrl("en", slug)),
        "zh-CN": normalizeAbsoluteUrl(raw?.alternates?.["zh-CN"], buildCareerRecommendationFrontendUrl("zh", slug)),
      },
      og: {
        title: normalizeText(raw?.title, title),
        description: normalizeText(raw?.description, description),
        image: null,
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: normalizeText(raw?.title, title),
        description: normalizeText(raw?.description, description),
        image: null,
      },
      robots: "index,follow",
    },
    surface: null,
  };
}

export function buildCareerRecommendationFrontendUrl(locale: Locale | string, slug: string): string {
  return localizedPath(
    `/career/recommendations/mbti/${normalizeCareerRecommendationSlug(slug)}`,
    normalizeLocale(locale)
  );
}

export function normalizeCareerRecommendationListItem(
  raw: CmsCareerRecommendationListItemApi,
  locale: Locale | string
): CareerRecommendationListItem | null {
  const publicRouteSlug = normalizeCareerRecommendationSlug(raw.public_route_slug);
  const canonicalTypeCode = normalizeText(raw.canonical_type_code).toUpperCase();
  const displayType = normalizeText(raw.display_type, raw.runtime_type_code, canonicalTypeCode).toUpperCase();

  if (!publicRouteSlug || !canonicalTypeCode || !displayType) {
    return null;
  }

  return {
    runtimeTypeCode: normalizeText(raw.runtime_type_code, displayType).toUpperCase(),
    canonicalTypeCode,
    displayType,
    variantCode: normalizeNullableText(raw.variant_code)?.toUpperCase() ?? null,
    publicRouteSlug,
    typeName: normalizeText(raw.type_name, displayType),
    nickname: normalizeText(raw.nickname),
    heroSummary: normalizeText(raw.hero_summary),
    href: buildCareerRecommendationFrontendUrl(locale, publicRouteSlug),
  };
}

export function normalizeCareerRecommendationDetail(
  raw: CmsCareerRecommendationDetailApiResponse | null,
  locale: Locale | string
): CareerRecommendationDetail | null {
  if (!raw) {
    return null;
  }

  const listItem = normalizeCareerRecommendationListItem(raw, locale);
  if (!listItem) {
    return null;
  }

  const summary = raw.career?.summary ?? null;
  const heroSummary = normalizeText(raw.hero_summary, raw.seo?.description);

  return {
    ...listItem,
    graphTypeCode: normalizeText(raw.graph_type_code, listItem.canonicalTypeCode).toUpperCase(),
    keywords: uniqueStrings(asArray(raw.keywords).map((item) => normalizeText(item)).filter(Boolean)),
    career: {
      summary: {
        title: normalizeNullableText(summary?.title),
        paragraphs: normalizeParagraphs(summary?.paragraphs),
      },
      advantages: normalizeBulletGroup(raw.career?.advantages),
      weaknesses: normalizeBulletGroup(raw.career?.weaknesses),
      preferredRoles: normalizePreferredRoles(raw.career?.preferred_roles),
      upgradeSuggestions: normalizeUpgradeSuggestions(raw.career?.upgrade_suggestions),
    },
    matchedJobs: asArray(raw.matched_jobs)
      .filter(isCareerRecommendationMatchedJobApi)
      .map((item) => normalizeMatchedJob(item, locale))
      .filter((item): item is CareerRecommendationMatchedJob => item !== null),
    matchedGuides: asArray(raw.matched_guides)
      .filter(isCareerRecommendationMatchedGuideApi)
      .map((item) => normalizeMatchedGuide(item, locale))
      .filter((item): item is CareerRecommendationMatchedGuide => item !== null),
    seo: {
      ...normalizeCareerRecommendationSeo(raw.seo, locale, listItem.publicRouteSlug, listItem.typeName, heroSummary),
      surface: normalizeSeoSurface(raw.seo_surface_v1 ?? null),
    },
    meta: {
      publicRouteType: normalizeNullableText(raw._meta?.public_route_type),
      routeMode: normalizeNullableText(raw._meta?.route_mode),
      authoritySource: normalizeNullableText(raw._meta?.authority_source),
    },
  };
}

export async function listMbtiCareerRecommendations(locale: Locale | string): Promise<CareerRecommendationListItem[]> {
  const normalizedLocale = normalizeLocale(locale);
  const query = buildQuery({
    locale: normalizeApiLocale(locale),
    org_id: DEFAULT_ORG_ID,
  });

  try {
    const response = await apiClient.get<CmsCareerRecommendationListApiResponse>(
      `/v0.5/career-recommendations/mbti${query}`,
      {
        locale,
        skipAuth: true,
        cache: "no-store",
      }
    );

    return asArray(response.items)
      .filter(isCareerRecommendationListItemApi)
      .map((item) => normalizeCareerRecommendationListItem(item, locale))
      .filter((item): item is CareerRecommendationListItem => item !== null);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return buildFallbackCareerRecommendationList(normalizedLocale);
    }

    return buildFallbackCareerRecommendationList(normalizedLocale);
  }
}

export async function getMbtiCareerRecommendationByType(
  locale: Locale | string,
  type: string
): Promise<CareerRecommendationDetail | null> {
  const normalizedType = normalizeText(type);
  if (!normalizedType) {
    return null;
  }

  const query = buildQuery({
    locale: normalizeApiLocale(locale),
    org_id: DEFAULT_ORG_ID,
  });

  try {
    const response = await apiClient.get<CmsCareerRecommendationDetailApiResponse>(
      `/v0.5/career-recommendations/mbti/${encodeURIComponent(normalizedType)}${query}`,
      {
        locale,
        skipAuth: true,
        cache: "no-store",
      }
    );

    return normalizeCareerRecommendationDetail(response, locale);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return buildFallbackCareerRecommendationDetail(locale, normalizedType);
    }

    return buildFallbackCareerRecommendationDetail(locale, normalizedType);
  }
}
