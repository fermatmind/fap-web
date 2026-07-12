import fs from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LocaleProvider } from "@/components/i18n/LocaleContext";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { isGlobalEnZhContentPagesDiscoverabilityExposureImplementation01AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const TARGET_PATHS = ["/en/brand", "/en/charter", "/en/foundation", "/en/careers", "/en/policies"];
const ARTIFACT_PATH = path.join(
  ROOT,
  "docs/seo/generated/global-en-zh-content-pages-discoverability-exposure-implementation-01.v1.json"
);

function readSource(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

describe("Wave 1 English content page discoverability exposure implementation", () => {
  it("records the implementation safety artifact", () => {
    const artifact = JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8"));

    expect(artifact.task).toBe("GLOBAL-EN-ZH-CONTENT-PAGES-DISCOVERABILITY-EXPOSURE-IMPLEMENTATION-01");
    expect(artifact.final_decision).toBe(
      "content_pages_discoverability_exposure_implementation_completed_ready_for_deploy_readiness"
    );
    expect(artifact.target_pages).toEqual(["brand", "charter", "foundation", "careers", "policies"]);
    expect(artifact.no_cms_mutation_by_fap_web_pr).toBe(true);
    expect(artifact.no_page_body_copy_modified).toBe(true);
    expect(artifact.no_frontend_fallback_content).toBe(true);
    expect(artifact.no_search_channel_action).toBe(true);
    expect(artifact.no_url_submission).toBe(true);
    expect(artifact.no_external_search_api_call).toBe(true);
    expect(artifact.next_task).toBeTruthy();
  });

  it("removes the hard sitemap and llms deny patterns for the five CMS-authoritative pages", () => {
    const sitemapSource = readSource("lib/seo/sitemapAuthorityAdapters.cjs");
    const llmsSource = readSource("app/llms.txt/route.ts");
    const llmsFullSource = readSource("app/llms-full.txt/route.ts");

    expect(sitemapSource).not.toContain("^\\/en\\/(?:brand|careers|charter|foundation|policies)$");
    expect(llmsSource).not.toContain("^\\/en\\/(?:brand|careers|charter|foundation|policies)$");
    expect(llmsFullSource).not.toContain("^\\/en\\/(?:brand|careers|charter|foundation|policies)$");
    expect(sitemapSource).toContain('"/en/brand"');
    expect(llmsSource).toContain("page.isPublic && page.isIndexable");
    expect(llmsFullSource).toContain("page.isPublic && page.isIndexable");
  });

  it("keeps the content page robots metadata tied to CMS indexability", () => {
    const routeSource = readSource("app/(localized)/[locale]/contentPageRoute.tsx");

    expect(routeSource).toContain("noindex: !page.isIndexable");
    expect(routeSource).not.toContain("brand");
    expect(routeSource).not.toContain("foundation");
  });

  it("exposes the five approved English pages in footer navigation", () => {
    render(
      <LocaleProvider locale="en">
        <SiteFooter locale="en" />
      </LocaleProvider>
    );

    const hrefs = screen
      .getAllByRole("link")
      .map((link) => link.getAttribute("href") || "")
      .filter(Boolean);

    for (const path of TARGET_PATHS) {
      expect(hrefs).toContain(path);
    }
  });

  it("limits this PR to the approved fap-web scope", () => {
    const changedFiles = [
      "app/llms-full.txt/route.ts",
      "app/llms.txt/route.ts",
      "components/layout/SiteFooter.tsx",
      "docs/codex/pr-train.yaml",
      "docs/codex/pr-train-state.json",
      "docs/seo/generated/global-en-zh-content-pages-discoverability-exposure-implementation-01.v1.json",
      "docs/seo/global-en-zh-content-pages-discoverability-exposure-implementation-01.md",
      "lib/seo/cmsRoutePolicy.cjs",
      "lib/seo/sitemapAuthorityAdapters.cjs",
      "next-sitemap.config.js",
      "tests/contracts/global-en-zh-content-pages-discoverability-exposure-implementation-01.contract.test.tsx",
      "tests/contracts/global-en-zh-footer-nav-parity.contract.test.tsx",
      "tests/contracts/global-ui-i18n-batch-08.contract.test.tsx",
      "tests/contracts/helpers/currentPrScope.ts",
      "tests/contracts/sitemap-indexability.contract.test.ts",
    ];

    for (const file of changedFiles) {
      expect(isGlobalEnZhContentPagesDiscoverabilityExposureImplementation01AllowedFile(file), file).toBe(true);
    }
  });
});
