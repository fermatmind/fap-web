import type { CareerAssetMaster } from "@/lib/career/contracts";
import { listCareerJobsFromCms, type CareerJobListItem } from "@/lib/cms/career-jobs";
import {
  getMbtiCareerRecommendationByType,
  type CareerRecommendationDetail,
  type CareerRecommendationMatchedJob,
} from "@/lib/cms/career-recommendations";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import type {
  CareerPreviewCard,
  CareerPreviewSeed,
  CareerPreviewSignal,
  CareerPreviewStance,
  MiniStrainRadarData,
} from "@/lib/mbti/personalityHub.types";

const RADAR_DIMENSIONS = [
  { key: "autonomy_level", label: { en: "Autonomy", zh: "自主性" } },
  { key: "people_intensity", label: { en: "People load", zh: "人际负荷" } },
  { key: "variability_level", label: { en: "Variability", zh: "变化度" } },
  { key: "closure_demand", label: { en: "Closure", zh: "收口压力" } },
  { key: "cadence_rigidity", label: { en: "Cadence", zh: "节奏刚性" } },
] as const;

function firstText(...values: Array<string | null | undefined>): string {
  for (const value of values) {
    const normalized = String(value ?? "").trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function normalizeRadarValue(value: number | null | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  if (value >= 0 && value <= 1) {
    return Math.round(value * 100);
  }

  if (value >= 0 && value <= 5) {
    return Math.round(value * 20);
  }

  if (value >= 0 && value <= 10) {
    return Math.round(value * 10);
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

function pickRepresentativeJob(detail: CareerRecommendationDetail): CareerRecommendationMatchedJob | null {
  const primary = detail.matchedJobs.find((job) => job.fitBucket === "primary");
  return primary || detail.matchedJobs[0] || null;
}

function buildCautionSummary(detail: CareerRecommendationDetail, locale: Locale): string {
  const weakness = detail.career.weaknesses.items.find((item) => item.description || item.title);
  const upgrade = detail.career.upgradeSuggestions.paragraphs[0];

  return (
    firstText(weakness?.description, weakness?.title, upgrade) ||
    (locale === "zh"
      ? "如果高结构、高节奏或高人际负荷同时出现，这类路径会更容易产生持续损耗。"
      : "When structure, pace, and people load stack together, this route creates sustained friction faster.")
  );
}

function buildSignals(
  detail: CareerRecommendationDetail,
  representativeJob: CareerRecommendationMatchedJob,
  jobListMap: Map<string, CareerJobListItem>,
  locale: Locale
): CareerPreviewSignal[] {
  const asset = detail.protocol.careerAsset;
  const matchedJob = jobListMap.get(representativeJob.slug);
  const signals: CareerPreviewSignal[] = [];

  if (matchedJob?.salaryText) {
    signals.push({
      key: "salary",
      label: locale === "zh" ? "Pay label" : "Pay label",
      value: matchedJob.salaryText,
      tone: "neutral",
    });
  }

  if (asset?.derived_signals.human_moat_tags[0]) {
    signals.push({
      key: "human-moat",
      label: locale === "zh" ? "Human moat" : "Human moat",
      value: asset.derived_signals.human_moat_tags[0],
      tone: "positive",
    });
  }

  if (asset?.derived_signals.work_structure_tags[0]) {
    signals.push({
      key: "work-structure",
      label: locale === "zh" ? "Work structure" : "Work structure",
      value: asset.derived_signals.work_structure_tags[0],
      tone: "neutral",
    });
  }

  if (signals.length < 3 && detail.keywords[0]) {
    signals.push({
      key: "keyword",
      label: locale === "zh" ? "Signal" : "Signal",
      value: detail.keywords[0],
      tone: "neutral",
    });
  }

  return signals.slice(0, 3);
}

export function buildMiniStrainRadarData(
  asset: CareerAssetMaster | null,
  locale: Locale
): MiniStrainRadarData | null {
  if (!asset) {
    return null;
  }

  const axes = RADAR_DIMENSIONS.map((dimension) => ({
    key: dimension.key,
    label: dimension.label[locale],
    value: normalizeRadarValue(asset.derived_signals[dimension.key]),
  }));

  if (axes.every((axis) => axis.value <= 0)) {
    return null;
  }

  return {
    title: locale === "zh" ? "结构性损耗雷达" : "Structural strain radar",
    subtitle:
      locale === "zh"
        ? "按职业样板展示工作结构压力，不代表个人级精算结果。"
        : "Shows work-structure pressure for the role pattern, not an individual-level calculation.",
    axes,
  };
}

export function deriveCareerPreviewStance(
  detail: CareerRecommendationDetail,
  radar: MiniStrainRadarData | null
): CareerPreviewStance {
  const asset = detail.protocol.careerAsset;
  const fitScore = asset?.scoring.fit_score.value ?? null;
  const strainScore = asset?.scoring.strain_score.value ?? null;
  const likelyStrainTypes = asset?.derived_signals.likely_strain_types ?? [];

  if (likelyStrainTypes.includes(detail.graphTypeCode) || (fitScore !== null && strainScore !== null && strainScore - fitScore >= 20)) {
    return "not_recommended";
  }

  if (detail.renderState.canRenderStrongTruth && radar && fitScore !== null && strainScore !== null && fitScore >= strainScore) {
    return "recommended";
  }

  return "conditional";
}

export function createCareerPreviewCardFromDetail(
  detail: CareerRecommendationDetail,
  jobListMap: Map<string, CareerJobListItem>,
  locale: Locale
): CareerPreviewCard | null {
  const representativeJob = pickRepresentativeJob(detail);
  if (!representativeJob) {
    return null;
  }

  const radar = buildMiniStrainRadarData(detail.protocol.careerAsset, locale);
  if (!radar) {
    return null;
  }

  const stance = deriveCareerPreviewStance(detail, radar);
  const topMatchingTypes = Array.from(
    new Set([detail.displayType, detail.graphTypeCode, ...representativeJob.fitPersonalityCodes].filter(Boolean))
  ).slice(0, 3);

  return {
    key: `${detail.publicRouteSlug}-${representativeJob.slug}`,
    typeCode: detail.displayType,
    roleTitle: representativeJob.title,
    summary: firstText(representativeJob.summary, detail.heroSummary),
    fitSummary:
      firstText(detail.career.summary.paragraphs[0], detail.heroSummary) ||
      (locale === "zh"
        ? `${detail.displayType} 在这类岗位里通常更容易形成稳定发挥。`
        : `${detail.displayType} typically finds a steadier operating pattern in roles like this.`),
    cautionSummary: buildCautionSummary(detail, locale),
    topMatchingTypes,
    stance,
    primaryCta: {
      label: locale === "zh" ? "查看职业建议" : "View career guidance",
      href: detail.href,
      kind: "primary",
    },
    secondaryCta: {
      label: locale === "zh" ? "查看岗位详情" : "View job detail",
      href: representativeJob.href || localizedPath(`/career/jobs/${representativeJob.slug}`, locale),
      kind: "secondary",
    },
    signals: buildSignals(detail, representativeJob, jobListMap, locale),
    radar,
  };
}

export async function buildPersonalityCareerPreview(input: {
  locale: Locale;
  seed: CareerPreviewSeed[];
}): Promise<CareerPreviewCard[]> {
  if (input.seed.length === 0) {
    return [];
  }

  const [jobList, details] = await Promise.all([
    listCareerJobsFromCms({ locale: input.locale }).catch(() => []),
    Promise.all(
      input.seed.map((item) =>
        getMbtiCareerRecommendationByType(input.locale, item.slug).catch(() => null)
      )
    ),
  ]);

  const jobListMap = new Map(jobList.map((job) => [job.slug, job]));

  const cards: CareerPreviewCard[] = [];

  for (const detail of details) {
    if (!detail) {
      continue;
    }

    const card = createCareerPreviewCardFromDetail(detail, jobListMap, input.locale);
    if (!card) {
      continue;
    }

    cards.push(card);
    if (cards.length >= 3) {
      break;
    }
  }

  return cards;
}
