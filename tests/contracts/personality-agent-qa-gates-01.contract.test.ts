import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const REPORT_PATH = "docs/seo/personality/mbti64-agent-expansion-88-qa-2026-06-21.json";
const SCRIPT_PATH = "scripts/seo/validate-mbti64-agent-expansion-88-qa.mjs";

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8")) as T;
}

type PageResult = {
  target_url: string;
  decision: string;
  blockers: string[];
  warnings: string[];
  gates: Record<string, string>;
};

type QaReport = {
  artifact: string;
  final_decision: string;
  scope: string;
  summary: {
    checked_recommendation_count: number;
    pass_ready_for_cms_draft_count: number;
    blocked_count: number;
    duplicate_signature_group_count: number;
    gsc_evidence_state: string;
  };
  gate_rollup: Record<string, number>;
  page_results: PageResult[];
  blockers: string[];
  warnings: string[];
  recommended_next_task: string;
};

describe("PERSONALITY-AGENT-QA-GATES-01", () => {
  const report = readJson<QaReport>(REPORT_PATH);

  it("marks all 88 MBTI64 expansion recommendations ready for CMS draft", () => {
    expect(report.artifact).toBe("MBTI64-PUBLIC-PROFILE-AGENT-EXPANSION-88-QA-01");
    expect(report.final_decision).toBe("PASS_READY_FOR_CMS_DRAFT");
    expect(report.summary.checked_recommendation_count).toBe(88);
    expect(report.summary.pass_ready_for_cms_draft_count).toBe(88);
    expect(report.summary.blocked_count).toBe(0);
    expect(report.blockers).toEqual([]);
    expect(report.page_results).toHaveLength(88);

    for (const result of report.page_results) {
      expect(result.decision).toBe("PASS_READY_FOR_CMS_DRAFT");
      expect(result.blockers).toEqual([]);
      expect(result.gates).toMatchObject({
        schema_validation: "pass",
        trademark_claim_gate: "pass",
        claim_risk_gate: "pass",
        duplicate_template_gate: "pass",
        private_route_gate: "pass",
        result_page_leakage_gate: "pass",
        seo_projection_gate: "pass",
        bilingual_consistency_gate: "pass",
      });
    }
  });

  it("keeps safety gates at zero failures and records only the expected GSC warning", () => {
    expect(report.summary.duplicate_signature_group_count).toBe(0);
    expect(report.summary.gsc_evidence_state).toBe("GSC_EVIDENCE_PENDING");
    expect(report.warnings).toEqual(["GSC_EVIDENCE_PENDING"]);

    for (const [name, count] of Object.entries(report.gate_rollup)) {
      expect(count, name).toBe(0);
    }
  });

  it("documents the no-write boundary and next CMS draft task", () => {
    expect(report.scope).toContain("No CMS write");
    expect(report.scope).toContain("no publish");
    expect(report.scope).toContain("no index/search release");
    expect(report.scope).toContain("no sitemap/llms mutation");
    expect(report.recommended_next_task).toBe("MBTI64-CMS-PROJECTION-DRAFT-88-01");
    expect(fs.existsSync(path.join(ROOT, SCRIPT_PATH))).toBe(true);
  });
});
