import type { CareerClaimPermissions } from "@/lib/career/contracts/claimPermissions";
import { createConservativeCareerClaimPermissions, isCareerClaimPermissions } from "@/lib/career/contracts/claimPermissions";
import type { CareerScoreResult } from "@/lib/career/contracts/scoreResult";
import { createUnavailableCareerScoreResult, isCareerScoreResult } from "@/lib/career/contracts/scoreResult";

export type CareerAssetAliasIndexItem = {
  alias: string;
  normalized: string;
  lang: string;
  register: string;
  intent_scope: string;
  target_kind: string;
  target_uuid: string | null;
  precision: number | null;
  confidence: number | null;
  seniority_hint: string | null;
  function_hint: string | null;
};

export type CareerAssetMaster = {
  envelope: {
    asset_version: string;
    schema_version: string;
    protocol_version: string;
    generated_at: string | null;
    content_version: string;
    data_version: string;
    logic_version: string;
  };
  identity: {
    occupation_uuid: string | null;
    canonical_slug: string;
    entity_level: string | null;
    family_uuid: string | null;
    parent_uuid: string | null;
  };
  locale_policy: {
    truth_market: string | null;
    display_market: string | null;
    crosswalk_mode: string | null;
    locale_warning: string | null;
    truth_notice_required: boolean;
  };
  titles: {
    canonical_en: string | null;
    canonical_zh: string | null;
    search_h1_zh: string | null;
    short_title_en: string | null;
    short_title_zh: string | null;
  };
  alias_index: CareerAssetAliasIndexItem[];
  ontology: {
    task_prototype_signature: Record<string, number | null>;
    structural_stability: number | null;
    task_prototype_overlap: number | null;
    market_semantics_gap: number | null;
    regulatory_divergence: number | null;
    toolchain_divergence: number | null;
    skill_gap_threshold: number | null;
    trust_inheritance_scope: Record<string, boolean>;
  };
  crosswalks: {
    us_soc: Array<Record<string, unknown>>;
    cn_occ: Array<Record<string, unknown>>;
    market_titles: Array<Record<string, unknown>>;
  };
  truth_layer: {
    source_refs: string[];
    median_pay_usd_annual: number | null;
    jobs_2024: number | null;
    projected_jobs_2034: number | null;
    employment_change: number | null;
    outlook_pct_2024_2034: number | null;
    outlook_description: string | null;
    entry_education: string | null;
    work_experience: string | null;
    on_the_job_training: string | null;
    ai_exposure: number | null;
    ai_rationale: string | null;
    bls_url: string | null;
    truth_last_reviewed_at: string | null;
  };
  derived_signals: {
    ai_risk_band: string | null;
    growth_band: string | null;
    pay_band: string | null;
    entry_barrier: string | null;
    human_moat_tags: string[];
    work_structure_tags: string[];
    collaboration_load: number | null;
    abstraction_level: number | null;
    autonomy_level: number | null;
    variability_level: number | null;
    people_intensity: number | null;
    closure_demand: number | null;
    cadence_rigidity: number | null;
    process_repeatability: number | null;
    deadline_hardness: number | null;
    likely_fit_types: string[];
    likely_strain_types: string[];
    derivation_refs: string[];
  };
  scoring: {
    fit_score: CareerScoreResult;
    strain_score: CareerScoreResult;
    ai_survival_score: CareerScoreResult;
    mobility_score: CareerScoreResult;
    confidence_score: CareerScoreResult;
  };
  warnings: {
    red_flags: string[];
    amber_flags: string[];
    blocked_claims: string[];
  };
  claim_permissions: CareerClaimPermissions;
  transition_seed: {
    bridge_candidate_refs: string[];
    hedge_candidate_refs: string[];
    stable_upside_candidate_refs: string[];
  };
  seo_contract: {
    route_family: string | null;
    canonical_path: string | null;
    index_state: string | null;
    index_eligible: boolean | null;
    dataset_eligible: boolean | null;
    article_eligible: boolean | null;
    canonical_target: string | null;
  };
  trust_contract: {
    trust_manifest_ref: string | null;
    review_required: boolean;
    editorial_patch_required: boolean;
    editorial_patch_status: string | null;
  };
  audit: {
    created_by: string | null;
    reviewed_by: string | null;
    created_at: string | null;
    last_substantive_update_at: string | null;
    schema_hash: string | null;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized || null;
}

function normalizeNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function normalizeBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.map((item) => String(item ?? "").trim()).filter(Boolean))];
}

function normalizeObjectArray(value: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isRecord);
}

function normalizeNumberRecord(value: unknown): Record<string, number | null> {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizeNumber(item)]));
}

function normalizeBooleanRecord(value: unknown): Record<string, boolean> {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, item]) => typeof item === "boolean")
      .map(([key, item]) => [key, Boolean(item)])
  );
}

