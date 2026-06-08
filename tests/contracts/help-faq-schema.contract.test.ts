import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ContentPage } from "@/lib/cms/content-pages";

const faqMarkdown = `## Frequently asked questions

### How do I get my report after payment?

Open Order lookup with your order number and purchase email.

### Can I request a refund?

Refund requests are handled according to our Refund Policy.`;

const mixedMarkdown = `## Before you contact support

### This visible heading is not a FAQ item

Use the formal recovery paths first.

## Frequently asked questions

### How do I get my report after payment?

Open Order lookup with your order number and purchase email.`;

const faqItems = [
  {
    question: "How do I get my report after payment?",
    answer: "Open Order lookup with your order number and purchase email.",
  },
  {
    question: "Can I request a refund?",
    answer: "Refund requests are handled according to our Refund Policy.",
  },
];

function makeContentPage(overrides: Partial<ContentPage> = {}): ContentPage {
  return {
    slug: "help-faq",
    path: "/help/faq",
    kind: "help",
    title: "Frequently Asked Questions",
    kicker: "Help Center",
    summary: "Visible support FAQ.",
    template: "help",
    animationProfile: "editorial",
    locale: "en",
    publishedAt: "2026-04-01T00:00:00Z",
    updatedAt: "2026-04-02T00:00:00Z",
    effectiveAt: null,
    sourceDoc: null,
    isPublic: true,
    isIndexable: true,
    headings: ["Frequently asked questions"],
    contentMd: faqMarkdown,
    contentHtml: "",
    seoTitle: null,
    metaDescription: null,
    faqItems,
    schemaEnabled: true,
    supportContact: null,
    ...overrides,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

async function renderHelpPage(slug: string, page: ContentPage) {
  vi.doMock("next/link", () => ({
    default: ({ href, children, ...props }: { href: string; children: ReactNode }) =>
      createElement("a", { href, ...props }, children),
  }));
  vi.doMock("@/lib/cms/content-pages", async () => {
    const actual = await vi.importActual<typeof import("@/lib/cms/content-pages")>("@/lib/cms/content-pages");

    return {
      ...actual,
      getContentPage: vi.fn(async () => page),
    };
  });

  const { default: HelpDetailPage } = await import("@/app/(localized)/[locale]/help/[slug]/page");
  const node = await HelpDetailPage({
    params: Promise.resolve({ locale: page.locale, slug }),
  });

  return renderToStaticMarkup(node as ReactNode);
}

describe("help FAQ JSON-LD semantic baseline", () => {
  it("emits FAQPage JSON-LD for help FAQ from CMS faq_items when the same questions are visible", async () => {
    const html = await renderHelpPage("faq", makeContentPage());

    expect(html).toContain('id="help-faq-help-faq"');
    expect(html).toContain('"@type":"FAQPage"');
    expect(html).toContain('"name":"How do I get my report after payment?"');
    expect(html).toContain('"text":"Open Order lookup with your order number and purchase email."');
    expect(html).toContain('"name":"Can I request a refund?"');
    expect(html).toContain('"text":"Refund requests are handled according to our Refund Policy."');
    expect(html).toContain("How do I get my report after payment?");
    expect(html).toContain("Open Order lookup with your order number and purchase email.");
    expect(html).toContain("Can I request a refund?");
    expect(html).toContain("Refund requests are handled according to our Refund Policy.");
  });

  it("filters CMS faq_items that are not present in the rendered page body", async () => {
    const html = await renderHelpPage(
      "faq",
      makeContentPage({
        contentMd: mixedMarkdown,
        faqItems: [
          faqItems[0]!,
          {
            question: "This visible heading is not a FAQ item",
            answer: "This answer is not visible in the page body.",
          },
        ],
      })
    );

    expect(html).toContain("This visible heading is not a FAQ item");
    expect(html).toContain('"@type":"FAQPage"');
    expect(html).toContain('"name":"How do I get my report after payment?"');
    expect(html).not.toContain('"name":"This visible heading is not a FAQ item"');
  });

  it("keeps WebPage and BreadcrumbList JSON-LD on help FAQ", async () => {
    const html = await renderHelpPage("faq", makeContentPage());

    expect(html).toContain('id="help-webpage-help-faq"');
    expect(html).toContain('"@type":"WebPage"');
    expect(html).toContain('id="help-breadcrumb-help-faq"');
    expect(html).toContain('"@type":"BreadcrumbList"');
  });

  it("can emit FAQPage from CMS faq_items for HTML-only content when visible parity holds", async () => {
    const html = await renderHelpPage(
      "faq",
      makeContentPage({
        contentMd: "",
        contentHtml:
          "<h2>Before you contact support</h2><h3>This visible heading is not a FAQ item</h3><p>Use formal recovery paths first.</p><h2>Frequently asked questions</h2><h3>How do I recover an order?</h3><p>Use Order lookup.</p><h2>Contact support</h2><p>This visible section is not part of the FAQ answer.</p>",
        faqItems: [
          {
            question: "How do I recover an order?",
            answer: "Use Order lookup.",
          },
        ],
      })
    );

    expect(html).toContain('"@type":"FAQPage"');
    expect(html).toContain('id="help-faq-help-faq"');
    expect(html).toContain("This visible heading is not a FAQ item");
    expect(html).toContain("How do I recover an order?");
    expect(html).toContain("Use Order lookup.");
    expect(html).toContain("This visible section is not part of the FAQ answer.");
  });

  it("does not emit FAQPage JSON-LD when CMS schema_enabled is false", async () => {
    const html = await renderHelpPage(
      "faq",
      makeContentPage({
        schemaEnabled: false,
      })
    );

    expect(html).not.toContain('"@type":"FAQPage"');
    expect(html).not.toContain('id="help-faq-help-faq"');
  });
});
