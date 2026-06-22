import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const REVIEW_PATH = "docs/result-page-agents/riasec-result-page-agent-readonly-route-api-pdf-share-review.v1.json";
const REPORT_PATH = "docs/result-page-agents/riasec-result-page-agent-readonly-route-api-pdf-share-review-2026-06-23.md";
const SCOPE_HELPER_PATH = "tests/contracts/helpers/currentPrScope.ts";

const REQUIRED_SURFACES = [
  "private_result_route_noindex",
  "renderer_dispatch",
  "report_api",
  "report_access_api",
  "pdf_behavior",
  "share_behavior",
  "public_projection_consumption",
  "leak_redaction",
  "career_bridge_boundary",
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

function bySurface(surfaces: Record<string, unknown>[], id: string): Record<string, unknown> {
  const match = surfaces.find((surface) => surface.id === id);
  expect(match, `${id} surface missing`).toBeDefined();
  return asRecord(match);
}

describe("RIASEC result-page agent read-only route/API/PDF/share review", () => {
  it("records a read-only RIASEC review with runtime and production holds", () => {
    const review = readJson(REVIEW_PATH);
    const safety = asRecord(review.safety_confirmation);

    expect(review.schema_version).toBe("fermatmind.riasec_result_page_agent_readonly_route_api_pdf_share_review.v1");
    expect(review.task_id).toBe("RIASEC-RESULT-PAGE-AGENT-READONLY-ROUTE-API-PDF-SHARE-REVIEW-01");
    expect(review.verdict).toBe("RIASEC_READONLY_ROUTE_API_PDF_SHARE_REVIEW_READY_WITH_RUNTIME_PRODUCTION_HOLDS");
    expect(safety.runtime_code_changed).toBe("no");
    expect(safety.cms_writes).toBe("none");
    expect(safety.private_attempt_access).toBe("none");
    expect(safety.backend_writing_command_run).toBe("no");
    expect(safety.seo_search_mutation).toBe("none");
    expect(safety.production_import).toBe("none");
    expect(safety.rollout).toBe("none");
    expect(safety.generated_readiness_artifact).toBe("future_not_generated");
  });

  it("locks RIASEC identity, one flagship landing, and supported forms", () => {
    const review = readJson(REVIEW_PATH);
    const identity = asRecord(review.identity);

    expect(identity.agent_id).toBe("riasec_result_page");
    expect(identity.scale_code).toBe("RIASEC");
    expect(identity.canonical_test_slug).toBe("holland-career-interest-test-riasec");
    expect(identity.one_flagship_landing).toBe("holland-career-interest-test-riasec");
    expect(asStringArray(identity.supported_forms)).toEqual(["riasec_60", "riasec_140"]);
  });

  it("covers route, renderer, report, report-access, PDF, share, projection, leak, and career bridge surfaces", () => {
    const review = readJson(REVIEW_PATH);
    const surfaces = asRecordArray(review.review_surfaces);

    expect(surfaces.map((surface) => surface.id)).toEqual(REQUIRED_SURFACES);
    for (const surface of surfaces) {
      expect(surface.status).toBe("DOC_MATCH");
    }

    expect(String(bySurface(surfaces, "renderer_dispatch").evidence)).toContain("ResultClient -> RichResultReport -> RiasecResultShell");
    expect(bySurface(surfaces, "report_api").endpoint).toBe("/api/v0.3/attempts/{attempt_id}/report");
    expect(bySurface(surfaces, "report_access_api").endpoint).toBe("/api/v0.3/attempts/{attempt_id}/report-access");
    expect(asStringArray(bySurface(surfaces, "public_projection_consumption").projection_versions)).toEqual([
      "riasec_public_projection_v2",
      "riasec_public_projection_v1",
    ]);
  });

  it("forbids raw scores, vectors, percentiles, traces, source, QA, editor, and private URL leaks", () => {
    const review = readJson(REVIEW_PATH);
    const leak = bySurface(asRecordArray(review.review_surfaces), "leak_redaction");

    expect(asStringArray(leak.forbidden_public_fields)).toEqual(
      expect.arrayContaining([
        "raw_score",
        "raw_scores",
        "score_vector",
        "percentile",
        "selector_trace",
        "source_refs",
        "qa_trace",
        "editor_notes",
        "private_url",
        "report_token",
        "attempt_id",
        "user_id",
      ])
    );
  });

  it("keeps career bridge examples-only and blocks outcome claims", () => {
    const review = readJson(REVIEW_PATH);
    const bridge = bySurface(asRecordArray(review.review_surfaces), "career_bridge_boundary");

    expect(bridge.allowed).toContain("examples-only");
    expect(asStringArray(bridge.forbidden)).toEqual(
      expect.arrayContaining([
        "deterministic career recommendation",
        "admissions guarantee",
        "hiring screen",
        "salary prediction",
        "performance prediction",
        "success prediction",
        "ability guarantee",
      ])
    );
  });

  it("uses only allowed source classes and excludes private or writing sources", () => {
    const review = readJson(REVIEW_PATH);
    const classification = asRecord(review.source_classification);

    expect(asStringArray(classification.allowed_sources)).toEqual(
      expect.arrayContaining(["source evidence", "sanitized fixtures", "existing backend authority docs/tests"])
    );
    expect(asStringArray(classification.forbidden_sources)).toEqual(
      expect.arrayContaining([
        "private attempts",
        "raw private result payload",
        "backend commands that write artifacts without explicit authorization",
        "production database",
        "provider consoles",
        "Search Queue",
      ])
    );
  });

  it("keeps release, runtime, CMS, SEO/search, and generated artifact gates closed", () => {
    const review = readJson(REVIEW_PATH);
    const gates = asRecord(review.go_no_go);

    expect(gates.readonly_review).toBe("GO");
    expect(gates.runtime_enablement).toBe("NO_GO");
    expect(gates.cms_import).toBe("NO_GO");
    expect(gates.production_import).toBe("NO_GO");
    expect(gates.production_rollout).toBe("NO_GO");
    expect(gates.seo_search_mutation).toBe("NO_GO");
    expect(gates.generated_readiness_artifact).toBe("NO_GO_WITHOUT_EXPLICIT_AUTHORIZATION");
    expect(asStringArray(review.future_release_chain_not_executed)).toEqual([
      "production import execution authorization",
      "production import execution",
      "post-import evidence",
      "pilot preflight",
      "pilot allowlist",
      "rollout approval",
    ]);
  });

  it("keeps the markdown report aligned with the JSON review", () => {
    const report = readText(REPORT_PATH);

    expect(report).toContain("Verdict: `RIASEC_READONLY_ROUTE_API_PDF_SHARE_REVIEW_READY_WITH_RUNTIME_PRODUCTION_HOLDS`");
    expect(report).toContain("backend writing command run: no");
    expect(report).toContain("supported forms: `riasec_60`, `riasec_140`");
    expect(report).toContain("| renderer dispatch | `DOC_MATCH` | `ResultClient -> RichResultReport -> RiasecResultShell`");
    expect(report).toContain("no raw score/vector/percentile/selector/source/QA/editor/private URL leak");
    expect(report).toContain("deterministic career recommendation");
    expect(report).toContain("| production import | `NO_GO` |");
    expect(report).toContain("These tasks require separate exact authorization");
  });

  it("keeps current branch scope limited to the PR6 docs and contract", () => {
    const scopeHelper = readText(SCOPE_HELPER_PATH);

    expect(scopeHelper).toContain("RIASEC_RESULT_PAGE_AGENT_READONLY_ROUTE_API_PDF_SHARE_REVIEW_01_ALLOWED_FILES");
    expect(scopeHelper).toContain("codex/riasec-result-page-agent-readonly-route-api-pdf-share-review-01");
    expect(scopeHelper).toContain(
      "docs/result-page-agents/riasec-result-page-agent-readonly-route-api-pdf-share-review-2026-06-23.md"
    );
    expect(scopeHelper).toContain("docs/result-page-agents/riasec-result-page-agent-readonly-route-api-pdf-share-review.v1.json");
    expect(scopeHelper).toContain(
      "tests/contracts/riasec-result-page-agent-readonly-route-api-pdf-share-review.contract.test.ts"
    );
  });
});
