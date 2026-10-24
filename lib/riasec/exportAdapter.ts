import type { Locale } from "@/lib/i18n/locales";
import { assembleRiasecResultViewModel, hasRiasecProjection, getRiasecModuleVisibility, type RiasecResultViewModel } from "./resultAssembler";

// Read-only domain projection. The shared exporter owns preview, serialization,
// clipboard, downloads and access checks; this adapter never fetches private data.
export function getRiasecExportFacts(vm: RiasecResultViewModel, locale: Locale) {
  const zh = locale === "zh";
  const unknown = zh ? "未提供／未知" : "Not provided / unknown";
  const shown = (key: string) => getRiasecModuleVisibility(vm, key) !== "hidden";
  const summaryVisible = Boolean(vm.resultSummary) || shown("hero_activity_chain");
  const tie = summaryVisible ? vm.interpretationState?.tieDisplay : null;
  return {
    form: {
      code: vm.formCode || unknown,
      questionCount: vm.questionCount ?? unknown,
      scoreSpaceVersion: vm.trustedResultCard?.scoreSpaceVersion || unknown,
      projectionVersion: vm.trustedResultCard?.projectionVersion || unknown,
    },
    units: vm.scoreKind === "dimension_scores_0_100"
      ? (zh ? "0–100兴趣维度分；不是百分位或职业适配百分比" : "0–100 interest dimension scores; not percentiles or career-fit percentages")
      : unknown,
    top3: summaryVisible ? vm.topCode || unknown : unknown,
    dimensions: shown("six_dimension_map") ? vm.dimensions.map(dimension => ({
      code: dimension.code,
      label: dimension.label,
      score: dimension.scoreAvailable === false || !Number.isFinite(dimension.score) ? unknown : dimension.score,
    })) : [],
    closeScores: tie ? {
      kind: tie.kind,
      note: tie.note,
      alternatives: tie.alternateCodes,
      boundary: tie.boundary,
    } : null,
    profileShape: summaryVisible ? vm.interpretationState?.profileShape || unknown : unknown,
    quality: vm.resultSummary?.qualitySummary || vm.qualityDisplay?.headline || unknown,
    qualityBoundary: vm.qualityDisplay?.readingBoundary || unknown,
    resultBoundary: vm.resultSummary?.boundary || unknown,
    boundary: zh
      ? "兴趣不等于技能、资格、收入或录用概率；不生成职业适配百分比。60与140题不作分数差比较。本人目标和现实条件由本人补充，可省略；品牌仅作测评来源。"
      : "Interests are not skills, qualifications, income or hiring probabilities. Do not generate career-fit percentages or numeric differences across the 60- and 140-item forms. Personal goals and practical constraints are optional, user-authored context. The brand identifies the assessment source only.",
  };
}

// Structurally matches the UX-02 ResultExportProjection contract. Keeping the
// domain builder independent lets the shared-entry owner integrate it without
// duplicating serializers, transports or prompt templates.
export function buildRiasecResultExport(report: Parameters<typeof assembleRiasecResultViewModel>[0], locale: Locale) {
  const state = report as { generating?: boolean; snapshot_error?: unknown; meta?: { generating?: boolean; snapshot_error?: unknown } };
  if (state.generating || state.snapshot_error || state.meta?.generating || state.meta?.snapshot_error || !hasRiasecProjection(report)) return null;
  const vm = assembleRiasecResultViewModel(report, locale);
  const facts = getRiasecExportFacts(vm, locale);
  const t = (zh: string, en: string) => locale === "zh" ? zh : en;
  return {
    product: "RIASEC" as const,
    assessment: { formCode: vm.formCode, questionCount: vm.questionCount, locale: vm.resultLocale ?? null },
    versions: [
      { label: t("计分空间版本", "Score-space version"), value: vm.trustedResultCard?.scoreSpaceVersion || null },
      { label: t("投影版本", "Projection version"), value: vm.trustedResultCard?.projectionVersion || null },
      { label: t("解释规则版本", "Interpretation-rule version"), value: vm.interpretationState?.interpretationRuleVersion || null },
    ],
    sections: [
      { id: "summary", title: t("兴趣线索与近分", "Interest clues and close scores"), fields: [
        { label: "Top 3", value: facts.top3 },
        { label: t("分布形状", "Profile shape"), value: facts.profileShape },
        { label: t("接近／并列说明", "Close-score / tie guidance"), value: facts.closeScores?.note || null },
        { label: t("可保留的其他阅读顺序", "Alternative reading orders"), value: facts.closeScores?.alternatives.join(" / ") || null },
        { label: t("排序边界", "Ordering boundary"), value: facts.closeScores?.boundary || null },
      ] },
      { id: "dimensions", title: t("六维兴趣分", "Six interest dimensions"), fields: facts.dimensions.map(dimension => ({
        label: `${dimension.code} · ${dimension.label}`, value: dimension.score, unit: facts.units,
      })) },
    ],
    reference: [],
    quality: [
      { label: t("作答质量", "Response quality"), value: facts.quality },
      { label: t("质量解释边界", "Quality reading boundary"), value: facts.qualityBoundary },
    ],
    limitations: [facts.boundary, facts.resultBoundary],
  };
}
