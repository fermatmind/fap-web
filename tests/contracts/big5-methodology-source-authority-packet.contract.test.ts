import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const JSON_PATH = "docs/methodology-trust-science/big5-methodology-source-authority-packet.v1.json";
const DOC_PATH = "docs/methodology-trust-science/big5-methodology-source-authority-packet-2026-06-23.md";
const MANIFEST_PATH = "docs/codex/pr-train.yaml";
const STATE_PATH = "docs/codex/pr-train-state.json";
const SCOPE_HELPER_PATH = "tests/contracts/helpers/currentPrScope.ts";

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

describe("Big Five methodology source authority packet", () => {
  it("declares source-authority planning scope without runtime or CMS authority", () => {
    const packet = readJson(JSON_PATH);
    const scope = asRecord(packet.scope);
    const summary = asRecord(packet.authority_summary);
    const negativeGuarantees = asRecord(packet.negative_guarantees);

    expect(packet.schema_version).toBe("fermatmind.big5_methodology_trust_science.source_authority_packet.v1");
    expect(packet.task_id).toBe("BIG5-METHODOLOGY-SOURCE-AUTHORITY-PACKET-01");
    expect(packet.run_mode).toBe("docs_contracts_only");
    expect(packet.verdict).toBe("SOURCE_AUTHORITY_MAPPED_FOR_PLANNING_ONLY");

    expect(scope).toMatchObject({
      primary_repo: "fap-web",
      secondary_repo: "fap-api",
      secondary_repo_mode: "read_only_evidence_source_only",
      content_generation_authorized: false,
      cms_write_authorized: false,
      runtime_mutation_authorized: false,
      search_or_provider_action_authorized: false,
      private_result_access_authorized: false,
      fap_api_modification_authorized: false,
    });
    expect(summary).toMatchObject({
      big_five_result_page_agent_evidence: "PUBLIC_BOUNDARY_SUPPORT_ONLY",
      methodology_trust_science_public_page_authority: "CMS_BACKEND_CONTENTPAGE_AUTHORITY_REQUIRED",
      frontend_fallback_copy: "NOT_AUTHORITY",
      unreviewed_cms_text: "NOT_AUTHORITY",
      public_big_five_profile_route: "SEPARATE_PUBLIC_PROFILE_AUTHORITY_NOT_PRIVATE_RESULT_PAGE_AUTHORITY",
    });
    expect(negativeGuarantees).toMatchObject({
      methodology_pages_generated: false,
      cms_package_generated: false,
      cms_write_performed: false,
      cms_import_performed: false,
      search_submission_performed: false,
      provider_call_performed: false,
      deployment_triggered: false,
      runtime_changed: false,
      analytics_instrumentation_added: false,
      private_result_data_accessed: false,
      backend_asset_agent_command_run: false,
      fap_api_modified: false,
      schema_or_indexability_changed: false,
    });
  });

  it("consumes the required fap-web and fap-api sources by reference", () => {
    const packet = readJson(JSON_PATH);
    const sources = asRecordArray(packet.consumed_sources);
    const sourceIds = sources.map((source) => String(source.source_id));
    const sourcePaths = sources.map((source) => String(source.path));

    expect(sourceIds).toEqual(
      expect.arrayContaining([
        "big5_result_page_readiness_proposal",
        "big5_result_page_standard_alignment_report",
        "big5_readonly_cleared_handoff",
        "big5_runtime_qa_consumption_packet",
        "big5_analytics_consumption_packet",
        "big5_safety_gate_consumption_packet",
        "fap_web_pr_1352_readonly_cleared_evidence",
        "fap_api_pr_2326_sanitized_evidence",
        "fap_api_pr_2331_sanitized_evidence",
        "fap_api_big5_result_asset_agent_runbook",
        "fap_api_big5_result_asset_agent_gates",
        "fap_api_big5_result_asset_agent_schema",
        "fap_api_big5_result_source_authority_map",
        "fap_web_agent_registry_big5_result_page_agent",
        "content_page_route",
        "content_page_template",
        "content_pages_cms_adapter",
        "science_contentpage_claim_gate",
        "public_big_five_profile_route_contract",
      ])
    );
    expect(sourcePaths).toEqual(
      expect.arrayContaining([
        "docs/result-page-agents/big-five-result-page-agent-readiness.proposal.json",
        "docs/result-page-agents/big-five-result-page-agent-standard-alignment-2026-06-22.md",
        "docs/result-page-agents/big-five-result-page-agent-readonly-cleared-handoff.v1.json",
        "docs/result-page-agents/big5-runtime-qa-consumption-packet.v1.json",
        "docs/result-page-agents/big5-analytics-consumption-packet.v1.json",
        "docs/result-page-agents/big5-safety-gate-consumption-packet.v1.json",
        "backend/docs/big5/result-asset-agent-runbook.md",
        "backend/docs/big5/result-asset-agent-gates.md",
        "backend/docs/big5/result-asset-agent-schema.md",
        "backend/content_assets/big5/result_page_v2/governance/source_authority_v0_1/big5_v2_source_authority_map_v0_1.json",
        "app/(localized)/[locale]/contentPageRoute.tsx",
        "components/content-pages/ContentPageTemplate.tsx",
        "lib/cms/content-pages.ts",
        "docs/claims/science-contentpage-claim-gate-01.md",
        "tests/contracts/personality-big-five-v1-noindex-render.contract.test.ts",
      ])
    );
    expect(sources.find((source) => source.source_id === "fap_api_big5_result_asset_agent_runbook")).toMatchObject({
      repo: "fap-api",
      source_classification: "backend_authority",
      status: "READ_ONLY_REFERENCE_PRESENT",
    });
  });

  it("keeps ContentPage route authority and schema gates explicit", () => {
    const packet = readJson(JSON_PATH);
    const routes = asStringArray(packet.public_contentpage_routes);
    const routeAuthority = asRecordArray(packet.public_route_authority);

    expect(routes).toEqual([
      "/science",
      "/method-boundaries",
      "/item-design-notes",
      "/reliability-validity",
      "/data-privacy",
      "/common-misconceptions",
    ]);
    expect(routeAuthority).toHaveLength(routes.length);

    for (const route of routeAuthority) {
      expect(route.authority).toBe("cms_backend_content_page");
      expect(route.faqpage_gate).toBe("FAQPage_ONLY_AFTER_VISIBLE_CMS_FAQ_GATE");
      expect(route.mutation_authorized).toBe(false);
      expect(asStringArray(route.schema_allowed)).toEqual(["WebPage", "BreadcrumbList"]);
    }
  });

  it("locks share-safety clearance to sanitized read-only evidence", () => {
    const packet = readJson(JSON_PATH);
    const shareSafety = asRecord(packet.sanitized_share_safety_evidence);

    expect(shareSafety).toMatchObject({
      status: "CLEARED_IF_CURRENT_ORIGIN_MAIN_CONFIRMS_FAP_API_PR_2326_AND_2331_SANITIZED_EVIDENCE",
      share_safety_missing_count: 0,
      validation_error_count: 0,
      leak_hit_count: 0,
      clearance_scope: "sanitized_readonly_evidence_only",
      ready_for_runtime: false,
      ready_for_production: false,
      ready_for_cms: false,
      ready_for_search: false,
    });
  });

  it("asserts source boundaries and hard HOLD actions", () => {
    const packet = readJson(JSON_PATH);
    const assertions = asRecordArray(packet.boundary_assertions);
    const assertionIds = assertions.map((assertion) => assertion.id);

    expect(assertionIds).toEqual(
      expect.arrayContaining([
        "result_page_agent_boundary_only",
        "private_payload_not_public_methodology",
        "cms_contentpage_stronger_than_frontend_fallback",
        "frontend_fallback_not_authority",
        "unreviewed_cms_text_not_authority",
        "result_page_source_ledger_not_methodology_ledger",
        "public_profile_separate_from_private_result_page",
        "share_safety_clearance_current_evidence_only",
        "evidence_conflict_sidecar_hold",
        "faqpage_visible_cms_faq_gate",
        "seo_exposure_hold",
        "cms_import_publish_search_hold",
      ])
    );
    expect(asStringArray(packet.hard_hold_actions)).toEqual(
      expect.arrayContaining([
        "no_CMS",
        "no_CMS_import",
        "no_publish",
        "no_search_submission",
        "no_provider_calls",
        "no_deploy",
        "no_runtime_instrumentation",
        "no_ContentPage_rendering_change",
        "no_public_route_change",
        "no_schema_change",
        "no_sitemap_llms_hreflang_canonical_noindex_change",
        "no_backend_asset_agent_command",
        "no_fap_api_mutation",
        "no_raw_private_data",
        "no_private_result_text",
      ])
    );
  });

  it("documents source gaps and non-generation guarantees in markdown", () => {
    const doc = readText(DOC_PATH);

    expect(doc).toContain("Verdict: `SOURCE_AUTHORITY_MAPPED_FOR_PLANNING_ONLY`");
    expect(doc).toContain("Public methodology/trust/science page authority remains CMS/backend ContentPage authority.");
    expect(doc).toContain("They are not automatically a public methodology/trust/science source ledger.");
    expect(doc).toContain("`FAQPage` is not enabled unless a visible CMS FAQ gate passes.");
    expect(doc).toContain("No methodology pages were generated.");
    expect(doc).toContain("No publishable body copy");
  });

  it("registers PR2 manifest, state, and current branch scope files", () => {
    const manifest = readText(MANIFEST_PATH);
    const state = readJson(STATE_PATH);
    const scopeHelper = readText(SCOPE_HELPER_PATH);

    expect(manifest).toContain("id: BIG5-METHODOLOGY-SOURCE-AUTHORITY-PACKET-01");
    expect(manifest).toContain("tests/contracts/helpers/currentPrScope.ts");
    expect(manifest).toContain("docs/codex/pr-train.yaml");

    const prs = Array.isArray(state.prs) ? state.prs.map(asRecord) : [];
    const pr2 = prs.find((pr) => pr.id === "BIG5-METHODOLOGY-SOURCE-AUTHORITY-PACKET-01");
    const pr1 = prs.find((pr) => pr.id === "BIG5-METHODOLOGY-TRUST-SCIENCE-COMMON-CONTRACT-01");

    expect(pr1).toMatchObject({
      status: "merged",
      pr_url: "https://github.com/fermatmind/fap-web/pull/1408",
      merged_at: "2026-06-24T13:04:53Z",
      remote_branch_deleted: true,
      local_cleanup_executed: true,
    });
    expect([
      "implementation_in_progress",
      "local_checks_passed_ready_for_pr",
      "pr_open_checks_pending",
      "ready_to_merge",
    ]).toContain(pr2?.status);
    expect(pr2?.pr_url === null || String(pr2?.pr_url).startsWith("https://github.com/fermatmind/fap-web/pull/")).toBe(
      true
    );
    expect(pr2).toMatchObject({
      merged_at: null,
      remote_branch_deleted: false,
      local_cleanup_executed: false,
    });
    expect(scopeHelper).toContain("BIG5_METHODOLOGY_SOURCE_AUTHORITY_PACKET_01_ALLOWED_FILES");
    expect(scopeHelper).toContain('CURRENT_BRANCH === "codex/big5-methodology-source-authority-packet-01"');
  });
});
