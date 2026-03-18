"use client";

import type { ReactNode } from "react";
import { SectionRenderer } from "@/components/big5/report/SectionRenderer";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReportIdentityLayer } from "@/lib/api/v0_3";
import type { Locale } from "@/lib/i18n/locales";
import type { MbtiSectionUnlock, ReportBlock, ReportSection } from "@/components/result/RichResultReport";
import type { TraitBridgeItem } from "@/components/result/mbti/MbtiDominantTraitsSection";
import type {
  MbtiPublicProjectionDimensionViewModel,
  MbtiResultProjectionSectionViewModel,
} from "@/lib/mbti/publicProjection";

type ChapterKey = "career" | "growth" | "traits" | "relationships";

type ChapterBridgeItem = {
  title: string;
  description: string;
};

type BulletItem = {
  title?: string;
  body?: string | null;
  description?: string | null;
  summary?: string | null;
};

type LettersIntroLetter = {
  letter: string;
  title: string;
  description: string;
};

type PreferredRoleGroup = {
  groupTitle: string;
  description: string;
  examples: string[];
};

type MbtiChapterSectionProps = {
  locale: Locale;
  chapterKey: ChapterKey;
  legacySection?: ReportSection | null;
  projectionSections: MbtiResultProjectionSectionViewModel[];
  projectionDimensions: MbtiPublicProjectionDimensionViewModel[];
  globalTraits: TraitBridgeItem[];
  unlock: MbtiSectionUnlock | null;
  identityLayer?: ReportIdentityLayer | null;
};

const CHAPTER_COPY: Record<
  ChapterKey,
  {
    anchor: string;
    title: { en: string; zh: string };
    intro: { en: string; zh: string };
  }
> = {
  career: {
    anchor: "career",
    title: { en: "Career path", zh: "职业路径" },
    intro: {
      en: "This chapter turns the result into role fit, work rhythm, and the environments where you are more likely to do strong work.",
      zh: "这一章把结果翻译成更具体的岗位方向、协作节奏与更适合你的工作环境。",
    },
  },
  growth: {
    anchor: "growth",
    title: { en: "Growth edges", zh: "成长提示" },
    intro: {
      en: "Growth is framed as leverage, friction, and the next repeatable step instead of abstract advice.",
      zh: "这一章不讲空泛建议，而是把你的成长重点拆成杠杆、阻力和下一步动作。",
    },
  },
  traits: {
    anchor: "overview",
    title: { en: "Personality overview", zh: "人格概览" },
    intro: {
      en: "Read this chapter as the structural overview of how your current type tends to show up in everyday situations.",
      zh: "把这一章看作整份报告的总览层，用来理解你的类型在日常场景里通常会怎么出现。",
    },
  },
  relationships: {
    anchor: "relationships",
    title: { en: "Relationships", zh: "人际与亲密关系" },
    intro: {
      en: "This chapter connects the result to communication needs, boundaries, and the moments where misunderstanding is most likely.",
      zh: "这一章把结果落到沟通需求、边界感和最容易出现误解的相处场景上。",
    },
  },
};

