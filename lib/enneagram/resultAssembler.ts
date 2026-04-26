import type {
  Big5ReportSection,
  EnneagramFormSummaryV1Raw,
  EnneagramPublicProjection,
  ReportResponse,
} from "@/lib/api/v0_3";
import { buildEnneagramFormDisplayLabel, normalizeEnneagramFormSummary } from "@/lib/enneagram/formSummary";
import { normalizeEnneagramFormCode, resolveEnneagramFormMeta } from "@/lib/enneagram/forms";
import type { Locale } from "@/lib/i18n/locales";

export type EnneagramTypeRow = {
  code: string;
  label: string;
  score: number | null;
  rank: number | null;
  candidateRole?: string | null;
  scoreSource?: string | null;
  summary?: string | null;
};

export type EnneagramModuleState = "clear" | "close_call" | "diffuse" | "low_quality" | "unknown";
export type EnneagramModuleVisibility = "visible" | "collapsed" | "placeholder" | "unavailable";
export type EnneagramFormVariant = "all" | "e105" | "fc144";

export type EnneagramAssetBackedContent = {
  asset_key: string;
  asset_type: string;
  category: string;
  module_key: string;
  body_zh: string;
  short_body_zh: string;
  cta_zh: string;
  content_maturity: string;
  evidence_level: string;
  version: string;
};

export type EnneagramReportV2Module = {
  moduleKey: string;
  kind: string;
  visibility: EnneagramModuleVisibility;
  state: EnneagramModuleState;
  formVariant: EnneagramFormVariant;
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
  fallbackPolicy: string;
};

export type EnneagramReportV2Page = {
  pageKey: string;
  title: string;
  purpose: string;
  visibility: string;
  sourceRegistryRefs: string[];
  modules: EnneagramReportV2Module[];
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
  };
  classification: {
    interpretationScope: EnneagramModuleState;
    confidenceLevel: string;
    interpretationReason: string;
  };
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
  };
};

export type EnneagramResultViewModel = {
  projection: EnneagramPublicProjection | null;
  reportV2: EnneagramReportV2 | null;
  schemaVersion: string | null;
  formCode: string | null;
  formSummaryLabel: string | null;
  estimatedMinutes: number | null;
  primaryType: EnneagramTypeRow | null;
  typeVector: EnneagramTypeRow[];
  topTypes: EnneagramTypeRow[];
  summary: string;
  qualityLevel: string;
  confidenceLabel: string;
  interpretationScope: EnneagramModuleState;
  interpretationReason: string;
  formVariant: EnneagramFormVariant;
  methodologyVariant: string | null;
  registryVersion: string | null;
  registryReleaseHash: string | null;
  interpretationContextId: string | null;
  pages: EnneagramReportV2Page[];
  modules: EnneagramReportV2Module[];
  moduleMap: Record<string, EnneagramReportV2Module>;
  visibleSections: Big5ReportSection[];
  lockedSections: Big5ReportSection[];
};

