import Link from "next/link";
import type { ReactNode } from "react";
import { SanitizedCmsHtml } from "@/components/content/SanitizedCmsHtml";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type CmsPersonalitySection,
  type PersonalityProjectionDimension,
  type PersonalityProjectionSection,
  buildPersonalityFrontendUrl,
} from "@/lib/cms/personality";
import { type Locale } from "@/lib/i18n/locales";
import type { FAQItem } from "@/lib/seo/generateSchema";
import { normalizeInternalHref } from "@/lib/url/safeContentUrls";

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

const SUPPORTED_PROJECTION_RENDERS = [
  "rich_text",
  "bullets",
  "letters_intro",
  "trait_dimension_grid",
  "preferred_role_list",
  "premium_teaser",
] as const;

type KnownSectionKey = (typeof KNOWN_SECTION_KEYS)[number];
type SupportedProjectionRender = (typeof SUPPORTED_PROJECTION_RENDERS)[number];

type BulletItem = {
  title?: string;
  body?: string | null;
  description?: string | null;
  summary?: string | null;
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

type LettersIntroLetter = {
  letter: string;
  title: string;
  description: string;
};

type LettersIntroPayload = {
  headline: string | null;
  letters: LettersIntroLetter[];
};

type PreferredRoleGroup = {
  groupTitle: string;
  description: string;
  examples: string[];
};

type PreferredRolePayload = {
  title: string | null;
  intro: string | null;
  groups: PreferredRoleGroup[];
};

export type RenderableProjectionSection = {
  key: string;
  title: string;
  render: SupportedProjectionRender;
  bodyMd: string;
  payload: Record<string, unknown> | null;
  source: string | null;
};

function isKnownSectionKey(value: string): value is KnownSectionKey {
  return KNOWN_SECTION_KEYS.includes(value as KnownSectionKey);
}

function isSupportedProjectionRender(value: string): value is SupportedProjectionRender {
  return SUPPORTED_PROJECTION_RENDERS.includes(value as SupportedProjectionRender);
}

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
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

const PROJECTION_SECTION_TITLE_COPY: Record<string, { zh: string; en: string }> = {
  overview: { zh: "核心总览", en: "Overview" },
  letters_intro: { zh: "字母拆解", en: "Letter-by-letter introduction" },
  trait_overview: { zh: "维度总览", en: "Trait overview" },
  "career.summary": { zh: "职业映射总览", en: "Career summary" },
  "career.advantages": { zh: "职业优势", en: "Career advantages" },
  "career.weaknesses": { zh: "职业风险", en: "Career weaknesses" },
  "career.preferred_roles": { zh: "偏好岗位簇", en: "Preferred roles" },
  "career.upgrade_suggestions": { zh: "职业升级建议", en: "Career upgrade suggestions" },
  "growth.summary": { zh: "成长总览", en: "Growth summary" },
  "growth.strengths": { zh: "成长杠杆", en: "Growth strengths" },
  "growth.weaknesses": { zh: "成长阻力", en: "Growth weaknesses" },
  "growth.motivators": { zh: "成长动力", en: "Growth motivators" },
  "growth.drainers": { zh: "能量消耗", en: "Growth drainers" },
  "relationships.summary": { zh: "关系总览", en: "Relationships summary" },
  "relationships.strengths": { zh: "关系优势", en: "Relationships strengths" },
  "relationships.weaknesses": { zh: "关系风险", en: "Relationships weaknesses" },
  "relationships.rel_advantages": { zh: "关系优势场景", en: "Relationship advantages" },
  "relationships.rel_risks": { zh: "关系风险场景", en: "Relationship risks" },
};

function projectionSectionTitle(sectionKey: string, fallbackTitle: string, locale: Locale): string {
  const copy = PROJECTION_SECTION_TITLE_COPY[sectionKey];
  if (!copy) {
    return fallbackTitle;
  }

  return locale === "zh" ? copy.zh : copy.en;
}

function stripZhTraitSuffix(title: string, locale: Locale): string {
  if (locale !== "zh") {
    return title;
  }

  return title.replace(/（-?[A-Z]）$/, "").trim();
}

function renderSectionCard(sectionKey: string, title: string, content: ReactNode, locale?: Locale) {
  const displayTitle = locale ? projectionSectionTitle(sectionKey, title, locale) : title;

  return (
    <Card key={sectionKey} id={sectionKey} data-section-key={sectionKey}>
      <CardHeader>
        <CardTitle>{displayTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">{content}</CardContent>
    </Card>
  );
}

function renderPlainMarkdown(body: string, className: string) {
  if (!body.trim()) {
    return null;
  }

  return <p className={className}>{body}</p>;
}

function renderRichTextBlock(bodyHtml: string, bodyMd: string) {
  if (bodyHtml.trim()) {
    return (
      <SanitizedCmsHtml
        className="space-y-4 text-[var(--fm-text)] [&_a]:text-[var(--fm-accent)] [&_a]:underline-offset-2 [&_a:hover]:underline [&_p]:leading-7 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5"
        html={bodyHtml}
      />
    );
  }

  return renderPlainMarkdown(bodyMd, "m-0 whitespace-pre-wrap leading-7 text-[var(--fm-text-muted)]");
}

function renderBulletItems(items: BulletItem[]) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ul className="m-0 space-y-2 pl-5 text-[var(--fm-text-muted)]">
      {items.map((item, index) => {
        const title = normalizeText(item.title);
        const body = normalizeText(item.body ?? item.description ?? item.summary);
        const label = title || body;

        if (!label) {
          return null;
        }

        return (
          <li key={`${label}-${index}`}>
            <span className="font-medium text-[var(--fm-text)]">{title || label}</span>
            {body && body !== title ? <span className="text-[var(--fm-text-muted)]"> - {body}</span> : null}
          </li>
        );
      })}
    </ul>
  );
}

