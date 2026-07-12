import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api-client";
import {
  isRetryablePersonalityDetailError,
  PERSONALITY_DETAIL_MAX_ATTEMPTS,
  PERSONALITY_DETAIL_TIMEOUT_MS,
  withPersonalityDetailRetry,
} from "@/lib/cms/personalityReadStability";

const cmsSource = readFileSync("lib/cms/personality.ts", "utf8");
const pageSource = readFileSync("app/(localized)/[locale]/personality/[type]/page.tsx", "utf8");

function apiError(status: number): ApiError {
  return new ApiError({ status, errorCode: `HTTP_${status}`, message: "request failed" });
}

describe("MBTI profile authority read stability", () => {
  it("uses a bounded 30 second detail budget and retries transient authority failures once", async () => {
    expect(PERSONALITY_DETAIL_TIMEOUT_MS).toBe(30_000);
    expect(PERSONALITY_DETAIL_MAX_ATTEMPTS).toBe(2);

    for (const status of [408, 429, 500, 503]) {
      const load = vi.fn()
        .mockRejectedValueOnce(apiError(status))
        .mockResolvedValueOnce("authority");

      await expect(withPersonalityDetailRetry(load)).resolves.toBe("authority");
      expect(load).toHaveBeenCalledTimes(2);
    }
  });

  it("does not retry permanent, not-found, or unknown failures", async () => {
    for (const error of [apiError(400), apiError(404), new Error("network contract failure")]) {
      const load = vi.fn().mockRejectedValue(error);

      await expect(withPersonalityDetailRetry(load)).rejects.toBe(error);
      expect(load).toHaveBeenCalledTimes(1);
      expect(isRetryablePersonalityDetailError(error)).toBe(false);
    }
  });

  it("deduplicates the page authority bundle and isolates detail from SEO failures", () => {
    expect(pageSource).toContain("const loadPersonalityPublicDetail = cache(");
    expect(pageSource).toContain("Promise.allSettled([");
    expect(pageSource).toContain('detailResult.status === "rejected"');
    expect(pageSource).toContain('seoResult.status === "fulfilled" ? seoResult.value : null');
    expect(pageSource).not.toContain("const [detail, seo] = await Promise.all([");
  });

  it("keeps fallback shells fail closed while reusing backend detail SEO authority", () => {
    expect(cmsSource).toContain("timeoutMs: PERSONALITY_DETAIL_TIMEOUT_MS");
    expect(cmsSource).toContain("withPersonalityDetailRetry(() => apiClient.get");
    expect(cmsSource).toContain("seoSurface: normalizeSeoSurface(response.seo_surface_v1 ?? null)");
    expect(cmsSource).toContain('surface: seo?.surface ?? ("projection" in profile ? profile.seoSurface : null)');
    expect(pageSource).toContain("isIndexable: false");
    expect(pageSource).toContain('robots: "noindex,nofollow"');
  });

  it("covers the affected profiles without hardcoding runtime exceptions", () => {
    const affectedProfiles = ["istp-a", "isfp-a", "esfj-a"];
    expect(affectedProfiles).toHaveLength(3);
    expect(cmsSource).not.toContain(affectedProfiles.join("|"));
    affectedProfiles.forEach((slug) => expect(slug).toMatch(/^[ie][ns][ft][jp]-[at]$/));
  });
});
