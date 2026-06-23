import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const PACKET_PATH = "docs/career-graph/riasec-career-graph-candidate-cluster-packet.v1.json";
const REPORT_PATH = "docs/career-graph/riasec-career-graph-candidate-cluster-packet-2026-06-23.md";
const SCOPE_HELPER_PATH = "tests/contracts/helpers/currentPrScope.ts";

const REQUIRED_FAMILIES = [
  "gaokao_major_choice_riasec",
  "riasec_six_types_university_major_exploration",
  "riasec_work_activity_patterns",
  "riasec_vs_mbti_career_choice_division",
  "riasec_vs_big_five_work_style_exploration",
  "up_to_30_career_major_pilot_candidates",
  "riasec_hub_to_article_and_career_internal_link_candidates",
];

const REQUIRED_FIELDS = [
  "candidate_id",
  "cluster_family",
  "target_intent",
  "locale",
  "page_type",
  "source_evidence_required",
  "backend_authority_requirement",
  "review_ledger_requirement",
  "cms_dry_run_suitability",
  "risk_level",
  "allowed_claim_style",
  "forbidden_claim_style",
  "examples_only_statement",
  "internal_link_candidates",
  "GPT55_review_required",
  "Safety_Gate_review_required",
  "SEO_GEO_review_required",
  "HOLD_actions",
];

function readJson(relativePath: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8")) as Record<string, unknown>;
}

function readText(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asRecordArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.map(asRecord) : [];
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

describe("RIASEC Career Graph candidate cluster packet", () => {
  it("declares planning-only readiness and merged dependencies", () => {
    const packet = readJson(PACKET_PATH);
    const deps = asRecordArray(packet.dependencies);

    expect(packet.schema_version).toBe("fermatmind.riasec_career_graph_candidate_cluster_packet.v1");
    expect(packet.task_id).toBe("RIASEC-CAREER-GRAPH-CANDIDATE-CLUSTER-PACKET-01");
    expect(packet.verdict).toBe("PLANNING_ONLY");
    expect(deps.map((dep) => dep.status)).toEqual(["MERGED", "MERGED"]);
    expect(deps.map((dep) => dep.pr_url)).toEqual([
      "https://github.com/fermatmind/fap-web/pull/1380",
      "https://github.com/fermatmind/fap-web/pull/1381",
    ]);
  });

  it("covers all required cluster families with 10 to 30 candidates", () => {
    const packet = readJson(PACKET_PATH);
    const candidates = asRecordArray(packet.candidate_clusters);
    const families = new Set(candidates.map((candidate) => String(candidate.cluster_family)));

    expect(asStringArray(packet.cluster_families)).toEqual(REQUIRED_FAMILIES);
    expect(candidates.length).toBeGreaterThanOrEqual(10);
    expect(candidates.length).toBeLessThanOrEqual(30);
    for (const family of REQUIRED_FAMILIES) {
      expect(families.has(family), family).toBe(true);
    }
  });

  it("requires every candidate cluster field and review gate", () => {
    const packet = readJson(PACKET_PATH);
    const candidates = asRecordArray(packet.candidate_clusters);

    for (const candidate of candidates) {
      for (const field of REQUIRED_FIELDS) {
        expect(candidate).toHaveProperty(field);
      }
      expect(asStringArray(candidate.source_evidence_required).length).toBeGreaterThan(0);
      expect(asStringArray(candidate.internal_link_candidates).length).toBeGreaterThan(0);
      expect(asStringArray(candidate.HOLD_actions).length).toBeGreaterThan(0);
      expect(candidate.GPT55_review_required).toBe(true);
      expect(candidate.Safety_Gate_review_required).toBe(true);
      expect(String(candidate.examples_only_statement)).toMatch(/examples|prompts|candidates|research|navigation/i);
    }
  });

  it("keeps high-risk gaokao and pilot candidates gated", () => {
    const packet = readJson(PACKET_PATH);
    const candidates = asRecordArray(packet.candidate_clusters);
    const gaokao = candidates.find((candidate) => candidate.cluster_family === "gaokao_major_choice_riasec");
    const pilotCandidates = candidates.filter((candidate) => candidate.cluster_family === "up_to_30_career_major_pilot_candidates");

    expect(gaokao?.risk_level).toBe("high");
    expect(gaokao?.SEO_GEO_review_required).toBe(true);
    expect(asStringArray(gaokao?.HOLD_actions)).toEqual(expect.arrayContaining(["cms_write", "publish", "generated_page"]));
    for (const candidate of pilotCandidates) {
      expect(candidate.risk_level).toBe("high");
      expect(String(candidate.backend_authority_requirement)).toContain("backend");
      expect(String(candidate.review_ledger_requirement)).toContain("required");
      expect(asStringArray(candidate.HOLD_actions)).toEqual(expect.arrayContaining(["cms_write", "generated_page"]));
    }
  });

  it("blocks publishable body, CMS payload, metadata, generated pages, deterministic recommendation, rankings, and outcome predictions", () => {
    const packet = readJson(PACKET_PATH);
    const guarantees = asRecord(packet.negative_guarantees);

    expect(asStringArray(packet.forbidden_payload_classes)).toEqual(
      expect.arrayContaining([
        "publishable_article_body",
        "cms_payload",
        "final_title_meta_to_publish",
        "generated_career_page_content",
        "deterministic_recommendation",
        "occupation_ranking_as_truth",
        "salary_prediction",
        "admissions_prediction",
        "hiring_prediction",
        "success_prediction",
        "performance_prediction",
        "ability_prediction",
      ])
    );
    expect(guarantees.publishable_body_included).toBe(false);
    expect(guarantees.cms_payload_included).toBe(false);
    expect(guarantees.generated_page_content_included).toBe(false);
    expect(guarantees.deterministic_recommendation_included).toBe(false);
  });

  it("keeps markdown aligned with planning-only boundaries", () => {
    const report = readText(REPORT_PATH);

    expect(report).toContain("Verdict: `PLANNING_ONLY`");
    expect(report).toContain("10 planning candidates");
    expect(report).toContain("High-risk candidates");
    expect(report).toContain("CMS write");
    expect(report).toContain("deterministic recommendation included: false");
  });

  it("keeps current branch scope limited to PR4 files", () => {
    const scopeHelper = readText(SCOPE_HELPER_PATH);

    expect(scopeHelper).toContain("RIASEC_CAREER_GRAPH_CANDIDATE_CLUSTER_PACKET_01_ALLOWED_FILES");
    expect(scopeHelper).toContain("codex/riasec-career-graph-candidate-cluster-packet-01");
    expect(scopeHelper).toContain("docs/career-graph/riasec-career-graph-candidate-cluster-packet-2026-06-23.md");
    expect(scopeHelper).toContain("docs/career-graph/riasec-career-graph-candidate-cluster-packet.v1.json");
    expect(scopeHelper).toContain("tests/contracts/riasec-career-graph-candidate-cluster-packet.contract.test.ts");
  });
});
