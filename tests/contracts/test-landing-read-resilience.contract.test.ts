import fs from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import type { CmsLandingSurface } from "@/lib/cms/landing-surfaces";
import type { TestLookup } from "@/lib/content";
import { PublicReadError } from "@/lib/public-content/readError";
import {
  loadTestLandingCmsEnrichment,
  type TestDetailCmsLandingSurfacePayload,
} from "@/lib/tests/testLandingCmsEnrichment";
import {
  createTestLandingRequestLoader,
  loadTestLandingDataUncached,
  type TestLandingData,
} from "@/lib/tests/testLandingData";
import { resetTestLandingLastKnownGoodForTests } from "@/lib/tests/testLandingLastKnownGood";

const ROOT = process.cwd();
const MBTI_SLUG = SCALE_CANONICAL_SLUG_MAP.MBTI;
const BIG5_SLUG = SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN;

function read(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function lookupFixture(
  slug: string,
  locale: "en" | "zh",
  title = `${locale}-${slug}`,
): TestLookup {
  const apiLocale = locale === "zh" ? "zh-CN" : "en";
  return {
    ok: true,
    primary_slug: slug,
    slug,
    requested_slug: slug,
    resolved_from_alias: false,
    scale_code: slug === MBTI_SLUG ? "MBTI" : "BIG5_OCEAN",
    locale: apiLocale,
    is_public: true,
    seo_title: title,
    seo_description: `${title} description`,
    og_image_url: null,
    is_indexable: true,
    forms: [{ form_code: slug === MBTI_SLUG ? "mbti_144" : "big5_120", question_count: 144 }],
    capabilities: { default_form_code: slug === MBTI_SLUG ? "mbti_144" : "big5_120" },
    commercial: null,
    content_i18n_json: {
      [locale]: {
        title,
        description: `${title} description`,
        catalog: {
          questions_count: 144,
          time_minutes: 15,
        },
      },
    },
    report_summary_i18n_json: null,
    landing_surface_v1: {
      version: "landing.surface.v1",
      entry_surface: "test_detail",
      start_test_target: `/${locale}/tests/${slug}/take`,
      cta_bundle: [],
    },
  };
}

function cmsSurface(
  locale: "en" | "zh" = "en",
): CmsLandingSurface<TestDetailCmsLandingSurfacePayload> {
  return {
    surfaceKey: "test_detail_mbti_personality_test_16_personality_types",
    locale,
    title: "CMS title",
    description: "CMS description",
    schemaVersion: "v1",
    payloadJson: { hero_copy: "CMS hero" },
    status: "published",
    isPublic: true,
    isIndexable: true,
    publishedAt: "2026-07-30T00:00:00Z",
    scheduledAt: null,
    pageBlocks: [],
  };
}

const unavailableCms = async () => ({
  value: null,
  source: "unavailable" as const,
});

beforeEach(() => {
  resetTestLandingLastKnownGoodForTests();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("test landing lookup authority and LKG", () => {
  it("uses lookup instead of catalog and shares one request-memoized loader between metadata and page", async () => {
    const page = read("app/(localized)/[locale]/tests/[slug]/page.tsx");
    const loader = read("lib/tests/testLandingData.ts");
    const content = read("lib/content.ts");

    expect(page.match(/loadTestLandingData\(locale, slug\)/g)).toHaveLength(2);
    expect(page).not.toContain("getTestBySlug(slug, locale)");
    expect(loader).toContain("createTestLandingRequestLoader");
    expect(loader).toContain("memoize(");
    expect(content).toContain("/v0.3/scales/lookup?");
    expect(loader).not.toContain("getAllTests");

    const underlying = vi.fn(async () => ({ slug: MBTI_SLUG }) as unknown as TestLandingData);
    const memoize = <T extends (...args: never[]) => unknown>(fn: T): T => {
      const values = new Map<string, unknown>();
      return (async (...args: never[]) => {
        const key = JSON.stringify(args);
        if (!values.has(key)) {
          values.set(key, await fn(...args));
        }
        return values.get(key);
      }) as T;
    };
    const requestLoader = createTestLandingRequestLoader(
      underlying,
      memoize as unknown as typeof import("react").cache,
    );

    await expect(requestLoader("zh", MBTI_SLUG)).resolves.toMatchObject({ slug: MBTI_SLUG });
    await expect(requestLoader("zh", MBTI_SLUG)).resolves.toMatchObject({ slug: MBTI_SLUG });
    expect(underlying).toHaveBeenCalledTimes(1);
  });

  it("writes a validated fresh lookup and uses it only for a retryable failure", async () => {
    const lookup = lookupFixture(MBTI_SLUG, "zh");
    const fresh = await loadTestLandingDataUncached("zh", MBTI_SLUG, {
      lookup: async () => lookup,
      loadCms: unavailableCms,
    });
    const recovered = await loadTestLandingDataUncached("zh", MBTI_SLUG, {
      lookup: async () => {
        throw new PublicReadError({ kind: "timeout" });
      },
      loadCms: unavailableCms,
    });

    expect(fresh).toMatchObject({ source: "fresh", slug: MBTI_SLUG });
    expect(recovered).toMatchObject({
      source: "last-known-good",
      slug: MBTI_SLUG,
      locale: "zh",
    });
  });

  it("shares the server-side LKG artifact across isolated PM2-style workers", async () => {
    const cacheDirectory = await mkdtemp(path.join(tmpdir(), "test-landing-lkg-contract-"));
    vi.stubEnv("FERMATMIND_TEST_LANDING_ENABLE_SHARED_LKG", "true");
    vi.stubEnv("FERMATMIND_TEST_LANDING_LKG_DIR", cacheDirectory);

    try {
      await loadTestLandingDataUncached("en", MBTI_SLUG, {
        lookup: async () => lookupFixture(MBTI_SLUG, "en"),
        loadCms: unavailableCms,
      });
      resetTestLandingLastKnownGoodForTests();

      await expect(loadTestLandingDataUncached("en", MBTI_SLUG, {
        lookup: async () => {
          throw new PublicReadError({ kind: "network" });
        },
        loadCms: unavailableCms,
      })).resolves.toMatchObject({
        source: "last-known-good",
        slug: MBTI_SLUG,
      });
    } finally {
      await rm(cacheDirectory, { recursive: true, force: true });
    }
  });

  it("isolates LKG by locale and canonical slug", async () => {
    await loadTestLandingDataUncached("en", MBTI_SLUG, {
      lookup: async () => lookupFixture(MBTI_SLUG, "en"),
      loadCms: unavailableCms,
    });

    await expect(loadTestLandingDataUncached("zh", MBTI_SLUG, {
      lookup: async () => {
        throw new PublicReadError({ kind: "transient" });
      },
      loadCms: unavailableCms,
    })).rejects.toMatchObject({ kind: "transient" });
    await expect(loadTestLandingDataUncached("en", BIG5_SLUG, {
      lookup: async () => {
        throw new PublicReadError({ kind: "network" });
      },
      loadCms: unavailableCms,
    })).rejects.toMatchObject({ kind: "network" });
  });

  it("does not let authoritative absence reuse an existing LKG", async () => {
    await loadTestLandingDataUncached("en", MBTI_SLUG, {
      lookup: async () => lookupFixture(MBTI_SLUG, "en"),
      loadCms: unavailableCms,
    });

    await expect(loadTestLandingDataUncached("en", MBTI_SLUG, {
      lookup: async () => null,
      loadCms: unavailableCms,
    })).resolves.toBeNull();
    await expect(loadTestLandingDataUncached("en", MBTI_SLUG, {
      lookup: async () => {
        throw new PublicReadError({ kind: "transient" });
      },
      loadCms: unavailableCms,
    })).rejects.toMatchObject({ kind: "transient" });
  });

  it("fails closed for malformed lookup and does not write it to LKG", async () => {
    const malformed = {
      ...lookupFixture(MBTI_SLUG, "en"),
      primary_slug: BIG5_SLUG,
    };

    await expect(loadTestLandingDataUncached("en", MBTI_SLUG, {
      lookup: async () => malformed,
      loadCms: unavailableCms,
    })).rejects.toMatchObject({ kind: "contract" });
    await expect(loadTestLandingDataUncached("en", MBTI_SLUG, {
      lookup: async () => {
        throw new PublicReadError({ kind: "timeout" });
      },
      loadCms: unavailableCms,
    })).rejects.toMatchObject({ kind: "timeout" });
  });

  it("expires LKG instead of using it indefinitely", async () => {
    await loadTestLandingDataUncached("en", MBTI_SLUG, {
      lookup: async () => lookupFixture(MBTI_SLUG, "en"),
      loadCms: unavailableCms,
    });

    await expect(loadTestLandingDataUncached("en", MBTI_SLUG, {
      lookup: async () => {
        throw new PublicReadError({ kind: "timeout" });
      },
      loadCms: unavailableCms,
      lkgMaxAgeMs: -1,
    })).rejects.toMatchObject({ kind: "timeout" });
  });
});

describe("test landing CMS enrichment budget", () => {
  it("returns fresh CMS authority within the dedicated budget", async () => {
    const result = await loadTestLandingCmsEnrichment(MBTI_SLUG, "en", {
      load: async () => ({
        value: cmsSurface("en"),
        source: "fresh",
        stale: false,
        updatedAt: "2026-07-30T00:00:00Z",
        error: null,
      }),
      budgetMs: 20,
    });

    expect(result).toMatchObject({ source: "fresh", value: { locale: "en" } });
  });

  it("uses dedicated LKG when CMS exceeds budget", async () => {
    await loadTestLandingCmsEnrichment(MBTI_SLUG, "en", {
      load: async () => ({
        value: cmsSurface("en"),
        source: "fresh",
        stale: false,
        updatedAt: "2026-07-30T00:00:00Z",
        error: null,
      }),
      budgetMs: 20,
    });

    const result = await loadTestLandingCmsEnrichment(MBTI_SLUG, "en", {
      load: async () => new Promise(() => undefined),
      budgetMs: 1,
    });
    expect(result).toMatchObject({
      source: "last-known-good",
      value: { locale: "en" },
    });
  });

  it("returns unavailable quickly for CMS timeout without LKG or malformed CMS", async () => {
    const timedOut = await loadTestLandingCmsEnrichment(MBTI_SLUG, "en", {
      load: async () => new Promise(() => undefined),
      budgetMs: 1,
    });
    const malformed = await loadTestLandingCmsEnrichment(MBTI_SLUG, "en", {
      load: async () => ({
        value: { ...cmsSurface("en"), isPublic: false },
        source: "fresh",
        stale: false,
        updatedAt: "2026-07-30T00:00:00Z",
        error: null,
      }),
      budgetMs: 20,
    });

    expect(timedOut).toEqual({ value: null, source: "unavailable" });
    expect(malformed).toEqual({ value: null, source: "unavailable" });
  });

  it("keeps the default CMS budget below two seconds", () => {
    const source = read("lib/tests/testLandingCmsEnrichment.ts");
    expect(source).toContain("DEFAULT_CMS_ENRICHMENT_BUDGET_MS = 1_500");
    expect(source).toContain("MAX_CMS_ENRICHMENT_BUDGET_MS = 2_000");
  });
});

describe("test landing error shell", () => {
  it("renders a minimal retryable shell without test editorial fallback", () => {
    const errorShell = read("app/(localized)/[locale]/tests/[slug]/error.tsx");
    const normalPage = read("app/(localized)/[locale]/tests/[slug]/page.tsx");

    expect(errorShell).toContain('data-testid="test-landing-error-shell"');
    expect(errorShell).toContain("reset()");
    expect(errorShell).toContain('href={`/${locale}/tests`}');
    expect(errorShell).not.toMatch(/FAQ|questions_count|time_minutes|landing_surface_v1/);
    expect(normalPage).not.toContain('data-testid="test-landing-error-shell"');
  });
});
