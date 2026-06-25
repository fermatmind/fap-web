import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const PACKAGE_PATH =
  "docs/seo/personality/personality-agent-operations-next-batch-6-handoff-package-2026-06-25.json";
const QA_PATH = "docs/seo/personality/personality-agent-operations-next-batch-6-handoff-qa-2026-06-25.json";
const CSV_PATH = "docs/seo/personality/personality-agent-operations-next-batch-6-handoff-2026-06-25.csv";

type HandoffClass = "query_backed" | "bilingual_paired_counterpart";

type Recommendation = {
  target_url: string;
  path: string;
  framework: string;
  locale: string;
  page_type: string;
  handoff_class: HandoffClass;
  paired_source_path: string | null;
  source_qa: {
    artifact_decision: string;
    blocker_count: number;
  };
  recommendations: {
    title: { recommended: string };
    description: { recommended: string };
    h1: { recommended: string };
    quick_answer: { recommended: string };
    faq: Array<{ question: string; answer: string }>;
    internal_links: Array<{ href: string; safe_public_route: boolean }>;
  };
};

type PackageArtifact = {
  artifact: string;
  final_decision: string;
  summary: {
    recommendation_count: number;
    query_backed_count: number;
    bilingual_paired_counterpart_count: number;
    variant_pages: number;
    comparison_pages: number;
    source_qa_pass_count: number;
  };
  recommendations: Recommendation[];
  safety_boundary: Record<string, boolean>;
  blockers: string[];
  recommended_next_task: string;
};

