import type { CareerDatasetMemberAdapter } from "@/lib/career/adapters/types";
import { CAREER_STATIC_OCCUPATION_MEMBERS } from "@/lib/career/staticOccupationMembers";
import type { Locale } from "@/lib/i18n/locales";

const FAMILY_LABELS: Record<string, { en: string; zh: string }> = {
  "architecture-and-engineering": { en: "Architecture and engineering", zh: "建筑与工程" },
  "arts-and-design": { en: "Arts and design", zh: "艺术与设计" },
  "building-and-grounds-cleaning": { en: "Building and grounds cleaning", zh: "建筑维护与清洁" },
  "business-and-financial": { en: "Business and financial", zh: "商业与金融" },
  "community-and-social-service": { en: "Community and social service", zh: "社区与社会服务" },
  "computer-and-information-technology": { en: "Computer and information technology", zh: "计算机与信息技术" },
  "construction-and-extraction": { en: "Construction and extraction", zh: "建筑施工与采掘" },
  "education-training-and-library": { en: "Education, training, and library", zh: "教育、培训与图书馆" },
  "entertainment-and-sports": { en: "Entertainment and sports", zh: "娱乐与体育" },
  "farming-fishing-and-forestry": { en: "Farming, fishing, and forestry", zh: "农业、渔业与林业" },
  "food-preparation-and-serving": { en: "Food preparation and serving", zh: "餐饮服务" },
  healthcare: { en: "Healthcare", zh: "医疗健康" },
  "installation-maintenance-and-repair": { en: "Installation, maintenance, and repair", zh: "安装、维护与修理" },
  legal: { en: "Legal", zh: "法律" },
  "life-physical-and-social-science": { en: "Life, physical, and social science", zh: "生命、物理与社会科学" },
  management: { en: "Management", zh: "管理" },
  math: { en: "Math", zh: "数学与精算" },
  "media-and-communication": { en: "Media and communication", zh: "媒体与传播" },
  military: { en: "Military", zh: "军事" },
  "office-and-administrative-support": { en: "Office and administrative support", zh: "办公室与行政支持" },
  "personal-care-and-service": { en: "Personal care and service", zh: "个人护理与服务" },
  production: { en: "Production", zh: "生产制造" },
  "protective-service": { en: "Protective service", zh: "安全与保护服务" },
  sales: { en: "Sales", zh: "销售" },
  "transportation-and-material-moving": { en: "Transportation and material moving", zh: "运输与物料搬运" },
  "__unknown__": { en: "Other tracked occupations", zh: "其他职业" },
};

const FAMILY_SLUG_ALIASES: Record<string, string> = {
  business: "business-and-financial",
  consulting: "management",
  design: "arts-and-design",
  education: "education-training-and-library",
  finance: "business-and-financial",
  manufacturing: "production",
  media: "media-and-communication",
  operations: "office-and-administrative-support",
  "public-service": "community-and-social-service",
  technology: "computer-and-information-technology",
};

export const CAREER_DATASET_FAMILY_SLUGS = Object.keys(FAMILY_LABELS).filter((slug) => slug !== "__unknown__");

export type CareerFamilyDirectoryItem = {
  slug: string;
  title: string;
  count: number;
  publicDetailCount: number;
  indexableCount: number;
  sampleMembers: CareerDatasetMemberAdapter[];
};