function renderLegacyBulletsSection(section: CmsPersonalitySection) {
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

function renderLegacyFaqSection(section: CmsPersonalitySection) {
  const payload = asRecord(section.payloadJson);
  const items = asArray<FaqItem>(payload?.items);

  if (items.length === 0) {
    return renderRichTextBlock(section.bodyHtml, section.bodyMd);
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

function normalizeLinkItems(
  items: LinkItem[],
  locale: Locale
): Array<Required<Pick<LinkItem, "title">> & { href: string | null; summary: string }> {
  return items
    .map((item) => {
      const title = normalizeText(item.title);
      const summary = normalizeText(item.summary ?? item.body);
      const href = normalizeInternalHref(item.href);
      const slug = normalizeText(item.slug);

      if (!title) {
        return null;
      }

      if (href) {
        return { title, href, summary };
      }

      if (slug) {
        return { title, href: buildPersonalityFrontendUrl(locale, slug), summary };
      }

      return { title, href: null, summary };
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

function renderLegacyCareerFitSection(section: CmsPersonalitySection, locale: Locale) {
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
            {locale === "zh" ? "最适合的环境" : "Best-fit environment"}
          </p>
          <p className="mb-0 mt-2">{workEnv}</p>
        </div>
      ) : null}
      {recommended.length > 0 ? (
        <div className="space-y-3">
          <h3 className="m-0 text-base font-semibold text-[var(--fm-text)]">
            {locale === "zh" ? "推荐角色" : "Recommended roles"}
          </h3>
          {renderGenericCards(recommended)}
        </div>
      ) : null}
      {avoid.length > 0 ? (
        <div className="space-y-3">
          <h3 className="m-0 text-base font-semibold text-[var(--fm-text)]">
            {locale === "zh" ? "需要谨慎的方向" : "Use caution with"}
          </h3>
          {renderGenericCards(avoid)}
        </div>
      ) : null}
    </div>
  );
}

function renderLegacyCardsSection(section: CmsPersonalitySection, locale: Locale) {
  if (section.sectionKey === "career_fit") {
    return renderLegacyCareerFitSection(section, locale);
  }

  const payload = asRecord(section.payloadJson);
  const items = normalizeLinkItems(asArray<LinkItem>(payload?.items), locale);
  const renderedCards = renderGenericCards(items);

  if (renderedCards) {
    return renderedCards;
  }

  return renderRichTextBlock(section.bodyHtml, section.bodyMd);
}

function normalizeLettersIntroPayload(payload: Record<string, unknown> | null): LettersIntroPayload {
  const letters = asArray<Record<string, unknown>>(payload?.letters)
    .map((item) => ({
      letter: normalizeText(item.letter),
      title: normalizeText(item.title),
      description: normalizeText(item.description),
    }))
    .filter((item) => item.letter || item.title || item.description)
    .map((item) => ({
      letter: item.letter || "?",
      title: item.title || item.letter || "",
      description: item.description,
    }));

  return {
    headline: normalizeText(payload?.headline) || null,
    letters,
  };
}

function normalizeTraitDimensions(payload: Record<string, unknown> | null): PersonalityProjectionDimension[] {
  return asArray<Record<string, unknown>>(payload?.dimensions)
    .map((item) => {
      const id = normalizeText(item.id || item.code).toUpperCase();
      if (!id) {
        return null;
      }

      return {
        id,
        code: normalizeText(item.code) || null,
        name: normalizeText(item.name) || null,
        label: normalizeText(item.label) || null,
        axisLeft: normalizeText(item.axisLeft ?? item.axis_left) || null,
        axisRight: normalizeText(item.axisRight ?? item.axis_right) || null,
        summary: normalizeText(item.summary) || null,
        description: normalizeText(item.description) || null,
        scorePct: typeof item.scorePct === "number" ? item.scorePct : typeof item.score_pct === "number" ? item.score_pct : null,
        source: normalizeText(item.source) || null,
        side: normalizeText(item.side) || null,
        sideLabel: normalizeText(item.sideLabel ?? item.side_label) || null,
        pct: typeof item.pct === "number" ? item.pct : null,
        state: normalizeText(item.state) || null,
      } satisfies PersonalityProjectionDimension;
    })
    .filter((item): item is PersonalityProjectionDimension => item !== null);
}

function normalizePreferredRolePayload(payload: Record<string, unknown> | null): PreferredRolePayload {
  const groups = asArray<Record<string, unknown>>(payload?.groups).map((group) => ({
    groupTitle: normalizeText(group.groupTitle ?? group.group_title ?? group.title),
    description: normalizeText(group.description),
    examples: asArray<unknown>(group.examples)
      .map((example) => normalizeText(example))
      .filter(Boolean),
  }));

  if (groups.length > 0) {
    return {
      title: normalizeText(payload?.title) || null,
      intro: normalizeText(payload?.intro) || null,
      groups: groups.filter((group) => group.groupTitle || group.description || group.examples.length > 0),
    };
  }

  const items = asArray<Record<string, unknown>>(payload?.items)
    .map((item) => normalizeText(item.title ?? item.name))
    .filter(Boolean);

  return {
    title: normalizeText(payload?.title) || null,
    intro: normalizeText(payload?.intro) || null,
    groups: items.length > 0 ? [{ groupTitle: "", description: "", examples: items }] : [],
  };
}

function renderProjectionRichTextSection(section: RenderableProjectionSection) {
  return renderPlainMarkdown(section.bodyMd, "m-0 whitespace-pre-wrap leading-7 text-[var(--fm-text-muted)]");
}

function renderProjectionBulletsSection(section: RenderableProjectionSection) {
  const items = asArray<BulletItem>(section.payload?.items);
  const renderedItems = renderBulletItems(items);
  if (renderedItems) {
    return renderedItems;
  }

  if (!section.bodyMd.trim()) {
    return null;
  }

  const fallbackItems = section.bodyMd
    .split("\n")
    .map((item) => item.replace(/^[\-\*\d\.\s]+/, "").trim())
    .filter(Boolean)
    .map((item) => ({ title: item }));

  return renderBulletItems(fallbackItems);
}

function renderLettersIntroSection(section: RenderableProjectionSection, locale: Locale) {
  const payload = normalizeLettersIntroPayload(section.payload);

  return (
    <div className="space-y-4">
      {payload.headline ? <p className="m-0 leading-7 text-[var(--fm-text-muted)]">{payload.headline}</p> : null}
      {payload.letters.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {payload.letters.map((item, index) => (
            <article
              key={`${item.letter}-${index}`}
              className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--fm-accent)]/10 text-lg font-semibold text-[var(--fm-accent)]">
                  {item.letter}
                </div>
                <div className="space-y-1">
                  {item.title ? (
                    <p className="m-0 font-semibold text-[var(--fm-text)]">{stripZhTraitSuffix(item.title, locale)}</p>
                  ) : null}
                  {item.description ? <p className="m-0 text-[var(--fm-text-muted)]">{item.description}</p> : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        renderProjectionRichTextSection(section)
      )}
    </div>
  );
}

function renderTraitDimensionGridSection(section: RenderableProjectionSection, locale: Locale) {
  const payload = section.payload;
  const summary = normalizeText(payload?.summary);
  const dimensions = normalizeTraitDimensions(payload);

  if (dimensions.length === 0) {
    return renderProjectionRichTextSection(section);
  }

  return (
    <div className="space-y-4">
      {summary && locale !== "zh" ? <p className="m-0 leading-7 text-[var(--fm-text-muted)]">{summary}</p> : null}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {dimensions.map((dimension) => (
          <article
            key={dimension.id}
            className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="m-0 font-semibold text-[var(--fm-text)]">
                  {dimension.name || dimension.label || dimension.id}
                </p>
                <span className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--fm-accent)]">
                  {dimension.id}
                </span>
              </div>
              {(dimension.axisLeft || dimension.axisRight) && locale !== "zh" && (
                <p className="m-0 text-xs uppercase tracking-[0.12em] text-[var(--fm-text-muted)]">
                  {[dimension.axisLeft, dimension.axisRight].filter(Boolean).join(" / ")}
                </p>
              )}
              {dimension.summary ? <p className="m-0 font-medium text-[var(--fm-text)]">{dimension.summary}</p> : null}
              {dimension.description ? <p className="m-0 text-[var(--fm-text-muted)]">{dimension.description}</p> : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function renderPreferredRoleListSection(section: RenderableProjectionSection) {
  const payload = normalizePreferredRolePayload(section.payload);

  if (payload.groups.length === 0) {
    return renderProjectionRichTextSection(section);
  }

  return (
    <div className="space-y-4">
      {payload.title ? <p className="m-0 font-medium text-[var(--fm-text)]">{payload.title}</p> : null}
      {payload.intro ? <p className="m-0 leading-7 text-[var(--fm-text-muted)]">{payload.intro}</p> : null}
      <div className="grid gap-3 lg:grid-cols-2">
        {payload.groups.map((group, index) => (
          <article
            key={`${group.groupTitle || "roles"}-${index}`}
            className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4"
          >
            <div className="space-y-3">
              {group.groupTitle ? <p className="m-0 font-semibold text-[var(--fm-text)]">{group.groupTitle}</p> : null}
              {group.description ? <p className="m-0 text-[var(--fm-text-muted)]">{group.description}</p> : null}
              {group.examples.length > 0 ? (
                <ul className="m-0 space-y-2 pl-5 text-[var(--fm-text-muted)]">
                  {group.examples.map((example) => (
                    <li key={example}>
                      <span className="font-medium text-[var(--fm-text)]">{example}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function renderPremiumTeaserSection(section: RenderableProjectionSection) {
  const teaser = normalizeText(section.payload?.teaser ?? section.payload?.summary) || section.bodyMd;

  if (!teaser.trim()) {
    return null;
  }

  return (
    <div className="space-y-3 rounded-xl border border-dashed border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
      <p className="m-0 text-[var(--fm-text-muted)]">{teaser}</p>
    </div>
  );
}

export function getRenderablePersonalitySections(sections: CmsPersonalitySection[]): CmsPersonalitySection[] {
  return sections.filter((section) => isKnownSectionKey(section.sectionKey));
}

export function renderPersonalitySections(sections: CmsPersonalitySection[], locale: Locale): ReactNode[] {
  return getRenderablePersonalitySections(sections)
    .map((section) => {
      let content: ReactNode = null;

      switch (section.renderVariant) {
        case "bullets":
          content = renderLegacyBulletsSection(section);
          break;
        case "faq":
          content = renderLegacyFaqSection(section);
          break;
        case "cards":
        case "links":
          content = renderLegacyCardsSection(section, locale);
          break;
        case "callout":
        case "rich_text":
        default:
          content = renderRichTextBlock(section.bodyHtml, section.bodyMd);
          break;
      }

      if (!content) {
        return null;
      }

      return renderSectionCard(section.sectionKey, section.title, content);
    })
    .filter((section) => section !== null);
}

export function normalizeProjectionSections(
  sections: PersonalityProjectionSection[]
): RenderableProjectionSection[] {
  return sections
    .map((section) => {
      const render = normalizeText(section.render);
      if (!section.key || !isSupportedProjectionRender(render)) {
        return null;
      }

      return {
        key: section.key,
        title: normalizeText(section.title) || section.key,
        render,
        bodyMd: section.bodyMd,
        payload: section.payload,
        source: section.source,
      } satisfies RenderableProjectionSection;
    })
    .filter((section): section is RenderableProjectionSection => section !== null);
}

export function renderProjectionSections(
  sections: PersonalityProjectionSection[],
  locale: Locale
): ReactNode[] {
  return normalizeProjectionSections(sections)
    .map((section) => {
      let content: ReactNode = null;

      switch (section.render) {
        case "letters_intro":
          content = renderLettersIntroSection(section, locale);
          break;
        case "trait_dimension_grid":
          content = renderTraitDimensionGridSection(section, locale);
          break;
        case "preferred_role_list":
          content = renderPreferredRoleListSection(section);
          break;
        case "premium_teaser":
          content = renderPremiumTeaserSection(section);
          break;
        case "bullets":
          content = renderProjectionBulletsSection(section);
          break;
        case "rich_text":
        default:
          content = renderProjectionRichTextSection(section);
          break;
      }

      if (!content) {
        return null;
      }

      return renderSectionCard(section.key, section.title, content, locale);
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
