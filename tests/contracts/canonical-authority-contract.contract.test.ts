import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildPageMetadata, resolveCanonicalAuthority } from "@/lib/seo/metadata";

const ROOT = process.cwd();
const ARTICLE_PAGE_PATH = path.join(ROOT, "app/(localized)/[locale]/articles/[slug]/page.tsx");
const TEST_PAGE_PATH = path.join(ROOT, "app/(localized)/[locale]/tests/[slug]/page.tsx");
const DOC_PATH = path.join(ROOT, "docs/seo/canonical-authority-contract.md");
const ARTIFACT_PATH = path.join(ROOT, "docs/seo/generated/canonical-authority-contract.v1.json");

type CanonicalAuthorityArtifact = {
  version: string;
  scope: string;
  sitemapUrlSetChanged: boolean;
  llmsExposureChanged: boolean;
  schemaOrgChanged: boolean;
  authority: {
    backendCmsCanonical: string;
    articleDetailCanonical: string;
    testDetailCanonical: string;
    hreflangAlternates: string;
    frontendSlugParityAlternatesAllowed: boolean;
  };
  canonicalDecisionStatuses: string[];
  rejectedTargets: string[];
  privatePathFamilies: string[];
  mustNotChange: string[];
};

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function readArtifact(): CanonicalAuthorityArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as CanonicalAuthorityArtifact;
}

describe("canonical authority contract", () => {
  it("accepts or normalizes safe self-referencing article canonicals", () => {
    const decision = resolveCanonicalAuthority({
      candidate: "https://fermatmind.com/zh/articles/canonical-authority",
      expectedPathname: "/zh/articles/canonical-authority",
      currentLocale: "zh",
      routeFamily: "article_detail",
    });

    expect(["accepted", "normalized"]).toContain(decision.status);
    expect(decision.canonicalPathname).toBe("/zh/articles/canonical-authority");
    expect(decision.reason).toMatch(/canonical candidate/);
  });

  it("defers to the current route when no backend/CMS canonical candidate exists", () => {
    const decision = resolveCanonicalAuthority({
      candidate: null,
      expectedPathname: "/en/tests/mbti-personality-test-16-personality-types",
      currentLocale: "en",
      routeFamily: "test_detail",
    });

    expect(decision.status).toBe("deferred");
    expect(decision.canonicalPathname).toBe("/en/tests/mbti-personality-test-16-personality-types");
  });

  it("rejects unsafe article canonical targets and falls back to self-reference", () => {
    const expectedPathname = "/zh/articles/canonical-authority";
    const candidates = [
      "https://evil.example/zh/articles/canonical-authority",
      "https://fermatmind.com/",
      "https://fermatmind.com/en/articles/canonical-authority",
      "https://fermatmind.com/zh/articles/unpublished-sibling",
      "https://fermatmind.com/zh/tests/mbti-personality-test-16-personality-types/take",
      "https://fermatmind.com/zh/articles/canonical-authority?utm_source=test",
      "/zh/result/demo",
    ];

    for (const candidate of candidates) {
      const decision = resolveCanonicalAuthority({
        candidate,
        expectedPathname,
        currentLocale: "zh",
        routeFamily: "article_detail",
      });

      expect(decision.status, candidate).toBe("rejected");
      expect(decision.canonicalPathname, candidate).toBe(expectedPathname);
    }
  });

  it("keeps buildPageMetadata canonical self-referential when seo surface candidate is unsafe", () => {
    const metadata = buildPageMetadata({
      locale: "zh",
      pathname: "/zh/articles/canonical-authority",
      canonicalPathname: "/zh/articles/canonical-authority",
      canonicalCandidate: "https://fermatmind.com/en/articles/canonical-authority",
      canonicalRouteFamily: "article_detail",
      title: "Canonical Authority",
      description: "Canonical authority contract.",
      alternatesByLocale: {
        en: "/en/articles/canonical-authority",
        zh: "/zh/articles/canonical-authority",
        xDefault: "/",
      },
    });

    expect(String(metadata.alternates?.canonical)).toMatch(/\/zh\/articles\/canonical-authority$/);
    expect(String(metadata.alternates?.canonical)).not.toContain("/en/articles/");
  });

  it("wires article and test detail metadata through canonical route-family guardrails", () => {
    const articlePage = fs.readFileSync(ARTICLE_PAGE_PATH, "utf8");
    const testPage = fs.readFileSync(TEST_PAGE_PATH, "utf8");

    expect(articlePage).toContain("const canonicalCandidate = seo?.surface?.canonicalUrl ?? seo?.meta.canonical");
    expect(articlePage).toContain('canonicalRouteFamily: "article_detail"');
    expect(articlePage).toContain('const canonical = String(metadata.alternates?.canonical ?? "")');
    expect(articlePage).not.toContain("function pathFromCanonicalUrl");
    expect(articlePage).not.toContain("const canonical = seo?.surface?.canonicalUrl");

    expect(testPage).toContain('canonicalRouteFamily: "test_detail"');
    expect(testPage).toContain('xDefault: alternates["x-default"]');
    expect(testPage).not.toContain('xDefault: "/"');
  });

  it("preserves i18n passport and structured-data scope boundaries", () => {
    const articlePage = fs.readFileSync(ARTICLE_PAGE_PATH, "utf8");
    const testPage = fs.readFileSync(TEST_PAGE_PATH, "utf8");
    const schemaHelper = read("lib/seo/generateSchema.ts");

    expect(articlePage).toContain("buildI18nSeoPassport");
    expect(articlePage).toContain("authorityAlternates: articleAlternateLanguages(seo)");
    expect(articlePage).not.toContain("languages: articleAlternateLanguages(seo)");
    expect(testPage).toContain("buildTestSoftwareAppJsonLd");

    expect(schemaHelper).not.toContain("AggregateRating");
    expect(schemaHelper).not.toContain("Review");
    expect(schemaHelper).not.toContain('"@type": "Product"');
    expect(schemaHelper).not.toContain('"@type": "Offer"');
  });

  it("documents the canonical authority contract and forbidden exposure changes", () => {
    const doc = fs.readFileSync(DOC_PATH, "utf8");
    const artifact = readArtifact();

    expect(artifact.version).toBe("seo.canonical_authority.v1");
    expect(artifact.scope).toBe("PR-SEO-01C");
    expect(artifact.sitemapUrlSetChanged).toBe(false);
    expect(artifact.llmsExposureChanged).toBe(false);
    expect(artifact.schemaOrgChanged).toBe(false);
    expect(artifact.authority).toMatchObject({
      backendCmsCanonical: "accepted_only_when_safe_public_route_consistent_locale_correct",
      articleDetailCanonical: "self_referencing_current_localized_article_url",
      testDetailCanonical: "self_referencing_current_localized_test_url",
      frontendSlugParityAlternatesAllowed: false,
    });
    expect(artifact.canonicalDecisionStatuses).toEqual(["accepted", "normalized", "rejected", "deferred"]);
    expect(artifact.rejectedTargets).toEqual(
      expect.arrayContaining(["homepage_fallback_for_detail_pages", "wrong_locale", "private_or_noindex_flow"])
    );
    expect(doc).toContain("Backend/CMS canonical values remain authoritative only when they are safe");
    expect(doc).toContain("Hreflang alternates are sibling references");
    expect(doc).toContain("does not move content ownership into frontend code");
  });
});
