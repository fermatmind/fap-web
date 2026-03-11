"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReportIdentityLayer, ReportLayerCard } from "@/lib/api/v0_3";
import type { Locale } from "@/lib/i18n/locales";

const TECHNICAL_TAG_PREFIXES = ["axis:", "state:", "type:", "role:", "strategy:", "borderline:"];

const FALLBACK_TRAITS: Record<Locale, Array<{ title: string; description: string }>> = {
  zh: [
    { title: "表达方式", description: "你更在意表达是否真实，也会在互动里快速感知气氛变化。" },
    { title: "决策线索", description: "你做判断时既看直觉，也会反复确认这件事是否值得投入。" },
    { title: "协作节奏", description: "你通常更适合边交流边校准，在反馈里逐步找到最合适的方向。" },
    { title: "成长重点", description: "把优势沉淀成稳定方法后，你的发挥会更持续、更轻松。" },
  ],
  en: [
    { title: "Expression style", description: "You care about authentic expression and quickly notice shifts in group energy." },
    { title: "Decision cue", description: "You combine instinct with repeated checks on whether the effort still feels worthwhile." },
    { title: "Collaboration rhythm", description: "You usually perform best when ideas can be refined through active feedback." },
    { title: "Growth focus", description: "Your output becomes more durable once strengths are turned into repeatable methods." },
  ],
};

export type TraitBridgeItem = {
  title: string;
  description: string;
  visualLabel: string;
};

