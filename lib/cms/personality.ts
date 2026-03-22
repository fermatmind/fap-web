import { ApiError, apiClient } from "@/lib/api-client";
import type { AnswerSurfaceRaw, LandingSurfaceRaw, SeoSurfaceRaw } from "@/lib/api/v0_3";
import { normalizeAnswerSurface, type AnswerSurfaceViewModel } from "@/lib/answer/answerSurface";
import { localizedPath, normalizeLocale, toApiLocale, type Locale } from "@/lib/i18n/locales";
import { normalizeLandingSurface, type LandingSurfaceViewModel } from "@/lib/landing/landingSurface";
import { normalizeSeoSurface, type SeoSurfaceViewModel } from "@/lib/seo/seoSurface";
import { canonicalUrl } from "@/lib/site";

const DEFAULT_ORG_ID = "0";
const DEFAULT_SCALE_CODE = "MBTI";
const MBTI_BASE_SLUG_RE = /^[ie][ns][ft][jp]$/i;
const MBTI_RUNTIME_SLUG_RE = /^[ie][ns][ft][jp]-[at]$/i;

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
  landing_surface_v1?: LandingSurfaceRaw | null;
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
  mbti_public_projection_v1?: CmsPersonalityApiProjectionV1 | null;
  landing_surface_v1?: LandingSurfaceRaw | null;
  answer_surface_v1?: AnswerSurfaceRaw | null;
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
  seo_surface_v1?: SeoSurfaceRaw | null;
};

export type CmsPersonalityApiProjectionProfile = {
  type_name?: string | null;
  nickname?: string | null;
  rarity?: string | null;
  keywords?: unknown;
  hero_summary?: string | null;
};

export type CmsPersonalityApiProjectionSummaryCard = {
  title?: string | null;
  subtitle?: string | null;
  summary?: string | null;
  tagline?: string | null;
  public_tags?: unknown;
};

export type CmsPersonalityApiProjectionDimension = {
  id?: string | null;
  code?: string | null;
  name?: string | null;
  label?: string | null;
  axis_left?: string | null;
  axis_right?: string | null;
  summary?: string | null;
  description?: string | null;
  score_pct?: number | null;
  source?: string | null;
  side?: string | null;
  side_label?: string | null;
  pct?: number | null;
  state?: string | null;
};

export type CmsPersonalityApiProjectionSection = {
  key?: string | null;
  title?: string | null;
  render?: string | null;
  body_md?: string | null;
  payload?: unknown;
  is_enabled?: boolean;
  source?: string | null;
};

export type CmsPersonalityApiProjectionSeo = {
  title?: string | null;
  description?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image_url?: string | null;
  twitter_title?: string | null;
  twitter_description?: string | null;
  twitter_image_url?: string | null;
  canonical_url?: string | null;
  robots?: string | null;
  jsonld?: unknown;
};

export type CmsPersonalityApiProjectionMeta = {
  authority_source?: string | null;
  route_mode?: string | null;
  public_route_type?: string | null;
  schema_version?: string | null;
  authority_meta?: unknown;
};

export type CmsPersonalityApiProjectionV1 = {
  runtime_type_code?: string | null;
  canonical_type_code?: string | null;
  display_type?: string | null;
  variant_code?: string | null;
  profile?: CmsPersonalityApiProjectionProfile | null;
  summary_card?: CmsPersonalityApiProjectionSummaryCard | null;
  dimensions?: CmsPersonalityApiProjectionDimension[];
  sections?: CmsPersonalityApiProjectionSection[];
  seo?: CmsPersonalityApiProjectionSeo | null;
  offer_set?: unknown;
  _meta?: CmsPersonalityApiProjectionMeta | null;
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
  surface: SeoSurfaceViewModel | null;
};

export type PersonalityProjectionProfile = {
  typeName: string | null;
  nickname: string | null;
  rarity: string | null;
  keywords: string[];
  heroSummary: string | null;
};

export type PersonalityProjectionSummaryCard = {
  title: string | null;
  subtitle: string | null;
  summary: string | null;
  tagline: string | null;
  publicTags: string[];
};

export type PersonalityProjectionDimension = {
  id: string;
  code: string | null;
  name: string | null;
  label: string | null;
  axisLeft: string | null;
  axisRight: string | null;
  summary: string | null;
  description: string | null;
  scorePct: number | null;
  source: string | null;
  side: string | null;
  sideLabel: string | null;
  pct: number | null;
  state: string | null;
};