function normalizeAliasIndex(value: unknown): CareerAssetAliasIndexItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .map((item) => ({
      alias: normalizeString(item.alias) ?? "",
      normalized: normalizeString(item.normalized) ?? "",
      lang: normalizeString(item.lang) ?? "",
      register: normalizeString(item.register) ?? "",
      intent_scope: normalizeString(item.intent_scope) ?? "",
      target_kind: normalizeString(item.target_kind) ?? "",
      target_uuid: normalizeString(item.target_uuid ?? item.target_id),
      precision: normalizeNumber(item.precision),
      confidence: normalizeNumber(item.confidence),
      seniority_hint: normalizeString(item.seniority_hint),
      function_hint: normalizeString(item.function_hint),
    }));
}

export function isCareerAssetMaster(value: unknown): value is CareerAssetMaster {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isRecord(value.envelope) &&
    isRecord(value.identity) &&
    isRecord(value.locale_policy) &&
    isRecord(value.titles) &&
    Array.isArray(value.alias_index) &&
    isRecord(value.ontology) &&
    isRecord(value.crosswalks) &&
    isRecord(value.truth_layer) &&
    isRecord(value.derived_signals) &&
    isRecord(value.scoring) &&
    isRecord(value.warnings) &&
    isCareerClaimPermissions(value.claim_permissions) &&
    isRecord(value.transition_seed) &&
    isRecord(value.seo_contract) &&
    isRecord(value.trust_contract) &&
    isRecord(value.audit)
  );
}

