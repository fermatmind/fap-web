import Link from "next/link";
import type { ReactNode } from "react";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { SanitizedCmsHtml } from "@/components/content/SanitizedCmsHtml";
import { Container } from "@/components/layout/Container";
import { renderCmsInlineMarkdown, stripMarkdownEmphasisMarkers } from "@/lib/content/markdownInline";
import { cn } from "@/lib/utils";
import type { ContentPage } from "@/lib/cms/content-pages";
import { buildContentPagePath } from "@/lib/cms/content-pages";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";

type MarkdownBlock =
  | { type: "heading"; level: 2 | 3; text: string; id: string }
  | { type: "paragraph"; text: string }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] };

type RelatedLink = {
  key: string;
  label: string;
  href: string;
};

export type ContentPageReaderView = Omit<ContentPage, "sourceDoc">;

export function stripContentPageReaderMetadata(page: ContentPage): ContentPageReaderView {
  return {
    slug: page.slug,
    path: page.path,
    kind: page.kind,
    title: page.title,
    kicker: page.kicker,
    summary: page.summary,
    template: page.template,
    animationProfile: page.animationProfile,
    locale: page.locale,
    publishedAt: page.publishedAt,
    updatedAt: page.updatedAt,
    effectiveAt: page.effectiveAt,
    isPublic: page.isPublic,
    isIndexable: page.isIndexable,
    headings: page.headings,
    contentMd: page.contentMd,
    contentHtml: page.contentHtml,
    seoTitle: page.seoTitle,
    metaDescription: page.metaDescription,
    faqItems: page.faqItems,
    schemaEnabled: page.schemaEnabled,
    supportContact: page.supportContact,
  };
}

function formatDate(value: string | null, locale: Locale): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function slugifyHeading(text: string, index: number): string {
  const normalized = text
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  return normalized ? `${normalized}-${index}` : `section-${index}`;
}

function parseMarkdown(markdown: string): MarkdownBlock[] {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];
  let index = 0;
  let headingIndex = 0;

  while (index < lines.length) {
    const line = lines[index] ?? "";

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{2,3})\s+(.+)$/);
    if (heading) {
      headingIndex += 1;
      const text = String(heading[2] ?? "").trim();
      blocks.push({
        type: "heading",
        level: heading[1].length as 2 | 3,
        text,
        id: slugifyHeading(text, headingIndex),
      });
      index += 1;
      continue;
    }

    if (/^\s*[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*[-*+]\s+/.test(lines[index] ?? "")) {
        items.push((lines[index] ?? "").replace(/^\s*[-*+]\s+/, "").trim());
        index += 1;
        while (index < lines.length && !(lines[index] ?? "").trim()) {
          index += 1;
        }
      }
      blocks.push({ type: "unordered-list", items });
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index] ?? "")) {
        items.push((lines[index] ?? "").replace(/^\s*\d+\.\s+/, "").trim());
        index += 1;
        while (index < lines.length && !(lines[index] ?? "").trim()) {
          index += 1;
        }
      }
      blocks.push({ type: "ordered-list", items });
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length) {
      const current = lines[index] ?? "";
      if (
        !current.trim() ||
        /^(#{2,3})\s+/.test(current) ||
        /^\s*[-*+]\s+/.test(current) ||
        /^\s*\d+\.\s+/.test(current)
      ) {
        break;
      }
      paragraphLines.push(current.trim());
      index += 1;
    }

    const text = paragraphLines.join(" ").trim();
    if (text) {
      blocks.push({ type: "paragraph", text });
    }
  }

  return blocks;
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return renderCmsInlineMarkdown(text, keyPrefix);
}

