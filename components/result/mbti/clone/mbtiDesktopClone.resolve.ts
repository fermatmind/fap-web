import type { HighlightCard, MbtiSectionUnlock, ReportSection, ResolvedOffer, RichResultHeadline } from "@/components/result/RichResultReport";
import { MBTI_DESKTOP_CLONE_PILOT_CONTENT_ZH } from "@/components/result/mbti/clone/content";
import { MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH } from "@/components/result/mbti/clone/mbtiDesktopClone.placeholders";
import type { ContentListBlock, ListItem, MbtiDesktopCloneSlots, NarrativeChapterSlots, TraitSlot } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import type { Locale } from "@/lib/i18n/locales";
import type { MbtiResultProjectionSectionViewModel, MbtiResultProjectionViewModel } from "@/lib/mbti/publicProjection";

export type ResolveMbtiDesktopCloneSlotsArgs = {
  locale: Locale;
  headline: RichResultHeadline;
  dimensions: Array<Record<string, unknown>>;
  highlights: HighlightCard[];
  sections: ReportSection[];
  sectionUnlocks: Record<string, MbtiSectionUnlock>;
  offers: ResolvedOffer[];
  projectionViewModel?: MbtiResultProjectionViewModel | null;
};

const SECTION_CONFIG = {
  traits: {
    title: { zh: "Personality Traits", en: "Personality Traits" },
    introKeys: ["trait_overview", "letters_intro", "overview", "traits.why_this_type", "traits.decision_style"] as const,
  },
  career: {
    step: "2",
    sectionLabel: { zh: "职业路径", en: "Career path" },
    title: { zh: "Your Career Path", en: "Your Career Path" },
    introKeys: ["career.summary", "career.collaboration_fit", "career.work_environment"] as const,
    strengthsKeys: ["career.advantages"] as const,
    weaknessesKeys: ["career.weaknesses"] as const,
    lockedTitles: {
      first: { zh: "Career roles you may love", en: "Career roles you may love" },
      second: { zh: "Work styles that suit you", en: "Work styles that suit you" },
    },
  },
  growth: {
    step: "3",
    sectionLabel: { zh: "个人成长", en: "Personal growth" },
    title: { zh: "Your Personal Growth", en: "Your Personal Growth" },
    introKeys: ["growth.summary", "growth.stability_confidence"] as const,
    strengthsKeys: ["growth.strengths", "growth.motivators"] as const,
    weaknessesKeys: ["growth.weaknesses", "growth.drainers"] as const,
    lockedTitles: {
      first: { zh: "What energizes you", en: "What energizes you" },
      second: { zh: "What drains you", en: "What drains you" },
    },
  },
  relationships: {
    step: "4",
    sectionLabel: { zh: "关系模式", en: "Relationships" },
    title: { zh: "Your Relationships", en: "Your Relationships" },
    introKeys: ["relationships.summary", "relationships.communication_style"] as const,
    strengthsKeys: ["relationships.strengths", "relationships.rel_advantages"] as const,
    weaknessesKeys: ["relationships.weaknesses", "relationships.rel_risks"] as const,
    lockedTitles: {
      first: { zh: "Relationship superpowers", en: "Relationship superpowers" },
      second: { zh: "Relationship pitfalls", en: "Relationship pitfalls" },
    },
  },
} as const;

