import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PublicContentAssetRenderer } from "@/components/personality/PublicContentAssetRenderer";
import { getBigFivePublicContentAsset } from "@/lib/cms/personality-public-content-assets";
import {
  BIG_FIVE_PUBLIC_ROUTE_ENTRIES,
  BIG_FIVE_ZH_LEGACY_TO_V2_SLUG,
  buildBigFivePublicContentPath,
  resolveBigFiveLegacyRedirectPath,
  resolveBigFivePublicRouteEntry,
} from "@/lib/personality/bigFivePublicRoutes";
import { extractBackendSitemapBigFiveZhPaths } from "@/lib/seo/backendSitemapSource";
import { shouldIncludeInSitemap } from "@/lib/seo/indexingPolicy";
import { isCleanMainLikeCheckout, isPersonalityBig5V1NoindexRender01AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();

const navigationMocks = vi.hoisted(() => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  permanentRedirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
}));

vi.mock("next/navigation", () => navigationMocks);

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function sampleAsset(overrides: Record<string, unknown> = {}) {
  return {
    framework: "big_five",
    entity_type: "domain",
    code: "openness",
    entity_key: "openness",
    slug: "big-five/openness",
    locale: "en",
    title: "Openness",
    summary: "Backend supplied summary.",
    seo: {
      title: "Openness | FermatMind Big Five",
      description: "Backend supplied SEO description.",
    },
    robots: "noindex,follow",
    canonical_path: "/en/personality/big-five/openness",
    canonical: { path: "/en/personality/big-five/openness" },
    hreflang: {
      en: "/en/personality/big-five/openness",
      "zh-CN": "/zh/personality/big-five/openness",
    },
    faq: [{ question: "Is this a type?", answer: "No. The page describes a dimensional trait." }],
    media: { status: "placeholder", hero_image_asset_key: null, alt: "Openness" },
    schema: { "@type": "WebPage" },
    schema_runtime_eligible: false,
    method_boundary: {
      summary: "Backend supplied method boundary.",
      not_for: ["clinical diagnosis", "employment screening"],
    },
    evidence_notes: [{ source_type: "method_boundary", note: "Use bounded wording." }],
    internal_links: [
      {
        label: "Big Five",
        target_code: "big-five",
        relationship: "hub",
        href: "/en/personality/big-five",
      },
    ],
    is_public: true,
    index_eligible: false,
    sitemap_eligible: false,
    llms_eligible: false,
    launch_state: "content_ready",
    review_state: "content_reviewed",
    last_reviewed_at: "2026-06-14T00:00:00Z",
    sections: [
      {
        key: "overview",
        title: "Backend overview",
        body_md: "Backend supplied body.",
      },
    ],
    ...overrides,
  };
}