function plainInlineText(text: string): string {
  return stripMarkdownEmphasisMarkers(text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"));
}

function ContentPageBody({ page, blocks }: { page: ContentPageReaderView; blocks: MarkdownBlock[] }) {
  if (page.contentHtml.trim()) {
    return <SanitizedCmsHtml className="fm-content-page-prose" html={page.contentHtml} />;
  }

  return (
    <div className="space-y-6" data-animation-profile={page.animationProfile}>
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const Heading = block.level === 2 ? "h2" : "h3";
          return (
            <Heading
              key={`${block.id}-${index}`}
              id={block.id}
              className={cn(
                "scroll-mt-28 font-serif font-semibold text-[var(--fm-text)]",
                block.level === 2 ? "pt-7 text-2xl md:text-3xl" : "pt-3 text-xl md:text-2xl"
              )}
            >
              {renderInline(block.text, `heading-${index}`)}
            </Heading>
          );
        }

        if (block.type === "paragraph") {
          return (
            <p key={`paragraph-${index}`} className="m-0 text-base leading-8 text-[var(--fm-text-muted)]">
              {renderInline(block.text, `paragraph-${index}`)}
            </p>
          );
        }

        if (block.type === "unordered-list") {
          return (
            <ul key={`ul-${index}`} className="m-0 list-disc space-y-2 pl-5 text-base leading-8 text-[var(--fm-text-muted)]">
              {block.items.map((item, itemIndex) => (
                <li key={`ul-${index}-${itemIndex}`}>{renderInline(item, `ul-${index}-${itemIndex}`)}</li>
              ))}
            </ul>
          );
        }

        return (
          <ol key={`ol-${index}`} className="m-0 list-decimal space-y-2 pl-5 text-base leading-8 text-[var(--fm-text-muted)]">
            {block.items.map((item, itemIndex) => (
              <li key={`ol-${index}-${itemIndex}`}>{renderInline(item, `ol-${index}-${itemIndex}`)}</li>
            ))}
          </ol>
        );
      })}
    </div>
  );
}

function buildToc(blocks: MarkdownBlock[]) {
  return blocks
    .filter((block): block is Extract<MarkdownBlock, { type: "heading" }> => block.type === "heading")
    .filter((block) => block.level === 2);
}

function buildCareersJobLinks(page: ContentPageReaderView, blocks: MarkdownBlock[]): RelatedLink[] {
  if (page.slug !== "careers" && page.template !== "careers") {
    return [];
  }

  return blocks
    .filter((block): block is Extract<MarkdownBlock, { type: "heading" }> => block.type === "heading")
    .filter((block) => block.level === 3 && /^\d+\.\s+/.test(block.text))
    .slice(0, 3)
    .map((block) => ({
      key: `career-job-${block.id}`,
      label: plainInlineText(block.text.replace(/^\d+\.\s+/, "")),
      href: `#${block.id}`,
    }));
}

function buildRelatedLinks(page: ContentPageReaderView, locale: Locale, blocks: MarkdownBlock[]): RelatedLink[] {
  const careersJobLinks = buildCareersJobLinks(page, blocks);
  if (careersJobLinks.length) {
    return careersJobLinks;
  }

  if (page.kind === "help") {
    const helpLinks = [
      { slug: "help-faq", label: locale === "zh" ? "常见问题" : "FAQ" },
      { slug: "help-contact", label: locale === "zh" ? "联系方式" : "Contact" },
    ];

    return helpLinks.filter((item) => item.slug !== page.slug).map((item) => ({
      key: item.slug,
      label: item.label,
      href: buildContentPagePath(item.slug, locale),
    }));
  }

  const companyLinks = [
    { slug: "about", label: locale === "zh" ? "关于我们" : "About" },
    { slug: "charter", label: locale === "zh" ? "我们的宪章" : "Charter" },
    { slug: "foundation", label: locale === "zh" ? "基金会" : "Foundation" },
    { slug: "careers", label: locale === "zh" ? "工作机会" : "Careers" },
    { slug: "brand", label: locale === "zh" ? "品牌" : "Brand" },
  ];
  const policyLinks = [
    { slug: "terms", label: locale === "zh" ? "使用条款" : "Terms of use" },
    { slug: "privacy", label: locale === "zh" ? "隐私政策" : "Privacy policy" },
    { slug: "policies", label: locale === "zh" ? "其他政策" : "Other policies" },
  ];
  const source = page.kind === "policy" ? policyLinks : companyLinks;
  return source.filter((item) => item.slug !== page.slug).map((item) => ({
    key: item.slug,
    label: item.label,
    href: buildContentPagePath(item.slug, locale),
  }));
}

function SupportContactCard({ page, locale }: { page: ContentPageReaderView; locale: Locale }) {
  if (page.kind !== "help" || !page.supportContact) {
    return null;
  }

  return (
    <div className="space-y-3 border-t border-[var(--fm-border)] pt-5" data-testid="help-support-contact">
      <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-text-muted)]">
        {locale === "zh" ? "联系支持" : "Contact support"}
      </p>
      <a
        href={`mailto:${page.supportContact}`}
        className="break-all text-sm font-medium text-[var(--fm-text)] hover:text-[var(--fm-accent)]"
      >
        {page.supportContact}
      </a>
    </div>
  );
}

