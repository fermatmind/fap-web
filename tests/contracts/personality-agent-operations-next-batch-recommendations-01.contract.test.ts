import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const REPORT_PATH = "docs/seo/personality/personality-agent-operations-next-batch-recommendations-2026-06-25.json";
const CSV_PATH = "docs/seo/personality/personality-agent-operations-next-batch-recommendations-2026-06-25.csv";

type Recommendation = {
  target_url: string;
  path: string;
  framework: string;
  page_type: string;
  selection_evidence: {
    query_rows_captured: number;
    priority_rank: number;
  };
  recommendations: {
    title: { recommended: string };
    description: { recommended: string };
    h1: { recommended: string };
    quick_answer: { recommended: string };
    faq: Array<{ question: string; answer: string }>;
    internal_links: Array<{ href: string; safe_public_route: boolean }>;
  };
  source_qa: {
    artifact_decision: string;
    blocker_count: number;
  };
};

type Report = {
  final_decision: string;
  generation_policy: {
    mode: string;
    cms_write_policy: string;
    search_release_policy: string;
  };
  summary: {
    selected_url_count: number;
    recommendation_count: number;
    qa_pass_source_count: number;
    variant_pages: number;
    comparison_pages: number;
  };
  recommendations: Recommendation[];
  safety_boundary: Record<string, boolean>;
  blockers: string[];
  recommended_next_tasks: Record<string, string>;
};

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8")) as T;
}

describe("PERSONALITY-AGENT-OPERATIONS-NEXT-BATCH-RECOMMENDATIONS-01", () => {
  const report = readJson<Report>(REPORT_PATH);

  it("packages recommendations only for the selected query-backed next batch", () => {
    expect(report.final_decision).toBe("PASS_NEXT_BATCH_RECOMMENDATIONS_READY_FOR_QA");
    expect(report.blockers).toEqual([]);
    expect(report.summary.selected_url_count).toBe(3);
    expect(report.summary.recommendation_count).toBe(3);
    expect(report.summary.variant_pages).toBe(3);
    expect(report.summary.comparison_pages).toBe(0);
    expect(report.recommendations.map((item) => item.path)).toEqual([
      "/zh/personality/intp-a",
      "/zh/personality/esfp-a",
      "/en/personality/enfj-a",
    ]);
  });

  it("preserves draft recommendation fields required by the QA and CMS draft handoff", () => {
    for (const item of report.recommendations) {
      expect(item.framework).toBe("mbti64");
      expect(item.selection_evidence.query_rows_captured).toBeGreaterThan(0);
      expect(item.selection_evidence.priority_rank).toBeGreaterThan(0);
      expect(item.source_qa.artifact_decision).toBe("PASS_READY_FOR_CMS_DRAFT");
      expect(item.source_qa.blocker_count).toBe(0);

      expect(item.recommendations.title.recommended.length).toBeGreaterThan(10);
      expect(item.recommendations.description.recommended.length).toBeGreaterThan(30);
      expect(item.recommendations.h1.recommended.length).toBeGreaterThan(5);
      expect(item.recommendations.quick_answer.recommended.length).toBeGreaterThan(40);
      expect(item.recommendations.faq.length).toBeGreaterThanOrEqual(5);
      expect(item.recommendations.internal_links.length).toBeGreaterThanOrEqual(4);
      expect(item.recommendations.internal_links.every((link) => link.safe_public_route)).toBe(true);
    }
    expect(report.summary.qa_pass_source_count).toBe(3);
  });

  it("keeps recommendation packaging separate from CMS/search mutations", () => {
    expect(report.generation_policy.mode).toBe("subset_existing_agent_recommendations_no_new_body_generation");
    expect(report.generation_policy.cms_write_policy).toContain("never_from_recommendation_artifact");
    expect(report.generation_policy.search_release_policy).toBe("never_from_recommendation_artifact");

    expect(report.safety_boundary.new_body_copy_generated).toBe(false);
    expect(report.safety_boundary.gpt_or_external_model_called).toBe(false);
    expect(report.safety_boundary.cms_write_attempted).toBe(false);
    expect(report.safety_boundary.cms_live_promotion_attempted).toBe(false);
    expect(report.safety_boundary.frontend_runtime_change_attempted).toBe(false);
    expect(report.safety_boundary.search_queue_mutation_attempted).toBe(false);
    expect(report.safety_boundary.live_search_submit_attempted).toBe(false);
    expect(report.safety_boundary.sitemap_llms_mutation_attempted).toBe(false);
    expect(report.safety_boundary.gsc_api_call_attempted).toBe(false);
    expect(report.safety_boundary.gsc_request_indexing_attempted).toBe(false);
    expect(report.safety_boundary.production_deploy_attempted).toBe(false);

    expect(report.recommended_next_tasks.qa).toBe("PERSONALITY-AGENT-OPERATIONS-NEXT-BATCH-QA-01");
  });

  it("emits a stable CSV for review", () => {
    const csv = fs.readFileSync(path.join(ROOT, CSV_PATH), "utf8");
    expect(csv.split("\n")[0]).toBe(
      [
        "path",
        "target_url",
        "framework",
        "locale",
        "page_type",
        "mbti_type",
        "priority_rank",
        "priority_score",
        "query_rows_captured",
        "recommended_title",
        "recommended_h1",
        "faq_count",
        "internal_link_count",
        "source_qa_decision",
      ].join(","),
    );
  });
});
