import Link from "next/link";
import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type CmsPersonalitySection, buildPersonalityFrontendUrl } from "@/lib/cms/personality";
import { type Locale } from "@/lib/i18n/locales";
import type { FAQItem } from "@/lib/seo/generateSchema";

const KNOWN_SECTION_KEYS = [
  "hero",
  "core_snapshot",
  "strengths",
  "growth_edges",
  "work_style",
  "relationships",
  "communication",
  "stress_and_recovery",
  "career_fit",
  "faq",
  "related_content",
] as const;

type KnownSectionKey = (typeof KNOWN_SECTION_KEYS)[number];

type BulletItem = {
  title?: string;
  body?: string | null;
};

type FaqItem = {
  question?: string;
  answer?: string | null;
};

type LinkItem = {
  href?: string;
  slug?: string;
  title?: string;
  body?: string | null;
  summary?: string | null;
};

type CareerFitPayload = {
  work_env?: string;
  recommended_jobs?: LinkItem[];
  avoid_jobs?: LinkItem[];
};

function isKnownSectionKey(value: string): value is KnownSectionKey {
  return KNOWN_SECTION_KEYS.includes(value as KnownSectionKey);
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

function renderRichTextSection(section: CmsPersonalitySection) {
  if (section.bodyHtml.trim()) {
    return (
      <div
        className="space-y-4 text-[var(--fm-text)] [&_a]:text-[var(--fm-accent)] [&_a]:underline-offset-2 [&_a:hover]:underline [&_p]:leading-7 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5"
        dangerouslySetInnerHTML={{ __html: section.bodyHtml }}
      />
    );
  }

  if (section.bodyMd.trim()) {
    return <p className="m-0 whitespace-pre-wrap leading-7 text-[var(--fm-text-muted)]">{section.bodyMd}</p>;
  }

  return null;
}

function renderBulletItems(items: BulletItem[]) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ul className="m-0 space-y-2 pl-5 text-[var(--fm-text-muted)]">
      {items.map((item, index) => {
        const title = normalizeText(item.title);
        const body = normalizeText(item.body);
        const label = title || body;

        if (!label) {
          return null;
        }

        return (
          <li key={`${label}-${index}`}>
            <span className="font-medium text-[var(--fm-text)]">{title || label}</span>
            {body && body !== title ? <span className="text-[var(--fm-text-muted)]"> — {body}</span> : null}
          </li>
        );
      })}
    </ul>
  );
}

