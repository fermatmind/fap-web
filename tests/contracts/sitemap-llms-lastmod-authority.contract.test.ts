import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { afterEach, describe, expect, it, vi } from "vitest";
import { shouldIncludeInSitemap, shouldNoindex } from "@/lib/seo/indexingPolicy";

const ROOT = process.cwd();
const requireFromRoot = createRequire(path.join(ROOT, "package.json"));
const ARTIFACT_PATH = path.join(ROOT, "docs/seo/generated/june-seo-p0-sitemap-llms-authority-lastmod.v1.json");
const DOC_PATH = path.join(ROOT, "docs/seo/june-seo-p0-sitemap-llms-authority-lastmod.md");
const NEXT_SITEMAP_PATH = path.join(ROOT, "next-sitemap.config.js");

type SourceTokenCheck = {
  path: string;
  requiredTokens: string[];
  forbiddenTokens: string[];
};

type LastmodAuthorityArtifact = {
  version: string;
  scope: string;
  runtimeBehaviorChanged: boolean;
  urlSetChanged: boolean;
  sitemapUrlSetChanged: boolean;
  llmsExposureChanged: boolean;
  llmsFullExposureChanged: boolean;
  publicContentChanged: boolean;
  sitemapLastmodPolicy: {
    autoLastmod: boolean;
    buildTimeNowForbidden: boolean;
    defaultWhenNoAuthorityTimestamp: string;
    staticFrontendPathsWithoutAuthorityTimestamp: string;
  };
  sourceTokenChecks: SourceTokenCheck[];
  privateFlowDenySamples: string[];
  mustNotChange: string[];
};

function readArtifact(): LastmodAuthorityArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as LastmodAuthorityArtifact;
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function loadSitemapConfig(): {
  autoLastmod: boolean;
  transform: (_config: unknown, path: string) => Promise<Record<string, unknown> | null>;
  additionalPaths: () => Promise<Array<Record<string, unknown>>>;
} {
  delete requireFromRoot.cache[requireFromRoot.resolve("./next-sitemap.config.js")];
  return requireFromRoot("./next-sitemap.config.js");
}

afterEach(() => {
  delete requireFromRoot.cache[requireFromRoot.resolve("./next-sitemap.config.js")];
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe("sitemap and llms lastmod authority gate", () => {
  it("removes build-time lastmod drift from next-sitemap transform", async () => {
    const config = loadSitemapConfig();
    const source = fs.readFileSync(NEXT_SITEMAP_PATH, "utf8");

    expect(config.autoLastmod).toBe(false);
    expect(source).toContain("autoLastmod: false");
    expect(source).not.toContain("lastmod: new Date().toISOString()");

    vi.useFakeTimers();
    vi.setSystemTime(new Date("2030-01-01T00:00:00.000Z"));
    const first = await config.transform({}, "/en/tests");
    vi.setSystemTime(new Date("2040-01-01T00:00:00.000Z"));
    const second = await config.transform({}, "/en/tests");

    expect(first).toEqual(second);
    expect(first).toMatchObject({
      loc: "/en/tests",
      changefreq: "weekly",
      priority: 0.7,
    });
    expect(first).not.toHaveProperty("lastmod");
  });

  it("keeps additional sitemap paths URL-compatible while omitting synthetic lastmod", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          items: [],
          pagination: { last_page: 1 },
        })
      )
    );

    const config = loadSitemapConfig();
    const additionalPaths = await config.additionalPaths();
    const locs = additionalPaths.map((entry) => String(entry.loc ?? ""));

    expect(locs).toEqual(
      expect.arrayContaining([
        "/",
        "/en",
        "/en/tests",
        "/zh/tests",
        "/en/topics/mbti",
        "/zh/topics/mbti",
      ])
    );
    expect(locs).not.toContain("/en/help/about");
    expect(locs).not.toContain("/en/help/contact");
    expect(locs).not.toContain("/en/help/faq");
    expect(locs).not.toContain("/en/help/for-business-and-research");
    expect(locs).not.toContain("/en/help/team");
    expect(locs).not.toContain("/en/help/used-and-mentioned");
    expect(locs).not.toContain("/zh/help/contact");
    expect(locs).not.toContain("/zh/help/faq");
    expect(locs).not.toContain("/zh/help/for-business-and-research");
    expect(locs).not.toContain("/en/method-boundaries");
    expect(locs).not.toContain("/zh/method-boundaries");
    expect(locs).not.toContain("/zh/policies");
    expect(locs).not.toContain("/en/privacy");
    expect(locs).not.toContain("/zh/privacy");
    expect(locs).not.toContain("/en/support");
    expect(locs).not.toContain("/zh/support");
    expect(locs).not.toContain("/en/terms");
    expect(locs).not.toContain("/zh/terms");
    expect(new Set(locs).size).toBe(locs.length);
    expect(additionalPaths.every((entry) => !("lastmod" in entry))).toBe(true);
    expect(locs).not.toEqual(expect.arrayContaining(["/en/tests/mbti-personality-test-16-personality-types/take"]));
  });

  it("keeps private/noindex families excluded from sitemap eligibility", async () => {
    const artifact = readArtifact();
    const config = loadSitemapConfig();

    for (const privatePath of artifact.privateFlowDenySamples) {
      const locale = privatePath.startsWith("/zh") ? "zh" : "en";

      expect(shouldNoindex(privatePath, locale), privatePath).toBe(true);
      expect(shouldIncludeInSitemap(privatePath), privatePath).toBe(false);
      await expect(config.transform({}, privatePath)).resolves.toBeNull();
    }
  });

  it("anchors sitemap and llms authority tokens without expanding exposure", () => {
    const artifact = readArtifact();
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(artifact).toMatchObject({
      version: "seo.june_p0_sitemap_llms_authority_lastmod.v1",
      scope: "PR-SEO-JUNE-05",
      runtimeBehaviorChanged: false,
      urlSetChanged: false,
      sitemapUrlSetChanged: false,
      llmsExposureChanged: false,
      llmsFullExposureChanged: false,
      publicContentChanged: false,
    });
    expect(artifact.sitemapLastmodPolicy).toMatchObject({
      autoLastmod: false,
      buildTimeNowForbidden: true,
      defaultWhenNoAuthorityTimestamp: "omit_lastmod",
      staticFrontendPathsWithoutAuthorityTimestamp: "omit_lastmod",
    });
    expect(doc).toContain("URL set changed: no.");
    expect(doc).toContain("`llms.txt` exposure changed: no.");
    expect(doc).toContain("When no authoritative timestamp is available, the sitemap entry must omit");

    for (const check of artifact.sourceTokenChecks) {
      const sourceText = fs.readFileSync(path.join(ROOT, check.path), "utf8");

      for (const token of check.requiredTokens) {
        expect(sourceText, `${check.path} missing ${token}`).toContain(token);
      }

      for (const token of check.forbiddenTokens) {
        expect(sourceText, `${check.path} must not contain ${token}`).not.toContain(token);
      }
    }
  });

  it("documents hard boundaries for sitemap, llms, topic fallback, and business-critical systems", () => {
    const artifact = readArtifact();

    expect(artifact.mustNotChange).toEqual(
      expect.arrayContaining([
        "public route set",
        "sitemap URL set expansion",
        "llms exposure expansion",
        "llms-full exposure expansion",
        "topic fallback expansion",
        "public content copy",
        "runtime tracking behavior",
        "recommendation runtime",
        "scoring",
        "checkout/payment/report entitlement",
      ])
    );
  });
});
