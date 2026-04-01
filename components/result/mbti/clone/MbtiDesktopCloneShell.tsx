"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import type { HighlightCard, MbtiSectionUnlock, ReportSection, ResolvedOffer, RichResultHeadline } from "@/components/result/RichResultReport";
import { MbtiCloneFinalOffer } from "@/components/result/mbti/clone/MbtiCloneFinalOffer";
import { MbtiCloneHero } from "@/components/result/mbti/clone/MbtiCloneHero";
import { MbtiCloneNarrativeSection } from "@/components/result/mbti/clone/MbtiCloneNarrativeSection";
import { MbtiCloneRail } from "@/components/result/mbti/clone/MbtiCloneRail";
import { MbtiCloneTraitsSection } from "@/components/result/mbti/clone/MbtiCloneTraitsSection";
import { resolveMbtiDesktopCloneSlots } from "@/components/result/mbti/clone/mbtiDesktopClone.resolve";
import type { LockedListBlock, MbtiDesktopCloneContent, StrengthWeaknessBlock } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import type { PremiumTeaserItem } from "@/components/result/mbti/clone/MbtiClonePremiumTeaserBlock";
import styles from "@/components/result/mbti/clone/mbtiDesktopClone.module.css";
import {
  fetchPersonalityDesktopCloneContent,
  type PersonalityDesktopCloneAssetSlot,
} from "@/lib/cms/personality-desktop-clone";
import type { Locale } from "@/lib/i18n/locales";
import type { MbtiResultProjectionViewModel } from "@/lib/mbti/publicProjection";

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

