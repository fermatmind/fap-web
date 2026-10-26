// Source provenance only. These fields never establish ownership, payment or PDF access.
export type RiasecPrivateResultAuthorityView = {
  mode: "canonical" | "immutable_legacy_snapshot";
  sourceHash: string;
  compiledHash: string;
  authorityId?: string;
  locale?: string;
  compilerVersion?: string;
  coverageScope?: "report_sources";
  reportContractId?: string;
  sourceCoverageHash?: string;
  instanceContractId?: string;
  instanceHash?: string;
};

export type RiasecReportContentEvidenceView = {
  schemaVersion: "riasec.report_content_validation.v1";
  contractId: string;
  status: "complete" | "incomplete" | "restricted";
  sourceAuthority: RiasecPrivateResultAuthorityView;
  instanceHash: string;
  rawScores: string;
  errors: Array<{ pointer: string; reason: string }>;
};

type Container = {
  riasec_public_projection_v2?: unknown;
  riasec_private_result_authority?: unknown;
  report?: unknown;
};
type RecordValue = Record<string, unknown>;
const CONTRACT = "riasec.en13.report_sources.v1";
const EN_REPORT = "FERMATMIND_RIASEC_PRIVATE_RESULT_EN_REPORT";
const VERSIONS = new Set(Array.from({ length: 10 }, (_, minor) => `1.${minor}.0`));
const DIMENSIONS = ["R", "I", "A", "S", "E", "C"];
const record = (v: unknown): RecordValue | null => v !== null && typeof v === "object" && !Array.isArray(v) ? v as RecordValue : null;
const text = (v: unknown): string => typeof v === "string" ? v.trim() : "";
const hash = (v: unknown): string => /^[a-f0-9]{64}$/i.test(text(v)) ? text(v).toLowerCase() : "";

function parseSource(value: unknown, requireInstance: boolean): RiasecPrivateResultAuthorityView | null {
  const raw = record(value);
  if (!raw || raw.schema_version !== "fap.riasec.private_result_authority.v1") return null;
  if (raw.mode === "immutable_legacy_snapshot") {
    return text(raw.authority_id) === "" && text(raw.source_hash) === "" && text(raw.compiled_hash) === ""
      ? { mode: "immutable_legacy_snapshot", sourceHash: "", compiledHash: "" } : null;
  }
  if (raw.mode !== "canonical" || raw.compiled_schema !== "fap.riasec.private_result.compiled.v1"
    || raw.compiler_schema !== "fap.riasec.private_result.compiler.v1"
    || raw.runtime_contract !== "riasec.report.v1") return null;
  const sourceHash = hash(raw.source_hash);
  const compiledHash = hash(raw.compiled_hash);
  if (!sourceHash || !compiledHash) return null;
  if (raw.authority_id === "FERMATMIND_RIASEC_PRIVATE_RESULT_ZH_CN_CANONICAL"
    && raw.locale === "zh-CN" && VERSIONS.has(text(raw.compiler_version))
    && raw.coverage_scope === undefined) {
    // Preserve the original public parser shape for immutable 1.0 consumers.
    return raw.compiler_version === "1.0.0" ? { mode: "canonical", sourceHash, compiledHash }
      : { mode: "canonical", sourceHash, compiledHash, authorityId: text(raw.authority_id), locale: "zh-CN", compilerVersion: text(raw.compiler_version) };
  }
  if (raw.authority_id !== EN_REPORT || raw.locale !== "en" || raw.compiler_version !== "1.9.0"
    || raw.coverage_scope !== "report_sources" || raw.report_contract_id !== CONTRACT
    || !hash(raw.source_coverage_hash)) return null;
  const source: RiasecPrivateResultAuthorityView = {
    mode: "canonical", sourceHash, compiledHash, authorityId: EN_REPORT, locale: "en",
    compilerVersion: "1.9.0", coverageScope: "report_sources", reportContractId: CONTRACT,
    sourceCoverageHash: hash(raw.source_coverage_hash),
  };
  if (!requireInstance) return source;
  if (raw.instance_contract_id !== CONTRACT || !hash(raw.instance_hash)) return null;
  return { ...source, instanceContractId: CONTRACT, instanceHash: hash(raw.instance_hash) };
}

export function parseRiasecPrivateResultAuthority(value: unknown): RiasecPrivateResultAuthorityView | null {
  return parseSource(value, true);
}

