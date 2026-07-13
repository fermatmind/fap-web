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

    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new PublicReadError({ kind: "contract", cause: payload });
    }
    if (payload.ok === false) {
      return null;
    }

    return {
      seo_title: payload.seo_title as string | null | undefined,
      seo_description: payload.seo_description as string | null | undefined,
      og_image_url: payload.og_image_url as string | null | undefined,
      is_indexable: typeof payload.is_indexable === "boolean" ? payload.is_indexable : undefined,
      pack_id: (payload.pack_id as string | null | undefined) ?? null,
      dir_version: (payload.dir_version as string | null | undefined) ?? null,
      content_package_version: (payload.content_package_version as string | null | undefined) ?? null,
      manifest_hash: (payload.manifest_hash as string | null | undefined) ?? null,
      norms_version: (payload.norms_version as string | null | undefined) ?? null,
      quality_level: (payload.quality_level as string | null | undefined) ?? null,
      capabilities: (payload.capabilities as Record<string, unknown> | null | undefined) ?? null,
      commercial: (payload.commercial as Record<string, unknown> | null | undefined) ?? null,
      price_tier: (payload.price_tier as string | null | undefined) ?? null,
      report_unlock_sku: (payload.report_unlock_sku as string | null | undefined) ?? null,
      upgrade_sku: (payload.upgrade_sku as string | null | undefined) ?? null,
      upgrade_sku_anchor: (payload.upgrade_sku_anchor as string | null | undefined) ?? null,
      offers: payload.offers,
      forms: Array.isArray(payload.forms) ? payload.forms : null,
      content_i18n_json: (payload.content_i18n_json as Record<string, unknown> | null | undefined) ?? null,
      report_summary_i18n_json:
        (payload.report_summary_i18n_json as Record<string, unknown> | null | undefined) ?? null,
      landing_surface_v1: (payload.landing_surface_v1 as LandingSurfaceRaw | null | undefined) ?? null,
    };
  } catch (error) {
    if (isAuthoritativePublicAbsence(error)) {
      return null;
    }

    throw error;
  }
}