function normalizeText(...values: unknown[]): string {
  for (const value of values) {
    const normalized = String(value ?? "").trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
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

function resolveBody(block: ReportBlock): string {
  const bullets = Array.isArray(block.bullets) ? block.bullets.filter((item): item is string => Boolean(item)) : [];
  return normalizeText(block.body, bullets[0]);
}

function normalizeStringArray(values: unknown): string[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return Array.from(new Set(values.map((value) => normalizeText(value)).filter(Boolean)));
}

function toProjectionSectionTestId(key: string): string {
  return key.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
}

function parseIdentityBullet(
  bullet: string,
  locale: Locale,
  index: number
): ChapterBridgeItem | null {
  const normalized = normalizeText(bullet);
  if (!normalized) {
    return null;
  }

  const separatorIndex = normalized.search(/[:：]/);
  const candidateTitle =
    separatorIndex > 0 && separatorIndex < 12 ? normalizeText(normalized.slice(0, separatorIndex)) : "";
  const candidateDescription =
    separatorIndex > 0 && separatorIndex < normalized.length - 1
      ? normalizeText(normalized.slice(separatorIndex + 1))
      : "";

  return {
    title: candidateTitle || (locale === "zh" ? `人格线索 ${index + 1}` : `Identity cue ${index + 1}`),
    description: candidateDescription || normalized,
  };
}

function buildBridgeItems(
  chapterKey: ChapterKey,
  legacySection: ReportSection | null,
  unlock: MbtiSectionUnlock | null,
  globalTraits: TraitBridgeItem[],
  locale: Locale,
  identityLayer?: ReportIdentityLayer | null
): ChapterBridgeItem[] {
  const items: ChapterBridgeItem[] = [];
  const seen = new Set<string>();
  const blocks = Array.isArray(legacySection?.blocks) ? legacySection.blocks : [];

  const pushItem = (item: ChapterBridgeItem | null) => {
    if (!item?.title || !item.description) {
      return;
    }

    const key = `${item.title.toLowerCase()}::${item.description.toLowerCase()}`;
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    items.push(item);
  };

  if (chapterKey === "traits" && identityLayer) {
    for (const [index, bullet] of normalizeStringArray(identityLayer.bullets).entries()) {
      pushItem(parseIdentityBullet(bullet, locale, index));
      if (items.length >= 4) {
        return items.slice(0, 4);
      }
    }
  }

  for (const block of blocks) {
    const accessLevel = normalizeText(block.access_level).toLowerCase();
    if (accessLevel === "paid") {
      continue;
    }

    pushItem({
      title: normalizeText(block.title),
      description: resolveBody(block),
    });

    if (items.length >= 4) {
      return items.slice(0, 4);
    }
  }

  for (const benefit of unlock?.benefits ?? []) {
    pushItem({
      title: locale === "zh" ? "解锁后重点" : "Unlock focus",
      description: normalizeText(benefit),
    });

    if (items.length >= 4) {
      return items.slice(0, 4);
    }
  }

  for (const trait of globalTraits) {
    pushItem({
      title: trait.title,
      description: trait.description,
    });

    if (items.length >= 4) {
      return items.slice(0, 4);
    }
  }

  return items.slice(0, 4);
}

function renderPlainMarkdown(body: string) {
  if (!body.trim()) {
    return null;
  }

  return <p className="m-0 whitespace-pre-wrap leading-7 text-slate-700">{body}</p>;
}

function renderBulletItems(items: BulletItem[]) {
  const visibleItems = items
    .map((item) => ({
      title: normalizeText(item.title),
      body: normalizeText(item.body ?? item.description ?? item.summary),
    }))
    .filter((item) => item.title || item.body);

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <ul className="m-0 space-y-2 pl-5 text-sm leading-7 text-slate-700">
      {visibleItems.map((item, index) => {
        const label = item.title || item.body;
        if (!label) {
          return null;
        }

        return (
          <li key={`${label}-${index}`}>
            <span className="font-semibold text-slate-900">{item.title || label}</span>
            {item.body && item.body !== item.title ? <span className="text-slate-600"> - {item.body}</span> : null}
          </li>
        );
      })}
    </ul>
  );
}

function renderProjectionBulletsSection(section: MbtiResultProjectionSectionViewModel) {
  const payload = asRecord(section.payload);
  const items = asArray<BulletItem>(payload?.items);
  const bulletItems = renderBulletItems(items);
  if (bulletItems) {
    return bulletItems;
  }

  const fallbackItems = [
    ...normalizeStringArray(payload?.bullets).map((item) => ({ title: item })),
    ...section.bodyMd
      .split("\n")
      .map((item) => item.replace(/^[\-\*\d\.\s]+/, "").trim())
      .filter(Boolean)
      .map((item) => ({ title: item })),
  ];

  return renderBulletItems(fallbackItems);
}

function renderLettersIntroSection(section: MbtiResultProjectionSectionViewModel) {
  const payload = asRecord(section.payload);
  const headline = normalizeText(payload?.headline, section.bodyMd);
  const letters = asArray<Record<string, unknown>>(payload?.letters)
    .map((item) => ({
      letter: normalizeText(item.letter) || "?",
      title: normalizeText(item.title, item.letter),
      description: normalizeText(item.description),
    }))
    .filter((item) => item.title || item.description) as LettersIntroLetter[];

  if (letters.length === 0) {
    return renderPlainMarkdown(section.bodyMd);
  }

  return (
    <div className="space-y-4">
      {headline ? <p className="m-0 leading-7 text-slate-700">{headline}</p> : null}
      <div className="grid gap-3 md:grid-cols-2">
        {letters.map((item, index) => (
          <article
            key={`${item.letter}-${index}`}
            className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg font-semibold text-emerald-700">
                {item.letter}
              </div>
              <div className="space-y-1">
                {item.title ? <p className="m-0 font-semibold text-slate-900">{item.title}</p> : null}
                {item.description ? <p className="m-0 text-sm leading-7 text-slate-600">{item.description}</p> : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function normalizeFallbackTraitDimensions(
  payload: Record<string, unknown> | null
): MbtiPublicProjectionDimensionViewModel[] {
  return asArray<Record<string, unknown>>(payload?.dimensions)
    .map((item) => ({
      code: normalizeText(item.code, item.id).toUpperCase(),
      label: normalizeText(item.label, item.name, item.id, item.code),
      percent:
        typeof item.pct === "number"
          ? item.pct
          : typeof item.score_pct === "number"
            ? item.score_pct
            : typeof item.value_pct === "number"
              ? item.value_pct
              : 0,
      side: normalizeText(item.side),
      sideLabel: normalizeText(item.side_label, item.sideLabel),
      state: normalizeText(item.state),
      summary: normalizeText(item.summary, item.description),
    }))
    .filter((item) => item.code || item.label);
}

function renderTraitDimensionGridSection(
  section: MbtiResultProjectionSectionViewModel,
  projectionDimensions: MbtiPublicProjectionDimensionViewModel[]
) {
  const payload = asRecord(section.payload);
  const summary = normalizeText(payload?.summary, section.bodyMd);
  const dimensions = projectionDimensions.length > 0
    ? projectionDimensions
    : normalizeFallbackTraitDimensions(payload);

  if (dimensions.length === 0) {
    return renderPlainMarkdown(section.bodyMd);
  }

  return (
    <div className="space-y-4">
      {summary ? <p className="m-0 leading-7 text-slate-700">{summary}</p> : null}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {dimensions.map((dimension) => (
          <article
            key={dimension.code}
            className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="m-0 font-semibold text-slate-900">{dimension.label || dimension.code}</p>
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                  {dimension.code}
                </span>
              </div>
              {dimension.sideLabel ? (
                <p className="m-0 text-xs uppercase tracking-[0.12em] text-slate-500">{dimension.sideLabel}</p>
              ) : null}
              {dimension.summary ? <p className="m-0 text-sm leading-7 text-slate-700">{dimension.summary}</p> : null}
              {typeof dimension.percent === "number" ? (
                <p className="m-0 text-sm font-medium text-slate-900">{Math.round(dimension.percent)}%</p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function renderPreferredRoleListSection(section: MbtiResultProjectionSectionViewModel) {
  const payload = asRecord(section.payload);
  const groups = asArray<Record<string, unknown>>(payload?.groups)
    .map((group) => ({
      groupTitle: normalizeText(group.groupTitle, group.group_title, group.title),
      description: normalizeText(group.description),
      examples: normalizeStringArray(group.examples),
    }))
    .filter((group) => group.groupTitle || group.description || group.examples.length > 0) as PreferredRoleGroup[];

  const fallbackExamples = asArray<Record<string, unknown>>(payload?.items)
    .map((item) => normalizeText(item.title, item.name))
    .filter(Boolean);
  const visibleGroups = groups.length > 0
    ? groups
    : fallbackExamples.length > 0
      ? [{ groupTitle: "", description: "", examples: fallbackExamples }]
      : [];

  if (visibleGroups.length === 0) {
    return renderPlainMarkdown(section.bodyMd);
  }

  return (
    <div className="space-y-4">
      {normalizeText(payload?.title) ? <p className="m-0 font-medium text-slate-900">{normalizeText(payload?.title)}</p> : null}
      {normalizeText(payload?.intro) ? <p className="m-0 leading-7 text-slate-700">{normalizeText(payload?.intro)}</p> : null}
      <div className="grid gap-3 lg:grid-cols-2">
        {visibleGroups.map((group, index) => (
          <article
            key={`${group.groupTitle || "roles"}-${index}`}
            className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4"
          >
            <div className="space-y-3">
              {group.groupTitle ? <p className="m-0 font-semibold text-slate-900">{group.groupTitle}</p> : null}
              {group.description ? <p className="m-0 text-sm leading-7 text-slate-600">{group.description}</p> : null}
              {group.examples.length > 0 ? (
                <ul className="m-0 space-y-2 pl-5 text-sm leading-7 text-slate-700">
                  {group.examples.map((example) => (
                    <li key={example}>
                      <span className="font-medium text-slate-900">{example}</span>
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

function renderPremiumTeaserSection(
  section: MbtiResultProjectionSectionViewModel,
  locale: Locale
) {
  const payload = asRecord(section.payload);
  const teaser = normalizeText(payload?.teaser, payload?.summary, section.bodyMd);
  if (!teaser) {
    return null;
  }

  return (
    <div className="space-y-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/90 p-4">
      <p className="m-0 text-sm leading-7 text-slate-700">{teaser}</p>
      <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
        {locale === "zh" ? "正式版预告" : "Premium section preview"}
      </p>
      <p className="m-0 text-sm text-slate-600">
        {locale === "zh" ? "完整章节会在正式解锁后开放。" : "Unlock the full section in the premium experience."}
      </p>
    </div>
  );
}

function renderProjectionSection(
  section: MbtiResultProjectionSectionViewModel,
  locale: Locale,
  projectionDimensions: MbtiPublicProjectionDimensionViewModel[]
) {
  let content: ReactNode = null;

  switch (section.render) {
    case "letters_intro":
      content = renderLettersIntroSection(section);
      break;
    case "trait_dimension_grid":
      content = renderTraitDimensionGridSection(section, projectionDimensions);
      break;
    case "preferred_role_list":
      content = renderPreferredRoleListSection(section);
      break;
    case "premium_teaser":
      content = renderPremiumTeaserSection(section, locale);
      break;
    case "bullets":
      content = renderProjectionBulletsSection(section);
      break;
    case "rich_text":
    default:
      content = renderPlainMarkdown(section.bodyMd);
      break;
  }

  if (!content) {
    return null;
  }

  return (
    <article
      key={section.key}
      data-testid={`mbti-projection-section-${toProjectionSectionTestId(section.key)}`}
      className="space-y-3 rounded-[24px] border border-slate-200 bg-white/95 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]"
    >
      <h3 className="m-0 text-lg font-semibold text-slate-900">{section.title}</h3>
      {content}
    </article>
  );
}

export function MbtiChapterSection({
  locale,
  chapterKey,
  legacySection,
  projectionSections,
  projectionDimensions,
  globalTraits,
  unlock,
  identityLayer,
}: MbtiChapterSectionProps) {
  const copy = CHAPTER_COPY[chapterKey];
  const isOverviewChapter = chapterKey === "traits";
  const authoredOverview = isOverviewChapter && identityLayer
    ? {
        title: normalizeText(identityLayer.title),
        subtitle: normalizeText(identityLayer.subtitle),
        oneLiner: normalizeText(identityLayer.one_liner),
        bullets: normalizeStringArray(identityLayer.bullets),
      }
    : null;
  const bridgeItems = buildBridgeItems(chapterKey, legacySection ?? null, unlock, globalTraits, locale, identityLayer);
  const hasProjectionContent = projectionSections.length > 0;
  const hasLegacyPublicContent = Array.isArray(legacySection?.blocks) && legacySection.blocks.length > 0;
  const isLocked = normalizeText(legacySection?.access_level).toLowerCase() === "paid";
  const bridgeTitle = chapterKey === "traits"
    ? locale === "zh"
      ? "主导特质"
      : "Dominant traits"
    : locale === "zh"
      ? "关键特质"
      : "Key traits";
  const introCopy = isOverviewChapter
    ? normalizeText(authoredOverview?.subtitle, authoredOverview?.oneLiner, copy.intro[locale])
    : copy.intro[locale];
  const teaserText = isOverviewChapter
    ? normalizeText(authoredOverview?.oneLiner, authoredOverview?.subtitle, unlock?.teaser)
    : normalizeText(unlock?.teaser);
  const teaserBullets =
    isOverviewChapter && (authoredOverview?.bullets.length ?? 0) > 0
      ? authoredOverview?.bullets ?? []
      : unlock?.benefits ?? [];

  return (
    <section
      id={copy.anchor}
      data-testid={`mbti-chapter-${copy.anchor}`}
      className="scroll-mt-28 space-y-5 rounded-[28px] border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)] md:p-6"
    >
      <header className="space-y-3">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
          {locale === "zh" ? "章节" : "Chapter"}
        </p>
        <div className="space-y-2">
          <h2 className="m-0 text-2xl font-semibold tracking-tight text-[var(--fm-text)]">{copy.title[locale]}</h2>
          <p className="m-0 max-w-3xl text-sm leading-7 text-[var(--fm-text-muted)]">{introCopy}</p>
        </div>
      </header>

      {isOverviewChapter && authoredOverview && (authoredOverview.title || authoredOverview.subtitle || authoredOverview.oneLiner) ? (
        <Card
          data-testid="mbti-overview-authored-intro"
          className="border-slate-200 bg-[var(--fm-surface-muted)]/70 shadow-none"
        >
          <CardContent className="space-y-3 p-5">
            {authoredOverview.title ? (
              <p className="m-0 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
                {authoredOverview.title}
              </p>
            ) : null}
            {authoredOverview.subtitle ? (
              <p className="m-0 text-lg font-semibold text-slate-900">{authoredOverview.subtitle}</p>
            ) : null}
            {authoredOverview.oneLiner ? (
              <p className="m-0 text-sm leading-7 text-slate-600">{authoredOverview.oneLiner}</p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-slate-200 bg-[var(--fm-surface-muted)]/70 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-slate-900">{bridgeTitle}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {bridgeItems.map((item) => (
            <div
              key={`${item.title}-${item.description}`}
              className="rounded-2xl border border-white/90 bg-white/95 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
            >
              <p className="m-0 text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="m-0 mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {hasProjectionContent ? (
        <div
          data-testid={`mbti-chapter-public-${copy.anchor}`}
          className="space-y-4"
        >
          {projectionSections.map((section) => renderProjectionSection(section, locale, projectionDimensions))}
        </div>
      ) : hasLegacyPublicContent && legacySection ? (
        <div
          data-testid={`mbti-chapter-public-${copy.anchor}`}
          className="rounded-[24px] border border-slate-200 bg-white/85 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] [&_section]:space-y-3 [&_section>h3]:sr-only [&_section>div]:space-y-3"
        >
          <SectionRenderer section={legacySection} locked={false} locale={locale} scaleCode="MBTI" />
        </div>
      ) : null}

      {isLocked ? (
        <div className="rounded-[24px] border border-dashed border-[var(--fm-border-strong)] bg-[var(--fm-surface-muted)]/55 p-5">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
            {locale === "zh" ? "章节预告" : "Chapter teaser"}
          </p>
          <p className="m-0 mt-3 text-base font-semibold text-slate-900">
            {teaserText || (locale === "zh" ? "解锁后可查看这一章的完整解读。" : "Unlock to view the full reading for this chapter.")}
          </p>
          {teaserBullets.length > 0 ? (
            <ul className="mb-0 mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
              {teaserBullets.map((benefit) => <li key={benefit}>{benefit}</li>)}
            </ul>
          ) : null}
        </div>
      ) : null}

      {isLocked ? (
        <Card data-testid="mbti-chapter-unlock-card" className="border-slate-200 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
          <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
                {locale === "zh" ? "解锁完整报告" : "Unlock full report"}
              </p>
              <p className="m-0 text-lg font-semibold text-slate-900">
                {unlock?.offer?.title ?? (locale === "zh" ? "查看完整报告解锁方案" : "View the matching unlock options")}
              </p>
              <p className="m-0 text-sm leading-7 text-slate-600">
                {unlock?.offer?.description ?? (locale === "zh"
                  ? "本章只保留公开部分；解锁方案会集中展示在页中方案区。"
                  : "Only the public slice stays here; the matching unlock options are collected in the offers section below.")}
              </p>
              {unlock?.offer?.modules.length ? (
                <div className="flex flex-wrap gap-2">
                  {unlock.offer.modules.map((module) => (
                    <span key={module} className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
                      {module}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="flex min-w-fit flex-col items-start gap-3 md:items-end">
              {unlock?.offer?.price ? <p className="m-0 text-2xl font-bold tracking-tight text-slate-950">{unlock.offer.price}</p> : null}
              <a href="#offer-full" className={buttonVariants({ variant: "outline" })}>
                {locale === "zh" ? "解锁完整报告" : "Unlock full report"}
              </a>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}
