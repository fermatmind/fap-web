import { apiClient } from "@/lib/api-client";
import type { LandingSurfaceRaw } from "@/lib/api/v0_3";
import {
  SCALE_CANONICAL_SLUG_MAP,
  normalizeSupportedScaleCode,
  resolveCanonicalSlug,
} from "@/lib/assessmentSlugMap";
import { DEFAULT_TEST_COVER_URL } from "@/lib/cms/media";
import type { Locale } from "@/lib/i18n/locales";
import {
  isAuthoritativePublicAbsence,
  PublicReadError,
} from "@/lib/public-content/readError";
import { PUBLIC_API_CACHE_OPTIONS } from "@/lib/publicApiCache";

export type RelatedContentItem = {
  slug: string;
  title: string;
  href: string;
  summary?: string;
};

export type TestListItem = {
  title: string;
  title_i18n?: Record<string, string>;
  slug: string;
  description: string;
  cover_image: string;
  questions_count: number;
  time_minutes: number;
  scale_code?: string;
  card_visual?: string | null;
  card_tone?: string | null;
  card_seed?: string | null;
  card_density?: string | null;
  card_tagline_i18n?: Record<string, string>;
  highlight_priority?: number;
  highlight_rating?: number;
  highlight_excerpt_i18n?: Record<string, string>;
  highlight_seo_copy_i18n?: Record<string, string>;
  is_public?: boolean;
  is_active?: boolean;
  is_indexable?: boolean;
};

export type Test = TestListItem;

export type TestLookup = {
  ok: true;
  primary_slug: string;
  slug: string;
  requested_slug: string;
  resolved_from_alias: boolean;
  scale_code: string;
  scale_code_legacy?: string | null;
  scale_code_v2?: string | null;
  locale: string;
  is_public: true;
  seo_title?: string | null;
  seo_description?: string | null;
  og_image_url?: string | null;
  is_indexable?: boolean;
  pack_id?: string | null;
  dir_version?: string | null;
  content_package_version?: string | null;
  manifest_hash?: string | null;
  norms_version?: string | null;
  quality_level?: string | null;
  capabilities?: Record<string, unknown> | null;
  commercial?: Record<string, unknown> | null;
  price_tier?: string | null;
  report_unlock_sku?: string | null;
  upgrade_sku?: string | null;
  upgrade_sku_anchor?: string | null;
  offers?: unknown;
  forms?: unknown[] | null;
  content_i18n_json?: Record<string, unknown> | null;
  report_summary_i18n_json?: Record<string, unknown> | null;
  landing_surface_v1?: LandingSurfaceRaw | null;
};

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function toString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toNumber(value: unknown): number {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : 0;
}

