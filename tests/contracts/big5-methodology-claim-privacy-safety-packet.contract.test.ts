import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const JSON_PATH = "docs/methodology-trust-science/big5-methodology-claim-privacy-safety-packet.v1.json";
const DOC_PATH = "docs/methodology-trust-science/big5-methodology-claim-privacy-safety-packet-2026-06-23.md";
const STATE_PATH = "docs/codex/pr-train-state.json";

function readJson(relativePath: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8")) as Record<string, unknown>;
}

function readText(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asRecordArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.map(asRecord) : [];
}

describe("Big Five methodology claim/privacy/safety packet", () => {
  it("declares docs-only safety planning scope and negative guarantees", () => {
    const packet = readJson(JSON_PATH);
    const scope = asRecord(packet.scope);
    const negativeGuarantees = asRecord(packet.negative_guarantees);

    expect(packet.schema_version).toBe("fermatmind.big5_methodology_trust_science.claim_privacy_safety_packet.v1");
    expect(packet.task_id).toBe("BIG5-METHODOLOGY-CLAIM-PRIVACY-SAFETY-PACKET-01");
    expect(packet.run_mode).toBe("docs_contracts_only");
    expect(packet.verdict).toBe("SAFETY_PACKET_READY_FOR_PLANNING_ONLY");
    expect(scope).toMatchObject({
      primary_repo: "fap-web",
      secondary_repo: "fap-api",
      secondary_repo_mode: "read_only_evidence_source_only",
      content_generation_authorized: false,
      cms_write_authorized: false,
      runtime_mutation_authorized: false,
      search_or_provider_action_authorized: false,
      private_result_access_authorized: false,
      analytics_instrumentation_authorized: false,
      fap_api_modification_authorized: false,
    });
    expect(negativeGuarantees).toMatchObject({
      methodology_pages_generated: false,
      publishable_article_body_generated: false,
      cms_package_generated: false,
      cms_write_performed: false,
      cms_import_performed: false,
      search_submission_performed: false,
      provider_call_performed: false,
      deployment_triggered: false,
      runtime_changed: false,
      analytics_instrumentation_added: false,
      event_emission_performed: false,
      production_metric_backfill_performed: false,
      opportunity_scoring_performed: false,
      private_result_data_accessed: false,
      backend_asset_agent_command_run: false,
      fap_api_modified: false,
      schema_or_indexability_changed: false,
    });
  });

  it("consumes Safety Gate, Runtime QA, Analytics, and source-authority evidence by reference", () => {
    const packet = readJson(JSON_PATH);
    const sources = asRecordArray(packet.consumed_sources);
    const sourceIds = sources.map((source) => String(source.source_id));
    const sourcePaths = sources.map((source) => String(source.path));

    expect(sourceIds).toEqual(
      expect.arrayContaining([
        "big5_methodology_common_contract",
        "big5_methodology_source_authority_packet",
        "big5_safety_gate_consumption_packet",
        "big5_runtime_qa_consumption_packet",
        "big5_analytics_consumption_packet",
        "big5_readonly_cleared_handoff",
      ])
    );
    expect(sourcePaths).toEqual(
      expect.arrayContaining([
        "docs/methodology-trust-science/big5-methodology-trust-science-common-contract.v1.json",
        "docs/methodology-trust-science/big5-methodology-source-authority-packet.v1.json",
        "docs/result-page-agents/big5-safety-gate-consumption-packet.v1.json",
        "docs/result-page-agents/big5-runtime-qa-consumption-packet.v1.json",
        "docs/result-page-agents/big5-analytics-consumption-packet.v1.json",
        "docs/result-page-agents/big-five-result-page-agent-readonly-cleared-handoff.v1.json",
      ])
    );
    expect(sources.find((source) => source.source_id === "big5_safety_gate_consumption_packet")).toMatchObject({
      source_classification: "safety_gate_artifact",
      status: "READY_TO_CONSUME_BY_SAFETY_GATE",
    });
  });

  it("locks allowed claims, forbidden claims, and private field exclusions", () => {
    const packet = readJson(JSON_PATH);
    const claimPolicy = asRecord(packet.claim_policy);
    const privacyPolicy = asRecord(packet.privacy_policy);

    expect(asStringArray(claimPolicy.allowed_claim_classes)).toEqual(
      expect.arrayContaining([
        "self_understanding",
        "personality_reflection",
        "method_boundary",
        "non_diagnostic_note",
        "public_summary",
        "source_supported_measurement_caveat",
      ])
    );
    expect(asStringArray(claimPolicy.forbidden_claims)).toEqual(
      expect.arrayContaining([
        "raw OCEAN score claim",
        "score vector exposure claim",
        "percentile guarantee",
        "official 32-type claim",
        "fixed-type claim",
        "unsupported psychometric superiority claim",
        "diagnosis",
        "hiring screen",
        "salary prediction",
        "performance prediction",
        "success prediction",
        "life outcome guarantee",
      ])
    );
    expect(asStringArray(privacyPolicy.forbidden_private_fields)).toEqual(
      expect.arrayContaining([
        "raw_ocean_scores",
        "score_vector",
        "percentile",
        "attempt_id",
        "user_id",
        "report_token",
        "private_url",
        "private_result_payload",
        "full_report_body_text",
        "selector_trace",
        "source_refs",
        "qa_trace",
        "access_token",
        "session_id",
      ])
    );
    expect(privacyPolicy.share_surface_boundary).toBe("PUBLIC_SUMMARY_ONLY");
    expect(privacyPolicy.sanitized_share_safety_status).toBe("CLEARED_READONLY_ONLY");
  });

  it("requires safety gates for claim, privacy, runtime QA, analytics, and CMS route exposure", () => {
    const packet = readJson(JSON_PATH);
    const matrix = asRecordArray(packet.safety_gate_matrix);
    const ids = matrix.map((gate) => String(gate.id));

    expect(ids).toEqual(
      expect.arrayContaining([
        "unsupported_claim_gate",
        "private_result_boundary_gate",
        "runtime_qa_leak_boundary_gate",
        "analytics_payload_privacy_gate",
        "source_authority_gate",
        "share_public_summary_gate",
        "cms_contentpage_gate",
      ])
    );
    expect(matrix.find((gate) => gate.id === "cms_contentpage_gate")).toMatchObject({
      status: "HOLD",
      source: "big5_methodology_source_authority_packet",
    });
    expect(matrix.find((gate) => gate.id === "analytics_payload_privacy_gate")).toMatchObject({
      status: "PASS_FOR_PLANNING",
      source: "big5_analytics_consumption_packet",
    });
  });

  it("keeps all public methodology routes held for CMS review", () => {
    const packet = readJson(JSON_PATH);
    const routes = asStringArray(packet.public_contentpage_routes);
    const routePolicy = asRecordArray(packet.route_safety_policy);

    expect(routes).toEqual([
      "/science",
      "/method-boundaries",
      "/item-design-notes",
      "/reliability-validity",
      "/data-privacy",
      "/common-misconceptions",
    ]);
    expect(routePolicy).toHaveLength(routes.length);

    for (const route of routePolicy) {
      expect(route.content_authority).toBe("cms_backend_content_page");
      expect(route.faqpage_gate).toBe("FAQPage_ONLY_AFTER_VISIBLE_CMS_FAQ_GATE");
      expect(route.status).toBe("HOLD_FOR_CMS_REVIEW");
    }
  });

  it("documents hard holds and non-generation guarantees in markdown", () => {
    const packet = readJson(JSON_PATH);
    const doc = readText(DOC_PATH);

    expect(asStringArray(packet.hard_hold_actions)).toEqual(
      expect.arrayContaining([
        "no_CMS",
        "no_CMS_import",
        "no_publish",
        "no_search_submission",
        "no_provider_calls",
        "no_deploy",
        "no_runtime_instrumentation",
        "no_generated_pages",
        "no_schema_change",
        "no_event_emission",
        "no_production_metric_backfill",
        "no_opportunity_scoring",
        "no_backend_asset_agent_command",
        "no_fap_api_mutation",
        "no_raw_private_data",
        "no_private_result_text",
      ])
    );
    expect(doc).toContain("Verdict: `SAFETY_PACKET_READY_FOR_PLANNING_ONLY`");
    expect(doc).toContain("Share surfaces remain `PUBLIC_SUMMARY_ONLY`.");
    expect(doc).toContain("The six public routes remain CMS/backend ContentPage-authoritative");
    expect(doc).toContain("No methodology pages were generated.");
    expect(doc).toContain("No publishable body copy");
  });

  it("registers PR3 state as an in-flight docs/contracts-only PR", () => {
    const state = readJson(STATE_PATH);
    const prs = Array.isArray(state.prs) ? state.prs.map(asRecord) : [];
    const pr3 = prs.find((pr) => pr.id === "BIG5-METHODOLOGY-CLAIM-PRIVACY-SAFETY-PACKET-01");

    expect([
      "implementation_in_progress",
      "local_checks_passed_ready_for_pr",
      "pr_open_checks_pending",
      "ready_to_merge",
    ]).toContain(pr3?.status);
    expect(pr3?.pr_url === null || String(pr3?.pr_url).startsWith("https://github.com/fermatmind/fap-web/pull/")).toBe(
      true
    );
    expect(pr3).toMatchObject({
      merged_at: null,
      remote_branch_deleted: false,
      local_cleanup_executed: false,
    });
  });
});
