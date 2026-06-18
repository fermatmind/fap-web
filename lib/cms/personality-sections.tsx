import Link from "next/link";
import type { ReactNode } from "react";
import { SanitizedCmsHtml } from "@/components/content/SanitizedCmsHtml";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { renderSimpleMarkdown } from "@/lib/content/renderSimpleMarkdown";
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
  "quick_answer",
  "meaning",
  "a_t_difference",
  "core_traits",
  "strengths_blind_spots",
  "careers_work_style",
  "relationships_communication",
  "common_misreads",
  "similar_types",
  "side_by_side_summary",
  "core_traits_comparison",
  "stress_confidence",
  "career_work_style",
  "relationships_love",
  "which_one_fits",
  "mbti64_comparison_a_vs_t",
  "mbti64_promotion_metadata",
] as const;

const SUPPORTED_PROJECTION_RENDERS = [
  "rich_text",
  "bullets",
  "faq",
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
  anchor_text?: string;
  role?: string;
  safe_public_route?: boolean;
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

const FORBIDDEN_PUBLIC_CONTENT_ROUTE_RE =
  /(?:^|\/)(?:result|results|orders|share|pay|payment|history|private|account)(?:\/|$)|(?:[?&](?:token|session|user|result_id|report_id|order_no)=)/i;

const ALLOWED_PUBLIC_CONTENT_ROUTE_RE =
  /^\/(?:en|zh)\/(?:personality(?:\/[a-z0-9-]+)?|tests\/(?:mbti-personality-test-16-personality-types|big-five-personality-test-ocean-model|holland-career-interest-test-riasec))(?:#[A-Za-z0-9][\w:.-]{0,127})?$/;

function isSafePublicPersonalityHref(href: string | null): href is string {
  if (!href || FORBIDDEN_PUBLIC_CONTENT_ROUTE_RE.test(href)) {
    return false;
  }

  return ALLOWED_PUBLIC_CONTENT_ROUTE_RE.test(href);
}

const PROJECTION_SECTION_TITLE_COPY: Record<string, { zh: string; en: string }> = {
  quick_answer: { zh: "快速答案", en: "Quick answer" },
  meaning: { zh: "这个类型是什么意思", en: "What this type means" },
  a_t_difference: { zh: "A/T 差异", en: "A/T difference" },
  core_traits: { zh: "核心特征", en: "Core traits" },
  strengths_blind_spots: { zh: "优势与盲区", en: "Strengths and blind spots" },
  careers_work_style: { zh: "职业与工作风格", en: "Careers and work style" },
  relationships_communication: { zh: "关系与沟通", en: "Relationships and communication" },
  common_misreads: { zh: "常见误读", en: "Common misreads" },
  similar_types: { zh: "相近类型", en: "Similar types" },
  side_by_side_summary: { zh: "并排对比", en: "Side-by-side summary" },
  core_traits_comparison: { zh: "核心特征对比", en: "Core traits comparison" },
  stress_confidence: { zh: "压力与自信", en: "Stress and confidence" },
  career_work_style: { zh: "职业与工作风格", en: "Career and work style" },
  relationships_love: { zh: "关系与亲密关系", en: "Relationships and love" },
  which_one_fits: { zh: "哪个更像你", en: "Which one fits" },
  mbti64_comparison_a_vs_t: { zh: "A/T 对比", en: "A/T comparison" },
  mbti64_promotion_metadata: { zh: "方法边界", en: "Method boundary" },
  overview: { zh: "这个类型是什么", en: "What this type means" },
  letters_intro: { zh: "这个类型是什么", en: "What this type means" },
  trait_overview: { zh: "常见特征", en: "Common traits" },
  "career.summary": { zh: "职业倾向", en: "Career direction" },
  "career.advantages": { zh: "职业优势", en: "Career advantages" },
  "career.weaknesses": { zh: "职业风险", en: "Career weaknesses" },
  "career.preferred_roles": { zh: "适合工作", en: "Best-fit work" },
  "career.upgrade_suggestions": { zh: "职业升级建议", en: "Career upgrade suggestions" },
  "growth.summary": { zh: "成长总览", en: "Growth summary" },
  "growth.strengths": { zh: "优势", en: "Strengths" },
  "growth.weaknesses": { zh: "弱点", en: "Weak spots" },
  "growth.motivators": { zh: "成长动力", en: "Growth motivators" },
  "growth.drainers": { zh: "能量消耗", en: "Growth drainers" },
  "relationships.summary": { zh: "爱情 / 关系", en: "Relationships" },
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
        <h2 className="m-0 text-xl font-semibold leading-tight tracking-tight text-[var(--fm-text)]">{displayTitle}</h2>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">{content}</CardContent>
    </Card>
  );
}

function renderPlainMarkdown(body: string, className: string, locale: Locale) {
  if (!body.trim()) {
    return null;
  }

  return <div className={className}>{renderSimpleMarkdown(body, { locale, minimumHeadingLevel: 3 })}</div>;
}

function renderRichTextBlock(bodyHtml: string, bodyMd: string, locale: Locale) {
  if (bodyHtml.trim()) {
    return (
      <SanitizedCmsHtml
        className="space-y-4 text-[var(--fm-text)] [&_a]:text-[var(--fm-accent)] [&_a]:underline-offset-2 [&_a:hover]:underline [&_p]:leading-7 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5"
        html={bodyHtml}
        locale={locale}
      />
    );
  }

  return renderPlainMarkdown(bodyMd, "space-y-4 leading-7 text-[var(--fm-text-muted)]", locale);
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

function renderLegacyFaqSection(section: CmsPersonalitySection, locale: Locale) {
  const payload = asRecord(section.payloadJson);
  const items = asArray<FaqItem>(payload?.items);

  if (items.length === 0) {
    return renderRichTextBlock(section.bodyHtml, section.bodyMd, locale);
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
      const title = normalizeText(item.title || item.anchor_text);
      const summary = normalizeText(item.summary ?? item.body);
      const href = normalizeInternalHref(item.href);
      const slug = normalizeText(item.slug);
      const safePublicRoute = item.safe_public_route;

      if (!title) {
        return null;
      }

      if (safePublicRoute === false) {
        return null;
      }

      if (href && isSafePublicPersonalityHref(href)) {
        return { title, href, summary };
      }

      if (normalizeText(item.href)) {
        return null;
      }

      if (slug) {
        const personalityHref = buildPersonalityFrontendUrl(locale, slug);
        return isSafePublicPersonalityHref(personalityHref)
          ? { title, href: personalityHref, summary }
          : null;
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
  const items = normalizeLinkItems(
    [...asArray<LinkItem>(payload?.items), ...asArray<LinkItem>(payload?.links)],
    locale
  );
  const renderedCards = renderGenericCards(items);

  if (renderedCards) {
    return renderedCards;
  }

  return renderRichTextBlock(section.bodyHtml, section.bodyMd, locale);
}

function renderSafeInternalLinks(items: LinkItem[], locale: Locale) {
  const links = normalizeLinkItems(items, locale).filter((item) => item.href);

  if (links.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3" data-testid="mbti64-safe-internal-links">
      <h3 className="m-0 text-base font-semibold text-[var(--fm-text)]">
        {locale === "zh" ? "继续浏览" : "Continue reading"}
      </h3>
      {renderGenericCards(links)}
    </div>
  );
}

function renderBoundaryCallouts(payload: Record<string, unknown> | null, locale: Locale) {
  const rawRow = asRecord(payload?.raw_row);
  const structuredMetadata = asRecord(payload?.structured_metadata);
  const methodBoundary = normalizeText(rawRow?.method_boundary ?? structuredMetadata?.method_boundary);
  const trademarkBoundary = normalizeText(rawRow?.trademark_boundary ?? structuredMetadata?.trademark_boundary);
  const items = [
    methodBoundary
      ? {
          key: "method-boundary",
          title: locale === "zh" ? "方法边界" : "Method boundary",
          body: methodBoundary,
        }
      : null,
    trademarkBoundary
      ? {
          key: "trademark-boundary",
          title: locale === "zh" ? "商标与体系边界" : "Trademark and framework boundary",
          body: trademarkBoundary,
        }
      : null,
  ].filter((item): item is { key: string; title: string; body: string } => item !== null);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <aside
          key={item.key}
          id={item.key}
          className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4"
          data-testid={`mbti64-${item.key}`}
        >
          <h3 className="m-0 text-base font-semibold text-[var(--fm-text)]">{item.title}</h3>
          <p className="mb-0 mt-2 leading-7 text-[var(--fm-text-muted)]">{item.body}</p>
        </aside>
      ))}
    </div>
  );
}

