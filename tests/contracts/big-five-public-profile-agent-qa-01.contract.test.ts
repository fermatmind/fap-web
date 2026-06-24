import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isBigFivePublicProfileAgentQa01AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const PILOT_JSON = "docs/seo/personality/big-five-public-profile-agent-pilot-2026-06-24.json";
const QA_JSON = "docs/seo/personality/big-five-public-profile-agent-qa-2026-06-24.json";
const QA_MD = "docs/seo/personality/big-five-public-profile-agent-qa-2026-06-24.md";

type EvaluationRow = {
  recommendation_id: string;
  target_url: string;
  locale: string;
  framework: string;
  entity_type: string;
  code: string;
  failed_gates: string[];
  qa_status: string;
  eligible_for_approval_queue: boolean;
  eligible_for_cms_draft_path: boolean;
  gates: Array<{ id: string; passed: boolean }>;
};

function readJson(relativePath: string) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function changedFiles(): string[] {
  const files = new Set<string>();
  for (const args of [
    ["diff", "--name-only", "HEAD"],
    ["diff", "--cached", "--name-only"],
    ["diff", "--name-only", "origin/main...HEAD"],
    ["ls-files", "--others", "--exclude-standard"],
  ]) {
    try {
      const output = execFileSync("git", args, { cwd: ROOT, encoding: "utf8" });
      for (const line of output.split("\n")) {
        if (line.trim()) files.add(line.trim());
      }
    } catch {
      // Local and CI refs can differ; use every available diff source.
    }
  }
  return [...files].sort();
}

describe("BIG-FIVE-PUBLIC-PROFILE-AGENT-QA-01 contract", () => {
  it("generates artifact-only QA for all Big Five pilot recommendation rows", () => {
    const stdout = execFileSync("node", ["scripts/seo/validate-big-five-public-profile-agent-qa.mjs"], {
      cwd: ROOT,
      encoding: "utf8",
    });
    const result = JSON.parse(stdout);

    expect(result).toMatchObject({
      ok: true,
      output_json: QA_JSON,
      output_md: QA_MD,
      decision: "PASS_READY_FOR_APPROVAL_QUEUE",
      rows_evaluated: 34,
      rows_passed: 34,
      rows_failed: 0,
    });
  });

  it("evaluates the same 34 bilingual URL rows produced by the pilot artifact", () => {
    const pilot = readJson(PILOT_JSON);
    const qa = readJson(QA_JSON);
    const pilotIds = new Set(pilot.recommendations.map((row: { recommendation_id: string }) => row.recommendation_id));
    const qaIds = new Set(qa.evaluations.map((row: EvaluationRow) => row.recommendation_id));

    expect(qa.artifact).toBe("BIG-FIVE-PUBLIC-PROFILE-AGENT-QA-01");
    expect(qa.summary.rows_evaluated).toBe(34);
    expect(qa.summary.logical_entity_count).toBe(17);
    expect(qa.summary.locale_counts).toEqual({ en: 17, "zh-CN": 17 });
    expect(qa.evaluations).toHaveLength(34);
    expect(qaIds).toEqual(pilotIds);
  });

  it("passes every required safety, private-route, bilingual, duplicate-risk, and SEO projection gate", () => {
    const qa = readJson(QA_JSON);
    const expectedGates = [
      "schema_validation",
      "dimensional_model_gate",
      "no_official_big_five_32_ocean_type_gate",
      "no_high_low_good_bad_framing_gate",
      "claim_safety_gate",
      "private_route_gate",
      "result_page_leakage_gate",
      "duplicate_template_risk_gate",
      "bilingual_consistency_gate",
      "seo_projection_gate",
    ];

    for (const row of qa.evaluations as EvaluationRow[]) {
      expect(row.framework).toBe("big_five");
      expect(row.target_url).toMatch(/^https:\/\/fermatmind\.com\/(en|zh)\/personality\/big-five/);
      expect(row.failed_gates).toEqual([]);
      expect(row.qa_status).toBe("pass");
      expect(row.eligible_for_approval_queue).toBe(true);
      expect(row.eligible_for_cms_draft_path).toBe(true);
      expect(row.gates.map((gate) => gate.id)).toEqual(expectedGates);
      expect(row.gates.every((gate) => gate.passed)).toBe(true);
    }

    for (const gate of expectedGates) {
      expect(qa.summary.gate_totals[gate]).toEqual({ passed: 34, failed: 0 });
    }
  });

  it("blocks failed rows from the next CMS draft path if a later QA rule fails", () => {
    const qa = readJson(QA_JSON);

    expect(qa.failed_rows).toEqual([]);
    expect(qa.summary.failed_rows_blocked_from_next_cms_draft_path).toBe(true);
    expect(JSON.stringify(qa)).not.toMatch(/\/(private|results?|orders?|pay|payment|history|account)(\/|\b|\?)/i);
    expect(JSON.stringify(qa)).not.toMatch(/\b(token|session|result_id|order_id|payment_id)=/i);
    expect(qa.negative_guarantees).toMatchObject({
      cms_write: false,
      frontend_runtime_change: false,
      publish: false,
      indexability_change: false,
      sitemap_mutation: false,
      llms_mutation: false,
      search_queue: false,
      search_submission: false,
    });
  });

  it("keeps current PR changed files inside the approved QA scope", () => {
    const files = changedFiles();

    if (files.length === 0) {
      expect(files).toEqual([]);
      return;
    }

    expect(files.every((file) => isBigFivePublicProfileAgentQa01AllowedFile(file)), files.join("\n")).toBe(true);
  });
});
