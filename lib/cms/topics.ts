import { ApiError, apiClient } from "@/lib/api-client";
import type { AnswerSurfaceRaw, LandingSurfaceRaw, SeoSurfaceRaw } from "@/lib/api/v0_3";
import { normalizeAnswerSurface, type AnswerSurfaceViewModel } from "@/lib/answer/answerSurface";
import { canonicalUrl } from "@/lib/site";
import { localizedPath, normalizeLocale, toApiLocale, type Locale } from "@/lib/i18n/locales";
import { normalizeLandingSurface, type LandingSurfaceViewModel } from "@/lib/landing/landingSurface";
import { PUBLIC_API_CACHE_OPTIONS } from "@/lib/publicApiCache";
import { normalizeSeoSurface, type SeoSurfaceViewModel } from "@/lib/seo/seoSurface";
import { normalizeInternalHref } from "@/lib/url/safeContentUrls";

const DEFAULT_ORG_ID = "0";
const DEFAULT_PER_PAGE = 100;

type CmsTopicApiSeoMeta = {
  seo_title?: string | null;
  seo_description?: string | null;
  canonical_url?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image_url?: string | null;
  twitter_title?: string | null;
  twitter_description?: string | null;
  twitter_image_url?: string | null;
  robots?: string | null;
  jsonld_overrides_json?: unknown;
} | null;

type CmsTopicApiProfile = {
  id?: number;
  org_id?: number;
  topic_code?: string;
  slug?: string;
  locale?: string;
  title?: string;
  subtitle?: string | null;
  excerpt?: string | null;
  hero_kicker?: string | null;
  hero_quote?: string | null;
  cover_image_url?: string | null;
  status?: string;
  is_public?: boolean;
  is_indexable?: boolean;
  published_at?: string | null;
  updated_at?: string | null;
  seo_meta?: CmsTopicApiSeoMeta;
};

type CmsTopicApiSection = {
  section_key?: string;
  title?: string | null;
  render_variant?: string;
  body_md?: string | null;
  body_html?: string | null;
  payload_json?: unknown;
  sort_order?: number;
  is_enabled?: boolean;
};

type CmsTopicApiEntry = {
  entry_type?: string;
  group_key?: string;
  target_key?: string;
  title?: string;
  excerpt?: string | null;
  url?: string;
  badge_label?: string | null;
  cta_label?: string | null;
  image_url?: string | null;
  is_featured?: boolean;
};

type CmsTopicListApiResponse = {
  ok?: boolean;
  items?: CmsTopicApiProfile[];
  landing_surface_v1?: LandingSurfaceRaw | null;
  pagination?: {
    current_page?: number;
    per_page?: number;
    total?: number;
    last_page?: number;
  };
};

type CmsTopicDetailApiResponse = {
  ok?: boolean;
  profile?: CmsTopicApiProfile | null;
  sections?: CmsTopicApiSection[];
  entry_groups?: Record<string, CmsTopicApiEntry[]>;
  seo_meta?: CmsTopicApiSeoMeta;
  landing_surface_v1?: LandingSurfaceRaw | null;
  answer_surface_v1?: AnswerSurfaceRaw | null;
};

type CmsTopicSeoApiResponse = {
  meta?: {
    title?: string;
    description?: string;
    canonical?: string | null;
    alternates?: Record<string, string | null | undefined>;
    og?: {
      title?: string;
      description?: string;
      image?: string | null;
      type?: string;
    };
    twitter?: {
      card?: string;
      title?: string;
      description?: string;
      image?: string | null;
    };
    robots?: string;
  };
  jsonld?: unknown;
  seo_surface_v1?: SeoSurfaceRaw | null;
};

export type CmsTopicSectionKey =
  | "overview"
  | "key_concepts"
  | "why_it_matters"
  | "who_should_read"
  | "faq"
  | "related_topics_intro";

export type CmsTopicEntryGroupKey =
  | "featured"
  | "articles"
  | "personalities"
  | "tests"
  | "related";

export type CmsTopicSeoMeta = {
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageUrl: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImageUrl: string | null;
  robots: string | null;
  jsonldOverrides: unknown;
};

export type CmsTopicProfileSummary = {
  id: number | null;
  orgId: number;
  topicCode: string;
  slug: string;
  locale: string;
  title: string;
  subtitle: string;
  excerpt: string;
  status: string;
  isPublic: boolean;
  isIndexable: boolean;
  publishedAt: string | null;
  updatedAt: string | null;
  seoMeta: CmsTopicSeoMeta | null;
};

