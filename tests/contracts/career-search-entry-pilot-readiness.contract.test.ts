import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildArtifact,
  canonicalJson,
  evaluateCandidateEvidence,
  inspectHtml,
  selectPilot,
  sha256,
  validateExactTargetShape,
} from "../../scripts/seo/generate-career-search-entry-pilot-readiness.mjs";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/seo/generated/career-search-entry-pilot-readiness-01.v1.json");
const OBSERVED_AT = "2026-08-01T12:00:00.000Z";

type LocaleEvidence = {
  url: string;
  detail_status: number;
  seo_status: number;
  page_status: number;
  sitemap_included: boolean;
  html: ReturnType<typeof inspectHtml>;
  seo: { metadata_contract_version: string; metadata_fingerprint: string; robots_policy: string; index_eligible: boolean };
  seo_sha256: string;
  review: { review_state: string; reviewer_status: string; reviewed_at: string; stale: boolean; backend_private_package_match_projected: boolean; public_projection_sha256: string };
  content_version: string;
  content_sha256: string;
  quality_score: number;
  visible_text_chars: number;
  cjk_chars: number;
  faq_count: number;
  thin_or_shell: boolean;
  guarantee_matches: string[];
};

type Candidate = {
  slug: string;
  tier: string;
  search_entry_eligible: boolean;
  held: boolean;
  sitemap_bilingual: boolean;
  quality_score: number;
  locales: { en: LocaleEvidence; zh: LocaleEvidence };
};

function html(url: string): string {
  return `<html><head><link rel="canonical" href="${url}"/><meta name="robots" content="index, follow"/><script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "BreadcrumbList", itemListElement: [] },
      { "@type": "FAQPage", mainEntity: [1, 2, 3].map((position) => ({ "@type": "Question", position })) },
    ],
  })}</script></head><body></body></html>`;
}

function localeEvidence(slug: string, locale: "en" | "zh"): LocaleEvidence {
  const url = `https://fermatmind.com/${locale}/career/jobs/${slug}`;
  const seoSha = sha256({ locale, slug, kind: "seo" });
  const contentSha = sha256({ locale, slug, kind: "content" });
  return {
    url,
    detail_status: 200,
    seo_status: 200,
    page_status: 200,
    sitemap_included: true,
    html: inspectHtml(html(url), url),
    seo: { metadata_contract_version: "seo.surface.v1", metadata_fingerprint: `${locale}-${slug}`, robots_policy: "index,follow", index_eligible: true },
    seo_sha256: seoSha,
    review: { review_state: "approved", reviewer_status: "approved", reviewed_at: "2026-07-31T23:56:27.000Z", stale: false, backend_private_package_match_projected: true, public_projection_sha256: sha256({ locale, slug, kind: "review" }) },
    content_version: "reviewed.v1",
    content_sha256: contentSha,
    quality_score: 60,
    visible_text_chars: 2400,
    cjk_chars: locale === "zh" ? 500 : 0,
    faq_count: 3,
    thin_or_shell: false,
    guarantee_matches: [],
  };
}

function candidate(index: number, overrides: Partial<Candidate> = {}): Candidate {
  const slug = `career-${String(index).padStart(2, "0")}`;
  return {
    slug,
    tier: index <= 2 ? "stable" : "approved_candidate",
    search_entry_eligible: true,
    held: false,
    sitemap_bilingual: true,
    quality_score: 100 - index,
    locales: { en: localeEvidence(slug, "en"), zh: localeEvidence(slug, "zh") },
    ...overrides,
  };
}

function evaluated(count = 12) {
  return Array.from({ length: count }, (_, index) => evaluateCandidateEvidence(candidate(index + 1)));
}

