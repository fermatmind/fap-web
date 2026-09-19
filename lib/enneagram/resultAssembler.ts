import type {
  Big5ReportSection,
  EnneagramFormSummaryV1Raw,
  EnneagramPublicProjection,
  ReportResponse,
} from "@/lib/api/v0_3";
import { buildEnneagramFormDisplayLabel, normalizeEnneagramFormSummary } from "@/lib/enneagram/formSummary";
import { normalizeEnneagramFormCode, resolveEnneagramFormMeta } from "@/lib/enneagram/forms";
import { isEnneagramPrivateResultLocaleCompatible } from "@/lib/enneagram/privateResultLocale";
import {
  resolveEnneagramPrivateResultAuthority,
  type EnneagramPrivateResultAuthorityView,
} from "@/lib/enneagram/privateResultAuthority";
import type { Locale } from "@/lib/i18n/locales";

export type EnneagramModuleState = "clear" | "close_call" | "diffuse" | "low_quality" | "unknown";
export type EnneagramModuleVisibility = "visible" | "collapsed" | "placeholder" | "unavailable";
export type EnneagramFormVariant = "all" | "e105" | "fc144";

export type EnneagramReportV2Module = {
  moduleKey: string;
  kind: string;
  visibility: EnneagramModuleVisibility;
  state: EnneagramModuleState;
  formVariant: EnneagramFormVariant;
  accessLevel: string;
  moduleCode: string;
  content: Record<string, unknown>;
  dataRefs: string[];
  registryRefs: string[];
  provenance: {
    projectionRefs: string[];
    registryRefs: string[];
    policyRefs: string[];
    contentMaturity: string;
    evidenceLevel: string;
  };
};

export type EnneagramReportV2Page = {
  pageKey: string;
  number: string;
  title: string;
  purpose: string;
  visibility: string;
  accessLevel: string;
  moduleCode: string;
  sourceRegistryRefs: string[];
  sectionIds: string[];
  modules: EnneagramReportV2Module[];
};

export type EnneagramDistributionRow = {
  typeId: string;
  rank: number;
  scoreNorm: number;
  scoreDisplay: number;
  scoreSource: string;
};

export type EnneagramCanonicalSection = {
  sectionId: string;
  title: string;
  lead: string;
  paragraphs: string[];
  points: string[];
  reflectionQuestion: string;
  evidenceLevel: string;
  contentMaturity: string;
  fallbackPolicy: string;
  sourceRefs: string[];
  assignmentAllowed: boolean | null;
  theoryRefs: string[];
  levels: Array<{ level: number; title: string; description: string; observationPrompt: string }>;
};

export type EnneagramGrowthAction = {
  actionId: string;
  title: string;
  instruction: string;
  observableOutcome: string;
  observationDays: number[];
};

export type EnneagramCandidate = {
  typeId: string;
  rank: number;
  candidateRole: string;
  typeName: string;
  shortTitle: string;
  scoreNorm: number;
  scoreDisplay: number;
  scoreSource: string;
  sections: EnneagramCanonicalSection[];
  sectionMap: Record<string, EnneagramCanonicalSection>;
  growthActions: EnneagramGrowthAction[];
};

export type EnneagramReportV2 = {
  schemaVersion: string;
  scaleCode: string;
  form: {
    formCode: string | null;
    formKind: string | null;
    methodologyVariant: string | null;
  };
  registry: {
    registryVersion: string | null;
    registryReleaseHash: string | null;
    contentMaturity: string | null;
    releaseId: string | null;
    activeReleaseId: string | null;
    sourceHash: string | null;
    compiledHash: string | null;
  };
  classification: {
    interpretationScope: EnneagramModuleState;
    confidenceLevel: string;
    interpretationReason: string;
  };
  locale: "zh" | "en";
  distribution: EnneagramDistributionRow[];
  candidates: EnneagramCandidate[];
  pages: EnneagramReportV2Page[];
  modules: EnneagramReportV2Module[];
  moduleMap: Record<string, EnneagramReportV2Module>;
  provenance: {
    projectionVersion: string | null;
    reportSchemaVersion: string | null;
    reportEngineVersion: string | null;
    interpretationContextId: string | null;
    contentReleaseHash: string | null;
    contentSnapshotStatus: string | null;
    registryReleaseHash: string | null;
    closeCallRuleVersion: string | null;
    confidencePolicyVersion: string | null;
    qualityPolicyVersion: string | null;
    canonicalReleaseId: string | null;
    canonicalSourceHash: string | null;
    canonicalCompiledHash: string | null;
  };
};