function normalizeText(...values: unknown[]) {
  for (const value of values) {
    const normalized = String(value ?? "").trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function resolvePrimaryOffer(offers: ResolvedOffer[]) {
  return offers.find((offer) => offer.moduleCodes.includes("core_full") || offer.key.toUpperCase().includes("REPORT_FULL"))
    ?? offers[0]
    ?? null;
}

type CompatibilityTeaserSource = StrengthWeaknessBlock | null | undefined;
type TeaserFallbackBlock = LockedListBlock | undefined;

function mapCompatibilityTeaserItems(source: CompatibilityTeaserSource): PremiumTeaserItem[] {
  if (!source || source.items.length === 0) {
    return [];
  }

  return source.items.map((item) => ({
    title: item.title,
    body: item.description,
    tone: "neutral",
  }));
}

function mapFallbackTeaserItems(fallback: TeaserFallbackBlock): PremiumTeaserItem[] {
  if (!fallback) {
    return [];
  }

  return fallback.blurredItems.map((item) => ({
    title: item.title,
    body: item.body,
    tone: item.tone,
    isPlaceholder: item.isPlaceholder,
  }));
}

function resolvePremiumTeaserItems(
  source: CompatibilityTeaserSource,
  fallback: TeaserFallbackBlock,
  locale: "zh" | "en",
): PremiumTeaserItem[] {
  const sourceItems = mapCompatibilityTeaserItems(source);
  const fallbackItems = mapFallbackTeaserItems(fallback);
  const selectedItems = sourceItems.length > 0 ? sourceItems : fallbackItems;

  const padded = [...selectedItems];
  const fallbackPool = fallbackItems.length > 0
    ? fallbackItems
    : [
        {
          title: locale === "zh" ? "更多专属内容" : "More tailored insights",
          body: locale === "zh" ? "解锁后查看完整章尾建议。" : "Unlock to view the full teaser content.",
          tone: "neutral" as const,
          isPlaceholder: true,
        },
      ];

  let cursor = 0;
  while (padded.length < 6) {
    const item = fallbackPool[cursor % fallbackPool.length];
    padded.push({
      ...item,
      isPlaceholder: true,
    });
    cursor += 1;
  }

  return padded.slice(0, 6);
}

function buildPremiumTeaserBlock({
  locale,
  zhTitle,
  source,
  fallback,
  testId,
}: {
  locale: "zh" | "en";
  zhTitle: string;
  source: CompatibilityTeaserSource;
  fallback: TeaserFallbackBlock;
  testId: string;
}) {
  const overlayTitle = locale === "zh" ? "解锁完整报告" : "Unlock full report";
  const overlayBody =
    locale === "zh"
      ? "解锁后查看本章完整解析与行动建议。"
      : "Unlock to view full chapter analysis and action guidance.";
  const overlayCtaLabel = locale === "zh" ? "解锁完整报告" : "Unlock full report";

  return {
    title: locale === "zh" ? zhTitle : normalizeText(source?.title, fallback?.title, zhTitle),
    items: resolvePremiumTeaserItems(source, fallback, locale),
    overlayTitle,
    overlayBody,
    overlayCtaLabel,
    testId,
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
  const fullCodeForStorage = useMemo(
    () => normalizeText(headline.typeCode, projectionViewModel?.displayType).toUpperCase() || "MBTI",
    [headline.typeCode, projectionViewModel?.displayType],
  );
  const [storageSnapshot, setStorageSnapshot] = useState<{
    locale: Locale;
    fullCode: string;
    content: MbtiDesktopCloneContent | null;
    assetSlots: PersonalityDesktopCloneAssetSlot[] | null;
  } | null>(null);
  const activeStorageSnapshot =
    storageSnapshot && storageSnapshot.locale === locale && storageSnapshot.fullCode === fullCodeForStorage
      ? storageSnapshot
      : null;
  const storageContent = activeStorageSnapshot?.content ?? null;
  const storageAssetSlots = activeStorageSnapshot?.assetSlots ?? null;

  useEffect(() => {
    let active = true;

    if (locale !== "zh") {
      return () => {
        active = false;
      };
    }

    void (async () => {
      const payload = await fetchPersonalityDesktopCloneContent(fullCodeForStorage, locale);
      if (active) {
        setStorageSnapshot({
          locale,
          fullCode: fullCodeForStorage,
          content: payload?.content ?? null,
          assetSlots: payload?.assetSlots ?? null,
        });
      }
    })();

    return () => {
      active = false;
    };
  }, [fullCodeForStorage, locale]);

  const slots = resolveMbtiDesktopCloneSlots({
    locale,
    headline,
    dimensions,
    highlights,
    sections,
    sectionUnlocks,
    offers,
    projectionViewModel,
    storageContent,
  });
  const primaryOffer = resolvePrimaryOffer(offers);

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
  const traitBodyParagraphs = slots.overview?.paragraphs ?? slots.traits.body;
  const traitBodySource = slots.overview ? "overview" : "traits";

  return (
    <div data-testid="mbti-desktop-clone-shell" className={styles.cloneRoot} data-base-code={slots.meta.baseCode}>
      <div className={styles.shell}>
        <MbtiCloneHero
          eyebrow={slots.hero.eyebrow}
          title={slots.hero.title}
          typeCode={slots.hero.typeCode}
          illustrationSlotId={slots.hero.asset.slotId}
          summary={slots.hero.summary}
          illustrationLabel={slots.hero.asset.label}
          assetSlots={storageAssetSlots}
        />

        <div className={styles.pageGrid}>
          <main className={styles.main}>
            <section className={styles.introBlock}>
              <p>{slots.intro.paragraphs[0]}</p>
              <p>{slots.intro.paragraphs[1]}</p>
            </section>

            <MbtiCloneTraitsSection
              title={slots.traits.title}
              illustrationSlotId={slots.traits.asset.slotId}
              illustrationLabel={slots.traits.asset.label}
              assetSlots={storageAssetSlots}
              dimensions={dimensions}
              summaryTitle={slots.traits.summaryPane.eyebrow}
              summaryValue={slots.traits.summaryPane.value}
              summaryLabel={slots.traits.summaryPane.title}
              summaryDescription={slots.traits.summaryPane.body}
              summarySlotId={slots.traits.summaryPane.asset.slotId}
              summarySlotLabel={slots.traits.summaryPane.asset.label}
              paragraphs={traitBodyParagraphs}
              bodySource={traitBodySource}
              tools={traitsTools}
            />

            <MbtiCloneNarrativeSection
              locale={cloneLocale}
              id="career"
              number={Number(slots.chapters.career.step)}
              title={slots.chapters.career.title}
              illustrationSlotId={slots.chapters.career.asset.slotId}
              illustrationLabel={slots.chapters.career.asset.label}
              assetSlots={storageAssetSlots}
              introParagraphs={slots.chapters.career.intro}
              strengths={slots.chapters.career.strengths}
              weaknesses={slots.chapters.career.weaknesses}
              matchedJobs={null}
              matchedGuides={null}
              traits={slots.chapters.career.influentialTraits}
              isUnlocked={isUnlocked}
              unlockHref="#offer-full"
              unlockLabel={primaryCtaLabel}
              premiumTeasers={[
                buildPremiumTeaserBlock({
                  locale: cloneLocale,
                  zhTitle: "你可能会喜欢的职业选择",
                  source: slots.chapters.career.careerIdeas,
                  fallback: slots.chapters.career.lockedBlocks[0],
                  testId: "mbti-premium-career-career-ideas",
                }),
                buildPremiumTeaserBlock({
                  locale: cloneLocale,
                  zhTitle: "适合你的工作方式",
                  source: slots.chapters.career.workStyles,
                  fallback: slots.chapters.career.lockedBlocks[1],
                  testId: "mbti-premium-career-work-styles",
                }),
              ]}
            />

            <MbtiCloneNarrativeSection
              locale={cloneLocale}
              id="growth"
              number={Number(slots.chapters.growth.step)}
              title={slots.chapters.growth.title}
              illustrationSlotId={slots.chapters.growth.asset.slotId}
              illustrationLabel={slots.chapters.growth.asset.label}
              assetSlots={storageAssetSlots}
              introParagraphs={slots.chapters.growth.intro}
              strengths={slots.chapters.growth.strengths}
              weaknesses={slots.chapters.growth.weaknesses}
              traits={slots.chapters.growth.influentialTraits}
              isUnlocked={isUnlocked}
              unlockHref="#offer-full"
              unlockLabel={primaryCtaLabel}
              premiumTeasers={[
                buildPremiumTeaserBlock({
                  locale: cloneLocale,
                  zhTitle: "什么能让你充满活力？",
                  source: slots.chapters.growth.whatEnergizes,
                  fallback: slots.chapters.growth.lockedBlocks[0],
                  testId: "mbti-premium-growth-what-energizes",
                }),
                buildPremiumTeaserBlock({
                  locale: cloneLocale,
                  zhTitle: "什么让你精力力竭？",
                  source: slots.chapters.growth.whatDrains,
                  fallback: slots.chapters.growth.lockedBlocks[1],
                  testId: "mbti-premium-growth-what-drains",
                }),
              ]}
            />

            <MbtiCloneNarrativeSection
              locale={cloneLocale}
              id="relationships"
              number={Number(slots.chapters.relationships.step)}
              title={slots.chapters.relationships.title}
              illustrationSlotId={slots.chapters.relationships.asset.slotId}
              illustrationLabel={slots.chapters.relationships.asset.label}
              assetSlots={storageAssetSlots}
              introParagraphs={slots.chapters.relationships.intro}
              strengths={slots.chapters.relationships.strengths}
              weaknesses={slots.chapters.relationships.weaknesses}
              traits={slots.chapters.relationships.influentialTraits}
              isUnlocked={isUnlocked}
              unlockHref="#offer-full"
              unlockLabel={primaryCtaLabel}
              premiumTeasers={[
                buildPremiumTeaserBlock({
                  locale: cloneLocale,
                  zhTitle: "你的人际关系优势",
                  source: slots.chapters.relationships.superpowers,
                  fallback: slots.chapters.relationships.lockedBlocks[0],
                  testId: "mbti-premium-relationships-superpowers",
                }),
                buildPremiumTeaserBlock({
                  locale: cloneLocale,
                  zhTitle: "人际关系陷阱",
                  source: slots.chapters.relationships.pitfalls,
                  fallback: slots.chapters.relationships.lockedBlocks[1],
                  testId: "mbti-premium-relationships-pitfalls",
                }),
              ]}
            />

            <section id="offer-full" data-testid="mbti-offer-full" className={styles.section}>
              <MbtiCloneFinalOffer
                locale={cloneLocale}
                eyebrow={slots.finalOffer.eyebrow}
                headline={slots.finalOffer.headline}
                copy={slots.finalOffer.body}
                priceLabel={slots.finalOffer.priceLabel}
                price={normalizeText(primaryOffer?.price) || (cloneLocale === "zh" ? "价格以实际结算页为准" : "Price shown on checkout")}
                guarantee={slots.finalOffer.guarantee}
                ctaLabel={normalizeText(primaryCtaLabel, slots.finalOffer.ctaLabel)}
                ctaHref={primaryCtaHref}
                isCheckingOut={isCheckingOut}
                checkoutError={checkoutError}
                onCheckout={primaryOffer ? onCheckout : undefined}
                isUnlocked={isUnlocked}
                unlockedNode={unlockedOfferNode}
                illustrationSlotId={slots.finalOffer.asset.slotId}
                illustrationLabel={slots.finalOffer.asset.label}
                assetSlots={storageAssetSlots}
              />
            </section>
          </main>

          <MbtiCloneRail
            locale={cloneLocale}
            displayName={normalizeText(headline.displayName, projectionViewModel?.typeName, slots.hero.title)}
            typeCode={slots.meta.fullCode}
            tags={tags}
            isUnlocked={isUnlocked}
            summary={slots.hero.summary}
            primaryCtaLabel={primaryCtaLabel}
            primaryCtaHref={primaryCtaHref}
            tools={railTools}
          />
        </div>
      </div>
    </div>
  );
}