export type CmsTopicSection = {
  sectionKey: CmsTopicSectionKey | string;
  title: string;
  renderVariant: string;
  bodyMd: string;
  bodyHtml: string;
  payloadJson: unknown;
  sortOrder: number;
  isEnabled: boolean;
};

export type CmsTopicEntry = {
  entryType: string;
  groupKey: CmsTopicEntryGroupKey | string;
  targetKey: string;
  title: string;
  excerpt: string;
  url: string;
  badgeLabel: string;
  ctaLabel: string;
  imageUrl: string | null;
  isFeatured: boolean;
};

export type CmsTopicEntryGroups = Partial<Record<CmsTopicEntryGroupKey, CmsTopicEntry[]>>;

export type CmsTopicProfile = CmsTopicProfileSummary & {
  heroKicker: string;
  heroQuote: string;
  coverImageUrl: string | null;
  sections: CmsTopicSection[];
  entryGroups: CmsTopicEntryGroups;
  landingSurface: LandingSurfaceViewModel | null;
  answerSurface: AnswerSurfaceViewModel | null;
};

export type CmsTopicSeoPayload = {
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
  jsonld: unknown;
  surface: SeoSurfaceViewModel | null;
};

export type CmsTopicPagination = {
  currentPage: number;
  perPage: number;
  total: number;
  lastPage: number;
};

export type ListTopicsParams = {
  locale: Locale | string;
  page?: number;
  perPage?: number;
};

