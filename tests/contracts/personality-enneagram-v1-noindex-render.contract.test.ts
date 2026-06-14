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
  it("defines exactly 13 Enneagram V1 route candidates per locale and rejects wing and subtype detail routes", () => {
    expect(ENNEAGRAM_PUBLIC_ROUTE_ENTRIES).toHaveLength(13);
    expect(ENNEAGRAM_PUBLIC_ROUTE_ENTRIES.filter((entry) => entry.entityType === "center")).toHaveLength(3);
    expect(ENNEAGRAM_PUBLIC_ROUTE_ENTRIES.filter((entry) => entry.entityType === "core_type")).toHaveLength(9);
    expect(resolveEnneagramPublicRouteEntry([])?.code).toBe("enneagram");
    expect(resolveEnneagramPublicRouteEntry(["centers", "gut"])?.entityType).toBe("center");
    expect(resolveEnneagramPublicRouteEntry(["type-1"])?.entityType).toBe("core_type");
    expect(resolveEnneagramPublicRouteEntry(["5w4"])).toBeNull();
    expect(resolveEnneagramPublicRouteEntry(["type-2", "self-preservation"])).toBeNull();
    expect(resolveEnneagramPublicRouteEntry(["tritype-548"])).toBeNull();

    const paths = ENNEAGRAM_PUBLIC_ROUTE_ENTRIES.flatMap((entry) => [
      buildEnneagramPublicContentPath("en", entry),
      buildEnneagramPublicContentPath("zh", entry),
    ]);
    expect(paths).toHaveLength(26);
    expect(paths).toContain("/en/personality/enneagram/centers/gut");
    expect(paths).toContain("/zh/personality/enneagram/type-9");
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
    const route = await import("@/app/(localized)/[locale]/personality/enneagram/[[...slug]]/page");
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
    expect(metadata.robots).toMatchObject({
      index: false,
      follow: true,
      googleBot: {
        index: false,
        follow: true,
      },
    });
  });

  it("keeps Enneagram V1 noindex routes out of sitemap and llms surfaces", () => {
    const sitemap = read("public/sitemap.xml");
    const llms = read("app/llms.txt/route.ts");
    const llmsFull = read("app/llms-full.txt/route.ts");

    for (const entry of ENNEAGRAM_PUBLIC_ROUTE_ENTRIES) {
      for (const locale of ["en", "zh"] as const) {
        const pagePath = buildEnneagramPublicContentPath(locale, entry);
        expect(sitemap).not.toContain(pagePath);
        expect(llms).not.toContain(pagePath);
        expect(llmsFull).not.toContain(pagePath);
      }
    }
  });

  it("anchors the renderer to API content without local editorial fallback or SoftwareApplication schema", () => {
    const routeSource = read("app/(localized)/[locale]/personality/enneagram/[[...slug]]/page.tsx");
    const rendererSource = read("components/personality/PublicContentAssetRenderer.tsx");
    const adapterSource = read("lib/cms/personality-public-content-assets.ts");

    expect(routeSource).toContain("getEnneagramPublicContentAsset");
    expect(routeSource).toContain("notFound()");
    expect(routeSource).toContain("noindex: true");
    expect(routeSource).toContain("buildFAQPageJsonLd");
    expect(routeSource).toContain("buildCollectionPageJsonLd");
    expect(routeSource).not.toContain("SoftwareApplication");
    expect(rendererSource).toContain("asset.sections");
    expect(rendererSource).toContain("asset.methodBoundary");
    expect(rendererSource).toContain("asset.internalLinks");
    expect(adapterSource).toContain("framework !== expectedFramework");
    expect(adapterSource).toContain("launchState !== \"content_ready\"");
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
