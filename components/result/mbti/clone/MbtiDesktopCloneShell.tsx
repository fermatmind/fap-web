"use client";

import { type ReactNode, useMemo } from "react";
import type { HighlightCard, MbtiSectionUnlock, ReportSection, ResolvedOffer, RichResultHeadline } from "@/components/result/RichResultReport";
import { MbtiCloneFinalOffer } from "@/components/result/mbti/clone/MbtiCloneFinalOffer";
import { MbtiCloneHero } from "@/components/result/mbti/clone/MbtiCloneHero";
import { MbtiCloneNarrativeSection } from "@/components/result/mbti/clone/MbtiCloneNarrativeSection";
import { MbtiCloneRail } from "@/components/result/mbti/clone/MbtiCloneRail";
import { MbtiCloneTraitsSection } from "@/components/result/mbti/clone/MbtiCloneTraitsSection";
import { MBTI_DESKTOP_CLONE_PLACEHOLDERS } from "@/components/result/mbti/clone/mbtiDesktopClone.placeholders";
import type { CloneListItem } from "@/components/result/mbti/clone/MbtiCloneTwoColumnList";
import styles from "@/components/result/mbti/clone/mbtiDesktopClone.module.css";
import type { Locale } from "@/lib/i18n/locales";
import type {
  MbtiPublicProjectionDimensionViewModel,
  MbtiResultProjectionSectionViewModel,
  MbtiResultProjectionViewModel,
} from "@/lib/mbti/publicProjection";

type DesktopCloneTool = {
  label: string;
  href?: string;
  onClick?: () => void | Promise<void>;
  disabled?: boolean;
};

type MbtiDesktopCloneShellProps = {
  locale: Locale;
  headline: RichResultHeadline;
  tags: string[];
  dimensions: Array<Record<string, unknown>>;
  highlights: HighlightCard[];
  sections: ReportSection[];
  sectionUnlocks: Record<string, MbtiSectionUnlock>;
  offers: ResolvedOffer[];
  projectionViewModel?: MbtiResultProjectionViewModel | null;
  isUnlocked: boolean;
  shareCtaLabel: string;
  shareDisabled?: boolean;
  onShare: () => void | Promise<void>;
  retakeHref: string;
  historyHref?: string;
  workspaceHref?: string;
  orderLookupHref?: string;
  orderDetailHref?: string;
  relationshipHref?: string;
  pdfHref?: string;
  pdfReady?: boolean;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  onCheckout?: () => void | Promise<void>;
  isCheckingOut?: boolean;
  checkoutError?: string | null;
  unlockedOfferNode?: ReactNode;
};