export type PersonalityProjectionSection = {
  key: string;
  title: string;
  render: string;
  bodyMd: string;
  payload: Record<string, unknown> | null;
  isEnabled: boolean;
  source: string | null;
};

export type PersonalityProjectionSeo = {
  title: string | null;
  description: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageUrl: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImageUrl: string | null;
  canonicalUrl: string | null;
  robots: string | null;
  jsonld: unknown;
};

export type PersonalityProjectionMeta = {
  authoritySource: string | null;
  routeMode: string | null;
  publicRouteType: string | null;
  schemaVersion: string | null;
  authorityMeta: unknown;
};

export type PersonalityProjection = {
  runtimeTypeCode: string | null;
  canonicalTypeCode: string;
  displayType: string;
  variantCode: string | null;
  profile: PersonalityProjectionProfile;
  summaryCard: PersonalityProjectionSummaryCard;
  dimensions: PersonalityProjectionDimension[];
  sections: PersonalityProjectionSection[];
  seo: PersonalityProjectionSeo;
  offerSet: unknown;
  meta: PersonalityProjectionMeta;
};

export type PersonalityProjectionViewModel = {
  slug: string;
  routeSlug: string;
  locale: string;
  isIndexable: boolean;
  heroKicker: string | null;
  heroQuote: string | null;
  heroImageUrl: string | null;
  canonicalTypeCode: string;
  displayType: string;
  typeName: string | null;
  nickname: string | null;
  rarity: string | null;
  keywords: string[];
  heroSummary: string | null;
  title: string;
  subtitle: string | null;
  summary: string | null;
  projection: PersonalityProjection;
  faqSections: CmsPersonalitySection[];
  supplementalSections: CmsPersonalitySection[];
  seoMeta: CmsPersonalitySeoMeta | null;
  landingSurface: LandingSurfaceViewModel | null;
  answerSurface: AnswerSurfaceViewModel | null;
};

