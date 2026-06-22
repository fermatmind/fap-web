import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const PROPOSAL_PATH = "docs/result-page-agents/iq-raven-result-page-agent-readiness.proposal.json";
const SCAN_PATH = "docs/result-page-agents/iq-raven-result-page-agent-scaffold-scan-2026-06-22.md";
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

describe("IQ Raven result-page agent readiness proposal", () => {
  it("keeps the proposal aligned with the frozen required result-page agent fields", () => {
    const template = readJson(TEMPLATE_PATH);
    const proposal = readJson(PROPOSAL_PATH);
    const requiredFields = asStringArray(template.required_fields_per_scale);
    const templateScale = findScale(template, "iq_raven_result_page");

    expect(requiredFields.length).toBeGreaterThan(0);
    for (const field of requiredFields) {
      expect(proposal, field).toHaveProperty(field);
    }

    expect(proposal.schema_version).toBe("fermatmind.result_page_agent_readiness.v1");
    expect(proposal.run_mode).toBe("proposal_only");
    expect(proposal.verdict).toBe("IQ_RAVEN_RESULT_PAGE_AGENT_SCAFFOLD_READY");
    expect(proposal.agent_id).toBe("iq_raven_result_page");
    expect(proposal.scale_code).toBe("IQ_RAVEN");
    expect(proposal.canonical_scale_code).toBe("IQ_INTELLIGENCE_QUOTIENT");
    expect(proposal.legacy_input_alias).toBe("IQ_RAVEN");
    expect(proposal.canonical_test_slug).toBe("iq-test-intelligence-quotient-assessment");
    expect(proposal.current_readiness).toBe("missing_agent_stack");

    expect(proposal).toMatchObject({
      agent_id: templateScale.agent_id,
      scale_code: templateScale.scale_code,
      canonical_scale_code: templateScale.canonical_scale_code,
      legacy_input_alias: templateScale.legacy_input_alias,
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
    expect(serialized).not.toMatch(/correct answer is/i);
  });

  it("maps the requested IQ route, APIs, renderer, backend authority, and missing gates", () => {
    const proposal = readJson(PROPOSAL_PATH);
    const scan = readText(SCAN_PATH);

    expect(proposal.result_route).toBe("/[locale]/result/[id]");
    expect(proposal.report_api).toBe("/api/v0.3/attempts/{attempt_id}/report");
    expect(proposal.report_access_api).toBe("/api/v0.3/attempts/{attempt_id}/report-access");

    const renderer = JSON.stringify(proposal.frontend_renderer);
    expect(renderer).toContain("app/(localized)/[locale]/(app)/result/[id]/ResultClient.tsx");
    expect(renderer).toContain("components/result/iq/IqResultShell.tsx");
    expect(renderer).toContain("components/result/iq/IqReportModule.tsx");
    expect(renderer).toContain("lib/iq/result.ts");

    expect(asStringArray(proposal.backend_authority)).toEqual(
      expect.arrayContaining([
        "fap-api:backend/app/Services/Report/IqReportBuilder.php",
        "fap-api:backend/app/Services/Iq/IqNormAuthorityContract.php",
        "fap-api:backend/app/Services/Iq/IqResultPayloadRedactor.php",
        "fap-api:backend/docs/iq/iq-production-norm-authority.md",
        "fap-api:backend/docs/iq/iq-beta-30-original-bank-spec.md",
        "fap-api:backend/docs/iq/iq-beta-50-bank-spec.md",
      ])
    );
    expect(asStringArray(proposal.missing_runbook_schema_gates)).toEqual(
      expect.arrayContaining([
        "dedicated_iq_raven_result_page_agent_runbook",
        "result_page_agent_readiness_json_schema_or_validator",
        "iq_raven_specific_readiness_contract_gate",
        "iq_claim_privacy_safety_gate",
        "iq_pdf_certificate_boundary_gate",
      ])
    );

    expect(scan).toContain("IQ_RAVEN_RESULT_PAGE_AGENT_SCAFFOLD_READY");
    expect(scan).toContain("runtime code changed: no");
    expect(scan).toContain("private result data accessed: none");
  });

  it("captures the IQ-specific answer-key, claim, and PDF/certificate safety gates", () => {
    const proposal = readJson(PROPOSAL_PATH);
    const gates = asStringArray(proposal.iq_specific_safety_gates);
    const serialized = JSON.stringify(proposal);

    expect(gates).toEqual(
      expect.arrayContaining([
        "no_answer_key_leak",
        "no_correct_answer_leak",
        "no_diagnostic_claim",
        "no_admissions_guarantee",
        "no_career_outcome_prediction",
        "pdf_certificate_boundary",
      ])
    );
    expect(asStringArray(proposal.stop_conditions)).toEqual(
      expect.arrayContaining([
        "answer_key_or_correct_answer_access_required",
        "norm_authority_missing_or_not_claim_eligible",
        "diagnostic_claim_required",
      ])
    );
    expect(asStringArray(proposal.forbidden_actions)).toEqual(
      expect.arrayContaining([
        "answer_key_or_correct_answer_publication",
        "norm_claim_without_authority",
        "admissions_guarantee",
        "career_outcome_prediction",
      ])
    );
    expect(serialized).toContain("iq_pro_pdf_payload_is_contract_defined_not_implemented");
  });
});