function toStringRecord(value: unknown): Record<string, string> | undefined {
  const record = toRecord(value);
  const out: Record<string, string> = {};
  for (const [key, item] of Object.entries(record)) {
    const normalized = toString(item);
    if (normalized) {
      out[key] = normalized;
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function toNullableString(value: unknown): string | null {
  const normalized = toString(value);
  return normalized || null;
}

function normalizeLookupPayload(payload: unknown, requestedSlug: string, locale: Locale): TestLookup {
  const row = toRecord(payload);
  const primarySlug = resolveCanonicalSlug(toString(row.primary_slug ?? row.slug));
  const normalizedRequestedSlug = resolveCanonicalSlug(requestedSlug);
  const scaleCode = normalizeSupportedScaleCode(toString(row.scale_code))
    ?? normalizeSupportedScaleCode(toString(row.scale_code_legacy))
    ?? toString(row.scale_code);
  const responseLocale = toString(row.locale);
  const forms = Array.isArray(row.forms) ? row.forms : [];
  const landingSurface = toRecord(row.landing_surface_v1);
  const localeMatches =
    locale === "zh"
      ? responseLocale === "zh" || responseLocale.toLowerCase() === "zh-cn"
      : responseLocale.toLowerCase() === "en";

  if (
    row.ok !== true
    || row.is_public !== true
    || !primarySlug
    || primarySlug !== normalizedRequestedSlug
    || !scaleCode
    || !localeMatches
    || !toString(row.requested_slug)
    || typeof row.is_indexable !== "boolean"
    || forms.length === 0
    || forms.some((form) => {
      const node = toRecord(form);
      return !toString(node.form_code) || toNumber(node.question_count) <= 0;
    })
    || Object.keys(landingSurface).length === 0
    || !row.content_i18n_json
    || typeof row.content_i18n_json !== "object"
    || Array.isArray(row.content_i18n_json)
  ) {
    throw new PublicReadError({ kind: "contract", cause: payload });
  }

  return {
    ok: true,
    primary_slug: primarySlug,
    slug: primarySlug,
    requested_slug: toString(row.requested_slug),
    resolved_from_alias: row.resolved_from_alias === true,
    scale_code: scaleCode,
    scale_code_legacy: toNullableString(row.scale_code_legacy),
    scale_code_v2: toNullableString(row.scale_code_v2),
    locale: responseLocale,
    is_public: true,
    seo_title: toNullableString(row.seo_title),
    seo_description: toNullableString(row.seo_description),
    og_image_url: toNullableString(row.og_image_url),
    is_indexable: typeof row.is_indexable === "boolean" ? row.is_indexable : undefined,
    pack_id: toNullableString(row.pack_id),
    dir_version: toNullableString(row.dir_version),
    content_package_version: toNullableString(row.content_package_version),
    manifest_hash: toNullableString(row.manifest_hash),
    norms_version: toNullableString(row.norms_version),
    quality_level: toNullableString(row.quality_level),
    capabilities: Object.keys(toRecord(row.capabilities)).length > 0 ? toRecord(row.capabilities) : null,
    commercial: Object.keys(toRecord(row.commercial)).length > 0 ? toRecord(row.commercial) : null,
    price_tier: toNullableString(row.price_tier),
    report_unlock_sku: toNullableString(row.report_unlock_sku),
    upgrade_sku: toNullableString(row.upgrade_sku),
    upgrade_sku_anchor: toNullableString(row.upgrade_sku_anchor),
    offers: row.offers,
    forms,
    content_i18n_json: toRecord(row.content_i18n_json),
    report_summary_i18n_json:
      Object.keys(toRecord(row.report_summary_i18n_json)).length > 0
        ? toRecord(row.report_summary_i18n_json)
        : null,
    landing_surface_v1: landingSurface as LandingSurfaceRaw,
  };
}

function normalizeCatalogItem(item: unknown): TestListItem | null {
  const row = toRecord(item);
  const scaleCode = normalizeSupportedScaleCode(toString(row.scale_code));
  const slug = scaleCode ? SCALE_CANONICAL_SLUG_MAP[scaleCode] : resolveCanonicalSlug(toString(row.slug));
  const title = toString(row.title);
  if (!slug || !title) return null;

  return {
    title,
    title_i18n: toStringRecord(row.title_i18n),
    slug,
    description: toString(row.description),
    cover_image: toString(row.cover_image) || DEFAULT_TEST_COVER_URL,
    questions_count: toNumber(row.questions_count),
    time_minutes: toNumber(row.time_minutes),
    scale_code: scaleCode ?? (toString(row.scale_code) || undefined),
    card_visual: toString(row.card_visual) || null,
    card_tone: toString(row.card_tone) || null,
    card_seed: toString(row.card_seed) || null,
    card_density: toString(row.card_density) || null,
    card_tagline_i18n: toStringRecord(row.card_tagline_i18n),
    highlight_priority: toNumber(row.highlight_priority),
    highlight_rating: toNumber(row.highlight_rating),
    highlight_excerpt_i18n: toStringRecord(row.highlight_excerpt_i18n),
    highlight_seo_copy_i18n: toStringRecord(row.highlight_seo_copy_i18n),
    is_public: typeof row.is_public === "boolean" ? row.is_public : undefined,
    is_active: typeof row.is_active === "boolean" ? row.is_active : undefined,
    is_indexable: typeof row.is_indexable === "boolean" ? row.is_indexable : undefined,
  };
}

export async function getAllTests(locale: Locale = "en"): Promise<TestListItem[]> {
  const apiLocale = locale === "zh" ? "zh-CN" : "en";
  let payload: unknown;
  try {
    payload = await apiClient.getPublic<unknown>(
      `/v0.3/scales/catalog?locale=${encodeURIComponent(apiLocale)}`,
      {
        locale: apiLocale,
        skipAuth: true,
        ...PUBLIC_API_CACHE_OPTIONS,
      }
    );
  } catch (error) {
    if (isAuthoritativePublicAbsence(error)) {
      return [];
    }

    throw error;
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new PublicReadError({ kind: "contract", cause: payload });
  }
  const payloadNode = payload as Record<string, unknown>;
  if (payloadNode.ok === false) {
    return [];
  }
  if (!Array.isArray(payloadNode.items)) {
    throw new PublicReadError({ kind: "contract", cause: payload });
  }

  return payloadNode.items
    .map(normalizeCatalogItem)
    .filter((item): item is TestListItem => item !== null)
    .sort(
      (a, b) => (b.highlight_priority ?? 0) - (a.highlight_priority ?? 0) || a.title.localeCompare(b.title)
    );
}

export function resolveTestTitleByLocale(
  test: Pick<TestListItem, "title" | "title_i18n">,
  locale: Locale
): string {
  const source = test.title_i18n;
  if (!source || typeof source !== "object") return test.title;

  const localized =
    locale === "zh"
      ? source.zh ?? source["zh-CN"] ?? source.en
      : source.en ?? source.zh ?? source["zh-CN"];

  if (typeof localized === "string" && localized.trim().length > 0) {
    return localized.trim();
  }
  return test.title;
}

export async function getTestBySlug(slug: string, locale: Locale = "en"): Promise<Test | null> {
  const normalizedSlug = resolveCanonicalSlug(slug);
  const tests = await getAllTests(locale);
  return tests.find((test) => test.slug === normalizedSlug) ?? null;
}

export async function getTestLookup(slug: string, locale: Locale = "en"): Promise<TestLookup | null> {
  const normalizedSlug = resolveCanonicalSlug(slug);
  if (!normalizedSlug) {
    return null;
  }

  try {
    const payload = await apiClient.getPublic<Record<string, unknown>>(
      `/v0.3/scales/lookup?slug=${encodeURIComponent(normalizedSlug)}&locale=${locale}`,
      {
        locale,
        skipAuth: true,
        ...PUBLIC_API_CACHE_OPTIONS,
      }
    );

    if (payload?.ok === false) {
      return null;
    }

    return normalizeLookupPayload(payload, normalizedSlug, locale);
  } catch (error) {
    if (isAuthoritativePublicAbsence(error)) {
      return null;
    }

    throw error;
  }
}
