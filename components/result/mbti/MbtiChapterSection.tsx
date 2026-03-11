"use client";

import { SectionRenderer } from "@/components/big5/report/SectionRenderer";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Locale } from "@/lib/i18n/locales";
import type { MbtiSectionUnlock, ReportBlock, ReportSection } from "@/components/result/RichResultReport";
import type { TraitBridgeItem } from "@/components/result/mbti/MbtiDominantTraitsSection";

type ChapterKey = "career" | "growth" | "traits" | "relationships";

type ChapterBridgeItem = {
  title: string;
  description: string;
};

type MbtiChapterSectionProps = {
  locale: Locale;
  chapterKey: ChapterKey;
  section: ReportSection;
  globalTraits: TraitBridgeItem[];
  unlock: MbtiSectionUnlock | null;
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

function resolveBody(block: ReportBlock): string {
  const bullets = Array.isArray(block.bullets) ? block.bullets.filter((item): item is string => Boolean(item)) : [];
  return normalizeText(block.body, bullets[0]);
}

function buildBridgeItems(
  section: ReportSection,
  unlock: MbtiSectionUnlock | null,
  globalTraits: TraitBridgeItem[],
  locale: Locale
): ChapterBridgeItem[] {
  const items: ChapterBridgeItem[] = [];
  const seen = new Set<string>();
  const blocks = Array.isArray(section.blocks) ? section.blocks : [];

  const pushItem = (item: ChapterBridgeItem | null) => {
    if (!item) return;
    if (!item.title || !item.description) return;
    const key = `${item.title.toLowerCase()}::${item.description.toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    items.push(item);
  };

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

export function MbtiChapterSection({
  locale,
  chapterKey,
  section,
  globalTraits,
  unlock,
}: MbtiChapterSectionProps) {
  const copy = CHAPTER_COPY[chapterKey];
  const bridgeItems = buildBridgeItems(section, unlock, globalTraits, locale);
  const hasPublicContent = Array.isArray(section.blocks) && section.blocks.length > 0;
  const isLocked = normalizeText(section.access_level).toLowerCase() === "paid";
  const bridgeTitle = chapterKey === "traits" ? (locale === "zh" ? "主导特质" : "Dominant traits") : locale === "zh" ? "关键特质" : "Key traits";

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
          <p className="m-0 max-w-3xl text-sm leading-7 text-[var(--fm-text-muted)]">{copy.intro[locale]}</p>
        </div>
      </header>

      <Card className="border-slate-200 bg-[var(--fm-surface-muted)]/70 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-slate-900">{bridgeTitle}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {bridgeItems.map((item) => (
            <div key={`${item.title}-${item.description}`} className="rounded-2xl border border-white/90 bg-white/95 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
              <p className="m-0 text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="m-0 mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {hasPublicContent ? (
        <div
          data-testid={`mbti-chapter-public-${copy.anchor}`}
          className="rounded-[24px] border border-slate-200 bg-white/85 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] [&_section]:space-y-3 [&_section>h3]:sr-only [&_section>div]:space-y-3"
        >
          <SectionRenderer section={section} locked={false} locale={locale} scaleCode="MBTI" />
        </div>
      ) : null}

      {isLocked ? (
        <div className="rounded-[24px] border border-dashed border-[var(--fm-border-strong)] bg-[var(--fm-surface-muted)]/55 p-5">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
            {locale === "zh" ? "章节预告" : "Chapter teaser"}
          </p>
          <p className="m-0 mt-3 text-base font-semibold text-slate-900">{unlock?.teaser ?? (locale === "zh" ? "解锁后可查看这一章的完整解读。" : "Unlock to view the full reading for this chapter.")}</p>
          {(unlock?.benefits ?? []).length > 0 ? (
            <ul className="mb-0 mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
              {unlock?.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}
            </ul>
          ) : null}
        </div>
      ) : null}

      {isLocked ? (
        <Card data-testid="mbti-chapter-unlock-card" className="border-slate-200 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
          <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
                {locale === "zh" ? "解锁本章" : "Unlock this chapter"}
              </p>
              <p className="m-0 text-lg font-semibold text-slate-900">
                {unlock?.offer?.title ?? (locale === "zh" ? "查看完整报告解锁方案" : "View the matching unlock options")}
              </p>
              <p className="m-0 text-sm leading-7 text-slate-600">
                {unlock?.offer?.description ?? (locale === "zh" ? "本章只保留公开部分；解锁方案会集中展示在页中方案区。" : "Only the public slice stays here; the matching unlock options are collected in the offers section below.")}
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
              <a href="#offers" className={buttonVariants({ variant: "outline" })}>
                {locale === "zh" ? "查看解锁方案" : "View unlock options"}
              </a>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}