export type EnneagramResultViewModel = {
  authority: EnneagramPrivateResultAuthorityView | null;
  reportV2: EnneagramReportV2 | null;
  distribution: EnneagramDistributionRow[];
  candidates: EnneagramCandidate[];
  formCode: string | null;
  formSummaryLabel: string | null;
  interpretationScope: EnneagramModuleState;
  formVariant: EnneagramFormVariant;
  sourceHash: string | null;
  visibleSections: Big5ReportSection[];
};

type AccessGate = {
  isFreeVariant: boolean;
  modulesAllowed?: Set<string>;
  modulesPreview?: Set<string>;
};

const ENNEAGRAM_FULL_ACCESS_MODULES = new Set(["full", "enneagram_full", "report.full", "report_full"]);

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function normalizeText(...values: unknown[]): string {
  for (const value of values) {
    if (value === null || value === undefined) {
      continue;
    }

    if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") {
      continue;
    }

    const normalized = String(value).trim();
    if (normalized && !/\[object Object\]/i.test(normalized) && !/analyzer_close_call/i.test(normalized)) {
      return normalized;
    }
  }

  return "";
}

function normalizeNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function normalizeSections(value: unknown): Big5ReportSection[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is Big5ReportSection => Boolean(item && typeof item === "object" && !Array.isArray(item)))
    .map((item) => item as Big5ReportSection);
}

function normalizeModuleState(value: unknown): EnneagramModuleState {
  const normalized = normalizeText(value).toLowerCase();
  if (normalized === "clear" || normalized === "close_call" || normalized === "diffuse" || normalized === "low_quality") {
    return normalized;
  }

  return "unknown";
}

function normalizeModuleVisibility(value: unknown): EnneagramModuleVisibility {
  const normalized = normalizeText(value).toLowerCase();
  if (normalized === "visible" || normalized === "collapsed" || normalized === "placeholder" || normalized === "unavailable") {
    return normalized;
  }

  return "visible";
}

function normalizeFormVariant(value: unknown): EnneagramFormVariant {
  const normalized = normalizeText(value).toLowerCase();
  if (normalized === "e105" || normalized === "fc144" || normalized === "all") {
    return normalized;
  }

  return "all";
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeText(item))
    .filter((item) => item.length > 0);
}

function normalizeGateSet(value: Set<string> | undefined): Set<string> {
  if (!value) {
    return new Set();
  }

  return new Set(Array.from(value).map((item) => normalizeText(item).toLowerCase()).filter(Boolean));
}

function setHasAny(values: Iterable<string>, candidates: Set<string>): boolean {
  for (const value of values) {
    if (candidates.has(value)) {
      return true;
    }
  }

  return false;
}

function normalizeGateKey(value: unknown): string {
  return normalizeText(value).toLowerCase();
}

function filterEnneagramReportV2ForGate(
  reportV2: EnneagramReportV2 | null,
  gate: AccessGate
): EnneagramReportV2 | null {
  if (!reportV2 || !gate.isFreeVariant) {
    return reportV2;
  }

  const modulesAllowed = normalizeGateSet(gate.modulesAllowed);
  return setHasAny(ENNEAGRAM_FULL_ACCESS_MODULES, modulesAllowed) ? reportV2 : null;
}

function normalizeModule(value: unknown): EnneagramReportV2Module | null {
  const moduleRecord = asRecord(value);
  if (!moduleRecord) {
    return null;
  }

  const moduleKey = normalizeText(moduleRecord.module_key, moduleRecord.moduleKey, moduleRecord.key);
  if (!moduleKey) {
    return null;
  }

  const provenance = asRecord(moduleRecord.provenance);
  const kind = normalizeText(moduleRecord.kind, "summary_card");

  return {
    moduleKey,
    kind,
    visibility: normalizeModuleVisibility(moduleRecord.visibility),
    state: normalizeModuleState(moduleRecord.state),
    formVariant: normalizeFormVariant(moduleRecord.form_variant),
    accessLevel: normalizeGateKey(moduleRecord.access_level ?? moduleRecord.accessLevel),
    moduleCode: normalizeGateKey(moduleRecord.module_code ?? moduleRecord.moduleCode),
    content: asRecord(moduleRecord.content) ?? {},
    dataRefs: normalizeStringArray(moduleRecord.data_refs),
    registryRefs: normalizeStringArray(moduleRecord.registry_refs),
    provenance: {
      projectionRefs: normalizeStringArray(provenance?.projection_refs),
      registryRefs: normalizeStringArray(provenance?.registry_refs),
      policyRefs: normalizeStringArray(provenance?.policy_refs),
      contentMaturity: normalizeText(provenance?.content_maturity, "scaffold"),
      evidenceLevel: normalizeText(provenance?.evidence_level, "descriptive"),
    },
  };
}

