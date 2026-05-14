import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { shouldIncludeInSitemap, shouldNoindex } from "@/lib/seo/indexingPolicy";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/seo/generated/june-seo-p0-mobile-seo-gate.v1.json");
const DOC_PATH = path.join(ROOT, "docs/seo/june-seo-p0-mobile-seo-gate.md");
const PACKAGE_PATH = path.join(ROOT, "package.json");

type MobileSeoGate = {
  version: string;
  scope: string;
  runtimeBehaviorChanged: boolean;
  urlSetChanged: boolean;
  sitemapChanged: boolean;
  llmsChanged: boolean;
  publicContentChanged: boolean;
  measurementMode: string;
  coreWebVitalsPolicy: {
    fieldDataRequiredForInp: boolean;
    thresholds: {
      lcp: { goodMs: number; needsImprovementMaxMs: number };
      cls: { good: number; needsImprovementMax: number };
      inp: { goodMs: number; needsImprovementMaxMs: number; requiresFieldData: boolean };
    };
  };
  requiredRouteFamilies: string[];
  routeSamples: Array<{
    family: string;
    path: string;
    locale: "en" | "zh";
    mobileChecks: string[];
    ctaPolicy: string;
    sourceFiles: Array<{ path: string; requiredTokens: string[] }>;
  }>;
  privateFlowIndexingDenySamples: string[];
  runtimeFetchPolicy: {
    defaultMode: string;
    optionalBaseUrlEnv: string;
    mustNotFetchProductionByDefault: boolean;
  };
  mustNotChange: string[];
};

function readGate(): MobileSeoGate {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as MobileSeoGate;
}

describe("June SEO P0 mobile SEO measurement gate", () => {
  it("is reproducible through the checked-in validator script", () => {
    const output = execFileSync("node", ["scripts/seo/check-mobile-seo-gate.mjs", "--json"], {
      cwd: ROOT,
      encoding: "utf8",
    });
    const summary = JSON.parse(output) as Record<string, boolean | number | string>;

    expect(summary).toMatchObject({
      version: "seo.june_p0_mobile_seo_gate.v1",
      scope: "PR-SEO-JUNE-04",
      routeSamples: 8,
      privateFlowDenySamples: 7,
      runtimeFetches: 0,
      runtimeBehaviorChanged: false,
      urlSetChanged: false,
      sitemapChanged: false,
      llmsChanged: false,
    });
  });

  it("covers the deterministic June public SEO route families without private-flow samples", () => {
    const gate = readGate();

    expect(gate.version).toBe("seo.june_p0_mobile_seo_gate.v1");
    expect(gate.scope).toBe("PR-SEO-JUNE-04");
    expect(gate.runtimeBehaviorChanged).toBe(false);
    expect(gate.urlSetChanged).toBe(false);
    expect(gate.sitemapChanged).toBe(false);
    expect(gate.llmsChanged).toBe(false);
    expect(gate.publicContentChanged).toBe(false);
    expect(gate.measurementMode).toBe("static_contract_plus_optional_runtime_fetch");
    expect(gate.requiredRouteFamilies).toEqual([
      "home",
      "tests_hub",
      "test_detail",
      "article_detail",
      "topic_detail",
      "personality_detail",
      "career_job_detail",
      "career_recommendation_detail",
    ]);
    expect(gate.routeSamples.map((sample) => sample.family)).toEqual(gate.requiredRouteFamilies);

    for (const sample of gate.routeSamples) {
      expect(sample.path).toMatch(/^\/(?:en|zh)(?:\/|$)/);
      expect(sample.path).not.toMatch(/\/(?:tests\/[^/]+\/take|result|results|orders|share|payment|pay|history)(?:\/|$)/);
      expect(shouldNoindex(sample.path, sample.locale), sample.path).toBe(false);
      expect(sample.mobileChecks).toEqual(expect.arrayContaining(["mobile_render_success", "main_content_present"]));
      if (sample.ctaPolicy !== "not_applicable") {
        expect(sample.mobileChecks).toContain("cta_visibility");
      }
    }
  });

  it("anchors every route sample to current source files and evidence tokens", () => {
    const gate = readGate();

    for (const sample of gate.routeSamples) {
      for (const source of sample.sourceFiles) {
        const absoluteSource = path.join(ROOT, source.path);
        expect(fs.existsSync(absoluteSource), `${sample.family}: ${source.path}`).toBe(true);
        const sourceText = fs.readFileSync(absoluteSource, "utf8");

        for (const token of source.requiredTokens) {
          expect(sourceText, `${sample.family}: ${source.path} missing ${token}`).toContain(token);
        }
      }
    }
  });

  it("documents mobile CWV thresholds while keeping INP field-data bounded", () => {
    const gate = readGate();
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(gate.coreWebVitalsPolicy.fieldDataRequiredForInp).toBe(true);
    expect(gate.coreWebVitalsPolicy.thresholds).toEqual({
      lcp: { goodMs: 2500, needsImprovementMaxMs: 4000 },
      cls: { good: 0.1, needsImprovementMax: 0.25 },
      inp: { goodMs: 200, needsImprovementMaxMs: 500, requiresFieldData: true },
    });
    expect(doc).toContain("INP requires field data");
    expect(doc).toContain("only a proxy");
    expect(doc).toContain("field CWV or RUM evidence");
  });

  it("keeps protected private flows noindex and out of sitemap eligibility", () => {
    const gate = readGate();

    for (const privatePath of gate.privateFlowIndexingDenySamples) {
      const locale = privatePath.startsWith("/zh") ? "zh" : "en";

      expect(privatePath).toMatch(/\/(?:tests\/[^/]+\/take|result|results|orders|share|payment|pay|history)(?:\/|$)/);
      expect(shouldNoindex(privatePath, locale), privatePath).toBe(true);
      expect(shouldIncludeInSitemap(privatePath), privatePath).toBe(false);
    }
  });

  it("registers a read-only package script and preserves train hard boundaries", () => {
    const gate = readGate();
    const packageJson = JSON.parse(fs.readFileSync(PACKAGE_PATH, "utf8")) as { scripts: Record<string, string> };

    expect(packageJson.scripts["seo:check-mobile"]).toBe("node scripts/seo/check-mobile-seo-gate.mjs");
    expect(gate.runtimeFetchPolicy).toMatchObject({
      defaultMode: "static_only",
      optionalBaseUrlEnv: "MOBILE_SEO_BASE_URL",
      mustNotFetchProductionByDefault: true,
    });
    expect(gate.mustNotChange).toEqual(
      expect.arrayContaining([
        "public route set",
        "sitemap URL set",
        "llms exposure",
        "public content copy",
        "runtime tracking behavior",
        "recommendation runtime",
        "scoring",
        "checkout/payment/report entitlement",
      ])
    );
  });
});