export function formatCareerFamilyTitle(slug: string | null | undefined, locale: Locale): string {
  const normalized = normalizeFamilySlug(slug);
  const label = FAMILY_LABELS[normalized];
  if (label) {
    return label[locale];
  }

  return normalized
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function normalizeFamilySlug(slug: string | null | undefined): string {
  const normalized = String(slug ?? "").trim();
  if (!normalized) {
    return "__unknown__";
  }

  if (FAMILY_SLUG_ALIASES[normalized]) {
    return FAMILY_SLUG_ALIASES[normalized];
  }

  if (FAMILY_LABELS[normalized]) {
    return normalized;
  }

  const withoutGeneratedSuffix = normalized.replace(/-[a-f0-9]{8}$/i, "");
  if (FAMILY_LABELS[withoutGeneratedSuffix]) {
    return withoutGeneratedSuffix;
  }

  return normalized;
}

export function isCareerDatasetMemberDetailReady(member: CareerDatasetMemberAdapter): boolean {
  return member.publicIndexState === "indexable";
}

export function isCareerDatasetMemberPublic(member: CareerDatasetMemberAdapter): boolean {
  return member.includedInPublicDataset || member.releaseCohort === "public_detail_indexable" || member.releaseCohort === "public_detail_conservative";
}

export function buildCareerFamilyDirectory(
  members: CareerDatasetMemberAdapter[],
  locale: Locale
): CareerFamilyDirectoryItem[] {
  const grouped = new Map<string, CareerDatasetMemberAdapter[]>();
  for (const member of members) {
    const familySlug = normalizeFamilySlug(member.familySlug);
    grouped.set(familySlug, [...(grouped.get(familySlug) ?? []), member]);
  }

  return [...grouped.entries()]
    .map(([slug, familyMembers]) => {
      const sortedMembers = [...familyMembers].sort((left, right) => left.canonicalTitleEn.localeCompare(right.canonicalTitleEn));
      return {
        slug,
        title: formatCareerFamilyTitle(slug, locale),
        count: sortedMembers.length,
        publicDetailCount: sortedMembers.filter(isCareerDatasetMemberPublic).length,
        indexableCount: sortedMembers.filter(isCareerDatasetMemberDetailReady).length,
        sampleMembers: sortedMembers.slice(0, 4),
      };
    })
    .sort((left, right) => right.count - left.count || left.title.localeCompare(right.title));
}

export function filterCareerDatasetMembers(input: {
  members: CareerDatasetMemberAdapter[];
  familySlug?: string | null;
  query?: string | null;
}): CareerDatasetMemberAdapter[] {
  const normalizedFamily = input.familySlug ? normalizeFamilySlug(input.familySlug) : null;
  const normalizedQuery = String(input.query ?? "").trim().toLowerCase();

  return input.members
    .filter((member) => {
      if (normalizedFamily && normalizeFamilySlug(member.familySlug) !== normalizedFamily) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [member.canonicalTitleZh, member.canonicalTitleEn, member.canonicalSlug, member.familySlug]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery));
    })
    .sort((left, right) => {
      const leftReady = isCareerDatasetMemberDetailReady(left) ? 0 : 1;
      const rightReady = isCareerDatasetMemberDetailReady(right) ? 0 : 1;
      return leftReady - rightReady || left.canonicalTitleEn.localeCompare(right.canonicalTitleEn);
    });
}

export function buildRenderableCareerDatasetMembers(input: {
  datasetMembers: CareerDatasetMemberAdapter[];
  detailReadySlugs?: Set<string>;
}): CareerDatasetMemberAdapter[] {
  const staticMemberBySlug = new Map(CAREER_STATIC_OCCUPATION_MEMBERS.map((member) => [member.canonicalSlug, member]));

  if (input.datasetMembers.length > 0) {
    const detailReadySlugs = input.detailReadySlugs ?? new Set<string>();

    return input.datasetMembers.map((member) => ({
      ...member,
      canonicalTitleZh: member.canonicalTitleZh ?? staticMemberBySlug.get(member.canonicalSlug)?.canonicalTitleZh ?? null,
      ...(detailReadySlugs.has(member.canonicalSlug)
        ? {
            releaseCohort: "public_detail_indexable" as const,
            publicIndexState: "indexable",
            strongIndexDecision: "strong_index_ready",
            includedInPublicDataset: true,
          }
        : {}),
    }));
  }

  const detailReadySlugs = input.detailReadySlugs ?? new Set<string>();
  return CAREER_STATIC_OCCUPATION_MEMBERS.map((member) => {
    const hasDetailPage = detailReadySlugs.has(member.canonicalSlug);
    if (!hasDetailPage) {
      return member;
    }

    return {
      ...member,
      releaseCohort: "public_detail_indexable",
      publicIndexState: "indexable",
      strongIndexDecision: "strong_index_ready",
      includedInPublicDataset: true,
    };
  });
}
