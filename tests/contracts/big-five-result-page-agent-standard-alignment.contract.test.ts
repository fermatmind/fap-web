import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const PROPOSAL_PATH = "docs/result-page-agents/big-five-result-page-agent-readiness.proposal.json";
const REPORT_PATH = "docs/result-page-agents/big-five-result-page-agent-standard-alignment-2026-06-22.md";
const TEMPLATE_PATH = "docs/result-page-agents/six-scale-result-agent-readiness.template.json";
const STANDARD_PATH = "docs/result-page-agents/RESULT_PAGE_AGENT_PLATFORM_STANDARD.md";

function readJson(relativePath: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8")) as Record<string, unknown>;
}

function readText(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function findScale(template: Record<string, unknown>, agentId: string): Record<string, unknown> {
  const scales = Array.isArray(template.scales) ? template.scales : [];
  const match = scales.find((scale) => asRecord(scale).agent_id === agentId);
  return asRecord(match);
}

describe("Big Five result-page agent standard alignment", () => {
  it("keeps the readiness proposal aligned with the frozen required result-page agent fields", () => {
    const template = readJson(TEMPLATE_PATH);
    const proposal = readJson(PROPOSAL_PATH);
    const requiredFields = asStringArray(template.required_fields_per_scale);
    const templateScale = findScale(template, "big_five_result_page");

    expect(requiredFields.length).toBeGreaterThan(0);
    for (const field of requiredFields) {
      expect(proposal, field).toHaveProperty(field);
    }

    expect(proposal.schema_version).toBe("fermatmind.result_page_agent_readiness.v1");
    expect(proposal.run_mode).toBe("proposal_only");
    expect(proposal.verdict).toBe("BIG5_RESULT_PAGE_AGENT_STANDARD_ALIGNED");
    expect(proposal.agent_id).toBe("big_five_result_page");
    expect(proposal.scale_code).toBe("BIG5_OCEAN");
    expect(proposal.canonical_test_slug).toBe("big-five-personality-test-ocean-model");
    expect(proposal.previous_readiness_from_frozen_standard).toBe("existing_agent_stack_align_required");
    expect(proposal.current_readiness).toBe("ready_readonly");

    expect(proposal).toMatchObject({
      agent_id: templateScale.agent_id,
      scale_code: templateScale.scale_code,
      canonical_test_slug: templateScale.canonical_test_slug,
    });
  });

  it("preserves all hard negative guarantees and keeps the proposal sanitized", () => {
    const template = readJson(TEMPLATE_PATH);
    const proposal = readJson(PROPOSAL_PATH);
    const templateGuarantees = new Set(asStringArray(template.negative_guarantees));
    const proposalGuarantees = new Set(asStringArray(proposal.negative_guarantees));

    for (const guarantee of templateGuarantees) {
      expect(proposalGuarantees.has(guarantee), guarantee).toBe(true);
    }

    expect(proposal.safety_confirmation).toMatchObject({
      runtime_code_changed: "no",
      cms_writes: "none",
      publish: "none",
      search_submissions: "none",
      provider_calls: "none",
      private_result_data_accessed: "none",
      payment_order_mutation: "none",
      env_changes: "none",
    });

    const serialized = JSON.stringify(proposal);
    expect(serialized).not.toMatch(/access_token=/i);
    expect(serialized).not.toMatch(/result_lookup_token/i);
    expect(serialized).not.toMatch(/raw_private_attempt/i);
    expect(serialized).not.toMatch(/production_db_write/i);
    expect(serialized).not.toMatch(/private-attempt-sample/i);
    expect(serialized).not.toMatch(/employment guaranteed/i);
  });

  it("maps the existing Big Five backend asset agent, artifacts, and fap-web renderer", () => {
    const proposal = readJson(PROPOSAL_PATH);
    const report = readText(REPORT_PATH);
    const standard = readText(STANDARD_PATH);

    expect(standard).toContain("| BIG5_OCEAN | `big_five_result_page`");
    expect(proposal.result_route).toBe("/[locale]/result/[id]");
    expect(proposal.report_api).toBe("/api/v0.3/attempts/{attempt_id}/report");
    expect(proposal.report_access_api).toBe("/api/v0.3/attempts/{attempt_id}/report-access");
    expect(String(proposal.pdf_behavior)).toContain("private no-store");
    expect(String(proposal.share_behavior)).toContain("share-safe summary only");

    const renderer = JSON.stringify(proposal.frontend_renderer);
    expect(renderer).toContain("app/(localized)/[locale]/(app)/result/[id]/ResultClient.tsx");
    expect(renderer).toContain("components/result/RichResultReport.tsx");
    expect(renderer).toContain("components/result/big5/Big5ResultPageV2Shell.tsx");
    expect(renderer).toContain("lib/big5/resultPageV2.ts");
    expect(renderer).toContain("getBig5ResultPageV2Payload");

    expect(asStringArray(proposal.backend_authority)).toEqual(
      expect.arrayContaining([
        "fap-api:backend/app/Console/Commands/BigFiveResultPageV2AssetAgentAuditCommand.php",
        "fap-api:backend/app/Services/BigFive/ResultPageV2/AssetAgent/BigFiveResultPageV2AssetAgent.php",
        "fap-api:backend/docs/big5/result-asset-agent-runbook.md",
        "fap-api:backend/docs/big5/result-asset-agent-gates.md",
        "fap-api:backend/docs/big5/result-asset-agent-schema.md",
        "fap-api:backend/artifacts/big5_result_page_v2_agent/20260622T122842Z/ops_report_summary.json",
        "fap-api:PR #2326 BIG5-RESULT-PAGE-AGENT-GENERATED-READINESS-ARTIFACT-01 generated sanitized readiness.json from strict audit evidence",
      ])
    );

    expect(report).toContain("BigFiveResultPageV2AssetAgentAuditCommand");
    expect(report).toContain("BigFiveResultPageV2AssetAgent.php");
    expect(report).toContain("Big5ResultPageV2Shell.tsx");
    expect(report).toContain("share_safety_missing_count:0");
    expect(report).toContain("share_safe_reading_mode_count:13");
    expect(report).toContain("No `SPLIT_REQUIRED` for this task");
  });

  it("captures the shared-standard alignment table and keeps pilot or production actions blocked", () => {
    const proposal = readJson(PROPOSAL_PATH);
    const report = readText(REPORT_PATH);
    const alignment = asRecord(proposal.alignment_status);

    expect(alignment.overall).toBe("BIG5_RESULT_PAGE_AGENT_STANDARD_ALIGNED");
    expect(asStringArray(alignment.doc_match)).toEqual(
      expect.arrayContaining([
        "required_fields",
        "route_api_access_pdf_share_renderer_backend_authority_map",
        "existing_backend_asset_agent_evidence",
        "generated_backend_readiness_artifact_evidence",
        "frontend_renderer_contracts",
        "negative_guarantees",
        "source_classification",
      ])
    );
    expect(asStringArray(alignment.doc_needs_update)).toEqual([]);
    expect(asStringArray(alignment.evidence_missing)).toEqual([]);
    expect(asStringArray(alignment.blocked)).toEqual([]);

    expect(report).toContain("| Required fields | `DOC_MATCH`");
    expect(report).toContain("| Share public/private boundary | `DOC_MATCH_CLOSED`");
    expect(report).toContain("| Generated readiness artifact | `DOC_MATCH_REFRESHED`");
    expect(report).toContain("| Runtime/CMS/search/provider actions | `BLOCKED`");
  });

  it("keeps forbidden actions and stop conditions aligned with Big Five result-page risk", () => {
    const proposal = readJson(PROPOSAL_PATH);
    const forbidden = asStringArray(proposal.forbidden_actions);
    const stopConditions = asStringArray(proposal.stop_conditions);
    const serialized = JSON.stringify(proposal);

    expect(forbidden).toEqual(
      expect.arrayContaining([
        "auto_merge_live_asset_without_approval",
        "production_import",
        "raw_private_result_access",
        "private_result_indexing",
        "unsupported_psychometric_claim",
        "diagnosis_therapy_treatment_claim",
        "hiring_screen_or_employment_suitability_claim",
        "raw_score_vector_percentile_public_leak",
        "pdf_or_share_private_boundary_violation",
      ])
    );
    expect(stopConditions).toEqual(
      expect.arrayContaining([
        "asset_agent_output_not_schema_valid",
        "private_boundary_failure",
        "auto_merge_or_live_pilot_requested_without_approval",
        "share_safety_regression_blocks_pilot_or_production_claim",
      ])
    );
    expect(serialized).toContain("BigFiveResultPageV2AssetAgent");
    expect(serialized).toContain("big5-pdf-rendered-qa");
    expect(serialized).toContain("big5-share-card-rendered-qa");
  });

  it("keeps the report as fap-web docs/contracts alignment without fap-api mutation", () => {
    const report = readText(REPORT_PATH);

    expect(report).toContain("docs/contracts alignment refreshed from sanitized backend readiness evidence");
    expect(report).toContain("It did not run the backend asset-agent command in fap-web");
    expect(report).toContain("fap-api PR #2326");
    expect(report).toContain("fap-api first: run `BIG5-FREE-FULL-REPORT-RUNTIME-QA-READINESS-01`");
    expect(report).toContain("fap-web second, only if needed");
    expect(report).toContain("runtime code changed: no");
    expect(report).toContain("private result data accessed: none");
  });
});
