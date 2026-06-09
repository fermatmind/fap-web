import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  ZH_SCIENCE_FOOTER_LINKS,
  buildConfig,
} from "../../scripts/seo/check-science-contentpage-zh-footer-links.mjs";

const ROOT = process.cwd();
const SCRIPT_PATH = path.join(ROOT, "scripts/seo/check-science-contentpage-zh-footer-links.mjs");
const PACKAGE_JSON_PATH = path.join(ROOT, "package.json");

const EXPECTED_LINKS = [
  { path: "/zh/science", href: "/science", label: "测评科学" },
  { path: "/zh/method-boundaries", href: "/method-boundaries", label: "方法边界" },
  { path: "/zh/item-design-notes", href: "/item-design-notes", label: "题目设计说明" },
  { path: "/zh/reliability-validity", href: "/reliability-validity", label: "信度效度" },
  { path: "/zh/data-privacy", href: "/data-privacy", label: "数据说明" },
  { path: "/zh/common-misconceptions", href: "/common-misconceptions", label: "常见误区" },
];

describe("Chinese Science ContentPage footer link checker", () => {
  it("pins the six approved zh footer links", () => {
    expect(ZH_SCIENCE_FOOTER_LINKS).toEqual(EXPECTED_LINKS);
  });

  it("checks footer source links and 200 routes without enabling sitemap or llms exposure", () => {
    const source = fs.readFileSync(SCRIPT_PATH, "utf8");

    expect(source).toContain("checkFooterSourceLinks");
    expect(source).toContain("route_200");
    expect(source).toContain("response.status !== 200");
    expect(source).not.toContain("/sitemap.xml");
    expect(source).not.toContain("/llms.txt");
    expect(source).toContain("FORBIDDEN_ROUTE_FRAGMENTS");
  });

  it("defaults to production site host and blocks unexpected monitor targets", () => {
    expect(buildConfig({} as NodeJS.ProcessEnv)).toMatchObject({
      siteBaseUrl: "https://fermatmind.com",
      allowedHosts: ["fermatmind.com"],
    });

    expect(() =>
      buildConfig({
        SCIENCE_CONTENTPAGE_ZH_FOOTER_SITE_BASE_URL: "https://example.com",
      } as unknown as NodeJS.ProcessEnv)
    ).toThrow("unexpected_monitor_host=example.com");
  });

  it("exposes a package script for manual production footer route checks", () => {
    const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, "utf8"));

    expect(packageJson.scripts["seo:check-science-contentpage-zh-footer-links"]).toBe(
      "node scripts/seo/check-science-contentpage-zh-footer-links.mjs"
    );
  });
});