function contentBodyFromValue(value: unknown): string {
  if (typeof value === "string") {
    return normalizeText(value);
  }

  const record = asRecord(value);
  if (!record) {
    return "";
  }

  return normalizeText(record.body ?? record.summary ?? record.text ?? record.answer);
}

function contentTitleFromValue(key: string, value: unknown, locale: Locale): string {
  const record = asRecord(value);
  return normalizeText(record?.h2 ?? record?.title) || projectionSectionTitle(key, key, locale);
}

function renderSideBySideRows(value: unknown) {
  const record = asRecord(value);
  const rows = asArray<Record<string, unknown>>(record?.rows)
    .map((row) => ({
      dimension: normalizeText(row.dimension),
      assertive: normalizeText(row.a_variant ?? row.assertive ?? row.a),
      turbulent: normalizeText(row.t_variant ?? row.turbulent ?? row.t),
    }))
    .filter((row) => row.dimension || row.assertive || row.turbulent);

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-3">
      {rows.map((row, index) => (
        <article
          key={`${row.dimension || "row"}-${index}`}
          className="grid gap-3 rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4 md:grid-cols-[0.8fr_1fr_1fr]"
        >
          <p className="m-0 font-semibold text-[var(--fm-text)]">{row.dimension}</p>
          {row.assertive ? <p className="m-0 text-[var(--fm-text-muted)]">{row.assertive}</p> : null}
          {row.turbulent ? <p className="m-0 text-[var(--fm-text-muted)]">{row.turbulent}</p> : null}
        </article>
      ))}
    </div>
  );
}

