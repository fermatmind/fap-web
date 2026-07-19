import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import fixture from "../fixtures/mbti-comp-gate-47/runtime-completeness.json";

const modulePromise = import("../../scripts/seo/mbti-comp-gate-47-runtime-completeness.mjs");

function buildRecord() {
  const sections = fixture.sectionKeys.map((key) => ({
    key,
    title: `完整标题 ${key}`,
    body: [`这是经过人工审批并由后端公开投影返回的完整正文，用于证明段落不是空值、短占位符或 comparison blocks 的替代内容。${key}`],
  }));
  const faq = Array.from({ length: 5 }, (_, index) => ({
    question: `问题 ${index + 1}`,
    answer: `这是第 ${index + 1} 条完整回答，具有足够长度并保持测评解释边界。`,
  }));
  const canonical = `https://fermatmind.com/zh/personality/${fixture.slug}`;
  const payload = {
    comparison_public_projection_v1: {
      comparison_slug: fixture.slug,
      canonical_url: canonical,
      overlay_source: { source: fixture.authoritySource },
      sections,
      comparison_blocks: sections,
      faq,
    },
    seo_meta: { robots: "index,follow" },
    jsonld: { "@type": "CollectionPage", hasPart: { "@type": "FAQPage", mainEntity: faq.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) } },
  };
  const visible = sections.map((section) => `${section.title} ${section.body[0]}`).join(" ");
  const pageHtml = `<!doctype html><html><head><link rel="canonical" href="${canonical}"><meta name="robots" content="index, follow"></head><body>${visible}</body></html>`;
  return { sections, payload, pageHtml };
}

describe("MBTI-COMP-GATE-47 runtime completeness", () => {
  it("passes an exact backend-authoritative record", async () => {
    const { sha256, validateRuntimeRecord } = await modulePromise;
    const record = buildRecord();
    const result = validateRuntimeRecord({ slug: fixture.slug, expectedSectionsSha256: sha256(record.sections), apiStatus: 200, payload: record.payload, pageStatus: 200, pageHtml: record.pageHtml });
    expect(result.passed).toBe(true);
    expect(result.failures).toEqual([]);
  });

  it.each(fixture.failureMutations)("fails closed for %s with precise authority evidence", async (mutation) => {
    const { sha256, validateRuntimeRecord } = await modulePromise;
    const record = buildRecord();
    const expectedSha = sha256(record.sections);
    if (mutation === "sections_empty_blocks_nonempty") record.payload.comparison_public_projection_v1.sections = [];
    if (mutation === "wrong_key") record.payload.comparison_public_projection_v1.sections[2].key = "unexpected_key";
    if (mutation === "short_body") record.payload.comparison_public_projection_v1.sections[3].body = ["太短"];
    if (mutation === "wrong_canonical") record.payload.comparison_public_projection_v1.canonical_url = "https://fermatmind.com/zh/personality/wrong";
    const result = validateRuntimeRecord({
      slug: fixture.slug,
      expectedSectionsSha256: mutation === "wrong_fingerprint" ? "0".repeat(64) : expectedSha,
      apiStatus: 200,
      payload: record.payload,
      pageStatus: 200,
      pageHtml: record.pageHtml,
    });
    expect(result.passed).toBe(false);
    expect(result.failures.length).toBeGreaterThan(0);
    expect(result.failures.every((failure: Record<string, unknown>) => failure.slug === fixture.slug && failure.field && failure.expected !== undefined && failure.actual !== undefined && failure.authority_source === fixture.authoritySource)).toBe(true);
  });

  it("locks the exact 16-target cohort and nine section order", async () => {
    const { SECTION_KEYS, TARGETS } = await modulePromise;
    expect(TARGETS).toHaveLength(16);
    expect(TARGETS.map((target: { slug: string }) => target.slug)).toEqual([
      "intj-a-vs-intj-t", "intp-a-vs-intp-t", "entj-a-vs-entj-t", "entp-a-vs-entp-t",
      "infj-a-vs-infj-t", "infp-a-vs-infp-t", "enfj-a-vs-enfj-t", "enfp-a-vs-enfp-t",
      "istj-a-vs-istj-t", "isfj-a-vs-isfj-t", "estj-a-vs-estj-t", "esfj-a-vs-esfj-t",
      "istp-a-vs-istp-t", "isfp-a-vs-isfp-t", "estp-a-vs-estp-t", "esfp-a-vs-esfp-t",
    ]);
    expect(SECTION_KEYS).toEqual(fixture.sectionKeys);
  });

  it("derives every runtime section fingerprint from its exact approved review package", async () => {
    const { projectApprovedSections, sha256, TARGETS } = await modulePromise;
    const approval39 = JSON.parse(readFileSync(resolve(process.cwd(), "docs/seo/personality/mbti-cms-approval-39-exact-package-2026-07-13.json"), "utf8"));
    const runtime46 = JSON.parse(readFileSync(resolve(process.cwd(), "docs/seo/personality/mbti-comp-runtime-46-intp-revision-2026-07-19.json"), "utf8"));
    const records = [...approval39.repair_records, ...runtime46.repair_records];

    for (const target of TARGETS) {
      const record = records.find((candidate: Record<string, unknown>) => candidate.slug === target.slug && candidate.exact_payload_sha256 === target.approvedPayloadSha256);
      expect(record, `${target.slug} missing ${target.reviewSource} approval record`).toBeDefined();
      if (target.reviewSource === "MBTI-CMS-APPROVAL-39") {
        expect(record.field_mapping.fields.content_sections).toBe("comparison_public_projection_v1.sections");
      } else {
        expect(record.revision_scope.allowed_fields).toContain("content_sections");
      }
      expect(sha256(projectApprovedSections(record.import_payload.content_sections))).toBe(target.sectionsSha256);
    }
  });
});
