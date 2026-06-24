import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const REPORT_PATH = "docs/seo/personality/enneagram-public-profile-agent-qa-2026-06-24.json";
const SCRIPT_PATH = "scripts/seo/validate-enneagram-public-profile-agent-qa.mjs";

type PageResult = {
  path: string;
  locale: string;
  entity_type: string;
  decision: string;
  gates: Record<string, "pass" | "fail">;
  blockers: string[];
  warnings: string[];
};

type QaReport = {
  artifact: string;
  status: string;
  final_decision: string;
  summary: {
    checked_recommendation_count: number;
    pass_ready_for_approval_queue_count: number;
    blocked_count: number;
    gsc_evidence_state: string;
    no_wings_instincts_tritype_count: number;
  };
  gate_rollup: Record<string, number>;
  page_results: PageResult[];
  safety_boundary: Record<string, boolean>;
  blockers: string[];
  warnings: string[];
  recommended_next_task: string;
};

function read(file: string): string {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

function readJson<T>(file: string): T {
  return JSON.parse(read(file)) as T;
}

describe("ENNEAGRAM-PUBLIC-PROFILE-AGENT-QA-01", () => {
  const report = readJson<QaReport>(REPORT_PATH);

  it("passes all 26 Enneagram public profile recommendations into approval queue readiness", () => {
    expect(report.artifact).toBe("ENNEAGRAM-PUBLIC-PROFILE-AGENT-QA-01");
    expect(report.status).toBe("pass");
    expect(report.final_decision).toBe("PASS_READY_FOR_APPROVAL_QUEUE");
    expect(report.blockers).toEqual([]);
    expect(report.recommended_next_task).toBe("ENNEAGRAM-AGENT-APPROVAL-QUEUE-INTEGRATION-01");

    expect(report.summary.checked_recommendation_count).toBe(26);
    expect(report.summary.pass_ready_for_approval_queue_count).toBe(26);
    expect(report.summary.blocked_count).toBe(0);
    expect(report.summary.gsc_evidence_state).toBe("GSC_EVIDENCE_PENDING");
    expect(report.summary.no_wings_instincts_tritype_count).toBe(26);
  });

  it("keeps all Enneagram-specific QA gates green", () => {
    expect(Object.values(report.gate_rollup).every((failureCount) => failureCount === 0)).toBe(true);
    expect(report.page_results).toHaveLength(26);

    for (const row of report.page_results) {
      expect(row.decision).toBe("PASS_READY_FOR_APPROVAL_QUEUE");
      expect(row.blockers).toEqual([]);
      expect(Object.values(row.gates).every((gate) => gate === "pass")).toBe(true);
      expect(["hub", "center", "core_type"]).toContain(row.entity_type);
      expect(["en", "zh-CN"]).toContain(row.locale);
      expect(row.warnings).toEqual(["GSC_EVIDENCE_PENDING"]);
    }
  });

  it("does not approve wings, instinctual subtypes, Tritype, private routes, or result leakage", () => {
    const serialized = JSON.stringify(report);
    expect(serialized).not.toMatch(/\b(?:tritype|instinctual_subtype|wing_instinct)\b/i);
    expect(serialized).not.toMatch(
      /\/(?:result|results|orders|pay|payment|history|private|account)(?:\/|\?|$)|(?:token|session|result_id|report_id|order_no)=/i,
    );
    expect(report.gate_rollup.no_wing_instinct_tritype_expansion_gate).toBe(0);
    expect(report.gate_rollup.private_route_gate).toBe(0);
    expect(report.gate_rollup.result_page_leakage_gate).toBe(0);
  });

  it("keeps the QA task artifact-only with no CMS, runtime, search, sitemap, or deploy mutation", () => {
    expect(report.safety_boundary.artifact_only).toBe(true);
    expect(report.safety_boundary.cms_write_attempted).toBe(false);
    expect(report.safety_boundary.cms_live_promotion_attempted).toBe(false);
    expect(report.safety_boundary.frontend_runtime_change_attempted).toBe(false);
    expect(report.safety_boundary.publish_indexability_change_attempted).toBe(false);
    expect(report.safety_boundary.sitemap_llms_mutation_attempted).toBe(false);
    expect(report.safety_boundary.search_queue_mutation_attempted).toBe(false);
    expect(report.safety_boundary.live_search_submit_attempted).toBe(false);
    expect(report.safety_boundary.production_deploy_attempted).toBe(false);
  });

  it("can validate an arbitrary input artifact into temporary output files", () => {
    const artifactDir = fs.mkdtempSync(path.join(os.tmpdir(), "enneagram-agent-qa-"));
    const outputJson = path.join(artifactDir, "qa.json");
    const outputMd = path.join(artifactDir, "qa.md");

    execFileSync(
      "node",
      [
        SCRIPT_PATH,
        "--generated-date=2026-06-24",
        `--output-json=${outputJson}`,
        `--output-md=${outputMd}`,
      ],
      { cwd: ROOT, encoding: "utf8" },
    );

    const generated = JSON.parse(fs.readFileSync(outputJson, "utf8")) as QaReport;
    expect(generated.final_decision).toBe("PASS_READY_FOR_APPROVAL_QUEUE");
    expect(generated.summary.checked_recommendation_count).toBe(26);
    expect(fs.existsSync(outputMd)).toBe(true);
  });
});