export function ContentPageTemplate({ page, locale }: { page: ContentPageReaderView; locale: Locale }) {
  const markdownBlocks = parseMarkdown(page.contentMd);
  const toc = buildToc(markdownBlocks);
  const relatedLinks = buildRelatedLinks(page, locale, markdownBlocks);
  const updatedAt = formatDate(page.updatedAt, locale);
  const effectiveAt = formatDate(page.effectiveAt, locale);
  const isPolicy = page.kind === "policy";
  const isHelp = page.kind === "help";
  const showHeroSummary = page.slug !== "help-contact";
  const showMetadataCard = Boolean(updatedAt || effectiveAt);

  return (
    <main className="fm-page-background text-[var(--fm-text)]" data-testid={`content-page-${page.slug}`}>
      <Container className="py-10 md:py-14">
        <Breadcrumb
          items={[
            { label: locale === "zh" ? "首页" : "Home", href: localizedPath("/", locale) },
            {
              label: isHelp
                ? locale === "zh"
                  ? "帮助中心"
                  : "Help Center"
                : isPolicy
                  ? locale === "zh"
                    ? "条款与政策"
                    : "Terms & policies"
                  : locale === "zh"
                    ? "公司"
                    : "Company",
              href: isHelp ? localizedPath("/help", locale) : undefined,
            },
            { label: page.title },
          ]}
        />

        <section className="grid gap-8 border-b border-[var(--fm-border)] py-12 md:grid-cols-[minmax(0,1fr)_18rem] md:py-16">
          <div className="max-w-3xl space-y-6">
            <h1 className="m-0 max-w-4xl font-serif text-4xl font-semibold leading-tight md:text-6xl">
              {page.title}
            </h1>
            {showHeroSummary ? (
              <p className="m-0 max-w-3xl text-lg leading-8 text-[var(--fm-text-muted)] md:text-xl md:leading-9">
                {page.summary}
              </p>
            ) : null}
          </div>

          {showMetadataCard ? (
            <dl className="m-0 grid h-fit gap-4 rounded-lg border border-[var(--fm-border)] bg-[var(--fm-surface)] p-4 text-sm">
              {updatedAt ? (
                <div>
                  <dt className="text-[var(--fm-text-muted)]">{locale === "zh" ? "最近更新" : "Updated"}</dt>
                  <dd className="m-0 font-medium text-[var(--fm-text)]">{updatedAt}</dd>
                </div>
              ) : null}
              {effectiveAt ? (
                <div>
                  <dt className="text-[var(--fm-text-muted)]">{locale === "zh" ? "生效日期" : "Effective"}</dt>
                  <dd className="m-0 font-medium text-[var(--fm-text)]">{effectiveAt}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}
        </section>

        <div className="grid gap-10 py-12 md:grid-cols-[minmax(0,1fr)_18rem] md:py-16">
          <article className="max-w-3xl">
            <ContentPageBody page={page} blocks={markdownBlocks} />
          </article>

          <aside className="h-fit space-y-6 md:sticky md:top-24">
            {toc.length ? (
              <nav aria-label={locale === "zh" ? "页面目录" : "Page contents"} className="space-y-3">
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-text-muted)]">
                  {locale === "zh" ? "目录" : "Contents"}
                </p>
                <div className="grid gap-2 border-l border-[var(--fm-border)] pl-4">
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="text-sm leading-6 text-[var(--fm-text-muted)] hover:text-[var(--fm-accent)]"
                    >
                      {renderInline(item.text, `toc-${item.id}`)}
                    </a>
                  ))}
                </div>
              </nav>
            ) : null}

            <SupportContactCard page={page} locale={locale} />

            <div className="space-y-3 border-t border-[var(--fm-border)] pt-5">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-text-muted)]">
                {locale === "zh" ? "相关页面" : "Related"}
              </p>
              <div className="grid gap-2">
                {relatedLinks.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    className="text-sm font-medium text-[var(--fm-text)] hover:text-[var(--fm-accent)]"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </main>
  );
}
