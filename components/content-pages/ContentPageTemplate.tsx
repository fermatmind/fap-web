import Link from "next/link";
import { isKnownTestSlug, resolveCanonicalSlug } from "@/lib/assessmentSlugMap";
import { splitInternalLinkText } from "@/lib/content/internalLinkText";
import type { ReactNode } from "react";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { AboutTeamSection } from "@/components/content-pages/AboutTeamSection";
import { SanitizedCmsHtml } from "@/components/content/SanitizedCmsHtml";
import { Container } from "@/components/layout/Container";
import { renderCmsInlineMarkdown, stripMarkdownEmphasisMarkers } from "@/lib/content/markdownInline";
import { cn } from "@/lib/utils";
import type { ContentPage } from "@/lib/cms/content-pages";
import { buildContentPagePath } from "@/lib/cms/content-pages";
import type { DisplayLocale } from "@/lib/i18n/locales";
import labels from "@/lib/i18n/zh-TW/content-page-labels.source.json";
import generated from "@/lib/i18n/zh-TW/chiikawa.generated.json";
import { localizedPath } from "@/lib/i18n/locales";
import { traditionalPath, TRADITIONAL_CMS_PUBLISHED_PATHS } from "@/lib/i18n/traditionalRoutes";

function label(locale: DisplayLocale, zh: string, en: string): string {
  if (locale !== "zh-TW") return locale === "zh" ? zh : en;
  const index = labels.findIndex(value => value.zh === zh && value.en === en);
  const unit = (generated.units as Record<string, { text: string }>)[`lib/i18n/zh-TW/content-page-labels.source.json/${index}`];
  if (!unit) throw new Error(`Missing Traditional ContentPage label: ${zh}`);
  return unit.text;
}

type MarkdownBlock =
  | { type: "heading"; level: 2 | 3; text: string; id: string; teamSection?: boolean }
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

