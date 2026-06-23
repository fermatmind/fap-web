import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const REVIEW_PATH = "docs/result-page-agents/six-result-page-agent-readonly-route-api-pdf-share-review.proposal.json";
const REPORT_PATH = "docs/result-page-agents/six-result-page-agent-readonly-route-api-pdf-share-review-2026-06-23.md";
const MATRIX_PATH = "docs/result-page-agents/six-result-page-agent-readiness-matrix.v1.json";
const SCOPE_HELPER_PATH = "tests/contracts/helpers/currentPrScope.ts";

const EXPECTED_SCALES = ["MBTI", "BIG5_OCEAN", "RIASEC", "IQ_RAVEN", "EQ_60", "ENNEAGRAM"];
const REQUIRED_SURFACES = [
  "route_contract",
  "report_api_contract",
  "report_access_api_contract",
  "renderer_dispatch",
  "pdf_private_print_boundary",
  "share_public_private_boundary",
  "private_result_noindex_boundary",
  "claim_privacy_safety_gate",
  "analytics_gate_and_smoke_exclusions",
  "leak_boundary",
];
const ALLOWED_STATUSES = new Set(["PASS", "PARTIAL", "HOLD", "BLOCKED"]);

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

function byScale(scales: Record<string, unknown>[], scaleCode: string): Record<string, unknown> {
  const match = scales.find((scale) => scale.scale_code === scaleCode);
  expect(match, `${scaleCode} row missing`).toBeDefined();
  return asRecord(match);
}

function reviewFor(scale: Record<string, unknown>, surface: string): Record<string, unknown> {
  return asRecord(asRecord(scale.review)[surface]);
}

