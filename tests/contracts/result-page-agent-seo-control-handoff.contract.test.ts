import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const HANDOFF_PATH = "docs/result-page-agents/result-page-agent-seo-control-handoff.v1.json";
const REPORT_PATH = "docs/result-page-agents/result-page-agent-seo-control-handoff-2026-06-23.md";
const SCOPE_HELPER_PATH = "tests/contracts/helpers/currentPrScope.ts";

const EXPECTED_SCALES = ["MBTI", "BIG5_OCEAN", "RIASEC", "IQ_RAVEN", "EQ_60", "ENNEAGRAM"];

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

describe("result-page agent SEO control handoff", () => {
  it("defines a no-mutation SEO control handoff", () => {
    const handoff = readJson(HANDOFF_PATH);
    const safety = asRecord(handoff.safety_confirmation);

    expect(handoff.schema_version).toBe("fermatmind.result_page_agent_seo_control_handoff.v1");
    expect(handoff.task_id).toBe("RESULT-PAGE-AGENT-SEO-CONTROL-HANDOFF-01");
    expect(handoff.verdict).toBe("SEO_CONTROL_HANDOFF_READY_NO_MUTATION");
    expect(safety.private_result_pages_noindex).toBe("required");
    expect(safety.sitemap_mutation).toBe("none");
    expect(safety.robots_mutation).toBe("none");
    expect(safety.llms_mutation).toBe("none");
    expect(safety.schema_json_ld_mutation).toBe("none");
    expect(safety.hreflang_mutation).toBe("none");
    expect(safety.search_queue_mutation).toBe("none");
    expect(safety.provider_calls).toBe("none");
    expect(safety.runtime_code_changed).toBe("no");
  });

  it("allows only public SEO inputs and forbids private result sources", () => {
    const handoff = readJson(HANDOFF_PATH);

    expect(asStringArray(handoff.allowed_seo_inputs)).toEqual(
      expect.arrayContaining([
        "public hub pages",
        "public explanation pages",
        "public-safe projection summaries",
        "CMS/backend-authoritative public content APIs",
      ])
    );
    expect(asStringArray(handoff.forbidden_seo_inputs)).toEqual(
      expect.arrayContaining([
        "private result pages",
        "raw private result payload",
        "private attempts",
        "report URLs",
        "report tokens",
        "raw scores",
        "score vectors",
        "percentiles",
        "selector traces",
        "QA traces",
      ])
    );
  });

  it("keeps all SEO/search/provider mutations on hold", () => {
    const handoff = readJson(HANDOFF_PATH);

    expect(asStringArray(handoff.mutation_holds)).toEqual(
      expect.arrayContaining([
        "no sitemap mutation",
        "no robots mutation",
        "no llms mutation",
        "no schema or JSON-LD mutation",
        "no hreflang mutation",
        "no canonical mutation",
        "no noindex mutation",
        "no Search Queue enqueue/approve/submit",
        "no GSC Request Indexing",
        "no Baidu push",
        "no IndexNow",
        "no Bing provider call",
      ])
    );
  });

  it("requires private result pages to stay noindex", () => {
    const handoff = readJson(HANDOFF_PATH);
    const control = asRecord(handoff.private_result_control);

    expect(control.policy).toBe("PRIVATE_RESULTS_STAY_NOINDEX");
    expect(asStringArray(control.applies_to)).toEqual(
      expect.arrayContaining([
        "/[locale]/result/[id]",
        "PDF private report surfaces",
        "share flows that can reference private result context",
        "history and compare private result surfaces",
        "locked/free redaction states",
      ])
    );
    expect(control.seo_agent_allowed_action).toBe("read controls and report findings only");
    expect(control.seo_agent_forbidden_action).toBe("change noindex/canonical/schema/sitemap/search behavior");
  });

  it("sets the RIASEC public SEO and private-result boundary", () => {
    const handoff = readJson(HANDOFF_PATH);
    const boundary = asRecord(handoff.riasec_seo_boundary);

    expect(boundary.canonical_public_slug).toBe("holland-career-interest-test-riasec");
    expect(asStringArray(boundary.public_allowed)).toEqual(
      expect.arrayContaining([
        "public hub for Holland/RIASEC career interest topics",
        "public explanation pages",
        "public-safe projection summaries",
        "career graph bridge via public-safe projection only",
      ])
    );
    expect(asStringArray(boundary.private_forbidden)).toEqual(
      expect.arrayContaining([
        "private result page indexing",
        "private result as SEO content source",
        "raw RIASEC score/vector/percentile",
        "deterministic career recommendation",
        "admissions/hiring/salary/performance/success/ability guarantee",
      ])
    );
  });

  it("records all six per-scale SEO controls", () => {
    const handoff = readJson(HANDOFF_PATH);
    const rows = asRecordArray(handoff.per_scale_seo_control);

    expect(rows.map((row) => row.scale_code)).toEqual(EXPECTED_SCALES);
    expect(JSON.stringify(rows)).toContain("PRIVATE_RESULT_NOINDEX_PUBLIC_HUB_AND_PUBLIC_SAFE_PROJECTION_ONLY");
    expect(JSON.stringify(rows)).toContain("NO_DIAGNOSTIC_SEO_CLAIMS");
    expect(JSON.stringify(rows)).toContain("NO_CLINICAL_SEO_CLAIMS");
  });

  it("hands off to the RIASEC read-only review without authorizing release work", () => {
    const handoff = readJson(HANDOFF_PATH);
    const next = asRecord(handoff.next_task);

    expect(next.id).toBe("RIASEC-RESULT-PAGE-AGENT-READONLY-ROUTE-API-PDF-SHARE-REVIEW-01");
    expect(asStringArray(next.allowed_scope)).toContain("RIASEC route/API/PDF/share read-only review");
    expect(asStringArray(next.forbidden_scope)).toEqual(
      expect.arrayContaining(["production import", "runtime switch", "CMS write", "private attempt access", "SEO/search mutation"])
    );
  });

  it("keeps the markdown report aligned with the SEO handoff artifact", () => {
    const report = readText(REPORT_PATH);

    expect(report).toContain("Verdict: `SEO_CONTROL_HANDOFF_READY_NO_MUTATION`");
    expect(report).toContain("private result pages noindex: required");
    expect(report).toContain("no sitemap mutation");
    expect(report).toContain("no Search Queue enqueue/approve/submit");
    expect(report).toContain("public-safe projection summaries");
    expect(report).toContain("private result as SEO content source");
    expect(report).toContain("Canonical public slug: `holland-career-interest-test-riasec`");
    expect(report).toContain("`RIASEC-RESULT-PAGE-AGENT-READONLY-ROUTE-API-PDF-SHARE-REVIEW-01`");
  });

  it("keeps current branch scope limited to the PR5 docs and contract", () => {
    const scopeHelper = readText(SCOPE_HELPER_PATH);

    expect(scopeHelper).toContain("RESULT_PAGE_AGENT_SEO_CONTROL_HANDOFF_01_ALLOWED_FILES");
    expect(scopeHelper).toContain("codex/result-page-agent-seo-control-handoff-01");
    expect(scopeHelper).toContain("docs/result-page-agents/result-page-agent-seo-control-handoff-2026-06-23.md");
    expect(scopeHelper).toContain("docs/result-page-agents/result-page-agent-seo-control-handoff.v1.json");
    expect(scopeHelper).toContain("tests/contracts/result-page-agent-seo-control-handoff.contract.test.ts");
  });
});
