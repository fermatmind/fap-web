import fs from "node:fs";
import path from "node:path";
import { isValidElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";

const routeMocks = vi.hoisted(() => ({
  getAllTests: vi.fn(),
  getTestBySlug: vi.fn(),
  getTestLookup: vi.fn(),
  getCmsLandingSurfaceWithLastKnownGood: vi.fn(),
  getCmsArticlesWithLastKnownGood: vi.fn(),
  getIqSeoRampAuthorityForLocale: vi.fn(),
}));

vi.mock("@/lib/content", async () => {
  const actual = await vi.importActual<typeof import("@/lib/content")>("@/lib/content");

  return {
    ...actual,
    getAllTests: routeMocks.getAllTests,
    getTestBySlug: routeMocks.getTestBySlug,
    getTestLookup: routeMocks.getTestLookup,
  };
});

vi.mock("@/lib/cms/landing-surfaces", async () => {
  const actual = await vi.importActual<typeof import("@/lib/cms/landing-surfaces")>(
    "@/lib/cms/landing-surfaces"
  );

  return {
    ...actual,
    getCmsLandingSurfaceWithLastKnownGood: routeMocks.getCmsLandingSurfaceWithLastKnownGood,
  };
});

vi.mock("@/lib/cms/articles", async () => {
  const actual = await vi.importActual<typeof import("@/lib/cms/articles")>("@/lib/cms/articles");

  return {
    ...actual,
    getCmsArticlesWithLastKnownGood: routeMocks.getCmsArticlesWithLastKnownGood,
  };
});

vi.mock("@/lib/seo/iqSeoRampAuthority", async () => {
  const actual = await vi.importActual<typeof import("@/lib/seo/iqSeoRampAuthority")>(
    "@/lib/seo/iqSeoRampAuthority"
  );

  return {
    ...actual,
    getIqSeoRampAuthorityForLocale: routeMocks.getIqSeoRampAuthorityForLocale,
  };
});

import TestLandingPage, {
  generateMetadata,
  generateStaticParams,
} from "@/app/(localized)/[locale]/tests/[slug]/page";

type CoreScale = {
  code: "MBTI" | "BIG5_OCEAN" | "ENNEAGRAM" | "RIASEC" | "IQ_RAVEN" | "EQ_60";
  slug: string;
};

const CORE_SCALES: CoreScale[] = [
  { code: "MBTI", slug: SCALE_CANONICAL_SLUG_MAP.MBTI },
  { code: "BIG5_OCEAN", slug: SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN },
  { code: "ENNEAGRAM", slug: SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM },
  { code: "RIASEC", slug: SCALE_CANONICAL_SLUG_MAP.RIASEC },
  { code: "IQ_RAVEN", slug: SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN },
  { code: "EQ_60", slug: SCALE_CANONICAL_SLUG_MAP.EQ_60 },
];

const CORE_ROUTE_MATRIX = CORE_SCALES.flatMap((scale) =>
  (["en", "zh"] as const).map((locale) => ({
    ...scale,
    locale,
    path: `/${locale}/tests/${scale.slug}`,
  }))
);

const IQ_RAMP_AUTHORITY = {
  schema: "iq.seo_ramp_authority.v1",
  authoritySource: "backend_cms_landing_surface",
  locale: "en",
  testSlug: SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN,
  scaleCode: "IQ_INTELLIGENCE_QUOTIENT",
  formCode: "IQ_OWNER_ORIGINAL_30",
  canonicalPath: `/tests/${SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN}`,
  localizedPaths: {},
  robots: "index,follow",
  isIndexable: true,
  sitemapEligible: true,
  llmsEligible: true,
  llmsFullEligible: true,
  jsonLdEligible: true,
  media: {
    cardAssetKey: "cms-card",
    ogAssetKey: "cms-og",
    reportCoverAssetKey: "",
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
    copyBoundary: "Educational reasoning assessment only.",
  },
};

function testFor(slug: string, locale: "en" | "zh") {
  const scale = CORE_SCALES.find((item) => item.slug === slug);
  if (!scale) return null;

  return {
    slug,
    scale_code: scale.code,
    title: `${scale.code} test`,
    title_i18n: {
      en: `${scale.code} test`,
      zh: `${scale.code} 测评`,
    },
    description: locale === "zh" ? "后端权威测评说明。" : "Backend-authoritative assessment description.",
    cover_image: "https://api.fermatmind.com/storage/test-cover.png",
    questions_count: scale.code === "RIASEC" ? 60 : 30,
    time_minutes: 10,
    is_public: true,
    is_active: true,
    is_indexable: true,
  };
}

function lookupFor(slug: string, locale: "en" | "zh") {
  return {
    seo_title: locale === "zh" ? `${slug} 测评` : `${slug} test`,
    seo_description: locale === "zh" ? "后端权威 SEO 说明。" : "Backend-authoritative SEO description.",
    og_image_url: "https://api.fermatmind.com/storage/test-og.png",
    is_indexable: true,
    capabilities: {
      enabled_in_prod: true,
      paywall_mode: "free_only",
    },
    commercial: {
      price_tier: "FREE",
      offers: [],
    },
    price_tier: "FREE",
    offers: [],
    content_i18n_json: {
      [locale]: {
        landing_copy: locale === "zh" ? "后端权威可见正文。" : "Backend-authoritative visible body.",
        disclaimer: locale === "zh" ? "仅用于自我认知参考。" : "For self-understanding only.",
        faq: [
          {
            q: locale === "zh" ? "如何使用结果？" : "How should I use the result?",
            a: locale === "zh" ? "把结果作为可复盘的工作假设。" : "Use it as a reviewable working hypothesis.",
          },
        ],
      },
    },
    report_summary_i18n_json: {
      [locale]: {
        summary: locale === "zh" ? "后端权威结果摘要。" : "Backend-authoritative result summary.",
      },
    },
    landing_surface_v1: {
      version: "landing.surface.v1",
      entry_surface: "test_detail",
      start_test_target: `/${locale}/tests/${slug}/take`,
      cta_bundle: [
        {
          key: "start_test",
          label: locale === "zh" ? "开始测评" : "Start test",
          href: `/${locale}/tests/${slug}/take`,
          kind: "start_test",
        },
      ],
    },
  };
}

function collectValues(value: unknown, output: unknown[], seen = new Set<unknown>()): void {
  if (value === null || value === undefined || typeof value === "boolean") return;
  if (typeof value === "string" || typeof value === "number") {
    output.push(value);
    return;
  }
  if (seen.has(value)) return;
  seen.add(value);

  if (Array.isArray(value)) {
    value.forEach((item) => collectValues(item, output, seen));
    return;
  }

  if (isValidElement(value)) {
    output.push(value);
    collectValues((value.props as { children?: ReactNode }).children, output, seen);
    collectValues(value.props, output, seen);
    return;
  }

  if (typeof value === "object") {
    Object.values(value as Record<string, unknown>).forEach((item) => collectValues(item, output, seen));
  }
}

describe("SEO core test detail availability", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://fermatmind.com";
    routeMocks.getAllTests.mockReset();
    routeMocks.getTestBySlug.mockReset();
    routeMocks.getTestLookup.mockReset();
    routeMocks.getCmsLandingSurfaceWithLastKnownGood.mockReset();
    routeMocks.getCmsArticlesWithLastKnownGood.mockReset();
    routeMocks.getIqSeoRampAuthorityForLocale.mockReset();

    routeMocks.getAllTests.mockImplementation(async (locale: "en" | "zh") =>
      CORE_SCALES.map((scale) => testFor(scale.slug, locale))
    );
    routeMocks.getTestBySlug.mockImplementation(async (slug: string, locale: "en" | "zh") =>
      testFor(slug, locale)
    );
    routeMocks.getTestLookup.mockImplementation(async (slug: string, locale: "en" | "zh") =>
      lookupFor(slug, locale)
    );
    routeMocks.getCmsLandingSurfaceWithLastKnownGood.mockResolvedValue({
      value: null,
      source: "fresh",
      stale: false,
      updatedAt: "2026-07-24T00:00:00.000Z",
      error: null,
    });
    routeMocks.getCmsArticlesWithLastKnownGood.mockResolvedValue({
      value: { items: [] },
      source: "fresh",
      stale: false,
      updatedAt: "2026-07-24T00:00:00.000Z",
      error: null,
    });
    routeMocks.getIqSeoRampAuthorityForLocale.mockResolvedValue(IQ_RAMP_AUTHORITY);
  });

  it("locks the exact twelve EN/ZH sitemap route cohort", () => {
    expect(CORE_ROUTE_MATRIX.map((item) => item.path)).toEqual([
      `/en/tests/${SCALE_CANONICAL_SLUG_MAP.MBTI}`,
      `/zh/tests/${SCALE_CANONICAL_SLUG_MAP.MBTI}`,
      `/en/tests/${SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN}`,
      `/zh/tests/${SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN}`,
      `/en/tests/${SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM}`,
      `/zh/tests/${SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM}`,
      `/en/tests/${SCALE_CANONICAL_SLUG_MAP.RIASEC}`,
      `/zh/tests/${SCALE_CANONICAL_SLUG_MAP.RIASEC}`,
      `/en/tests/${SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN}`,
      `/zh/tests/${SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN}`,
      `/en/tests/${SCALE_CANONICAL_SLUG_MAP.EQ_60}`,
      `/zh/tests/${SCALE_CANONICAL_SLUG_MAP.EQ_60}`,
    ]);
  });

  it("keeps static generation deterministic and free of request-scoped dynamic APIs", async () => {
    const pageSource = fs.readFileSync(
      path.join(process.cwd(), "app/(localized)/[locale]/tests/[slug]/page.tsx"),
      "utf8"
    );

    expect(pageSource).toContain("export async function generateStaticParams()");
    expect(pageSource).not.toContain('from "next/headers"');
    expect(pageSource).not.toContain("readRolloutIdentitySeed");
    expect(pageSource).toContain("identitySeed: null");
    await expect(generateStaticParams()).resolves.toHaveLength(12);
  });

  it.each(CORE_ROUTE_MATRIX)(
    "renders metadata and SSR body contracts for $path",
    async ({ locale, slug }) => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ locale, slug }),
      });
      const expectedCanonical = `https://fermatmind.com/${locale}/tests/${slug}`;
      const expectedEn = `https://fermatmind.com/en/tests/${slug}`;
      const expectedZh = `https://fermatmind.com/zh/tests/${slug}`;

      expect(metadata.alternates?.canonical).toBe(expectedCanonical);
      expect(metadata.alternates?.languages).toMatchObject({
        en: expectedEn,
        "zh-CN": expectedZh,
        "x-default": expectedEn,
      });
      expect(metadata.robots).toMatchObject({
        index: true,
        follow: true,
      });

      const tree = await TestLandingPage({
        params: Promise.resolve({ locale, slug }),
        searchParams: Promise.resolve({}),
      });
      const values: unknown[] = [];
      collectValues(tree, values);
      const elements = values.filter(isValidElement);
      const strings = values.filter((value): value is string => typeof value === "string");

      expect(
        elements.some((element) => element.type === "h1"),
        `${slug} must retain a visible H1`
      ).toBe(true);
      expect(strings).toContain(locale === "zh" ? "后端权威可见正文。" : "Backend-authoritative visible body.");
      expect(strings.some((value) => value.includes(`/${locale}/tests/${slug}/take`))).toBe(true);
    }
  );

  it("keeps test lookup and CMS landing reads separated from authoritative absence", () => {
    const pageSource = fs.readFileSync(
      path.join(process.cwd(), "app/(localized)/[locale]/tests/[slug]/page.tsx"),
      "utf8"
    );

    expect(pageSource).toContain("const test = await getTestBySlug(slug, locale);");
    expect(pageSource).toContain("getTestLookup(slug, locale)");
    expect(pageSource).toContain("getTestDetailCmsLandingSurface(slug, locale)");
    expect(pageSource).toContain("if (!test) return notFound();");
    expect(pageSource).toContain("if (!lookup) return notFound();");
    expect(pageSource).toContain("const heroCopy = cmsLandingSurfaceContent.heroCopy || landingCopy || test.description;");
    expect(pageSource).toContain('data-evidence-page-family="test_detail"');
  });
});
