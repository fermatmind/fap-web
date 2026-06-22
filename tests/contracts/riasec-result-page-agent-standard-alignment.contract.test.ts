import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const PROPOSAL_PATH = "docs/result-page-agents/riasec-result-page-agent-readiness.proposal.json";
const REPORT_PATH = "docs/result-page-agents/riasec-result-page-agent-standard-alignment-2026-06-23.md";
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

describe("RIASEC result-page agent standard alignment", () => {
  it("keeps the readiness proposal aligned with the frozen required result-page agent fields", () => {
    const template = readJson(TEMPLATE_PATH);
    const proposal = readJson(PROPOSAL_PATH);
    const requiredFields = asStringArray(template.required_fields_per_scale);
    const templateScale = findScale(template, "riasec_result_page");

    expect(requiredFields.length).toBeGreaterThan(0);
    for (const field of requiredFields) {
      expect(proposal, field).toHaveProperty(field);
    }

    expect(proposal.schema_version).toBe("fermatmind.result_page_agent_readiness.v1");
    expect(proposal.run_mode).toBe("proposal_only");
    expect(proposal.verdict).toBe("RIASEC_RESULT_PAGE_AGENT_STANDARD_ALIGNED");
    expect(proposal.agent_id).toBe("riasec_result_page");
    expect(proposal.scale_code).toBe("RIASEC");
    expect(proposal.canonical_test_slug).toBe("holland-career-interest-test-riasec");
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
    expect(serialized).not.toMatch(/admissions guaranteed/i);
    expect(serialized).not.toMatch(/employment guaranteed/i);
  });

  it("maps the existing RIASEC backend asset and ops agents plus the fap-web renderer", () => {
    const proposal = readJson(PROPOSAL_PATH);
    const report = readText(REPORT_PATH);
    const standard = readText(STANDARD_PATH);

    expect(standard).toContain("| RIASEC | `riasec_result_page`");
    expect(proposal.result_route).toBe("/[locale]/result/[id]");
    expect(proposal.report_api).toBe("/api/v0.3/attempts/{attempt_id}/report");
    expect(proposal.report_access_api).toBe("/api/v0.3/attempts/{attempt_id}/report-access");
    expect(String(proposal.pdf_behavior)).toContain("private no-store");
    expect(String(proposal.share_behavior)).toContain("public-safe");

    const renderer = JSON.stringify(proposal.frontend_renderer);
    expect(renderer).toContain("app/(localized)/[locale]/(app)/result/[id]/ResultClient.tsx");
    expect(renderer).toContain("components/result/RichResultReport.tsx");
    expect(renderer).toContain("components/result/riasec/RiasecResultShell.tsx");
    expect(renderer).toContain("lib/riasec/resultAssembler.ts");
    expect(renderer).toContain("hasRiasecProjection");
    expect(renderer).toContain("riasec_public_projection_v2");

    expect(asStringArray(proposal.backend_authority)).toEqual(
      expect.arrayContaining([
        "fap-api:backend/app/Console/Commands/RiasecResultPageAssetAgentAuditCommand.php",
        "fap-api:backend/app/Console/Commands/RiasecResultPageOpsRunnerCommand.php",
        "fap-api:backend/app/Services/Riasec/AssetAgent/RiasecResultPageAssetAgent.php",
        "fap-api:backend/app/Services/Riasec/Ops/RiasecResultPageOpsAgentRunOrchestrator.php",
        "fap-api:backend/docs/riasec/result-asset-agent-runbook.md",
        "fap-api:backend/docs/riasec/result-asset-agent-gates.md",
        "fap-api:backend/docs/riasec/result-asset-agent-schema.md",
        "fap-api:backend/docs/riasec/result-ops-agent-runbook.md",
        "fap-api:backend/docs/riasec/result-ops-agent-permission-model.md",
        "fap-api:backend/app/Services/Riasec/RiasecPublicProjectionService.php",
        "fap-api:backend/app/Services/Report/RiasecReportComposer.php",
        "fap-api:backend/app/Services/Riasec/RiasecContentRegistrySlotContract.php",
      ])
    );

    expect(report).toContain("RiasecResultPageAssetAgentAuditCommand");
    expect(report).toContain("RiasecResultPageOpsRunnerCommand");
    expect(report).toContain("RiasecResultPageAssetAgent.php");
    expect(report).toContain("RiasecResultPageOpsAgentRunOrchestrator.php");
    expect(report).toContain("RiasecResultShell.tsx");
    expect(report).toContain("No `SPLIT_REQUIRED` for this task");
  });

  it("keeps the one-flagship/two-form RIASEC rule explicit and bounded", () => {
    const proposal = readJson(PROPOSAL_PATH);
    const report = readText(REPORT_PATH);
    const oneFlagship = asRecord(proposal.one_flagship_two_forms);

    expect(oneFlagship.canonical_landing).toBe("holland-career-interest-test-riasec");
    expect(asStringArray(oneFlagship.supported_forms)).toEqual(["riasec_60", "riasec_140"]);
    expect(oneFlagship.parallel_stack_introduced).toBe(false);
    expect(oneFlagship.legacy_36q_surface_allowed).toBe(false);
    expect(asStringArray(proposal.forbidden_actions)).toEqual(
      expect.arrayContaining([
        "parallel_riasec_stack_creation",
        "legacy_36q_local_product_surface_revival",
        "cross_form_raw_score_delta_claim",
      ])
    );

    expect(report).toContain("Canonical landing remains `holland-career-interest-test-riasec`");
    expect(report).toContain("Supported forms remain bounded to `riasec_60` and `riasec_140`");
    expect(report).toContain("Cross-form raw score delta remains blocked");
  });

  it("keeps career-bridge boundaries from becoming deterministic recommendations", () => {
    const proposal = readJson(PROPOSAL_PATH);
    const report = readText(REPORT_PATH);
    const careerBridge = asRecord(proposal.career_bridge_boundaries);
    const forbidden = asStringArray(proposal.forbidden_actions);
    const serialized = JSON.stringify(proposal);

    expect(careerBridge).toMatchObject({
      deterministic_career_recommendation: false,
      admissions_guarantee: false,
      hiring_prediction: false,
      salary_prediction: false,
      performance_prediction: false,
      raw_score_to_career_recommendation: false,
      occupation_examples_policy: "examples_only_not_recommendations",
    });
    expect(forbidden).toEqual(
      expect.arrayContaining([
        "raw_score_to_career_recommendation",
        "deterministic_career_recommendation",
        "admissions_guarantee_claim",
        "hiring_screen_or_employment_suitability_claim",
        "salary_prediction_claim",
        "performance_prediction_claim",
      ])
    );
    expect(serialized).toContain("occupation_examples_policy");
    expect(serialized).toContain("examples_only_not_recommendations");
    expect(report).toContain("occupation examples policy: examples-only, not recommendations");
    expect(report).toContain("not a complete recommender runtime or employment suitability decision");
  });

  it("captures the shared-standard alignment table and keeps production actions blocked", () => {
    const proposal = readJson(PROPOSAL_PATH);
    const report = readText(REPORT_PATH);
    const alignment = asRecord(proposal.alignment_status);

    expect(alignment.overall).toBe("RIASEC_RESULT_PAGE_AGENT_STANDARD_ALIGNED");
    expect(asStringArray(alignment.doc_match)).toEqual(
      expect.arrayContaining([
        "required_fields",
        "route_api_access_pdf_share_renderer_backend_authority_map",
        "existing_backend_asset_and_ops_agent_evidence",
        "backend_runbook_schema_gate_documents",
        "frontend_renderer_contracts",
        "one_flagship_two_forms",
        "career_bridge_claim_boundaries",
        "negative_guarantees",
        "source_classification",
      ])
    );
    expect(asStringArray(alignment.doc_needs_update)).toEqual([]);
    expect(asStringArray(alignment.evidence_missing)).toEqual(
      expect.arrayContaining([
        "future generated/result-page-agents/riasec/<run_id>/readiness.json was not generated in this docs/contracts task",
        "backend asset and ops commands were not executed because they write artifacts by design",
        "production manual gate approval packet was not requested or executed",
      ])
    );
    expect(asStringArray(alignment.blocked)).toEqual([]);

    expect(report).toContain("| Required fields | `DOC_MATCH`");
    expect(report).toContain("| One-flagship/two-form rule | `DOC_MATCH`");
    expect(report).toContain("| Career-bridge boundaries | `DOC_MATCH`");
    expect(report).toContain("| Generated readiness artifact | `EVIDENCE_MISSING`");
    expect(report).toContain("| Production manual gate | `BLOCKED`");
    expect(report).toContain("| Runtime/CMS/search/provider actions | `BLOCKED`");
  });

  it("keeps the report as fap-web docs/contracts alignment without fap-api mutation", () => {
    const report = readText(REPORT_PATH);

    expect(report).toContain("docs/contracts alignment and read-only validation");
    expect(report).toContain("It did not run the backend asset-agent or ops-agent commands");
    expect(report).toContain("no fap-api edits");
    expect(report).toContain("fap-api first: run or update RIASEC asset/ops artifact generation");
    expect(report).toContain("fap-web second: consume the sanitized artifact path");
    expect(report).toContain("runtime code changed: no");
    expect(report).toContain("private result data accessed: none");
  });
});
