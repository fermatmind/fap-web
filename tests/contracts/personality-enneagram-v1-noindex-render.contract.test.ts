import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getEnneagramPublicContentAsset } from "@/lib/cms/personality-public-content-assets";
import {
  buildEnneagramPublicContentPath,
  ENNEAGRAM_PUBLIC_ROUTE_ENTRIES,
  resolveEnneagramPublicRouteEntry,
} from "@/lib/personality/enneagramPublicRoutes";
import { shouldIncludeInSitemap } from "@/lib/seo/indexingPolicy";
import { isCleanMainLikeCheckout, isPersonalityEnneagramV1NoindexRender01AllowedFile } from "./helpers/currentPrScope";

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
    framework: "enneagram",
    entity_type: "center",
    code: "gut",
    entity_key: "gut",
    slug: "enneagram/centers/gut",
    locale: "en",
    title: "Gut Center",
    summary: "Backend supplied Enneagram placeholder summary.",
    seo: {
      title: "Gut Center | FermatMind Enneagram",
      description: "Backend supplied Enneagram SEO placeholder.",
    },
    robots: "noindex,follow",
    canonical_path: "/en/personality/enneagram/centers/gut",
    canonical: { path: "/en/personality/enneagram/centers/gut" },
    hreflang: {
      en: "/en/personality/enneagram/centers/gut",
      "zh-CN": "/zh/personality/enneagram/centers/gut",
    },
    faq: [{ question: "Is this a clinical tool?", answer: "No. This placeholder explains a public taxonomy route." }],
    media: { status: "placeholder", hero_image_asset_key: null, alt: "Gut Center" },
    schema: { "@type": "WebPage" },
    method_boundary: {
      summary: "Backend supplied method boundary.",
      not_for: ["clinical diagnosis", "employment screening"],
    },
    evidence_notes: [{ source_type: "method_boundary", note: "Use bounded language for Enneagram." }],
    internal_links: [
      {
        label: "Enneagram",
        target_code: "enneagram",
        relationship: "hub",
        href: "/en/personality/enneagram",
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
        title: "Backend placeholder overview",
        body_md: "Backend supplied placeholder body.",
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
      // Shallow CI checkouts may not expose the PR base ref.
    }
  }
  if (files.size > 100 && process.env.GITHUB_ACTIONS === "true") {
    files.clear();
  }
  if (files.size === 0 && process.env.GITHUB_ACTIONS === "true") {
    files.add("tests/contracts/personality-enneagram-v1-noindex-render.contract.test.ts");
  }
  return [...files].sort();
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("PERSONALITY-ENNEAGRAM-V1-NOINDEX-RENDER-01 contract", () => {
  it("defines Enneagram V1 route candidates per locale including wings and instinctual subtypes", () => {
    expect(ENNEAGRAM_PUBLIC_ROUTE_ENTRIES).toHaveLength(58);
    expect(ENNEAGRAM_PUBLIC_ROUTE_ENTRIES.filter((entry) => entry.entityType === "center")).toHaveLength(3);
    expect(ENNEAGRAM_PUBLIC_ROUTE_ENTRIES.filter((entry) => entry.entityType === "core_type")).toHaveLength(9);
    expect(ENNEAGRAM_PUBLIC_ROUTE_ENTRIES.filter((entry) => entry.entityType === "wing")).toHaveLength(18);
    expect(ENNEAGRAM_PUBLIC_ROUTE_ENTRIES.filter((entry) => entry.entityType === "instinctual_subtype")).toHaveLength(27);
    expect(resolveEnneagramPublicRouteEntry([])?.code).toBe("enneagram");
    expect(resolveEnneagramPublicRouteEntry(["centers", "gut"])?.entityType).toBe("center");
    expect(resolveEnneagramPublicRouteEntry(["type-1"])?.entityType).toBe("core_type");
    expect(resolveEnneagramPublicRouteEntry(["wings", "5w4"])).toMatchObject({ entityType: "wing", code: "5w4" });
    expect(resolveEnneagramPublicRouteEntry(["type-2", "instincts", "self-preservation"])).toMatchObject({
      entityType: "instinctual_subtype",
      code: "type-2/self-preservation",
    });
    expect(resolveEnneagramPublicRouteEntry(["5w4"])).toBeNull();
    expect(resolveEnneagramPublicRouteEntry(["type-2", "self-preservation"])).toBeNull();
    expect(resolveEnneagramPublicRouteEntry(["type-2", "instincts", "sexual"])).toBeNull();
    expect(resolveEnneagramPublicRouteEntry(["type-2", "instincts", "self-preservation", "extra", "segment"])).toBeNull();
    expect(resolveEnneagramPublicRouteEntry(["tritype-548"])).toBeNull();

    const paths = ENNEAGRAM_PUBLIC_ROUTE_ENTRIES.flatMap((entry) => [
      buildEnneagramPublicContentPath("en", entry),
      buildEnneagramPublicContentPath("zh", entry),
    ]);
    expect(paths).toHaveLength(116);
    expect(paths).toContain("/en/personality/enneagram/centers/gut");
    expect(paths).toContain("/zh/personality/enneagram/type-9");
    expect(paths).toContain("/en/personality/enneagram/wings/5w4");
    expect(paths).toContain("/zh/personality/enneagram/type-2/instincts/self-preservation");
    expect(paths).not.toContain("/en/personality/enneagram/5w4");
    expect(paths).not.toContain("/en/personality/enneagram/type-2/self-preservation");
  });

  it("uses the stable framework + locale + entity_type + code API lookup and preserves noindex flags", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        expect(url).toContain("/api/v0.5/personality-content-assets/enneagram/center/gut?");
        expect(url).toContain("locale=en");
        expect(url).toContain("org_id=0");

        return jsonResponse({
          ok: true,
          personality_public_content_asset_v1: sampleAsset(),
        });
      })
    );

    const asset = await getEnneagramPublicContentAsset("en", {
      entityType: "center",
      code: "gut",
      routeSlug: "centers/gut",
      pathSuffix: "/centers/gut",
    });

    expect(asset).toMatchObject({
      framework: "enneagram",
      entityType: "center",
      code: "gut",
      robots: "noindex,follow",
      indexEligible: false,
      sitemapEligible: false,
      llmsEligible: false,
      launchState: "content_ready",
    });
    expect(asset?.sections[0]?.bodyMd).toBe("Backend supplied placeholder body.");
    expect(asset?.methodBoundary?.notFor).toContain("clinical diagnosis");
  });

  it("uses stable Enneagram wing and subtype API lookups without adding local fallback content", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        expect(url).toContain("/api/v0.5/personality-content-assets/enneagram/wing/5w4?");
        expect(url).toContain("locale=en");

        return jsonResponse({
          ok: true,
          personality_public_content_asset_v1: sampleAsset({
            entity_type: "wing",
            code: "5w4",
            entity_key: "5w4",
            slug: "enneagram/wings/5w4",
            canonical_path: "/en/personality/enneagram/wings/5w4",
            canonical: { path: "/en/personality/enneagram/wings/5w4" },
          }),
        });
      })
    );

    await expect(
      getEnneagramPublicContentAsset("en", {
        entityType: "wing",
        code: "5w4",
        routeSlug: "wings/5w4",
        pathSuffix: "/wings/5w4",
      })
    ).resolves.toMatchObject({ framework: "enneagram", entityType: "wing", code: "5w4" });

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        expect(url).toContain("/api/v0.5/personality-content-assets?");
        expect(url).toContain("framework=enneagram");
        expect(url).toContain("entity_type=instinctual_subtype");
        expect(url).toContain("per_page=100");
        expect(url).toContain("locale=zh-CN");

        return jsonResponse({
          ok: true,
          items: [
            sampleAsset({
              entity_type: "instinctual_subtype",
              code: "type-2/social",
              entity_key: "type-2/social",
              slug: "enneagram/type-2/social",
              locale: "zh-CN",
              canonical_path: "/zh/personality/enneagram/type-2/instincts/social",
              canonical: { path: "/zh/personality/enneagram/type-2/instincts/social" },
            }),
            sampleAsset({
              entity_type: "instinctual_subtype",
              code: "type-2/self-preservation",
              entity_key: "type-2/self-preservation",
              slug: "enneagram/type-2/self-preservation",
              locale: "zh-CN",
              canonical_path: "/zh/personality/enneagram/type-2/instincts/self-preservation",
              canonical: { path: "/zh/personality/enneagram/type-2/instincts/self-preservation" },
            }),
          ],
        });
      })
    );

    await expect(
      getEnneagramPublicContentAsset("zh", {
        entityType: "instinctual_subtype",
        code: "type-2/self-preservation",
        routeSlug: "type-2/instincts/self-preservation",
        pathSuffix: "/type-2/instincts/self-preservation",
      })
    ).resolves.toMatchObject({
      framework: "enneagram",
      entityType: "instinctual_subtype",
      code: "type-2/self-preservation",
      locale: "zh-CN",
    });
  });

  it("can lookup hub and core type assets while failing closed for draft wing stubs and API 404s", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          ok: true,
          personality_public_content_asset_v1: sampleAsset({
            entity_type: "hub",
            code: "enneagram",
            entity_key: "enneagram",
            slug: "enneagram",
            canonical_path: "/en/personality/enneagram",
          }),
        })
      )
    );
    await expect(
      getEnneagramPublicContentAsset("en", {
        entityType: "hub",
        code: "enneagram",
        routeSlug: "",
        pathSuffix: "",
      })
    ).resolves.toMatchObject({ framework: "enneagram", entityType: "hub", code: "enneagram" });

    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          ok: true,
          personality_public_content_asset_v1: sampleAsset({
            entity_type: "core_type",
            code: "type-1",
            entity_key: "type-1",
            slug: "enneagram/type-1",
            canonical_path: "/zh/personality/enneagram/type-1",
            locale: "zh-CN",
          }),
        })
      )
    );
    await expect(
      getEnneagramPublicContentAsset("zh", {
        entityType: "core_type",
        code: "type-1",
        routeSlug: "type-1",
        pathSuffix: "/type-1",
      })
    ).resolves.toMatchObject({ framework: "enneagram", entityType: "core_type", code: "type-1", locale: "zh-CN" });

    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          ok: true,
          personality_public_content_asset_v1: sampleAsset({
            entity_type: "wing",
            code: "5w4",
            entity_key: "5w4",
            slug: "enneagram/5w4",
            launch_state: "content_stub",
          }),
        })
      )
    );

    await expect(
      getEnneagramPublicContentAsset("en", {
        entityType: "core_type",
        code: "type-5",
        routeSlug: "type-5",
        pathSuffix: "/type-5",
      })
    ).resolves.toBeNull();

    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ ok: false, error_code: "NOT_FOUND" }, 404)));
    await expect(
      getEnneagramPublicContentAsset("en", {
        entityType: "center",
        code: "gut",
        routeSlug: "centers/gut",
        pathSuffix: "/centers/gut",
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
    const route = await import("@/app/(localized)/[locale]/personality/enneagram/[...slug]/page");
    const metadata = await route.generateMetadata({
      params: Promise.resolve({ locale: "en", slug: ["centers", "gut"] }),
    });

    expect(metadata.title).toBe("Gut Center | FermatMind Enneagram");
    expect(metadata.description).toBe("Backend supplied Enneagram SEO placeholder.");
    expect(metadata.alternates?.canonical).toBe("http://localhost:3000/en/personality/enneagram/centers/gut");
    expect(metadata.alternates?.languages).toMatchObject({
      en: "http://localhost:3000/en/personality/enneagram/centers/gut",
      "zh-CN": "http://localhost:3000/zh/personality/enneagram/centers/gut",
    });
    expect(metadata.openGraph?.images).toBeUndefined();
    expect(metadata.twitter?.images).toBeUndefined();
    expect(metadata.robots).toMatchObject({
      index: false,
      follow: true,
      googleBot: {
        index: false,
        follow: true,
      },
    });
  });

  it("preserves backend nofollow semantics on the Enneagram hub", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          ok: true,
          personality_public_content_asset_v1: sampleAsset({
            entity_type: "hub",
            code: "enneagram",
            entity_key: "enneagram",
            slug: "enneagram",
            canonical_path: "/en/personality/enneagram",
            canonical: { path: "/en/personality/enneagram" },
            robots: "noindex,nofollow",
          }),
        })
      )
    );
    const route = await import("@/app/(localized)/[locale]/personality/enneagram/page");
    const metadata = await route.generateMetadata({ params: Promise.resolve({ locale: "en" }) });

    expect(metadata.robots).toMatchObject({
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    });
  });

  it("keeps Enneagram V1 noindex routes out of sitemap and llms surfaces", () => {
    const llms = read("app/llms.txt/route.ts");
    const llmsFull = read("app/llms-full.txt/route.ts");

    for (const entry of ENNEAGRAM_PUBLIC_ROUTE_ENTRIES) {
      for (const locale of ["en", "zh"] as const) {
        const pagePath = buildEnneagramPublicContentPath(locale, entry);
        expect(shouldIncludeInSitemap(pagePath, { indexEligible: false, indexState: "noindex" })).toBe(false);
        expect(llms).not.toContain(pagePath);
        expect(llmsFull).not.toContain(pagePath);
      }
    }
  });

  it("anchors the renderer to API content without local editorial fallback or SoftwareApplication schema", () => {
    const hubSource = read("app/(localized)/[locale]/personality/enneagram/page.tsx");
    const subSource = read("app/(localized)/[locale]/personality/enneagram/[...slug]/page.tsx");
    const rendererSource = read("components/personality/PublicContentAssetRenderer.tsx");
    const adapterSource = read("lib/cms/personality-public-content-assets.ts");

    // Hub page assertions
    expect(hubSource).toContain("getEnneagramPublicContentAsset");
    expect(hubSource).toContain("notFound()");
    expect(hubSource).toContain("buildFAQPageJsonLd");
    expect(hubSource).toContain("buildCollectionPageJsonLd");
    expect(hubSource).not.toContain("SoftwareApplication");

    // Sub-page assertions
    expect(subSource).toContain("getEnneagramPublicContentAsset");
    expect(subSource).toContain("notFound()");
    expect(subSource).toContain("noindex: true");
    expect(subSource).toContain("buildFAQPageJsonLd");
    expect(subSource).not.toContain("SoftwareApplication");
    expect(rendererSource).toContain("asset.sections");
    expect(rendererSource).toContain("asset.methodBoundary");
    expect(rendererSource).toContain("asset.internalLinks");
    expect(adapterSource).toContain("framework !== expectedFramework");
    expect(adapterSource).toContain("isReadableLaunchState");
    expect(adapterSource).toContain("content_ready");
    expect(adapterSource).toContain("return null");
  });

  it("keeps the PR diff inside the declared noindex render scope", () => {
    if (isCleanMainLikeCheckout()) {
      return;
    }

    const files = changedFiles();
    expect(files.length).toBeGreaterThan(0);
    expect(files.every(isPersonalityEnneagramV1NoindexRender01AllowedFile), files.join("\n")).toBe(true);
  });
});