export type PersonalitySeoCompatibilityInput = {
  slug: string;
  locale: string;
  title: string;
  subtitle: string;
  excerpt: string;
  isIndexable: boolean;
  seoMeta: CmsPersonalitySeoMeta | null;
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

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const items = value
    .map((item) => fallbackText(typeof item === "string" ? item : String(item ?? "")))
    .filter(Boolean);

  return Array.from(new Set(items));
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function normalizeProjectionProfile(
  profile: CmsPersonalityApiProjectionProfile | null | undefined
): PersonalityProjectionProfile {
  return {
    typeName: fallbackText(profile?.type_name) || null,
    nickname: fallbackText(profile?.nickname) || null,
    rarity: fallbackText(profile?.rarity) || null,
    keywords: normalizeStringArray(profile?.keywords),
    heroSummary: fallbackText(profile?.hero_summary) || null,
  };
}

function normalizeProjectionSummaryCard(
  summaryCard: CmsPersonalityApiProjectionSummaryCard | null | undefined
): PersonalityProjectionSummaryCard {
  return {
    title: fallbackText(summaryCard?.title) || null,
    subtitle: fallbackText(summaryCard?.subtitle) || null,
    summary: fallbackText(summaryCard?.summary) || null,
    tagline: fallbackText(summaryCard?.tagline) || null,
    publicTags: normalizeStringArray(summaryCard?.public_tags),
  };
}

function normalizeProjectionDimension(
  dimension: CmsPersonalityApiProjectionDimension
): PersonalityProjectionDimension | null {
  const id = fallbackText(dimension.id, dimension.code).toUpperCase();
  if (!id) {
    return null;
  }

  return {
    id,
    code: fallbackText(dimension.code) || null,
    name: fallbackText(dimension.name) || null,
    label: fallbackText(dimension.label) || null,
    axisLeft: fallbackText(dimension.axis_left) || null,
    axisRight: fallbackText(dimension.axis_right) || null,
    summary: fallbackText(dimension.summary) || null,
    description: fallbackText(dimension.description) || null,
    scorePct: typeof dimension.score_pct === "number" ? dimension.score_pct : null,
    source: fallbackText(dimension.source) || null,
    side: fallbackText(dimension.side) || null,
    sideLabel: fallbackText(dimension.side_label) || null,
    pct: typeof dimension.pct === "number" ? dimension.pct : null,
    state: fallbackText(dimension.state) || null,
  };
}

function normalizeProjectionSection(
  section: CmsPersonalityApiProjectionSection
): PersonalityProjectionSection | null {
  const key = fallbackText(section.key).toLowerCase();
  if (!key) {
    return null;
  }

  return {
    key,
    title: fallbackText(section.title, section.key),
    render: fallbackText(section.render, "rich_text"),
    bodyMd: String(section.body_md ?? ""),
    payload: asRecord(section.payload),
    isEnabled: section.is_enabled !== false,
    source: fallbackText(section.source) || null,
  };
}

function normalizeProjectionSeo(seo: CmsPersonalityApiProjectionSeo | null | undefined): PersonalityProjectionSeo {
  return {
    title: fallbackText(seo?.title) || null,
    description: fallbackText(seo?.description) || null,
    ogTitle: fallbackText(seo?.og_title) || null,
    ogDescription: fallbackText(seo?.og_description) || null,
    ogImageUrl: normalizeIsoValue(seo?.og_image_url),
    twitterTitle: fallbackText(seo?.twitter_title) || null,
    twitterDescription: fallbackText(seo?.twitter_description) || null,
    twitterImageUrl: normalizeIsoValue(seo?.twitter_image_url),
    canonicalUrl: normalizeIsoValue(seo?.canonical_url),
    robots: fallbackText(seo?.robots) || null,
    jsonld: seo?.jsonld ?? null,
  };
}

function normalizeProjectionMeta(
  meta: CmsPersonalityApiProjectionMeta | null | undefined
): PersonalityProjectionMeta {
  return {
    authoritySource: fallbackText(meta?.authority_source) || null,
    routeMode: fallbackText(meta?.route_mode) || null,
    publicRouteType: fallbackText(meta?.public_route_type) || null,
    schemaVersion: fallbackText(meta?.schema_version) || null,
    authorityMeta: meta?.authority_meta ?? null,
  };
}

function normalizeProjection(
  projection: CmsPersonalityApiProjectionV1 | null | undefined
): PersonalityProjection | null {
  if (!projection || typeof projection !== "object") {
    return null;
  }

  const canonicalTypeCode = fallbackText(projection.canonical_type_code).toUpperCase();
  if (!canonicalTypeCode) {
    return null;
  }

  const normalizedProfile = normalizeProjectionProfile(projection.profile);
  const normalizedSummaryCard = normalizeProjectionSummaryCard(projection.summary_card);

  return {
    runtimeTypeCode: fallbackText(projection.runtime_type_code).toUpperCase() || null,
    canonicalTypeCode,
    displayType: fallbackText(projection.display_type, canonicalTypeCode),
    variantCode: fallbackText(projection.variant_code).toUpperCase() || null,
    profile: normalizedProfile,
    summaryCard: normalizedSummaryCard,
    dimensions: Array.isArray(projection.dimensions)
      ? projection.dimensions
          .map(normalizeProjectionDimension)
          .filter((dimension): dimension is PersonalityProjectionDimension => dimension !== null)
      : [],
    sections: Array.isArray(projection.sections)
      ? projection.sections
          .map(normalizeProjectionSection)
          .filter((section): section is PersonalityProjectionSection => section !== null)
          .filter((section) => section.isEnabled)
      : [],
    seo: normalizeProjectionSeo(projection.seo),
    offerSet: projection.offer_set ?? null,
    meta: normalizeProjectionMeta(projection._meta),
  };
}

function buildProjectionViewModel(
  detailProfile: CmsPersonalityProfile,
  projection: PersonalityProjection
): PersonalityProjectionViewModel {
  const faqSections = detailProfile.sections.filter((section) => section.sectionKey === "faq");
  const supplementalSections = detailProfile.sections.filter((section) => section.sectionKey === "related_content");
  const title = fallbackText(projection.summaryCard.title, projection.displayType, projection.canonicalTypeCode);

  return {
    slug: detailProfile.slug,
    routeSlug: runtimeTypeCodeToSlug(projection.runtimeTypeCode) ?? detailProfile.slug,
    locale: detailProfile.locale,
    isIndexable: detailProfile.isIndexable,
    heroKicker: fallbackText(detailProfile.heroKicker) || null,
    heroQuote: fallbackText(detailProfile.heroQuote) || null,
    heroImageUrl: detailProfile.heroImageUrl,
    canonicalTypeCode: projection.canonicalTypeCode,
    displayType: projection.displayType,
    typeName: projection.profile.typeName,
    nickname: projection.profile.nickname,
    rarity: projection.profile.rarity,
    keywords: projection.profile.keywords,
    heroSummary: projection.profile.heroSummary,
    title,
    subtitle: projection.summaryCard.subtitle,
    summary: projection.summaryCard.summary,
    projection,
    faqSections,
    supplementalSections,
    seoMeta: detailProfile.seoMeta,
    landingSurface: null,
    answerSurface: null,
  };
}

function toSeoCompatibilityInputFromDetail(
  detail: PersonalityProjectionViewModel | CmsPersonalityProfile
): PersonalitySeoCompatibilityInput {
  if ("projection" in detail) {
    return {
      slug: detail.routeSlug,
      locale: detail.locale,
      title: detail.title,
      subtitle: detail.subtitle ?? "",
      excerpt: detail.summary ?? "",
      isIndexable: detail.isIndexable,
      seoMeta: detail.seoMeta,
    };
  }

  return {
    slug: detail.slug,
    locale: detail.locale,
    title: detail.title,
    subtitle: detail.subtitle,
    excerpt: detail.excerpt,
    isIndexable: detail.isIndexable,
    seoMeta: detail.seoMeta,
  };
}

function buildFallbackJsonLd(profile: CmsPersonalityProfile, canonicalPath: string): Record<string, unknown> {
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
    return buildFallbackJsonLd(profile, localizedCanonicalPath);
  }

  const normalized = walk(jsonld);

  if (!normalized || Array.isArray(normalized) || typeof normalized !== "object") {
    return buildFallbackJsonLd(profile, localizedCanonicalPath);
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

export function isCanonicalPersonalityBaseSlug(value: string): boolean {
  return MBTI_BASE_SLUG_RE.test(normalizePersonalitySlug(value));
}

export function buildDefaultPublicPersonalitySlug(value: string): string {
  const normalized = normalizePersonalitySlug(value);
  if (!normalized) {
    return "";
  }

  if (MBTI_RUNTIME_SLUG_RE.test(normalized)) {
    return normalized;
  }

  return MBTI_BASE_SLUG_RE.test(normalized) ? `${normalized}-a` : normalized;
}

export function buildPersonalityFrontendUrl(locale: Locale | string, slug: string): string {
  return localizedPath(`/personality/${normalizePersonalitySlug(slug)}`, normalizeLocale(locale));
}

export function normalizePersonalitySeoPayload(
  seo: CmsPersonalitySeoPayload | null,
  profile: PersonalityProjectionViewModel | CmsPersonalityProfile,
  locale: Locale | string
): CmsPersonalitySeoPayload {
  const compatibility = toSeoCompatibilityInputFromDetail(profile);
  const canonicalRouteSlug =
    extractPersonalitySlugFromPublicUrl(seo?.meta.canonical) ??
    ("projection" in profile ? runtimeTypeCodeToSlug(profile.projection.runtimeTypeCode) : null) ??
    buildDefaultPublicPersonalitySlug(compatibility.slug);
  const canonicalPath = buildPersonalityFrontendUrl(locale, canonicalRouteSlug);
  const normalizedCanonical = canonicalUrl(canonicalPath);
  const alternateEnSlug = extractPersonalitySlugFromPublicUrl(seo?.meta.alternates?.en) ?? canonicalRouteSlug;
  const alternateZhSlug = extractPersonalitySlugFromPublicUrl(seo?.meta.alternates?.["zh-CN"]) ?? canonicalRouteSlug;
  const title = fallbackText(seo?.meta.title, compatibility.seoMeta?.seoTitle, compatibility.title);
  const description = fallbackText(
    seo?.meta.description,
    compatibility.seoMeta?.seoDescription,
    compatibility.excerpt,
    compatibility.subtitle
  );
  const robots = fallbackText(
    seo?.meta.robots,
    compatibility.seoMeta?.robots,
    compatibility.isIndexable ? "index,follow" : "noindex,follow"
  );

  return {
    meta: {
      title,
      description,
      canonical: normalizedCanonical,
      alternates: {
        en: canonicalUrl(buildPersonalityFrontendUrl("en", alternateEnSlug)),
        "zh-CN": canonicalUrl(buildPersonalityFrontendUrl("zh", alternateZhSlug)),
      },
      og: {
        title: fallbackText(seo?.meta.og.title, compatibility.seoMeta?.ogTitle, title),
        description: fallbackText(seo?.meta.og.description, compatibility.seoMeta?.ogDescription, description),
        image: normalizeIsoValue(seo?.meta.og.image ?? compatibility.seoMeta?.ogImageUrl),
        type: fallbackText(seo?.meta.og.type, "article"),
      },
      twitter: {
        card: fallbackText(seo?.meta.twitter.card, "summary_large_image"),
        title: fallbackText(seo?.meta.twitter.title, compatibility.seoMeta?.twitterTitle, title),
        description: fallbackText(
          seo?.meta.twitter.description,
          compatibility.seoMeta?.twitterDescription,
          description
        ),
        image: normalizeIsoValue(
          seo?.meta.twitter.image ??
            compatibility.seoMeta?.twitterImageUrl ??
            compatibility.seoMeta?.ogImageUrl
        ),
      },
      robots,
    },
    jsonld: normalizePersonalityJsonLd(
      seo?.jsonld ?? null,
      seo?.meta.canonical,
      canonicalPath,
      "projection" in profile
        ? {
            id: null,
            orgId: 0,
            scaleCode: DEFAULT_SCALE_CODE,
            typeCode: profile.canonicalTypeCode,
            slug: profile.slug,
            locale: profile.locale,
            title: compatibility.title,
            subtitle: compatibility.subtitle,
            excerpt: compatibility.excerpt,
            status: "published",
            isPublic: true,
            isIndexable: compatibility.isIndexable,
            publishedAt: null,
            updatedAt: null,
            seoMeta: compatibility.seoMeta,
            heroKicker: profile.heroKicker ?? profile.canonicalTypeCode,
            heroQuote: profile.heroQuote ?? "",
            heroImageUrl: profile.heroImageUrl,
            sections: [],
          }
        : profile
    ),
    surface: seo?.surface ?? null,
  };
}

function runtimeTypeCodeToSlug(value: string | null | undefined): string | null {
  const normalized = normalizePersonalitySlug(String(value ?? ""));

  return MBTI_RUNTIME_SLUG_RE.test(normalized) ? normalized : null;
}

function extractPersonalitySlugFromPublicUrl(value: string | null | undefined): string | null {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    return null;
  }

  try {
    const url = /^https?:\/\//i.test(normalized) ? new URL(normalized) : new URL(normalized, "http://localhost");
    const match = url.pathname.match(/^\/(?:en|zh)\/personality\/([a-z]{4}(?:-[at])?)\/?$/i);

    return match?.[1] ? normalizePersonalitySlug(match[1]) : null;
  } catch {
    return null;
  }
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
      landingSurface: normalizeLandingSurface(response.landing_surface_v1 ?? null),
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
        landingSurface: null,
        pagination: emptyPagination(requestedPage, requestedPerPage),
      };
    }

    throw error;
  }
}