type AccessGate = {
  isFreeVariant: boolean;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function normalizeText(...values: unknown[]): string {
  for (const value of values) {
    const normalized = String(value ?? "").trim();
    if (normalized) {
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

function typeLabelFromCode(code: string): string {
  const normalized = code.replace(/^T/i, "");
  return normalized ? `Type ${normalized}` : code;
}

function normalizeTypeRow(value: unknown): EnneagramTypeRow | null {
  const row = asRecord(value);
  if (!row) {
    const code = normalizeText(value);
    return code ? { code, label: typeLabelFromCode(code), score: null, rank: null } : null;
  }

  const code = normalizeText(row.code, row.type_code, row.type, row.key, row.type_id);
  if (!code) {
    return null;
  }

  return {
    code,
    label: normalizeText(row.label, row.name, row.title, row.type_name_en, row.type_name_cn, typeLabelFromCode(code)),
    score: normalizeNumber(row.score ?? row.percent ?? row.value ?? row.display_score ?? row.score_display ?? row.score_norm),
    rank: normalizeNumber(row.rank),
    candidateRole: normalizeText(row.candidate_role),
    scoreSource: normalizeText(row.score_source),
    summary: normalizeText(row.core_logic, row.surface_impression, row.validation_hook),
  };
}

function normalizeTypeRows(value: unknown): EnneagramTypeRow[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeTypeRow(item))
    .filter((item): item is EnneagramTypeRow => item !== null);
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

const ASSET_BACKED_CONTENT_FIELDS = [
  "asset_key",
  "asset_type",
  "category",
  "module_key",
  "body_zh",
  "short_body_zh",
  "cta_zh",
  "content_maturity",
  "evidence_level",
  "version",
] as const;

function sanitizeAssetBackedContent(value: unknown): Record<string, unknown> {
  const record = asRecord(value);
  if (!record) {
    return {};
  }

  return Object.fromEntries(
    ASSET_BACKED_CONTENT_FIELDS
      .map((field) => [field, normalizeText(record[field])] as const)
      .filter(([, fieldValue]) => fieldValue.length > 0)
  );
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
    content: kind === "asset_backed_card" ? sanitizeAssetBackedContent(moduleRecord.content) : asRecord(moduleRecord.content) ?? {},
    dataRefs: normalizeStringArray(moduleRecord.data_refs),
    registryRefs: normalizeStringArray(moduleRecord.registry_refs),
    provenance: {
      projectionRefs: normalizeStringArray(provenance?.projection_refs),
      registryRefs: normalizeStringArray(provenance?.registry_refs),
      policyRefs: normalizeStringArray(provenance?.policy_refs),
      contentMaturity: normalizeText(provenance?.content_maturity, "scaffold"),
      evidenceLevel: normalizeText(provenance?.evidence_level, "descriptive"),
    },
    fallbackPolicy: normalizeText(moduleRecord.fallback_policy, "fallback_to_generic"),
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
    title: normalizeText(page.title, page.page_title),
    purpose: normalizeText(page.purpose, page.description),
    visibility: normalizeText(page.visibility, "visible"),
    sourceRegistryRefs: normalizeStringArray(page.source_registry_refs),
    modules: normalizeModules(page.modules),
  };
}

function normalizePages(value: unknown): EnneagramReportV2Page[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizePage(item))
    .filter((item): item is EnneagramReportV2Page => item !== null);
}

function resolveReportV2(reportData: ReportResponse): EnneagramReportV2 | null {
  const raw =
    asRecord(reportData.enneagram_report_v2) ??
    asRecord(asRecord(reportData.report?._meta)?.enneagram_report_v2);

  if (!raw) {
    return null;
  }

  const pages = normalizePages(raw.pages);
  const modulesFromRoot = normalizeModules(raw.modules);
  const modules = modulesFromRoot.length > 0 ? modulesFromRoot : pages.flatMap((page) => page.modules);
  const moduleMap = Object.fromEntries(modules.map((module) => [module.moduleKey, module])) as Record<string, EnneagramReportV2Module>;
  const form = asRecord(raw.form);
  const registry = asRecord(raw.registry);
  const classification = asRecord(raw.classification);
  const provenance = asRecord(raw.provenance);

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
    },
    classification: {
      interpretationScope: normalizeModuleState(classification?.interpretation_scope),
      confidenceLevel: normalizeText(classification?.confidence_level),
      interpretationReason: normalizeText(classification?.interpretation_reason),
    },
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
    },
  };
}

