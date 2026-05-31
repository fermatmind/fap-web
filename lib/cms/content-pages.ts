import { ApiError, apiClient } from "@/lib/api-client";
import { withLastKnownGood, type LastKnownGoodResult } from "@/lib/cms/last-known-good";
import { localizedPath, normalizeLocale, toApiLocale, type Locale } from "@/lib/i18n/locales";
import { PUBLIC_API_CACHE_OPTIONS } from "@/lib/publicApiCache";

const DEFAULT_ORG_ID = "0";

export type ContentPageKind = "company" | "policy" | "help";
export type ContentPageTemplate = "company" | "charter" | "foundation" | "careers" | "brand" | "policy" | "help";
export type ContentPageAnimationProfile = "mission" | "principles" | "editorial" | "brand" | "policy" | "none";

export type ContentPage = {
  slug: string;
  path: string;
  kind: ContentPageKind;
  title: string;
  kicker: string;
  summary: string;
  template: ContentPageTemplate;
  animationProfile: ContentPageAnimationProfile;
  locale: Locale;
  publishedAt: string | null;
  updatedAt: string | null;
  effectiveAt: string | null;
  sourceDoc: string | null;
  isPublic: boolean;
  isIndexable: boolean;
  headings: string[];
  contentMd: string;
  contentHtml: string;
  seoTitle: string | null;
  metaDescription: string | null;
};

export type ContentPageSummary = Pick<
  ContentPage,
  | "slug"
  | "path"
  | "kind"
  | "title"
  | "kicker"
  | "summary"
  | "template"
  | "animationProfile"
  | "locale"
  | "publishedAt"
  | "updatedAt"
  | "effectiveAt"
  | "isPublic"
  | "isIndexable"
>;

export type ContentPageUpdatePayload = {
  title: string;
  kicker: string;
  summary: string;
  kind: ContentPageKind;
  template: ContentPageTemplate;
  animation_profile: ContentPageAnimationProfile;
  locale: "en" | "zh-CN";
  published_at: string | null;
  updated_at: string | null;
  effective_at: string | null;
  source_doc: string | null;
  is_public: boolean;
  is_indexable: boolean;
  content_md: string;
  content_html: string;
  seo_title: string | null;
  meta_description: string | null;
};

type ContentPageApiRecord = {
  slug?: string;
  path?: string | null;
  kind?: string | null;
  title?: string;
  kicker?: string | null;
  summary?: string | null;
  excerpt?: string | null;
  template?: string | null;
  animation_profile?: string | null;
  animationProfile?: string | null;
  locale?: string | null;
  published_at?: string | null;
  publishedAt?: string | null;
  updated_at?: string | null;
  updatedAt?: string | null;
  effective_at?: string | null;
  effectiveAt?: string | null;
  source_doc?: string | null;
  sourceDoc?: string | null;
  is_public?: boolean;
  isPublic?: boolean;
  is_indexable?: boolean;
  isIndexable?: boolean;
  headings?: unknown;
  content_md?: string | null;
  contentMd?: string | null;
  content_html?: string | null;
  contentHtml?: string | null;
  seo_title?: string | null;
  seoTitle?: string | null;
  meta_description?: string | null;
  metaDescription?: string | null;
};

type ContentPageApiResponse = {
  ok?: boolean;
  page?: ContentPageApiRecord | null;
};

type ContentPagesApiResponse = {
  ok?: boolean;
  items?: ContentPageApiRecord[];
};

type ContentPageMutationResponse = {
  ok?: boolean;
  page?: ContentPageApiRecord | null;
  message?: string;
};

const CONTENT_PAGE_SLUGS = [
  "about",
  "charter",
  "foundation",
  "careers",
  "brand",
  "terms",
  "privacy",
  "policies",
] as const;

export type ContentPageSlug = (typeof CONTENT_PAGE_SLUGS)[number];

export const DISCOVERABLE_CONTENT_PAGE_KEYS = [
  "about",
  "brand",
  "charter",
  "foundation",
  "careers",
  "policies",
  "privacy",
  "terms",
  "support",
  "method-boundaries",
  "help-faq",
  "help-contact",
] as const;

export type DiscoverableContentPageKey = (typeof DISCOVERABLE_CONTENT_PAGE_KEYS)[number];

export const APPROVED_EN_CONTENT_PAGE_LLMS_SLUGS = [
  "brand",
  "charter",
  "foundation",
  "careers",
  "policies",
] as const;

const GUARDED_CONTENT_PAGE_METADATA_PATTERNS = [
  /\bfiduciary\b/i,
  /\bequity\s+transfer\b/i,
  /\bnon[-\s]?profit\b/i,
  /\b501\s*\(?c\)?\s*\(?3\)?\b/i,
];

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