function renderBulletsSection(section: CmsPersonalitySection) {
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

function renderFaqSection(section: CmsPersonalitySection) {
  const payload = asRecord(section.payloadJson);
  const items = asArray<FaqItem>(payload?.items);

  if (items.length === 0) {
    return renderRichTextSection(section);
  }

  return (
    <dl className="m-0 space-y-4">
      {items.map((item, index) => {
        const question = normalizeText(item.question);
        const answer = normalizeText(item.answer);

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

function normalizeLinkItems(items: LinkItem[], locale: Locale): Array<Required<Pick<LinkItem, "title">> & { href: string | null; summary: string }> {
  return items
    .map((item) => {
      const title = normalizeText(item.title);
      const summary = normalizeText(item.summary ?? item.body);
      const href = normalizeText(item.href);
      const slug = normalizeText(item.slug);

      if (!title) {
        return null;
      }

      if (href) {
        return {
          title,
          href,
          summary,
        };
      }

      if (slug) {
        return {
          title,
          href: buildPersonalityFrontendUrl(locale, slug),
          summary,
        };
      }

      return {
        title,
        href: null,
        summary,
      };
    })
    .filter((item): item is Required<Pick<LinkItem, "title">> & { href: string | null; summary: string } => item !== null);
}

function renderGenericCards(items: Array<{ title: string; href: string | null; summary: string }>) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <article
          key={`${item.title}-${item.href ?? "plain"}`}
          className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4"
        >
          {item.href ? (
            <Link href={item.href} className="font-semibold text-[var(--fm-text)] hover:text-[var(--fm-accent)]">
              {item.title}
            </Link>
          ) : (
            <p className="m-0 font-semibold text-[var(--fm-text)]">{item.title}</p>
          )}
          {item.summary ? <p className="mb-0 mt-2 text-sm text-[var(--fm-text-muted)]">{item.summary}</p> : null}
        </article>
      ))}
    </div>
  );
}

function renderCareerFitSection(section: CmsPersonalitySection, locale: Locale) {
  const payload = asRecord(section.payloadJson) as CareerFitPayload | null;
  const recommended = normalizeLinkItems(asArray<LinkItem>(payload?.recommended_jobs), locale);
  const avoid = normalizeLinkItems(asArray<LinkItem>(payload?.avoid_jobs), locale);
  const workEnv = normalizeText(payload?.work_env);

  return (
    <div className="space-y-4">
      {section.bodyMd.trim() ? <p className="m-0 leading-7 text-[var(--fm-text-muted)]">{section.bodyMd}</p> : null}
      {workEnv ? (
        <div className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4 text-sm text-[var(--fm-text-muted)]">
          <p className="m-0 font-medium text-[var(--fm-text)]">
            {locale === "zh" ? "Best-fit environment" : "Best-fit environment"}
          </p>
          <p className="mb-0 mt-2">{workEnv}</p>
        </div>
      ) : null}
      {recommended.length > 0 ? (
        <div className="space-y-3">
          <h3 className="m-0 text-base font-semibold text-[var(--fm-text)]">
            {locale === "zh" ? "Recommended roles" : "Recommended roles"}
          </h3>
          {renderGenericCards(recommended)}
        </div>
      ) : null}
      {avoid.length > 0 ? (
        <div className="space-y-3">
          <h3 className="m-0 text-base font-semibold text-[var(--fm-text)]">
            {locale === "zh" ? "Use caution with" : "Use caution with"}
          </h3>
          {renderGenericCards(avoid)}
        </div>
      ) : null}
    </div>
  );
}

function renderCardsSection(section: CmsPersonalitySection, locale: Locale) {
  if (section.sectionKey === "career_fit") {
    return renderCareerFitSection(section, locale);
  }

  const payload = asRecord(section.payloadJson);
  const items = normalizeLinkItems(asArray<LinkItem>(payload?.items), locale);
  const renderedCards = renderGenericCards(items);

  if (renderedCards) {
    return renderedCards;
  }

  return renderRichTextSection(section);
}

export function getRenderablePersonalitySections(sections: CmsPersonalitySection[]): CmsPersonalitySection[] {
  return sections.filter((section) => isKnownSectionKey(section.sectionKey));
}

export function renderPersonalitySections(
  sections: CmsPersonalitySection[],
  locale: Locale
): ReactNode[] {
  return getRenderablePersonalitySections(sections)
    .map((section) => {
      let content: ReactNode = null;

      switch (section.renderVariant) {
        case "bullets":
          content = renderBulletsSection(section);
          break;
        case "faq":
          content = renderFaqSection(section);
          break;
        case "cards":
        case "links":
          content = renderCardsSection(section, locale);
          break;
        case "callout":
        case "rich_text":
        default:
          content = renderRichTextSection(section);
          break;
      }

      if (!content) {
        return null;
      }

      return (
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
      );
    })
    .filter((section) => section !== null);
}

export function buildPersonalitySectionLinks(
  section: CmsPersonalitySection,
  locale: Locale
): Array<{ title: string; href: string | null; summary: string }> {
  const payload = asRecord(section.payloadJson);
  return normalizeLinkItems(asArray<LinkItem>(payload?.items), locale);
}

export function extractPersonalityFaqItems(sections: CmsPersonalitySection[]): FAQItem[] {
  return getRenderablePersonalitySections(sections)
    .filter((section) => section.sectionKey === "faq")
    .flatMap((section) => {
      const payload = asRecord(section.payloadJson);
      const items = asArray<FaqItem>(payload?.items);

      return items
        .map((item) => ({
          question: normalizeText(item.question),
          answer: normalizeText(item.answer),
        }))
        .filter((item) => item.question && item.answer);
    });
}

export { KNOWN_SECTION_KEYS };
