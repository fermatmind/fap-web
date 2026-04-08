import { listCareerJobsFromCms } from "@/lib/cms/career-jobs";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import type {
  QuickLocateCareerResult,
  QuickLocateResult,
  QuickLocateTypeResult,
  TypeDecisionCard,
} from "@/lib/mbti/personalityHub.types";

export interface PersonalityQuickLocateIndex {
  typeResults: QuickLocateTypeResult[];
  careerResults: QuickLocateCareerResult[];
}

function normalizeSearchValue(value: string): string {
  return value.trim().toLowerCase();
}

export async function buildPersonalityQuickLocateIndex(input: {
  locale: Locale;
  typeResults: TypeDecisionCard[];
}): Promise<PersonalityQuickLocateIndex> {
  const jobs = await listCareerJobsFromCms({ locale: input.locale }).catch(() => []);

  return {
    typeResults: input.typeResults.map((card) => ({
      kind: "type",
      typeCode: card.typeCode,
      title: card.title,
      excerpt: card.excerpt,
      href: card.href,
      recommendationHref: localizedPath(`/career/recommendations/mbti/${card.slug}`, input.locale),
      groupKey: card.groupKey,
      groupTitle: card.groupTitle,
      launchTier: card.launchTier,
      keywords: [card.typeCode, card.title, card.groupTitle, card.excerpt],
    })),
    careerResults: jobs.map((job) => ({
      kind: "career",
      slug: job.slug,
      title: job.title,
      summary: job.summary,
      href: job.href,
      keywords: [job.title, job.summary, job.salaryText],
    })),
  };
}

export function searchPersonalityQuickLocate(index: PersonalityQuickLocateIndex, rawQuery: string): QuickLocateResult {
  const normalizedQuery = normalizeSearchValue(rawQuery);
  if (!normalizedQuery) {
    return {
      query: rawQuery,
      matchedTypeCodes: [],
      typeResults: [],
      careerResults: [],
    };
  }

  const typeResults = index.typeResults
    .filter((item) => item.keywords.some((keyword) => normalizeSearchValue(keyword).includes(normalizedQuery)))
    .sort((a, b) => {
      const exactA = a.typeCode.toLowerCase() === normalizedQuery ? 1 : 0;
      const exactB = b.typeCode.toLowerCase() === normalizedQuery ? 1 : 0;
      return exactB - exactA || a.typeCode.localeCompare(b.typeCode);
    })
    .slice(0, 6);

  const careerResults = index.careerResults
    .filter((item) => item.keywords.some((keyword) => normalizeSearchValue(keyword).includes(normalizedQuery)))
    .slice(0, 6);

  return {
    query: rawQuery,
    matchedTypeCodes: typeResults.map((item) => item.typeCode),
    typeResults,
    careerResults,
  };
}