function normalizeModules(value: unknown): EnneagramReportV2Module[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeModule(item))
    .filter((item): item is EnneagramReportV2Module => item !== null);
}

function normalizePage(value: unknown): EnneagramReportV2Page | null {
  const page = asRecord(value);
  if (!page) {
    return null;
  }

  const pageKey = normalizeText(page.page_key, page.pageKey, page.key);
  if (!pageKey) {
    return null;
  }

  return {
    pageKey,
    number: normalizeText(page.number),
    title: normalizeText(page.title, page.page_title),
    purpose: normalizeText(page.purpose, page.description),
    visibility: normalizeText(page.visibility, "visible"),
    accessLevel: normalizeGateKey(page.access_level ?? page.accessLevel),
    moduleCode: normalizeGateKey(page.module_code ?? page.moduleCode),
    sourceRegistryRefs: normalizeStringArray(page.source_registry_refs),
    sectionIds: normalizeStringArray(page.section_ids),
    modules: normalizeModules(page.modules),
  };
}

const CANONICAL_SECTION_IDS = [
  "2.1", "2.2", "2.3", "2.4", "2.5", "2.6",
  "3.1", "3.2", "3.3",
  "4.1", "4.2", "4.3",
  "5.1", "5.2", "5.3",
  "6.1", "6.2", "6.3", "6.4", "6.5",
] as const;
const CANONICAL_PAGE_KEYS = [
  "chapter_1_result",
  "chapter_2_core_pattern",
  "chapter_3_strength_cost",
  "chapter_4_relationships",
  "chapter_5_work",
  "chapter_6_stress_recovery",
  "chapter_7_observation",
] as const;
const CANONICAL_MODULE_KEYS = new Set([
  "result_overview",
  "candidate_chapter",
  "growth_actions",
  "seven_day_observation",
]);

function normalizeDistribution(value: unknown): EnneagramDistributionRow[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const row = asRecord(item);
    if (!row) return null;
    const typeId = normalizeText(row.type, row.type_id).replace(/^T/i, "");
    const rank = normalizeNumber(row.rank);
    const scoreNorm = normalizeNumber(row.score_norm);
    const scoreDisplay = normalizeNumber(row.score_display);
    if (!/^[1-9]$/.test(typeId) || rank === null || scoreNorm === null || scoreDisplay === null) return null;
    return { typeId, rank, scoreNorm, scoreDisplay, scoreSource: normalizeText(row.score_source) };
  }).filter((row): row is EnneagramDistributionRow => row !== null);
}

function normalizeCanonicalSection(value: unknown): EnneagramCanonicalSection | null {
  const row = asRecord(value);
  if (!row) return null;
  const sectionId = normalizeText(row.section_id);
  const levels = Array.isArray(row.levels) ? row.levels.map((item) => {
    const level = asRecord(item);
    const number = normalizeNumber(level?.level);
    if (!level || number === null) return null;
    return { level: number, title: normalizeText(level.title), description: normalizeText(level.description), observationPrompt: normalizeText(level.observation_prompt) };
  }).filter((item): item is { level: number; title: string; description: string; observationPrompt: string } => item !== null) : [];
  const section = {
    sectionId,
    title: normalizeText(row.title),
    lead: normalizeText(row.lead),
    paragraphs: normalizeStringArray(row.paragraphs),
    points: normalizeStringArray(row.points),
    reflectionQuestion: normalizeText(row.reflection_question),
    evidenceLevel: normalizeText(row.evidence_level),
    contentMaturity: normalizeText(row.content_maturity),
    fallbackPolicy: normalizeText(row.fallback_policy),
    sourceRefs: normalizeStringArray(row.source_refs),
    assignmentAllowed: typeof row.assignment_allowed === "boolean" ? row.assignment_allowed : null,
    theoryRefs: normalizeStringArray(row.theory_refs),
    levels,
  };
  if (!sectionId || !section.title || !section.lead || section.paragraphs.length === 0 || section.points.length === 0 || !section.reflectionQuestion || !section.evidenceLevel || !section.contentMaturity || !section.fallbackPolicy || section.sourceRefs.length === 0) return null;
  if (sectionId === "6.4" && (section.assignmentAllowed !== false || levels.length !== 9)) return null;
  return section;
}

