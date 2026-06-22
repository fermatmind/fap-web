import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const PROPOSAL_PATH = "docs/result-page-agents/enneagram-result-page-agent-readiness.proposal.json";
const REPORT_PATH = "docs/result-page-agents/enneagram-result-page-agent-standard-alignment-2026-06-22.md";
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

describe("Enneagram result-page agent standard alignment", () => {
  it("keeps the readiness proposal aligned with the frozen required result-page agent fields", () => {
    const template = readJson(TEMPLATE_PATH);
    const proposal = readJson(PROPOSAL_PATH);
    const requiredFields = asStringArray(template.required_fields_per_scale);
    const templateScale = findScale(template, "enneagram_result_page");

    expect(requiredFields.length).toBeGreaterThan(0);
    for (const field of requiredFields) {
      expect(proposal, field).toHaveProperty(field);
    }

    expect(proposal.schema_version).toBe("fermatmind.result_page_agent_readiness.v1");
    expect(proposal.run_mode).toBe("proposal_only");
    expect(proposal.verdict).toBe("ENNEAGRAM_RESULT_PAGE_AGENT_STANDARD_ALIGNED");
    expect(proposal.agent_id).toBe("enneagram_result_page");
    expect(proposal.scale_code).toBe("ENNEAGRAM");
    expect(proposal.canonical_test_slug).toBe("enneagram-personality-test-nine-types");
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
    expect(serialized).not.toMatch(/fc144 is more accurate/i);
    expect(serialized).not.toMatch(/you are this type/i);
    expect(serialized).not.toMatch(/salary prediction/i);
  });

  it("maps the existing Enneagram backend readiness and ops agents plus the fap-web renderer", () => {
    const proposal = readJson(PROPOSAL_PATH);
    const report = readText(REPORT_PATH);
    const standard = readText(STANDARD_PATH);

    expect(standard).toContain("| ENNEAGRAM | `enneagram_result_page`");
    expect(proposal.result_route).toBe("/[locale]/result/[id]");
    expect(proposal.report_api).toBe("/api/v0.3/attempts/{attempt_id}/report");
    expect(proposal.report_access_api).toBe("/api/v0.3/attempts/{attempt_id}/report-access");
    expect(String(proposal.pdf_behavior)).toContain("private no-store");
    expect(String(proposal.share_behavior)).toContain("public-summary");

    const renderer = JSON.stringify(proposal.frontend_renderer);
    expect(renderer).toContain("app/(localized)/[locale]/(app)/result/[id]/ResultClient.tsx");
    expect(renderer).toContain("components/result/RichResultReport.tsx");
    expect(renderer).toContain("components/result/enneagram/EnneagramResultShell.tsx");
    expect(renderer).toContain("lib/enneagram/resultAssembler.ts");
    expect(renderer).toContain("hasEnneagramProjection");

    expect(asStringArray(proposal.backend_authority)).toEqual(
      expect.arrayContaining([
        "fap-api:backend/app/Console/Commands/EnneagramResultPageAgentReadinessCommand.php",
        "fap-api:backend/app/Console/Commands/EnneagramResultPageOpsRunnerCommand.php",
        "fap-api:backend/app/Services/Enneagram/Assets/Agent/EnneagramResultPageAgentReadiness.php",
        "fap-api:backend/app/Services/Enneagram/Assets/Agent/EnneagramResultPageOpsAgentRunOrchestrator.php",
        "fap-api:backend/docs/enneagram/result-page-agent-runbook.md",
        "fap-api:backend/docs/enneagram/result-page-agent-gates.md",
        "fap-api:backend/docs/enneagram/result-page-agent-schema.md",
        "fap-api:backend/content_assets/enneagram/result_page/source_ledger/source_ledger.json",
      ])
    );

    expect(report).toContain("EnneagramResultPageAgentReadinessCommand");
    expect(report).toContain("EnneagramResultPageOpsRunnerCommand");
    expect(report).toContain("EnneagramResultPageAgentReadiness.php");
    expect(report).toContain("EnneagramResultPageOpsAgentRunOrchestrator.php");
    expect(report).toContain("EnneagramResultShell.tsx");
    expect(report).toContain("No `SPLIT_REQUIRED` for this task");
  });

  it("captures the shared-standard alignment table and keeps production actions blocked", () => {
    const proposal = readJson(PROPOSAL_PATH);
    const report = readText(REPORT_PATH);
    const alignment = asRecord(proposal.alignment_status);

    expect(alignment.overall).toBe("ENNEAGRAM_RESULT_PAGE_AGENT_STANDARD_ALIGNED");
    expect(asStringArray(alignment.doc_match)).toEqual(
      expect.arrayContaining([
        "required_fields",
        "route_api_access_pdf_share_renderer_backend_authority_map",
        "existing_backend_readiness_and_ops_agent_evidence",
        "backend_runbook_schema_gate_documents",
        "frontend_renderer_contracts",
        "negative_guarantees",
        "source_classification",
      ])
    );
    expect(asStringArray(alignment.doc_needs_update)).toEqual([]);
    expect(asStringArray(alignment.evidence_missing)).toEqual(
      expect.arrayContaining([
        "future generated/result-page-agents/enneagram/<run_id>/readiness.json was not generated in this docs/contracts task",
        "backend readiness and ops commands were not executed because they write artifacts by design",
        "production manual gate approval packet was not requested or executed",
      ])
    );
    expect(asStringArray(alignment.blocked)).toEqual([]);

    expect(report).toContain("| Required fields | `DOC_MATCH`");
    expect(report).toContain("| Backend runbook/schema/gates | `DOC_MATCH`");
    expect(report).toContain("| Generated readiness artifact | `EVIDENCE_MISSING`");
    expect(report).toContain("| Production manual gate | `BLOCKED`");
    expect(report).toContain("| Runtime/CMS/search/provider actions | `BLOCKED`");
  });

  it("keeps forbidden actions and stop conditions aligned with Enneagram result-page risk", () => {
    const proposal = readJson(PROPOSAL_PATH);
    const forbidden = asStringArray(proposal.forbidden_actions);
    const stopConditions = asStringArray(proposal.stop_conditions);
    const serialized = JSON.stringify(proposal);

    expect(forbidden).toEqual(
      expect.arrayContaining([
        "candidate_to_production_without_manual_gate",
        "production_candidate_activation",
        "runtime_registry_switch",
        "bulk_content_generation",
        "raw_private_result_access",
        "private_result_indexing",
        "fixed_type_certainty_claim",
        "e105_fc144_score_comparison_claim",
        "diagnosis_therapy_treatment_claim",
        "hiring_screen_or_employment_suitability_claim",
        "raw_score_vector_public_leak",
        "pdf_or_share_private_boundary_violation",
      ])
    );
    expect(stopConditions).toEqual(
      expect.arrayContaining([
        "manual_gate_missing",
        "candidate_payload_unverified",
        "candidate_manifest_hash_mismatch",
        "payload_count_not_630",
        "metadata_leakage_hits",
        "forbidden_claim_hits",
        "fc144_boundary_violation",
        "private_boundary_failure",
      ])
    );
    expect(serialized).toContain("EnneagramResultPageAgentReadiness");
    expect(serialized).toContain("EnneagramResultPageOpsAgentRunOrchestrator");
    expect(serialized).toContain("enneagram-pdf-surface");
    expect(serialized).toContain("enneagram-share-surface");
  });

  it("keeps the report as fap-web docs/contracts alignment without fap-api mutation", () => {
    const report = readText(REPORT_PATH);

    expect(report).toContain("docs/contracts alignment and read-only validation");
    expect(report).toContain("It did not run the backend readiness or ops-agent commands");
    expect(report).toContain("no fap-api edits");
    expect(report).toContain("fap-api first: run or update Enneagram readiness/ops artifact generation");
    expect(report).toContain("fap-web second: consume the sanitized artifact path");
    expect(report).toContain("runtime code changed: no");
    expect(report).toContain("private result data accessed: none");
  });
});
