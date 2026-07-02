import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { isSecurity122Web06AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const CI_DIFF_FALLBACK_FILES = [
  "docs/codex/pr-train-state.json",
  "docs/codex/pr-train.yaml",
  "lib/cms/content-pages.ts",
  "lib/cms/last-known-good.ts",
  "lib/seo/llmsFullResponseCache.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/security-122-web-06-sitemap-llms-lkg-fail-closed.contract.test.ts",
];

function changedFiles(): string[] {
  let committedDiffs = "";
  try {
    committedDiffs = execFileSync("git", ["diff", "--name-only", "origin/main...HEAD"], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    committedDiffs = "";
  }
  const uncommitted = execFileSync("git", ["diff", "--name-only"], {
    cwd: ROOT,
    encoding: "utf8",
  });
  const untracked = execFileSync("git", ["ls-files", "--others", "--exclude-standard"], {
    cwd: ROOT,
    encoding: "utf8",
  });

  const files = Array.from(
    new Set(
      `${committedDiffs}\n${uncommitted}\n${untracked}`
        .split("\n")
        .map((file) => file.trim())
        .filter(Boolean),
    ),
  ).sort();

  return files.length > 0 || process.env.GITHUB_ACTIONS !== "true" ? files : CI_DIFF_FALLBACK_FILES;
}

type ContentPageRecord = {
  slug: string;
  is_public?: boolean;
  is_indexable?: boolean;
};

function contentPageRecord({ slug, is_public = true, is_indexable = true }: ContentPageRecord) {
  return {
    slug,
    path: slug.startsWith("help-") ? `/help/${slug.slice(5)}` : `/${slug}`,
    kind: slug === "privacy" || slug === "terms" || slug === "policies" ? "policy" : "company",
    title: `${slug} title`,
    kicker: "Company",
    summary: `${slug} summary`,
    template: "company",
    animation_profile: "editorial",
    locale: "en",
    published_at: "2026-06-01T00:00:00Z",
    updated_at: "2026-06-01T00:00:00Z",
    effective_at: null,
    source_doc: null,
    is_public,
    is_indexable,
    headings: [`${slug} heading`],
    content_md: `## ${slug} heading\n\n${slug} body.`,
    content_html: `<h2>${slug} heading</h2><p>${slug} body.</p>`,
    seo_title: `${slug} seo`,
    meta_description: `${slug} description`,
  };
}

function mockContentPagesApi(privateOrNoindexSlugs = new Map<string, Partial<ContentPageRecord>>()) {
  const get = vi.fn(async (url: string) => {
    const match = url.match(/\/v0\.5\/content-pages\/([^?]+)/);
    if (!match) {
      return { ok: true, items: [] };
    }

    const slug = decodeURIComponent(match[1] ?? "");
    const override = privateOrNoindexSlugs.get(slug) ?? {};

    return {
      ok: true,
      page: contentPageRecord({
        slug,
        is_public: override.is_public ?? true,
        is_indexable: override.is_indexable ?? true,
      }),
    };
  });

  vi.doMock("@/lib/api-client", () => ({
    ApiError: class ApiError extends Error {
      status: number;

      constructor(status: number) {
        super(`API ${status}`);
        this.status = status;
      }
    },
    apiClient: { get },
  }));

  return get;
}

afterEach(() => {
  delete process.env.FERMATMIND_LLMS_FULL_CACHE_DIR;
  delete process.env.FERMATMIND_LLMS_FULL_ENABLE_SHARED_CACHE;
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("SECURITY-122-WEB-06 sitemap, llms, and LKG fail-closed guards", () => {
  it("clears stale last-known-good content when fresh authority marks the value unusable", async () => {
    const { clearLastKnownGoodForTests, readLastKnownGoodForTests, withLastKnownGood } = await import(
      "@/lib/cms/last-known-good"
    );

    clearLastKnownGoodForTests();

    await withLastKnownGood({
      key: "content-page:en:brand",
      load: async () => ({ slug: "brand", isPublic: true }),
    });

    const revoked = await withLastKnownGood<{ slug: string; isPublic: boolean } | null>({
      key: "content-page:en:brand",
      load: async () => null,
      isUsable: (value) => Boolean(value?.isPublic),
      clearStaleOnUnusable: true,
      useStaleOnUnusable: true,
    });

    expect(revoked).toMatchObject({
      source: "fresh",
      stale: false,
      value: null,
    });
    expect(readLastKnownGoodForTests("content-page:en:brand")).toBeNull();
  });

  it("does not serve an old public content page after the CMS marks that page private", async () => {
    mockContentPagesApi();
    let contentPages = await import("@/lib/cms/content-pages");
    let lkg = await import("@/lib/cms/last-known-good");

    lkg.clearLastKnownGoodForTests();

    const seeded = await contentPages.getContentPageWithLastKnownGood("brand", "en");
    expect(seeded.value?.slug).toBe("brand");
    expect(seeded.value?.isPublic).toBe(true);

    vi.resetModules();
    mockContentPagesApi(new Map([["brand", { is_public: false }]]));
    contentPages = await import("@/lib/cms/content-pages");
    lkg = await import("@/lib/cms/last-known-good");

    const revoked = await contentPages.getContentPageWithLastKnownGood("brand", "en");

    expect(revoked.source).toBe("fresh");
    expect(revoked.value).toBeNull();
    expect(lkg.readLastKnownGoodForTests("content-page:en:brand")).toBeNull();
  });

  it("does not repopulate llms discoverability from stale content pages when a slug becomes noindex", async () => {
    mockContentPagesApi();
    let contentPages = await import("@/lib/cms/content-pages");
    const lkg = await import("@/lib/cms/last-known-good");

    lkg.clearLastKnownGoodForTests();

    const seeded = await contentPages.listDiscoverableContentPagesWithLastKnownGood("en");
    expect(seeded.value.map((page) => page.slug)).toContain("brand");

    vi.resetModules();
    mockContentPagesApi(new Map([["brand", { is_indexable: false }]]));
    contentPages = await import("@/lib/cms/content-pages");

    const refreshed = await contentPages.listDiscoverableContentPagesWithLastKnownGood("en");

    expect(refreshed.source).toBe("fresh");
    expect(refreshed.value.map((page) => page.slug)).not.toContain("brand");
    expect(refreshed.value.every((page) => page.isPublic && page.isIndexable)).toBe(true);
  });

  it("partitions the shared llms-full cache by site URL", async () => {
    const cacheDir = fs.mkdtempSync(path.join(os.tmpdir(), "security-122-web-06-llms-cache-"));
    process.env.FERMATMIND_LLMS_FULL_CACHE_DIR = cacheDir;
    process.env.FERMATMIND_LLMS_FULL_ENABLE_SHARED_CACHE = "true";
    const {
      clearLlmsFullResponseCache,
      getCachedLlmsFullText,
      getLlmsFullSharedCachePath,
      writeLlmsFullResponseCache,
    } = await import("@/lib/seo/llmsFullResponseCache");

    clearLlmsFullResponseCache();
    const siteA = "https://fermatmind.com";
    const siteB = "https://preview.fermatmind.com";
    const text = "# FermatMind llms-full\n\nhttps://fermatmind.com/en/tests/mbti-personality-test-16-personality-types";

    const written = await writeLlmsFullResponseCache(siteA, text);

    expect(written.cachePath).toBe(getLlmsFullSharedCachePath(siteA));
    expect(getLlmsFullSharedCachePath(siteA)).not.toBe(getLlmsFullSharedCachePath(siteB));
    expect(await getCachedLlmsFullText(siteA, 60_000)).toBe(text);
    expect(await getCachedLlmsFullText(siteB, 60_000)).toBeNull();
  });

  it("keeps in-flight llms-full builds isolated by site URL", async () => {
    const { clearLlmsFullResponseCache, getOrStartLlmsFullBuild } = await import("@/lib/seo/llmsFullResponseCache");
    clearLlmsFullResponseCache();

    const siteADeferred: { resolve?: (value: string) => void } = {};
    const siteAPromise = getOrStartLlmsFullBuild("https://fermatmind.com", async () => {
      return new Promise<string>((resolve) => {
        siteADeferred.resolve = resolve;
      });
    });

    const siteBPromise = getOrStartLlmsFullBuild("https://preview.fermatmind.com", async () => "site-b-text");

    await expect(siteBPromise).resolves.toBe("site-b-text");
    expect(siteADeferred.resolve).toBeTypeOf("function");
    siteADeferred.resolve?.("site-a-text");
    await expect(siteAPromise).resolves.toBe("site-a-text");
  });

  it("keeps the WEB-06 diff inside the declared sitemap, llms, and LKG fail-closed scope", () => {
    expect(changedFiles()).not.toHaveLength(0);
    expect(changedFiles().filter((file) => !isSecurity122Web06AllowedFile(file))).toEqual([]);
  });
});