async function getPersonalityDetailResponseBySlugOrType(
  slugOrType: string,
  locale: Locale | string
): Promise<CmsPersonalityDetailApiResponse | null> {
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
    return await apiClient.get<CmsPersonalityDetailApiResponse>(
      `/v0.5/personality/${encodeURIComponent(normalizedSlug)}${query}`,
      {
        locale,
        skipAuth: true,
        cache: "no-store",
      }
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function getPersonalityProfileBySlugOrType(
  slugOrType: string,
  locale: Locale | string
): Promise<CmsPersonalityProfile | null> {
  const response = await getPersonalityDetailResponseBySlugOrType(slugOrType, locale);
  if (!response?.profile) {
    return null;
  }

  const profile = normalizeProfileDetail(response.profile, response.sections, response.seo_meta ?? null);
  return profile.slug && profile.title ? profile : null;
}

export async function getPersonalityProjectionDetailBySlugOrType(
  slugOrType: string,
  locale: Locale | string
): Promise<PersonalityProjectionViewModel | null> {
  const response = await getPersonalityDetailResponseBySlugOrType(slugOrType, locale);
  if (!response?.profile) {
    return null;
  }

  const detailProfile = normalizeProfileDetail(response.profile, response.sections, response.seo_meta ?? null);
  if (!detailProfile.slug || !detailProfile.title) {
    return null;
  }

  const projection = normalizeProjection(response.mbti_public_projection_v1);
  if (!projection) {
    return null;
  }

  return {
    ...buildProjectionViewModel(detailProfile, projection),
    landingSurface: normalizeLandingSurface(response.landing_surface_v1 ?? null),
    answerSurface: normalizeAnswerSurface(response.answer_surface_v1 ?? null),
  };
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
      surface: normalizeSeoSurface(response.seo_surface_v1 ?? null),
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}
