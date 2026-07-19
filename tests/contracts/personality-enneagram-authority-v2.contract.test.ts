import fs from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PublicContentAssetRenderer } from "@/components/personality/PublicContentAssetRenderer";
import {
  getEnneagramPublicContentAsset,
  isEnneagramAuthoritySchemaEligible,
  withEnneagramVisibleAuthorityJsonLd,
} from "@/lib/cms/personality-public-content-assets";
import {
  buildEnneagramPublicContentPath,
  ENNEAGRAM_PUBLIC_ROUTE_ENTRIES,
  hasBackendEnneagramMetadataAuthority,
} from "@/lib/personality/enneagramPublicRoutes";

const ROOT = process.cwd();
const CORE_ENTRY = {
  entityType: "core_type" as const,
  code: "type-5",
  routeSlug: "type-5",
  pathSuffix: "/type-5",
};

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function v1Asset(overrides: Record<string, unknown> = {}) {
  return {
    contract_version: "personality_public_asset.v1",
    framework: "enneagram",
    entity_type: "core_type",
    code: "type-5",
    entity_key: "type-5",
    slug: "enneagram/type-5",
    locale: "en",
    title: "Enneagram Type 5",
    summary: "Backend supplied Type 5 summary.",
    seo: {
      title: "Enneagram Type 5 | FermatMind",
      description: "Backend supplied Type 5 SEO description.",
    },
    robots: "index,follow",
    canonical_path: "/en/personality/enneagram/type-5",
    canonical: { path: "/en/personality/enneagram/type-5" },
    hreflang: {
      en: "/en/personality/enneagram/type-5",
      "zh-CN": "/zh/personality/enneagram/type-5",
    },
    faq: [
      {
        question: "Does this page assign a permanent identity?",
        answer: "No. It provides a bounded working hypothesis.",
      },
    ],
    media: {
      status: "approved",
      image_url: "https://assets.fermatmind.com/personality/enneagram/v1-type-5.webp",
      alt: "Backend supplied Type 5 visual",
    },
    schema: { "@type": "WebPage" },
    schema_runtime_eligible: true,
    method_boundary: {
      summary: "Use this content for reflection, not diagnosis.",
      not_for: ["clinical diagnosis", "employment screening"],
    },
    evidence_notes: [],
    internal_links: [],
    sections: [
      {
        key: "overview",
        title: "Backend overview",
        body_md:
          "Backend supplied public body.\n\n![Legacy Markdown image](https://assets.fermatmind.com/personality/enneagram/section.webp)",
      },
      {
        key: "html-overview",
        title: "Backend HTML overview",
        body_html:
          '<p>Backend supplied HTML body.</p><img src="https://assets.fermatmind.com/personality/enneagram/section-html.webp" alt="Legacy HTML image">',
      },
    ],
    is_public: true,
    index_eligible: true,
    sitemap_eligible: true,
    llms_eligible: true,
    launch_state: "published",
    review_state: "approved",
    last_reviewed_at: "2026-07-14T10:00:00Z",
    reviewer: null,
    updated_at: "2026-07-14T09:00:00Z",
    ...overrides,
  };
}

function v2Authority(overrides: Record<string, unknown> = {}) {
  return {
    contract_version: "personality_public_asset.v2",
    compatible_v1_contract_version: "personality_public_asset.v1",
    visible_evidence: {
      eligible: true,
      sources: [
        {
          id: "enneagram-source-01",
          title: "Backend reviewed Enneagram source",
          author_or_organization: "Backend Source Registry",
          year: 2025,
          source_type: "book",
          public_url: "https://example.org/enneagram-source",
          accessed_at: "2026-07-14",
          claim_ids: ["claim.enneagram.type5.boundary"],
          limitation: "The source does not predict individual outcomes.",
        },
      ],
      claim_mapping: [
        {
          claim_id: "claim.enneagram.type5.boundary",
          source_ids: ["enneagram-source-01"],
          limitation: "Descriptive and non-diagnostic.",
        },
      ],
      limitations: ["Evidence does not establish a fixed identity or future result."],
    },
    editorial_authority: {
      author: { name: "Backend Editorial Team", organization: "FermatMind", role: "Author" },
      reviewer: null,
      review_state: "approved",
      published_at: "2026-07-13T08:00:00Z",
      updated_at: "2026-07-14T09:00:00Z",
      last_reviewed_at: "2026-07-14T10:00:00Z",
    },
    media_authority: {
      hero: {
        media_asset_id: 501,
        url: "https://assets.fermatmind.com/personality/enneagram/type-5-hero.webp",
        alt: "Backend approved Type 5 hero",
      },
      inline: [
        {
          media_asset_id: 502,
          url: "https://assets.fermatmind.com/personality/enneagram/type-5-inline.webp",
          alt: "Backend approved Type 5 evidence visual",
        },
      ],
      og: {
        media_asset_id: 503,
        url: "https://assets.fermatmind.com/personality/enneagram/type-5-og.webp",
        alt: "Backend approved Type 5 social card",
      },
    },
    schema_eligible: true,
    working_revision: {
      private_editor_note: "WORKING_REVISION_MUST_NEVER_RENDER",
    },
    ...overrides,
  };
}