export type ListTopicsResult = {
  items: CmsTopicProfileSummary[];
  pagination: CmsTopicPagination;
  landingSurface: LandingSurfaceViewModel | null;
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

function fallbackText(...candidates: Array<string | null | undefined>): string {
  for (const candidate of candidates) {
    const normalized = String(candidate ?? "").replace(/\s+/g, " ").trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function normalizeIsoValue(value: string | null | undefined): string | null {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

function emptyPagination(page = 1, perPage = DEFAULT_PER_PAGE): CmsTopicPagination {
  return {
    currentPage: page,
    perPage,
    total: 0,
    lastPage: 1,
  };
}

function matchesRequestedLocale(profileLocale: string, locale: Locale | string): boolean {
  return toApiLocale(profileLocale) === mapFrontendLocaleToTopicsApiLocale(locale);
}

function normalizeTopicSeoMeta(seoMeta: CmsTopicApiSeoMeta): CmsTopicSeoMeta | null {
  if (!seoMeta || typeof seoMeta !== "object") {
    return null;
  }

  return {
    seoTitle: fallbackText(seoMeta.seo_title) || null,
    seoDescription: fallbackText(seoMeta.seo_description) || null,
    canonicalUrl: normalizeIsoValue(seoMeta.canonical_url),
    ogTitle: fallbackText(seoMeta.og_title) || null,
    ogDescription: fallbackText(seoMeta.og_description) || null,
    ogImageUrl: normalizeIsoValue(seoMeta.og_image_url),
    twitterTitle: fallbackText(seoMeta.twitter_title) || null,
    twitterDescription: fallbackText(seoMeta.twitter_description) || null,
    twitterImageUrl: normalizeIsoValue(seoMeta.twitter_image_url),
    robots: fallbackText(seoMeta.robots) || null,
    jsonldOverrides: seoMeta.jsonld_overrides_json ?? null,
  };
}

export function normalizeTopicSlug(value: string): string {
  return String(value ?? "").trim().toLowerCase();
}

export function formatTopicDisplayCode(value: string | null | undefined): string {
  const normalized = normalizeTopicSlug(String(value ?? ""));
  if (normalized === "mbti") return "MBTI";
  if (normalized === "big-five") return "Big Five";
  if (normalized === "iq-eq") return "IQ / EQ";

  return String(value ?? "").trim();
}

export function normalizeTopicProfileSummary(profile: CmsTopicApiProfile): CmsTopicProfileSummary {
  return {
    id: typeof profile.id === "number" ? profile.id : null,
    orgId: typeof profile.org_id === "number" ? profile.org_id : 0,
    topicCode: fallbackText(profile.topic_code).toLowerCase(),
    slug: normalizeTopicSlug(String(profile.slug ?? profile.topic_code ?? "")),
    locale: fallbackText(profile.locale) || "en",
    title: fallbackText(profile.title, profile.topic_code),
    subtitle: fallbackText(profile.subtitle),
    excerpt: fallbackText(profile.excerpt, profile.subtitle),
    status: fallbackText(profile.status),
    isPublic: Boolean(profile.is_public),
    isIndexable: Boolean(profile.is_indexable),
    publishedAt: normalizeIsoValue(profile.published_at),
    updatedAt: normalizeIsoValue(profile.updated_at),
    seoMeta: normalizeTopicSeoMeta(profile.seo_meta ?? null),
  };
}

export function normalizeTopicSection(section: CmsTopicApiSection): CmsTopicSection | null {
  const sectionKey = normalizeTopicSlug(String(section.section_key ?? ""));
  if (!sectionKey) {
    return null;
  }

  return {
    sectionKey,
    title: fallbackText(section.title, section.section_key),
    renderVariant: fallbackText(section.render_variant, "rich_text"),
    bodyMd: String(section.body_md ?? ""),
    bodyHtml: String(section.body_html ?? ""),
    payloadJson: section.payload_json ?? null,
    sortOrder: typeof section.sort_order === "number" ? section.sort_order : 0,
    isEnabled: section.is_enabled !== false,
  };
}

function normalizeTopicEntry(entry: CmsTopicApiEntry): CmsTopicEntry | null {
  const groupKey = normalizeTopicSlug(String(entry.group_key ?? ""));
  const title = fallbackText(entry.title);
  const url = normalizeInternalHref(entry.url);

  if (!groupKey || !title || !url) {
    return null;
  }

  return {
    entryType: fallbackText(entry.entry_type),
    groupKey,
    targetKey: fallbackText(entry.target_key),
    title,
    excerpt: fallbackText(entry.excerpt),
    url,
    badgeLabel: fallbackText(entry.badge_label),
    ctaLabel: fallbackText(entry.cta_label),
    imageUrl: normalizeIsoValue(entry.image_url),
    isFeatured: Boolean(entry.is_featured),
  };
}

export function normalizeTopicEntryGroups(
  entryGroups: Record<string, CmsTopicApiEntry[]> | null | undefined
): CmsTopicEntryGroups {
  if (!entryGroups || typeof entryGroups !== "object" || Array.isArray(entryGroups)) {
    return {};
  }

  const normalized: CmsTopicEntryGroups = {};

  for (const [rawGroupKey, rawEntries] of Object.entries(entryGroups)) {
    const groupKey = normalizeTopicSlug(rawGroupKey);
    if (!Array.isArray(rawEntries)) {
      continue;
    }

    const items = rawEntries
      .map(normalizeTopicEntry)
      .filter((entry): entry is CmsTopicEntry => entry !== null);

    if (items.length === 0) {
      continue;
    }

    normalized[groupKey as CmsTopicEntryGroupKey] = items;
  }

  return normalized;
}

export function normalizeTopicProfileDetail(
  profile: CmsTopicApiProfile,
  sections: CmsTopicApiSection[] | undefined,
  entryGroups: Record<string, CmsTopicApiEntry[]> | undefined,
  seoMeta: CmsTopicApiSeoMeta
): CmsTopicProfile {
  const summary = normalizeTopicProfileSummary({
    ...profile,
    seo_meta: seoMeta ?? profile.seo_meta ?? null,
  });

  return {
    ...summary,
    heroKicker: fallbackText(profile.hero_kicker, summary.topicCode || summary.slug),
    heroQuote: fallbackText(profile.hero_quote),
    coverImageUrl: normalizeIsoValue(profile.cover_image_url),
    sections: Array.isArray(sections)
      ? sections
          .map(normalizeTopicSection)
          .filter((section): section is CmsTopicSection => section !== null)
          .filter((section) => section.isEnabled)
          .sort((left, right) => left.sortOrder - right.sortOrder)
      : [],
    entryGroups: normalizeTopicEntryGroups(entryGroups),
    landingSurface: null,
    answerSurface: null,
  };
}

function buildFallbackTopicJsonLd(profile: CmsTopicProfile, locale: Locale | string): Record<string, unknown> {
  const canonicalPath = buildTopicFrontendUrl(locale, profile.slug);
  const description = fallbackText(profile.seoMeta?.seoDescription, profile.excerpt, profile.subtitle);

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: fallbackText(profile.seoMeta?.seoTitle, profile.title),
    description,
    mainEntityOfPage: canonicalUrl(canonicalPath),
  };
}

function replaceCanonicalValue(
  value: string,
  sourceCanonical: string | null | undefined,
  localizedCanonicalPath: string
): string {
  const normalizedCanonical = canonicalUrl(localizedCanonicalPath);
  const normalizedSourceCanonical = String(sourceCanonical ?? "").trim();

  if (normalizedSourceCanonical) {
    if (value === normalizedSourceCanonical) {
      return normalizedCanonical;
    }

    if (value.startsWith(`${normalizedSourceCanonical}#`)) {
      return `${normalizedCanonical}${value.slice(normalizedSourceCanonical.length)}`;
    }
  }

  return value;
}

export function normalizeTopicJsonLd(
  jsonld: unknown,
  sourceCanonical: string | null | undefined,
  localizedCanonicalPath: string,
  profile: CmsTopicProfile
): unknown {
  const walk = (value: unknown): unknown => {
    if (Array.isArray(value)) {
      return value.map(walk);
    }

    if (value && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, walk(nested)]));
    }

    if (typeof value === "string") {
      return replaceCanonicalValue(value, sourceCanonical, localizedCanonicalPath);
    }

    return value;
  };

  if (!jsonld) {
    return buildFallbackTopicJsonLd(profile, profile.locale);
  }

  return walk(jsonld);
}