function resolveProjection(reportData: ReportResponse): EnneagramPublicProjection | null {
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

function resolvePrimaryType(reportV2: EnneagramReportV2 | null, projection: EnneagramPublicProjection | null): EnneagramTypeRow | null {
  const top3Module = reportV2?.moduleMap.top3_cards;
  const cards = Array.isArray(top3Module?.content.cards) ? top3Module?.content.cards : [];
  if (cards.length > 0) {
    const primary = normalizeTypeRow({ ...(cards[0] as Record<string, unknown>), code: (cards[0] as Record<string, unknown>)?.type, rank: 1 });
    if (primary) {
      return primary;
    }
  }

  const summaryCandidates = Array.isArray(reportV2?.moduleMap.instant_summary?.content.top_candidates)
    ? reportV2?.moduleMap.instant_summary?.content.top_candidates
    : [];
  if (summaryCandidates.length > 0) {
    const primary = normalizeTypeRow({
      ...(summaryCandidates[0] as Record<string, unknown>),
      code: (summaryCandidates[0] as Record<string, unknown>)?.type,
      rank: 1,
    });
    if (primary) {
      return primary;
    }
  }

  if (!projection) {
    return null;
  }

  const primary = projection.primary_type ?? projection.primaryType;
  if (primary) {
    const row = normalizeTypeRow(primary);
    if (row) {
      return row;
    }
  }

  const primaryCode = normalizeText(projection.type_code, projection.primary_type_code);
  return primaryCode ? { code: primaryCode, label: typeLabelFromCode(primaryCode), score: null, rank: null } : null;
}

function resolveTypeVector(reportV2: EnneagramReportV2 | null, projection: EnneagramPublicProjection | null): EnneagramTypeRow[] {
  const items = Array.isArray(reportV2?.moduleMap.all9_profile?.content.items) ? reportV2?.moduleMap.all9_profile?.content.items : [];
  const rows = items
    .map((item) =>
      normalizeTypeRow({
        ...(asRecord(item) ?? {}),
        code: normalizeText(asRecord(item)?.type, asRecord(item)?.code, asRecord(item)?.type_code),
        label: normalizeText(asRecord(item)?.type_name_en, asRecord(item)?.type_name_cn, asRecord(item)?.label),
        score: asRecord(item)?.score_display ?? asRecord(item)?.score_norm,
        rank: asRecord(item)?.rank,
      })
    )
    .filter((item): item is EnneagramTypeRow => item !== null);

  if (rows.length > 0) {
    return rows;
  }

  if (!projection) {
    return [];
  }

  return normalizeTypeRows(projection.type_vector ?? projection.typeVector ?? projection.ranked_types ?? projection.rankedTypes);
}

function resolveTopTypes(reportV2: EnneagramReportV2 | null, projection: EnneagramPublicProjection | null): EnneagramTypeRow[] {
  const cards = Array.isArray(reportV2?.moduleMap.top3_cards?.content.cards) ? reportV2?.moduleMap.top3_cards?.content.cards : [];
  const rows = cards
    .map((item, index) =>
      normalizeTypeRow({
        ...(asRecord(item) ?? {}),
        code: normalizeText(asRecord(item)?.type, asRecord(item)?.code, asRecord(item)?.type_code),
        label: normalizeText(asRecord(item)?.type_name_en, asRecord(item)?.type_name_cn, asRecord(item)?.label),
        score: asRecord(item)?.display_score,
        rank: index + 1,
      })
    )
    .filter((item): item is EnneagramTypeRow => item !== null);

  if (rows.length > 0) {
    return rows;
  }

  if (!projection) {
    return [];
  }

  return normalizeTypeRows(projection.top_types ?? projection.topTypes);
}

function resolveQualityLevel(
  reportV2: EnneagramReportV2 | null,
  projection: EnneagramPublicProjection | null,
  reportData: ReportResponse
): string {
  const lowQualityModule = reportV2?.moduleMap.low_quality_boundary;
  const confidenceModule = reportV2?.moduleMap.confidence_band_card;
  return normalizeText(
    lowQualityModule?.content.quality_level,
    confidenceModule?.content.quality_level,
    asRecord(projection?.quality)?.level,
    asRecord(reportData.quality)?.level,
    reportData.meta?.quality_level
  );
}

function resolveConfidenceLabel(reportV2: EnneagramReportV2 | null, projection: EnneagramPublicProjection | null): string {
  return normalizeText(
    reportV2?.moduleMap.confidence_band_card?.content.confidence_label,
    reportV2?.classification.confidenceLevel,
    asRecord(projection?.confidence)?.label,
    asRecord(projection?.confidence)?.level,
    asRecord(projection?.confidence)?.bucket
  );
}

function resolveSummary(reportV2: EnneagramReportV2 | null, projection: EnneagramPublicProjection | null, reportData: ReportResponse): string {
  return normalizeText(
    reportV2?.moduleMap.instant_summary?.content.body,
    reportV2?.moduleMap.instant_summary?.content.title,
    projection?.summary,
    projection?.headline,
    reportData.summary,
    reportData.report?.summary
  );
}

function resolveSections(reportData: ReportResponse, projection: EnneagramPublicProjection | null): Big5ReportSection[] {
  const reportSections = normalizeSections(reportData.report?.sections);
  if (reportSections.length > 0) {
    return reportSections;
  }

  return normalizeSections(projection?.sections);
}

function splitSections(sections: Big5ReportSection[], gate: AccessGate): {
  visibleSections: Big5ReportSection[];
  lockedSections: Big5ReportSection[];
} {
  if (!gate.isFreeVariant) {
    return {
      visibleSections: sections,
      lockedSections: [],
    };
  }

  return {
    visibleSections: sections.filter((section) => normalizeText(section.access_level).toLowerCase() !== "paid"),
    lockedSections: sections.filter((section) => normalizeText(section.access_level).toLowerCase() === "paid"),
  };
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
  const projection = resolveProjection(reportData);
  const reportV2 = resolveReportV2(reportData);
  const formSummary = resolveFormSummary(reportData, projection, reportV2);
  const sections = resolveSections(reportData, projection);
  const split = splitSections(sections, gate);

  return {
    projection,
    reportV2,
    schemaVersion: reportV2?.schemaVersion ?? projection?.schema_version ?? null,
    formCode: reportV2?.form.formCode ?? formSummary?.formCode ?? null,
    formSummaryLabel: buildEnneagramFormDisplayLabel(formSummary, { locale }),
    estimatedMinutes: formSummary?.estimatedMinutes && formSummary.estimatedMinutes > 0 ? formSummary.estimatedMinutes : null,
    primaryType: resolvePrimaryType(reportV2, projection),
    typeVector: resolveTypeVector(reportV2, projection),
    topTypes: resolveTopTypes(reportV2, projection),
    summary: resolveSummary(reportV2, projection, reportData),
    qualityLevel: resolveQualityLevel(reportV2, projection, reportData),
    confidenceLabel: resolveConfidenceLabel(reportV2, projection),
    interpretationScope: reportV2?.classification.interpretationScope ?? "unknown",
    interpretationReason: reportV2?.classification.interpretationReason ?? "",
    formVariant: normalizeFormVariant(reportV2?.moduleMap.methodology_boundary_card?.formVariant ?? reportV2?.moduleMap.method_boundary?.formVariant),
    methodologyVariant: reportV2?.form.methodologyVariant ?? null,
    registryVersion: reportV2?.registry.registryVersion ?? null,
    registryReleaseHash: reportV2?.registry.registryReleaseHash ?? null,
    interpretationContextId: reportV2?.provenance.interpretationContextId ?? null,
    pages: reportV2?.pages ?? [],
    modules: reportV2?.modules ?? [],
    moduleMap: reportV2?.moduleMap ?? {},
    visibleSections: split.visibleSections,
    lockedSections: split.lockedSections,
  };
}

export function hasEnneagramProjection(reportData: ReportResponse | null | undefined): boolean {
  if (!reportData) {
    return false;
  }

  return Boolean(resolveReportV2(reportData) || resolveProjection(reportData));
}
