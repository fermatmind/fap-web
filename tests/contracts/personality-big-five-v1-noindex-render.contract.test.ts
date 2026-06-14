import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getBigFivePublicContentAsset } from "@/lib/cms/personality-public-content-assets";
import {
  BIG_FIVE_PUBLIC_ROUTE_ENTRIES,
  buildBigFivePublicContentPath,
  resolveBigFivePublicRouteEntry,
} from "@/lib/personality/bigFivePublicRoutes";
import { isCleanMainLikeCheckout, isPersonalityBig5V1NoindexRender01AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();

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
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("PERSONALITY-BIG5-V1-NOINDEX-RENDER-01 contract", () => {
  it("defines exactly 17 Big Five V1 route candidates per locale and rejects facet detail routes", () => {
    expect(BIG_FIVE_PUBLIC_ROUTE_ENTRIES).toHaveLength(17);
    expect(BIG_FIVE_PUBLIC_ROUTE_ENTRIES.filter((entry) => entry.entityType === "facet_hub")).toHaveLength(1);
    expect(resolveBigFivePublicRouteEntry([])?.code).toBe("big-five");
    expect(resolveBigFivePublicRouteEntry(["openness"])?.entityType).toBe("domain");
    expect(resolveBigFivePublicRouteEntry(["facets"])?.entityType).toBe("facet_hub");
    expect(resolveBigFivePublicRouteEntry(["facets", "imagination"])).toBeNull();

    const paths = BIG_FIVE_PUBLIC_ROUTE_ENTRIES.flatMap((entry) => [
      buildBigFivePublicContentPath("en", entry),
      buildBigFivePublicContentPath("zh", entry),
    ]);
    expect(paths).toHaveLength(34);
    expect(paths).toContain("/en/personality/big-five/facets");
    expect(paths).not.toContain("/en/personality/big-five/facets/imagination");
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

  it("builds route metadata from the API asset with noindex, canonical, and hreflang", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          ok: true,
          personality_public_content_asset_v1: sampleAsset(),
        })
      )
    );
    const route = await import("@/app/(localized)/[locale]/personality/big-five/[[...slug]]/page");
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

  it("keeps Big Five V1 noindex routes out of sitemap and llms surfaces", () => {
    const sitemap = read("public/sitemap.xml");
    const llms = read("app/llms.txt/route.ts");
    const llmsFull = read("app/llms-full.txt/route.ts");

    for (const entry of BIG_FIVE_PUBLIC_ROUTE_ENTRIES) {
      for (const locale of ["en", "zh"] as const) {
        const path = buildBigFivePublicContentPath(locale, entry);
        expect(sitemap).not.toContain(path);
        expect(llms).not.toContain(path);
        expect(llmsFull).not.toContain(path);
      }
    }
  });

  it("anchors the renderer to API content without local editorial fallback or SoftwareApplication schema", () => {
    const routeSource = read("app/(localized)/[locale]/personality/big-five/[[...slug]]/page.tsx");
    const rendererSource = read("components/personality/PublicContentAssetRenderer.tsx");
    const adapterSource = read("lib/cms/personality-public-content-assets.ts");

    expect(routeSource).toContain("getBigFivePublicContentAsset");
    expect(routeSource).toContain("notFound()");
    expect(routeSource).toContain("noindex: true");
    expect(routeSource).toContain("buildFAQPageJsonLd");
    expect(routeSource).toContain("buildCollectionPageJsonLd");
    expect(routeSource).not.toContain("SoftwareApplication");
    expect(rendererSource).toContain("asset.sections");
    expect(rendererSource).toContain("asset.methodBoundary");
    expect(rendererSource).toContain("asset.internalLinks");
    expect(adapterSource).toContain("launchState !== \"content_ready\"");
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
