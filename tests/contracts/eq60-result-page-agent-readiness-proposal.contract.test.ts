import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const PROPOSAL_PATH = "docs/result-page-agents/eq60-result-page-agent-readiness.proposal.json";
const SCAN_PATH = "docs/result-page-agents/eq60-result-page-agent-scaffold-scan-2026-06-22.md";
const TEMPLATE_PATH = "docs/result-page-agents/six-scale-result-agent-readiness.template.json";

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

describe("EQ60 result-page agent readiness proposal", () => {
  it("keeps the proposal aligned with the frozen required result-page agent fields", () => {
    const template = readJson(TEMPLATE_PATH);
    const proposal = readJson(PROPOSAL_PATH);
    const requiredFields = asStringArray(template.required_fields_per_scale);
    const templateScale = findScale(template, "eq60_result_page");

    expect(requiredFields.length).toBeGreaterThan(0);
    for (const field of requiredFields) {
      expect(proposal, field).toHaveProperty(field);
    }

    expect(proposal.schema_version).toBe("fermatmind.result_page_agent_readiness.v1");
    expect(proposal.run_mode).toBe("proposal_only");
    expect(proposal.verdict).toBe("EQ60_RESULT_PAGE_AGENT_SCAFFOLD_READY");
    expect(proposal.agent_id).toBe("eq60_result_page");
    expect(proposal.scale_code).toBe("EQ_60");
    expect(proposal.canonical_test_slug).toBe("eq-test-emotional-intelligence-assessment");
    expect(proposal.current_readiness).toBe("missing_agent_stack");

    expect(proposal).toMatchObject({
      agent_id: templateScale.agent_id,
      scale_code: templateScale.scale_code,
      canonical_test_slug: templateScale.canonical_test_slug,
    });
  });

  it("documents only sanitized evidence and preserves all hard negative guarantees", () => {
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
    expect(serialized).not.toMatch(/raw_private_attempt/i);
    expect(serialized).not.toMatch(/production_db_write/i);
    expect(serialized).not.toMatch(/relationship success guaranteed/i);
    expect(serialized).not.toMatch(/employment guaranteed/i);
  });

  it("maps the requested EQ60 route, APIs, renderer, backend authority, and missing gates", () => {
    const proposal = readJson(PROPOSAL_PATH);
    const scan = readText(SCAN_PATH);

    expect(proposal.result_route).toBe("/[locale]/result/[id]");
    expect(proposal.report_api).toBe("/api/v0.3/attempts/{attempt_id}/report");
    expect(proposal.report_access_api).toBe("/api/v0.3/attempts/{attempt_id}/report-access");
    expect(String(proposal.pdf_behavior)).toContain("backend_report_pdf_response_must_remain_private_no_store");
    expect(String(proposal.share_behavior)).toContain("current EQ V5 frontend share button remains disabled");

    const renderer = JSON.stringify(proposal.frontend_renderer);
    expect(renderer).toContain("app/(localized)/[locale]/(app)/result/[id]/ResultClient.tsx");
    expect(renderer).toContain("components/result/eq/EQResultV5.tsx");
    expect(renderer).toContain("components/result/eq/utils.ts");
    expect(renderer).toContain("components/result/RichResultReport.tsx");
    expect(renderer).toContain("isEqV5ReportResponse");

    expect(asStringArray(proposal.backend_authority)).toEqual(
      expect.arrayContaining([
        "fap-api:backend/app/Services/Report/Eq60ReportComposer.php",
        "fap-api:backend/app/Services/Report/EqIntegratedReportComposer.php",
        "fap-api:backend/app/Services/Content/Eq60PackLoader.php",
        "fap-api:backend/app/Services/Psychometrics/Eq60/NormGroupResolver.php",
        "fap-api:backend/content_packs/EQ_60/v1/compiled/manifest.json",
        "fap-api:backend/content_packs/EQ_60/v1/compiled/report.compiled.json",
      ])
    );
    expect(asStringArray(proposal.missing_runbook_schema_gates)).toEqual(
      expect.arrayContaining([
        "dedicated_eq60_result_page_agent_runbook",
        "result_page_agent_readiness_json_schema_or_validator",
        "eq60_specific_readiness_contract_gate",
        "eq_claim_privacy_safety_gate",
        "eq_pdf_private_boundary_gate",
        "eq_share_surface_boundary_gate",
        "eq_norm_authority_gate",
      ])
    );

    expect(scan).toContain("EQ60_RESULT_PAGE_AGENT_SCAFFOLD_READY");
    expect(scan).toContain("runtime code changed: no");
    expect(scan).toContain("private result data accessed: none");
  });

  it("captures EQ-specific claim, norm, PDF, and share safety gates", () => {
    const proposal = readJson(PROPOSAL_PATH);
    const gates = asStringArray(proposal.eq_specific_safety_gates);
    const serialized = JSON.stringify(proposal);

    expect(gates).toEqual(
      expect.arrayContaining([
        "no_diagnostic_claim",
        "no_clinical_or_medical_claim",
        "no_relationship_guarantee",
        "no_employment_guarantee",
        "no_life_outcome_guarantee",
        "no_raw_private_result_access",
        "pdf_share_private_boundary",
      ])
    );
    expect(asStringArray(proposal.stop_conditions)).toEqual(
      expect.arrayContaining([
        "diagnostic_claim_required",
        "clinical_or_medical_claim_required",
        "relationship_guarantee_required",
        "employment_guarantee_required",
        "life_outcome_guarantee_required",
        "pdf_or_share_private_boundary_not_proven",
        "norm_authority_missing",
      ])
    );
    expect(asStringArray(proposal.forbidden_actions)).toEqual(
      expect.arrayContaining([
        "eq_diagnostic_guarantee",
        "clinical_or_medical_claim",
        "relationship_guarantee",
        "employment_guarantee",
        "life_outcome_guarantee",
        "raw_private_result_access",
        "pdf_or_share_private_boundary_violation",
      ])
    );
    expect(serialized).toContain("EqIntegratedReportComposer");
    expect(serialized).toContain("NormGroupResolver");
    expect(serialized).toContain("Eq60PdfDeliveryTest");
  });

  it("keeps the scan as a PR-train-ready scaffold without manifest or state mutation", () => {
    const scan = readText(SCAN_PATH);

    expect(scan).toContain("EQ60-RESULT-PAGE-AGENT-RUNBOOK-SCHEMA-GATES-01");
    expect(scan).toContain("Proposed PR train id");
    expect(scan).toContain("Manifest/state entries requiring authorization");
    expect(scan).toContain("Do not implement runtime code");
    expect(scan).toContain("Do not implement runtime code, CMS writes, publish, search submissions, provider calls, private result access");
  });
});
