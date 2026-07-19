import Link from "next/link";
import type { ReactNode } from "react";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { SanitizedCmsHtml } from "@/components/content/SanitizedCmsHtml";
import { Container } from "@/components/layout/Container";
import { PublicReviewStatus } from "@/components/public-content/PublicReviewStatus";
import { renderCmsInlineMarkdown } from "@/lib/content/markdownInline";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import type { PublicReview } from "@/lib/public-content/publicReview";
import { cn } from "@/lib/utils";

type MarkdownBlock =
  | { type: "heading"; level: 2 | 3; text: string; id: string }
  | { type: "paragraph"; text: string }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] };

type RelatedLink = {
  href: string;
  label: string;
};

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
      }
      blocks.push({ type: "unordered-list", items });
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index] ?? "")) {
        items.push((lines[index] ?? "").replace(/^\s*\d+\.\s+/, "").trim());
        index += 1;
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

function buildToc(bodyMd: string) {
  return parseMarkdown(bodyMd)
    .filter((block): block is Extract<MarkdownBlock, { type: "heading" }> => block.type === "heading")
    .filter((block) => block.level === 2);
}

function renderInline(text: string, keyPrefix: string, locale: Locale): ReactNode[] {
  return renderCmsInlineMarkdown(text, keyPrefix, { locale });
}

function RichBody({ bodyMd, bodyHtml, locale }: { bodyMd: string; bodyHtml: string; locale: Locale }) {
  if (bodyHtml.trim()) {
    return <SanitizedCmsHtml className="fm-content-page-prose" html={bodyHtml} locale={locale} />;
  }

  const blocks = parseMarkdown(bodyMd);
  return (
    <div className="space-y-6">
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

export function SupportTrustDetailTemplate({
  locale,
  eyebrow,
  title,
  summary,
  bodyMd,
  bodyHtml,
  publishedAt,
  updatedAt,
  publicReview,
  primaryCtaLabel,
  primaryCtaUrl,
  backHref,
  backLabel,
  relatedLinks,
  testId,
}: {
  locale: Locale;
  eyebrow: string;
  title: string;
  summary: string;
  bodyMd: string;
  bodyHtml: string;
  publishedAt: string | null;
  updatedAt: string | null;
  publicReview: PublicReview;
  primaryCtaLabel?: string | null;
  primaryCtaUrl?: string | null;
  backHref: string;
  backLabel: string;
  relatedLinks?: RelatedLink[];
  testId: string;
}) {
  const toc = buildToc(bodyMd);
  const publishedLabel = formatDate(publishedAt, locale);
  const updatedLabel = formatDate(updatedAt, locale);

  return (
    <main className="fm-page-background text-[var(--fm-text)]" data-testid={testId}>
      <Container className="py-10 md:py-14">
        <Breadcrumb
          items={[
            { label: locale === "zh" ? "首页" : "Home", href: localizedPath("/", locale) },
            { label: locale === "zh" ? "支持与信任中心" : "Support & Trust Center", href: localizedPath("/support", locale) },
            { label: title },
          ]}
        />

        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
          <article className="space-y-8">
            <header className="space-y-4 border-b border-[var(--fm-border)] pb-8">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">{eyebrow}</p>
              <div className="space-y-3">
                <h1 className="m-0 font-serif text-4xl font-semibold tracking-tight text-[var(--fm-text)] md:text-5xl">
                  {title}
                </h1>
                {summary ? <p className="m-0 max-w-3xl text-lg leading-8 text-[var(--fm-text-muted)]">{summary}</p> : null}
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-[var(--fm-text-subtle)]">
                {publishedLabel ? <span>{locale === "zh" ? `发布时间 ${publishedLabel}` : `Published ${publishedLabel}`}</span> : null}
                {updatedLabel ? <span>{locale === "zh" ? `更新于 ${updatedLabel}` : `Updated ${updatedLabel}`}</span> : null}
                <PublicReviewStatus review={publicReview} locale={locale} testId="support-public-review" />
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={backHref}
                  className="inline-flex items-center rounded-full border border-[var(--fm-border)] px-4 py-2 text-sm font-medium text-[var(--fm-text)] transition hover:border-[var(--fm-accent)] hover:text-[var(--fm-accent)]"
                >
                  {backLabel}
                </Link>
                {primaryCtaLabel && primaryCtaUrl ? (
                  <Link
                    href={primaryCtaUrl}
                    className="inline-flex items-center rounded-full bg-[var(--fm-accent)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                  >
                    {primaryCtaLabel}
                  </Link>
                ) : null}
              </div>
            </header>

            <RichBody bodyMd={bodyMd} bodyHtml={bodyHtml} locale={locale} />
          </article>

          <aside className="space-y-5 lg:sticky lg:top-24">
            {toc.length ? (
              <section className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5">
                <h2 className="m-0 font-serif text-xl font-semibold text-[var(--fm-text)]">
                  {locale === "zh" ? "目录" : "On this page"}
                </h2>
                <nav className="mt-4 space-y-3">
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="block text-sm leading-6 text-[var(--fm-text-muted)] transition hover:text-[var(--fm-accent)]"
                    >
                      {renderInline(item.text, `toc-${item.id}`, locale)}
                    </a>
                  ))}
                </nav>
              </section>
            ) : null}

            {relatedLinks?.length ? (
              <section className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5">
                <h2 className="m-0 font-serif text-xl font-semibold text-[var(--fm-text)]">
                  {locale === "zh" ? "继续查看" : "Continue reading"}
                </h2>
                <div className="mt-4 space-y-3">
                  {relatedLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block rounded-xl border border-[var(--fm-border)] bg-white px-4 py-3 text-sm font-medium text-[var(--fm-text)] transition hover:border-[var(--fm-accent)] hover:text-[var(--fm-accent)]"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </aside>
        </div>
      </Container>
    </main>
  );
}