function formatDate(value: string | null, locale: DisplayLocale): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "zh-TW" ? "zh-TW" : locale === "zh" ? "zh-CN" : "en-US", {
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

const INTERNAL_CONTENT_FIELD_MARKERS = new Set(["content_md", "content_html", "visible_faq_items"]);

function normalizeContentFieldMarker(text: string): string {
  return text
    .trim()
    .replace(/^[`*_]+|[`*_]+$/g, "")
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function isInternalContentFieldHeading(line: string): boolean {
  const match = line.match(/^\s*#{1,6}\s+(.+?)\s*$/);
  if (!match) {
    return false;
  }

  return INTERNAL_CONTENT_FIELD_MARKERS.has(normalizeContentFieldMarker(String(match[1] ?? "")));
}

function stripInternalContentFieldPrefix(line: string): string {
  const match = line.match(/^\s*([A-Za-z][A-Za-z0-9_-]*)\s*:\s*(.*)$/);
  if (!match) {
    return line;
  }

  const marker = normalizeContentFieldMarker(String(match[1] ?? ""));
  if (!INTERNAL_CONTENT_FIELD_MARKERS.has(marker)) {
    return line;
  }

  return String(match[2] ?? "").trim();
}

function parseMarkdown(markdown: string): MarkdownBlock[] {
  const lines = markdown
    .replace(/<!--\s*help-service-visible-faq:(?:start|end)\s*-->/g, "")
    .replace(/\r\n?/g, "\n")
    .split("\n");
  const blocks: MarkdownBlock[] = [];
  let index = 0;
  let headingIndex = 0;

  while (index < lines.length) {
    const line = lines[index] ?? "";

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (isInternalContentFieldHeading(line)) {
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
      const paragraphLine = stripInternalContentFieldPrefix(current);
      if (
        !current.trim() ||
        isInternalContentFieldHeading(current) ||
        /^(#{2,3})\s+/.test(current) ||
        /^\s*[-*+]\s+/.test(current) ||
        /^\s*\d+\.\s+/.test(current)
      ) {
        break;
      }
      if (paragraphLine) {
        paragraphLines.push(paragraphLine);
      }
      index += 1;
    }

    const text = paragraphLines.join(" ").trim();
    if (text) {
      blocks.push({ type: "paragraph", text });
    }
  }

  return blocks;
}

function renderInline(text: string, keyPrefix: string, locale: DisplayLocale): ReactNode[] {
  if (locale === "zh-TW") {
    // Inline links use the existing sanitized renderer; plain segments retain
    // the Traditional reader's published-variant and source-language handling.
    if (/[<>`]/.test(text)) throw new Error("Traditional CMS inline format unavailable");
    if (/[\[\]]/.test(text)) {
      const chunks = text.split(/(\[[^\[\]\n]+\]\([^()\s]+\))/g);
      return chunks.flatMap((chunk, index) => {
        const link = /^\[([^\[\]\n]+)\]\(([^()\s]+)\)$/.exec(chunk);
        if (!link) {
          if (/[\[\]]/.test(chunk) || (chunk.endsWith("!") && index < chunks.length - 1)) throw new Error("Traditional CMS inline format unavailable");
          return renderInline(chunk, `${keyPrefix}-plain-${index}`, locale);
        }
        const href = link[2];
        if (!/^(?:\/(?!\/)|#|https?:\/\/|mailto:|tel:)/i.test(href) || /[\\\u0000-\u001f\u007f]/.test(href)) throw new Error("Traditional CMS inline format unavailable");
        return renderCmsInlineMarkdown(chunk, `${keyPrefix}-link-${index}`);
      });
    }
    const linkLabels = {
      "/method-boundaries": label(locale, "方法边界", "Method boundaries"),
      "/item-design-notes": label(locale, "题目设计说明", "Item design notes"),
      "/reliability-validity": label(locale, "信度与效度", "Reliability and validity"),
      "/tests/mbti-personality-test-16-personality-types": label(locale, "MBTI免费测试", "MBTI personality test"),
      "/tests/big-five-personality-test": label(locale, "大五人格免费测试", "Big Five personality test"),
      "/tests/holland-career-interest-test-riasec": label(locale, "霍兰德职业兴趣免费测试", "Holland career interest test"),
    };
    return splitInternalLinkText(stripMarkdownEmphasisMarkers(text), linkLabels, "zh").map((part, index) => {
      if (part.type === "text") return <span key={`${keyPrefix}-${index}`}>{part.text}</span>;
      // Bare assessment links keep the source language and canonical identity;
      // explicit language links stay explicit. Only published variants gain TW.
      const test = /^\/tests\/([^/?#]+)([?#].*)?$/.exec(part.href);
      const testSlug = test?.[1] ?? "";
      const originalHref = isKnownTestSlug(testSlug)
        ? localizedPath(`/tests/${resolveCanonicalSlug(testSlug)}${test?.[2] ?? ""}`, "zh")
        : /^\/(?:method-boundaries|item-design-notes|reliability-validity)(?:$|[/?#])/.test(part.href)
          ? localizedPath(part.href, "zh") : part.href;
      const navigationPath = /^\/(?:zh|en)(?=\/|$)/.test(originalHref) ? originalHref : localizedPath(originalHref, "zh");
      const href = /^\/(?:zh|en)(?=\/|$)/.test(part.href)
        ? originalHref : traditionalPath(navigationPath) ?? originalHref;
      const sourceLanguage = href.startsWith("/zh/") ? "zh-CN" : href.startsWith("/en/") ? "en" : undefined;
      const readerLabel = sourceLanguage === "zh-CN" && !/^\/(?:zh|en)(?=\/|$)/.test(part.href)
        ? `${part.label}（${label(locale, "简体中文", "Simplified Chinese")}）` : part.label;
      return <Link key={`${keyPrefix}-${index}`} href={href} hrefLang={sourceLanguage} className="text-[var(--fm-accent)] underline-offset-2 hover:underline">{readerLabel}</Link>;
    });
  }
  return renderCmsInlineMarkdown(text, keyPrefix, { locale });
}

function plainInlineText(text: string): string {
  return stripMarkdownEmphasisMarkers(text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"));
}

function ContentPageBody({ page, blocks, locale }: { page: ContentPageReaderView; blocks: MarkdownBlock[]; locale: DisplayLocale }) {
  if (page.contentHtml.trim()) {
    if (locale === "zh-TW") throw new Error("Traditional CMS HTML adapter unavailable");
    return <SanitizedCmsHtml className="fm-content-page-prose" html={page.contentHtml} locale={locale} />;
  }

  return (
    <div className="space-y-6" data-animation-profile={page.animationProfile}>
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          if (block.teamSection) return <AboutTeamSection key="about-team" locale={locale} />;
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
              {renderInline(block.text, `heading-${index}`, locale)}
            </Heading>
          );
        }

        if (block.type === "paragraph") {
          return (
            <p key={`paragraph-${index}`} className="m-0 text-base leading-8 text-[var(--fm-text-muted)]">
              {renderInline(block.text, `paragraph-${index}`, locale)}
            </p>
          );
        }

        if (block.type === "unordered-list") {
          return (
            <ul key={`ul-${index}`} className="m-0 list-disc space-y-2 pl-5 text-base leading-8 text-[var(--fm-text-muted)]">
              {block.items.map((item, itemIndex) => (
                <li key={`ul-${index}-${itemIndex}`}>{renderInline(item, `ul-${index}-${itemIndex}`, locale)}</li>
              ))}
            </ul>
          );
        }

        return (
          <ol key={`ol-${index}`} className="m-0 list-decimal space-y-2 pl-5 text-base leading-8 text-[var(--fm-text-muted)]">
            {block.items.map((item, itemIndex) => (
              <li key={`ol-${index}-${itemIndex}`}>{renderInline(item, `ol-${index}-${itemIndex}`, locale)}</li>
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

function buildRelatedLinks(page: ContentPageReaderView, locale: DisplayLocale, blocks: MarkdownBlock[]): RelatedLink[] {
  const companyLinks = [
    { slug: "about", label: label(locale, "关于我们", "About") },
    { slug: "charter", label: label(locale, "我们的宪章", "Charter") },
    { slug: "foundation", label: label(locale, "基金会", "Foundation") },
    { slug: "careers", label: label(locale, "工作机会", "Careers") },
    { slug: "brand", label: label(locale, "品牌", "Brand") },
  ];
  const careersJobLinks = buildCareersJobLinks(page, blocks);
  if (careersJobLinks.length) {
    return careersJobLinks;
  }
  if (locale === "zh-TW") {
    const lifecycleLinks: RelatedLink[] = page.kind === "help" && page.slug === "help-contact"
      ? [
          { key: "order-lookup", label: `${label(locale, "订单查询与报告找回", "Order lookup and report recovery")}（${label(locale, "简体中文", "Simplified Chinese")}）`, href: "/zh/orders/lookup" },
          { key: "email-preferences", label: label(locale, "邮件偏好", "Email preferences"), href: "/zh-TW/email/preferences" },
          { key: "email-unsubscribe", label: label(locale, "退订邮件", "Unsubscribe"), href: "/zh-TW/email/unsubscribe" },
        ]
      : [];
    return [...lifecycleLinks, ...companyLinks
      .filter(item => item.slug !== page.slug && TRADITIONAL_CMS_PUBLISHED_PATHS.some(path => path === `/${item.slug}`))
      .map(item => ({ key: item.slug, label: item.label, href: buildContentPagePath(item.slug, locale) }))];
  }

  if (page.kind === "help") {
    const helpLinks = [
      { slug: "help-faq", label: label(locale, "常见问题", "FAQ") },
      { slug: "help-contact", label: label(locale, "联系方式", "Contact") },
    ];

    const lifecycleLinks: RelatedLink[] = ["help-faq", "help-contact"].includes(page.slug)
      ? [
          { key: "order-lookup", label: label(locale, "订单查询与报告找回", "Order lookup and report recovery"), href: localizedPath("/orders/lookup", locale) },
          { key: "email-preferences", label: label(locale, "邮件偏好", "Email preferences"), href: localizedPath("/email/preferences", locale) },
          { key: "email-unsubscribe", label: label(locale, "退订邮件", "Unsubscribe"), href: localizedPath("/email/unsubscribe", locale) },
        ]
      : [];

    return [...lifecycleLinks, ...helpLinks.filter((item) => item.slug !== page.slug).map((item) => ({
      key: item.slug,
      label: item.label,
      href: buildContentPagePath(item.slug, locale),
    }))];
  }

  const policyLinks = [
    { slug: "terms", label: label(locale, "使用条款", "Terms of use") },
    { slug: "privacy", label: label(locale, "隐私政策", "Privacy policy") },
    { slug: "policies", label: label(locale, "其他政策", "Other policies") },
  ];
  const source = page.kind === "policy" ? policyLinks : companyLinks;
  return source.filter((item) => item.slug !== page.slug).map((item) => ({
    key: item.slug,
    label: item.label,
    href: buildContentPagePath(item.slug, locale),
  }));
}

function SupportContactCard({ page, locale }: { page: ContentPageReaderView; locale: DisplayLocale }) {
  if (page.kind !== "help" || !page.supportContact) {
    return null;
  }

  return (
    <div className="space-y-3 border-t border-[var(--fm-border)] pt-5" data-testid="help-support-contact">
      <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-text-muted)]">
        {label(locale, "联系支持", "Contact support")}
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

export function ContentPageTemplate({ page, locale }: { page: ContentPageReaderView; locale: DisplayLocale }) {
  const markdownBlocks = parseMarkdown(page.contentMd);
  if (page.slug === "about" && !page.contentHtml.trim()) {
    const nextSectionIndex = markdownBlocks.findIndex((block, index) => index > 0 && block.type === "heading" && block.level === 2);
    markdownBlocks.splice(nextSectionIndex < 0 ? markdownBlocks.length : nextSectionIndex, 0, {
      type: "heading",
      level: 2,
      text: label(locale, "创始人与博士顾问团队", "Founder and doctoral advisors"),
      id: "team",
      teamSection: true,
    });
  }
  const toc = buildToc(markdownBlocks);
  const relatedLinks = buildRelatedLinks(page, locale, markdownBlocks);
  const updatedAt = formatDate(page.updatedAt, locale);
  const effectiveAt = formatDate(page.effectiveAt, locale);
  const isPolicy = page.kind === "policy";
  const isHelp = page.kind === "help";
  const showHeroSummary = page.slug !== "help-contact";
  const showMetadataCard = Boolean(updatedAt || effectiveAt);

  const PageRoot = locale === "zh-TW" ? "article" : "main";
  return (
    <PageRoot className="fm-page-background text-[var(--fm-text)]" data-testid={`content-page-${page.slug}`}>
      <Container className="py-10 md:py-14">
        <Breadcrumb
          ariaLabel={locale === "zh-TW" ? "導覽路徑" : undefined}
          items={[
            { label: label(locale, "首页", "Home"), href: locale === "zh-TW" ? "/zh-TW" : localizedPath("/", locale) },
            {
              label: isHelp
                ? label(locale, "帮助中心", "Help Center")
                : isPolicy
                  ? label(locale, "条款与政策", "Terms & policies")
                  : label(locale, "公司", "Company"),
              href: isHelp && locale !== "zh-TW" ? localizedPath("/support", locale) : undefined,
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
                  <dt className="text-[var(--fm-text-muted)]">{label(locale, "最近更新", "Updated")}</dt>
                  <dd className="m-0 font-medium text-[var(--fm-text)]">{updatedAt}</dd>
                </div>
              ) : null}
              {effectiveAt ? (
                <div>
                  <dt className="text-[var(--fm-text-muted)]">{label(locale, "生效日期", "Effective")}</dt>
                  <dd className="m-0 font-medium text-[var(--fm-text)]">{effectiveAt}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}
        </section>

        <div className="grid gap-10 py-12 md:grid-cols-[minmax(0,1fr)_18rem] md:py-16">
          <article className="max-w-3xl">
            <ContentPageBody page={page} blocks={markdownBlocks} locale={locale} />
          </article>

          <aside className="h-fit space-y-6 md:sticky md:top-24">
            {toc.length ? (
              <nav aria-label={label(locale, "页面目录", "Page contents")} className="space-y-3">
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-text-muted)]">
                  {label(locale, "目录", "Contents")}
                </p>
                <div className="grid gap-2 border-l border-[var(--fm-border)] pl-4">
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="text-sm leading-6 text-[var(--fm-text-muted)] hover:text-[var(--fm-accent)]"
                    >
                      {renderInline(item.text, `toc-${item.id}`, locale)}
                    </a>
                  ))}
                </div>
              </nav>
            ) : null}

            <SupportContactCard page={page} locale={locale} />

            {relatedLinks.length ? <div className="space-y-3 border-t border-[var(--fm-border)] pt-5">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-text-muted)]">
                {label(locale, "相关页面", "Related")}
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
            </div> : null}
          </aside>
        </div>
      </Container>
    </PageRoot>
  );
}
