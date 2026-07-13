import { afterEach, describe, expect, it, vi } from "vitest";
import { getBigFivePublicContentAsset, getEnneagramPublicContentAsset } from "@/lib/cms/personality-public-content-assets";
import {
  ENNEAGRAM_PUBLIC_ROUTE_ENTRIES,
  resolveEnneagramPublicRouteEntry,
} from "@/lib/personality/enneagramPublicRoutes";
import { resolveBigFivePublicRouteEntry } from "@/lib/personality/bigFivePublicRoutes";

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function sampleAsset(overrides: Record<string, unknown> = {}) {
  return {
    framework: "enneagram",
    entity_type: "wing",
    code: "5w4",
    entity_key: "5w4",
    slug: "enneagram/wings/5w4",
    locale: "en",
    title: "Type 5 Wing 4",
    summary: "Backend supplied wing summary.",
    seo: {
      title: "Type 5 Wing 4 | FermatMind Enneagram",
      description: "Backend supplied wing SEO description.",
    },
    robots: "noindex,follow",
    canonical_path: "/en/personality/enneagram/wings/5w4",
    canonical: { path: "/en/personality/enneagram/wings/5w4" },
    hreflang: {
      en: "/en/personality/enneagram/wings/5w4",
      "zh-CN": "/zh/personality/enneagram/wings/5w4",
    },
    faq: [
      { q: "Is 5w4 a diagnosis?", a: "No. It is a bounded personality-content explainer." },
      { question: "", answer: "Dropped because the question is empty." },
    ],
    media: { status: "placeholder", alt: "Type 5 Wing 4" },
    schema: { "@type": "WebPage" },
    schema_runtime_eligible: false,
    method_boundary: {
      summary: "Use as a reflection aid, not a diagnostic instrument.",
      not_for: ["clinical diagnosis", "employment screening"],
    },
    evidence_notes: [{ source_type: "method_boundary", note: "Keep Enneagram claims bounded." }],
    internal_links: [
      {
        label: "Type 5",
        target_code: "type-5",
        relationship: "core_type",
        url: "/en/personality/enneagram/type-5",
      },
      {
        label: "External unsafe URL",
        target_code: "external",
        relationship: "unsafe",
        url: "https://example.com/unsafe",
      },
      {
        label: "",
        target_code: "empty-label",
        relationship: "invalid",
        href: "/en/personality/enneagram",
      },
    ],
    is_public: true,
    index_eligible: false,
    sitemap_eligible: false,
    llms_eligible: false,
    launch_state: "content_ready",
    review_state: "content_reviewed",
    sections: [
      {
        key: "overview",
        title: "Overview",
        body_md: "Backend supplied body.",
      },
    ],
    ...overrides,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("ENNEAGRAM-90-FRONTEND-ASSET-CONTRACT-01", () => {
  it("accepts all Enneagram wing and instinctual subtype entity identities without weakening EN13 identities", () => {
    expect(ENNEAGRAM_PUBLIC_ROUTE_ENTRIES.filter((entry) => entry.entityType === "hub")).toHaveLength(1);
    expect(ENNEAGRAM_PUBLIC_ROUTE_ENTRIES.filter((entry) => entry.entityType === "center")).toHaveLength(3);
    expect(ENNEAGRAM_PUBLIC_ROUTE_ENTRIES.filter((entry) => entry.entityType === "core_type")).toHaveLength(9);
    expect(ENNEAGRAM_PUBLIC_ROUTE_ENTRIES.filter((entry) => entry.entityType === "wing")).toHaveLength(18);
    expect(ENNEAGRAM_PUBLIC_ROUTE_ENTRIES.filter((entry) => entry.entityType === "instinctual_subtype")).toHaveLength(27);
    expect(resolveEnneagramPublicRouteEntry(["centers", "gut"])).toMatchObject({
      entityType: "center",
      code: "gut",
    });
    expect(resolveEnneagramPublicRouteEntry(["type-1"])).toMatchObject({
      entityType: "core_type",
      code: "type-1",
    });
    expect(resolveEnneagramPublicRouteEntry(["wings", "5w4"])).toMatchObject({
      entityType: "wing",
      code: "5w4",
    });
    expect(resolveEnneagramPublicRouteEntry(["type-2", "instincts", "self-preservation"])).toMatchObject({
      entityType: "instinctual_subtype",
      code: "type-2/self-preservation",
    });
    expect(resolveEnneagramPublicRouteEntry(["type-2", "instincts", "self-preservation", "extra", "segment"])).toBeNull();
  });

  it("normalizes wing q/a FAQ aliases and label/url internal links while dropping unsafe or empty links", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        expect(url).toContain("/api/v0.5/personality-content-assets/enneagram/wing/5w4?");
        expect(url).toContain("locale=en");

        return jsonResponse({
          ok: true,
          personality_public_content_asset_v1: sampleAsset(),
        });
      })
    );

    const asset = await getEnneagramPublicContentAsset("en", {
      entityType: "wing",
      code: "5w4",
      routeSlug: "wings/5w4",
      pathSuffix: "/wings/5w4",
    });

    expect(asset).toMatchObject({
      framework: "enneagram",
      entityType: "wing",
      code: "5w4",
      canonicalPath: "/en/personality/enneagram/wings/5w4",
      robots: "noindex,follow",
      indexEligible: false,
      sitemapEligible: false,
      llmsEligible: false,
      schemaRuntimeEligible: false,
    });
    expect(asset?.faq).toEqual([
      { question: "Is 5w4 a diagnosis?", answer: "No. It is a bounded personality-content explainer." },
    ]);
    expect(asset?.internalLinks).toEqual([
      {
        label: "Type 5",
        href: "/en/personality/enneagram/type-5",
        relationship: "core_type",
        targetCode: "type-5",
      },
    ]);
  });

  it("normalizes subtype asset identity through the index endpoint and fails closed for mismatched or private assets", async () => {
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
              title: "二号社交副型",
              canonical_path: "/zh/personality/enneagram/type-2/instincts/social",
            }),
            sampleAsset({
              entity_type: "instinctual_subtype",
              code: "type-2/self-preservation",
              entity_key: "type-2/self-preservation",
              slug: "enneagram/type-2/self-preservation",
              locale: "zh-CN",
              title: "二号自保副型",
              canonical_path: "/zh/personality/enneagram/type-2/instincts/self-preservation",
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
      canonicalPath: "/zh/personality/enneagram/type-2/instincts/self-preservation",
    });

    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          ok: true,
          personality_public_content_asset_v1: sampleAsset({
            entity_type: "wing",
            code: "5w4",
            is_public: false,
          }),
        })
      )
    );
    await expect(
      getEnneagramPublicContentAsset("en", {
        entityType: "wing",
        code: "5w4",
        routeSlug: "wings/5w4",
        pathSuffix: "/wings/5w4",
      })
    ).resolves.toBeNull();

    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          ok: true,
          personality_public_content_asset_v1: sampleAsset({
            entity_type: "core_type",
            code: "type-5",
          }),
        })
      )
    );
    await expect(
      getEnneagramPublicContentAsset("en", {
        entityType: "wing",
        code: "5w4",
        routeSlug: "wings/5w4",
        pathSuffix: "/wings/5w4",
      })
    ).rejects.toMatchObject({ kind: "contract", authoritativeAbsence: false });
  });

  it("keeps the existing Big Five public asset contract unchanged", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        expect(url).toContain("/api/v0.5/personality-content-assets/big_five/domain/openness?");
        expect(url).toContain("locale=en");

        return jsonResponse({
          ok: true,
          personality_public_content_asset_v1: sampleAsset({
            framework: "big_five",
            entity_type: "domain",
            code: "openness",
            entity_key: "openness",
            slug: "big-five/openness",
            canonical_path: "/en/personality/big-five/openness",
            title: "Openness",
          }),
        });
      })
    );

    const entry = resolveBigFivePublicRouteEntry(["openness"]);
    expect(entry).toMatchObject({ entityType: "domain", code: "openness" });
    await expect(getBigFivePublicContentAsset("en", entry!)).resolves.toMatchObject({
      framework: "big_five",
      entityType: "domain",
      code: "openness",
      robots: "noindex,follow",
      indexEligible: false,
      sitemapEligible: false,
      llmsEligible: false,
    });
  });
});