describe("CAREER-SEARCH-ENTRY-PILOT-READINESS-01 selector", () => {
  it("is deterministic and orders stable, then quality descending, then slug", () => {
    const inputs = evaluated();
    const first = selectPilot(inputs);
    const second = selectPilot([...inputs].reverse());
    expect(canonicalJson(first)).toBe(canonicalJson(second));
    expect(first.result).toBe("GO");
    expect(first.selected).toHaveLength(10);
    expect(first.selected.slice(0, 2).map((item: Candidate) => item.tier)).toEqual(["stable", "stable"]);
  });

  it("holds rather than lowering the gate when fewer than ten candidates pass", () => {
    const result = selectPilot(evaluated(9));
    expect(result).toMatchObject({ result: "HOLD", selected: [], reason: "insufficient_eligible_candidates:9/10" });
  });

  it.each([9, 11])("rejects an artifact with %s slugs", (count) => {
    const targets = Array.from({ length: count }, (_, index) => ({
      slug: `career-${index}`,
      urls: [`https://fermatmind.com/en/career/jobs/career-${index}`, `https://fermatmind.com/zh/career/jobs/career-${index}`],
    }));
    expect(validateExactTargetShape(targets).valid).toBe(false);
  });

  it.each([19, 21])("rejects an artifact with %s URLs", (count) => {
    const targets = Array.from({ length: 10 }, (_, index) => ({
      slug: `career-${index}`,
      urls: [`https://fermatmind.com/en/career/jobs/career-${index}`, `https://fermatmind.com/zh/career/jobs/career-${index}`],
    }));
    if (count === 19) targets[9].urls.pop();
    else targets[9].urls.push("https://fermatmind.com/en/career/jobs/extra");
    expect(validateExactTargetShape(targets).valid).toBe(false);
  });

  it("rejects a missing bilingual pair", () => {
    const targets = Array.from({ length: 10 }, (_, index) => ({
      slug: `career-${index}`,
      urls: [`https://fermatmind.com/en/career/jobs/career-${index}`, `https://fermatmind.com/en/career/jobs/duplicate-locale-${index}`],
    }));
    expect(validateExactTargetShape(targets)).toMatchObject({ valid: false, bilingual_pairs_complete: false });
  });

  it.each([
    ["held slug", (value: Candidate) => { value.held = true; }, "held_slug"],
    ["noindex", (value: Candidate) => { value.locales.zh.html.index_follow = false; value.locales.zh.html.robots = "noindex,follow"; }, "zh_not_index_follow"],
    ["canonical mismatch", (value: Candidate) => { value.locales.en.html.self_canonical = false; }, "en_canonical_mismatch"],
    ["stale reviewer", (value: Candidate) => { value.locales.en.review.stale = true; }, "en_review_stale"],
    ["content SHA drift invalidating the backend review projection", (value: Candidate) => { value.locales.zh.content_sha256 = "drift"; value.locales.zh.review.review_state = "unknown"; value.locales.zh.review.backend_private_package_match_projected = false; }, "zh_approved_package_projection_mismatch"],
    ["SEO SHA drift invalidating the backend review projection", (value: Candidate) => { value.locales.zh.seo_sha256 = "drift"; value.locales.zh.review.review_state = "unknown"; value.locales.zh.review.backend_private_package_match_projected = false; }, "zh_approved_package_projection_mismatch"],
    ["thin shell", (value: Candidate) => { value.locales.en.thin_or_shell = true; }, "en_thin_or_shell"],
    ["FAQ/schema mismatch", (value: Candidate) => { value.locales.zh.html.faq_question_count = 2; }, "zh_faq_schema_mismatch"],
  ])("fails closed for %s", (_label, mutate, reason) => {
    const value = candidate(1);
    mutate(value);
    const result = evaluateCandidateEvidence(value);
    expect(result.eligible_for_pilot).toBe(false);
    expect(result.rejection_reasons).toContain(reason);
  });

  it("holds when the complete candidate pool cannot supply ten passing rows", () => {
    const values = Array.from({ length: 10 }, (_, index) => candidate(index + 1));
    values[0].locales.en.thin_or_shell = true;
    const artifact = buildArtifact({ candidates: values, observedAt: OBSERVED_AT, source: { fixture: true } });
    expect(artifact).toMatchObject({ result: "HOLD", targets: [], hold_reason: "insufficient_eligible_candidates:9/10" });
    expect(artifact.negative_guarantees).toMatchObject({
      search_channel_action_performed: false,
      cms_or_database_write_performed: false,
      deploy_or_rollback_performed: false,
    });
  });
});

describe("CAREER-SEARCH-ENTRY-PILOT-READINESS-01 committed artifact", () => {
  it("is self-hashed, exact-sized, GO, and carries only read-only authority", () => {
    const artifact = JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8"));
    const { artifact_sha256: digest, ...body } = artifact;
    expect(digest).toBe(sha256(body));
    expect(artifact.result).toBe("GO");
    expect(validateExactTargetShape(artifact.targets)).toMatchObject({ valid: true, slug_count: 10, url_count: 20 });
    expect(artifact.evidence_summary).toMatchObject({
      exact_target_shape: true,
      bilingual_pairs_complete: true,
      all_api_and_pages_200: true,
      all_self_canonical_index_follow: true,
      all_sitemap_bilingual: true,
      all_reviewer_content_seo_evidence_current: true,
      all_faq_schema_aligned: true,
    });
    expect(
      artifact.targets.every((target: { locale_evidence: Record<string, { backend_private_package_match_projected: boolean; review_public_projection_sha256: string }> }) =>
        Object.values(target.locale_evidence).every((evidence) => evidence.backend_private_package_match_projected && /^[0-9a-f]{64}$/.test(evidence.review_public_projection_sha256))
      )
    ).toBe(true);
    expect(artifact.negative_guarantees).toMatchObject({
      unsupported_strong_claim_added: false,
      generated_or_modified_public_content: false,
      search_channel_action_performed: false,
      url_submission_performed: false,
      sitemap_mutation_performed: false,
      cms_or_database_write_performed: false,
      deploy_or_rollback_performed: false,
    });
  });
});
