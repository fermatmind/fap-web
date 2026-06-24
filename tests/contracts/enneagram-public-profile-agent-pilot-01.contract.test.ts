import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const REPORT_PATH = "docs/seo/personality/enneagram-public-profile-agent-pilot-2026-06-24.json";
const CSV_PATH = "docs/seo/personality/enneagram-public-profile-agent-pilot-2026-06-24.csv";
const SCRIPT_PATH = "scripts/seo/run-personality-agent-auto-runner.mjs";

type Recommendation = {
  target_url: string;
  path: string;
  framework: string;
  locale: string;
  entity_type: string;
  code: string;
  observed_signal: string;
  recommendations: {
    title: string;
    description: string;
    h1: string;
    quick_answer: string;
    faq: Array<{ question: string; answer: string }>;
    internal_links: Array<{ target_url: string; safe_public_route: boolean }>;
    differentiation_notes: string;
  };
  qa_required: string[];
  blocked_reason: string | null;
};

type Report = {
  artifact: string;
  framework: string;
  status: string;
  final_decision: string;
  summary: {
    recommendation_count: number;
    locale_counts: Record<string, number>;
    entity_type_counts: Record<string, number>;
    gsc_evidence_pending_count: number;
    blocked_count: number;
  };
  scope_lock: {
    allowed_entity_types: string[];
    forbidden_entity_types: string[];
    no_54_wing_instinct_pages: boolean;
    no_private_result_text: boolean;
    no_frontend_editorial_fallback: boolean;
  };
  recommendations: Recommendation[];
  safety_boundary: Record<string, boolean>;
  blockers: string[];
  recommended_next_task: string;
};

function read(file: string): string {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

function readJson<T>(file: string): T {
  return JSON.parse(read(file)) as T;
}

describe("ENNEAGRAM-PUBLIC-PROFILE-AGENT-PILOT-01", () => {
  const report = readJson<Report>(REPORT_PATH);

  it("extends the personality public profile runner to Enneagram with exactly 26 artifact-only rows", () => {
    expect(report.artifact).toBe("ENNEAGRAM-PUBLIC-PROFILE-AGENT-PILOT-01");
    expect(report.framework).toBe("enneagram");
    expect(report.status).toBe("pass");
    expect(report.final_decision).toBe("PASS_READY_FOR_ENNEAGRAM_QA");
    expect(report.blockers).toEqual([]);
    expect(report.recommended_next_task).toBe("ENNEAGRAM-PUBLIC-PROFILE-AGENT-QA-01");

    expect(report.summary.recommendation_count).toBe(26);
    expect(report.summary.locale_counts).toEqual({ en: 13, "zh-CN": 13 });
    expect(report.summary.entity_type_counts).toEqual({ hub: 2, center: 6, core_type: 18 });
    expect(report.summary.gsc_evidence_pending_count).toBe(26);
    expect(report.summary.blocked_count).toBe(0);
  });

  it("locks the first Enneagram public profile scope to hub, centers, and core types", () => {
    expect(report.scope_lock.allowed_entity_types).toEqual(["hub", "center", "core_type"]);
    expect(report.scope_lock.forbidden_entity_types).toEqual(["wing", "instinctual_subtype", "tritype", "wing_instinct"]);
    expect(report.scope_lock.no_54_wing_instinct_pages).toBe(true);
    expect(report.scope_lock.no_private_result_text).toBe(true);
    expect(report.scope_lock.no_frontend_editorial_fallback).toBe(true);

    const entityTypes = new Set(report.recommendations.map((row) => row.entity_type));
    expect([...entityTypes].sort()).toEqual(["center", "core_type", "hub"]);
    expect(report.recommendations.some((row) => /wing|instinct|tritype/i.test(row.entity_type))).toBe(false);
  });

  it("emits schema-shaped draft recommendations that still require QA before CMS", () => {
    for (const row of report.recommendations) {
      expect(row.framework).toBe("enneagram");
      expect(row.target_url).toBe(`https://fermatmind.com${row.path}`);
      expect(["en", "zh-CN"]).toContain(row.locale);
      expect(["hub", "center", "core_type"]).toContain(row.entity_type);
      expect(row.observed_signal).toBe("GSC_EVIDENCE_PENDING");
      expect(row.recommendations.title).toBeTruthy();
      expect(row.recommendations.description).toBeTruthy();
      expect(row.recommendations.h1).toBeTruthy();
      expect(row.recommendations.quick_answer).toBeTruthy();
      expect(row.recommendations.faq).toHaveLength(2);
      expect(row.recommendations.internal_links.every((link) => link.safe_public_route)).toBe(true);
      expect(row.qa_required).toContain("no_clinical_diagnosis_gate");
      expect(row.qa_required).toContain("no_wing_instinct_tritype_expansion_gate");
      expect(row.blocked_reason).toBeNull();
    }
  });

  it("keeps CMS, frontend runtime, sitemap/llms, and search release surfaces untouched", () => {
    expect(report.safety_boundary.artifact_only).toBe(true);
    expect(report.safety_boundary.cms_write_attempted).toBe(false);
    expect(report.safety_boundary.cms_live_promotion_attempted).toBe(false);
    expect(report.safety_boundary.frontend_runtime_change_attempted).toBe(false);
    expect(report.safety_boundary.search_queue_mutation_attempted).toBe(false);
    expect(report.safety_boundary.live_search_submit_attempted).toBe(false);
    expect(report.safety_boundary.sitemap_llms_mutation_attempted).toBe(false);
    expect(report.safety_boundary.publish_indexability_change_attempted).toBe(false);
    expect(report.safety_boundary.production_deploy_attempted).toBe(false);

    const serialized = JSON.stringify(report);
    expect(serialized).not.toMatch(
      /\/(?:result|results|orders|pay|payment|history|private|account)(?:\/|\?|$)|(?:token|session|result_id|report_id|order_no)=/i,
    );
  });

  it("emits a compact CSV with one row per recommendation", () => {
    const csv = read(CSV_PATH).trim().split("\n");
    expect(csv).toHaveLength(27);
    expect(csv[0]).toBe(
      [
        "target_url",
        "path",
        "locale",
        "entity_type",
        "code",
        "observed_signal",
        "qa_required_count",
        "blocked_reason",
        "recommended_next_task",
      ].join(","),
    );
  });

  it("can generate the Enneagram artifact to arbitrary output paths without touching repo files", () => {
    const artifactDir = fs.mkdtempSync(path.join(os.tmpdir(), "enneagram-agent-pilot-"));
    const outputJson = path.join(artifactDir, "pilot.json");
    const outputMd = path.join(artifactDir, "pilot.md");
    const outputCsv = path.join(artifactDir, "pilot.csv");

    execFileSync(
      "node",
      [
        SCRIPT_PATH,
        "--framework=enneagram",
        "--generated-date=2026-06-24",
        `--output-json=${outputJson}`,
        `--output-md=${outputMd}`,
        `--output-csv=${outputCsv}`,
      ],
      { cwd: ROOT, encoding: "utf8" },
    );

    const generated = JSON.parse(fs.readFileSync(outputJson, "utf8")) as Report;
    expect(generated.summary.recommendation_count).toBe(26);
    expect(generated.final_decision).toBe("PASS_READY_FOR_ENNEAGRAM_QA");
    expect(fs.existsSync(outputMd)).toBe(true);
    expect(fs.existsSync(outputCsv)).toBe(true);
  });
});
