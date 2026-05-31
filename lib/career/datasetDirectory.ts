import type { CareerDatasetMemberAdapter } from "@/lib/career/adapters/types";
import type { CareerJobIndexCardAdapter } from "@/lib/career/adapters/types";
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

function hasBlockedDraftTitle(title: string | null): boolean {
  const normalized = String(title ?? "").trim();
  if (!normalized) {
    return false;
  }

  return (
    normalized.startsWith("和") ||
    normalized.endsWith("和") ||
    normalized.startsWith("专家") ||
    normalized.endsWith("专家") ||
    normalized.includes("、和") ||
    normalized.includes("和、") ||
    normalized.includes("和工人") ||
    normalized.includes("和机器") ||
    normalized.includes("和官") ||
    normalized.includes("和专员") ||
    normalized.includes("和操作员") ||
    normalized.includes("和看护员") ||
    normalized.includes("铺设工") ||
    normalized.includes("简餐订单") ||
    normalized.includes("教师、高等教育") ||
    normalized.includes("教师商业") ||
    normalized.includes("分析师商业") ||
    normalized.includes("专家商业") ||
    normalized.includes("专家教育") ||
    normalized.includes("专家计算机") ||
    normalized.includes("专家金融") ||
    normalized.includes("专家媒体") ||
    normalized.includes("专家牙医") ||
    normalized.includes("专家科学家") ||
    normalized.includes("专家经理") ||
    normalized.includes("专家主管") ||
    normalized.includes("专家治疗师") ||
    normalized.includes("操作员计算机") ||
    normalized.includes("工程师计算机") ||
    normalized.includes("教师计算机") ||
    normalized.includes("教育教师") ||
    normalized.includes("主管工人") ||
    normalized.includes("主管官") ||
    normalized.includes("科学家工人") ||
    normalized.includes("操作员工人") ||
    normalized.includes("技术员工人") ||
    normalized.includes("工程师操作员") ||
    [
      "其他",
      "其他职业",
      "简餐订单",
      "经理商业",
      "和经理",
      "和工人",
      "和休闲服务员",
      "技术员",
      "操作员",
      "经理",
      "工人",
      "工程",
      "工程师",
      "专员",
      "人员",
      "科学家",
      "分析师",
      "助理",
      "护士",
      "教师",
      "设计师",
      "商业",
      "计算机",
      "食品",
      "私人",
      "数据",
      "制造",
      "总监",
      "营销",
      "官",
      "机组官",
      "步兵官",
      "帮工",
      "治疗师",
      "艺术家",
      "审计师",
      "制图员",
      "家电",
      "机械门",
      "钟表",
      "检查员",
      "技术专家",
      "医学研究人员",
      "化学研究人员",
      "哲学研究人员",
      "法学研究人员",
      "数学研究人员",
      "专业人员",
      "价格专业人员",
      "统计专业人员",
      "品牌专业人员",
      "精算专业人员",
      "期货专业人员",
      "基金专业人员",
      "档案专业人员",
      "考古专业人员",
      "教育工人",
      "采掘工人",
      "维护工人",
      "生产工人",
      "运输工人",
      "医疗保健工人",
      "个人护理工人",
      "保护服务工人",
      "建筑施工工人",
      "采掘工人",
    ].includes(normalized)
  );
}

function stripTrailingOtherQualifier(title: string | null): string | null {
  const normalized = String(title ?? "").trim();
  if (!normalized) {
    return title;
  }

  const stripped = normalized.replace(/、其他$/u, "").trim();
  return stripped !== "" ? stripped : normalized;
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
  detailReadyJobs?: Map<string, CareerJobIndexCardAdapter>;
  allowStaticFallback?: boolean;
  excludeNonPublicDatasetMembers?: boolean;
}): CareerDatasetMemberAdapter[] {
  const staticMemberBySlug = new Map(CAREER_STATIC_OCCUPATION_MEMBERS.map((member) => [member.canonicalSlug, member]));
  const detailReadySlugs =
    input.detailReadySlugs ?? new Set([...(input.detailReadyJobs?.keys() ?? [])]);

  if (input.datasetMembers.length > 0) {
    const renderedMembers = input.datasetMembers.flatMap((member) => {
      const detailReadyJob = input.detailReadyJobs?.get(member.canonicalSlug) ?? null;
      const hasDetailPage = detailReadySlugs.has(member.canonicalSlug);
      const staticMember = staticMemberBySlug.get(member.canonicalSlug);
      const canonicalTitleEn = detailReadyJob?.titles.canonicalEn ?? member.canonicalTitleEn;
      const canonicalTitleZh =
        stripTrailingOtherQualifier(
          detailReadyJob?.titles.canonicalZh ?? member.canonicalTitleZh ?? staticMember?.canonicalTitleZh ?? null
        );

      if (input.excludeNonPublicDatasetMembers && !hasDetailPage && !isCareerDatasetMemberPublic(member)) {
        return [];
      }
      if (!hasDetailPage && !canonicalTitleZh && canonicalTitleEn === member.canonicalSlug) {
        return [];
      }
      if (!hasDetailPage && hasBlockedDraftTitle(canonicalTitleZh)) {
        return [];
      }

      return [{
        ...member,
        canonicalTitleEn,
        canonicalTitleZh,
        ...(hasDetailPage
          ? {
              releaseCohort: "public_detail_indexable" as const,
              publicIndexState: "indexable",
              strongIndexDecision: "strong_index_ready",
              includedInPublicDataset: true,
            }
          : {
              publicIndexState: member.publicIndexState === "indexable" ? "noindex" : member.publicIndexState,
              strongIndexDecision:
                member.strongIndexDecision === "strong_index_ready" ? "not_eligible" : member.strongIndexDecision,
            }),
      }];
    });

    return appendDetailReadyJobMembers(renderedMembers, input.detailReadyJobs);
  }

  if (input.allowStaticFallback === false) {
    return appendDetailReadyJobMembers([], input.detailReadyJobs);
  }

  const renderedStaticMembers = CAREER_STATIC_OCCUPATION_MEMBERS.map((member) => {
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

  return appendDetailReadyJobMembers(renderedStaticMembers, input.detailReadyJobs);
}

function appendDetailReadyJobMembers(
  members: CareerDatasetMemberAdapter[],
  detailReadyJobs: Map<string, CareerJobIndexCardAdapter> | undefined
): CareerDatasetMemberAdapter[] {
  if (!detailReadyJobs || detailReadyJobs.size === 0) {
    return members;
  }

  const seenSlugs = new Set(members.map((member) => member.canonicalSlug));
  const jobOnlyMembers = [...detailReadyJobs.values()]
    .filter((job) => !seenSlugs.has(job.identity.canonicalSlug))
    .map((job): CareerDatasetMemberAdapter => ({
      memberKind: "career_tracked_occupation",
      canonicalSlug: job.identity.canonicalSlug,
      canonicalTitleEn: job.titles.canonicalEn ?? job.titles.title,
      canonicalTitleZh: job.titles.canonicalZh ?? job.titles.title,
      familySlug: null,
      publishTrack: "runtime_job_index",
      batchOrigin: "runtime_job_index",
      releaseCohort: "public_detail_indexable",
      publicIndexState: "indexable",
      strongIndexDecision: "strong_index_ready",
      includedInPublicDataset: true,
      exclusionReasons: [],
    }));

  return [...members, ...jobOnlyMembers];
}