function normalizeText(...values: unknown[]) {
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

function normalizeParagraph(text: string) {
  return text
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeBaseMbtiCode(fullCode: string) {
  const match = fullCode.toUpperCase().match(/([A-Z]{4})/);
  return match?.[1] ?? fullCode.toUpperCase();
}

function splitMarkdownParagraphs(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => normalizeParagraph(paragraph))
    .filter((paragraph) => paragraph.length > 24 && !paragraph.startsWith("-") && !paragraph.startsWith("*"));
}

function extractPayloadParagraphs(payload: Record<string, unknown> | null) {
  const blocks = Array.isArray(payload?.blocks) ? payload.blocks : [];
  const paragraphs: string[] = [];

  for (const block of blocks) {
    const record = asRecord(block);
    const values = [record?.text, record?.body, record?.summary, record?.description];
    for (const value of values) {
      const normalized = normalizeParagraph(normalizeText(value));
      if (normalized.length > 24) {
        paragraphs.push(normalized);
      }
    }
  }

  return paragraphs;
}

function collectProjectionParagraphs(projectionSections: MbtiResultProjectionSectionViewModel[], keys: readonly string[]) {
  const paragraphs: string[] = [];

  for (const key of keys) {
    const section = projectionSections.find((item) => item.key === key);
    if (!section) {
      continue;
    }

    paragraphs.push(...splitMarkdownParagraphs(section.bodyMd));
    paragraphs.push(...extractPayloadParagraphs(section.payload));
  }

  return Array.from(new Set(paragraphs));
}

function collectLegacyParagraphs(legacySection?: ReportSection) {
  if (!legacySection?.blocks) {
    return [];
  }

  return legacySection.blocks
    .flatMap((block) => [normalizeParagraph(normalizeText(block.body)), normalizeParagraph(normalizeText(block.title))])
    .filter((paragraph) => paragraph.length > 24);
}

function takeParagraphs(source: string[], fallback: [string, string]): [string, string] {
  const filtered = source.filter(Boolean).slice(0, 2);
  return [filtered[0] ?? fallback[0], filtered[1] ?? fallback[1]];
}

function titleToListItem(raw: string, tone: ListItem["tone"] = "neutral", isPlaceholder = false): ListItem {
  const normalized = normalizeParagraph(raw);
  const colonIndex = normalized.indexOf(":");
  if (colonIndex >= 0) {
    return {
      title: normalized.slice(0, colonIndex).trim(),
      body: normalized.slice(colonIndex + 1).trim(),
      tone,
      isPlaceholder,
    };
  }

  const segments = normalized.split(/\. (?=[A-Z\u4e00-\u9fa5])/);
  if (segments.length > 1) {
    return {
      title: segments[0].trim(),
      body: segments.slice(1).join(". ").trim(),
      tone,
      isPlaceholder,
    };
  }

  return {
    title: normalized,
    body: "Placeholder slot: item body is pending and remains explicit until structured content is ready.",
    tone,
    isPlaceholder: true,
  };
}

function extractBulletsFromPayload(payload: Record<string, unknown> | null, tone: ListItem["tone"]) {
  const blocks = Array.isArray(payload?.blocks) ? payload.blocks : [];
  const items: ListItem[] = [];

  for (const block of blocks) {
    const record = asRecord(block);
    const bullets = Array.isArray(record?.bullets) ? record?.bullets : [];
    for (const bullet of bullets) {
      const normalized = normalizeText(bullet);
      if (normalized) {
        items.push(titleToListItem(normalized, tone));
      }
    }

    const title = normalizeText(record?.title, record?.label);
    const body = normalizeText(record?.text, record?.body, record?.summary, record?.description);
    if (title && body) {
      items.push({ title, body, tone });
    }
  }

  return items;
}

function extractBulletsFromMarkdown(bodyMd: string, tone: ListItem["tone"]) {
  return bodyMd
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- ") || line.startsWith("* "))
    .map((line) => titleToListItem(line.replace(/^[-*]\s*/, ""), tone));
}

function extractLegacyItems(section: ReportSection | undefined, matchers: string[], tone: ListItem["tone"]) {
  if (!section?.blocks) {
    return [];
  }

  const items: ListItem[] = [];
  for (const block of section.blocks) {
    const title = normalizeText(block.title);
    const body = normalizeText(block.body);
    const key = `${title} ${body}`.toLowerCase();
    const shouldInclude = matchers.some((matcher) => key.includes(matcher));
    if (shouldInclude && (title || body)) {
      items.push({
        title: title || "Placeholder item",
        body: body || "Placeholder slot: body slot pending.",
        tone,
        isPlaceholder: !body,
      });
    }
    for (const bullet of block.bullets ?? []) {
      if (shouldInclude && normalizeText(bullet)) {
        items.push(titleToListItem(normalizeText(bullet), tone));
      }
    }
  }

  return items;
}

function takeListItems(realItems: ListItem[], placeholderItems: [ListItem, ListItem, ListItem, ListItem, ListItem, ListItem]) {
  const normalized = realItems
    .filter((item) => normalizeText(item.title, item.body))
    .map((item) => ({
      title: normalizeText(item.title) || "Placeholder item",
      body: normalizeText(item.body) || "Placeholder slot: body slot pending and intentionally explicit.",
      tone: item.tone,
      isPlaceholder: item.isPlaceholder ?? false,
    }))
    .slice(0, 6);

  const padded = [...normalized, ...placeholderItems.slice(normalized.length)];
  return [padded[0], padded[1], padded[2], padded[3], padded[4], padded[5]] as [ListItem, ListItem, ListItem, ListItem, ListItem, ListItem];
}

function makeTraitSlots(labels: string[], fallback: NarrativeChapterSlots["influentialTraits"]) {
  const colors: Array<TraitSlot["colorKey"]> = ["blue", "gold", "green", "purple"];
  const items: TraitSlot[] = labels.slice(0, 4).map((label, index) => ({
    label,
    colorKey: colors[index],
    isPlaceholder: false,
  } satisfies TraitSlot));

  while (items.length < 4) {
    items.push(fallback[items.length]);
  }

  return [items[0], items[1], items[2], items[3]] as [TraitSlot, TraitSlot, TraitSlot, TraitSlot];
}

function deriveRuntimeTraitSlots(projectionViewModel: MbtiResultProjectionViewModel | null | undefined, highlights: HighlightCard[], fallback: NarrativeChapterSlots["influentialTraits"]) {
  const labels = [
    ...(projectionViewModel?.keywords ?? []),
    ...highlights.map((item) => item.title),
  ]
    .map((item) => normalizeText(item).replace(/^type:/i, ""))
    .filter((item) => item && !item.includes(":"));

  return makeTraitSlots(Array.from(new Set(labels)), fallback);
}

function mapBlocksFromRuntime(
  projectionSections: MbtiResultProjectionSectionViewModel[],
  legacySection: ReportSection | undefined,
  keys: readonly string[],
  matchers: string[],
  tone: ListItem["tone"],
  placeholder: ContentListBlock,
): ContentListBlock {
  const projectionItems = keys.flatMap((projectionKey) => {
    const section = projectionSections.find((item) => item.key === projectionKey);
    if (!section) {
      return [];
    }
    return [...extractBulletsFromPayload(section.payload, tone), ...extractBulletsFromMarkdown(section.bodyMd, tone)];
  });

  return {
    title: placeholder.title,
    items: takeListItems([...projectionItems, ...extractLegacyItems(legacySection, matchers, tone)], placeholder.items),
  };
}

function buildDimensionSummary(
  dimensions: Array<Record<string, unknown>>,
  headline: RichResultHeadline,
) {
  const primary = [...dimensions].sort((left, right) => Number(right.percent ?? right.score ?? right.value ?? 0) - Number(left.percent ?? left.score ?? left.value ?? 0))[0] ?? null;
  const percent = Number(primary?.percent ?? primary?.score ?? primary?.value ?? 0);
  const roundedPercent = Number.isFinite(percent) ? Math.round(percent) : 0;
  const winner = normalizeText(primary?.winnerLabel, primary?.sideLabel, headline.displayName, headline.typeCode);
  return {
    title: winner || "Leading trait",
    value: `${roundedPercent}%`,
    body: normalizeText(primary?.summary, headline.supportingLine, headline.summary) || MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH.traits.summaryPane.body,
  };
}

function buildDefaultChapter(
  locale: Locale,
  key: "career" | "growth" | "relationships",
  projectionSections: MbtiResultProjectionSectionViewModel[],
  legacySection: ReportSection | undefined,
  highlights: HighlightCard[],
  projectionViewModel: MbtiResultProjectionViewModel | null | undefined,
  sectionUnlock: MbtiSectionUnlock | undefined,
): NarrativeChapterSlots {
  const language = locale === "zh" ? "zh" : "en";
  const placeholder = MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH.chapters[key];
  const config = SECTION_CONFIG[key];

  return {
    step: config.step,
    sectionLabel: config.sectionLabel[language],
    title: config.title[language],
    asset: placeholder.asset,
    intro: takeParagraphs(
      [...collectProjectionParagraphs(projectionSections, config.introKeys), ...collectLegacyParagraphs(legacySection)],
      placeholder.intro,
    ),
    influentialTraits: deriveRuntimeTraitSlots(projectionViewModel, highlights, placeholder.influentialTraits),
    visibleBlocks: [
      mapBlocksFromRuntime(
        projectionSections,
        legacySection,
        config.strengthsKeys,
        ["strength", "advantage", "motivator", "优势", "驱动"],
        "positive",
        placeholder.visibleBlocks[0],
      ),
      mapBlocksFromRuntime(
        projectionSections,
        legacySection,
        config.weaknessesKeys,
        ["weak", "risk", "watch", "drainer", "盲点", "风险", "弱点"],
        "negative",
        placeholder.visibleBlocks[1] ?? placeholder.visibleBlocks[0],
      ),
    ],
    lockedBlocks: [
      {
        ...placeholder.lockedBlocks[0],
        overlayBody: normalizeText(sectionUnlock?.teaser, placeholder.lockedBlocks[0].overlayBody),
      },
      {
        ...placeholder.lockedBlocks[1],
        overlayBody: normalizeText(sectionUnlock?.benefits?.[0], placeholder.lockedBlocks[1].overlayBody),
      },
    ],
  };
}

function applyPilotChapter(
  base: NarrativeChapterSlots,
  pilot: Pick<NarrativeChapterSlots, "intro" | "influentialTraits" | "visibleBlocks" | "lockedBlocks">,
) {
  return {
    ...base,
    intro: pilot.intro,
    influentialTraits: pilot.influentialTraits,
    visibleBlocks: pilot.visibleBlocks,
    lockedBlocks: pilot.lockedBlocks,
  } satisfies NarrativeChapterSlots;
}

export function resolveMbtiDesktopCloneSlots({
  locale,
  headline,
  dimensions,
  highlights,
  sections,
  sectionUnlocks,
  projectionViewModel,
}: ResolveMbtiDesktopCloneSlotsArgs): MbtiDesktopCloneSlots {
  const fullCode = normalizeText(headline.typeCode, projectionViewModel?.displayType).toUpperCase() || "MBTI";
  const baseCode = normalizeBaseMbtiCode(fullCode);
  const isZh = locale === "zh";
  const pilot = isZh ? MBTI_DESKTOP_CLONE_PILOT_CONTENT_ZH[baseCode] ?? null : null;
  const isPilot = Boolean(pilot);
  const projectionSections = projectionViewModel?.sections ?? [];
  const legacySections = Object.fromEntries(
    sections.map((section) => [normalizeText(section.key).toLowerCase(), section] as const).filter(([key]) => key)
  ) as Record<string, ReportSection | undefined>;
  const dimensionSummary = buildDimensionSummary(dimensions, headline);

  const defaultCareer = buildDefaultChapter(locale, "career", projectionSections, legacySections.career, highlights, projectionViewModel, sectionUnlocks.career);
  const defaultGrowth = buildDefaultChapter(locale, "growth", projectionSections, legacySections.growth, highlights, projectionViewModel, sectionUnlocks.growth);
  const defaultRelationships = buildDefaultChapter(locale, "relationships", projectionSections, legacySections.relationships, highlights, projectionViewModel, sectionUnlocks.relationships);

  const slots: MbtiDesktopCloneSlots = {
    meta: {
      baseCode,
      fullCode,
      locale,
      isPilot,
    },
    hero: {
      eyebrow: isZh ? "你的人格类型是" : "Your personality type is",
      title: normalizeText(headline.displayName, projectionViewModel?.typeName, baseCode),
      typeCode: fullCode,
      summary: pilot?.hero.summary || MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH.hero.summary,
      asset: MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH.hero.asset,
    },
    intro: {
      paragraphs: pilot?.intro.paragraphs ?? MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH.intro.paragraphs,
    },
    traits: {
      sectionLabel: MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH.traits.sectionLabel,
      title: SECTION_CONFIG.traits.title[isZh ? "zh" : "en"],
      asset: MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH.traits.asset,
      summaryPane: {
        eyebrow: pilot?.traits.summaryPane.eyebrow ?? MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH.traits.summaryPane.eyebrow,
        title: pilot?.traits.summaryPane.title ?? dimensionSummary.title,
        value: pilot?.traits.summaryPane.value ?? dimensionSummary.value,
        body: pilot?.traits.summaryPane.body ?? dimensionSummary.body,
        asset: MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH.traits.summaryPane.asset,
      },
      body: pilot?.traits.body ?? MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH.traits.body,
    },
    chapters: {
      career: pilot ? applyPilotChapter(defaultCareer, pilot.chapters.career) : MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH.chapters.career,
      growth: pilot ? applyPilotChapter(defaultGrowth, pilot.chapters.growth) : MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH.chapters.growth,
      relationships: pilot ? applyPilotChapter(defaultRelationships, pilot.chapters.relationships) : MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH.chapters.relationships,
    },
    finalOffer: {
      eyebrow: (isPilot ? pilot?.finalOffer.eyebrow : "") || MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH.finalOffer.eyebrow,
      headline: (isPilot ? pilot?.finalOffer.headline : "") || MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH.finalOffer.headline,
      body: (isPilot ? pilot?.finalOffer.body : "") || MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH.finalOffer.body,
      priceLabel: (isPilot ? pilot?.finalOffer.priceLabel : "") || MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH.finalOffer.priceLabel,
      ctaLabel: (isPilot ? pilot?.finalOffer.ctaLabel : "") || MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH.finalOffer.ctaLabel,
      guarantee: (isPilot ? pilot?.finalOffer.guarantee : "") || MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH.finalOffer.guarantee,
      asset: MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH.finalOffer.asset,
    },
  };

  return slots;
}
