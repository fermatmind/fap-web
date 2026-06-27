import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const SCRIPT_PATH = "generated/career-seo-geo-query-intent-audit/run_career_query_intent_candidate_layer.mjs";

function readSource(): string {
  return readFileSync(SCRIPT_PATH, "utf8");
}

describe("CodeQL 143 career query audit URL boundary", () => {
  it("pins outbound audit origins to FermatMind-owned hosts", () => {
    const source = readSource();

    expect(source).toContain('const ALLOWED_LIVE_ORIGIN = "https://fermatmind.com";');
    expect(source).toContain('const ALLOWED_API_ORIGIN = "https://api.fermatmind.com";');
    expect(source).toContain("function requireAllowedOrigin(value, expected, label)");
    expect(source).toContain('throw new Error(`${label} must be ${expected}`);');
  });

  it("validates slug-plan data before it can shape request URLs", () => {
    const source = readSource();

    expect(source).toContain("const CAREER_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;");
    expect(source).toContain("function requireCareerSlug(value)");
    expect(source).toContain("slug: requireCareerSlug(slug.slug)");
    expect(source).toContain("function buildCareerPageUrl(locale, slug)");
    expect(source).toContain("function buildCareerApiUrl(locale, slug)");
    expect(source).toContain("new URL(`/${localePrefix}/career/jobs/${requireCareerSlug(slug)}`, LIVE_ORIGIN).toString()");
    expect(source).toContain("new URL(`/api/v0.5/career/jobs/${requireCareerSlug(slug)}`, API_ORIGIN)");
  });

  it("keeps the fetch sink behind a FermatMind career audit URL allowlist", () => {
    const source = readSource();

    expect(source).toContain("function assertAllowedAuditRequestUrl(value)");
    expect(source).toContain("assertAllowedAuditRequestUrl(url);");
    expect(source).toContain("url.origin === LIVE_ORIGIN");
    expect(source).toContain("url.origin === API_ORIGIN");
    expect(source).toContain("params.length === 1");
    expect(source).toContain("Blocked non-FermatMind career audit URL");
    expect(source).toContain("lgtm[js/file-access-to-http]");
  });

  it("does not directly template file-backed slugs into outbound URLs", () => {
    const source = readSource();

    expect(source).not.toContain("page_url: `${LIVE_ORIGIN}/");
    expect(source).not.toContain("api_url: `${API_ORIGIN}/");
    expect(source).toContain("page_url: buildCareerPageUrl(locale, slug.slug)");
    expect(source).toContain("api_url: buildCareerApiUrl(locale, slug.slug)");
    expect(source).toContain("const expectedCanonical = buildCareerPageUrl(target.locale, target.slug);");
  });
});