function normalizeGrowthAction(value: unknown): EnneagramGrowthAction | null {
  const row = asRecord(value);
  if (!row) return null;
  const action = {
    actionId: normalizeText(row.action_id), title: normalizeText(row.title), instruction: normalizeText(row.instruction),
    observableOutcome: normalizeText(row.observable_outcome),
    observationDays: Array.isArray(row.observation_days) ? row.observation_days.map(normalizeNumber).filter((day): day is number => day !== null) : [],
  };
  return action.actionId && action.title && action.instruction && action.observableOutcome && [1, 3, 7].every((day) => action.observationDays.includes(day)) ? action : null;
}

function normalizeCandidates(value: unknown): EnneagramCandidate[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const row = asRecord(item);
    if (!row) return null;
    const sections = Array.isArray(row.sections) ? row.sections.map(normalizeCanonicalSection).filter((section): section is EnneagramCanonicalSection => section !== null) : [];
    const actions = Array.isArray(row.growth_actions) ? row.growth_actions.map(normalizeGrowthAction).filter((action): action is EnneagramGrowthAction => action !== null) : [];
    const typeId = normalizeText(row.type_id).replace(/^T/i, "");
    const rank = normalizeNumber(row.rank);
    const scoreNorm = normalizeNumber(row.score_norm);
    const scoreDisplay = normalizeNumber(row.score_display);
    const ids = sections.map((section) => section.sectionId);
    if (!/^[1-9]$/.test(typeId) || rank === null || scoreNorm === null || scoreDisplay === null || ids.join("|") !== CANONICAL_SECTION_IDS.join("|") || actions.length < 3) return null;
    return {
      typeId, rank, candidateRole: normalizeText(row.candidate_role), typeName: normalizeText(row.type_name),
      shortTitle: normalizeText(row.short_title), scoreNorm, scoreDisplay, scoreSource: normalizeText(row.score_source),
      sections, sectionMap: Object.fromEntries(sections.map((section) => [section.sectionId, section])), growthActions: actions,
    };
  }).filter((candidate): candidate is EnneagramCandidate => candidate !== null);
}

function normalizePages(value: unknown): EnneagramReportV2Page[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizePage(item))
    .filter((item): item is EnneagramReportV2Page => item !== null);
}

