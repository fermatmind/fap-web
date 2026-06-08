import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SanitizedCmsHtml } from "@/components/content/SanitizedCmsHtml";
import { ContentPageTemplate } from "@/components/content-pages/ContentPageTemplate";
import { SupportTrustDetailTemplate } from "@/components/support/SupportTrustDetailTemplate";
import { sanitizeCmsHtml } from "@/lib/cms/sanitizeCmsRichText";
import { renderPersonalitySections } from "@/lib/cms/personality-sections";
import { renderTopicSections } from "@/lib/cms/topic-sections";
import { renderSimpleMarkdown } from "@/lib/content/renderSimpleMarkdown";
import type { ContentPage } from "@/lib/cms/content-pages";

const ROOT = process.cwd();

const CMS_RICH_HTML = [
  '<h2 id="safe-heading">Safe heading</h2>',
  '<p onclick="run()">Copy <strong>bold</strong> <em>emphasis</em></p>',
  '<a href="javascript:run()" onmouseover="run()">unsafe link</a>',
  '<a href="/en/help?topic=reports&amp;src=cms" target="_blank">safe link</a>',
  '<img src="/media/support.png" alt="Support image" onerror="run()">',
  "<script>run()</script>",
  "<style>body{display:none}</style>",
  '<iframe src="https://example.com"></iframe>',
  '<object data="/unsafe.swf"></object>',
  '<embed src="/unsafe.swf">',
].join("");

function expectNoExecutableCmsHtml(html: string) {
  expect(html).not.toMatch(/<script\b/i);
  expect(html).not.toMatch(/<style\b/i);
  expect(html).not.toMatch(/<iframe\b/i);
  expect(html).not.toMatch(/<object\b/i);
  expect(html).not.toMatch(/<embed\b/i);
  expect(html).not.toMatch(/\son[a-z]+\s*=/i);
  expect(html).not.toMatch(/javascript:/i);
}

function makeContentPage(contentHtml: string): ContentPage {
  return {
    slug: "help-faq",
    path: "/help/faq",
    kind: "help",
    title: "FAQ",
    kicker: "Help",
    summary: "Support answers.",
    template: "help",
    animationProfile: "none",
    locale: "en",
    publishedAt: null,
    updatedAt: null,
    effectiveAt: null,
    sourceDoc: null,
    isPublic: true,
    isIndexable: true,
    headings: [],
    contentMd: "",
    contentHtml,
    seoTitle: null,
    metaDescription: null,
    faqItems: [],
    schemaEnabled: false,
    supportContact: null,
  };
}

function readSource(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("CMS rich content sanitization contract", () => {
  it("strips dangerous tags and attributes while preserving safe formatting", () => {
    const sanitized = sanitizeCmsHtml(CMS_RICH_HTML);

    expect(sanitized).toContain('<h2 id="safe-heading">Safe heading</h2>');
    expect(sanitized).toContain("<strong>bold</strong>");
    expect(sanitized).toContain("<em>emphasis</em>");
    expect(sanitized).toContain('href="/en/help?topic=reports&amp;src=cms"');
    expect(sanitized).toContain('rel="noopener noreferrer"');
    expect(sanitized).toContain('src="/media/support.png"');
    expectNoExecutableCmsHtml(sanitized);
  });

  it("uses sanitized HTML for representative article and career-guide payloads", () => {
    const articleHtml = renderToStaticMarkup(
      <SanitizedCmsHtml className="article-body" html={CMS_RICH_HTML} />
    );
    const careerGuideHtml = renderToStaticMarkup(
      <SanitizedCmsHtml className="career-guide-body" html={CMS_RICH_HTML} />
    );

    expect(articleHtml).toContain("article-body");
    expect(articleHtml).toContain("Safe heading");
    expect(articleHtml).toContain("<strong>bold</strong>");
    expectNoExecutableCmsHtml(articleHtml);
    expect(careerGuideHtml).toContain("career-guide-body");
    expect(careerGuideHtml).toContain("safe link");
    expectNoExecutableCmsHtml(careerGuideHtml);
  });

  it("wires every current CMS HTML sink through the sanitized renderer", () => {
    const sinkFiles = [
      "app/(localized)/[locale]/articles/[slug]/page.tsx",
      "app/(localized)/[locale]/career/guides/[slug]/page.tsx",
      "components/content-pages/ContentPageTemplate.tsx",
      "components/support/SupportTrustDetailTemplate.tsx",
      "lib/cms/topic-sections.tsx",
      "lib/cms/personality-sections.tsx",
    ];

    for (const relPath of sinkFiles) {
      const source = readSource(relPath);
      expect(source).toMatch(/SanitizedCmsHtml|AttributedSanitizedCmsHtml/);
      expect(source).not.toContain("dangerouslySetInnerHTML");
    }
  });

  it("uses sanitized HTML for support, content page, topic, and personality CMS sinks", () => {
    const contentPageHtml = renderToStaticMarkup(
      <ContentPageTemplate page={makeContentPage(CMS_RICH_HTML)} locale="en" />
    );
    const supportHtml = renderToStaticMarkup(
      <SupportTrustDetailTemplate
        locale="en"
        eyebrow="Support"
        title="Support article"
        summary="Support summary."
        bodyMd=""
        bodyHtml={CMS_RICH_HTML}
        publishedAt={null}
        updatedAt={null}
        backHref="/en/support"
        backLabel="Back"
        testId="support-article"
      />
    );
    const topicHtml = renderToStaticMarkup(
      <>
        {renderTopicSections(
          [
            {
              sectionKey: "overview",
              title: "Overview",
              renderVariant: "rich_text",
              bodyMd: "",
              bodyHtml: CMS_RICH_HTML,
              payloadJson: null,
              sortOrder: 10,
              isEnabled: true,
            },
          ],
          "en"
        )}
      </>
    );
    const personalityHtml = renderToStaticMarkup(
      <>
        {renderPersonalitySections(
          [
            {
              sectionKey: "core_snapshot",
              title: "Core snapshot",
              renderVariant: "rich_text",
              bodyMd: "",
              bodyHtml: CMS_RICH_HTML,
              payloadJson: null,
              sortOrder: 10,
              isEnabled: true,
            },
          ],
          "en"
        )}
      </>
    );

    for (const html of [contentPageHtml, supportHtml, topicHtml, personalityHtml]) {
      expect(html).toContain("Safe heading");
      expect(html).toContain("<strong>bold</strong>");
      expectNoExecutableCmsHtml(html);
    }
  });

  it("neutralizes unsafe Markdown link URLs while preserving text", () => {
    const node = renderSimpleMarkdown(
      "[unsafe link](javascript:run()) and [safe link](/en/help?topic=reports&src=cms)"
    );
    const html = renderToStaticMarkup(<div>{node as Parameters<typeof renderToStaticMarkup>[0]}</div>);

    expect(html).toContain("unsafe link");
    expect(html).toContain('href="/en/help?topic=reports&amp;src=cms"');
    expectNoExecutableCmsHtml(html);
  });
});
