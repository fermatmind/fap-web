import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PERSONALITY_PUBLIC_READ_TIMEOUT_MS } from "@/lib/cms/personalityReadStability";

const adapterSource = readFileSync("lib/cms/personality.ts", "utf8");
const pageSource = readFileSync("app/(localized)/[locale]/personality/[type]/page.tsx", "utf8");

describe("bounded MBTI public reads", () => {
  it("gives detail and SEO one shared-size frontend wait budget", () => {
    expect(PERSONALITY_PUBLIC_READ_TIMEOUT_MS).toBe(8_000);
    expect(adapterSource.match(/timeoutMs: PERSONALITY_PUBLIC_READ_TIMEOUT_MS/g)).toHaveLength(2);
    expect(adapterSource).not.toContain("PERSONALITY_DETAIL_MAX_ATTEMPTS");
    expect(adapterSource).not.toContain("withPersonalityDetailRetry");
  });

  it("consumes backend current or LKG payloads through the same detail contract", () => {
    expect(adapterSource).toContain("/v0.5/personality/${encodeURIComponent(normalizedSlug)}${query}");
    expect(adapterSource).toContain("response.mbti_public_projection_v1");
    expect(adapterSource).toContain("seoSurface: normalizeSeoSurface(response.seo_surface_v1 ?? null)");
    expect(adapterSource).not.toMatch(/lastKnownGood|localStorage|frontendPersonalityCache/i);
  });

  it("keeps authoritative absence distinct from transient failures", () => {
    expect(adapterSource).toContain("error instanceof ApiError && error.status === 404");
    expect(pageSource).toContain("if (!detail)");
    expect(pageSource).toContain("return notFound()");
    expect(pageSource).toContain("throw detailResult.reason");
  });

  it("isolates optional SEO failure without fabricating detail content", () => {
    expect(pageSource).toContain("Promise.allSettled([");
    expect(pageSource).toContain('seoResult.status === "fulfilled" ? seoResult.value : null');
    expect(pageSource).not.toContain("buildFallbackPersonalityDetail");
    expect(pageSource).not.toContain("frontend_gateway_fallback");
  });
});
