import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  IQ_LAUNCH_CANONICAL_SLUG,
  hasUnsafeIqLaunchClaim,
  resolveIqLaunchSeoGuard,
} from "@/lib/seo/testDetailAuthority";

const ROOT = process.cwd();
const PAGE_PATH = path.join(ROOT, "app/(localized)/[locale]/tests/[slug]/page.tsx");
const DOC_PATH = path.join(ROOT, "docs/audits/iq-fe/18_iq_claim_seo_launch_guard.md");

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

  it("allows indexability only with backend SEO authority while still blocking schema and exposure widening", () => {
    const guard = resolveIqLaunchSeoGuard({
      slug: IQ_LAUNCH_CANONICAL_SLUG,
      scaleCode: "IQ_RAVEN",
      hasSeoTitle: true,
      hasSeoDescription: true,
      title: "IQ reasoning practice",
      description: "Original visual and numeric reasoning practice with nullable IQ claims.",
      featureList: ["30 original items", "raw score only"],
    });

    expect(guard.shouldNoindex).toBe(false);
    expect(guard.blocksSoftwareApplicationSchema).toBe(true);
    expect(guard.blocksSitemapLlmsExpansion).toBe(true);
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
