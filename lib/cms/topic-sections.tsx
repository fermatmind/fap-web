import Link from "next/link";
import type { ReactNode } from "react";
import { SanitizedCmsHtml } from "@/components/content/SanitizedCmsHtml";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { renderSimpleMarkdown } from "@/lib/content/renderSimpleMarkdown";
import type {
  CmsTopicEntry,
  CmsTopicEntryGroupKey,
  CmsTopicEntryGroups,
  CmsTopicSection,
} from "@/lib/cms/topics";
import type { Locale } from "@/lib/i18n/locales";
import type { FAQItem } from "@/lib/seo/generateSchema";
import { normalizeInternalHref } from "@/lib/url/safeContentUrls";

const KNOWN_SECTION_KEYS = [
  "overview",
  "key_concepts",
  "why_it_matters",
  "who_should_read",
  "faq",
  "related_topics_intro",
] as const;

const KNOWN_GROUP_KEYS = [
  "featured",
  "articles",
  "personalities",
  "tests",
  "related",
] as const;

type KnownSectionKey = (typeof KNOWN_SECTION_KEYS)[number];
type KnownGroupKey = (typeof KNOWN_GROUP_KEYS)[number];

type BulletItem = {
  title?: string;
  label?: string;
  body?: string | null;
};

type FaqItem = {
  question?: string;
  q?: string;
  answer?: string | null;
  a?: string | null;
};

type CardItem = {
  title?: string;
  body?: string | null;
  summary?: string | null;
  href?: string | null;
  url?: string | null;
};

function isKnownSectionKey(value: string): value is KnownSectionKey {
  return KNOWN_SECTION_KEYS.includes(value as KnownSectionKey);
}

function isKnownGroupKey(value: string): value is KnownGroupKey {
  return KNOWN_GROUP_KEYS.includes(value as KnownGroupKey);
}

function warnUnknown(kind: "section" | "group", key: string) {
  if (process.env.NODE_ENV !== "production" && key) {
    console.warn(`[topics] ignored unknown ${kind} key: ${key}`);
  }
}

function normalizeText(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function renderRichTextSection(section: CmsTopicSection, locale: Locale) {
  if (section.bodyHtml.trim()) {
    return (
      <SanitizedCmsHtml
        className="space-y-4 text-[var(--fm-text)] [&_a]:text-[var(--fm-accent)] [&_a]:underline-offset-2 [&_a:hover]:underline [&_p]:leading-7 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5"
        html={section.bodyHtml}
        locale={locale}
      />
    );
  }

  if (section.bodyMd.trim()) {
    return renderSimpleMarkdown(section.bodyMd, { locale, minimumHeadingLevel: 3 });
  }

  return null;
}

function renderBulletItems(items: BulletItem[]) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ul className="m-0 list-disc space-y-2 pl-5 text-[var(--fm-text-muted)]">
      {items.map((item, index) => {
        const title = normalizeText(item.title ?? item.label);
        const body = normalizeText(item.body);
        const key = title || body;

        if (!key) {
          return null;
        }

        return (
          <li key={`${key}-${index}`}>
            {title ? <span className="font-medium text-[var(--fm-text)]">{title}</span> : null}
            {body && body !== title ? <span className="text-[var(--fm-text-muted)]"> {body}</span> : null}
          </li>
        );
      })}
    </ul>
  );
}

function renderBulletsSection(section: CmsTopicSection) {
  const payload = asRecord(section.payloadJson);
  const items = asArray<BulletItem>(payload?.items);
  const renderedItems = renderBulletItems(items);

  if (renderedItems) {
    return renderedItems;
  }

  if (section.bodyMd.trim()) {
    const fallbackItems = section.bodyMd
      .split("\n")
      .map((item) => item.replace(/^[\-\*\d\.\s]+/, "").trim())
      .filter(Boolean)
      .map((item) => ({ title: item }));

    return renderBulletItems(fallbackItems);
  }

  return null;
}

function renderFaqSection(section: CmsTopicSection, locale: Locale) {
  const payload = asRecord(section.payloadJson);
  const items = asArray<FaqItem>(payload?.items);

  if (items.length === 0) {
    return renderRichTextSection(section, locale);
  }

  return (
    <dl className="m-0 space-y-4">
      {items.map((item, index) => {
        const question = normalizeText(item.question ?? item.q);
        const answer = normalizeText(item.answer ?? item.a);

        if (!question && !answer) {
          return null;
        }

        return (
          <div key={`${question}-${index}`} className="space-y-1">
            <dt className="font-medium text-[var(--fm-text)]">{question || `Q${index + 1}`}</dt>
            {answer ? <dd className="m-0 text-[var(--fm-text-muted)]">{answer}</dd> : null}
          </div>
        );
      })}
    </dl>
  );
}