export function parseRiasecReportContentEvidence(value: unknown): RiasecReportContentEvidenceView | null {
  const raw = record(value);
  if (!raw || raw.schema_version !== "riasec.report_content_validation.v1" || raw.contract_id !== CONTRACT
    || !["complete", "incomplete", "restricted"].includes(text(raw.status)) || !hash(raw.instance_hash)
    || raw.raw_scores !== "not_required_when_absent_from_snapshot_unknown" || !Array.isArray(raw.errors)) return null;
  const sourceAuthority = parseSource(raw.source_authority, false);
  if (sourceAuthority?.authorityId !== EN_REPORT) return null;
  const errors: Array<{ pointer: string; reason: string }> = [];
  for (const value of raw.errors) {
    const error = record(value);
    if (!error || !text(error.pointer) || !text(error.reason)) return null;
    errors.push({ pointer: text(error.pointer), reason: text(error.reason) });
  }
  if (raw.status === "complete" && errors.length > 0) return null;
  return {
    schemaVersion: "riasec.report_content_validation.v1", contractId: CONTRACT,
    status: raw.status as RiasecReportContentEvidenceView["status"], sourceAuthority,
    instanceHash: hash(raw.instance_hash), rawScores: text(raw.raw_scores), errors,
  };
}

function sameSource(a: RiasecPrivateResultAuthorityView, b: RiasecPrivateResultAuthorityView): boolean {
  return a.mode === b.mode && a.sourceHash === b.sourceHash && a.compiledHash === b.compiledHash
    && a.authorityId === b.authorityId && a.locale === b.locale && a.compilerVersion === b.compilerVersion
    && a.coverageScope === b.coverageScope && a.reportContractId === b.reportContractId
    && a.sourceCoverageHash === b.sourceCoverageHash;
}

