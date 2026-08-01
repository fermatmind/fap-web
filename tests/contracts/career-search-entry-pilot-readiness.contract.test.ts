import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  buildArtifact,
  canonicalJson,
  evaluateCandidateEvidence,
  exactSitemapLocs,
  fetchStatus,
  inspectHtml,
  publicHtmlStats,
  selectPilot,
  sha256,
  validateExactTargetShape,
  unsupportedGuaranteeMatches,
} from "../../scripts/seo/generate-career-search-entry-pilot-readiness.mjs";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/seo/generated/career-search-entry-pilot-readiness-01.v1.json");
const OBSERVED_AT = "2026-08-01T12:00:00.000Z";

type LocaleEvidence = {
  url: string;
  detail_status: number;
  detail_canonical_slug: string;
  seo_authority_status: number;
  seo_endpoint_status: number;
  seo_source: "career_seo_endpoint" | "career_detail_seo_contract";
  page_status: number;
  page_final_url: string;
  x_robots_tag: string;
  sitemap_included: boolean;
  html: ReturnType<typeof inspectHtml>;
  seo: { metadata_contract_version: string; metadata_fingerprint: string; robots_policy: string; index_eligible: boolean; canonical: string; title: string; description: string; og_payload: { title: string; description: string }; twitter_payload: { title: string; description: string } };
  seo_sha256: string;
  metadata_matches_authority: boolean;
  metadata_observation_sha256: string;
  review: { review_state: string; reviewer_status: string; reviewed_at: string; stale: boolean; backend_private_package_match_projected: boolean; public_projection_sha256: string };
  content_version: string;
  content_sha256: string;
  quality_score: number;
  visible_text_chars: number;
  authority_visible_text_chars: number;
  render_authority_marker_count: number;
  render_authority_marker_sha256: string;
  render_authority_match: boolean;
  cjk_chars: number;
  faq_count: number;
  thin_or_shell: boolean;
  guarantee_matches: string[];
  public_guarantee_matches: string[];
};

type Candidate = {
  slug: string;
  tier: string;
  search_entry_eligible: boolean;
  held: boolean;
  sitemap_bilingual: boolean;
  quality_score: number;
  authority_tiers: { en: string; zh: string };
  locales: { en: LocaleEvidence; zh: LocaleEvidence };
};