const SECTION_CONFIG = {
  traits: {
    title: { zh: "人格概览", en: "Personality Traits" },
    introKeys: ["trait_overview", "letters_intro", "overview", "traits.why_this_type", "traits.decision_style"],
  },
  career: {
    title: { zh: "职业路径", en: "Your Career Path" },
    introKeys: ["career.summary", "career.collaboration_fit", "career.work_environment"],
    strengthsKeys: ["career.advantages"],
    weaknessesKeys: ["career.weaknesses"],
    lockedTitles: {
      first: { zh: "岗位与环境细节", en: "Role and environment detail" },
      second: { zh: "后续行动与升级建议", en: "Next steps and upgrade guidance" },
    },
  },
  growth: {
    title: { zh: "个人成长", en: "Your Personal Growth" },
    introKeys: ["growth.summary", "growth.stability_confidence"],
    strengthsKeys: ["growth.strengths", "growth.motivators"],
    weaknessesKeys: ["growth.weaknesses", "growth.drainers"],
    lockedTitles: {
      first: { zh: "成长实验与节奏", en: "Growth experiments and cadence" },
      second: { zh: "压力恢复与风险提示", en: "Recovery and watch-outs" },
    },
  },
  relationships: {
    title: { zh: "关系模式", en: "Your Relationships" },
    introKeys: ["relationships.summary", "relationships.communication_style"],
    strengthsKeys: ["relationships.strengths", "relationships.rel_advantages"],
    weaknessesKeys: ["relationships.weaknesses", "relationships.rel_risks"],
    lockedTitles: {
      first: { zh: "边界与配合细节", en: "Boundary and fit detail" },
      second: { zh: "本周关系动作", en: "Relationship next steps" },
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
    .trim();
}

function splitMarkdownParagraphs(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => normalizeParagraph(paragraph))
    .filter((paragraph) => paragraph.length > 30 && !paragraph.startsWith("-") && !paragraph.startsWith("*"));
}

function extractPayloadParagraphs(payload: Record<string, unknown> | null) {
  const blocks = Array.isArray(payload?.blocks) ? payload.blocks : [];
  const paragraphs: string[] = [];

  for (const block of blocks) {
    const record = asRecord(block);
    const values = [
      record?.text,
      record?.body,
      record?.summary,
      record?.description,
    ];
    for (const value of values) {
      const normalized = normalizeParagraph(normalizeText(value));
      if (normalized.length > 30) {
        paragraphs.push(normalized);
      }
    }
  }

  return paragraphs;
}

function collectProjectionParagraphs(
  projectionSections: MbtiResultProjectionSectionViewModel[],
  keys: readonly string[],
) {
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

function collectLegacyParagraphs(legacySection: ReportSection | undefined) {
  if (!legacySection?.blocks) {
    return [];
  }

  const paragraphs: string[] = [];
  for (const block of legacySection.blocks) {
    paragraphs.push(normalizeParagraph(normalizeText(block.body)));
    paragraphs.push(normalizeParagraph(normalizeText(block.title)));
  }

  return paragraphs.filter((item) => item.length > 30);
}

function takeParagraphs(
  source: string[],
  fallback: readonly string[],
  count = 2,
) {
  const filtered = source.filter(Boolean).slice(0, count);
  return filtered.length >= count ? filtered : [...filtered, ...fallback.slice(filtered.length, count)];
}

function titleToListItem(raw: string) {
  const normalized = normalizeParagraph(raw);
  const colonIndex = normalized.indexOf(":");
  if (colonIndex >= 0) {
    return {
      title: normalized.slice(0, colonIndex).trim(),
      body: normalized.slice(colonIndex + 1).trim(),
    };
  }

  const segments = normalized.split(/\. (?=[A-Z\u4e00-\u9fa5])/);
  if (segments.length > 1) {
    return {
      title: segments[0].trim(),
      body: segments.slice(1).join(". ").trim(),
    };
  }

  return {
    title: normalized,
    body: "Placeholder copy: item body is pending and this slot remains explicit until the mapped content is ready.",
  };
}

function extractBulletsFromPayload(payload: Record<string, unknown> | null) {
  const blocks = Array.isArray(payload?.blocks) ? payload.blocks : [];
  const items: CloneListItem[] = [];

  for (const block of blocks) {
    const record = asRecord(block);
    const bullets = Array.isArray(record?.bullets) ? record?.bullets : [];
    for (const bullet of bullets) {
      const normalized = normalizeText(bullet);
      if (normalized) {
        items.push(titleToListItem(normalized));
      }
    }

    const title = normalizeText(record?.title, record?.label);
    const body = normalizeText(record?.text, record?.body, record?.summary, record?.description);
    if (title && body) {
      items.push({ title, body });
    }
  }

  return items;
}

function extractBulletsFromMarkdown(bodyMd: string) {
  return bodyMd
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- ") || line.startsWith("* "))
    .map((line) => titleToListItem(line.replace(/^[-*]\s*/, "")));
}

function extractLegacyItems(section: ReportSection | undefined, matchers: string[]) {
  if (!section?.blocks) {
    return [];
  }

  const items: CloneListItem[] = [];
  for (const block of section.blocks) {
    const title = normalizeText(block.title);
    const body = normalizeText(block.body);
    const key = `${title} ${body}`.toLowerCase();
    const shouldInclude = matchers.some((matcher) => key.includes(matcher));
    if (shouldInclude && (title || body)) {
      items.push({
        title: title || "Placeholder item",
        body: body || "Placeholder copy: body slot pending.",
      });
    }
    for (const bullet of block.bullets ?? []) {
      if (shouldInclude && normalizeText(bullet)) {
        items.push(titleToListItem(normalizeText(bullet)));
      }
    }
  }

  return items;
}

function takeListItems(realItems: CloneListItem[], placeholderItems: CloneListItem[], count = 4) {
  const normalized = realItems
    .filter((item) => normalizeText(item.title, item.body))
    .map((item) => ({
      title: normalizeText(item.title) || "Placeholder item",
      body:
        normalizeText(item.body) ||
        "Placeholder copy: body slot pending and intentionally marked as unfinished content.",
    }));

  if (normalized.length >= count) {
    return normalized.slice(0, count);
  }

  return [...normalized, ...placeholderItems.slice(normalized.length, count)];
}

function deriveTraitLabels(
  projectionViewModel: MbtiResultProjectionViewModel | null | undefined,
  highlights: HighlightCard[],
  fallback: readonly string[],
) {
  const labels = [
    ...(projectionViewModel?.keywords ?? []),
    ...highlights.map((item) => item.title),
  ]
    .map((item) => normalizeText(item))
    .filter(Boolean);

  return Array.from(new Set(labels)).slice(0, 4).length >= 4
    ? Array.from(new Set(labels)).slice(0, 4)
    : [...Array.from(new Set(labels)).slice(0, 4), ...fallback].slice(0, 4);
}

function resolvePrimaryOffer(offers: ResolvedOffer[]) {
  return offers.find((offer) => offer.moduleCodes.includes("core_full") || offer.key.toUpperCase().includes("REPORT_FULL"))
    ?? offers[0]
    ?? null;
}

function buildDimensionSummary(
  projectionDimensions: MbtiPublicProjectionDimensionViewModel[],
  rawDimensions: Array<Record<string, unknown>>,
  headline: RichResultHeadline,
  locale: "zh" | "en",
) {
  const primaryProjection = projectionDimensions[0] ?? null;
  const primaryRaw = rawDimensions[0] ?? null;
  const percent = primaryProjection?.percent ?? Number(primaryRaw?.percent ?? primaryRaw?.score ?? primaryRaw?.value ?? 0);
  const roundedPercent = Number.isFinite(percent) ? Math.round(percent) : 0;
  const label = normalizeText(primaryProjection?.sideLabel, primaryRaw?.winnerLabel, headline.displayName, headline.typeCode);
  const summaryLabel = normalizeText(primaryProjection?.summary, headline.supportingLine, headline.summary)
    || (locale === "zh" ? "此处保留主维度结论占位。" : "Primary dimension conclusion slot.");

  return {
    title: locale === "zh" ? "主导维度" : "Leading trait",
    value: roundedPercent > 0 ? `${roundedPercent}%` : "0%",
    label,
    description: summaryLabel,
  };
}

export function MbtiDesktopCloneShell({
  locale,
  headline,
  tags,
  dimensions,
  highlights,
  sections,
  sectionUnlocks,
  offers,
  projectionViewModel,
  isUnlocked,
  shareCtaLabel,
  shareDisabled = false,
  onShare,
  retakeHref,
  historyHref,
  workspaceHref,
  orderLookupHref,
  orderDetailHref,
  relationshipHref,
  pdfHref,
  pdfReady = false,
  primaryCtaLabel,
  primaryCtaHref,
  onCheckout,
  isCheckingOut = false,
  checkoutError = null,
  unlockedOfferNode,
}: MbtiDesktopCloneShellProps) {
  const cloneLocale = locale === "zh" ? "zh" : "en";
  const projectionSections = projectionViewModel?.sections ?? [];
  const legacySections = useMemo(
    () =>
      Object.fromEntries(
        sections
          .map((section) => [normalizeText(section.key).toLowerCase(), section] as const)
          .filter(([key]) => key)
      ),
    [sections]
  );
  const dimensionSummary = buildDimensionSummary(projectionViewModel?.dimensions ?? [], dimensions, headline, cloneLocale);
  const primaryOffer = resolvePrimaryOffer(offers);

  const introParagraphs = takeParagraphs(
    [
      ...collectProjectionParagraphs(projectionSections, SECTION_CONFIG.traits.introKeys),
      ...collectLegacyParagraphs(legacySections.traits),
      normalizeParagraph(normalizeText(projectionViewModel?.summary, headline.summary)),
    ],
    MBTI_DESKTOP_CLONE_PLACEHOLDERS.introParagraphs,
    2
  );

  const traitsParagraphs = takeParagraphs(
    [
      ...collectProjectionParagraphs(projectionSections, ["traits.why_this_type", "traits.decision_style", "traits.adjacent_type_contrast"]),
      ...highlights.map((highlight) => normalizeParagraph(highlight.body)),
    ],
    MBTI_DESKTOP_CLONE_PLACEHOLDERS.traitsParagraphs,
    2
  );

  const railTools: DesktopCloneTool[] = [
    { label: shareCtaLabel, onClick: onShare, disabled: shareDisabled },
    { label: cloneLocale === "zh" ? "重测" : "Retest", href: retakeHref },
    ...(historyHref ? [{ label: cloneLocale === "zh" ? "历史" : "History", href: historyHref }] : []),
    ...(workspaceHref && workspaceHref !== historyHref
      ? [{ label: cloneLocale === "zh" ? "工作台" : "Workspace", href: workspaceHref }]
      : []),
    ...(pdfReady && pdfHref ? [{ label: "PDF", href: pdfHref }] : []),
    ...(orderLookupHref ? [{ label: cloneLocale === "zh" ? "订单" : "Orders", href: orderLookupHref }] : []),
    ...(orderDetailHref ? [{ label: cloneLocale === "zh" ? "详情" : "Detail", href: orderDetailHref }] : []),
    ...(relationshipHref ? [{ label: cloneLocale === "zh" ? "关系" : "Compare", href: relationshipHref }] : []),
  ];

  const traitsTools: DesktopCloneTool[] = [
    { label: shareCtaLabel, onClick: onShare, disabled: shareDisabled },
    ...(pdfReady && pdfHref ? [{ label: cloneLocale === "zh" ? "导出 PDF" : "Export PDF", href: pdfHref }] : []),
    ...(historyHref ? [{ label: cloneLocale === "zh" ? "查看历史" : "History", href: historyHref }] : []),
  ];

  const chapterData = (["career", "growth", "relationships"] as const).map((key, index) => {
    const config = SECTION_CONFIG[key];
    const unlock = sectionUnlocks[key];
    const legacySection = legacySections[key];
    const introParagraphsForSection = takeParagraphs(
      [
        ...collectProjectionParagraphs(projectionSections, config.introKeys),
        ...collectLegacyParagraphs(legacySection),
      ],
      MBTI_DESKTOP_CLONE_PLACEHOLDERS.narrativeParagraphs[key],
      2
    );

    const strengthProjectionItems = config.strengthsKeys.flatMap((projectionKey) => {
      const section = projectionSections.find((item) => item.key === projectionKey);
      if (!section) {
        return [];
      }
      return [...extractBulletsFromPayload(section.payload), ...extractBulletsFromMarkdown(section.bodyMd)];
    });
    const weaknessProjectionItems = config.weaknessesKeys.flatMap((projectionKey) => {
      const section = projectionSections.find((item) => item.key === projectionKey);
      if (!section) {
        return [];
      }
      return [...extractBulletsFromPayload(section.payload), ...extractBulletsFromMarkdown(section.bodyMd)];
    });

    const strengths = takeListItems(
      [
        ...strengthProjectionItems,
        ...extractLegacyItems(legacySection, ["strength", "advantage", "motivator", "优势", "驱动"]),
      ],
      MBTI_DESKTOP_CLONE_PLACEHOLDERS.strengths[key]
    );

    const weaknesses = takeListItems(
      [
        ...weaknessProjectionItems,
        ...extractLegacyItems(legacySection, ["weak", "risk", "watch", "drainer", "盲点", "风险", "弱点"]),
      ],
      MBTI_DESKTOP_CLONE_PLACEHOLDERS.weaknesses[key]
    );

    const traitLabels = deriveTraitLabels(
      projectionViewModel,
      highlights,
      MBTI_DESKTOP_CLONE_PLACEHOLDERS.influentialTraitLabels[key]
    );

    const unlockTeaser = normalizeText(unlock?.teaser)
      || (cloneLocale === "zh"
        ? "当前章节的完整细节会在真实购买收口中解锁。"
        : "The full details for this chapter unlock through the real offer block.");

    return {
      id: key,
      number: index + 2,
      title: config.title[cloneLocale],
      illustrationLabel: MBTI_DESKTOP_CLONE_PLACEHOLDERS.chapterIllustrationLabels[key],
      introParagraphs: introParagraphsForSection,
      traitLabels,
      visibleBlocks: [
        {
          title: cloneLocale === "zh" ? "Strengths" : "Strengths",
          items: strengths,
        },
        {
          title: cloneLocale === "zh" ? "Weaknesses" : "Weaknesses",
          items: weaknesses,
        },
      ],
      lockedBlocks: [
        {
          title: config.lockedTitles.first[cloneLocale],
          items: MBTI_DESKTOP_CLONE_PLACEHOLDERS.lockedBlocks.roles,
          overlayTitle: cloneLocale === "zh" ? "解锁隐藏列表块" : "Unlock the hidden list block",
          overlayCopy: unlockTeaser,
        },
        {
          title: config.lockedTitles.second[cloneLocale],
          items: MBTI_DESKTOP_CLONE_PLACEHOLDERS.lockedBlocks.nextSteps,
          overlayTitle: cloneLocale === "zh" ? "继续解锁完整章节" : "Continue to unlock the full chapter",
          overlayCopy:
            normalizeText(unlock?.benefits?.[0], unlock?.benefits?.[1]) ||
            (cloneLocale === "zh"
              ? "这里保持 16P 式 blur list 和 centered overlay grammar。"
              : "This keeps the 16P-style blur-list and centered overlay grammar in place."),
        },
      ],
    };
  });

  return (
    <div data-testid="mbti-desktop-clone-shell" className={styles.cloneRoot}>
      <div className={styles.shell}>
        <MbtiCloneHero
          eyebrow={cloneLocale === "zh" ? "你的 MBTI 结果" : "Your personality type is"}
          title={normalizeText(headline.displayName, projectionViewModel?.typeName, headline.typeCode)}
          typeCode={normalizeText(headline.typeCode, projectionViewModel?.displayType)}
          illustrationLabel={MBTI_DESKTOP_CLONE_PLACEHOLDERS.heroIllustrationLabel}
        />

        <div className={styles.pageGrid}>
          <main className={styles.main}>
            <section className={styles.introBlock}>
              {introParagraphs.map((paragraph, index) => (
                <p key={`intro-${index}`}>{paragraph}</p>
              ))}
            </section>

            <MbtiCloneTraitsSection
              title={SECTION_CONFIG.traits.title[cloneLocale]}
              illustrationLabel={MBTI_DESKTOP_CLONE_PLACEHOLDERS.traitsIllustrationLabel}
              dimensions={dimensions}
              summaryTitle={dimensionSummary.title}
              summaryValue={dimensionSummary.value}
              summaryLabel={dimensionSummary.label}
              summaryDescription={dimensionSummary.description}
              summarySlotLabel="illustration-slot placeholder"
              paragraphs={traitsParagraphs}
              tools={traitsTools}
            />

            {chapterData.map((chapter) => (
              <MbtiCloneNarrativeSection
                key={chapter.id}
                locale={cloneLocale}
                id={chapter.id}
                number={chapter.number}
                title={chapter.title}
                illustrationLabel={chapter.illustrationLabel}
                introParagraphs={chapter.introParagraphs}
                traitLabels={chapter.traitLabels}
                isUnlocked={isUnlocked}
                unlockHref="#offer-full"
                unlockLabel={primaryCtaLabel}
                visibleBlocks={chapter.visibleBlocks}
                lockedBlocks={chapter.lockedBlocks}
              />
            ))}

            <section id="offer-full" data-testid="mbti-offer-full" className={styles.section}>
              <MbtiCloneFinalOffer
                locale={cloneLocale}
                eyebrow={cloneLocale === "zh" ? "最终解锁" : "Final offer"}
                headline={
                  normalizeText(primaryOffer?.title)
                  || MBTI_DESKTOP_CLONE_PLACEHOLDERS.finalOfferHeadline
                }
                copy={
                  normalizeText(primaryOffer?.description, sectionUnlocks.traits?.teaser)
                  || MBTI_DESKTOP_CLONE_PLACEHOLDERS.finalOfferCopy
                }
                price={normalizeText(primaryOffer?.price) || MBTI_DESKTOP_CLONE_PLACEHOLDERS.finalOfferPrice}
                ctaLabel={primaryOffer ? (cloneLocale === "zh" ? "解锁完整报告" : "Unlock full report") : undefined}
                isCheckingOut={isCheckingOut}
                checkoutError={checkoutError}
                onCheckout={primaryOffer ? onCheckout : undefined}
                isUnlocked={isUnlocked}
                unlockedNode={unlockedOfferNode}
                illustrationLabel="feature image placeholder"
              />
            </section>
          </main>

          <MbtiCloneRail
            locale={cloneLocale}
            displayName={normalizeText(headline.displayName, projectionViewModel?.typeName)}
            typeCode={normalizeText(headline.typeCode, projectionViewModel?.displayType)}
            tags={tags}
            isUnlocked={isUnlocked}
            summary={
              normalizeText(headline.supportingLine, headline.summary)
              || (cloneLocale === "zh"
                ? "显式 placeholder：summary slot 待真实文案接入。"
                : "Explicit placeholder: summary slot pending real copy.")
            }
            primaryCtaLabel={primaryCtaLabel}
            primaryCtaHref={primaryCtaHref}
            tools={railTools}
          />
        </div>
      </div>
    </div>
  );
}