function validEnglishContext(p: RecordValue): boolean {
  const form = record(p.form);
  const evidence = record(p.measurement_evidence);
  const quality = record(p.quality);
  const holland = record(p.holland_code);
  const interpretation = record(p.interpretation_state);
  const scores = record(p.scores);
  const count = form?.form_code === "riasec_60" ? 60 : form?.form_code === "riasec_140" ? 140 : null;
  const space = count === 60 ? "riasec_60_likert5_activity_sum_space.v1" : "riasec_140_likert5_activity_context_space.v1";
  const normalization = count === 60 ? "raw_sum_per_dimension_min10_max50_to_0_100" : "activity_environment_role_weighted_0_100";
  const code = text(holland?.code);
  if (p.schema_version !== "riasec.public_projection.v2" || p.scale_code !== "RIASEC" || p.locale !== "en"
    || count === null || form?.question_count !== count || form.score_space_version !== space
    || form.form_kind !== (count === 60 ? "standard" : "enhanced_contextual")
    || form.cross_form_comparable !== false || form.raw_score_delta_allowed !== false
    || evidence?.snapshot_bound !== true || evidence.measurement_contract_version !== "riasec.measurement_contract.v1"
    || evidence.score_space_version !== space || evidence.normalization_method !== normalization
    || evidence.quality_rule_version !== "riasec_quality_rule_spec_v2" || evidence.interpretation_rule_version !== "riasec_interpretation_rule_spec_v2"
    || !["scoring_spec_version", "form_version", "content_package_version"].every(k => text(evidence[k]))
    || quality?.quality_state !== "normal" || quality.grade !== "A"
    || !/^[RIASEC]{3}$/.test(code) || new Set(code).size !== 3
    || !["primary_type", "secondary_type", "tertiary_type"].every((k, i) => holland?.[k] === code[i])
    || record(interpretation?.tie_display_v1)?.ordered_code !== code
    || !["clear_code", "blended_code", "broad_profile", "near_tie"].includes(text(interpretation?.profile_shape))
    || scores?.score_kind !== "dimension_scores_0_100"
    || !Array.isArray(scores.dimensions) || scores.dimensions.length !== 6) return false;
  const seen = new Set<string>();
  for (const value of scores.dimensions) {
    const row = record(value);
    const dimension = text(row?.code);
    if (!DIMENSIONS.includes(dimension) || seen.has(dimension) || !text(row?.label)
      || typeof row?.score !== "number" || !Number.isFinite(row.score) || row.score < 0 || row.score > 100) return false;
    seen.add(dimension);
  }
  const claim = record(p.claim_boundary);
  const band = record(p.dimension_score_band_contract_v1);
  const deep = record(p.deep_content_slots_v1);
  const lifecycle = record(p.lifecycle_copy_v1);
  const summary = record(p.result_summary_v1);
  const modules = record(p.module_visibility_policy);
  const visibility = new Map((Array.isArray(modules?.modules) ? modules.modules : []).map(v => {
    const policyModule = record(v);
    return [text(policyModule?.key), text(policyModule?.visibility)] as const;
  }));
  const shown = (key: string) => ["visible", "collapsed"].includes(visibility.get(key) ?? "hidden");
  const slots = (Array.isArray(deep?.slots) ? deep.slots : []).map(record)
    .filter((slot): slot is RecordValue => slot !== null && shown(text(slot.module_key)));
  if (modules?.schema_version !== "riasec.module_visibility_policy.v1"
    || record(modules.fallback_policy)?.frontend_inference_allowed !== false
    || !shown("six_dimension_map") || slots.some(slot => slot.locale !== "en"
      || slot.content_status !== "authored" || slot.frontend_fallback_allowed !== false
      || !record(slot.content) || !text(record(slot.boundaries)?.user_visible_boundary))) return false;
  for (const slot of slots) {
    const content = record(slot.content)!;
    if (!text(content.title ?? content.pair_label ?? content.strategy_label)) return false;
    const detailKey = text(record(slot.selection_v1)?.selected_detail_key);
    if (slot.slot_key === "dimension_deep_copy" && (!["high_score_reading", "medium_score_reading", "low_score_safe_reading"].includes(detailKey)
      || !text(content[detailKey]))) return false;
    if (slot.slot_key === "pair_blend_copy" && !text(content.chemistry)) return false;
    if (slot.slot_key === "triad_blend_copy" && !text(content.core_reading)) return false;
  }
  const selectedDimensions = slots.filter(slot => slot.slot_key === "dimension_deep_copy")
    .map(slot => text(record(slot.state)?.dimension_code)).sort();
  if (selectedDimensions.join("") !== [...DIMENSIONS].sort().join("")) return false;
  for (const [moduleKey, key, count] of [["hero_activity_chain", "triad_blend_copy", 1], ["pair_blend", "pair_blend_copy", 3]] as const) {
    if (shown(moduleKey) && slots.filter(slot => slot.slot_key === key).length !== count) return false;
  }
  if (shown("140q_context_cards") && ["140q_task_card_copy", "140q_environment_card_copy", "140q_role_card_copy"]
    .some(key => ![1, 2].includes(slots.filter(slot => slot.slot_key === key).length))) return false;
  return Array.isArray(claim?.measures) && claim.measures.length === 1 && claim.measures[0] === "career_interest"
    && Array.isArray(claim.does_not_measure) && ["ability", "personality", "values", "career_success_probability", "job_fit"].every(v => (claim.does_not_measure as unknown[]).includes(v))
    && band?.schema_version === "riasec.dimension_score_band.v1" && band.percentile_interpretation_allowed === false && band.normative_interpretation_allowed === false
    && deep?.schema_version === "riasec.deep_content_slots.v1" && deep.locale === "en"
    && record(deep.source_policy)?.frontend_fallback_allowed === false && Array.isArray(deep.slots) && deep.slots.length > 0
    && lifecycle?.schema_version === "riasec.lifecycle_copy.v1" && lifecycle.locale === "en" && lifecycle.status === "available"
    && lifecycle.frontend_fallback_allowed === false && Array.isArray(lifecycle.faq_items) && lifecycle.faq_items.length > 0
    && lifecycle.faq_items.every(v => text(record(v)?.q) && text(record(v)?.a))
    && record(lifecycle.method_boundaries) !== null && Object.keys(record(lifecycle.method_boundaries)!).length > 0
    && Object.values(record(lifecycle.method_boundaries)!).every(v => text(record(v)?.label) && text(record(v)?.copy))
    && ["technical_note_summary_sections", "professional_method_boundary_sections"]
      .every(key => Array.isArray(lifecycle[key]) && (lifecycle[key] as unknown[]).length > 0)
    && Array.isArray(lifecycle.technical_note_summary_sections)
    && lifecycle.technical_note_summary_sections.every(v => record(v)?.data_status === null && text(record(v)?.title) && text(record(v)?.copy))
    && summary?.snapshot_bound === true && ["headline", "quality_summary", "next_step", "boundary"].every(key => text(summary[key]))
    && Array.isArray(summary.highlights) && summary.highlights.length === 3;
}

