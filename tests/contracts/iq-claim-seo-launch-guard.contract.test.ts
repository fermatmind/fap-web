import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  IQ_LAUNCH_CANONICAL_SLUG,
  hasUnsafeIqLaunchClaim,
  resolveIqLaunchSeoGuard,
  type IqSeoRampAuthority,
} from "@/lib/seo/testDetailAuthority";

const ROOT = process.cwd();
const PAGE_PATH = path.join(ROOT, "app/(localized)/[locale]/tests/[slug]/page.tsx");
const DOC_PATH = path.join(ROOT, "docs/audits/iq-fe/18_iq_claim_seo_launch_guard.md");

const IQ_SEO_RAMP_AUTHORITY: IqSeoRampAuthority = {
  schema: "iq.seo_ramp_authority.v1",
  authoritySource: "backend_cms_landing_surface",
  locale: "en",
  testSlug: IQ_LAUNCH_CANONICAL_SLUG,
  scaleCode: "IQ_INTELLIGENCE_QUOTIENT",
  formCode: "IQ_OWNER_ORIGINAL_30",
  canonicalPath: `/en/tests/${IQ_LAUNCH_CANONICAL_SLUG}`,
  localizedPaths: {
    en: `/en/tests/${IQ_LAUNCH_CANONICAL_SLUG}`,
    zh: `/zh/tests/${IQ_LAUNCH_CANONICAL_SLUG}`,
  },
  robots: "index,follow",
  isIndexable: true,
  sitemapEligible: true,
  llmsEligible: true,
  llmsFullEligible: false,
  jsonLdEligible: true,
  media: {
    cardAssetKey: "iq-owner-original-30-card",
    ogAssetKey: "iq-owner-original-30-og",
    reportCoverAssetKey: "iq-full-report-cover",
    authority: "backend_cms_media_library",
    source: "media_library_required",
    fallbackAllowed: false,
  },
  claimPolicy: {
    normAuthorityRequired: true,
    normAuthorityPr: "IQ-NORM-03",
    publicCopyIqEstimateClaimsEnabled: false,
    publicCopyPercentileClaimsEnabled: false,
    resultContextIqEstimateRequiresBackendReport: true,
    paidReportClaimsRequireBackendEntitlement: true,
    copyBoundary: "raw score, dimension reference, original reasoning practice, and method boundary only",
  },
};

describe("IQ claim SEO launch guard", () => {
  it("keeps IQ canonical path fixed and noindexes missing backend SEO authority", () => {
    const guard = resolveIqLaunchSeoGuard({
      slug: IQ_LAUNCH_CANONICAL_SLUG,
      scaleCode: "IQ_INTELLIGENCE_QUOTIENT",
      hasSeoTitle: false,
      hasSeoDescription: false,
      title: "IQ Test",
      description: "Practice reasoning assessment",
    });

    expect(guard).toMatchObject({
      applies: true,
      canonicalPath: `/tests/${IQ_LAUNCH_CANONICAL_SLUG}`,
      hasBackendSeoAuthority: false,
      shouldNoindex: true,
      blocksSoftwareApplicationSchema: true,
      blocksSitemapLlmsExpansion: true,
    });
  });

  it("keeps IQ noindex without the backend CMS SEO ramp authority gate", () => {
    const guard = resolveIqLaunchSeoGuard({
      slug: IQ_LAUNCH_CANONICAL_SLUG,
      scaleCode: "IQ_RAVEN",
      hasSeoTitle: true,
      hasSeoDescription: true,
      title: "IQ reasoning practice",
      description: "Original visual and numeric reasoning practice with nullable IQ claims.",
      featureList: ["30 original items", "raw score only"],
    });

    expect(guard.shouldNoindex).toBe(true);
    expect(guard.blocksSoftwareApplicationSchema).toBe(true);
    expect(guard.blocksSitemapLlmsExpansion).toBe(true);
  });

  it("allows IQ indexation and jsonld only through backend norm, media, and claim-policy authority", () => {
    const guard = resolveIqLaunchSeoGuard({
      slug: IQ_LAUNCH_CANONICAL_SLUG,
      scaleCode: "IQ_INTELLIGENCE_QUOTIENT",
      hasSeoTitle: true,
      hasSeoDescription: true,
      title: "IQ reasoning practice",
      description: "Original visual and numeric reasoning practice with raw score context.",
      featureList: ["30 original items", "method boundary"],
      seoRampAuthority: IQ_SEO_RAMP_AUTHORITY,
    });

    expect(guard).toMatchObject({
      hasBackendSeoRampAuthority: true,
      normAuthorityGatePassed: true,
      claimPolicyGatePassed: true,
      mediaAuthorityGatePassed: true,
      shouldNoindex: false,
      blocksSoftwareApplicationSchema: false,
      blocksSitemapLlmsExpansion: false,
      sitemapLlmsExpansionAllowed: true,
      llmsFullExpansionAllowed: false,
      jsonLdExpansionAllowed: true,
    });
  });

  it("allows IQ llms-full expansion only when backend CMS authority enables it", () => {
    const guard = resolveIqLaunchSeoGuard({
      slug: IQ_LAUNCH_CANONICAL_SLUG,
      scaleCode: "IQ_INTELLIGENCE_QUOTIENT",
      hasSeoTitle: true,
      hasSeoDescription: true,
      title: "IQ reasoning practice",
      description: "Original visual and numeric reasoning practice with raw score context.",
      featureList: ["30 original items", "method boundary"],
      seoRampAuthority: {
        ...IQ_SEO_RAMP_AUTHORITY,
        llmsFullEligible: true,
      },
    });

    expect(guard).toMatchObject({
      sitemapLlmsExpansionAllowed: true,
      llmsFullExpansionAllowed: true,
      jsonLdExpansionAllowed: true,
      shouldNoindex: false,
    });
  });

  it("blocks unsafe IQ score and percentile claims", () => {
    expect(hasUnsafeIqLaunchClaim("Get your official IQ score and population percentile ranking")).toBe(true);
    expect(hasUnsafeIqLaunchClaim("查看官方智商和人群百分位")).toBe(true);
    expect(hasUnsafeIqLaunchClaim("Original reasoning practice with raw score only")).toBe(false);

    const guard = resolveIqLaunchSeoGuard({
      slug: IQ_LAUNCH_CANONICAL_SLUG,
      scaleCode: "IQ_INTELLIGENCE_QUOTIENT",
      hasSeoTitle: true,
      hasSeoDescription: true,
      title: "Official IQ score",
      description: "Population percentile ranking",
    });

    expect(guard.unsafeClaimBlocked).toBe(true);
    expect(guard.shouldNoindex).toBe(true);
  });

  it("anchors runtime page guards and documents no sitemap llms expansion", () => {
    const page = fs.readFileSync(PAGE_PATH, "utf8");
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(page).toContain("resolveIqLaunchSeoGuard");
    expect(page).toContain("iqLaunchSeoGuard.shouldNoindex");
    expect(page).toContain("!iqLaunchSeoGuard.blocksSoftwareApplicationSchema");
    expect(page).toContain("!hasUnsafeIqLaunchClaim(softwareApplicationClaimText)");
    expect(doc).toContain("Sitemap/llms exposure widened: no");
    expect(doc).toContain("MyIQ.Science remains behind license verification gate");
  });
});