function normalizeText(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function normalizeLongText(value: unknown): string {
  return String(value ?? "").replace(/\r\n?/g, "\n").trim();
}

function normalizeNullableDate(value: unknown): string | null {
  const normalized = normalizeText(value);
  return normalized || null;
}

function normalizeKind(value: unknown): ContentPageKind {
  const normalized = normalizeText(value).toLowerCase();
  if (normalized === "policy" || normalized === "help") {
    return normalized;
  }
  return "company";
}

function normalizeTemplate(value: unknown, kind: ContentPageKind): ContentPageTemplate {
  const normalized = normalizeText(value).toLowerCase();
  if (["company", "charter", "foundation", "careers", "brand", "policy", "help"].includes(normalized)) {
    return normalized as ContentPageTemplate;
  }
  if (kind === "help") {
    return "help";
  }
  return kind === "policy" ? "policy" : "company";
}

function normalizeAnimationProfile(value: unknown, kind: ContentPageKind): ContentPageAnimationProfile {
  const normalized = normalizeText(value).toLowerCase();
  if (["mission", "principles", "editorial", "brand", "policy", "none"].includes(normalized)) {
    return normalized as ContentPageAnimationProfile;
  }
  return kind === "policy" ? "policy" : "editorial";
}

function normalizeHeadings(value: unknown, contentMd: string): string[] {
  if (Array.isArray(value)) {
    return value.map(normalizeText).filter(Boolean);
  }

  return contentMd
    .split("\n")
    .map((line) => line.match(/^#{2,3}\s+(.+)$/)?.[1] ?? "")
    .map(normalizeText)
    .filter(Boolean);
}

function normalizeContentPage(record: ContentPageApiRecord): ContentPage | null {
  const slug = normalizeText(record.slug);
  const title = normalizeText(record.title);
  const kind = normalizeKind(record.kind);
  const contentMd = normalizeLongText(record.content_md ?? record.contentMd);
  const contentHtml = normalizeLongText(record.content_html ?? record.contentHtml);

  if (!slug || !title || (!contentMd && !contentHtml)) {
    return null;
  }

  return {
    slug,
    path: normalizeText(record.path) || `/${slug}`,
    kind,
    title,
    kicker: normalizeText(record.kicker) || (kind === "policy" ? "Terms & policies" : "Company"),
    summary: normalizeText(record.summary ?? record.excerpt),
    template: normalizeTemplate(record.template, kind),
    animationProfile: normalizeAnimationProfile(record.animation_profile ?? record.animationProfile, kind),
    locale: normalizeLocale(record.locale),
    publishedAt: normalizeNullableDate(record.published_at ?? record.publishedAt),
    updatedAt: normalizeNullableDate(record.updated_at ?? record.updatedAt),
    effectiveAt: normalizeNullableDate(record.effective_at ?? record.effectiveAt),
    sourceDoc: normalizeText(record.source_doc ?? record.sourceDoc) || null,
    isPublic: record.is_public ?? record.isPublic ?? true,
    isIndexable: record.is_indexable ?? record.isIndexable ?? true,
    headings: normalizeHeadings(record.headings, contentMd),
    contentMd,
    contentHtml,
    seoTitle: normalizeText(record.seo_title ?? record.seoTitle) || null,
    metaDescription: normalizeText(record.meta_description ?? record.metaDescription) || null,
  };
}

function toSummary(page: ContentPage): ContentPageSummary {
  return {
    slug: page.slug,
    path: page.path,
    kind: page.kind,
    title: page.title,
    kicker: page.kicker,
    summary: page.summary,
    template: page.template,
    animationProfile: page.animationProfile,
    locale: page.locale,
    publishedAt: page.publishedAt,
    updatedAt: page.updatedAt,
    effectiveAt: page.effectiveAt,
    isPublic: page.isPublic,
    isIndexable: page.isIndexable,
  };
}

function hasGuardedContentPageMetadata(page: ContentPage): boolean {
  if (page.slug !== "foundation" && page.slug !== "charter") {
    return false;
  }

  const metadata = [page.title, page.kicker, page.summary, page.seoTitle, page.metaDescription]
    .filter(Boolean)
    .join(" ");

  return GUARDED_CONTENT_PAGE_METADATA_PATTERNS.some((pattern) => pattern.test(metadata));
}

function isApprovedEnglishContentPage(page: ContentPage | null | undefined): page is ContentPage {
  return Boolean(
    page &&
      APPROVED_EN_CONTENT_PAGE_LLMS_SLUGS.includes(
        page.slug as (typeof APPROVED_EN_CONTENT_PAGE_LLMS_SLUGS)[number]
      ) &&
      page.locale === "en" &&
      page.isPublic &&
      page.isIndexable &&
      !hasGuardedContentPageMetadata(page)
  );
}

export function listContentPageSlugs(): ContentPageSlug[] {
  return [...CONTENT_PAGE_SLUGS];
}

export function buildContentPagePath(slug: string, locale: Locale): string {
  if (slug.startsWith("help-")) {
    return localizedPath(`/help/${slug.slice(5)}`, locale);
  }

  return localizedPath(`/${slug}`, locale);
}

export async function getContentPage(slug: string, locale: Locale | string): Promise<ContentPage | null> {
  const normalizedSlug = normalizeText(slug);
  if (!normalizedSlug) {
    return null;
  }

  const query = buildQuery({
    locale: toApiLocale(locale),
    org_id: DEFAULT_ORG_ID,
  });

  try {
    const response = await apiClient.get<ContentPageApiResponse>(
      `/v0.5/content-pages/${encodeURIComponent(normalizedSlug)}${query}`,
      {
        locale,
        skipAuth: true,
        ...PUBLIC_API_CACHE_OPTIONS,
      }
    );
    const page = response.page ? normalizeContentPage(response.page) : null;
    return page?.isPublic ? page : null;
  } catch (error) {
    if (error instanceof ApiError && [404, 422].includes(error.status)) {
      return null;
    }

    throw error;
  }
}

export async function getContentPageWithLastKnownGood(
  slug: string,
  locale: Locale | string
): Promise<LastKnownGoodResult<ContentPage | null>> {
  const normalizedSlug = normalizeText(slug);
  const normalizedLocale = normalizeLocale(locale);

  return withLastKnownGood({
    key: `content-page:${normalizedLocale}:${normalizedSlug}`,
    load: () => getContentPage(normalizedSlug, normalizedLocale),
    isUsable: (page) => Boolean(page?.slug && page.title && (page.contentHtml || page.contentMd)),
    useStaleOnUnusable: true,
  });
}

export async function listContentPages(locale: Locale | string, kind?: ContentPageKind): Promise<ContentPage[]> {
  const summaries = await listContentPagesForOps(locale);
  const pages = await Promise.all(summaries.map((summary) => getContentPage(summary.slug, locale)));
  return pages.filter((page): page is ContentPage => Boolean(page)).filter((page) => !kind || page.kind === kind);
}

export async function listContentPagesWithLastKnownGood(
  locale: Locale | string,
  kind?: ContentPageKind
): Promise<LastKnownGoodResult<ContentPage[]>> {
  const normalizedLocale = normalizeLocale(locale);
  const kindKey = kind ?? "all";

  return withLastKnownGood({
    key: `content-pages:list:${normalizedLocale}:${kindKey}`,
    load: () => listContentPages(normalizedLocale, kind),
    isUsable: (pages) => pages.length > 0,
    useStaleOnUnusable: true,
  });
}

export async function listDiscoverableContentPagesWithLastKnownGood(
  locale: Locale | string,
  kind?: ContentPageKind
): Promise<LastKnownGoodResult<ContentPage[]>> {
  const normalizedLocale = normalizeLocale(locale);
  const kindKey = kind ?? "all";

  return withLastKnownGood({
    key: `content-pages:discoverable-detail:${normalizedLocale}:${kindKey}`,
    load: async () => {
      const pages = await Promise.all(
        DISCOVERABLE_CONTENT_PAGE_KEYS.map(async (slug) => {
          try {
            return (await getContentPageWithLastKnownGood(slug, normalizedLocale)).value;
          } catch {
            return null;
          }
        })
      );

      return pages
        .filter((page): page is ContentPage => Boolean(page))
        .filter((page) => page.isPublic && page.isIndexable)
        .filter((page) => !kind || page.kind === kind);
    },
    isUsable: (pages) => pages.length > 0,
    useStaleOnUnusable: true,
  });
}

export async function listApprovedEnglishContentPagesWithLastKnownGood(): Promise<
  LastKnownGoodResult<ContentPage[]>
> {
  return withLastKnownGood({
    key: "content-pages:approved-english-llms:wave1",
    load: async () => {
      const pages = await Promise.all(
        APPROVED_EN_CONTENT_PAGE_LLMS_SLUGS.map(async (slug) => {
          try {
            return (await getContentPageWithLastKnownGood(slug, "en")).value;
          } catch {
            return null;
          }
        })
      );

      return pages.filter(isApprovedEnglishContentPage);
    },
    isUsable: (pages) => pages.length === APPROVED_EN_CONTENT_PAGE_LLMS_SLUGS.length,
    useStaleOnUnusable: true,
  });
}

export async function listContentPagesForOps(locale: Locale | string): Promise<ContentPageSummary[]> {
  const query = buildQuery({
    locale: toApiLocale(locale),
    org_id: DEFAULT_ORG_ID,
  });

  try {
    const response = await apiClient.get<ContentPagesApiResponse>(`/v0.5/internal/content-pages${query}`, {
      locale,
      skipAuth: true,
      ...PUBLIC_API_CACHE_OPTIONS,
    });

    const pages = Array.isArray(response.items)
      ? response.items
          .map(normalizeContentPage)
          .filter((page): page is ContentPage => Boolean(page))
      : [];

    return pages.map(toSummary);
  } catch (error) {
    if (error instanceof ApiError) {
      return [];
    }

    throw error;
  }
}

export async function updateContentPageFromOps(
  slug: string,
  locale: Locale | string,
  payload: ContentPageUpdatePayload
): Promise<ContentPage | null> {
  const normalizedSlug = normalizeText(slug);
  if (!normalizedSlug) {
    return null;
  }

  try {
    const response = await apiClient.put<ContentPageMutationResponse>(
      `/v0.5/internal/content-pages/${encodeURIComponent(normalizedSlug)}`,
      payload,
      {
        locale,
      }
    );

    return response.page ? normalizeContentPage(response.page) : null;
  } catch (error) {
    if (error instanceof ApiError) {
      return null;
    }

    throw error;
  }
}
