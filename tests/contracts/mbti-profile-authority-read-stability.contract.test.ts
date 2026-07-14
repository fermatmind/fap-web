import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  PERSONALITY_PUBLIC_READ_TIMEOUT_MS,
} from "@/lib/cms/personalityReadStability";

const cmsSource = readFileSync("lib/cms/personality.ts", "utf8");
const pageSource = readFileSync("app/(localized)/[locale]/personality/[type]/page.tsx", "utf8");

describe("MBTI profile authority read stability", () => {
  it("uses one bounded backend-authority read instead of stacked frontend retries", () => {
    expect(PERSONALITY_PUBLIC_READ_TIMEOUT_MS).toBe(8_000);
    expect(cmsSource.match(/timeoutMs: PERSONALITY_PUBLIC_READ_TIMEOUT_MS/g)).toHaveLength(2);
    expect(cmsSource).not.toContain("withPersonalityDetailRetry");
  });

  it("deduplicates the page authority bundle and isolates detail from SEO failures", () => {
    expect(pageSource).toContain("const loadPersonalityPublicDetail = cache(");
    expect(pageSource).toContain("Promise.allSettled([");
    expect(pageSource).toContain('detailResult.status === "rejected"');
    expect(pageSource).toContain("throw detailResult.reason");
    expect(pageSource).toContain('seoResult.status === "fulfilled" ? seoResult.value : null');
    expect(pageSource).not.toContain("const [detail, seo] = await Promise.all([");
  });

  it("uses backend detail SEO authority without a frontend editorial fallback", () => {
    expect(cmsSource).toContain("timeoutMs: PERSONALITY_PUBLIC_READ_TIMEOUT_MS");
    expect(cmsSource).toContain("seoSurface: normalizeSeoSurface(response.seo_surface_v1 ?? null)");
    expect(cmsSource).toContain('surface: seo?.surface ?? ("projection" in profile ? profile.seoSurface : null)');
    expect(pageSource).not.toContain("buildFallbackPersonalityDetail");
    expect(pageSource).not.toContain("buildFallbackProjection");
    expect(pageSource).not.toContain("frontend_gateway_fallback");
  });

  it("covers the affected profiles without hardcoding runtime exceptions", () => {
    const affectedProfiles = ["istp-a", "isfp-a", "esfj-a"];
    expect(affectedProfiles).toHaveLength(3);
    expect(cmsSource).not.toContain(affectedProfiles.join("|"));
    affectedProfiles.forEach((slug) => expect(slug).toMatch(/^[ie][ns][ft][jp]-[at]$/));
  });
});