type QaArtifact = {
  artifact: string;
  final_decision: string;
  summary: {
    checked_recommendation_count: number;
    pass_ready_for_approval_review_count: number;
    query_backed_count: number;
    bilingual_paired_counterpart_count: number;
    blocked_count: number;
  };
  page_results: Array<{
    target_url: string;
    path: string;
    decision: string;
    source_qa_decision: string;
    handoff_class: HandoffClass;
    paired_source_path: string | null;
    blockers: string[];
    blocked_reason: string | null;
  }>;
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

describe("PERSONALITY-AGENT-OPERATIONS-NEXT-BATCH-6-HANDOFF-01", () => {
  const pkg = readJson<PackageArtifact>(PACKAGE_PATH);
  const qa = readJson<QaArtifact>(QA_PATH);

  it("extracts exactly the 6 bilingual next-batch handoff pages", () => {
    expect(pkg.artifact).toBe("PERSONALITY-AGENT-OPERATIONS-NEXT-BATCH-6-HANDOFF-01");
    expect(pkg.final_decision).toBe("PASS_NEXT_BATCH_6_HANDOFF_READY_FOR_APPROVAL_QUEUE_DRY_RUN");
    expect(pkg.blockers).toEqual([]);
    expect(pkg.summary.recommendation_count).toBe(6);
    expect(pkg.summary.query_backed_count).toBe(3);
    expect(pkg.summary.bilingual_paired_counterpart_count).toBe(3);
    expect(pkg.summary.variant_pages).toBe(6);
    expect(pkg.summary.comparison_pages).toBe(0);
    expect(pkg.summary.source_qa_pass_count).toBe(6);
    expect(pkg.recommendations.map((row) => row.path)).toEqual([
      "/zh/personality/intp-a",
      "/en/personality/intp-a",
      "/zh/personality/esfp-a",
      "/en/personality/esfp-a",
      "/en/personality/enfj-a",
      "/zh/personality/enfj-a",
    ]);
  });

  it("marks 3 query-backed pages and 3 bilingual paired counterparts", () => {
    const queryBacked = pkg.recommendations.filter((row) => row.handoff_class === "query_backed");
    const paired = pkg.recommendations.filter((row) => row.handoff_class === "bilingual_paired_counterpart");

    expect(queryBacked.map((row) => row.path)).toEqual([
      "/zh/personality/intp-a",
      "/zh/personality/esfp-a",
      "/en/personality/enfj-a",
    ]);
    expect(paired.map((row) => [row.path, row.paired_source_path])).toEqual([
      ["/en/personality/intp-a", "/zh/personality/intp-a"],
      ["/en/personality/esfp-a", "/zh/personality/esfp-a"],
      ["/zh/personality/enfj-a", "/en/personality/enfj-a"],
    ]);
  });

  it("preserves required recommendation fields and source QA pass evidence", () => {
    for (const row of pkg.recommendations) {
      expect(row.framework).toBe("mbti64");
      expect(row.page_type).toBe("variant");
      expect(row.source_qa.artifact_decision).toBe("PASS_READY_FOR_CMS_DRAFT");
      expect(row.source_qa.blocker_count).toBe(0);
      expect(row.recommendations.title.recommended.length).toBeGreaterThan(10);
      expect(row.recommendations.description.recommended.length).toBeGreaterThan(30);
      expect(row.recommendations.h1.recommended.length).toBeGreaterThan(5);
      expect(row.recommendations.quick_answer.recommended.length).toBeGreaterThan(40);
      expect(row.recommendations.faq.length).toBeGreaterThanOrEqual(5);
      expect(row.recommendations.internal_links.every((link) => link.safe_public_route)).toBe(true);
    }
  });

  it("emits a QA handoff for approval review only", () => {
    expect(qa.artifact).toBe("PERSONALITY-AGENT-OPERATIONS-NEXT-BATCH-6-HANDOFF-QA-01");
    expect(qa.final_decision).toBe("PASS_READY_FOR_APPROVAL_REVIEW");
    expect(qa.blockers).toEqual([]);
    expect(qa.summary.checked_recommendation_count).toBe(6);
    expect(qa.summary.pass_ready_for_approval_review_count).toBe(6);
    expect(qa.summary.query_backed_count).toBe(3);
    expect(qa.summary.bilingual_paired_counterpart_count).toBe(3);
    expect(qa.summary.blocked_count).toBe(0);
    expect(qa.page_results.every((row) => row.decision === "PASS_READY_FOR_APPROVAL_REVIEW")).toBe(true);
    expect(qa.page_results.every((row) => row.source_qa_decision === "PASS_READY_FOR_CMS_DRAFT")).toBe(true);
    expect(qa.page_results.every((row) => row.blockers.length === 0 && row.blocked_reason === null)).toBe(true);
    expect(qa.recommended_next_task).toBe("PERSONALITY-AGENT-APPROVAL-QUEUE-NEXT-BATCH-6-DRY-RUN-01");
  });

  it("does not authorize CMS, approval queue, publish, search, sitemap, llms, or deploy mutations", () => {
    for (const artifact of [pkg, qa]) {
      expect(artifact.safety_boundary.artifact_only).toBe(true);
      expect(artifact.safety_boundary.approval_queue_write_attempted).toBe(false);
      expect(artifact.safety_boundary.cms_write_attempted).toBe(false);
      expect(artifact.safety_boundary.cms_live_promotion_attempted).toBe(false);
      expect(artifact.safety_boundary.frontend_runtime_change_attempted).toBe(false);
      expect(artifact.safety_boundary.search_queue_mutation_attempted).toBe(false);
      expect(artifact.safety_boundary.live_search_submit_attempted).toBe(false);
      expect(artifact.safety_boundary.sitemap_llms_mutation_attempted).toBe(false);
      expect(artifact.safety_boundary.gsc_api_call_attempted).toBe(false);
      expect(artifact.safety_boundary.gsc_request_indexing_attempted).toBe(false);
      expect(artifact.safety_boundary.production_deploy_attempted).toBe(false);
    }
  });

  it("emits a stable CSV handoff header", () => {
    const csv = read(CSV_PATH);
    expect(csv.split("\n")[0]).toBe(
      [
        "path",
        "target_url",
        "framework",
        "locale",
        "page_type",
        "mbti_type",
        "handoff_class",
        "paired_source_path",
        "qa_decision",
        "source_qa_decision",
        "evidence_quality",
        "query_rows_captured",
        "recommended_title",
        "recommended_h1",
      ].join(","),
    );
  });
});
