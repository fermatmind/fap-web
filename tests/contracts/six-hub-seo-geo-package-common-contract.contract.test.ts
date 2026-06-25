import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const JSON_PATH = "docs/seo/agent/six-hub-seo-geo-package-common-contract.v1.json";
const DOC_PATH = "docs/seo/agent/six-hub-seo-geo-package-common-contract-2026-06-25.md";
const MANIFEST_PATH = "docs/codex/pr-train.yaml";
const STATE_PATH = "docs/codex/pr-train-state.json";

const AUTHORIZED_TRAIN_IDS = [
  "SIX-HUB-SEO-GEO-PACKAGE-COMMON-CONTRACT-01",
  "SIX-HUB-SEO-GEO-PACKAGE-READINESS-PACKET-01",
  "SIX-HUB-SEO-GEO-CLAIM-COPY-RISK-PACKET-01",
  "SIX-HUB-SEO-GEO-AEO-INTERNAL-LINK-PACKET-01",
  "SIX-HUB-SEO-GEO-BATCH-SEQUENCE-MATRIX-01",
  "SIX-HUB-SEO-GEO-PACKAGE-PLANNING-MATRIX-01",
];

const EXPECTED_COMPONENTS = [
  "seo_title_candidate_family",
  "meta_description_candidate_family",
  "h1_hero_direction",
  "free_full_report_value_prop_direction",
  "aeo_answer_block_direction",
  "methodology_boundary_note_direction",
  "faq_visible_answer_block_direction",
  "internal_link_targets",
  "method_trust_science_support_links",
  "riasec_career_graph_links",
  "enneagram_public_personality_links",
  "claim_risk_notes",
  "cms_dry_run_suitability",
  "GPT55_review_required",
  "Safety_Gate_review_required",
  "SEO_GEO_review_required",
];

function readJson(relativePath: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8")) as Record<string, unknown>;
}

