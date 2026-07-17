import fs from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PublicContentAssetRenderer } from "@/components/personality/PublicContentAssetRenderer";
import {
  getBigFivePublicContentAsset,
  withBigFiveVisibleAuthorityJsonLd,
} from "@/lib/cms/personality-public-content-assets";

const ROOT = process.cwd();
const ENTRY = {
  entityType: "domain" as const,
  code: "openness",
  routeSlug: "openness",
  pathSuffix: "/openness",
};

function jsonResponse(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function v1Asset() {
  return {
    contract_version: "personality_public_asset.v1",
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
    robots: "index,follow",
    canonical_path: "/en/personality/big-five/openness",
    hreflang: {
      en: "/en/personality/big-five/openness",
      "zh-CN": "/zh/personality/big-five/openness",
    },
    faq: [],
    media: {
      image_url: "https://assets.fermatmind.com/personality/big-five/v1.webp",
      alt: "V1 fallback image",
    },
    schema: { "@type": "WebPage" },
    schema_runtime_eligible: true,
    method_boundary: {
      summary: "This content is descriptive, not diagnostic.",
      not_for: ["clinical diagnosis", "employment screening"],
    },
    evidence_notes: [],
    internal_links: [],
    sections: [
      {
        key: "overview",
        title: "Overview",
        body_md:
          "Backend supplied body.\n\n![Legacy Markdown image](https://assets.fermatmind.com/personality/big-five/section.webp)",
      },
      {
        key: "html-overview",
        title: "HTML overview",
        body_html:
          '<p>Backend supplied HTML body.</p><img src="https://assets.fermatmind.com/personality/big-five/section-html.webp" alt="Legacy HTML image">',
      },
    ],
    is_public: true,
    index_eligible: true,
    sitemap_eligible: true,
    llms_eligible: true,
    launch_state: "published",
    review_state: "approved",
    last_reviewed_at: "2026-07-13T10:00:00Z",
    updated_at: "2026-07-13T09:00:00Z",
  };
}

function v2Authority(overrides: Record<string, unknown> = {}) {
  return {
    ...v1Asset(),
    contract_version: "personality_public_asset.v2",
    compatible_v1_contract_version: "personality_public_asset.v1",
    visible_evidence: {
      eligible: true,
      sources: [
        {
          id: "bfi2-2017",
          title: "The Big Five Inventory-2",
          author_or_organization: "Soto and John",
          year: 2017,
          source_type: "peer_reviewed_research",
          doi: "10.1037/pspp0000096",
          public_url: "https://doi.org/10.1037/pspp0000096",
          accessed_at: "2026-07-14",
          claim_ids: ["claim.big_five_dimensions"],
          limitation: "This source does not make an individual diagnosis.",
        },
        {
          id: "unsafe-source",
          title: "Unsafe URL guard fixture",
          author_or_organization: "Contract fixture",
          year: 2026,
          source_type: "other_public_source",
          public_url: "https://127.0.0.1/private",
          claim_ids: ["claim.guard"],
        },
      ],
      claim_mapping: [
        {
          claim_id: "claim.big_five_dimensions",
          source_ids: ["bfi2-2017"],
          limitation: "Descriptive, not deterministic.",
        },
      ],
      limitations: ["Evidence supports model framing, not individual outcome prediction."],
    },
    editorial_authority: {
      author: {
        name: "FermatMind Editorial Team",
        organization: "FermatMind",
        role: "Author",
      },
      reviewer: {
        name: "Named Reviewer",
        organization: "Independent Review",
        role: "Reviewer",
      },
      review_state: "approved",
      published_at: "2026-07-12T08:00:00Z",
      updated_at: "2026-07-13T09:00:00Z",
      last_reviewed_at: "2026-07-13T10:00:00Z",
    },
    media_authority: {
      hero: {
        media_asset_id: 101,
        url: "https://assets.fermatmind.com/personality/big-five/hero.webp",
        alt: "Five neutral markers representing the Big Five dimensions.",
      },
      inline: [
        {
          media_asset_id: 102,
          url: "https://assets.fermatmind.com/personality/big-five/inline.webp",
          alt: "Big Five evidence overview.",
        },
      ],
      og: {
        media_asset_id: 103,
        url: "https://assets.fermatmind.com/personality/big-five/og.webp",
        alt: "Big Five source overview card.",
      },
    },
    schema_eligible: true,
    ...overrides,
  };
}

async function fetchAsset(v2 = v2Authority()) {
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

  return getBigFivePublicContentAsset("en", ENTRY);
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("BIG5-AUTHORITY-V2-WEB-TRUST-RENDERER-04 contract", () => {
  it("normalizes the backward-compatible V2 authority sibling and fails unsafe external URLs closed", async () => {
    const asset = await fetchAsset();

    expect(asset?.authorityV2).toMatchObject({
      contractVersion: "personality_public_asset.v2",
      compatibleV1ContractVersion: "personality_public_asset.v1",
      visibleEvidence: {
        eligible: true,
        sources: [
          {
            id: "bfi2-2017",
            publicUrl: "https://doi.org/10.1037/pspp0000096",
            doi: "10.1037/pspp0000096",
          },
          { id: "unsafe-source", publicUrl: null },
        ],
      },
      editorialAuthority: {
        author: { name: "FermatMind Editorial Team" },
        reviewer: { name: "Named Reviewer" },
      },
      schemaEligible: true,
    });
    expect(asset).not.toHaveProperty("media");
    expect(asset?.authorityV2).not.toHaveProperty("mediaAuthority");
  });

  it("discards a mismatched V2 sibling while preserving the valid V1 page asset", async () => {
    const wrongIdentity = v2Authority({ code: "agreeableness" });
    const asset = await fetchAsset(wrongIdentity);

    expect(asset).toMatchObject({ code: "openness", title: "Openness" });
    expect(asset?.authorityV2).toBeNull();
  });

  it("renders backend authority and text while ignoring all legacy personality media", async () => {
    const asset = await fetchAsset();
    expect(asset).not.toBeNull();

    render(<PublicContentAssetRenderer asset={asset!} locale="en" />);

    expect(screen.getByTestId("editorial-authority")).toHaveTextContent("FermatMind Editorial Team");
    expect(screen.getByTestId("editorial-authority")).toHaveTextContent("Named Reviewer");
    expect(screen.getByTestId("editorial-authority")).toHaveTextContent("Jul 12, 2026");
    expect(screen.getByTestId("editorial-authority")).toHaveTextContent("Jul 13, 2026");
    expect(screen.getByTestId("visible-authority-evidence")).toHaveTextContent("The Big Five Inventory-2");
    expect(screen.getByTestId("visible-authority-evidence")).toHaveTextContent("Descriptive, not deterministic.");
    expect(screen.getByRole("link", { name: "The Big Five Inventory-2" })).toHaveAttribute(
      "rel",
      "noopener noreferrer"
    );
    expect(screen.queryByRole("link", { name: "Unsafe URL guard fixture" })).not.toBeInTheDocument();
    expect(screen.getByText("Backend supplied body.")).toBeInTheDocument();
    expect(screen.getByText("Backend supplied HTML body.")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByTestId("public-content-hero-media")).not.toBeInTheDocument();
    expect(screen.queryByTestId("authority-inline-media")).not.toBeInTheDocument();
    expect(screen.getByTestId("method-boundary")).toHaveTextContent("not diagnostic");
  });

  it("does not infer an author or reviewer when the backend omits actors and dates", async () => {
    const asset = await fetchAsset(
      v2Authority({
        editorial_authority: {
          author: null,
          reviewer: null,
          review_state: "draft",
          published_at: null,
          updated_at: null,
          last_reviewed_at: null,
        },
      })
    );
    expect(asset).not.toBeNull();

    render(<PublicContentAssetRenderer asset={asset!} locale="en" />);

    expect(screen.queryByTestId("editorial-authority")).not.toBeInTheDocument();
    expect(screen.queryByText("FermatMind Editorial Team")).not.toBeInTheDocument();
    expect(screen.queryByText("Named Reviewer")).not.toBeInTheDocument();
  });

  it("enriches existing page schema only behind both backend gates and never emits trust-inflating schema", async () => {
    const asset = await fetchAsset();
    expect(asset).not.toBeNull();

    const base = { "@context": "https://schema.org", "@type": "WebPage", name: "Openness" };
    const enriched = withBigFiveVisibleAuthorityJsonLd(base, asset!);
    expect(enriched).toMatchObject({
      "@type": "WebPage",
      citation: ["https://doi.org/10.1037/pspp0000096"],
      datePublished: "2026-07-12T08:00:00.000Z",
      dateModified: "2026-07-13T09:00:00.000Z",
    });
    const serialized = JSON.stringify(enriched);
    for (const forbidden of ["Person", "Review", "AggregateRating", "Medical", "expert", "rating"]) {
      expect(serialized).not.toContain(forbidden);
    }

    const gateClosed = {
      ...asset!,
      authorityV2: asset!.authorityV2
        ? { ...asset!.authorityV2, schemaEligible: false }
        : null,
    };
    expect(withBigFiveVisibleAuthorityJsonLd(base, gateClosed)).toBe(base);
  });

  it("wires authority schema enrichment into both Big Five public route variants", () => {
    for (const route of [
      "app/(localized)/[locale]/personality/big-five/page.tsx",
      "app/(localized)/[locale]/personality/big-five/[...slug]/page.tsx",
    ]) {
      const source = fs.readFileSync(path.join(ROOT, route), "utf8");
      expect(source).toContain("withBigFiveVisibleAuthorityJsonLd");
      expect(source).not.toContain('"@type": "Person"');
      expect(source).not.toContain('"@type": "Review"');
      expect(source).not.toContain("AggregateRating");
      expect(source).not.toContain("imagePath:");
      expect(source).not.toContain("mediaAuthority");
      expect(source).not.toContain("asset.media");
    }
  });
});