export function mapFrontendLocaleToTopicsApiLocale(locale: Locale | string): "en" | "zh-CN" {
  return toApiLocale(locale);
}

export function buildTopicFrontendUrl(locale: Locale | string, slug: string): string {
  return localizedPath(`/topics/${normalizeTopicSlug(slug)}`, normalizeLocale(locale));
}

export function normalizeTopicSeoPayload(
  seo: CmsTopicSeoPayload | null,
  profile: CmsTopicProfile,
  locale: Locale | string
): CmsTopicSeoPayload {
  const canonicalPath = buildTopicFrontendUrl(locale, profile.slug);
  const normalizedCanonical = canonicalUrl(canonicalPath);
  const title = fallbackText(seo?.meta.title, profile.seoMeta?.seoTitle, profile.title);
  const description = fallbackText(
    seo?.meta.description,
    profile.seoMeta?.seoDescription,
    profile.excerpt,
    profile.subtitle
  );
  const robots = fallbackText(
    seo?.meta.robots,
    profile.seoMeta?.robots,
    profile.isIndexable ? "index,follow" : "noindex,follow"
  );

  return {
    meta: {
      title,
      description,
      canonical: normalizedCanonical,
      alternates: {
        en: canonicalUrl(buildTopicFrontendUrl("en", profile.slug)),
        "zh-CN": canonicalUrl(buildTopicFrontendUrl("zh", profile.slug)),
      },
      og: {
        title: fallbackText(seo?.meta.og.title, profile.seoMeta?.ogTitle, title),
        description: fallbackText(seo?.meta.og.description, profile.seoMeta?.ogDescription, description),
        image: normalizeIsoValue(seo?.meta.og.image ?? profile.seoMeta?.ogImageUrl ?? profile.coverImageUrl),
        type: fallbackText(seo?.meta.og.type, "article"),
      },
      twitter: {
        card: fallbackText(seo?.meta.twitter.card, "summary_large_image"),
        title: fallbackText(seo?.meta.twitter.title, profile.seoMeta?.twitterTitle, title),
        description: fallbackText(
          seo?.meta.twitter.description,
          profile.seoMeta?.twitterDescription,
          description
        ),
        image: normalizeIsoValue(
          seo?.meta.twitter.image ??
            profile.seoMeta?.twitterImageUrl ??
            profile.seoMeta?.ogImageUrl ??
            profile.coverImageUrl
        ),
      },
      robots,
    },
    jsonld: normalizeTopicJsonLd(seo?.jsonld ?? null, seo?.meta.canonical, canonicalPath, profile),
    surface: seo?.surface ?? null,
  };
}

