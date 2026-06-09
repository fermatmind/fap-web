import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  SCIENCE_CONTENTPAGE_SLUGS,
  buildConfig,
} from "../../scripts/seo/check-science-contentpage-live-exposure.mjs";

const ROOT = process.cwd();
const SCRIPT_PATH = path.join(ROOT, "scripts/seo/check-science-contentpage-live-exposure.mjs");
const PACKAGE_JSON_PATH = path.join(ROOT, "package.json");

const EXPECTED_SLUGS = [
  "science",
  "item-design-notes",
  "reliability-validity",
  "data-privacy",
  "common-misconceptions",
];

function readSource(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

describe("Science ContentPage live exposure monitor", () => {
  it("pins the five approved English Science ContentPage routes", () => {
    expect(SCIENCE_CONTENTPAGE_SLUGS).toEqual(EXPECTED_SLUGS);

    const source = fs.readFileSync(SCRIPT_PATH, "utf8");
    expect(source).toContain("/content-pages/${slug}?locale=en");
    expect(source).toContain("const route = `/en/${slug}`");
    for (const slug of EXPECTED_SLUGS) {
      expect(source).toContain(slug);
    }
  });

  it("keeps the live checks fail-closed across API gates sitemap llms and footer", () => {
    const source = readSource("scripts/seo/check-science-contentpage-live-exposure.mjs");

    expect(source).toContain("status: page?.status === \"published\"");
    expect(source).toContain("review_state: page?.review_state === \"approved\"");
    expect(source).toContain("is_public: page?.is_public === true");
    expect(source).toContain("is_indexable: page?.is_indexable === true");
    expect(source).toContain("publish_allowed: page?.publish_allowed === true");
    expect(source).toContain("claim_gate_status: page?.claim_gate_status === \"passed\"");
    expect(source).toContain("seo_title");
    expect(source).toContain("meta_description");
    expect(source).toContain("/sitemap.xml");
    expect(source).toContain("/llms.txt");
    expect(source).toContain("hasFooterHref");
    expect(source).toContain("process.exit(result.ok ? 0 : 1)");
  });

  it("defaults to production hosts and blocks unexpected monitor targets", () => {
    expect(buildConfig({} as NodeJS.ProcessEnv)).toMatchObject({
      siteBaseUrl: "https://fermatmind.com",
      apiBaseUrl: "https://api.fermatmind.com",
      allowedHosts: ["fermatmind.com", "api.fermatmind.com"],
    });

    expect(() =>
      buildConfig({
        SCIENCE_CONTENTPAGE_SITE_BASE_URL: "https://example.com",
        SCIENCE_CONTENTPAGE_API_BASE_URL: "https://api.fermatmind.com",
      } as unknown as NodeJS.ProcessEnv)
    ).toThrow("unexpected_monitor_host=example.com");
  });

  it("exposes a package script for cron or manual production regression checks", () => {
    const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, "utf8"));

    expect(packageJson.scripts["seo:check-science-contentpage-live-exposure"]).toBe(
      "node scripts/seo/check-science-contentpage-live-exposure.mjs"
    );
  });
});
