import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import { getAllTests, getTestBySlug, getTestLookup } from "@/lib/content";

const ROOT = process.cwd();

function read(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("public test catalog read stability", () => {
  it("returns only backend-authoritative catalog items without frontend test seeds", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({
      ok: true,
      items: [
        {
          slug: "legacy-mbti-slug",
          scale_code: "MBTI",
          title: "Backend MBTI",
          description: "Backend description",
          questions_count: 93,
          time_minutes: 12,
          highlight_priority: 7,
        },
      ],
    })));

    await expect(getAllTests("en")).resolves.toEqual([
      expect.objectContaining({
        slug: SCALE_CANONICAL_SLUG_MAP.MBTI,
        title: "Backend MBTI",
        description: "Backend description",
      }),
    ]);
  });

  it("keeps authoritative catalog absence empty", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ error_code: "NOT_FOUND" }, 404)));

    await expect(getAllTests("en")).resolves.toEqual([]);
  });

  it.each([
    [503, "transient"],
    [429, "rate_limited"],
  ])("preserves catalog HTTP %s as a retryable %s error", async (status, kind) => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ error_code: "UPSTREAM_UNAVAILABLE" }, status)));

    await expect(getAllTests("en")).rejects.toMatchObject({
      name: "PublicReadError",
      kind,
      retryable: true,
      authoritativeAbsence: false,
    });
  });

  it("preserves catalog network failures as retryable errors", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new TypeError("network down");
    }));

    await expect(getAllTests("en")).rejects.toMatchObject({
      name: "PublicReadError",
      kind: "network",
      retryable: true,
    });
  });

  it("does not turn a malformed catalog payload into an empty catalog", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ ok: true, items: "not-an-array" })));

    await expect(getAllTests("en")).rejects.toMatchObject({
      name: "PublicReadError",
      kind: "contract",
      authoritativeAbsence: false,
    });
  });

  it("does not turn a catalog outage into a missing test slug", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ error_code: "UPSTREAM_UNAVAILABLE" }, 503)));

    await expect(getTestBySlug(SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN, "zh")).rejects.toMatchObject({
      name: "PublicReadError",
      kind: "transient",
    });
  });
});

describe("public test lookup read stability", () => {
  it("returns backend lookup authority for a published slug", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({
      ok: true,
      seo_title: "Backend title",
      is_indexable: true,
      forms: [{ form_code: "mbti_93" }],
    })));

    await expect(getTestLookup(SCALE_CANONICAL_SLUG_MAP.MBTI, "zh")).resolves.toMatchObject({
      seo_title: "Backend title",
      is_indexable: true,
      forms: [{ form_code: "mbti_93" }],
    });
  });

  it("keeps authoritative lookup absence as null", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ error_code: "NOT_FOUND" }, 404)));

    await expect(getTestLookup("missing-test", "en")).resolves.toBeNull();
  });

  it.each([
    [503, "transient", true],
    [429, "rate_limited", true],
    [422, "contract", false],
  ])("classifies lookup HTTP %s as %s without false absence", async (status, kind, retryable) => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ error_code: "LOOKUP_FAILURE" }, status)));

    await expect(getTestLookup(SCALE_CANONICAL_SLUG_MAP.MBTI, "en")).rejects.toMatchObject({
      name: "PublicReadError",
      kind,
      retryable,
      authoritativeAbsence: false,
    });
  });

  it("keeps explicit backend ok=false lookup authority absent", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ ok: false })));

    await expect(getTestLookup("held-test", "en")).resolves.toBeNull();
  });

  it("routes lookup absence to not-found while allowing transient errors to reach the error boundary", () => {
    const source = read("app/(localized)/[locale]/tests/[slug]/page.tsx");

    expect(source).toContain("getTestLookup(slug, locale)");
    expect(source).toContain("if (!lookup) return notFound();");
    expect(source).not.toContain("async function fetchLookup");
  });

  it("contains no frontend-authored public test catalog fallback", () => {
    const source = read("lib/content.ts");

    expect(source).not.toContain("FALLBACK_PUBLIC_TEST_SEEDS");
    expect(source).not.toContain("mergeWithFallbackTests");
    expect(source).toContain("apiClient.getPublic");
    expect(source).toContain("isAuthoritativePublicAbsence");
  });
});