function resolveReportV2(reportData: ReportResponse, locale: Locale): EnneagramReportV2 | null {
  if (!isEnneagramPrivateResultLocaleCompatible(reportData, locale)) {
    return null;
  }

  const raw =
    asRecord(reportData.enneagram_report_v2) ??
    asRecord(asRecord(reportData.report?._meta)?.enneagram_report_v2);

  if (!raw) {
    return null;
  }

  const pages = normalizePages(raw.pages);
  const localeValue = normalizeText(raw.locale);
  const distribution = normalizeDistribution(raw.distribution);
  const candidates = normalizeCandidates(raw.candidates);
  const modulesFromRoot = normalizeModules(raw.modules);
  const modules = modulesFromRoot.length > 0 ? modulesFromRoot : pages.flatMap((page) => page.modules);
  const moduleMap = Object.fromEntries(modules.map((module) => [module.moduleKey, module])) as Record<string, EnneagramReportV2Module>;
  const form = asRecord(raw.form);
  const registry = asRecord(raw.registry);
  const classification = asRecord(raw.classification);
  const provenance = asRecord(raw.provenance);

  const normalizedPayloadLocale = localeValue.toLowerCase().startsWith("zh") ? "zh" : localeValue.toLowerCase().startsWith("en") ? "en" : localeValue;
  if (
    normalizedPayloadLocale !== locale || pages.length !== 7 || distribution.length !== 9 || candidates.length !== 3 ||
    pages.map((page) => page.pageKey).join("|") !== CANONICAL_PAGE_KEYS.join("|") ||
    pages.map((page) => page.number).join("|") !== "01|02|03|04|05|06|07" ||
    pages.some((page) => page.visibility !== "visible" || !page.title || !page.purpose) ||
    pages.flatMap((page) => page.sectionIds).join("|") !== CANONICAL_SECTION_IDS.join("|") ||
    modules.some((module) => !CANONICAL_MODULE_KEYS.has(module.moduleKey)) ||
    modules.some((module) => module.visibility !== "visible" || module.provenance.contentMaturity === "scaffold") ||
    new Set(modules.map((module) => module.moduleKey)).size !== CANONICAL_MODULE_KEYS.size ||
    !Array.from(CANONICAL_MODULE_KEYS).every((moduleKey) => moduleMap[moduleKey]) ||
    distribution.map((row) => row.typeId).join("|") !== "1|2|3|4|5|6|7|8|9" ||
    [...distribution].sort((a, b) => a.rank - b.rank).map((row) => row.rank).join("|") !== "1|2|3|4|5|6|7|8|9" ||
    candidates.map((candidate) => candidate.rank).join("|") !== "1|2|3" ||
    candidates.map((candidate) => candidate.candidateRole).join("|") !== "primary|secondary|tertiary" ||
    new Set(candidates.map((candidate) => candidate.typeId)).size !== 3
  ) return null;

  return {
    schemaVersion: normalizeText(raw.schema_version),
    scaleCode: normalizeText(raw.scale_code, "ENNEAGRAM"),
    form: {
      formCode: normalizeText(form?.form_code) || null,
      formKind: normalizeText(form?.form_kind) || null,
      methodologyVariant: normalizeText(form?.methodology_variant) || null,
    },
    registry: {
      registryVersion: normalizeText(registry?.registry_version) || null,
      registryReleaseHash: normalizeText(registry?.registry_release_hash) || null,
      contentMaturity: normalizeText(registry?.content_maturity) || null,
      releaseId: normalizeText(registry?.release_id) || null,
      activeReleaseId: normalizeText(registry?.active_release_id) || null,
      sourceHash: normalizeText(registry?.source_hash).toLowerCase() || null,
      compiledHash: normalizeText(registry?.compiled_hash).toLowerCase() || null,
    },
    classification: {
      interpretationScope: normalizeModuleState(classification?.interpretation_scope),
      confidenceLevel: normalizeText(classification?.confidence_level),
      interpretationReason: normalizeText(classification?.interpretation_reason),
    },
    locale: normalizedPayloadLocale === "en" ? "en" : "zh",
    distribution,
    candidates,
    pages,
    modules,
    moduleMap,
    provenance: {
      projectionVersion: normalizeText(provenance?.projection_version) || null,
      reportSchemaVersion: normalizeText(provenance?.report_schema_version) || null,
      reportEngineVersion: normalizeText(provenance?.report_engine_version) || null,
      interpretationContextId: normalizeText(provenance?.interpretation_context_id) || null,
      contentReleaseHash: normalizeText(provenance?.content_release_hash) || null,
      contentSnapshotStatus: normalizeText(provenance?.content_snapshot_status) || null,
      registryReleaseHash: normalizeText(provenance?.registry_release_hash) || null,
      closeCallRuleVersion: normalizeText(provenance?.close_call_rule_version) || null,
      confidencePolicyVersion: normalizeText(provenance?.confidence_policy_version) || null,
      qualityPolicyVersion: normalizeText(provenance?.quality_policy_version) || null,
      canonicalReleaseId: normalizeText(provenance?.canonical_release_id) || null,
      canonicalSourceHash: normalizeText(provenance?.canonical_source_hash).toLowerCase() || null,
      canonicalCompiledHash: normalizeText(provenance?.canonical_compiled_hash).toLowerCase() || null,
    },
  };
}

function resolveProjection(reportData: ReportResponse, locale: Locale): EnneagramPublicProjection | null {
  if (!isEnneagramPrivateResultLocaleCompatible(reportData, locale)) {
    return null;
  }

  if (reportData.enneagram_public_projection_v1) {
    return reportData.enneagram_public_projection_v1;
  }

  const metaProjection = asRecord(reportData.report?._meta)?.enneagram_public_projection_v1;
  if (metaProjection && typeof metaProjection === "object" && !Array.isArray(metaProjection)) {
    return metaProjection as EnneagramPublicProjection;
  }

  return null;
}

