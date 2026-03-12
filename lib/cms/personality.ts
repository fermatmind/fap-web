import { ApiError, apiClient } from "@/lib/api-client";
import { localizedPath, normalizeLocale, toApiLocale, type Locale } from "@/lib/i18n/locales";
import { canonicalUrl } from "@/lib/site";

const DEFAULT_ORG_ID = "0";
const DEFAULT_SCALE_CODE = "MBTI";

type CmsPersonalityApiSeoMeta = {
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

type CmsPersonalityApiProfile = {
  id?: number;
  org_id?: number;
  scale_code?: string;
  type_code?: string;
  slug?: string;
  locale?: string;
  title?: string;
  subtitle?: string | null;
  excerpt?: string | null;
  hero_kicker?: string | null;
  hero_quote?: string | null;
  hero_image_url?: string | null;
  status?: string;
  is_public?: boolean;
  is_indexable?: boolean;
  published_at?: string | null;
  updated_at?: string | null;
  seo_meta?: CmsPersonalityApiSeoMeta;
};

type CmsPersonalityApiSection = {
  section_key?: string;
  title?: string | null;
  render_variant?: string;
  body_md?: string | null;
  body_html?: string | null;
  payload_json?: unknown;
  sort_order?: number;
  is_enabled?: boolean;
};

type CmsPersonalityListApiResponse = {
  ok?: boolean;
  items?: CmsPersonalityApiProfile[];
  pagination?: {
    current_page?: number;
    per_page?: number;
    total?: number;
    last_page?: number;
  };
};

type CmsPersonalityDetailApiResponse = {
  ok?: boolean;
  profile?: CmsPersonalityApiProfile | null;
  sections?: CmsPersonalityApiSection[];
  seo_meta?: CmsPersonalityApiSeoMeta;
};

type CmsPersonalitySeoApiResponse = {
  meta?: {
    title?: string;
    description?: string;
    canonical?: string | null;
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
    alternates?: Record<string, string>;
  };
  jsonld?: unknown;
};

export type CmsPersonalitySeoMeta = {
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

export type CmsPersonalitySection = {
  sectionKey: string;
  title: string;
  renderVariant: string;
  bodyMd: string;
  bodyHtml: string;
  payloadJson: unknown;
  sortOrder: number;
  isEnabled: boolean;
};

export type CmsPersonalityProfileSummary = {
  id: number | null;
  orgId: number;
  scaleCode: string;
  typeCode: string;
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
  seoMeta: CmsPersonalitySeoMeta | null;
};

export type CmsPersonalityProfile = CmsPersonalityProfileSummary & {
  heroKicker: string;
  heroQuote: string;
  heroImageUrl: string | null;
  sections: CmsPersonalitySection[];
};

export type CmsPersonalitySeoPayload = {
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
};

export type CmsPersonalityPagination = {
  currentPage: number;
  perPage: number;
  total: number;
  lastPage: number;
};

export type GetCmsPersonalityProfilesParams = {
  locale: Locale | string;
  page?: number;
  perPage?: number;
};

export type GetCmsPersonalityProfilesResult = {
  items: CmsPersonalityProfileSummary[];
  pagination: CmsPersonalityPagination;
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

function emptyPagination(page = 1, perPage = 20): CmsPersonalityPagination {
  return {
    currentPage: page,
    perPage,
    total: 0,
    lastPage: 1,
  };
}

function matchesRequestedLocale(profileLocale: string, locale: Locale | string): boolean {
  return toApiLocale(profileLocale) === mapFrontendLocaleToPersonalityApiLocale(locale);
}

function normalizeSeoMeta(seoMeta: CmsPersonalityApiSeoMeta): CmsPersonalitySeoMeta | null {
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

function normalizeProfileSummary(profile: CmsPersonalityApiProfile): CmsPersonalityProfileSummary {
  return {
    id: typeof profile.id === "number" ? profile.id : null,
    orgId: typeof profile.org_id === "number" ? profile.org_id : 0,
    scaleCode: fallbackText(profile.scale_code) || DEFAULT_SCALE_CODE,
    typeCode: fallbackText(profile.type_code).toUpperCase(),
    slug: normalizePersonalitySlug(String(profile.slug ?? profile.type_code ?? "")),
    locale: fallbackText(profile.locale) || "en",
    title: fallbackText(profile.title, profile.type_code),
    subtitle: fallbackText(profile.subtitle),
    excerpt: fallbackText(profile.excerpt, profile.subtitle),
    status: fallbackText(profile.status),
    isPublic: Boolean(profile.is_public),
    isIndexable: Boolean(profile.is_indexable),
    publishedAt: normalizeIsoValue(profile.published_at),
    updatedAt: normalizeIsoValue(profile.updated_at),
    seoMeta: normalizeSeoMeta(profile.seo_meta ?? null),
  };
}

function normalizeSection(section: CmsPersonalityApiSection): CmsPersonalitySection | null {
  const sectionKey = fallbackText(section.section_key).toLowerCase();
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

function normalizeProfileDetail(
  profile: CmsPersonalityApiProfile,
  sections: CmsPersonalityApiSection[] | undefined,
  seoMeta: CmsPersonalityApiSeoMeta
): CmsPersonalityProfile {
  const summary = normalizeProfileSummary({
    ...profile,
    seo_meta: seoMeta ?? profile.seo_meta ?? null,
  });

  return {
    ...summary,
    heroKicker: fallbackText(profile.hero_kicker, summary.typeCode),
    heroQuote: fallbackText(profile.hero_quote),
    heroImageUrl: normalizeIsoValue(profile.hero_image_url),
    sections: Array.isArray(sections)
      ? sections
          .map(normalizeSection)
          .filter((section): section is CmsPersonalitySection => section !== null)
          .filter((section) => section.isEnabled)
          .sort((left, right) => left.sortOrder - right.sortOrder)
      : [],
  };
}

function buildFallbackJsonLd(profile: CmsPersonalityProfile, locale: Locale | string): Record<string, unknown> {
  const canonicalPath = buildPersonalityFrontendUrl(locale, profile.slug);
  const description = fallbackText(profile.seoMeta?.seoDescription, profile.excerpt, profile.subtitle);

  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: fallbackText(profile.seoMeta?.seoTitle, profile.title),
    description,
    about: {
      "@type": "DefinedTerm",
      name: profile.typeCode,
      inDefinedTermSet: profile.scaleCode,
    },
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

export function normalizePersonalityJsonLd(
  jsonld: unknown,
  sourceCanonical: string | null | undefined,
  localizedCanonicalPath: string,
  profile: CmsPersonalityProfile
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
    return buildFallbackJsonLd(profile, profile.locale);
  }

  const normalized = walk(jsonld);

  if (!normalized || Array.isArray(normalized) || typeof normalized !== "object") {
    return buildFallbackJsonLd(profile, profile.locale);
  }

  return {
    "@context": "https://schema.org",
    ...normalized,
    "@type": "AboutPage",
    mainEntityOfPage: canonicalUrl(localizedCanonicalPath),
  };
}

export function mapFrontendLocaleToPersonalityApiLocale(locale: Locale | string): "en" | "zh-CN" {
  return toApiLocale(locale);
}

export function normalizePersonalitySlug(value: string): string {
  return String(value ?? "").trim().toLowerCase();
}

export function buildPersonalityFrontendUrl(locale: Locale | string, slug: string): string {
  return localizedPath(`/personality/${normalizePersonalitySlug(slug)}`, normalizeLocale(locale));
}

export function normalizePersonalitySeoPayload(
  seo: CmsPersonalitySeoPayload | null,
  profile: CmsPersonalityProfile,
  locale: Locale | string
): CmsPersonalitySeoPayload {
  const canonicalPath = buildPersonalityFrontendUrl(locale, profile.slug);
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
        en: canonicalUrl(buildPersonalityFrontendUrl("en", profile.slug)),
        "zh-CN": canonicalUrl(buildPersonalityFrontendUrl("zh", profile.slug)),
      },
      og: {
        title: fallbackText(seo?.meta.og.title, profile.seoMeta?.ogTitle, title),
        description: fallbackText(seo?.meta.og.description, profile.seoMeta?.ogDescription, description),
        image: normalizeIsoValue(seo?.meta.og.image ?? profile.seoMeta?.ogImageUrl),
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
        image: normalizeIsoValue(seo?.meta.twitter.image ?? profile.seoMeta?.twitterImageUrl ?? profile.seoMeta?.ogImageUrl),
      },
      robots,
    },
    jsonld: normalizePersonalityJsonLd(seo?.jsonld ?? null, seo?.meta.canonical, canonicalPath, profile),
  };
}

export async function listPersonalityProfiles(
  params: GetCmsPersonalityProfilesParams
): Promise<GetCmsPersonalityProfilesResult> {
  const requestedPage = typeof params.page === "number" && params.page > 0 ? params.page : 1;
  const requestedPerPage =
    typeof params.perPage === "number" && params.perPage > 0 ? Math.min(params.perPage, 100) : 20;
  const query = buildQuery({
    locale: mapFrontendLocaleToPersonalityApiLocale(params.locale),
    org_id: DEFAULT_ORG_ID,
    scale_code: DEFAULT_SCALE_CODE,
    page: requestedPage,
    per_page: requestedPerPage,
  });

  try {
    const response = await apiClient.get<CmsPersonalityListApiResponse>(`/v0.5/personality${query}`, {
      locale: params.locale,
      skipAuth: true,
      cache: "no-store",
    });

    const items = Array.isArray(response.items)
      ? response.items
          .map(normalizeProfileSummary)
          .filter((item) => item.slug && item.typeCode && item.title)
          .filter((item) => matchesRequestedLocale(item.locale, params.locale))
      : [];

    return {
      items,
      pagination: {
        currentPage:
          typeof response.pagination?.current_page === "number"
            ? response.pagination.current_page
            : requestedPage,
        perPage:
          typeof response.pagination?.per_page === "number"
            ? response.pagination.per_page
            : requestedPerPage,
        total: typeof response.pagination?.total === "number" ? response.pagination.total : items.length,
        lastPage: typeof response.pagination?.last_page === "number" ? response.pagination.last_page : 1,
      },
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return {
        items: [],
        pagination: emptyPagination(requestedPage, requestedPerPage),
      };
    }

    throw error;
  }
}

export async function getPersonalityProfileBySlugOrType(
  slugOrType: string,
  locale: Locale | string
): Promise<CmsPersonalityProfile | null> {
  const normalizedSlug = normalizePersonalitySlug(slugOrType);
  if (!normalizedSlug) {
    return null;
  }

  const query = buildQuery({
    locale: mapFrontendLocaleToPersonalityApiLocale(locale),
    org_id: DEFAULT_ORG_ID,
    scale_code: DEFAULT_SCALE_CODE,
  });

  try {
    const response = await apiClient.get<CmsPersonalityDetailApiResponse>(
      `/v0.5/personality/${encodeURIComponent(normalizedSlug)}${query}`,
      {
        locale,
        skipAuth: true,
        cache: "no-store",
      }
    );

    if (!response.profile) {
      return null;
    }

    const profile = normalizeProfileDetail(response.profile, response.sections, response.seo_meta ?? null);
    return profile.slug && profile.title ? profile : null;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function getPersonalitySeoBySlugOrType(
  slugOrType: string,
  locale: Locale | string
): Promise<CmsPersonalitySeoPayload | null> {
  const normalizedSlug = normalizePersonalitySlug(slugOrType);
  if (!normalizedSlug) {
    return null;
  }

  const query = buildQuery({
    locale: mapFrontendLocaleToPersonalityApiLocale(locale),
    org_id: DEFAULT_ORG_ID,
    scale_code: DEFAULT_SCALE_CODE,
  });

  try {
    const response = await apiClient.get<CmsPersonalitySeoApiResponse>(
      `/v0.5/personality/${encodeURIComponent(normalizedSlug)}/seo${query}`,
      {
        locale,
        skipAuth: true,
        cache: "no-store",
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
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}