export async function listTopics(params: ListTopicsParams): Promise<ListTopicsResult> {
  const requestedPage = typeof params.page === "number" && params.page > 0 ? params.page : 1;
  const requestedPerPage =
    typeof params.perPage === "number" && params.perPage > 0 ? Math.min(params.perPage, 100) : DEFAULT_PER_PAGE;
  const query = buildQuery({
    locale: mapFrontendLocaleToTopicsApiLocale(params.locale),
    org_id: DEFAULT_ORG_ID,
    page: requestedPage,
    per_page: requestedPerPage,
  });

  try {
    const response = await apiClient.get<CmsTopicListApiResponse>(`/v0.5/topics${query}`, {
      locale: params.locale,
      skipAuth: true,
      ...PUBLIC_API_CACHE_OPTIONS,
    });

    const items = Array.isArray(response.items)
      ? response.items
          .map(normalizeTopicProfileSummary)
          .filter((item) => item.slug && item.title)
          .filter((item) => matchesRequestedLocale(item.locale, params.locale))
      : [];

    return {
      items,
      landingSurface: normalizeLandingSurface(response.landing_surface_v1 ?? null),
      pagination: {
        currentPage:
          typeof response.pagination?.current_page === "number" ? response.pagination.current_page : requestedPage,
        perPage:
          typeof response.pagination?.per_page === "number" ? response.pagination.per_page : requestedPerPage,
        total: typeof response.pagination?.total === "number" ? response.pagination.total : items.length,
        lastPage: typeof response.pagination?.last_page === "number" ? response.pagination.last_page : 1,
      },
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return {
        items: [],
        landingSurface: null,
        pagination: emptyPagination(requestedPage, requestedPerPage),
      };
    }

    throw error;
  }
}

export async function getTopicBySlug(
  slug: string,
  locale: Locale | string
): Promise<CmsTopicProfile | null> {
  const normalizedSlug = normalizeTopicSlug(slug);
  if (!normalizedSlug) {
    return null;
  }

  const query = buildQuery({
    locale: mapFrontendLocaleToTopicsApiLocale(locale),
    org_id: DEFAULT_ORG_ID,
  });

  try {
    const response = await apiClient.get<CmsTopicDetailApiResponse>(
      `/v0.5/topics/${encodeURIComponent(normalizedSlug)}${query}`,
      {
        locale,
        skipAuth: true,
        ...PUBLIC_API_CACHE_OPTIONS,
      }
    );

    if (!response.profile) {
      return null;
    }

    const topic = normalizeTopicProfileDetail(
      response.profile,
      response.sections,
      response.entry_groups,
      response.seo_meta ?? null
    );

    topic.landingSurface = normalizeLandingSurface(response.landing_surface_v1 ?? null);
    topic.answerSurface = normalizeAnswerSurface(response.answer_surface_v1 ?? null);

    return topic.slug && topic.title ? topic : null;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function getTopicSeoBySlug(
  slug: string,
  locale: Locale | string
): Promise<CmsTopicSeoPayload | null> {
  const normalizedSlug = normalizeTopicSlug(slug);
  if (!normalizedSlug) {
    return null;
  }

  const query = buildQuery({
    locale: mapFrontendLocaleToTopicsApiLocale(locale),
    org_id: DEFAULT_ORG_ID,
  });

  try {
    const response = await apiClient.get<CmsTopicSeoApiResponse>(
      `/v0.5/topics/${encodeURIComponent(normalizedSlug)}/seo${query}`,
      {
        locale,
        skipAuth: true,
        ...PUBLIC_API_CACHE_OPTIONS,
      }
    );

    return {
      meta: {
        title: fallbackText(response.meta?.title),
        description: fallbackText(response.meta?.description),
        canonical: normalizeIsoValue(response.meta?.canonical),
        alternates: {
          en: normalizeIsoValue(response.meta?.alternates?.en),
          "zh-CN": normalizeIsoValue(response.meta?.alternates?.["zh-CN"]),
        },
        og: {
          title: fallbackText(response.meta?.og?.title, response.meta?.title),
          description: fallbackText(response.meta?.og?.description, response.meta?.description),
          image: normalizeIsoValue(response.meta?.og?.image),
          type: fallbackText(response.meta?.og?.type, "article"),
        },
        twitter: {
          card: fallbackText(response.meta?.twitter?.card, "summary_large_image"),
          title: fallbackText(response.meta?.twitter?.title, response.meta?.title),
          description: fallbackText(response.meta?.twitter?.description, response.meta?.description),
          image: normalizeIsoValue(response.meta?.twitter?.image ?? response.meta?.og?.image),
        },
        robots: fallbackText(response.meta?.robots, "index,follow"),
      },
      jsonld: response.jsonld ?? null,
      surface: normalizeSeoSurface(response.seo_surface_v1 ?? null),
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}