function renderCardsSection(section: CmsTopicSection, locale: Locale) {
  const payload = asRecord(section.payloadJson);
  const items = asArray<CardItem>(payload?.items);

  if (items.length === 0) {
    return renderRichTextSection(section, locale);
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((item, index) => {
        const title = normalizeText(item.title);
        const summary = normalizeText(item.summary ?? item.body);
        const href = normalizeInternalHref(item.href ?? item.url);

        if (!title) {
          return null;
        }

        return (
          <article
            key={`${title}-${index}`}
            className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4"
          >
            {href ? (
              <Link href={href} className="font-semibold text-[var(--fm-text)] hover:text-[var(--fm-accent)]">
                {title}
              </Link>
            ) : (
              <p className="m-0 font-semibold text-[var(--fm-text)]">{title}</p>
            )}
            {summary ? <p className="mb-0 mt-2 text-sm text-[var(--fm-text-muted)]">{summary}</p> : null}
          </article>
        );
      })}
    </div>
  );
}

export function getRenderableTopicSections(sections: CmsTopicSection[]): CmsTopicSection[] {
  return sections.filter((section) => {
    if (isKnownSectionKey(section.sectionKey)) {
      return true;
    }

    warnUnknown("section", section.sectionKey);
    return false;
  });
}

export function renderTopicSections(
  sections: CmsTopicSection[],
  locale: Locale
): ReactNode[] {
  return getRenderableTopicSections(sections)
    .flatMap((section) => {
      let content: ReactNode = null;

      switch (section.renderVariant) {
        case "bullets":
          content = renderBulletsSection(section);
          break;
        case "faq":
          content = renderFaqSection(section, locale);
          break;
        case "cards":
        case "links":
          content = renderCardsSection(section, locale);
          break;
        case "callout":
        case "rich_text":
        default:
          content = renderRichTextSection(section, locale);
          break;
      }

      if (!content) {
        return [];
      }

      return [
        (
          <Card
            key={`${section.sectionKey}-${section.sortOrder}`}
            id={section.sectionKey}
            data-section-key={section.sectionKey}
          >
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">{content}</CardContent>
          </Card>
        ),
      ];
    });
}

function groupTitle(locale: Locale, groupKey: KnownGroupKey): string {
  if (locale === "zh") {
    return {
      featured: "精选内容",
      articles: "相关文章",
      personalities: "相关人格画像",
      tests: "相关测试",
      related: "延伸阅读",
    }[groupKey];
  }

  return {
    featured: "Featured",
    articles: "Related articles",
    personalities: "Related personality profiles",
    tests: "Related tests",
    related: "Related links",
  }[groupKey];
}

export function getRenderableTopicEntryGroups(entryGroups: CmsTopicEntryGroups): Array<{
  groupKey: CmsTopicEntryGroupKey;
  items: CmsTopicEntry[];
}> {
  for (const groupKey of Object.keys(entryGroups)) {
    const normalizedKey = normalizeText(groupKey).toLowerCase();
    if (!isKnownGroupKey(normalizedKey)) {
      warnUnknown("group", normalizedKey);
    }
  }

  return KNOWN_GROUP_KEYS
    .map((groupKey) => {
      const items = entryGroups[groupKey];
      const normalizedItems = Array.isArray(items) ? items.filter((item) => Boolean(item?.title && item?.url)) : [];

      if (normalizedItems.length === 0) {
        return null;
      }

      return {
        groupKey,
        items: normalizedItems,
      };
    })
    .filter((group): group is { groupKey: CmsTopicEntryGroupKey; items: CmsTopicEntry[] } => group !== null);
}

export function renderTopicEntryGroups(
  entryGroups: CmsTopicEntryGroups,
  locale: Locale
): ReactNode[] {
  return getRenderableTopicEntryGroups(entryGroups).map(({ groupKey, items }) => (
    <section key={groupKey} className="space-y-3">
      <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">{groupTitle(locale, groupKey)}</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <Card
            key={`${groupKey}-${item.url}-${item.targetKey || item.title}`}
            className="border-[var(--fm-border)] bg-[var(--fm-surface)] shadow-[var(--fm-shadow-sm)]"
          >
            <CardHeader className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {item.badgeLabel ? (
                  <Badge className={item.isFeatured ? "border-[var(--fm-accent)] text-[var(--fm-accent)]" : undefined}>
                    {item.badgeLabel}
                  </Badge>
                ) : null}
                {item.isFeatured ? (
                  <Badge className="border-[var(--fm-accent)] text-[var(--fm-accent)]">
                    {locale === "zh" ? "精选" : "Featured"}
                  </Badge>
                ) : null}
              </div>
              <CardTitle className="text-lg font-semibold text-[var(--fm-text)]">
                <Link href={item.url} className="hover:text-[var(--fm-accent)]">
                  {item.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-[var(--fm-text-muted)]">
              {item.excerpt ? <p className="m-0">{item.excerpt}</p> : null}
              <Link
                href={item.url}
                className="inline-flex text-sm font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
              >
                {item.ctaLabel || (locale === "zh" ? "查看详情" : "View details")}
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  ));
}

export function extractTopicFaqItems(sections: CmsTopicSection[]): FAQItem[] {
  return getRenderableTopicSections(sections)
    .filter((section) => section.sectionKey === "faq")
    .flatMap((section) => {
      const payload = asRecord(section.payloadJson);
      const items = asArray<FaqItem>(payload?.items);

      return items
        .map((item) => ({
          question: normalizeText(item.question ?? item.q),
          answer: normalizeText(item.answer ?? item.a),
        }))
        .filter((item) => item.question && item.answer);
    });
}
