import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const PROPOSAL_PATH = "docs/result-page-agents/mbti-result-page-agent-readiness.proposal.json";
const SCAN_PATH = "docs/result-page-agents/mbti-result-page-agent-scaffold-scan-2026-06-22.md";
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

describe("MBTI result-page agent readiness proposal", () => {
  it("keeps the proposal aligned with the frozen required result-page agent fields", () => {
    const template = readJson(TEMPLATE_PATH);
    const proposal = readJson(PROPOSAL_PATH);
    const requiredFields = asStringArray(template.required_fields_per_scale);

    expect(requiredFields.length).toBeGreaterThan(0);
    for (const field of requiredFields) {
      expect(proposal, field).toHaveProperty(field);
    }

    expect(proposal.schema_version).toBe("fermatmind.result_page_agent_readiness.v1");
    expect(proposal.run_mode).toBe("proposal_only");
    expect(proposal.verdict).toBe("MBTI_RESULT_PAGE_AGENT_SCAFFOLD_READY");
    expect(proposal.agent_id).toBe("mbti_result_page");
    expect(proposal.scale_code).toBe("MBTI");
    expect(proposal.canonical_test_slug).toBe("mbti-personality-test-16-personality-types");
    expect(proposal.current_readiness).toBe("missing_agent_stack");
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
  });

  it("maps the requested MBTI route, APIs, renderer, backend authority, and missing gates", () => {
    const proposal = readJson(PROPOSAL_PATH);
    const scan = readText(SCAN_PATH);

    expect(proposal.result_route).toBe("/[locale]/result/[id]");
    expect(proposal.report_api).toBe("/api/v0.3/attempts/{attempt_id}/report");
    expect(proposal.report_access_api).toBe("/api/v0.3/attempts/{attempt_id}/report-access");

    expect(JSON.stringify(proposal.frontend_renderer)).toContain("components/result/mbti/MbtiResultShell.tsx");
    expect(asStringArray(proposal.backend_authority)).toEqual(
      expect.arrayContaining([
        "fap-api:backend/app/Services/Report/ReportComposer.php",
        "fap-api:backend/app/Services/Mbti/Adapters/MbtiReportAuthoritySourceAdapter.php",
        "fap-api:backend/app/Services/Mbti/MbtiPublicProjectionService.php",
      ])
    );
    expect(asStringArray(proposal.missing_runbook_schema_gates)).toEqual(
      expect.arrayContaining([
        "dedicated_mbti_result_page_agent_runbook",
        "result_page_agent_readiness_json_schema_or_validator",
        "mbti_specific_readiness_contract_gate",
      ])
    );

    expect(scan).toContain("MBTI_RESULT_PAGE_AGENT_SCAFFOLD_READY");
    expect(scan).toContain("runtime code changed: no");
    expect(scan).toContain("private result data accessed: none");
  });
});