type DominantTraitSources = {
  locale: Locale;
  roleCard?: ReportLayerCard | null;
  strategyCard?: ReportLayerCard | null;
  identityLayer?: ReportIdentityLayer | null;
  identityTags?: string[];
  profileKeywords?: string[];
  fallbackTags?: string[];
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

function normalizeStringArray(values: unknown): string[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((value) => normalizeText(value))
    .filter(Boolean);
}

function isTechnicalTag(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return TECHNICAL_TAG_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

function filterSafeTags(values: unknown): string[] {
  return normalizeStringArray(values).filter((value) => !isTechnicalTag(value));
}

function createVisualLabel(value: string, fallback: string): string {
  const normalized = value.replace(/\s+/g, "");
  if (normalized.length >= 2) {
    return normalized.slice(0, 2).toUpperCase();
  }

  if (normalized.length === 1) {
    return normalized.toUpperCase();
  }

  return fallback;
}

function createLayerItem(card: ReportLayerCard | null | undefined, fallback: string): TraitBridgeItem | null {
  if (!card) {
    return null;
  }

  const title = normalizeText(card.title, card.code);
  const description = normalizeText(card.desc, card.subtitle);
  if (!title || !description) {
    return null;
  }

  return {
    title,
    description,
    visualLabel: createVisualLabel(normalizeText(card.code, title), fallback),
  };
}

function parseBulletItem(
  bullet: string,
  locale: Locale,
  index: number,
  fallbackTitle?: string
): TraitBridgeItem | null {
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

  const title =
    normalizeText(fallbackTitle, candidateTitle) ||
    (locale === "zh" ? `人格线索 ${index + 1}` : `Identity cue ${index + 1}`);
  const description =
    normalizeText(candidateDescription, normalized) ||
    (locale === "zh" ? "这是当前结果中的稳定人格线索。" : "This is a stable signal in the current result.");

  return {
    title,
    description,
    visualLabel: createVisualLabel(normalizeText(fallbackTitle, candidateTitle, title), String(index + 1).padStart(2, "0")),
  };
}

function createTagItems(values: string[], locale: Locale): TraitBridgeItem[] {
  return values.map((value, index) => ({
    title: value,
    description:
      locale === "zh"
        ? "这是当前结果里稳定出现的性格线索，可作为阅读后续章节的切入点。"
        : "This is a stable signal in the current result and a useful lens for the chapters below.",
    visualLabel: createVisualLabel(value, String(index + 1).padStart(2, "0")),
  }));
}

function createIdentityItems(identityLayer: ReportIdentityLayer | null | undefined, locale: Locale): TraitBridgeItem[] {
  if (!identityLayer) {
    return [];
  }

  const tags = filterSafeTags(identityLayer.tags);
  const bullets = normalizeStringArray(identityLayer.bullets);
  const items: TraitBridgeItem[] = [];

  for (let index = 0; index < Math.max(tags.length, bullets.length); index += 1) {
    const tag = tags[index];
    const bullet = bullets[index];

    if (tag) {
      items.push({
        title: tag,
        description:
          normalizeText(parseBulletItem(bullet ?? "", locale, index)?.description) ||
          (locale === "zh"
            ? "这是 authored identity 层里最稳定的一条人格提示。"
            : "This is one of the most stable authored identity cues in the current result."),
        visualLabel: createVisualLabel(tag, String(index + 1).padStart(2, "0")),
      });
      continue;
    }

    const parsedBullet = parseBulletItem(bullet ?? "", locale, index);
    if (parsedBullet) {
      items.push(parsedBullet);
    }
  }

  return items;
}

export function buildDominantTraitItems({
  locale,
  roleCard,
  strategyCard,
  identityLayer,
  identityTags = [],
  profileKeywords = [],
  fallbackTags = [],
}: DominantTraitSources): TraitBridgeItem[] {
  const result: TraitBridgeItem[] = [];
  const seen = new Set<string>();

  const pushItem = (item: TraitBridgeItem | null) => {
    if (!item) return;
    const key = `${item.title.toLowerCase()}::${item.description.toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    result.push(item);
  };

  pushItem(createLayerItem(roleCard, "RL"));
  pushItem(createLayerItem(strategyCard, "ST"));

  for (const item of createIdentityItems(identityLayer, locale)) {
    pushItem(item);
    if (result.length >= 4) {
      return result.slice(0, 4);
    }
  }

  for (const item of createTagItems(filterSafeTags(identityTags), locale)) {
    pushItem(item);
    if (result.length >= 4) {
      return result.slice(0, 4);
    }
  }

  for (const item of createTagItems(filterSafeTags(profileKeywords), locale)) {
    pushItem(item);
    if (result.length >= 4) {
      return result.slice(0, 4);
    }
  }

  for (const item of createTagItems(filterSafeTags(fallbackTags), locale)) {
    pushItem(item);
    if (result.length >= 4) {
      return result.slice(0, 4);
    }
  }

  for (const item of FALLBACK_TRAITS[locale]) {
    pushItem({
      ...item,
      visualLabel: createVisualLabel(item.title, "FT"),
    });
    if (result.length >= 4) {
      return result.slice(0, 4);
    }
  }

  return result.slice(0, 4);
}

export function MbtiDominantTraitsSection(props: DominantTraitSources) {
  const items = buildDominantTraitItems(props);

  return (
    <section
      id="dominant-traits"
      data-testid="mbti-dominant-traits"
      className="scroll-mt-28 space-y-4 rounded-[28px] border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)] md:p-6"
    >
      <div className="space-y-2">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
          {props.locale === "zh" ? "主导特质" : "Dominant traits"}
        </p>
        <h2 className="m-0 text-2xl font-semibold tracking-tight text-[var(--fm-text)]">
          {props.locale === "zh" ? "先抓住这四个阅读坐标" : "Start with the four clearest reading coordinates"}
        </h2>
        <p className="m-0 max-w-3xl text-sm leading-7 text-[var(--fm-text-muted)]">
          {props.locale === "zh"
            ? "这一层只抽取当前免费结果里最稳定、最安全的特质线索，用来承接后面的章节。"
            : "This layer only surfaces the most stable and safe trait signals in the current free result, so the later chapters read as one report."}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <Card key={`${item.visualLabel}-${item.title}`} className="border-slate-200 bg-white/95 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
            <CardHeader className="space-y-3 pb-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--fm-surface-muted)] text-sm font-semibold text-[var(--fm-accent)]">
                {item.visualLabel}
              </span>
              <CardTitle className="text-lg text-slate-900">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="m-0 text-sm leading-7 text-slate-600">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