function resolveFormSummary(
  reportData: ReportResponse,
  projection: EnneagramPublicProjection | null,
  reportV2: EnneagramReportV2 | null
): ReturnType<typeof normalizeEnneagramFormSummary> {
  const direct = normalizeEnneagramFormSummary(reportData.enneagram_form_v1 ?? null);
  if (direct) {
    return direct;
  }

  const candidates = [
    reportV2?.form.formCode,
    asRecord(projection?._meta)?.form_code,
    asRecord(reportData.report)?.form_code,
    asRecord(reportData.report?._meta)?.form_code,
  ];
  const formCode = normalizeText(...candidates);
  if (!formCode) {
    return null;
  }
  const normalizedFormCode = normalizeEnneagramFormCode(formCode);
  const meta = resolveEnneagramFormMeta(normalizedFormCode);
  const isForcedChoice = meta.questionMode === "forced_choice_144";

  return normalizeEnneagramFormSummary({
    form_code: normalizedFormCode,
    label: `${meta.questionCount}-question ${isForcedChoice ? "Forced-Choice" : "Likert"}`,
    short_label: `${meta.questionCount}Q ${isForcedChoice ? "Forced" : "Likert"}`,
    question_count: meta.questionCount,
    estimated_minutes: meta.estimatedMinutes,
    scale_code: "ENNEAGRAM",
  } as EnneagramFormSummaryV1Raw);
}

function visibleLegacySections(sections: Big5ReportSection[], gate: AccessGate): Big5ReportSection[] {
  if (!gate.isFreeVariant) {
    return sections;
  }

  return sections.filter((section) => normalizeText(section.access_level).toLowerCase() !== "paid");
}

export function assembleEnneagramResultViewModel({
  reportData,
  gate,
  locale,
}: {
  reportData: ReportResponse;
  gate: AccessGate;
  locale: Locale;
}): EnneagramResultViewModel {
  const authority = resolveEnneagramPrivateResultAuthority(reportData, locale);
  const projection = authority?.mode === "canonical" ? resolveProjection(reportData, locale) : null;
  const reportV2 = authority?.mode === "canonical"
    ? filterEnneagramReportV2ForGate(resolveReportV2(reportData, locale), gate)
    : null;
  const formSummary = resolveFormSummary(reportData, projection, reportV2);
  const sections = authority?.mode === "immutable_legacy_snapshot"
    ? normalizeSections(reportData.report?.sections)
    : [];

  return {
    authority,
    reportV2,
    distribution: reportV2?.distribution ?? [],
    candidates: reportV2?.candidates ?? [],
    formCode: reportV2?.form.formCode ?? formSummary?.formCode ?? null,
    formSummaryLabel: buildEnneagramFormDisplayLabel(formSummary, { locale }),
    interpretationScope: reportV2?.classification.interpretationScope ?? "unknown",
    formVariant: normalizeFormVariant(reportV2?.moduleMap.result_overview?.formVariant),
    sourceHash: authority?.sourceHash || null,
    visibleSections: visibleLegacySections(sections, gate),
  };
}

export function hasEnneagramProjection(reportData: ReportResponse | null | undefined, locale: Locale): boolean {
  if (!reportData || resolveEnneagramPrivateResultAuthority(reportData, locale)?.mode !== "canonical") {
    return false;
  }

  const reportV2 = resolveReportV2(reportData, locale);
  if (!reportV2 || reportV2.pages.length === 0 || reportV2.modules.length === 0) {
    return false;
  }

  const formCode = reportV2.form.formCode;
  const requiredModules = ["result_overview", "candidate_chapter", "growth_actions", "seven_day_observation"];
  if (!requiredModules.every((moduleKey) => reportV2.moduleMap[moduleKey])) {
    return false;
  }

  return (
    (formCode === "enneagram_likert_105" || formCode === "enneagram_forced_choice_144") &&
    Boolean(reportV2.form.methodologyVariant) &&
    Boolean(normalizeText(reportV2.moduleMap.result_overview.content.body)) &&
    reportV2.distribution.length === 9 &&
    reportV2.candidates.length === 3 &&
    reportV2.candidates.every((candidate) => candidate.sections.length === 20 && candidate.growthActions.length >= 3)
  );
}
