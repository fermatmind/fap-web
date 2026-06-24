import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const CONTRACT_PATH = "docs/assessment-hub/assessment-hub-qa-common-contract.v1.json";
const REPORT_PATH = "docs/assessment-hub/assessment-hub-qa-common-contract-2026-06-24.md";
const SCOPE_HELPER_PATH = "tests/contracts/helpers/currentPrScope.ts";
const TRAIN_PATH = "docs/codex/pr-train.yaml";
const STATE_PATH = "docs/codex/pr-train-state.json";

const AUTHORIZED_TRAIN_IDS = [
  "ASSESSMENT-HUB-QA-COMMON-CONTRACT-01",
  "ASSESSMENT-HUB-SIX-ROUTE-METADATA-PARITY-PACKET-01",
  "ASSESSMENT-HUB-TAKE-FLOW-CTA-PACKET-01",
  "ASSESSMENT-HUB-FREE-FULL-REPORT-CLAIM-PACKET-01",
  "ASSESSMENT-HUB-SOURCE-AUTHORITY-INDEXABILITY-PACKET-01",
  "ASSESSMENT-HUB-QA-READINESS-MATRIX-01",
];

const EXPECTED_ASSERTIONS = [
  "route_metadata_parity",
  "indexability_parity",
  "schema_visible_content_parity",
  "sitemap_membership_parity",
  "llms_membership_parity",
  "llms_full_membership_parity",
  "take_get_availability",
  "take_form_code_alignment",
  "cta_target_alignment",
  "locale_redirect_boundary",
  "free_full_report_claim_boundary",
  "paid_unlock_disabled_copy_boundary",
  "commercial_field_authority_boundary",
  "source_authority_classification",
  "private_data_non_access_boundary",
  "search_submission_hold_boundary",
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

describe("Assessment Hub QA common contract", () => {
  it("declares the producer, consumers, six-scale scope, and read-only mode", () => {
    const contract = readJson(CONTRACT_PATH);
    const scope = asRecord(contract.scope);

    expect(contract.schema_version).toBe("fermatmind.assessment_hub_qa.common_contract.v1");
    expect(contract.task_id).toBe("ASSESSMENT-HUB-QA-COMMON-CONTRACT-01");
    expect(contract.run_mode).toBe("docs_contracts_only");
    expect(contract.verdict).toBe("READY_TO_CONSUME_COMMON_QA_CONTRACT");
    expect(contract.producing_agent).toBe("assessment_hub");
    expect(asStringArray(contract.consumer_agents)).toEqual([
      "runtime_qa",
      "seo_geo_control",
      "cms_draft_package",
      "analytics_gsc_opportunity",
      "claim_privacy_safety_gate",
    ]);
    expect(asStringArray(scope.covered_scale_codes)).toEqual([
      "MBTI",
      "BIG5_OCEAN",
      "RIASEC",
      "IQ_RAVEN",
      "EQ_60",
      "ENNEAGRAM",
    ]);
    expect(scope.covered_route_count).toBe(12);
    expect(scope.private_flow_boundary).toBe("no_attempt_start_no_submit_no_private_result_access");
  });

  it("defines shared assertion, status, source, and issue vocabularies", () => {
    const contract = readJson(CONTRACT_PATH);
    const issueIds = asRecordArray(contract.issue_taxonomy).map((issue) => issue.id);

    expect(asStringArray(contract.assertion_vocabulary)).toEqual(EXPECTED_ASSERTIONS);
    expect(asStringArray(contract.status_vocabulary)).toEqual([
      "PASS",
      "PARTIAL",
      "HOLD",
      "BLOCKED",
      "SPLIT_REQUIRED",
      "REPAIR_REQUIRED",
      "READY_TO_CONSUME",
      "PARKED_PLACEHOLDER",
    ]);
    expect(asStringArray(contract.source_classification_vocabulary)).toEqual(
      expect.arrayContaining([
        "backend_registry_authority",
        "backend_landing_surface_v1_authority",
        "backend_lookup_projection",
        "cms_landing_surface_overlay",
        "fap_web_consumer_contract_not_authority",
        "runtime_readonly_evidence",
        "sitemap_source_evidence",
        "llms_readonly_evidence",
        "manual_review_required",
        "access_required",
      ])
    );
    expect(issueIds).toEqual(
      expect.arrayContaining([
        "P1_COMMERCIAL_FIELD_AUTHORITY_CONFLICT",
        "P2_PAID_UNLOCK_DISABLED_COPY_RISK",
        "P2_EMPTY_FORMS_WITH_RUNTIME_TAKE_ENTRY",
        "P2_MANUAL_REVIEW_REQUIRED_FOR_CERTIFICATE_OR_ANSWER_KEY_CLAIMS",
        "P0_PRIVATE_LEAK",
        "P1_INDEXABILITY_OR_DISCOVERABILITY_DRIFT",
      ])
    );
  });

  it("keeps hard HOLD actions and negative guarantees explicit", () => {
    const contract = readJson(CONTRACT_PATH);
    const guarantees = asRecord(contract.negative_guarantees);

    expect(asStringArray(contract.hard_holds)).toEqual(
      expect.arrayContaining([
        "runtime_code_change",
        "frontend_public_copy_change",
        "CMS_write_import_publish_or_media_upload",
        "search_submission_or_provider_call",
        "sitemap_robots_llms_schema_hreflang_canonical_noindex_redirect_mutation",
        "deployment_or_manual_deploy",
        "private_result_or_attempt_access",
        "POST_start_submit_result_api_call",
        "analytics_backfill_or_runtime_instrumentation",
        "payment_order_or_entitlement_change",
        "fap_api_mutation",
      ])
    );
    expect(guarantees).toMatchObject({
      runtime_code_changed: false,
      frontend_public_copy_changed: false,
      cms_write_performed: false,
      search_submission_performed: false,
      provider_call_performed: false,
      deployment_triggered: false,
      private_attempt_or_result_accessed: false,
      post_start_submit_result_called: false,
      analytics_backfill_or_instrumentation_performed: false,
      sitemap_or_llms_or_schema_mutated: false,
      fap_api_modified: false,
    });
  });

  it("registers exactly the six authorized Assessment Hub QA train entries", () => {
    const manifest = readText(TRAIN_PATH);
    const state = readJson(STATE_PATH);
    const stateEntries = [...asRecordArray(state.prs), ...asRecordArray(state.items)];

    for (const id of AUTHORIZED_TRAIN_IDS) {
      expect(manifest).toContain(`id: ${id}`);
      expect(stateEntries.some((entry) => entry.id === id)).toBe(true);
    }
    expect(manifest).not.toContain("ASSESSMENT-HUB-QA-RUNTIME-FIX-01");
    expect(manifest).not.toContain("ASSESSMENT-HUB-CMS-WRITE-01");
  });

  it("keeps markdown aligned with the machine-readable contract", () => {
    const report = readText(REPORT_PATH);

    expect(report).toContain("Verdict: `READY_TO_CONSUME_COMMON_QA_CONTRACT`");
    expect(report).toContain("| Producing agent | `assessment_hub` |");
    expect(report).toContain("| Consumer agent | `runtime_qa` |");
    expect(report).toContain("| Consumer agent | `seo_geo_control` |");
    expect(report).toContain("The covered route count is `12`");
    for (const assertion of EXPECTED_ASSERTIONS) {
      expect(report).toContain(`\`${assertion}\``);
    }
    expect(report).toContain("If fap-api changes appear necessary, the downstream packet must report `SPLIT_REQUIRED`");
    expect(report).toContain("stop with `BLOCKED_PRIVATE_LEAK`");
  });

  it("keeps current branch scope limited to PR1 docs/contracts and train metadata", () => {
    const scopeHelper = readText(SCOPE_HELPER_PATH);

    expect(scopeHelper).toContain("ASSESSMENT_HUB_QA_COMMON_CONTRACT_01_ALLOWED_FILES");
    expect(scopeHelper).toContain("codex/assessment-hub-qa-common-contract-01");
    expect(scopeHelper).toContain("docs/assessment-hub/assessment-hub-qa-common-contract-2026-06-24.md");
    expect(scopeHelper).toContain("docs/assessment-hub/assessment-hub-qa-common-contract.v1.json");
    expect(scopeHelper).toContain("tests/contracts/assessment-hub-qa-common-contract.contract.test.ts");
    expect(scopeHelper).toContain("docs/codex/pr-train.yaml");
    expect(scopeHelper).toContain("docs/codex/pr-train-state.json");
  });
});