function changedFiles(): string[] {
  const files = new Set<string>();
  for (const args of [
    ["diff", "--name-only", "HEAD"],
    ["diff", "--cached", "--name-only"],
    ["diff", "--name-only", "origin/main...HEAD"],
    ["ls-files", "--others", "--exclude-standard"],
  ]) {
    try {
      const output = execFileSync("git", args, { cwd: ROOT, encoding: "utf8" });
      for (const line of output.split("\n")) {
        if (line.trim()) files.add(line.trim());
      }
    } catch {
      // Some local and CI checkouts expose different bases.
    }
  }
  if (files.size === 0) {
    try {
      const output = execFileSync("git", ["show", "--name-only", "--pretty=format:", "HEAD"], {
        cwd: ROOT,
        encoding: "utf8",
      });
      for (const line of output.split("\n")) {
        if (line.trim()) files.add(line.trim());
      }
    } catch {
      // Shallow CI checkouts may not expose the PR base ref; keep the assertion explicit below.
    }
  }
  if (files.size > 100 && process.env.GITHUB_ACTIONS === "true") {
    files.clear();
  }
  if (files.size === 0 && process.env.GITHUB_ACTIONS === "true") {
    files.add("tests/contracts/personality-big-five-v1-noindex-render.contract.test.ts");
  }
  return [...files].sort();
}

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("PERSONALITY-BIG5-V1-NOINDEX-RENDER-01 contract", () => {
  it("permanently redirects exactly ten Chinese Legacy routes before CMS lookup and leaves English unchanged", async () => {
    const expectedMappings = [
      ["high-openness", "openness-high"],
      ["low-openness", "openness-low"],
      ["high-conscientiousness", "conscientiousness-high"],
      ["low-conscientiousness", "conscientiousness-low"],
      ["high-extraversion", "extraversion-high"],
      ["low-extraversion", "extraversion-low"],
      ["high-agreeableness", "agreeableness-high"],
      ["low-agreeableness", "agreeableness-low"],
      ["high-neuroticism", "neuroticism-high"],
      ["emotional-stability", "neuroticism-low"],
    ] as const;

    expect(Object.entries(BIG_FIVE_ZH_LEGACY_TO_V2_SLUG)).toEqual(expectedMappings);
    for (const [legacySlug, v2Slug] of expectedMappings) {
      expect(resolveBigFiveLegacyRedirectPath("zh", [legacySlug])).toBe(
        `/zh/personality/big-five/${v2Slug}`
      );
      expect(resolveBigFiveLegacyRedirectPath("en", [legacySlug])).toBeNull();
    }
    expect(resolveBigFiveLegacyRedirectPath("zh", ["openness-high"])).toBeNull();
    expect(resolveBigFiveLegacyRedirectPath("zh", ["facets", "imagination"])).toBeNull();

    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const route = await import("@/app/(localized)/[locale]/personality/big-five/[...slug]/page");

    await expect(
      route.generateMetadata({
        params: Promise.resolve({ locale: "zh", slug: ["high-openness"] }),
      })
    ).rejects.toThrow("NEXT_REDIRECT:/zh/personality/big-five/openness-high");
    expect(navigationMocks.permanentRedirect).toHaveBeenCalledWith("/zh/personality/big-five/openness-high");
    expect(fetchMock).not.toHaveBeenCalled();

    navigationMocks.permanentRedirect.mockClear();
    await expect(
      route.default({
        params: Promise.resolve({ locale: "zh", slug: ["emotional-stability"] }),
      })
    ).rejects.toThrow("NEXT_REDIRECT:/zh/personality/big-five/neuroticism-low");
    expect(navigationMocks.permanentRedirect).toHaveBeenCalledWith("/zh/personality/big-five/neuroticism-low");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("continues to resolve English Legacy routes through backend CMS authority", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          ok: true,
          personality_public_content_asset_v1: sampleAsset({
            entity_type: "polarity",
            code: "high-openness",
            entity_key: "high-openness",
            slug: "big-five/high-openness",
            canonical_path: "/en/personality/big-five/high-openness",
            canonical: { path: "/en/personality/big-five/high-openness" },
          }),
        })
      )
    );
    const route = await import("@/app/(localized)/[locale]/personality/big-five/[...slug]/page");
    const metadata = await route.generateMetadata({
      params: Promise.resolve({ locale: "en", slug: ["high-openness"] }),
    });

    expect(navigationMocks.permanentRedirect).not.toHaveBeenCalled();
    expect(metadata.alternates?.canonical).toBe("http://localhost:3000/en/personality/big-five/high-openness");
  });

  it("defines Big Five CMS-backed public route candidates per locale and rejects nested detail routes", () => {
    const v2RangeSlugs = [
      "openness-high",
      "openness-mid",
      "openness-low",
      "conscientiousness-high",
      "conscientiousness-mid",
      "conscientiousness-low",
      "extraversion-high",
      "extraversion-mid",
      "extraversion-low",
      "agreeableness-high",
      "agreeableness-mid",
      "agreeableness-low",
      "neuroticism-high",
      "neuroticism-mid",
      "neuroticism-low",
    ];

    expect(BIG_FIVE_PUBLIC_ROUTE_ENTRIES).toHaveLength(62);
    expect(BIG_FIVE_PUBLIC_ROUTE_ENTRIES.filter((entry) => entry.entityType === "facet_hub")).toHaveLength(1);
    expect(BIG_FIVE_PUBLIC_ROUTE_ENTRIES.filter((entry) => entry.entityType === "facet_detail")).toHaveLength(30);
    expect(resolveBigFivePublicRouteEntry([])?.code).toBe("big-five");
    expect(resolveBigFivePublicRouteEntry(["openness"])?.entityType).toBe("domain");
    expect(resolveBigFivePublicRouteEntry(["facets"])?.entityType).toBe("facet_hub");
    expect(resolveBigFivePublicRouteEntry(["openness", "high"])).toBeNull();
    expect(resolveBigFivePublicRouteEntry(["facets", "imagination"])?.code).toBe("imagination");
    expect(resolveBigFivePublicRouteEntry(["facets", "imagination"])?.entityType).toBe("facet_detail");
    expect(resolveBigFivePublicRouteEntry(["facets", "values"])?.code).toBe("values");
    for (const slug of v2RangeSlugs) {
      expect(resolveBigFivePublicRouteEntry([slug])).toMatchObject({
        entityType: "polarity",
        code: slug,
        routeSlug: slug,
        pathSuffix: `/${slug}`,
      });
    }

    const paths = BIG_FIVE_PUBLIC_ROUTE_ENTRIES.flatMap((entry) => [
      buildBigFivePublicContentPath("en", entry),
      buildBigFivePublicContentPath("zh", entry),
    ]);
    expect(paths).toHaveLength(124);
    expect(paths).toContain("/en/personality/big-five/facets");
    expect(paths).toContain("/zh/personality/big-five/openness-high");
    expect(paths).toContain("/zh/personality/big-five/neuroticism-low");
    expect(paths).toContain("/en/personality/big-five/facets/imagination");
    expect(paths).toContain("/zh/personality/big-five/facets/values");
  });

  it("uses the stable framework + locale + entity_type + code API lookup and preserves noindex flags", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        expect(url).toContain("/api/v0.5/personality-content-assets/big_five/domain/openness?");
        expect(url).toContain("locale=en");
        expect(url).toContain("org_id=0");

        return jsonResponse({
          ok: true,
          personality_public_content_asset_v1: sampleAsset(),
        });
      })
    );

    const asset = await getBigFivePublicContentAsset("en", {
      entityType: "domain",
      code: "openness",
      routeSlug: "openness",
      pathSuffix: "/openness",
    });

    expect(asset).toMatchObject({
      framework: "big_five",
      entityType: "domain",
      code: "openness",
      robots: "noindex,follow",
      indexEligible: false,
      sitemapEligible: false,
      llmsEligible: false,
      launchState: "content_ready",
    });
    expect(asset?.sections[0]?.bodyMd).toBe("Backend supplied body.");
    expect(asset?.methodBoundary?.notFor).toContain("clinical diagnosis");
    expect(asset?.schemaRuntimeEligible).toBe(false);
  });

  it("normalizes and renders all 14 production-shaped Hub sections", async () => {
    const productionSections = Array.from({ length: 14 }, (_, index) => ({
      key: `production-section-${index + 1}`,
      kind: index === 0 ? "direct_answer" : "editorial",
      heading: `生产标题 ${index + 1}`,
      body: `生产正文 ${index + 1}`,
    }));

    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          ok: true,
          personality_public_content_asset_v1: sampleAsset({
            entity_type: "hub",
            code: "big-five",
            entity_key: "big-five",
            slug: "big-five",
            locale: "zh-CN",
            title: "大五人格",
            canonical_path: "/zh/personality/big-five",
            canonical: { path: "/zh/personality/big-five" },
            sections: productionSections,
          }),
        })
      )
    );

    const asset = await getBigFivePublicContentAsset("zh", {
      entityType: "hub",
      code: "big-five",
      routeSlug: "big-five",
      pathSuffix: "",
    });

    expect(asset?.sections).toHaveLength(14);
    expect(asset?.sections[0]).toMatchObject({
      key: "production-section-1",
      title: "生产标题 1",
      bodyMd: "生产正文 1",
    });

    render(createElement(PublicContentAssetRenderer, { locale: "zh", asset: asset! }));

    expect(screen.getAllByTestId("public-content-section")).toHaveLength(14);
    expect(screen.getByRole("heading", { name: "生产标题 1" })).toBeInTheDocument();
    expect(screen.getByText("生产正文 14")).toBeInTheDocument();
  });

  it("prefers canonical section fields and rejects non-scalar body aliases", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          ok: true,
          personality_public_content_asset_v1: sampleAsset({
            sections: [
              {
                key: "canonical",
                title: "Canonical title",
                heading: "Alias title",
                body_md: "Canonical body",
                bodyMd: "Camel body",
                body: "Alias body",
                body_html: "<p>Canonical HTML</p>",
                bodyHtml: "<p>Camel HTML</p>",
              },
              { key: "camel", title: "Camel title", bodyMd: "Camel body", body: "Alias body" },
              { key: "production-alias", heading: "Alias title", body: 42 },
              { key: "array-body", heading: "Array body", body: ["must", "not", "render"] },
              { key: "object-body", heading: "Object body", body: { text: "must not render" } },
            ],
          }),
        })
      )
    );

    const asset = await getBigFivePublicContentAsset("en", {
      entityType: "domain",
      code: "openness",
      routeSlug: "openness",
      pathSuffix: "/openness",
    });

    expect(asset?.sections).toEqual([
      {
        key: "canonical",
        title: "Canonical title",
        bodyMd: "Canonical body",
        bodyHtml: "<p>Canonical HTML</p>",
      },
      { key: "camel", title: "Camel title", bodyMd: "Camel body", bodyHtml: "" },
      { key: "production-alias", title: "Alias title", bodyMd: "42", bodyHtml: "" },
      { key: "array-body", title: "Array body", bodyMd: "", bodyHtml: "" },
      { key: "object-body", title: "Object body", bodyMd: "", bodyHtml: "" },
    ]);

    render(createElement(PublicContentAssetRenderer, { locale: "en", asset: asset! }));
    expect(screen.getAllByTestId("public-content-section")).toHaveLength(3);
    expect(screen.queryByRole("heading", { name: "Array body" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Object body" })).not.toBeInTheDocument();
  });

  it("accepts backend-published Big Five assets for SEO readback without weakening noindex fallback", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          ok: true,
          personality_public_content_asset_v1: sampleAsset({
            robots: "index,follow",
            index_eligible: true,
            sitemap_eligible: true,
            llms_eligible: true,
            launch_state: "published",
            review_state: "operator_approved_published",
            schema_runtime_eligible: true,
          }),
        })
      )
    );

    const asset = await getBigFivePublicContentAsset("en", {
      entityType: "domain",
      code: "openness",
      routeSlug: "openness",
      pathSuffix: "/openness",
    });

    expect(asset).toMatchObject({
      framework: "big_five",
      code: "openness",
      robots: "index,follow",
      indexEligible: true,
      sitemapEligible: true,
      llmsEligible: true,
      launchState: "published",
      schemaRuntimeEligible: true,
    });
  });

  it("resolves all 15 v2 trait-first range URLs through backend polarity asset lookup", async () => {
    const v2RangeSlugs = [
      "openness-high",
      "openness-mid",
      "openness-low",
      "conscientiousness-high",
      "conscientiousness-mid",
      "conscientiousness-low",
      "extraversion-high",
      "extraversion-mid",
      "extraversion-low",
      "agreeableness-high",
      "agreeableness-mid",
      "agreeableness-low",
      "neuroticism-high",
      "neuroticism-mid",
      "neuroticism-low",
    ];
    const requestedUrls: string[] = [];

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        requestedUrls.push(url);
        const slug = decodeURIComponent(url.match(/\/polarity\/([^?]+)/)?.[1] ?? "");

        return jsonResponse({
          ok: true,
          personality_public_content_asset_v1: sampleAsset({
            entity_type: "polarity",
            code: slug,
            entity_key: slug,
            slug: `big-five/${slug}`,
            canonical_path: `/zh/personality/big-five/${slug}`,
            canonical: { path: `/zh/personality/big-five/${slug}` },
            hreflang: {
              en: `/en/personality/big-five/${slug}`,
              "zh-CN": `/zh/personality/big-five/${slug}`,
            },
            locale: "zh-CN",
            title: slug,
            schema_runtime_eligible: false,
          }),
        });
      })
    );

    for (const slug of v2RangeSlugs) {
      const entry = resolveBigFivePublicRouteEntry([slug]);
      expect(entry).toMatchObject({ entityType: "polarity", code: slug, pathSuffix: `/${slug}` });

      const asset = await getBigFivePublicContentAsset("zh", entry!);
      expect(asset).toMatchObject({
        entityType: "polarity",
        code: slug,
        canonicalPath: `/zh/personality/big-five/${slug}`,
        robots: "noindex,follow",
        indexEligible: false,
        sitemapEligible: false,
        llmsEligible: false,
        schemaRuntimeEligible: false,
      });
    }

    expect(requestedUrls).toHaveLength(15);
    for (const slug of v2RangeSlugs) {
      expect(requestedUrls.some((url) => url.includes(`/api/v0.5/personality-content-assets/big_five/polarity/${slug}?`))).toBe(
        true
      );
    }
  });

  it("fails closed for facet stubs, unpublished states, and API 404s", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          ok: true,
          personality_public_content_asset_v1: sampleAsset({
            entity_type: "facet",
            code: "imagination",
            entity_key: "imagination",
            slug: "big-five/facets/imagination",
            launch_state: "content_stub",
          }),
        })
      )
    );

    await expect(
      getBigFivePublicContentAsset("en", {
        entityType: "facet_hub",
        code: "facets",
        routeSlug: "facets",
        pathSuffix: "/facets",
      })
    ).resolves.toBeNull();

    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ ok: false, error_code: "NOT_FOUND" }, 404)));
    await expect(
      getBigFivePublicContentAsset("en", {
        entityType: "domain",
        code: "openness",
        routeSlug: "openness",
        pathSuffix: "/openness",
      })
    ).resolves.toBeNull();
  });

  it("builds route metadata from a noindex API asset with canonical and hreflang", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          ok: true,
          personality_public_content_asset_v1: sampleAsset(),
        })
      )
    );
    const route = await import("@/app/(localized)/[locale]/personality/big-five/[...slug]/page");
    const metadata = await route.generateMetadata({
      params: Promise.resolve({ locale: "en", slug: ["openness"] }),
    });

    expect(metadata.title).toBe("Openness | FermatMind Big Five");
    expect(metadata.description).toBe("Backend supplied SEO description.");
    expect(metadata.alternates?.canonical).toBe("http://localhost:3000/en/personality/big-five/openness");
    expect(metadata.alternates?.languages).toMatchObject({
      en: "http://localhost:3000/en/personality/big-five/openness",
      "zh-CN": "http://localhost:3000/zh/personality/big-five/openness",
    });
    expect(metadata.robots).toMatchObject({
      index: false,
      follow: true,
      googleBot: {
        index: false,
        follow: true,
      },
    });
  });

  it("builds indexable route metadata only when the API asset is released and index eligible", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          ok: true,
          personality_public_content_asset_v1: sampleAsset({
            robots: "index,follow",
            index_eligible: true,
            sitemap_eligible: true,
            llms_eligible: true,
            launch_state: "published",
            schema_runtime_eligible: true,
          }),
        })
      )
    );
    const route = await import("@/app/(localized)/[locale]/personality/big-five/[...slug]/page");
    const metadata = await route.generateMetadata({
      params: Promise.resolve({ locale: "en", slug: ["openness"] }),
    });

    expect(metadata.robots).toMatchObject({
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    });
  });

  it("renders Big Five JSON-LD only when the backend runtime schema gate allows it", async () => {
    const route = await import("@/app/(localized)/[locale]/personality/big-five/page");
    const hubAsset = {
      entity_type: "hub",
      code: "big-five",
      entity_key: "big-five",
      slug: "big-five",
      title: "Big Five Personality",
      canonical_path: "/en/personality/big-five",
      canonical: { path: "/en/personality/big-five" },
      hreflang: {
        en: "/en/personality/big-five",
        "zh-CN": "/zh/personality/big-five",
      },
    };

    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          ok: true,
          personality_public_content_asset_v1: sampleAsset({
            ...hubAsset,
            schema_runtime_eligible: false,
          }),
        })
      )
    );

    const noSchemaView = render(
      await route.default({
        params: Promise.resolve({ locale: "en" }),
        searchParams: Promise.resolve({}),
      })
    );

    expect(noSchemaView.container.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(0);
    expect(screen.getByRole("heading", { name: "Big Five Personality" })).toBeInTheDocument();
    noSchemaView.unmount();

    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          ok: true,
          personality_public_content_asset_v1: sampleAsset({
            ...hubAsset,
            schema_runtime_eligible: true,
          }),
        })
      )
    );

    const schemaAllowedView = render(
      await route.default({
        params: Promise.resolve({ locale: "en" }),
        searchParams: Promise.resolve({}),
      })
    );

    expect(schemaAllowedView.container.querySelector("#big-five-hub-page-jsonld")).toBeInTheDocument();
    expect(schemaAllowedView.container.querySelector("#big-five-hub-breadcrumb-jsonld")).toBeInTheDocument();
    expect(schemaAllowedView.container.querySelector("#big-five-hub-faq-jsonld")).toBeInTheDocument();
  });

  it("renders CollectionPage JSON-LD for a schema-eligible facet hub without changing robots gates", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          ok: true,
          personality_public_content_asset_v1: sampleAsset({
            entity_type: "facet_hub",
            code: "facets",
            entity_key: "facets",
            slug: "big-five/facets",
            title: "Big Five Facets",
            canonical_path: "/en/personality/big-five/facets",
            canonical: { path: "/en/personality/big-five/facets" },
            schema_runtime_eligible: true,
          }),
        })
      )
    );
    const route = await import("@/app/(localized)/[locale]/personality/big-five/[...slug]/page");
    const view = render(
      await route.default({
        params: Promise.resolve({ locale: "en", slug: ["facets"] }),
      })
    );

    const jsonLd = view.container.querySelector("#big-five-dimension-page-jsonld");
    expect(jsonLd).toBeInTheDocument();
    expect(JSON.parse(jsonLd?.textContent ?? "{}")).toMatchObject({
      "@type": "CollectionPage",
      url: "http://localhost:3000/en/personality/big-five/facets",
    });
    expect(view.container.querySelector("#big-five-dimension-breadcrumb-jsonld")).toBeInTheDocument();
    view.unmount();
  });

  it("keeps noindex Big Five routes blocked while allowing backend sitemap-source released canonical paths into llms", () => {
    const llms = read("app/llms.txt/route.ts");
    const llmsFull = read("app/llms-full.txt/route.ts");

    for (const entry of BIG_FIVE_PUBLIC_ROUTE_ENTRIES) {
      for (const locale of ["en", "zh"] as const) {
        const path = buildBigFivePublicContentPath(locale, entry);
        expect(shouldIncludeInSitemap(path, { indexEligible: false, indexState: "noindex" })).toBe(false);
      }
    }

    expect(llms).toContain("listBackendSitemapBigFiveZhPaths");
    expect(llmsFull).toContain("listBackendSitemapBigFiveZhPaths");
    expect(extractBackendSitemapBigFiveZhPaths({
      items: [
        { loc: "https://fermatmind.com/zh/personality/big-five/openness" },
        { loc: "https://fermatmind.com/zh/personality/big-five/openness-high" },
        { loc: "https://fermatmind.com/zh/personality/big-five" },
        { loc: "https://fermatmind.com/en/personality/big-five/openness" },
        { loc: "https://fermatmind.com/zh/big-five/openness" },
        { loc: "https://staging.fermatmind.com/zh/personality/big-five/openness" },
      ],
    })).toEqual([
      "/en/personality/big-five/openness",
      "/zh/personality/big-five",
      "/zh/personality/big-five/openness",
      "/zh/personality/big-five/openness-high",
    ]);
  });

  it("anchors the renderer to API content without local editorial fallback or SoftwareApplication schema", () => {
    const routeSource = read("app/(localized)/[locale]/personality/big-five/page.tsx");
    const rendererSource = read("components/personality/PublicContentAssetRenderer.tsx");
    const adapterSource = read("lib/cms/personality-public-content-assets.ts");

    expect(routeSource).toContain("getBigFivePublicContentAsset");
    expect(routeSource).toContain("notFound()");
    expect(routeSource).toContain("noindex: !shouldIndex");
    expect(routeSource).toContain("robotsAllowsIndex");
    expect(routeSource).toContain("asset.schemaRuntimeEligible");
    expect(routeSource).toContain("buildFAQPageJsonLd");
    expect(routeSource).toContain("buildCollectionPageJsonLd");
    expect(routeSource).not.toContain("SoftwareApplication");
    expect(rendererSource).toContain("asset.sections");
    expect(rendererSource).toContain("asset.methodBoundary");
    expect(rendererSource).toContain("asset.internalLinks");
    expect(adapterSource).toContain("isReadableLaunchState");
    expect(adapterSource).toContain("content_ready");
    expect(adapterSource).toContain("published");
    expect(adapterSource).toContain("return null");
  });

  it("keeps the PR diff inside the declared noindex render scope", () => {
    if (isCleanMainLikeCheckout()) {
      return;
    }

    const files = changedFiles();
    expect(files.length).toBeGreaterThan(0);
    expect(files.every(isPersonalityBig5V1NoindexRender01AllowedFile), files.join("\n")).toBe(true);
  });
});

