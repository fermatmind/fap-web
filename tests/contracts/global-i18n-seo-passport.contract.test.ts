import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildI18nSeoPassport } from "@/lib/seo/i18nPassport";

const ROOT = process.cwd();
const DOC_PATH = path.join(ROOT, "docs/seo/i18n-seo-passport.md");
const ARTIFACT_PATH = path.join(ROOT, "docs/seo/generated/i18n-seo-passport.v1.json");
const ARTICLE_PAGE_PATH = path.join(ROOT, "app/(localized)/[locale]/articles/[slug]/page.tsx");
const TEST_PAGE_PATH = path.join(ROOT, "app/(localized)/[locale]/tests/[slug]/page.tsx");
const SCHEMA_HELPER_PATH = path.join(ROOT, "lib/seo/generateSchema.ts");

type I18nSeoPassportArtifact = {
  version: string;
  scope: string;
  sitemapUrlSetChanged: boolean;
  llmsExposureChanged: boolean;
  schemaOrgChanged: boolean;
  authority: {
    articleSiblingAlternates: string;
    frontendSlugParityAlternatesAllowed: boolean;
    testDetailAlternates: string;
  };
  rules: Array<{ id: string; pageFamily: string; rule: string }>;
  deferred: string[];
  mustNotChange: string[];
};

function readArtifact(): I18nSeoPassportArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as I18nSeoPassportArtifact;
}

describe("Global i18n SEO Passport baseline", () => {
  it("emits deterministic canonical, language alternates, and page-specific x-default from authority inputs", () => {
    const passport = buildI18nSeoPassport({
      canonical: "https://fermatmind.com/zh/tests/mbti-personality-test-16-personality-types",
      currentLocale: "zh",
      authorityAlternates: {
        en: "https://fermatmind.com/en/tests/mbti-personality-test-16-personality-types",
        "zh-CN": "https://fermatmind.com/zh/tests/mbti-personality-test-16-personality-types",
      },
      existingLanguages: {
        "x-default": "https://fermatmind.com/",
      },
    });

    expect(passport).toEqual({
      canonical: "https://fermatmind.com/zh/tests/mbti-personality-test-16-personality-types",
      languages: {
        en: "https://fermatmind.com/en/tests/mbti-personality-test-16-personality-types",
        "zh-CN": "https://fermatmind.com/zh/tests/mbti-personality-test-16-personality-types",
        "x-default": "https://fermatmind.com/en/tests/mbti-personality-test-16-personality-types",
      },
    });
  });

  it("preserves article x-default without fabricating unpublished sibling alternates", () => {
    const passport = buildI18nSeoPassport({
      canonical: "https://fermatmind.com/zh/articles/published-zh-only",
      currentLocale: "zh",
      authorityAlternates: {
        "zh-CN": "https://fermatmind.com/zh/articles/published-zh-only",
      },
      existingLanguages: {
        en: "https://fermatmind.com/en/articles/published-zh-only",
        "x-default": "https://fermatmind.com/",
      },
    });

    expect(passport.languages["zh-CN"]).toBe("https://fermatmind.com/zh/articles/published-zh-only");
    expect(passport.languages.en).toBeUndefined();
    expect(passport.languages["x-default"]).toBe("https://fermatmind.com/");
  });

  it("uses the current English canonical as x-default when an English article page is the known page", () => {
    const passport = buildI18nSeoPassport({
      canonical: "https://fermatmind.com/en/articles/english-only",
      currentLocale: "en",
      authorityAlternates: null,
      existingLanguages: {
        "x-default": "https://fermatmind.com/",
      },
    });

    expect(passport.languages.en).toBeUndefined();
    expect(passport.languages["zh-CN"]).toBeUndefined();
    expect(passport.languages["x-default"]).toBe("https://fermatmind.com/en/articles/english-only");
  });

  it("wires article and test detail metadata through the passport rules", () => {
    const articlePage = fs.readFileSync(ARTICLE_PAGE_PATH, "utf8");
    const testPage = fs.readFileSync(TEST_PAGE_PATH, "utf8");

    expect(articlePage).toContain("buildI18nSeoPassport");
    expect(articlePage).toContain("authorityAlternates: articleAlternateLanguages(seo)");
    expect(articlePage).toContain("existingLanguages: metadata.alternates?.languages");
    expect(articlePage).toContain("languages: passport.languages");
    expect(articlePage).not.toContain("languages: articleAlternateLanguages(seo)");

    expect(testPage).toContain('xDefault: alternates["x-default"]');
    expect(testPage).not.toContain('xDefault: "/"');
  });

  it("documents authority boundaries and keeps Schema.org expansion deferred", () => {
    const artifact = readArtifact();
    const doc = fs.readFileSync(DOC_PATH, "utf8");
    const schemaHelper = fs.readFileSync(SCHEMA_HELPER_PATH, "utf8");

    expect(artifact.version).toBe("seo.i18n_passport.v1");
    expect(artifact.scope).toBe("PR-SEO-01A");
    expect(artifact.sitemapUrlSetChanged).toBe(false);
    expect(artifact.llmsExposureChanged).toBe(false);
    expect(artifact.schemaOrgChanged).toBe(false);
    expect(artifact.authority).toMatchObject({
      articleSiblingAlternates: "backend_cms_published_sibling_payload",
      frontendSlugParityAlternatesAllowed: false,
      testDetailAlternates: "deterministic_published_route_family",
    });
    expect(artifact.deferred).toEqual(
      expect.arrayContaining(["SoftwareApplication schema", "Product schema", "AggregateRating schema", "Review schema"])
    );
    expect(doc).toContain("Backend/CMS owns published sibling alternate authority");
    expect(doc).toContain("does not synthesize `/en/articles/{same_slug}`");
    expect(doc).toContain("PR-SEO-01B will handle test-entry `SoftwareApplication` schema separately");
    expect(schemaHelper).not.toContain("SoftwareApplication");
    expect(schemaHelper).not.toContain("AggregateRating");
    expect(schemaHelper).not.toContain("Review");
  });
});