export function normalizeCareerAssetMaster(value: unknown): CareerAssetMaster | null {
  if (!isRecord(value)) {
    return null;
  }

  const envelope = isRecord(value.envelope) ? value.envelope : {};
  const identity = isRecord(value.identity) ? value.identity : {};
  const localePolicy = isRecord(value.locale_policy) ? value.locale_policy : {};
  const titles = isRecord(value.titles) ? value.titles : {};
  const ontology = isRecord(value.ontology) ? value.ontology : {};
  const crosswalks = isRecord(value.crosswalks) ? value.crosswalks : {};
  const truthLayer = isRecord(value.truth_layer) ? value.truth_layer : {};
  const derivedSignals = isRecord(value.derived_signals) ? value.derived_signals : {};
  const scoring = isRecord(value.scoring) ? value.scoring : {};
  const warnings = isRecord(value.warnings) ? value.warnings : {};
  const transitionSeed = isRecord(value.transition_seed) ? value.transition_seed : {};
  const seoContract = isRecord(value.seo_contract) ? value.seo_contract : {};
  const trustContract = isRecord(value.trust_contract) ? value.trust_contract : {};
  const audit = isRecord(value.audit) ? value.audit : {};

  return {
    envelope: {
      asset_version: normalizeString(envelope.asset_version) ?? "career_asset_master_v4.1",
      schema_version: normalizeString(envelope.schema_version) ?? "career.asset_master.schema.v4.1",
      protocol_version: normalizeString(envelope.protocol_version) ?? "career.protocol.v1",
      generated_at: normalizeString(envelope.generated_at),
      content_version: normalizeString(envelope.content_version) ?? "unknown",
      data_version: normalizeString(envelope.data_version) ?? "unknown",
      logic_version: normalizeString(envelope.logic_version) ?? "unknown",
    },
    identity: {
      occupation_uuid: normalizeString(identity.occupation_uuid),
      canonical_slug: normalizeString(identity.canonical_slug) ?? "",
      entity_level: normalizeString(identity.entity_level),
      family_uuid: normalizeString(identity.family_uuid),
      parent_uuid: normalizeString(identity.parent_uuid),
    },
    locale_policy: {
      truth_market: normalizeString(localePolicy.truth_market),
      display_market: normalizeString(localePolicy.display_market),
      crosswalk_mode: normalizeString(localePolicy.crosswalk_mode),
      locale_warning: normalizeString(localePolicy.locale_warning),
      truth_notice_required: Boolean(localePolicy.truth_notice_required),
    },
    titles: {
      canonical_en: normalizeString(titles.canonical_en),
      canonical_zh: normalizeString(titles.canonical_zh),
      search_h1_zh: normalizeString(titles.search_h1_zh),
      short_title_en: normalizeString(titles.short_title_en),
      short_title_zh: normalizeString(titles.short_title_zh),
    },
    alias_index: normalizeAliasIndex(value.alias_index),
    ontology: {
      task_prototype_signature: normalizeNumberRecord(ontology.task_prototype_signature),
      structural_stability: normalizeNumber(ontology.structural_stability),
      task_prototype_overlap: normalizeNumber(ontology.task_prototype_overlap),
      market_semantics_gap: normalizeNumber(ontology.market_semantics_gap),
      regulatory_divergence: normalizeNumber(ontology.regulatory_divergence),
      toolchain_divergence: normalizeNumber(ontology.toolchain_divergence),
      skill_gap_threshold: normalizeNumber(ontology.skill_gap_threshold),
      trust_inheritance_scope: normalizeBooleanRecord(ontology.trust_inheritance_scope),
    },
    crosswalks: {
      us_soc: normalizeObjectArray(crosswalks.us_soc),
      cn_occ: normalizeObjectArray(crosswalks.cn_occ),
      market_titles: normalizeObjectArray(crosswalks.market_titles),
    },
    truth_layer: {
      source_refs: normalizeStringArray(truthLayer.source_refs),
      median_pay_usd_annual: normalizeNumber(truthLayer.median_pay_usd_annual),
      jobs_2024: normalizeNumber(truthLayer.jobs_2024),
      projected_jobs_2034: normalizeNumber(truthLayer.projected_jobs_2034),
      employment_change: normalizeNumber(truthLayer.employment_change),
      outlook_pct_2024_2034: normalizeNumber(truthLayer.outlook_pct_2024_2034),
      outlook_description: normalizeString(truthLayer.outlook_description),
      entry_education: normalizeString(truthLayer.entry_education),
      work_experience: normalizeString(truthLayer.work_experience),
      on_the_job_training: normalizeString(truthLayer.on_the_job_training),
      ai_exposure: normalizeNumber(truthLayer.ai_exposure),
      ai_rationale: normalizeString(truthLayer.ai_rationale),
      bls_url: normalizeString(truthLayer.bls_url),
      truth_last_reviewed_at: normalizeString(truthLayer.truth_last_reviewed_at),
    },
    derived_signals: {
      ai_risk_band: normalizeString(derivedSignals.ai_risk_band),
      growth_band: normalizeString(derivedSignals.growth_band),
      pay_band: normalizeString(derivedSignals.pay_band),
      entry_barrier: normalizeString(derivedSignals.entry_barrier),
      human_moat_tags: normalizeStringArray(derivedSignals.human_moat_tags),
      work_structure_tags: normalizeStringArray(derivedSignals.work_structure_tags),
      collaboration_load: normalizeNumber(derivedSignals.collaboration_load),
      abstraction_level: normalizeNumber(derivedSignals.abstraction_level),
      autonomy_level: normalizeNumber(derivedSignals.autonomy_level),
      variability_level: normalizeNumber(derivedSignals.variability_level),
      people_intensity: normalizeNumber(derivedSignals.people_intensity),
      closure_demand: normalizeNumber(derivedSignals.closure_demand),
      cadence_rigidity: normalizeNumber(derivedSignals.cadence_rigidity),
      process_repeatability: normalizeNumber(derivedSignals.process_repeatability),
      deadline_hardness: normalizeNumber(derivedSignals.deadline_hardness),
      likely_fit_types: normalizeStringArray(derivedSignals.likely_fit_types),
      likely_strain_types: normalizeStringArray(derivedSignals.likely_strain_types),
      derivation_refs: normalizeStringArray(derivedSignals.derivation_refs),
    },
    scoring: {
      fit_score: isCareerScoreResult(scoring.fit_score)
        ? scoring.fit_score
        : createUnavailableCareerScoreResult("fit_score"),
      strain_score: isCareerScoreResult(scoring.strain_score)
        ? scoring.strain_score
        : createUnavailableCareerScoreResult("strain_score"),
      ai_survival_score: isCareerScoreResult(scoring.ai_survival_score)
        ? scoring.ai_survival_score
        : createUnavailableCareerScoreResult("ai_survival_score"),
      mobility_score: isCareerScoreResult(scoring.mobility_score)
        ? scoring.mobility_score
        : createUnavailableCareerScoreResult("mobility_score"),
      confidence_score: isCareerScoreResult(scoring.confidence_score)
        ? scoring.confidence_score
        : createUnavailableCareerScoreResult("confidence_score"),
    },
    warnings: {
      red_flags: normalizeStringArray(warnings.red_flags),
      amber_flags: normalizeStringArray(warnings.amber_flags),
      blocked_claims: normalizeStringArray(warnings.blocked_claims),
    },
    claim_permissions: isCareerClaimPermissions(value.claim_permissions)
      ? value.claim_permissions
      : createConservativeCareerClaimPermissions(["missing_claim_permissions"]),
    transition_seed: {
      bridge_candidate_refs: normalizeStringArray(transitionSeed.bridge_candidate_refs),
      hedge_candidate_refs: normalizeStringArray(transitionSeed.hedge_candidate_refs),
      stable_upside_candidate_refs: normalizeStringArray(transitionSeed.stable_upside_candidate_refs),
    },
    seo_contract: {
      route_family: normalizeString(seoContract.route_family),
      canonical_path: normalizeString(seoContract.canonical_path),
      index_state: normalizeString(seoContract.index_state),
      index_eligible: normalizeBoolean(seoContract.index_eligible),
      dataset_eligible: normalizeBoolean(seoContract.dataset_eligible),
      article_eligible: normalizeBoolean(seoContract.article_eligible),
      canonical_target: normalizeString(seoContract.canonical_target),
    },
    trust_contract: {
      trust_manifest_ref: normalizeString(trustContract.trust_manifest_ref),
      review_required: Boolean(trustContract.review_required),
      editorial_patch_required: Boolean(trustContract.editorial_patch_required),
      editorial_patch_status: normalizeString(trustContract.editorial_patch_status),
    },
    audit: {
      created_by: normalizeString(audit.created_by),
      reviewed_by: normalizeString(audit.reviewed_by),
      created_at: normalizeString(audit.created_at),
      last_substantive_update_at: normalizeString(audit.last_substantive_update_at),
      schema_hash: normalizeString(audit.schema_hash),
    },
  };
}
