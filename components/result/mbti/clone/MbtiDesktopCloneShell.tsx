"use client";

import { type MouseEvent as ReactMouseEvent, type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import type { HighlightCard, MbtiSectionUnlock, ReportSection, ResolvedOffer, RichResultHeadline } from "@/components/result/RichResultReport";
import { MbtiCloneEnergyBlock } from "@/components/result/mbti/clone/MbtiCloneEnergyBlock";
import { MbtiCloneFinalOffer } from "@/components/result/mbti/clone/MbtiCloneFinalOffer";
import { MbtiCloneHero } from "@/components/result/mbti/clone/MbtiCloneHero";
import { MbtiCloneIdeaListBlock } from "@/components/result/mbti/clone/MbtiCloneIdeaListBlock";
import { MbtiCloneNarrativeSection } from "@/components/result/mbti/clone/MbtiCloneNarrativeSection";
import { MbtiCloneRail } from "@/components/result/mbti/clone/MbtiCloneRail";
import { MbtiCloneRelationshipInsightBlock } from "@/components/result/mbti/clone/MbtiCloneRelationshipInsightBlock";
import { MbtiCloneTraitsSection } from "@/components/result/mbti/clone/MbtiCloneTraitsSection";
import {
  getMbtiDesktopAnchorHash,
  getMbtiDesktopAnchorId,
} from "@/components/result/mbti/mbtiDesktopAnchorTargets";
import { resolveMbtiDesktopCloneSlots } from "@/components/result/mbti/clone/mbtiDesktopClone.resolve";
import type {
  EnergyBlock,
  LockedListBlock,
  MbtiDesktopCloneContent,
  RelationshipInsightBlock,
  StrengthWeaknessBlock,
} from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import type { PremiumTeaserItem } from "@/components/result/mbti/clone/MbtiClonePremiumTeaserBlock";
import styles from "@/components/result/mbti/clone/mbtiDesktopClone.module.css";
import {
  fetchPersonalityDesktopCloneContent,
  type PersonalityDesktopCloneAssetSlot,
} from "@/lib/cms/personality-desktop-clone";
import type { Locale } from "@/lib/i18n/locales";
import type { MbtiResultProjectionViewModel } from "@/lib/mbti/publicProjection";
import { assignWindowLocation } from "@/lib/browser/locationNavigation";

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
  lockedPayCtaLabel?: string;
  lockedInviteCtaLabel?: string;
  lockedInviteCtaHref?: string;
  onCheckout?: () => void | Promise<void>;
  isCheckingOut?: boolean;
  checkoutError?: string | null;
  unlockedOfferNode?: ReactNode;
  supplementaryNodes?: ReactNode[];
  recommendedReadsNode?: ReactNode;
  footerNode?: ReactNode;
  storageContentOverride?: MbtiDesktopCloneContent | null;
  storageAssetSlotsOverride?: PersonalityDesktopCloneAssetSlot[] | null;
  storageManagedExternally?: boolean;
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

type CompatibilityTeaserSource = StrengthWeaknessBlock | EnergyBlock | RelationshipInsightBlock | null | undefined;
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
      ? "解锁完整报告后即可查看这些结果，并纳入你的人格分析。"
      : "Unlock the full report to view these results and add them to your personality analysis.";
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

function withOverrideTitle<T extends { title: string }>(block: T | null | undefined, title: string): T | null {
  if (!block) {
    return null;
  }

  return {
    ...block,
    title,
  };
}

export function MbtiDesktopCloneShell({
  locale,
  headline,
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
  lockedPayCtaLabel,
  lockedInviteCtaLabel,
  lockedInviteCtaHref,
  onCheckout,
  isCheckingOut = false,
  checkoutError = null,
  unlockedOfferNode,
  supplementaryNodes = [],
  recommendedReadsNode = null,
  footerNode = null,
  storageContentOverride,
  storageAssetSlotsOverride,
  storageManagedExternally = false,
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
  const storageContent =
    storageContentOverride !== undefined ? storageContentOverride : activeStorageSnapshot?.content ?? null;
  const storageAssetSlots =
    storageAssetSlotsOverride !== undefined ? storageAssetSlotsOverride : activeStorageSnapshot?.assetSlots ?? null;

  useEffect(() => {
    let active = true;

    if (
      locale !== "zh"
      || storageManagedExternally
      || storageContentOverride !== undefined
      || storageAssetSlotsOverride !== undefined
    ) {
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
  }, [fullCodeForStorage, locale, storageAssetSlotsOverride, storageContentOverride, storageManagedExternally]);

  const traitDimensions = projectionViewModel?.dimensions?.length ? projectionViewModel.dimensions : dimensions;
  const slots = resolveMbtiDesktopCloneSlots({
    locale,
    headline,
    dimensions: traitDimensions,
    highlights,
    sections,
    sectionUnlocks,
    offers,
    projectionViewModel,
    storageContent,
  });
  const primaryOffer = resolvePrimaryOffer(offers);
  const unlockedCareerIdeaBlock = isUnlocked
    ? withOverrideTitle(
        slots.chapters.career.careerIdeas,
        cloneLocale === "zh" ? "你可能会喜欢的职业选择" : (slots.chapters.career.careerIdeas?.title ?? "Career Ideas"),
      )
    : null;
  const unlockedWorkStylesBlock = isUnlocked
    ? withOverrideTitle(
        slots.chapters.career.workStyles,
        cloneLocale === "zh" ? "适合你的工作方式" : (slots.chapters.career.workStyles?.title ?? "Work Styles"),
      )
    : null;
  const careerPostCoreBlocks: ReactNode[] = [];
  if (unlockedCareerIdeaBlock) {
    careerPostCoreBlocks.push(
      <MbtiCloneIdeaListBlock
        key="career-ideas"
        data={unlockedCareerIdeaBlock}
        testId="mbti-p1-career-career-ideas"
      />,
    );
  }
  if (unlockedWorkStylesBlock) {
    careerPostCoreBlocks.push(
      <MbtiCloneIdeaListBlock
        key="career-work-styles"
        data={unlockedWorkStylesBlock}
        testId="mbti-p1-career-work-styles"
      />,
    );
  }
  const unlockedWhatEnergizesBlock = isUnlocked
    ? withOverrideTitle(
        slots.chapters.growth.whatEnergizes,
        cloneLocale === "zh" ? "什么能让你充满活力？" : (slots.chapters.growth.whatEnergizes?.title ?? "What Energizes You"),
      )
    : null;
  const unlockedWhatDrainsBlock = isUnlocked
    ? withOverrideTitle(
        slots.chapters.growth.whatDrains,
        cloneLocale === "zh" ? "什么让你精力力竭？" : (slots.chapters.growth.whatDrains?.title ?? "What Drains You"),
      )
    : null;
  const growthPostCoreBlocks: ReactNode[] = [];
  if (unlockedWhatEnergizesBlock) {
    growthPostCoreBlocks.push(
      <MbtiCloneEnergyBlock
        key="growth-what-energizes"
        locale={cloneLocale}
        data={unlockedWhatEnergizesBlock}
        testId="mbti-p1-growth-what-energizes"
      />,
    );
  }
  if (unlockedWhatDrainsBlock) {
    growthPostCoreBlocks.push(
      <MbtiCloneEnergyBlock
        key="growth-what-drains"
        locale={cloneLocale}
        data={unlockedWhatDrainsBlock}
        testId="mbti-p1-growth-what-drains"
      />,
    );
  }
  const unlockedSuperpowersBlock = isUnlocked
    ? withOverrideTitle(
        slots.chapters.relationships.superpowers,
        cloneLocale === "zh" ? "你的人际关系优势" : (slots.chapters.relationships.superpowers?.title ?? "Your Relationship Superpowers"),
      )
    : null;
  const unlockedPitfallsBlock = isUnlocked
    ? withOverrideTitle(
        slots.chapters.relationships.pitfalls,
        cloneLocale === "zh" ? "人际关系陷阱" : (slots.chapters.relationships.pitfalls?.title ?? "Relationship Pitfalls"),
      )
    : null;
  const relationshipsPostCoreBlocks: ReactNode[] = [];
  if (unlockedSuperpowersBlock) {
    relationshipsPostCoreBlocks.push(
      <MbtiCloneRelationshipInsightBlock
        key="relationships-superpowers"
        locale={cloneLocale}
        data={unlockedSuperpowersBlock}
        testId="mbti-p1-relationships-superpowers"
      />,
    );
  }
  if (unlockedPitfallsBlock) {
    relationshipsPostCoreBlocks.push(
      <MbtiCloneRelationshipInsightBlock
        key="relationships-pitfalls"
        locale={cloneLocale}
        data={unlockedPitfallsBlock}
        testId="mbti-p1-relationships-pitfalls"
      />,
    );
  }

  const desktopOfferHref = getMbtiDesktopAnchorHash("offerFull");
  const sectionPayCtaLabel = lockedPayCtaLabel
    ?? (cloneLocale === "zh" ? "1.99元直接解锁" : "Unlock now ¥1.99");
  const normalizedInviteCtaHref = normalizeText(lockedInviteCtaHref);
  const inviteCtaAvailable = normalizedInviteCtaHref.length > 0 && !normalizedInviteCtaHref.startsWith("#");
  const defaultInviteCtaLabel = lockedInviteCtaLabel
    ?? (cloneLocale === "zh" ? "邀2人测完领报告" : "Invite 2 friends to unlock");
  const sectionInviteCtaHref = inviteCtaAvailable ? normalizedInviteCtaHref : "";
  const [inviteCtaStatus, setInviteCtaStatus] = useState<"idle" | "copying" | "copied" | "failed">("idle");
  const sectionInviteCtaLabel =
    !inviteCtaAvailable
      ? undefined
      : inviteCtaStatus === "copying"
      ? (cloneLocale === "zh" ? "正在复制邀请链接..." : "Copying invite link...")
      : inviteCtaStatus === "copied"
      ? (cloneLocale === "zh" ? "已复制邀请链接" : "Invite link copied")
      : inviteCtaStatus === "failed"
      ? (cloneLocale === "zh" ? "复制失败，点击打开邀请页" : "Copy failed, open invite page")
      : defaultInviteCtaLabel;
  const inviteCtaFallbackHint =
    inviteCtaAvailable && inviteCtaStatus === "failed"
      ? (cloneLocale === "zh"
          ? "复制失败，请手动打开邀请页或手动复制链接。"
          : "Copy failed. Open the invite page or copy the link manually.")
      : null;
  const desktopEntryHref = isUnlocked ? primaryCtaHref : desktopOfferHref;
  const desktopWorkspaceHref = isUnlocked ? workspaceHref : desktopOfferHref;

  useEffect(() => {
    if (inviteCtaStatus !== "copied") {
      return;
    }

    const timer = window.setTimeout(() => {
      setInviteCtaStatus("idle");
    }, 2400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [inviteCtaStatus]);

  const handleInviteCtaClick = useCallback(
    (event: ReactMouseEvent<HTMLAnchorElement>) => {
      if (!inviteCtaAvailable || typeof window === "undefined") {
        return;
      }

      event.preventDefault();

      if (inviteCtaStatus === "copying") {
        return;
      }

      const targetHref = sectionInviteCtaHref.trim();
      if (!targetHref) {
        setInviteCtaStatus("failed");
        return;
      }

      if (inviteCtaStatus === "failed") {
        assignWindowLocation(targetHref);
        return;
      }

      setInviteCtaStatus("copying");

      const absoluteHref = /^https?:\/\//i.test(targetHref)
        ? targetHref
        : new URL(targetHref, window.location.origin).toString();

      void (async () => {
        try {
          if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(absoluteHref);
            setInviteCtaStatus("copied");
            return;
          }
        } catch {
          // Keep user in place and show explicit fallback actions.
        }

        setInviteCtaStatus("failed");
      })();
    },
    [inviteCtaAvailable, inviteCtaStatus, sectionInviteCtaHref]
  );

  const railTools: DesktopCloneTool[] = [
    { label: shareCtaLabel, onClick: onShare, disabled: shareDisabled },
    { label: cloneLocale === "zh" ? "重测" : "Retest", href: retakeHref },
    ...(historyHref ? [{ label: cloneLocale === "zh" ? "历史" : "History", href: historyHref }] : []),
    ...(desktopWorkspaceHref && desktopWorkspaceHref !== historyHref
      ? [{ label: cloneLocale === "zh" ? "工作台" : "Workspace", href: desktopWorkspaceHref }]
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
  const traitsToolsPrompt = cloneLocale === "zh"
    ? "你可以继续保存、导出或查看历史结果。"
    : "You can save, export, or revisit this result.";
  const traitBodyParagraphs = slots.overview?.paragraphs ?? slots.traits.body;
  const traitBodySource = slots.overview ? "overview" : "traits";

  return (
    <div data-testid="mbti-desktop-clone-shell" className={styles.cloneRoot} data-base-code={slots.meta.baseCode}>
      <div className={styles.shell}>
        <MbtiCloneHero
          badge={headline.badge}
          eyebrow={slots.hero.eyebrow}
          profileIdentity={slots.hero.profileIdentity}
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
              locale={locale}
              title={slots.traits.title}
              illustrationSlotId={slots.traits.asset.slotId}
              illustrationLabel={slots.traits.asset.label}
              assetSlots={storageAssetSlots}
              dimensions={traitDimensions}
              summaryTitleFallback={slots.traits.summaryPane.eyebrow}
              summaryValueFallback={slots.traits.summaryPane.value}
              summaryLabelFallback={slots.traits.summaryPane.title}
              summaryDescriptionFallback={slots.traits.summaryPane.body}
              summarySlotId={slots.traits.summaryPane.asset.slotId}
              summarySlotLabel={slots.traits.summaryPane.asset.label}
              axisExplainers={storageContent?.traits.axisExplainers ?? null}
              paragraphs={traitBodyParagraphs}
              bodySource={traitBodySource}
              tools={traitsTools}
              toolsPrompt={traitsToolsPrompt}
            />

            <MbtiCloneNarrativeSection
              locale={cloneLocale}
              id="career"
              anchorId={getMbtiDesktopAnchorId("career")}
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
              traitsUnlock={slots.chapters.career.traitsUnlock}
              isUnlocked={isUnlocked}
              unlockHref={desktopOfferHref}
              unlockPayLabel={sectionPayCtaLabel}
              unlockInviteLabel={sectionInviteCtaLabel}
              unlockInviteHref={inviteCtaAvailable ? sectionInviteCtaHref : undefined}
              onInviteCtaClick={inviteCtaAvailable ? handleInviteCtaClick : undefined}
              postCoreBlocks={careerPostCoreBlocks}
              premiumTeasers={isUnlocked ? [] : [
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
              anchorId={getMbtiDesktopAnchorId("growth")}
              number={Number(slots.chapters.growth.step)}
              title={slots.chapters.growth.title}
              illustrationSlotId={slots.chapters.growth.asset.slotId}
              illustrationLabel={slots.chapters.growth.asset.label}
              assetSlots={storageAssetSlots}
              introParagraphs={slots.chapters.growth.intro}
              strengths={slots.chapters.growth.strengths}
              weaknesses={slots.chapters.growth.weaknesses}
              traits={slots.chapters.growth.influentialTraits}
              traitsUnlock={slots.chapters.growth.traitsUnlock}
              isUnlocked={isUnlocked}
              unlockHref={desktopOfferHref}
              unlockPayLabel={sectionPayCtaLabel}
              unlockInviteLabel={sectionInviteCtaLabel}
              unlockInviteHref={inviteCtaAvailable ? sectionInviteCtaHref : undefined}
              onInviteCtaClick={inviteCtaAvailable ? handleInviteCtaClick : undefined}
              postCoreBlocks={growthPostCoreBlocks}
              premiumTeasers={isUnlocked ? [] : [
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
              anchorId={getMbtiDesktopAnchorId("relationships")}
              number={Number(slots.chapters.relationships.step)}
              title={slots.chapters.relationships.title}
              illustrationSlotId={slots.chapters.relationships.asset.slotId}
              illustrationLabel={slots.chapters.relationships.asset.label}
              assetSlots={storageAssetSlots}
              introParagraphs={slots.chapters.relationships.intro}
              strengths={slots.chapters.relationships.strengths}
              weaknesses={slots.chapters.relationships.weaknesses}
              traits={slots.chapters.relationships.influentialTraits}
              traitsUnlock={slots.chapters.relationships.traitsUnlock}
              isUnlocked={isUnlocked}
              unlockHref={desktopOfferHref}
              unlockPayLabel={sectionPayCtaLabel}
              unlockInviteLabel={sectionInviteCtaLabel}
              unlockInviteHref={inviteCtaAvailable ? sectionInviteCtaHref : undefined}
              onInviteCtaClick={inviteCtaAvailable ? handleInviteCtaClick : undefined}
              postCoreBlocks={relationshipsPostCoreBlocks}
              premiumTeasers={isUnlocked ? [] : [
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

            {supplementaryNodes.map((node, index) => (
              <div key={`mbti-clone-supplementary-${index}`}>{node}</div>
            ))}

            <section id={getMbtiDesktopAnchorId("offerFull")} data-testid="mbti-offer-full" className={styles.section}>
              <MbtiCloneFinalOffer
                locale={cloneLocale}
                eyebrow={slots.finalOffer.eyebrow}
                headline={slots.finalOffer.headline}
                copy={slots.finalOffer.body}
                priceLabel={slots.finalOffer.priceLabel}
                price={normalizeText(primaryOffer?.price) || (cloneLocale === "zh" ? "价格以实际结算页为准" : "Price shown on checkout")}
                guarantee={slots.finalOffer.guarantee}
                ctaLabel={isUnlocked ? normalizeText(primaryCtaLabel, slots.finalOffer.ctaLabel) : sectionPayCtaLabel}
                ctaHref={primaryCtaHref}
                inviteCtaLabel={sectionInviteCtaLabel}
                inviteCtaHref={inviteCtaAvailable ? sectionInviteCtaHref : undefined}
                onInviteCtaClick={inviteCtaAvailable ? handleInviteCtaClick : undefined}
                inviteCtaDisabled={inviteCtaAvailable && inviteCtaStatus === "copying"}
                inviteFallbackHint={inviteCtaFallbackHint}
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

            {recommendedReadsNode ? <div>{recommendedReadsNode}</div> : null}
            {footerNode ? <div>{footerNode}</div> : null}
          </main>

          <MbtiCloneRail
            locale={cloneLocale}
            profileIdentity={slots.hero.profileIdentity}
            primaryCtaLabel={primaryCtaLabel}
            primaryCtaHref={desktopEntryHref}
            tools={railTools}
          />
        </div>
      </div>
    </div>
  );
}
