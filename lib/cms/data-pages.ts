import { ApiError, apiClient } from "@/lib/api-client";
import type { AnswerSurfaceRaw, LandingSurfaceRaw, SeoSurfaceRaw } from "@/lib/api/v0_3";
import { normalizeAnswerSurface, type AnswerSurfaceViewModel } from "@/lib/answer/answerSurface";
import { localizedPath, normalizeLocale, toApiLocale, type Locale } from "@/lib/i18n/locales";
import { normalizeLandingSurface, type LandingSurfaceViewModel } from "@/lib/landing/landingSurface";
import { normalizeSeoSurface, type SeoSurfaceViewModel } from "@/lib/seo/seoSurface";
import { canonicalUrl } from "@/lib/site";

const DEFAULT_ORG_ID = "0";
const DEFAULT_PER_PAGE = 100;

type CmsDataPageApiRecord = {
  id?: number;
  org_id?: number;
  data_code?: string;
  slug?: string;
  locale?: string;
  title?: string;
  subtitle?: string | null;
  excerpt?: string | null;
  hero_kicker?: string | null;
  body_md?: string | null;
  body_html?: string | null;
  sample_size_label?: string | null;
  time_window_label?: string | null;
  methodology_md?: string | null;
  limitations_md?: string | null;
  summary_statement_md?: string | null;
  cover_image_url?: string | null;
  is_public?: boolean;
  is_indexable?: boolean;
  published_at?: string | null;
  updated_at?: string | null;
};

type CmsDataPageListApiResponse = {
  ok?: boolean;
  items?: CmsDataPageApiRecord[];
  landing_surface_v1?: LandingSurfaceRaw | null;
  pagination?: {
    current_page?: number;
    per_page?: number;
    total?: number;
    last_page?: number;
  };
};

type CmsDataPageDetailApiResponse = {
  ok?: boolean;
  page?: CmsDataPageApiRecord | null;
  landing_surface_v1?: LandingSurfaceRaw | null;
  answer_surface_v1?: AnswerSurfaceRaw | null;
};