function renderMbti64ContentEntries(content: Record<string, unknown>, locale: Locale) {
  return Object.entries(content)
    .map(([key, value]) => {
      const sideBySide = renderSideBySideRows(value);
      const body = contentBodyFromValue(value);

      if (!sideBySide && !body) {
        return null;
      }

      return (
        <section key={key} id={key} className="space-y-3" data-testid={`mbti64-content-section-${key}`}>
          <h3 className="m-0 text-base font-semibold text-[var(--fm-text)]">
            {contentTitleFromValue(key, value, locale)}
          </h3>
          {sideBySide ?? <div className="space-y-4 leading-7 text-[var(--fm-text-muted)]">{renderSimpleMarkdown(body, { locale, minimumHeadingLevel: 4 })}</div>}
        </section>
      );
    })
    .filter((item) => item !== null);
}

function renderMbti64ComparisonSection(section: CmsPersonalitySection, locale: Locale) {
  const payload = asRecord(section.payloadJson);
  const content = asRecord(payload?.content);
  const faq = asArray<FaqItem>(payload?.faq);
  const internalLinks = asArray<LinkItem>(payload?.internal_links);
  const contentEntries = content ? renderMbti64ContentEntries(content, locale) : [];
  const renderedFaq = faq.length
    ? renderLegacyFaqSection(
        {
          ...section,
          sectionKey: "faq",
          renderVariant: "faq",
          bodyMd: "",
          bodyHtml: "",
          payloadJson: { items: faq },
        },
        locale
      )
    : null;
  const renderedLinks = renderSafeInternalLinks(internalLinks, locale);
  const renderedBoundaries = renderBoundaryCallouts(payload, locale);

  if (contentEntries.length === 0 && !renderedFaq && !renderedLinks && !renderedBoundaries) {
    return renderRichTextBlock(section.bodyHtml, section.bodyMd, locale);
  }

  return (
    <div className="space-y-5">
      {contentEntries}
      {renderedFaq ? (
        <section id="faq" className="space-y-3" data-testid="mbti64-visible-faq">
          <h3 className="m-0 text-base font-semibold text-[var(--fm-text)]">
            {locale === "zh" ? "常见问题" : "FAQ"}
          </h3>
          {renderedFaq}
        </section>
      ) : null}
      {renderedLinks}
      {renderedBoundaries}
    </div>
  );
}

