import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchCareerFamilyHub } from "@/lib/career/api/fetchCareerFamilyHub";
import { fetchCareerJobBundle } from "@/lib/career/api/fetchCareerJobBundle";
import { fetchCareerJobIndex } from "@/lib/career/api/fetchCareerJobIndex";
import { fetchCareerRecommendationBundle } from "@/lib/career/api/fetchCareerRecommendationBundle";
import { fetchCareerRecommendationIndex } from "@/lib/career/api/fetchCareerRecommendationIndex";

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const publicReaders = [
  ["career job bundle", () => fetchCareerJobBundle({ locale: "en", slug: "software-developer" })],
  ["career job index", () => fetchCareerJobIndex({ locale: "en" })],
  ["career family", () => fetchCareerFamilyHub({ locale: "en", slug: "technology" })],
  ["career recommendation index", () => fetchCareerRecommendationIndex({ locale: "en" })],
  ["career recommendation bundle", () => fetchCareerRecommendationBundle({ locale: "en", type: "intj-a" })],
] as const;

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("career public read stability", () => {
  it.each(publicReaders)("preserves %s transient failures as typed retryable errors", async (_name, load) => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ error_code: "UPSTREAM_UNAVAILABLE" }, 503)));

    await expect(load()).rejects.toMatchObject({
      name: "PublicReadError",
      kind: "transient",
      retryable: true,
      authoritativeAbsence: false,
    });
  });

  it.each(publicReaders)("keeps %s authoritative absence as null", async (_name, load) => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ error_code: "NOT_FOUND" }, 404)));

    await expect(load()).resolves.toBeNull();
  });

  it.each(publicReaders)("does not collapse %s validation failures into absence", async (_name, load) => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ error_code: "VALIDATION_ERROR" }, 422)));

    await expect(load()).rejects.toMatchObject({
      name: "PublicReadError",
      kind: "contract",
      authoritativeAbsence: false,
    });
  });

  it("preserves SEO transient errors when the requested career job exists", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/career-jobs/software-developer/seo")) {
        return jsonResponse({ error_code: "UPSTREAM_UNAVAILABLE" }, 503);
      }

      return jsonResponse({ data: { identity: { canonical_slug: "software-developer" } } });
    }));

    await expect(fetchCareerJobBundle({
      locale: "en",
      slug: "software-developer",
      includeSeoAuthority: true,
    })).rejects.toMatchObject({ kind: "transient", retryable: true });
  });

  it("lets authoritative career job absence win when the optional SEO read also fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      return url.includes("/career-jobs/missing-job/seo")
        ? jsonResponse({ error_code: "UPSTREAM_UNAVAILABLE" }, 503)
        : jsonResponse({ error_code: "NOT_FOUND" }, 404);
    }));

    await expect(fetchCareerJobBundle({
      locale: "en",
      slug: "missing-job",
      includeSeoAuthority: true,
    })).resolves.toBeNull();
  });
});
