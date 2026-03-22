import fs from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  buildTopicFrontendUrl,
  getTopicBySlug,
  mapFrontendLocaleToTopicsApiLocale,
  normalizeTopicProfileDetail,
  normalizeTopicSeoPayload,
  normalizeTopicSlug,
} from "@/lib/cms/topics";
import type { CmsTopicEntryGroups } from "@/lib/cms/topics";
import {
  extractTopicFaqItems,
  getRenderableTopicEntryGroups,
  getRenderableTopicSections,
  renderTopicEntryGroups,
  renderTopicSections,
} from "@/lib/cms/topic-sections";
import { shouldIncludeInSitemap } from "@/lib/seo/indexingPolicy";

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("topics cms helpers", () => {
  it("maps frontend locale and topic links correctly", () => {
    expect(mapFrontendLocaleToTopicsApiLocale("en")).toBe("en");
    expect(mapFrontendLocaleToTopicsApiLocale("zh")).toBe("zh-CN");
    expect(normalizeTopicSlug(" MBTI ")).toBe("mbti");
    expect(buildTopicFrontendUrl("en", " MBTI ")).toBe("/en/topics/mbti");
    expect(buildTopicFrontendUrl("zh", "MBTI")).toBe("/zh/topics/mbti");
  });

  it("normalizes detail payloads from the backend contract", () => {
    const topic = normalizeTopicProfileDetail(
      {
        id: 1,
        org_id: 0,
        topic_code: "MBTI",
        slug: "mbti",
        locale: "en",
        title: "MBTI Guide and Type Hub",
        subtitle: "A structured intro",
        excerpt: "Explore MBTI concepts, type profiles, guides, and tests.",
        hero_kicker: "Topic hub",
        hero_quote: "Start from the core ideas, then go deeper.",
        status: "published",
        is_public: true,
        is_indexable: true,
      },
      [
        {
          section_key: "overview",
          title: "Overview",
          render_variant: "rich_text",
          body_md: "Overview body",
          is_enabled: true,
        },
      ],
      {
        articles: [
          {
            entry_type: "article",
            group_key: "articles",
            target_key: "how-to-read-mbti-results",
            title: "How to read MBTI results",
            excerpt: "A practical guide.",
            url: "/en/articles/how-to-read-mbti-results",
            badge_label: "Article",
            cta_label: "Read",
          },
        ],
      },
      null
    );

    expect(topic.topicCode).toBe("mbti");
    expect(topic.slug).toBe("mbti");
    expect(topic.sections).toHaveLength(1);
    expect(topic.sections[0]?.sectionKey).toBe("overview");
    expect(topic.entryGroups.articles?.[0]?.url).toBe("/en/articles/how-to-read-mbti-results");
    expect(topic.landingSurface).toBeNull();
  });

  it("normalizes backend landing surface for topic detail", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            ok: true,
            profile: {
              topic_code: "MBTI",
              slug: "mbti",
              locale: "en",
              title: "MBTI Guide and Type Hub",
              status: "published",
              is_public: true,
              is_indexable: true,
            },
            sections: [],
            entry_groups: {},
            seo_meta: null,
            landing_surface_v1: {
              landing_contract_version: "landing.surface.v1",
              landing_scope: "public_indexable_detail",
              entry_surface: "topic_detail",
              entry_type: "topic_profile",
              cta_bundle: [
                { key: "start_test", label: "Start test", href: "/en/tests/mbti-personality-test-16-personality-types" },
              ],
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      )
    );

    const topic = await getTopicBySlug("mbti", "en");

    expect(topic?.landingSurface?.entrySurface).toBe("topic_detail");
    expect(topic?.landingSurface?.ctaBundle[0]?.label).toBe("Start test");
  });

  it("ignores unknown sections and entry groups safely", () => {
    const sections = getRenderableTopicSections([
      {
        sectionKey: "overview",
        title: "Overview",
        renderVariant: "rich_text",
        bodyMd: "Overview body",
        bodyHtml: "",
        payloadJson: null,
        sortOrder: 10,
        isEnabled: true,
      },
      {
        sectionKey: "mystery_section",
        title: "Mystery",
        renderVariant: "rich_text",
        bodyMd: "Ignored",
        bodyHtml: "",
        payloadJson: null,
        sortOrder: 20,
        isEnabled: true,
      },
    ]);

    const groups = getRenderableTopicEntryGroups({
      articles: [
        {
          entryType: "article",
          groupKey: "articles",
          targetKey: "article-a",
          title: "Article A",
          excerpt: "Summary",
          url: "/en/articles/article-a",
          badgeLabel: "Article",
          ctaLabel: "Read",
          imageUrl: null,
          isFeatured: false,
        },
      ],
      mystery: [
        {
          entryType: "custom_link",
          groupKey: "mystery",
          targetKey: "mystery",
          title: "Mystery",
          excerpt: "Ignored",
          url: "/en/mystery",
          badgeLabel: "Link",
          ctaLabel: "Open",
          imageUrl: null,
          isFeatured: false,
        },
      ],
    } as unknown as CmsTopicEntryGroups);

    expect(sections).toHaveLength(1);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.groupKey).toBe("articles");
  });

  it("normalizes canonical and keeps CollectionPage jsonld intact", () => {
    const topic = normalizeTopicProfileDetail(
      {
        id: 1,
        org_id: 0,
        topic_code: "MBTI",
        slug: "mbti",
        locale: "en",
        title: "MBTI Guide and Type Hub",
        excerpt: "Explore MBTI concepts, type profiles, guides, and tests.",
        status: "published",
        is_public: true,
        is_indexable: true,
      },
      [],
      {},
      null
    );

    const seo = normalizeTopicSeoPayload(
      {
        meta: {
          title: "MBTI Guide and Type Hub | FermatMind",
          description: "Explore MBTI concepts, type profiles, guides, and tests.",
          canonical: "https://localhost:3000/en/topics/mbti",
          alternates: {
            en: "https://localhost:3000/en/topics/mbti",
            "zh-CN": "https://localhost:3000/zh/topics/mbti",
          },
          og: {
            title: "MBTI Guide and Type Hub | FermatMind",
            description: "Explore MBTI concepts, type profiles, guides, and tests.",
            image: null,
            type: "article",
          },
          twitter: {
            card: "summary_large_image",
            title: "MBTI Guide and Type Hub | FermatMind",
            description: "Explore MBTI concepts, type profiles, guides, and tests.",
            image: null,
          },
          robots: "index,follow",
        },
        jsonld: {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          mainEntityOfPage: "https://localhost:3000/en/topics/mbti",
        },
      },
      topic,
      "zh"
    );

    expect(seo.meta.canonical).toBe("http://localhost:3000/zh/topics/mbti");
    expect(seo.meta.alternates.en).toBe("http://localhost:3000/en/topics/mbti");
    expect(seo.meta.alternates["zh-CN"]).toBe("http://localhost:3000/zh/topics/mbti");
    expect(seo.surface).toBeNull();
    const jsonld = seo.jsonld as { "@type"?: string; mainEntityOfPage?: string };

    expect(jsonld["@type"]).toBe("CollectionPage");
    expect(jsonld.mainEntityOfPage).toBe(
      "http://localhost:3000/zh/topics/mbti"
    );
  });

  it("renders known sections and known entry groups", () => {
    render(
      <>
        {renderTopicSections(
          [
            {
              sectionKey: "overview",
              title: "Overview",
              renderVariant: "rich_text",
              bodyMd: "Overview body",
              bodyHtml: "",
              payloadJson: null,
              sortOrder: 10,
              isEnabled: true,
            },
          ],
          "en"
        )}
        {renderTopicEntryGroups(
          {
            related: [
              {
                entryType: "custom_link",
                groupKey: "related",
                targetKey: "docs",
                title: "MBTI methodology",
                excerpt: "Read the methodology behind the MBTI topic hub.",
                url: "/en/about/methodology",
                badgeLabel: "Link",
                ctaLabel: "Open",
                imageUrl: null,
                isFeatured: false,
              },
            ],
          },
          "en"
        )}
      </>
    );

    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Related links")).toBeInTheDocument();
    expect(screen.getByText("MBTI methodology")).toBeInTheDocument();
  });

  it("extracts faq items from topic faq sections for FAQ schema parity", () => {
    const items = extractTopicFaqItems([
      {
        sectionKey: "faq",
        title: "FAQ",
        renderVariant: "faq",
        bodyMd: "",
        bodyHtml: "",
        payloadJson: {
          items: [
            {
              q: "Is MBTI a diagnosis?",
              a: "No. It is a preference model, not a clinical diagnosis.",
            },
          ],
        },
        sortOrder: 10,
        isEnabled: true,
      },
    ]);

    expect(items).toEqual([
      {
        question: "Is MBTI a diagnosis?",
        answer: "No. It is a preference model, not a clinical diagnosis.",
      },
    ]);
  });

  it("topic detail page wires breadcrumb, canonical cluster, faq schema, and remains indexable", () => {
    const source = read("app/(localized)/[locale]/topics/[slug]/page.tsx");

    expect(source).toContain("buildWebPageJsonLd");
    expect(source).toContain("buildBreadcrumbJsonLd");
    expect(source).toContain("buildFAQPageJsonLd");
    expect(source).toContain("alternatesByLocale");
    expect(source).toContain("seoSurface: normalizedSeo.surface");
    expect(source).toContain("topic-detail-landing-summary");
    expect(source).toContain("landingSurface?.ctaBundle");
    expect(read("app/(localized)/[locale]/topics/page.tsx")).toContain("topics-index-landing-cta");
    expect(shouldIncludeInSitemap("/en/topics/mbti")).toBe(true);
    expect(shouldIncludeInSitemap("/zh/topics/mbti")).toBe(true);
  });
});