function html(url: string, title = url.split("/").at(-1) || "career"): string {
  const description = `${title} description`;
  return `<html><head><title>${title} | FermatMind</title><link rel="canonical" href="${url}"/><meta name="robots" content="index, follow"/><meta name="description" content="${description}"/><meta property="og:title" content="${title}"/><meta property="og:description" content="${description}"/><meta name="twitter:title" content="${title}"/><meta name="twitter:description" content="${description}"/><script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "BreadcrumbList", itemListElement: [] },
      { "@type": "FAQPage", mainEntity: [1, 2, 3].map((position) => ({ "@type": "Question", name: `Question ${position}`, acceptedAnswer: { "@type": "Answer", text: `Answer ${position}` } })) },
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
    detail_canonical_slug: slug,
    seo_authority_status: 200,
    seo_endpoint_status: 200,
    seo_source: "career_seo_endpoint",
    page_status: 200,
    page_final_url: url,
    x_robots_tag: "",
    sitemap_included: true,
    html: inspectHtml(html(url), url),
    seo: { metadata_contract_version: "seo.surface.v1", metadata_fingerprint: `${locale}-${slug}`, robots_policy: "index,follow", index_eligible: true, canonical: url, title: slug, description: `${slug} description`, og_payload: { title: slug, description: `${slug} description` }, twitter_payload: { title: slug, description: `${slug} description` } },
    seo_sha256: seoSha,
    metadata_matches_authority: true,
    metadata_observation_sha256: sha256({ locale, slug, kind: "metadata" }),
    review: { review_state: "approved", reviewer_status: "approved", reviewed_at: "2026-07-31T23:56:27.000Z", stale: false, backend_private_package_match_projected: true, public_projection_sha256: sha256({ locale, slug, kind: "review" }) },
    content_version: "reviewed.v1",
    content_sha256: contentSha,
    quality_score: 60,
    visible_text_chars: 2400,
    authority_visible_text_chars: 2400,
    render_authority_marker_count: 8,
    render_authority_marker_sha256: sha256({ locale, slug, kind: "render-markers" }),
    render_authority_match: true,
    cjk_chars: locale === "zh" ? 500 : 0,
    faq_count: 3,
    thin_or_shell: false,
    guarantee_matches: [],
    public_guarantee_matches: [],
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
    authority_tiers: { en: index <= 2 ? "stable" : "approved_candidate", zh: index <= 2 ? "stable" : "approved_candidate" },
    locales: { en: localeEvidence(slug, "en"), zh: localeEvidence(slug, "zh") },
    ...overrides,
  };
}

function evaluated(count = 12) {
  return Array.from({ length: count }, (_, index) => evaluateCandidateEvidence(candidate(index + 1)));
}

describe("CAREER-SEARCH-ENTRY-PILOT-READINESS-01 selector", () => {
  it("measures visible thickness from rendered body text, excluding head and scripts", () => {
    const shell = `<html><head><title>${"metadata ".repeat(500)}</title></head ignored><body><main>short shell</main><script>${"payload ".repeat(500)}</script\t\n ignored></body></html>`;
    expect(publicHtmlStats(shell, "en")).toMatchObject({ visible_text_chars: 11, thin_or_shell: true });
    const rendered = `<html><body><main>${"visible career evidence ".repeat(100)}</main></body></html>`;
    expect(publicHtmlStats(rendered, "en").thin_or_shell).toBe(false);
  });

  it("preserves exact sitemap loc values for membership checks", () => {
    const expected = "https://fermatmind.com/en/career/jobs/career-01";
    const variants = [
      `${expected}/`,
      `${expected}?source=sitemap`,
      "https://www.fermatmind.com/en/career/jobs/career-01",
      "/en/career/jobs/career-01",
    ];
    const locs = exactSitemapLocs({ items: variants.map((loc) => ({ loc })) });
    expect(locs.has(expected)).toBe(false);
    expect([...locs]).toEqual(variants);
  });

  it.each([
    "https://www.fermatmind.com/en/career/jobs/career-01",
    "https://fermatmind.com/en/career/jobs/career-01/",
    "https://fermatmind.com/en//career/jobs/career-01",
    "https://fermatmind.com/en/career/jobs/career-01?source=canonical",
  ])("rejects a lossy-normalized canonical variant: %s", (canonical) => {
    const expected = "https://fermatmind.com/en/career/jobs/career-01";
    expect(inspectHtml(html(canonical), expected)).toMatchObject({ canonical, self_canonical: false });
  });

  it("accepts only a canonical link inside the document head", () => {
    const expected = "https://fermatmind.com/en/career/jobs/career-01";
    const invalid = `<html><head><meta rel="canonical" href="${expected}"/><meta name="robots" content="index, follow"/></head><body><link rel="canonical" href="${expected}"/></body></html>`;
    expect(inspectHtml(invalid, expected)).toMatchObject({ canonical: "", self_canonical: false });
  });

  it("does not treat data-prefixed attributes as canonical or robots signals", () => {
    const expected = "https://fermatmind.com/en/career/jobs/career-01";
    const invalid = `<html><head><link data-rel="canonical" href="${expected}"/><meta data-name="robots" content="index, follow"/></head><body></body></html>`;
    expect(inspectHtml(invalid, expected)).toMatchObject({ canonical: "", canonical_count: 0, self_canonical: false, robots_values: [], index_follow: false });
  });

  it("rejects duplicate canonical links even when the first one is exact", () => {
    const expected = "https://fermatmind.com/en/career/jobs/career-01";
    const duplicate = html(expected).replace("</head>", `<link rel="canonical" href="${expected}/other"/></head>`);
    expect(inspectHtml(duplicate, expected)).toMatchObject({ canonical: "", canonical_count: 2, self_canonical: false });
  });

  it("extracts the exact live title, description, Open Graph, and Twitter metadata", () => {
    const url = "https://fermatmind.com/en/career/jobs/career-01";
    expect(inspectHtml(html(url, "Career 01"), url).metadata).toEqual({
      title: "Career 01 | FermatMind",
      description: "Career 01 description",
      og_title: "Career 01",
      og_description: "Career 01 description",
      twitter_title: "Career 01",
      twitter_description: "Career 01 description",
    });
  });

  it("rejects duplicate live metadata instead of accepting the first value", () => {
    const url = "https://fermatmind.com/en/career/jobs/career-01";
    const duplicate = html(url, "Career 01").replace("</head>", '<meta name="description" content="stale description"/></head>');
    expect(inspectHtml(duplicate, url).metadata.description).toBe("");
  });

  it("uses manual redirect handling so an exact target redirect cannot become a destination 200", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      status: 302,
      url: "https://fermatmind.com/en/career/jobs/career-01",
      text: async () => "",
      headers: new Headers({ "x-robots-tag": "noindex" }),
    } as Response);
    const result = await fetchStatus("https://fermatmind.com/en/career/jobs/career-01", 1000, false);
    expect(fetchMock).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      redirect: "manual",
      headers: expect.objectContaining({ "User-Agent": expect.stringContaining("Googlebot") }),
    }));
    expect(result.status).toBe(302);
    expect(result.x_robots_tag).toBe("noindex");
    fetchMock.mockRestore();
  });

  it("does not let an unrelated negated clause hide a positive guarantee", () => {
    expect(unsupportedGuaranteeMatches("You do not need prior experience; employment is guaranteed.")).toEqual(["employment is guaranteed"]);
    expect(unsupportedGuaranteeMatches("You do not need prior experience and employment is guaranteed.")).toEqual(["employment is guaranteed"]);
    expect(unsupportedGuaranteeMatches("Employment is guaranteed without prior experience.")).toEqual(["Employment is guaranteed without prior experience"]);
    expect(unsupportedGuaranteeMatches("Employment is not guaranteed.")).toEqual([]);
  });

  it.each([
    "We guarantee that you will get a job.",
    "We guarantee you a job.",
  ])("detects a guarantee with intervening words: %s", (claim) => {
    expect(unsupportedGuaranteeMatches(claim)).toHaveLength(1);
  });

  it("scans rendered public body copy for guarantees independently of API content", () => {
    const rendered = `<html><body><main>${"career evidence ".repeat(150)} We guarantee that you will get a job.</main></body></html>`;
    const matches = publicHtmlStats(rendered, "en").guarantee_matches;
    expect(matches).toHaveLength(1);
    expect(matches[0]).toContain("We guarantee that you will get a job");
  });

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
    ["detail canonical slug mismatch", (value: Candidate) => { value.locales.en.detail_canonical_slug = "different-career"; }, "en_detail_canonical_slug_mismatch"],
    ["noindex", (value: Candidate) => { value.locales.zh.html.index_follow = false; value.locales.zh.html.robots = "noindex,follow"; }, "zh_not_index_follow"],
    ["canonical mismatch", (value: Candidate) => { value.locales.en.html.self_canonical = false; }, "en_canonical_mismatch"],
    ["redirected final URL", (value: Candidate) => { value.locales.en.page_final_url = `${value.locales.en.url}/`; }, "en_page_final_url_mismatch"],
    ["X-Robots-Tag noindex", (value: Candidate) => { value.locales.en.x_robots_tag = "noindex, nofollow"; }, "en_x_robots_not_indexable"],
    ["X-Robots-Tag none", (value: Candidate) => { value.locales.en.x_robots_tag = "none"; }, "en_x_robots_not_indexable"],
    ["stale live metadata", (value: Candidate) => { value.locales.en.metadata_matches_authority = false; }, "en_metadata_authority_mismatch"],
    ["rendered public guarantee", (value: Candidate) => { value.locales.en.public_guarantee_matches = ["We guarantee that you will get a job"]; }, "en_unsupported_public_guarantee_claim"],
    ["bilingual authority tier drift", (value: Candidate) => { value.authority_tiers.zh = "approved_candidate"; }, "search_entry_tier_locale_drift"],
    ["stale rendered authority markers", (value: Candidate) => { value.locales.en.render_authority_match = false; }, "en_rendered_authority_marker_mismatch"],
    ["SEO canonical mismatch", (value: Candidate) => { value.locales.zh.seo.canonical = `${value.locales.zh.url}/other`; }, "zh_seo_canonical_mismatch"],
    ["malformed FAQ entity", (value: Candidate) => { value.locales.en.html.faq_entities_valid = false; }, "en_faq_entities_invalid"],
    ["conflicting robots meta", (value: Candidate) => { value.locales.en.html.robots_values = ["index,follow", "noindex,follow"]; value.locales.en.html.robots = "index,follow|noindex,follow"; value.locales.en.html.index_follow = false; }, "en_not_index_follow"],
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

  it("returns HOLD with zero targets when a nominal selection has duplicate slugs or URLs", () => {
    const values = Array.from({ length: 10 }, (_, index) => candidate(index + 1));
    values[9] = candidate(9);
    const artifact = buildArtifact({ candidates: values, observedAt: OBSERVED_AT, source: { fixture: true } });
    expect(artifact).toMatchObject({
      result: "HOLD",
      targets: [],
      target_set_sha256: null,
      rollback_batch_id: null,
      hold_reason: "invalid_exact_target_shape:10/20",
    });
    expect(artifact.evidence_summary.exact_target_shape).toBe(false);
  });

  it("rejects a missing locale authority projection without throwing", () => {
    const value = candidate(1);
    value.locales.zh.review.review_state = "unknown";
    value.locales.zh.review.reviewed_at = "";
    value.locales.zh.review.backend_private_package_match_projected = false;
    const result = evaluateCandidateEvidence(value);
    expect(result.eligible_for_pilot).toBe(false);
    expect(result.rejection_reasons).toContain("zh_approved_package_projection_mismatch");
  });
});

describe("CAREER-SEARCH-ENTRY-PILOT-READINESS-01 committed artifact", () => {
  it("is self-hashed, fail-closed, and carries only read-only authority", () => {
    const artifact = JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8"));
    const { artifact_sha256: digest, ...body } = artifact;
    expect(digest).toBe(sha256(body));
    expect(["GO", "HOLD"]).toContain(artifact.result);
    if (artifact.result === "GO") {
      expect(validateExactTargetShape(artifact.targets)).toMatchObject({ valid: true, slug_count: 10, url_count: 20 });
      expect(artifact.evidence_summary).toMatchObject({
        exact_target_shape: true,
        bilingual_pairs_complete: true,
        all_detail_api_and_pages_200: true,
        all_seo_authority_resolved: true,
        all_seo_canonical_exact: true,
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
      const localeEvidence = artifact.targets.flatMap((target: { locale_evidence: Record<string, { seo_authority_status: number; seo_endpoint_status: number; seo_source: string }> }) => Object.values(target.locale_evidence));
      expect(localeEvidence).toHaveLength(20);
      expect(localeEvidence.every((evidence: { seo_authority_status: number }) => evidence.seo_authority_status === 200)).toBe(true);
      expect(localeEvidence.filter((evidence: { seo_endpoint_status: number }) => evidence.seo_endpoint_status === 200)).toHaveLength(artifact.evidence_summary.dedicated_seo_endpoint_200_count);
      expect(localeEvidence.filter((evidence: { seo_source: string }) => evidence.seo_source === "career_detail_seo_contract")).toHaveLength(artifact.evidence_summary.detail_seo_contract_fallback_count);
    } else {
      expect(artifact.targets).toEqual([]);
      expect(artifact.target_set_sha256).toBeNull();
      expect(artifact.rollback_batch_id).toBeNull();
      expect(artifact.hold_reason).toMatch(/^(?:insufficient_eligible_candidates:\d+\/10|invalid_exact_target_shape:\d+\/\d+)$/);
      expect(artifact.evidence_summary.exact_target_shape).toBe(false);
    }
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