async function fetchCore(v2: Record<string, unknown> = v2Authority()) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      jsonResponse({
        ok: true,
        personality_public_content_asset_v1: v1Asset(),
        personality_public_content_asset_v2: v2,
      })
    )
  );

  return getEnneagramPublicContentAsset("en", CORE_ENTRY);
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("ENNEAGRAM-PUBLIC-AUTHORITY-V2-FRONTEND-CONSUMER-21", () => {
  it("keeps the frozen 58-identity and 116-route bilingual estate without URL expansion", () => {
    const paths = ENNEAGRAM_PUBLIC_ROUTE_ENTRIES.flatMap((entry) => [
      buildEnneagramPublicContentPath("en", entry),
      buildEnneagramPublicContentPath("zh", entry),
    ]);

    expect(ENNEAGRAM_PUBLIC_ROUTE_ENTRIES).toHaveLength(58);
    expect(paths).toHaveLength(116);
    expect(new Set(paths)).toHaveLength(116);
    expect(paths.some((value) => value.includes("tritype"))).toBe(false);
    expect(paths.some((value) => /\/wings\/[^/]+\/instincts\//.test(value))).toBe(false);
  });

  it("normalizes the backend V2 overlay without requiring duplicated V1 identity fields", async () => {
    const asset = await fetchCore();

    expect(asset).toMatchObject({ framework: "enneagram", entityType: "core_type", code: "type-5" });
    expect(asset?.authorityV2).toMatchObject({
      contractVersion: "personality_public_asset.v2",
      compatibleV1ContractVersion: "personality_public_asset.v1",
      visibleEvidence: {
        eligible: true,
        sources: [{ id: "enneagram-source-01" }],
        claimMapping: [{ claimId: "claim.enneagram.type5.boundary" }],
      },
      editorialAuthority: {
        reviewState: "approved",
        author: { name: "Backend Editorial Team" },
        publicReview: {
          reviewState: "approved",
          lastReviewedAt: "2026-07-14T10:00:00.000Z",
          reviewer: null,
        },
      },
      schemaEligible: true,
    });
    expect(asset).not.toHaveProperty("media");
    expect(asset?.authorityV2).not.toHaveProperty("mediaAuthority");
    expect(JSON.stringify(asset)).not.toContain("WORKING_REVISION_MUST_NEVER_RENDER");
  });

  it("rejects an optional mismatched V2 identity while preserving the valid V1 page", async () => {
    const asset = await fetchCore(v2Authority({ code: "type-6" }));

    expect(asset).toMatchObject({ code: "type-5", title: "Enneagram Type 5" });
    expect(asset?.authorityV2).toBeNull();
    expect(isEnneagramAuthoritySchemaEligible(asset!)).toBe(false);
  });

  it("keeps a V1-only page renderable while withholding V2-gated schema", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          ok: true,
          personality_public_content_asset_v1: v1Asset(),
        })
      )
    );

    const asset = await getEnneagramPublicContentAsset("en", CORE_ENTRY);

    expect(asset).toMatchObject({ title: "Enneagram Type 5", authorityV2: undefined });
    expect(isEnneagramAuthoritySchemaEligible(asset!)).toBe(false);
  });

  it("upgrades subtype index compatibility with the backend exact-code V2 detail overlay", async () => {
    const subtypeEntry = {
      entityType: "instinctual_subtype" as const,
      code: "type-2/self-preservation",
      routeSlug: "type-2/instincts/self-preservation",
      pathSuffix: "/type-2/instincts/self-preservation",
    };
    const subtypeV1 = v1Asset({
      contract_version: undefined,
      entity_type: "instinctual_subtype",
      code: subtypeEntry.code,
      entity_key: subtypeEntry.code,
      slug: "enneagram/type-2/self-preservation",
      canonical_path: "/en/personality/enneagram/type-2/instincts/self-preservation",
      canonical: { path: "/en/personality/enneagram/type-2/instincts/self-preservation" },
      hreflang: {
        en: "/en/personality/enneagram/type-2/instincts/self-preservation",
        "zh-CN": "/zh/personality/enneagram/type-2/instincts/self-preservation",
      },
    });
    const requests: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        requests.push(url);
        if (url.includes("&code=")) {
          return jsonResponse({
            ok: true,
            personality_public_content_asset_v1: subtypeV1,
            personality_public_content_asset_v2: v2Authority(),
          });
        }

        return jsonResponse({
          ok: true,
          items: [subtypeV1],
          pagination: { current_page: 1, per_page: 100, total: 1, last_page: 1 },
        });
      })
    );

    const asset = await getEnneagramPublicContentAsset("en", subtypeEntry);

    expect(requests).toHaveLength(2);
    expect(requests[0]).toContain("entity_type=instinctual_subtype");
    expect(requests[0]).toContain("per_page=100");
    expect(requests[1]).toContain("code=type-2%2Fself-preservation");
    expect(asset).toMatchObject({ entityType: "instinctual_subtype", code: subtypeEntry.code });
    expect(asset?.authorityV2?.visibleEvidence.eligible).toBe(true);
  });

  it.each([
    {
      label: "retryable timeout",
      detail: () =>
        Promise.reject(
          Object.assign(new Error("Request timed out."), {
            status: 408,
            errorCode: "REQUEST_TIMEOUT",
          })
        ),
      expectedKind: "timeout",
    },
    {
      label: "malformed response",
      detail: () => Promise.resolve(jsonResponse({ ok: false })),
      expectedKind: "contract",
    },
  ])("propagates $label from the subtype V2 detail read", async ({ detail, expectedKind }) => {
    const subtypeEntry = {
      entityType: "instinctual_subtype" as const,
      code: "type-2/self-preservation",
      routeSlug: "type-2/instincts/self-preservation",
      pathSuffix: "/type-2/instincts/self-preservation",
    };
    const subtypeV1 = v1Asset({
      contract_version: undefined,
      entity_type: subtypeEntry.entityType,
      code: subtypeEntry.code,
      entity_key: subtypeEntry.code,
      canonical_path: "/en/personality/enneagram/type-2/instincts/self-preservation",
      canonical: { path: "/en/personality/enneagram/type-2/instincts/self-preservation" },
      hreflang: {
        en: "/en/personality/enneagram/type-2/instincts/self-preservation",
        "zh-CN": "/zh/personality/enneagram/type-2/instincts/self-preservation",
      },
    });
    let requestCount = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        requestCount += 1;
        if (requestCount === 1) {
          return jsonResponse({
            ok: true,
            items: [subtypeV1],
            pagination: { current_page: 1, per_page: 100, total: 1, last_page: 1 },
          });
        }

        return detail();
      })
    );

    await expect(getEnneagramPublicContentAsset("en", subtypeEntry)).rejects.toMatchObject({
      kind: expectedKind,
      authoritativeAbsence: false,
    });
  });

  it("renders normalized authority and text while ignoring all legacy personality media", async () => {
    const asset = await fetchCore();
    expect(asset).not.toBeNull();

    render(PublicContentAssetRenderer({ asset: asset!, locale: "en" }));

    expect(screen.getByTestId("visible-authority-evidence")).toHaveTextContent(
      "Backend reviewed Enneagram source"
    );
    expect(screen.getByTestId("visible-authority-evidence")).toHaveTextContent(
      "Evidence does not establish a fixed identity or future result."
    );
    expect(screen.getByTestId("editorial-authority")).toHaveTextContent("Human review completed");
    expect(screen.getByTestId("editorial-authority")).not.toHaveTextContent("Named Backend Reviewer");
    expect(screen.getByText("Backend supplied public body.")).toBeInTheDocument();
    expect(screen.getByText("Backend supplied HTML body.")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByTestId("public-content-hero-media")).not.toBeInTheDocument();
    expect(screen.queryByTestId("authority-inline-media")).not.toBeInTheDocument();
    expect(document.body.textContent ?? "").not.toContain("WORKING_REVISION_MUST_NEVER_RENDER");
  });

  it("keeps limitations visible but hides incomplete sources when evidence eligibility is closed", async () => {
    const authority = v2Authority();
    const evidence = authority.visible_evidence as Record<string, unknown>;
    const asset = await fetchCore(
      v2Authority({ visible_evidence: { ...evidence, eligible: false }, schema_eligible: false })
    );
    expect(asset).not.toBeNull();

    render(PublicContentAssetRenderer({ asset: asset!, locale: "en" }));

    expect(screen.getByTestId("visible-authority-evidence")).toHaveTextContent(
      "Evidence does not establish a fixed identity or future result."
    );
    expect(screen.queryByText("Backend reviewed Enneagram source")).not.toBeInTheDocument();
  });

  it("enriches schema only when both visible evidence and backend schema gates are open", async () => {
    const asset = await fetchCore();
    expect(asset).not.toBeNull();
    const base = { "@context": "https://schema.org", "@type": "WebPage", name: asset!.title };

    expect(isEnneagramAuthoritySchemaEligible(asset!)).toBe(true);
    expect(withEnneagramVisibleAuthorityJsonLd(base, asset!)).toMatchObject({
      citation: ["https://example.org/enneagram-source"],
      datePublished: "2026-07-13T08:00:00.000Z",
      dateModified: "2026-07-14T09:00:00.000Z",
    });

    const closed = {
      ...asset!,
      authorityV2: asset!.authorityV2
        ? { ...asset!.authorityV2, schemaEligible: false }
        : null,
    };
    expect(isEnneagramAuthoritySchemaEligible(closed)).toBe(false);
    expect(withEnneagramVisibleAuthorityJsonLd(base, closed)).toBe(base);
  });

  it("requires exact backend canonical and reciprocal locale truth before metadata emission", () => {
    expect(
      hasBackendEnneagramMetadataAuthority("en", CORE_ENTRY, "/en/personality/enneagram/type-5", {
        en: "/en/personality/enneagram/type-5",
        "zh-CN": "/zh/personality/enneagram/type-5",
      })
    ).toBe(true);
    expect(
      hasBackendEnneagramMetadataAuthority("en", CORE_ENTRY, "/en/personality/enneagram/type-5", {
        en: "/en/personality/enneagram/type-5",
        "zh-CN": null,
      })
    ).toBe(false);
  });

  it("does not invent a missing backend canonical or emit schema from incomplete metadata authority", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          ok: true,
          personality_public_content_asset_v1: v1Asset({
            canonical_path: undefined,
            canonical: {},
          }),
          personality_public_content_asset_v2: v2Authority(),
        })
      )
    );

    const asset = await getEnneagramPublicContentAsset("en", CORE_ENTRY);

    expect(asset?.canonicalPath).toBe("");
    expect(
      hasBackendEnneagramMetadataAuthority("en", CORE_ENTRY, asset?.canonicalPath ?? "", asset!.hreflang)
    ).toBe(false);

    for (const route of [
      "app/(localized)/[locale]/personality/enneagram/page.tsx",
      "app/(localized)/[locale]/personality/enneagram/[...slug]/page.tsx",
    ]) {
      const source = fs.readFileSync(path.join(ROOT, route), "utf8");
      const schemaGate = source.slice(source.indexOf("const schemaEligible"), source.indexOf("const pageJsonLd"));
      expect(schemaGate).toContain("hasBackendEnneagramMetadataAuthority");
      expect(schemaGate).toContain("isEnneagramAuthoritySchemaEligible");
    }
  });

  it("keeps an authoritative empty API response as a noindex shell without invented alternates", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ ok: false, error_code: "NOT_FOUND" }, 404))
    );
    const route = await import("@/app/(localized)/[locale]/personality/enneagram/[...slug]/page");
    const metadata = await route.generateMetadata({
      params: Promise.resolve({ locale: "en", slug: ["type-8"] }),
    });

    expect(metadata.alternates).toBeUndefined();
    expect(metadata.openGraph).toBeNull();
    expect(metadata.twitter).toBeNull();
    expect(metadata.robots).toMatchObject({
      index: false,
      follow: true,
      googleBot: { index: false, follow: true },
    });
  });

  it("wires both route variants to fail-closed metadata and visible eligible schema only", () => {
    for (const route of [
      "app/(localized)/[locale]/personality/enneagram/page.tsx",
      "app/(localized)/[locale]/personality/enneagram/[...slug]/page.tsx",
    ]) {
      const source = fs.readFileSync(path.join(ROOT, route), "utf8");
      expect(source).toContain("hasBackendEnneagramMetadataAuthority");
      expect(source).toContain("isEnneagramAuthoritySchemaEligible");
      expect(source).toContain("withEnneagramVisibleAuthorityJsonLd");
      expect(source).toContain("visibleFaq.length > 0");
      expect(source).toContain("schemaEligible");
      expect(source).toContain("buildUnavailableMetadata");
      expect(source).toContain("openGraph: null");
      expect(source).toContain("twitter: null");
      expect(source).toContain("notFound()");
      expect(source).not.toContain("buildFallbackMetadata");
      expect(source).not.toContain("alternatePath");
      expect(source).not.toContain("working_revision");
      expect(source).not.toContain("imagePath:");
      expect(source).not.toContain("mediaAuthority");
      expect(source).not.toContain("asset.media");
    }
  });
});