function readText(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asRecordArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.map(asRecord) : [];
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

describe("Six Hub SEO/GEO package common contract", () => {
  it("declares producer, collaborators, scale scope, locales, and URL count", () => {
    const contract = readJson(JSON_PATH);
    const scope = asRecord(contract.scope);

    expect(contract.schema_version).toBe("fermatmind.six_hub_seo_geo_package.common_contract.v1");
    expect(contract.task_id).toBe("SIX-HUB-SEO-GEO-PACKAGE-COMMON-CONTRACT-01");
    expect(contract.run_mode).toBe("docs_contracts_only");
    expect(contract.verdict).toBe("READY_FOR_SEO_GEO_PACKAGE_PLANNING");
    expect(contract.producing_agent).toBe("seo_geo_control");
    expect(asStringArray(contract.collaborating_agents)).toEqual([
      "assessment_hub",
      "claim_privacy_safety_gate",
      "cms_draft_package",
      "runtime_qa",
      "analytics_gsc_opportunity",
      "methodology_trust_science_support",
      "career_content_graph",
      "public_personality_content",
    ]);
    expect(asStringArray(scope.covered_scales)).toEqual([
      "MBTI",
      "BIG5_OCEAN",
      "RIASEC",
      "IQ_RAVEN",
      "EQ_60",
      "ENNEAGRAM",
    ]);
    expect(asStringArray(scope.covered_locales)).toEqual(["zh", "en"]);
    expect(scope.covered_url_count).toBe(12);
    expect(scope.private_flow_boundary).toBe("no_attempt_creation_no_answer_submission_no_private_result_access");
  });

  it("defines component, layer, authority, readiness, risk, batch, and output vocabularies", () => {
    const contract = readJson(JSON_PATH);

    expect(asStringArray(contract.package_component_vocabulary)).toEqual(EXPECTED_COMPONENTS);
    expect(asStringArray(contract.layer_vocabulary)).toEqual(["money_intent", "explainer", "scenario"]);
    expect(asStringArray(contract.authority_states)).toEqual([
      "backend_lookup_authority",
      "landing_surface_v1_authority",
      "published_landing_surface_authority",
      "cms_overlay_key",
      "fap_web_consumer",
      "frontend_local_copy",
      "fallback_or_lookup_only",
      "sitemap_source_authority",
      "llms_evidence",
      "unknown",
    ]);
    expect(asStringArray(contract.package_readiness_statuses)).toEqual([
      "READY_FOR_SEO_GEO_PACKAGE_PLANNING",
      "READY_WITH_P2_COPY_RISK",
      "NEEDS_SOURCE_AUTHORITY_RECONCILIATION",
      "NEEDS_CLAIM_COPY_FIX",
      "NEEDS_CMS_DRY_RUN_READINESS",
      "BLOCKED_PRIVATE_LEAK",
      "BLOCKED_INDEXABILITY_MISMATCH",
      "BLOCKED_PAYWALL_CONTRADICTION",
      "BLOCKED_UNSUPPORTED_CLAIM",
      "HOLD_RUNTIME_OR_CMS_MUTATION",
    ]);
    expect(asStringArray(contract.risk_vocabulary)).toEqual([
      "P1_COMMERCIAL_FIELD_AUTHORITY_CONFLICT",
      "P2_PAID_UNLOCK_DISABLED_COPY_RISK",
      "P2_FULL_RESULT_CLAIM_AUTHORITY_REVIEW",
      "P2_MBTI_GROWTH_GUIDANCE_AMBIGUITY",
      "P2_IQ_MANUAL_REVIEW_GATE_AND_ANSWER_KEY_BOUNDARY",
      "P2_IQ_EQ_LOOKUP_FORM_AUTHORITY_GAP",
      "P2_SCALE_SPECIFIC_FORBIDDEN_CLAIM_BOUNDARIES",
    ]);
    expect(asStringArray(contract.batch_vocabulary)).toEqual([
      "batch_1_mbti_riasec",
      "batch_2_big5_enneagram",
      "batch_3_iq_eq",
      "cross_hub_support",
    ]);
    expect(asStringArray(contract.output_kinds)).toEqual([
      "package_common_contract",
      "package_readiness_packet",
      "claim_copy_risk_packet",
      "aeo_internal_link_packet",
      "batch_sequence_matrix",
      "package_planning_matrix",
    ]);
  });

  it("keeps hard holds and negative guarantees explicit", () => {
    const contract = readJson(JSON_PATH);
    const guarantees = asRecord(contract.negative_guarantees);

    expect(asStringArray(contract.hard_holds)).toEqual(
      expect.arrayContaining([
        "no_CMS",
        "no_CMS_dry_run_in_this_train",
        "no_CMS_write",
        "no_publish",
        "no_search_submission",
        "no_provider_calls",
        "no_deploy",
        "no_runtime_instrumentation",
        "no_public_Hub_runtime_mutation",
        "no_generated_pages",
        "no_sitemap_llms_schema_hreflang_canonical_noindex_mutation",
        "no_backend_import",
        "no_opportunity_scoring",
        "no_Search_Channel_mutation",
        "no_raw_private_data",
        "no_private_result_URL_access",
        "no_attempt_creation",
        "no_answer_submission",
        "no_payment_order_mutation",
        "no_publishable_content_body",
        "no_FAQPage_JSONLD_mutation",
      ])
    );
    expect(guarantees).toMatchObject({
      cms_dry_run_performed: false,
      cms_write_performed: false,
      cms_publish_performed: false,
      runtime_code_changed: false,
      frontend_public_copy_changed: false,
      backend_api_changed: false,
      search_submission_performed: false,
      provider_call_performed: false,
      deployment_triggered: false,
      sitemap_or_llms_or_schema_mutated: false,
      private_attempt_or_result_accessed: false,
      attempt_created: false,
      answers_submitted: false,
      payment_or_order_mutated: false,
      publishable_content_body_generated: false,
    });
  });

  it("registers exactly the six authorized package train entries", () => {
    const manifest = readText(MANIFEST_PATH);
    const state = readJson(STATE_PATH);
    const stateEntries = [...asRecordArray(state.prs), ...asRecordArray(state.items)];

    for (const id of AUTHORIZED_TRAIN_IDS) {
      expect(manifest).toContain(`id: ${id}`);
      expect(stateEntries.some((entry) => entry.id === id)).toBe(true);
    }

    expect(manifest).not.toContain("id: BIG5-HUB-COMMERCIAL-FIELD-AUTHORITY-FIX-SCAN-01");
    expect(manifest).not.toContain("id: SIX-ASSESSMENT-HUB-PAID-UNLOCK-COPY-FIX-SCAN-01");
    expect(manifest).not.toContain("id: IQ-EQ-HUB-CLAIM-MANUAL-REVIEW-PACKET-01");
    expect(manifest).not.toContain("id: GSC-OPPORTUNITY-READONLY-QUALITY-CHECK-SCAN-01");
  });

  it("keeps markdown aligned with the machine-readable contract", () => {
    const doc = readText(DOC_PATH);

    expect(doc).toContain("Verdict: `READY_FOR_SEO_GEO_PACKAGE_PLANNING`");
    expect(doc).toContain("| Producing agent | `seo_geo_control` |");
    expect(doc).toContain("| Collaborating agent | `assessment_hub` |");
    expect(doc).toContain("The covered URL count is `12`");
    for (const component of EXPECTED_COMPONENTS) {
      expect(doc).toContain(`\`${component}\``);
    }
    expect(doc).toContain("`SIX-HUB-SEO-GEO-PACKAGE-COMMON-CONTRACT-01` has no package-train dependency.");
    expect(doc).toContain("It does not change content ownership, frontend runtime authority, CMS authority");
  });
});