describe("six result-page agent read-only route/API/PDF/share review", () => {
  it("records a unified partial read-only verdict and uses the merged matrix paths", () => {
    const review = readJson(REVIEW_PATH);
    const matrix = readJson(MATRIX_PATH);

    expect(review.schema_version).toBe("fermatmind.six_result_page_agent_readonly_route_api_pdf_share_review.v1");
    expect(review.task_id).toBe("SIX-RESULT-PAGE-AGENT-READONLY-ROUTE-API-PDF-SHARE-REVIEW-01");
    expect(review.verdict).toBe("SIX_RESULT_PAGE_AGENT_READONLY_REVIEW_PARTIAL");
    expect(asStringArray(review.source_documents)).toEqual(
      expect.arrayContaining([
        "docs/result-page-agents/six-result-page-agent-readiness-matrix.v1.json",
        "docs/result-page-agents/six-result-page-agent-readiness-matrix-2026-06-23.md",
        "docs/result-page-agents/RESULT_PAGE_AGENT_PLATFORM_STANDARD.md",
      ])
    );
    expect(asRecord(review.matrix_source_resolution).current_repo_paths_used).toEqual(
      expect.arrayContaining([
        "docs/result-page-agents/six-result-page-agent-readiness-matrix-2026-06-23.md",
        "docs/result-page-agents/six-result-page-agent-readiness-matrix.v1.json",
      ])
    );
    expect(matrix.verdict).toBe("SIX_RESULT_PAGE_AGENT_MATRIX_READY");
  });

  it("covers all six scales and all required review surfaces", () => {
    const review = readJson(REVIEW_PATH);
    const scales = asRecordArray(review.scales);

    expect(scales.map((scale) => scale.scale_code)).toEqual(EXPECTED_SCALES);
    for (const scale of scales) {
      expect(ALLOWED_STATUSES.has(String(scale.overall_status))).toBe(true);
      const reviewSurfaces = asRecord(scale.review);
      expect(Object.keys(reviewSurfaces)).toEqual(REQUIRED_SURFACES);
      for (const surface of REQUIRED_SURFACES) {
        expect(ALLOWED_STATUSES.has(String(asRecord(reviewSurfaces[surface]).status)), `${String(scale.scale_code)} ${surface}`).toBe(true);
      }
    }
  });

  it("keeps safety guarantees hard-held and avoids generated readiness artifacts", () => {
    const review = readJson(REVIEW_PATH);
    const safety = asRecord(review.safety_confirmation);

    expect(safety).toMatchObject({
      runtime_code_changed: "no",
      cms_writes: "none",
      publish: "none",
      search_submissions: "none",
      provider_calls: "none",
      private_result_data_accessed: "none",
      payment_order_mutation: "none",
      env_changes: "none",
      backend_write_artifact_commands_run: "none",
      generated_readiness_artifacts: "not_generated_by_this_review",
    });
    expect(asStringArray(review.hard_holds)).toEqual(
      expect.arrayContaining([
        "no_backend_write_producing_asset_or_ops_command",
        "no_generated_readiness_artifact",
        "no_private_result_data_access",
        "no_search_channel_queue_mutation",
        "no_sitemap_robots_llms_schema_hreflang_generated_seo_artifact_mutation",
      ])
    );
  });

  it("marks RIASEC and Enneagram as PASS while keeping runtime and CMS actions out of scope", () => {
    const review = readJson(REVIEW_PATH);
    const scales = asRecordArray(review.scales);

    for (const scaleCode of ["RIASEC", "ENNEAGRAM"]) {
      const scale = byScale(scales, scaleCode);
      expect(scale.overall_status).toBe("PASS");
      for (const surface of REQUIRED_SURFACES) {
        expect(reviewFor(scale, surface).status, `${scaleCode} ${surface}`).toBe("PASS");
      }
      expect(asStringArray(scale.limitations).join(" ")).toMatch(/Runtime enablement|Generated readiness artifact/);
    }

    const riasec = byScale(scales, "RIASEC");
    expect(JSON.stringify(riasec)).toContain("deterministic career recommendation");
    expect(JSON.stringify(riasec)).toContain("attempt_id");
    expect(JSON.stringify(riasec)).toContain("selector_trace");
  });

  it("keeps MBTI, IQ, and EQ partial because dedicated agent gates are still missing", () => {
    const review = readJson(REVIEW_PATH);
    const scales = asRecordArray(review.scales);

    expect(byScale(scales, "MBTI").overall_status).toBe("PARTIAL");
    expect(reviewFor(byScale(scales, "MBTI"), "claim_privacy_safety_gate").status).toBe("PARTIAL");
    expect(reviewFor(byScale(scales, "MBTI"), "analytics_gate_and_smoke_exclusions").status).toBe("PARTIAL");

    const iq = byScale(scales, "IQ_RAVEN");
    expect(iq.overall_status).toBe("PARTIAL");
    expect(reviewFor(iq, "claim_privacy_safety_gate").status).toBe("HOLD");
    expect(JSON.stringify(iq)).toContain("answer key");
    expect(JSON.stringify(iq)).toContain("no diagnostic");

    const eq = byScale(scales, "EQ_60");
    expect(eq.overall_status).toBe("PARTIAL");
    expect(reviewFor(eq, "share_public_private_boundary").status).toBe("PARTIAL");
    expect(reviewFor(eq, "claim_privacy_safety_gate").status).toBe("HOLD");
    expect(JSON.stringify(eq)).toContain("no diagnostic");
    expect(JSON.stringify(eq)).toContain("clinical");
  });

  it("reconciles the Big Five share-safety blocker as read-only cleared", () => {
    const review = readJson(REVIEW_PATH);
    const big5 = byScale(asRecordArray(review.scales), "BIG5_OCEAN");

    expect(big5.overall_status).toBe("PASS");
    expect(big5.readiness_from_matrix).toBe("ready_readonly_cleared");
    expect(reviewFor(big5, "share_public_private_boundary").status).toBe("PASS");
    expect(reviewFor(big5, "claim_privacy_safety_gate").status).toBe("PASS");
    expect(reviewFor(big5, "analytics_gate_and_smoke_exclusions").status).toBe("PASS");
    expect(JSON.stringify(big5)).toContain("share_safety_missing_count=1");
    expect(JSON.stringify(big5)).toContain("share_safety_missing_count=0");
    expect(JSON.stringify(big5)).toContain("validation_error_count=0");
    expect(JSON.stringify(big5)).toContain("leak_hit_count=0");
    expect(asStringArray(big5.limitations)).toEqual(
      expect.arrayContaining([
        "Historical share-safety blocker is superseded only for read-only evidence by the ready-readonly-cleared handoff.",
        "Pilot, runtime enablement, production rollout, CMS, search, live asset merge, and private result data remain out of scope.",
      ])
    );
  });

  it("defines per-scale next safe goals and summary buckets", () => {
    const review = readJson(REVIEW_PATH);
    const summary = asRecord(review.summary);
    const goals = asRecordArray(review.next_safe_goals);

    expect(asStringArray(summary.pass)).toEqual(["RIASEC", "ENNEAGRAM", "BIG5_OCEAN"]);
    expect(asStringArray(summary.partial)).toEqual(["MBTI", "IQ_RAVEN", "EQ_60"]);
    expect(asStringArray(summary.blocked)).toEqual([]);
    expect(goals.map((goal) => goal.scale_code)).toEqual(EXPECTED_SCALES);
    expect(byScale(goals, "BIG5_OCEAN").next_goal).toBe("BIG5-RESULT-PAGE-AGENT-READY-READONLY-CLEARED-HANDOFF-01");
  });

  it("keeps the markdown report aligned with the JSON review", () => {
    const report = readText(REPORT_PATH);

    expect(report).toContain("Verdict: `SIX_RESULT_PAGE_AGENT_READONLY_REVIEW_PARTIAL`");
    expect(report).toContain("| BIG5_OCEAN | `PASS` | `PASS` | `PASS` | `PASS` | `PASS` | `PASS`");
    expect(report).toContain("ready-readonly-cleared handoff supersedes the historical `BIG5_SHARE_SAFETY_GAP_CONFIRMED` marker");
    expect(report).toContain("share_safety_missing_count=0");
    expect(report).toContain("| RIASEC | `PASS` | `PASS` | `PASS` | `PASS` | `PASS` | `PASS`");
    expect(report).toContain("| ENNEAGRAM | `PASS` | `PASS` | `PASS` | `PASS` | `PASS` | `PASS`");
    expect(report).toContain("backend write-producing asset/ops commands run: none");
    expect(report).toContain("generated readiness artifacts: not generated by this review");
    expect(report).toContain("| unified read-only review | `GO_PARTIAL` |");
  });

  it("registers current branch scope for only the read-only review files", () => {
    const helper = readText(SCOPE_HELPER_PATH);

    expect(helper).toContain("SIX_RESULT_PAGE_AGENT_READONLY_ROUTE_API_PDF_SHARE_REVIEW_01_ALLOWED_FILES");
    expect(helper).toContain("codex/six-result-page-agent-readonly-route-api-pdf-share-review-01");
    expect(helper).toContain("docs/result-page-agents/six-result-page-agent-readonly-route-api-pdf-share-review-2026-06-23.md");
    expect(helper).toContain("docs/result-page-agents/six-result-page-agent-readonly-route-api-pdf-share-review.proposal.json");
    expect(helper).toContain("tests/contracts/six-result-page-agent-readonly-route-api-pdf-share-review.contract.test.ts");
  });
});
