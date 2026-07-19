import { apiClient } from "@/lib/api-client";
import { localizedPath, normalizeLocale, toApiLocale, type Locale } from "@/lib/i18n/locales";
import { isAuthoritativePublicAbsence } from "@/lib/public-content/readError";
import { normalizePublicReview, type PublicReview } from "@/lib/public-content/publicReview";

export const RESEARCH_REPORT_PAGE_ENTITY_TYPE = "research_report" as const;
export const MAX_RESEARCH_REPORT_SLUG_LENGTH = 128;

const RESEARCH_REPORT_SLUG_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/;

type ResearchReportApiRecord = {
  id?: unknown;
  slug?: unknown;
  locale?: unknown;
  page_entity_type?: unknown;
  title?: unknown;
  executive_summary?: unknown;
  body_md?: unknown;
  research_type?: unknown;
  methodology?: unknown;
  sample_disclaimer?: unknown;
  claim_boundary?: unknown;
  author_name?: unknown;
  review_state?: unknown;
  reviewer?: unknown;
  references?: unknown;
  downloadable_asset_placeholder?: unknown;
  last_reviewed_at?: unknown;
  published_at?: unknown;
  status?: unknown;
  publication_state?: unknown;
  is_published?: unknown;
  published_revision_id?: unknown;
  publishedRevisionId?: unknown;
  published_revision?: unknown;
  seo_title?: unknown;
  seo_description?: unknown;
  canonical_path?: unknown;
};

type ResearchReportApiResponse = {
  ok?: unknown;
  report?: ResearchReportApiRecord | null;
};

export type ResearchReport = {
  id: number | null;
  slug: string;
  locale: Locale;
  pageEntityType: typeof RESEARCH_REPORT_PAGE_ENTITY_TYPE;
  title: string;
  executiveSummary: string;
  bodyMd: string;
  researchType: string;
  methodology: string;
  sampleDisclaimer: string;
  claimBoundary: string;
  authorName: string | null;
  publicReview: PublicReview;
  references: string[];
  downloadableAssetPlaceholder: string | null;
  publishedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalPath: string | null;
};

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asNullableString(value: unknown): string | null {
  const normalized = asString(value);
  return normalized || null;
}

function asNullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function normalizeReferences(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => asString(item))
    .filter(Boolean)
    .slice(0, 50);
}

export function normalizeResearchReportSlug(value: string): string {
  const slug = value.trim();
  if (
    slug.length === 0 ||
    slug.length > MAX_RESEARCH_REPORT_SLUG_LENGTH ||
    !RESEARCH_REPORT_SLUG_PATTERN.test(slug)
  ) {
    throw new Error("Invalid research report slug.");
  }
  return slug;
}

export function buildResearchReportPath(slug: string, locale: Locale | string): string {
  return localizedPath(`/research/${normalizeResearchReportSlug(slug)}`, normalizeLocale(locale));
}

function hasPublishedRevisionPointer(record: ResearchReportApiRecord): boolean {
  return Boolean(
    asNullableNumber(record.published_revision_id) !== null ||
      asNullableNumber(record.publishedRevisionId) !== null ||
      asNullableNumber(asRecord(record.published_revision)?.id) !== null
  );
}

function isPublishedResearchReportRecord(record: ResearchReportApiRecord): boolean {
  const state = asString(record.status || record.publication_state).toLowerCase();

  if (state && state !== "published") {
    return false;
  }

  if (record.is_published === false) {
    return false;
  }

  return state === "published" || record.is_published === true || Boolean(asNullableString(record.published_at)) || hasPublishedRevisionPointer(record);
}

function normalizeResearchReport(
  record: ResearchReportApiRecord | null | undefined,
  expectedSlug: string
): ResearchReport | null {
  if (!record || record.page_entity_type !== RESEARCH_REPORT_PAGE_ENTITY_TYPE) {
    return null;
  }

  let slug: string;
  try {
    slug = normalizeResearchReportSlug(asString(record.slug));
  } catch {
    return null;
  }

  if (slug !== expectedSlug || !isPublishedResearchReportRecord(record)) {
    return null;
  }

  const title = asString(record.title);
  const executiveSummary = asString(record.executive_summary);
  const methodology = asString(record.methodology);
  const sampleDisclaimer = asString(record.sample_disclaimer);
  const claimBoundary = asString(record.claim_boundary);

  if (!slug || !title || !executiveSummary || !methodology || !sampleDisclaimer || !claimBoundary) {
    return null;
  }

  return {
    id: asNullableNumber(record.id),
    slug,
    locale: normalizeLocale(asString(record.locale)),
    pageEntityType: RESEARCH_REPORT_PAGE_ENTITY_TYPE,
    title,
    executiveSummary,
    bodyMd: asString(record.body_md),
    researchType: asString(record.research_type),
    methodology,
    sampleDisclaimer,
    claimBoundary,
    authorName: asNullableString(record.author_name),
    publicReview: normalizePublicReview(record),
    references: normalizeReferences(record.references),
    downloadableAssetPlaceholder: asNullableString(record.downloadable_asset_placeholder),
    publishedAt: asNullableString(record.published_at),
    seoTitle: asNullableString(record.seo_title),
    seoDescription: asNullableString(record.seo_description),
    canonicalPath: asNullableString(record.canonical_path),
  };
}

export async function getResearchReport(slug: string, locale: Locale | string): Promise<ResearchReport | null> {
  let normalizedSlug: string;
  try {
    normalizedSlug = normalizeResearchReportSlug(slug);
  } catch {
    return null;
  }

  const normalizedLocale = normalizeLocale(locale);
  const query = new URLSearchParams({
    locale: toApiLocale(normalizedLocale),
    org_id: "0",
  });

  try {
    const response = await apiClient.getPublic<ResearchReportApiResponse>(
      `/v0.5/research/${encodeURIComponent(normalizedSlug)}?${query.toString()}`,
      {
        locale: normalizedLocale,
        skipAuth: true,
        cache: "no-store",
      }
    );

    return normalizeResearchReport(response.report, normalizedSlug);
  } catch (error) {
    if (isAuthoritativePublicAbsence(error)) {
      return null;
    }
    throw error;
  }
}