function renderMbti64PromotionMetadataSection(section: CmsPersonalitySection, locale: Locale) {
  const payload = asRecord(section.payloadJson);
  const renderedBoundaries = renderBoundaryCallouts(payload, locale);
  const rawRow = asRecord(payload?.raw_row);
  const renderedLinks = renderSafeInternalLinks(asArray<LinkItem>(rawRow?.internal_links), locale);

  if (!renderedBoundaries && !renderedLinks) {
    return null;
  }

  return (
    <div className="space-y-4">
      {renderedBoundaries}
      {renderedLinks}
    </div>
  );
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

function renderProjectionRichTextSection(section: RenderableProjectionSection, locale: Locale) {
  return renderPlainMarkdown(section.bodyMd, "space-y-4 leading-7 text-[var(--fm-text-muted)]", locale);
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

function renderProjectionFaqSection(section: RenderableProjectionSection, locale: Locale) {
  const items = asArray<FaqItem>(section.payload?.items)
    .map((item) => ({
      question: normalizeText(item.question),
      answer: normalizeText(item.answer),
    }))
    .filter((item) => item.question && item.answer);

  if (items.length === 0) {
    return renderProjectionRichTextSection(section, locale);
  }

  return (
    <dl className="m-0 space-y-4">
      {items.map((item, index) => (
        <div key={`${item.question}-${index}`} className="space-y-1">
          <dt className="font-medium text-[var(--fm-text)]">{item.question}</dt>
          <dd className="m-0 text-[var(--fm-text-muted)]">{item.answer}</dd>
        </div>
      ))}
    </dl>
  );
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
        renderProjectionRichTextSection(section, locale)
      )}
    </div>
  );
}

function renderTraitDimensionGridSection(section: RenderableProjectionSection, locale: Locale) {
  const payload = section.payload;
  const summary = normalizeText(payload?.summary);
  const dimensions = normalizeTraitDimensions(payload);

  if (dimensions.length === 0) {
    return renderProjectionRichTextSection(section, locale);
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

function renderPreferredRoleListSection(section: RenderableProjectionSection, locale: Locale) {
  const payload = normalizePreferredRolePayload(section.payload);

  if (payload.groups.length === 0) {
    return renderProjectionRichTextSection(section, locale);
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

      switch (section.sectionKey) {
        case "mbti64_comparison_a_vs_t":
          content = renderMbti64ComparisonSection(section, locale);
          break;
        case "mbti64_promotion_metadata":
          content = renderMbti64PromotionMetadataSection(section, locale);
          break;
        default:
          switch (section.renderVariant) {
            case "bullets":
              content = renderLegacyBulletsSection(section);
              break;
            case "faq":
              content = renderLegacyFaqSection(section, locale);
              break;
            case "cards":
            case "links":
              content = renderLegacyCardsSection(section, locale);
              break;
            case "callout":
            case "rich_text":
            default:
              content = renderRichTextBlock(section.bodyHtml, section.bodyMd, locale);
              break;
          }
      }

      if (!content) {
        return null;
      }

      return renderSectionCard(section.sectionKey, section.title, content, locale);
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
          content = renderPreferredRoleListSection(section, locale);
          break;
        case "premium_teaser":
          content = renderPremiumTeaserSection(section);
          break;
        case "bullets":
          content = renderProjectionBulletsSection(section);
          break;
        case "faq":
          content = renderProjectionFaqSection(section, locale);
          break;
        case "rich_text":
        default:
          content = renderProjectionRichTextSection(section, locale);
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
  return normalizeLinkItems(
    [...asArray<LinkItem>(payload?.items), ...asArray<LinkItem>(payload?.links), ...asArray<LinkItem>(payload?.internal_links)],
    locale
  );
}

export function extractPersonalityFaqItems(sections: CmsPersonalitySection[]): FAQItem[] {
  return getRenderablePersonalitySections(sections)
    .flatMap((section) => {
      const payload = asRecord(section.payloadJson);
      const items =
        section.sectionKey === "mbti64_comparison_a_vs_t"
          ? asArray<FaqItem>(payload?.faq)
          : section.sectionKey === "faq"
            ? asArray<FaqItem>(payload?.items)
            : [];

      return items
        .map((item) => ({
          question: normalizeText(item.question),
          answer: normalizeText(item.answer),
        }))
        .filter((item) => item.question && item.answer);
    });
}

export function extractProjectionFaqItems(sections: PersonalityProjectionSection[]): FAQItem[] {
  return normalizeProjectionSections(sections)
    .filter((section) => section.key === "faq" && section.render === "faq")
    .flatMap((section) => {
      const items = asArray<FaqItem>(section.payload?.items);

      return items
        .map((item) => ({
          question: normalizeText(item.question),
          answer: normalizeText(item.answer),
        }))
        .filter((item) => item.question && item.answer);
    });
}

export { KNOWN_SECTION_KEYS };
