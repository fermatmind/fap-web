import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("IQ SEO ramp indexation gate", () => {
  it("wires sitemap and llms test exposure through backend CMS IQ ramp authority", () => {
    const sitemapConfig = read("next-sitemap.config.js");
    const backendTestSource = read("lib/seo/backendTestDiscoverabilitySource.ts");
    const llmsFull = read("app/llms-full.txt/route.ts");

    expect(sitemapConfig).toContain("/v0.5/landing-surfaces/tests");
    expect(sitemapConfig).toContain("isIqSeoRampSitemapEligible");
    expect(sitemapConfig).toContain("IQ-NORM-03");
    expect(sitemapConfig).toContain("backend_cms_media_library");
    expect(backendTestSource).toContain("getIqSeoRampAuthorityForLocale");
    expect(backendTestSource).toContain('surface: "llms"');
    expect(llmsFull).toContain("test.llmsFullEligible !== false");
  });

  it("keeps IQ JSON-LD gated by backend authority and not frontend copy", () => {
    const page = read("app/(localized)/[locale]/tests/[slug]/page.tsx");
    const helper = read("lib/seo/testDetailAuthority.ts");

    expect(page).toContain("getIqSeoRampAuthorityForLocale");
    expect(page).toContain("seoRampAuthority: iqSeoRampAuthority");
    expect(page).toContain("iqLaunchSeoGuard.jsonLdExpansionAllowed");
    expect(helper).toContain("normAuthorityPr === \"IQ-NORM-03\"");
    expect(helper).toContain("publicCopyIqEstimateClaimsEnabled === false");
    expect(helper).toContain("paidReportClaimsRequireBackendEntitlement === true");
  });

  it("declares current PR scope for sitemap llms and IQ SEO authority only", () => {
    const scope = read("tests/contracts/helpers/currentPrScope.ts");
    const manifest = read("docs/codex/pr-train.yaml");

    expect(scope).toContain("IQ_SEO_RAMP_02_ALLOWED_FILES");
    expect(scope).toContain("lib/seo/iqSeoRampAuthority.ts");
    expect(scope).not.toContain("public/iq");
    expect(manifest).toContain("IQ-SEO-RAMP-02");
    expect(manifest).toContain("Gate IQ sitemap, llms, canonical, and JSON-LD expansion on backend SEO, norm authority, and claim policy.");
  });
});