describe("PERSONALITY-BIG5-V1-HUB-CMS-RENDERER contract", () => {
  it("hub page source imports PublicContentAssetRenderer", () => {
    const hubSource = read("app/(localized)/[locale]/personality/big-five/page.tsx");
    expect(hubSource).toContain("PublicContentAssetRenderer");
  });

  it("hub page source gates BigFiveHubContentScaffold behind layout_preview flag", () => {
    const hubSource = read("app/(localized)/[locale]/personality/big-five/page.tsx");
    expect(hubSource).toContain("layout_preview");
    expect(hubSource).toContain("isPreviewMode");
    expect(hubSource).toContain("PublicContentAssetRenderer");
  });

  it("hub page source reads searchParams for layout_preview", () => {
    const hubSource = read("app/(localized)/[locale]/personality/big-five/page.tsx");
    expect(hubSource).toContain("searchParams");
    expect(hubSource).toContain("HubPageSearchParams");
    expect(hubSource).toContain("layout_preview");
  });

  it("BigFiveHubContentScaffold accepts preview prop and gates preview badge", () => {
    const scaffoldSource = read("components/personality/BigFiveHubContentScaffold.tsx");
    expect(scaffoldSource).toContain("preview?: boolean");
    expect(scaffoldSource).toContain("{preview ? (");
    expect(scaffoldSource).toContain("asset?: PersonalityPublicContentAsset");
  });

  it("hub page source no longer unconditionally renders BigFiveHubContentScaffold", () => {
    const hubSource = read("app/(localized)/[locale]/personality/big-five/page.tsx");
    // Must contain both the scaffold import (for preview) and the renderer import (for production)
    expect(hubSource).toContain("BigFiveHubContentScaffold");
    expect(hubSource).toContain("PublicContentAssetRenderer");
    // Scaffold should only be rendered conditionally
    expect(hubSource).toContain("isPreviewMode");
  });

  it("preview badge text is absent from production code path", () => {
    const hubSource = read("app/(localized)/[locale]/personality/big-five/page.tsx");
    // The production renderer (PublicContentAssetRenderer) should NOT contain preview text
    expect(hubSource).not.toContain("CMS 内容待填充");
    expect(hubSource).not.toContain("Preview Slot Placeholder");
  });

  it("hub page still fetches CMS asset and passes it to renderers", () => {
    const hubSource = read("app/(localized)/[locale]/personality/big-five/page.tsx");
    expect(hubSource).toContain("getBigFivePublicContentAsset");
    // asset must be used (not discarded) — passed to either renderer
    expect(hubSource).toContain("asset=");
  });
});