type CmsDataPageSeoApiResponse = {
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

export type CmsDataPageSummary = {
  id: number | null;
  orgId: number;
  dataCode: string;
  slug: string;
  locale: string;
  title: string;
  subtitle: string;
  excerpt: string;
  heroKicker: string;
  sampleSizeLabel: string;
  timeWindowLabel: string;
  isPublic: boolean;
  isIndexable: boolean;
  publishedAt: string | null;
  updatedAt: string | null;
};

export type CmsDataPage = CmsDataPageSummary & {
  bodyMd: string;
  bodyHtml: string;
  methodologyMd: string;
  limitationsMd: string;
  summaryStatementMd: string;
  coverImageUrl: string | null;
  landingSurface: LandingSurfaceViewModel | null;
  answerSurface: AnswerSurfaceViewModel | null;
};

export type CmsDataPageSeoPayload = {
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

export type CmsDataPagesPagination = {
  currentPage: number;
  perPage: number;
  total: number;
  lastPage: number;
};

export type ListDataPagesParams = {
  locale: Locale | string;
  page?: number;
  perPage?: number;
};

export type ListDataPagesResult = {
  items: CmsDataPageSummary[];
  pagination: CmsDataPagesPagination;
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

function fallbackText(...candidates: Array<unknown>): string {
  for (const candidate of candidates) {
    const normalized = String(candidate ?? "").replace(/\s+/g, " ").trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function normalizeIsoValue(value: unknown): string | null {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

function emptyPagination(page = 1, perPage = DEFAULT_PER_PAGE): CmsDataPagesPagination {
  return {
    currentPage: page,
    perPage,
    total: 0,
    lastPage: 1,
  };
}

export function normalizeDataPageSlug(value: string): string {
  return String(value ?? "").trim().toLowerCase();
}

export function buildDataPageFrontendUrl(locale: Locale | string, slug: string): string {
  return localizedPath(`/data/${normalizeDataPageSlug(slug)}`, normalizeLocale(locale));
}

function normalizeDataPageSummary(record: CmsDataPageApiRecord): CmsDataPageSummary {
  return {
    id: typeof record.id === "number" ? record.id : null,
    orgId: typeof record.org_id === "number" ? record.org_id : 0,
    dataCode: fallbackText(record.data_code, record.slug).toLowerCase(),
    slug: normalizeDataPageSlug(String(record.slug ?? record.data_code ?? "")),
    locale: fallbackText(record.locale, "en"),
    title: fallbackText(record.title, record.data_code),
    subtitle: fallbackText(record.subtitle),
    excerpt: fallbackText(record.excerpt, record.summary_statement_md, record.subtitle),
    heroKicker: fallbackText(record.hero_kicker),
    sampleSizeLabel: fallbackText(record.sample_size_label),
    timeWindowLabel: fallbackText(record.time_window_label),
    isPublic: record.is_public !== false,
    isIndexable: record.is_indexable !== false,
    publishedAt: normalizeIsoValue(record.published_at),
    updatedAt: normalizeIsoValue(record.updated_at),
  };
}

function normalizeDataPage(
  record: CmsDataPageApiRecord,
  landingSurface: LandingSurfaceViewModel | null,
  answerSurface: AnswerSurfaceViewModel | null
): CmsDataPage {
  const summary = normalizeDataPageSummary(record);

  return {
    ...summary,
    bodyMd: fallbackText(record.body_md),
    bodyHtml: fallbackText(record.body_html),
    methodologyMd: fallbackText(record.methodology_md),
    limitationsMd: fallbackText(record.limitations_md),
    summaryStatementMd: fallbackText(record.summary_statement_md, record.excerpt),
    coverImageUrl: normalizeIsoValue(record.cover_image_url),
    landingSurface,
    answerSurface,
  };
}

export function normalizeDataPageSeoPayload(
  seo: CmsDataPageSeoApiResponse | null,
  page: CmsDataPageSummary | CmsDataPage,
  locale: Locale | string
): CmsDataPageSeoPayload | null {
  if (!seo) {
    return null;
  }

  const canonicalPath = buildDataPageFrontendUrl(locale, page.slug);

  return {
    meta: {
      title: fallbackText(seo.meta?.title, page.title),
      description: fallbackText(seo.meta?.description, page.excerpt, "FermatMind data page"),
      canonical: normalizeIsoValue(seo.meta?.canonical) ?? canonicalUrl(canonicalPath),
      alternates: {
        en: normalizeIsoValue(seo.meta?.alternates?.en) ?? canonicalUrl(buildDataPageFrontendUrl("en", page.slug)),
        "zh-CN":
          normalizeIsoValue(seo.meta?.alternates?.["zh-CN"])
          ?? canonicalUrl(buildDataPageFrontendUrl("zh", page.slug)),
      },
      og: {
        title: fallbackText(seo.meta?.og?.title, seo.meta?.title, page.title),
        description: fallbackText(seo.meta?.og?.description, seo.meta?.description, page.excerpt),
        image: normalizeIsoValue(seo.meta?.og?.image),
        type: fallbackText(seo.meta?.og?.type, "article"),
      },
      twitter: {
        card: fallbackText(seo.meta?.twitter?.card, "summary_large_image"),
        title: fallbackText(seo.meta?.twitter?.title, seo.meta?.title, page.title),
        description: fallbackText(seo.meta?.twitter?.description, seo.meta?.description, page.excerpt),
        image: normalizeIsoValue(seo.meta?.twitter?.image ?? seo.meta?.og?.image),
      },
      robots: fallbackText(seo.meta?.robots, page.isIndexable ? "index,follow" : "noindex,follow"),
    },
    jsonld: seo.jsonld ?? null,
    surface: normalizeSeoSurface(seo.seo_surface_v1 ?? null),
  };
}

export async function listDataPages(params: ListDataPagesParams): Promise<ListDataPagesResult> {
  const locale = normalizeLocale(params.locale);
  const page = params.page ?? 1;
  const perPage = params.perPage ?? DEFAULT_PER_PAGE;
  const query = buildQuery({
    locale: toApiLocale(locale),
    org_id: DEFAULT_ORG_ID,
    page,
    per_page: perPage,
  });

  try {
    const response = await apiClient.get<CmsDataPageListApiResponse>(`/v0.5/data${query}`, {
      locale,
      skipAuth: true,
    });

    const items = Array.isArray(response.items) ? response.items.map(normalizeDataPageSummary) : [];

    return {
      items,
      pagination: {
        currentPage: Number(response.pagination?.current_page ?? page),
        perPage: Number(response.pagination?.per_page ?? perPage),
        total: Number(response.pagination?.total ?? items.length),
        lastPage: Number(response.pagination?.last_page ?? 1),
      },
      landingSurface: normalizeLandingSurface(response.landing_surface_v1 ?? null),
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return {
        items: [],
        pagination: emptyPagination(page, perPage),
        landingSurface: null,
      };
    }

    throw error;
  }
}

export async function getDataPageBySlug(slug: string, locale: Locale | string): Promise<CmsDataPage | null> {
  const normalizedSlug = normalizeDataPageSlug(slug);
  const resolvedLocale = normalizeLocale(locale);
  const query = buildQuery({
    locale: toApiLocale(resolvedLocale),
    org_id: DEFAULT_ORG_ID,
  });

  try {
    const response = await apiClient.get<CmsDataPageDetailApiResponse>(`/v0.5/data/${normalizedSlug}${query}`, {
      locale: resolvedLocale,
      skipAuth: true,
    });

    if (!response.page) {
      return null;
    }

    return normalizeDataPage(
      response.page,
      normalizeLandingSurface(response.landing_surface_v1 ?? null),
      normalizeAnswerSurface(response.answer_surface_v1 ?? null)
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function getDataPageSeoBySlug(slug: string, locale: Locale | string): Promise<CmsDataPageSeoPayload | null> {
  const page = await getDataPageBySlug(slug, locale);
  if (!page) {
    return null;
  }

  const resolvedLocale = normalizeLocale(locale);
  const query = buildQuery({
    locale: toApiLocale(resolvedLocale),
    org_id: DEFAULT_ORG_ID,
  });

  try {
    const response = await apiClient.get<CmsDataPageSeoApiResponse>(`/v0.5/data/${page.slug}/seo${query}`, {
      locale: resolvedLocale,
      skipAuth: true,
    });

    return normalizeDataPageSeoPayload(response, page, resolvedLocale);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}