export function resolveRiasecPrivateResultAuthority(data: Container | null | undefined): RiasecPrivateResultAuthorityView | null {
  if (!data) return null;
  const projection = record(data.riasec_public_projection_v2);
  const rawProjectionAuthority = projection?.private_result_authority;
  const authority = parseRiasecPrivateResultAuthority(rawProjectionAuthority);
  const meta = record(record(data.report)?._meta);
  const rawExternal = data.riasec_private_result_authority ?? meta?.riasec_private_result_authority;
  const external = parseRiasecPrivateResultAuthority(rawExternal);
  if (external?.mode === "immutable_legacy_snapshot" && !record(rawProjectionAuthority)) return external;
  if (authority?.mode !== "canonical" || external?.mode !== "canonical" || !sameSource(authority, external)) return null;
  if (projection?.locale !== record(rawProjectionAuthority)?.locale) return null;
  for (const replica of [data.riasec_private_result_authority, meta?.riasec_private_result_authority,
    record(meta?.riasec_public_projection_v2)?.private_result_authority]) {
    if (replica === undefined || (replica === null && authority.authorityId !== EN_REPORT)) continue;
    const parsed = parseRiasecPrivateResultAuthority(replica);
    if (!parsed || !sameSource(authority, parsed)
      || (authority.authorityId === EN_REPORT && (parsed.instanceHash !== authority.instanceHash
        || parsed.instanceContractId !== authority.instanceContractId))) return null;
  }
  if (authority.authorityId !== EN_REPORT) return authority;
  const content = parseRiasecReportContentEvidence(projection?.report_content_v1);
  if (!projection || !validEnglishContext(projection) || content?.status !== "complete"
    || !sameSource(authority, content.sourceAuthority) || content.instanceHash !== authority.instanceHash
    || authority.instanceHash !== external.instanceHash || authority.instanceContractId !== external.instanceContractId) return null;
  const metaProjection = record(meta?.riasec_public_projection_v2);
  if (meta && meta.riasec_public_projection_v2 !== undefined && !metaProjection) return null;
  if (metaProjection) {
    const metaContent = parseRiasecReportContentEvidence(metaProjection.report_content_v1);
    if (!validEnglishContext(metaProjection) || metaContent?.status !== "complete" || metaContent.instanceHash !== content.instanceHash
      || !sameSource(authority, metaContent.sourceAuthority) || metaProjection.locale !== projection.locale
      || ["form_code", "question_count", "form_kind", "score_space_version", "cross_form_comparable", "raw_score_delta_allowed"]
        .some(key => record(metaProjection.form)?.[key] !== record(projection.form)?.[key])
      || ["scoring_spec_version", "form_version", "content_package_version", "score_space_version", "measurement_contract_version", "quality_rule_version", "interpretation_rule_version"]
        .some(key => record(metaProjection.measurement_evidence)?.[key] !== record(projection.measurement_evidence)?.[key])) return null;
  }
  const binding = record(meta?.snapshot_binding_v1);
  if (meta && !binding) return null;
  if (binding) {
    const fields = {
      canonical_authority_identity: authority.authorityId, canonical_source_hash: authority.sourceHash,
      canonical_compiled_hash: authority.compiledHash, canonical_compiled_schema: "fap.riasec.private_result.compiled.v1",
      canonical_compiler_schema: "fap.riasec.private_result.compiler.v1", canonical_compiler_version: authority.compilerVersion,
      form_code: record(projection.form)?.form_code, scoring_spec_version: record(projection.measurement_evidence)?.scoring_spec_version,
      score_space_version: record(projection.form)?.score_space_version,
      measurement_contract_version: record(projection.measurement_evidence)?.measurement_contract_version,
    };
    if (binding.schema_version !== "riasec.snapshot_binding.v1" || binding.snapshot_bound !== true
      || !Object.entries(fields).every(([key, value]) => binding[key] === value)) return null;
  }
  return authority;
}

export function legacyProjectionAuthorityFallback(data: Container): RiasecPrivateResultAuthorityView | null {
  const projection = record(data.riasec_public_projection_v2);
  const raw = record(projection?.private_result_authority);
  const meta = record(record(data.report)?._meta);
  if (data.riasec_private_result_authority !== undefined || meta?.riasec_private_result_authority !== undefined
    || projection?.locale !== "zh-CN"
    || raw?.authority_id !== "FERMATMIND_RIASEC_PRIVATE_RESULT_ZH_CN_CANONICAL"
    || !/^1\.[0-8]\.0$/.test(text(raw.compiler_version))) return null;
  return parseRiasecPrivateResultAuthority(raw);
}
