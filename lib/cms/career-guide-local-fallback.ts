import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  getCareerGuideBySlug,
  getCareerIndustryBySlug,
  listCareerGuides,
  type LocalizedCareerGuide,
  type RelatedContentItem,
} from "@/lib/content";
import { localizedPath, normalizeLocale, type Locale } from "@/lib/i18n/locales";
import type { CareerGuideDetailViewModel, CareerGuideListItem } from "@/lib/cms/career-guides";

function textValue(...candidates: Array<unknown>): string {
  for (const candidate of candidates) {
    const normalized = String(candidate ?? "").replace(/\s+/g, " ").trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function readLocalBody(slug: string, locale: Locale): string {
  try {
    const source = readFileSync(
      join(process.cwd(), "content", "career", "guides", slug, `${locale}.mdx`),
      "utf8"
    );

    return source.replace(/^---[\s\S]*?---\s*/u, "").trim();
  } catch {
    return "";
  }
}

function buildGuideUrl(locale: Locale | string, slug: string): string {
  return localizedPath(`/career/guides/${slug}`, normalizeLocale(locale));
}

function adaptListItem(
  guide: LocalizedCareerGuide,
  locale: Locale | string
): CareerGuideListItem {
  const normalizedLocale = normalizeLocale(locale);
  return {
    id: null,
    orgId: 0,
    guideCode: guide.slug,
    slug: guide.slug,
    locale: guide.locale,
    title: guide.title,
    summary: guide.summary,
    category: guide.category,
    categorySlug: guide.category,
    href: buildGuideUrl(normalizedLocale, guide.slug),
    isPublic: true,
    isIndexable: true,
    publishedAt: guide.publishedAt,
    updatedAt: guide.updatedAt,
  };
}

function adaptIndustry(
  rawSlug: string,
  locale: Locale | string
): RelatedContentItem | null {
  const slug = String(rawSlug ?? "").trim().toLowerCase();
  if (!slug) {
    return null;
  }

  const industry = getCareerIndustryBySlug(slug, normalizeLocale(locale));
  if (!industry) {
    return null;
  }

  return {
    slug: industry.slug,
    title: industry.title,
    href: localizedPath(`/career/industries/${industry.slug}`, normalizeLocale(locale)),
    summary: industry.summary,
  };
}

function adaptDetail(
  guide: LocalizedCareerGuide,
  locale: Locale | string
): CareerGuideDetailViewModel {
  const normalizedLocale = normalizeLocale(locale);
  const listItem = adaptListItem(guide, normalizedLocale);

  return {
    ...listItem,
    bodyMd: readLocalBody(guide.slug, normalizedLocale),
    bodyHtml: "",
    relatedJobs: [],
    relatedIndustries: (guide.related_industry_slugs ?? [])
      .map((slug) => adaptIndustry(slug, normalizedLocale))
      .filter((item): item is RelatedContentItem => item !== null),
    relatedArticles: [],
    relatedPersonalityProfiles: [],
    seoMeta: null,
    landingSurface: null,
    answerSurface: null,
  };
}

export function listCareerGuideCmsLocalFallback(
  locale: Locale | string,
  category?: string
): CareerGuideListItem[] {
  const normalizedLocale = normalizeLocale(locale);
  const requestedCategory = textValue(category);

  return listCareerGuides(normalizedLocale)
    .filter((guide) => !requestedCategory || guide.category === requestedCategory)
    .map((guide) => adaptListItem(guide, normalizedLocale));
}

export function getCareerGuideCmsLocalFallback(
  slug: string,
  locale: Locale | string
): CareerGuideDetailViewModel | null {
  const guide = getCareerGuideBySlug(String(slug ?? "").trim().toLowerCase(), normalizeLocale(locale));
  return guide ? adaptDetail(guide, locale) : null;
}
