"use client";

import { type MouseEvent as ReactMouseEvent, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH } from "@/components/result/mbti/clone/mbtiDesktopClone.placeholders";
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
  type AttemptInviteUnlockProgressView,
  normalizeAttemptInviteUnlockProgress,
  resolveInviteUnlockUrl,
} from "@/lib/access/inviteUnlock";
import { createAttemptInviteUnlock } from "@/lib/api/v0_3";
import { trackEvent } from "@/lib/analytics";
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
  inviteUnlockAttemptId?: string;
  inviteUnlockProgress?: AttemptInviteUnlockProgressView | null;
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
  canLoadDesktopCloneStorage?: boolean;
};

const LEGACY_OFFER_SECTION_ID = "offer-full";

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

type InviteProgressDisplayModel = {
  showProgressCard: boolean;
  badge: string;
  progressLabel: string;
  progressHint: string;
  defaultInviteCtaLabel: string;
};

function resolveInviteProgressDisplay({
  locale,
  isUnlocked,
  progress,
}: {
  locale: "zh" | "en";
  isUnlocked: boolean;
  progress: AttemptInviteUnlockProgressView | null;
}): InviteProgressDisplayModel {
  const requiredInvitees = Math.max(1, progress?.requiredInvitees ?? 2);
  const stageFallbackCompleted =
    progress?.unlockStage === "full"
      ? requiredInvitees
      : progress?.unlockStage === "partial"
      ? Math.min(requiredInvitees, 1)
      : 0;
  const completedInvitees = Math.max(
    0,
    Math.min(requiredInvitees, progress?.completedInvitees ?? stageFallbackCompleted)
  );
  const unlockStage =
    progress?.unlockStage
    ?? (completedInvitees >= requiredInvitees ? "full" : completedInvitees > 0 ? "partial" : "locked");
  const unlockSource = progress?.unlockSource ?? "none";
  const remainingInvitees = Math.max(0, requiredInvitees - completedInvitees);
  const inviteDrivenFullUnlock =
    unlockStage === "full" && (unlockSource === "invite" || unlockSource === "mixed" || completedInvitees >= requiredInvitees);
  const showProgressCard =
    !isUnlocked
    || completedInvitees > 0
    || unlockStage === "partial"
    || inviteDrivenFullUnlock
    || unlockSource === "invite"
    || unlockSource === "mixed";

  if (locale === "zh") {
    const progressLabel = `已完成 ${completedInvitees}/${requiredInvitees}`;
    if (unlockStage === "full" || completedInvitees >= requiredInvitees) {
      return {
        showProgressCard,
        badge: "邀请解锁进度",
        progressLabel,
        progressHint: "完整报告已免费解锁",
        defaultInviteCtaLabel: "完整报告已免费解锁",
      };
    }

    if (unlockStage === "partial" || completedInvitees > 0) {
      return {
        showProgressCard,
        badge: unlockStage === "partial" ? "已部分解锁" : "邀请解锁进度",
        progressLabel,
        progressHint: `已部分解锁（职业推荐）；再邀请 ${Math.max(1, remainingInvitees)} 人即可解锁完整报告`,
        defaultInviteCtaLabel: `再邀${Math.max(1, remainingInvitees)}人解锁完整报告`,
      };
    }

    return {
      showProgressCard,
      badge: "邀请解锁进度",
      progressLabel,
      progressHint: `邀请 ${requiredInvitees} 人完成测试即可免费解锁完整报告`,
      defaultInviteCtaLabel: `邀${requiredInvitees}人测完领报告`,
    };
  }

  const progressLabel = `${completedInvitees}/${requiredInvitees} completed`;
  if (unlockStage === "full" || completedInvitees >= requiredInvitees) {
    return {
      showProgressCard,
      badge: "Invite progress",
      progressLabel,
      progressHint: "The full report is now unlocked for free.",
      defaultInviteCtaLabel: "Full report unlocked",
    };
  }

  if (unlockStage === "partial" || completedInvitees > 0) {
    return {
      showProgressCard,
      badge: unlockStage === "partial" ? "Partially unlocked" : "Invite progress",
      progressLabel,
      progressHint: `Career is unlocked. Invite ${Math.max(1, remainingInvitees)} more to unlock the full report.`,
      defaultInviteCtaLabel: `Invite ${Math.max(1, remainingInvitees)} more to unlock`,
    };
  }

  return {
    showProgressCard,
    badge: "Invite progress",
    progressLabel,
    progressHint: `Invite ${requiredInvitees} friends to complete the test and unlock the full report for free.`,
    defaultInviteCtaLabel: `Invite ${requiredInvitees} friends to unlock`,
  };
}

function readIsMobileViewport() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia("(max-width: 860px)").matches;
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
  inviteUnlockAttemptId,
  inviteUnlockProgress = null,
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
  canLoadDesktopCloneStorage,
}: MbtiDesktopCloneShellProps) {
  const cloneLocale = locale === "zh" ? "zh" : "en";
  const shouldLoadDesktopCloneStorage = canLoadDesktopCloneStorage ?? isUnlocked;
  const initialMobileViewport = useMemo(() => readIsMobileViewport(), []);
  const [isMobileViewport, setIsMobileViewport] = useState(initialMobileViewport);
  const [isDeepContentReady, setIsDeepContentReady] = useState(!initialMobileViewport);
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
  const storageContent = shouldLoadDesktopCloneStorage
    ? storageContentOverride !== undefined ? storageContentOverride : activeStorageSnapshot?.content ?? null
    : null;
  const storageAssetSlots = shouldLoadDesktopCloneStorage
    ? storageAssetSlotsOverride !== undefined ? storageAssetSlotsOverride : activeStorageSnapshot?.assetSlots ?? null
    : null;

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 860px)");
    const syncViewport = () => {
      setIsMobileViewport(mediaQuery.matches);
    };

    syncViewport();
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncViewport);
      return () => mediaQuery.removeEventListener("change", syncViewport);
    }

    mediaQuery.addListener(syncViewport);
    return () => mediaQuery.removeListener(syncViewport);
  }, []);

  useEffect(() => {
    if (!isMobileViewport) {
      setIsDeepContentReady(true);
      return;
    }

    setIsDeepContentReady(false);
    if (typeof window.requestAnimationFrame !== "function") {
      const timerId = window.setTimeout(() => {
        setIsDeepContentReady(true);
      }, 16);
      return () => {
        window.clearTimeout(timerId);
      };
    }

    const rafId = window.requestAnimationFrame(() => {
      setIsDeepContentReady(true);
    });

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [fullCodeForStorage, isMobileViewport]);

  useEffect(() => {
    let active = true;

    if (
      locale !== "zh"
      || !shouldLoadDesktopCloneStorage
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
  }, [
    fullCodeForStorage,
    locale,
    shouldLoadDesktopCloneStorage,
    storageAssetSlotsOverride,
    storageContentOverride,
    storageManagedExternally,
  ]);

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
  const inviteHrefFromProps =
    normalizedInviteCtaHref.length > 0 && !normalizedInviteCtaHref.startsWith("#")
      ? normalizedInviteCtaHref
      : "";
  const inviteCodeFromProps = normalizeText(inviteUnlockProgress?.inviteCode);
  const hasInviteFromProps = inviteHrefFromProps.length > 0 || inviteCodeFromProps.length > 0;
  const inviteProgressDisplay = resolveInviteProgressDisplay({
    locale: cloneLocale,
    isUnlocked,
    progress: inviteUnlockProgress,
  });
  const defaultInviteCtaLabel = lockedInviteCtaLabel
    ?? inviteProgressDisplay.defaultInviteCtaLabel;
  const [runtimeInviteState, setRuntimeInviteState] = useState(() => ({
    inviteHref: inviteHrefFromProps,
    inviteCode: inviteCodeFromProps,
    hasInvite: hasInviteFromProps,
  }));
  const sectionInviteCtaHref = runtimeInviteState.inviteHref || inviteHrefFromProps;
  const sectionInviteCode = runtimeInviteState.inviteCode || inviteCodeFromProps;
  const hasInvite = runtimeInviteState.hasInvite || hasInviteFromProps || sectionInviteCtaHref.length > 0 || sectionInviteCode.length > 0;
  const inviteCtaRenderHref = sectionInviteCtaHref
    || (cloneLocale === "zh"
      ? "/zh/tests/mbti-personality-test-16-personality-types/take"
      : "/en/tests/mbti-personality-test-16-personality-types/take");
  const inviteCreateInFlightRef = useRef<Promise<string> | null>(null);
  const primaryCtaReadyTrackedRef = useRef(false);
  const [inviteCtaStatus, setInviteCtaStatus] = useState<
    "idle" | "creating" | "copying" | "copied" | "copy_failed" | "create_failed"
  >("idle");
  const sectionInviteCtaLabel =
    inviteCtaStatus === "creating"
      ? (cloneLocale === "zh" ? "正在创建邀请链接..." : "Creating invite link...")
      : inviteCtaStatus === "copying"
      ? (cloneLocale === "zh" ? "正在复制邀请链接..." : "Copying invite link...")
      : inviteCtaStatus === "copied"
      ? (cloneLocale === "zh" ? "已复制邀请链接" : "Invite link copied")
      : inviteCtaStatus === "copy_failed"
      ? (cloneLocale === "zh" ? "复制失败，点击打开邀请页" : "Copy failed, open invite page")
      : inviteCtaStatus === "create_failed"
      ? (cloneLocale === "zh" ? "创建失败，点击重试" : "Create failed, click to retry")
      : defaultInviteCtaLabel;
  const inviteCtaFallbackHint =
    inviteCtaStatus === "copy_failed"
      ? (cloneLocale === "zh"
          ? "复制失败，请手动打开邀请页或手动复制链接。"
          : "Copy failed. Open the invite page or copy the link manually.")
      : inviteCtaStatus === "create_failed"
      ? (cloneLocale === "zh"
          ? "创建邀请链接失败，请重试。若持续失败，请稍后再试。"
          : "Failed to create invite link. Retry, or try again later.")
      : null;
  const inviteCtaBusy = inviteCtaStatus === "creating" || inviteCtaStatus === "copying";
  const desktopEntryHref = isUnlocked ? primaryCtaHref : desktopOfferHref;
  const desktopWorkspaceHref = isUnlocked ? workspaceHref : desktopOfferHref;
  const unlockedPdfHref = isUnlocked && pdfReady ? pdfHref : "";
  const unlockedOrderDetailHref = isUnlocked ? orderDetailHref : "";
  const unlockedRelationshipHref = isUnlocked ? relationshipHref : "";

  useEffect(() => {
    if (inviteHrefFromProps || inviteCodeFromProps) {
      setRuntimeInviteState((previous) => ({
        inviteHref: inviteHrefFromProps || previous.inviteHref,
        inviteCode: inviteCodeFromProps || previous.inviteCode,
        hasInvite: true,
      }));
    }
  }, [inviteCodeFromProps, inviteHrefFromProps]);

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

  useEffect(() => {
    if (primaryCtaReadyTrackedRef.current) {
      return;
    }

    if (!primaryCtaLabel || !desktopEntryHref) {
      return;
    }

    primaryCtaReadyTrackedRef.current = true;
    trackEvent("ui_report_loading_phase", {
      scale_code: "MBTI",
      phase: "result_primary_cta_ready",
      stage_detail: isUnlocked ? "workspace_entry_ready" : "unlock_entry_ready",
      locked: !isUnlocked,
      variant: normalizeText(headline.typeCode) || undefined,
      locale,
    });
  }, [desktopEntryHref, headline.typeCode, isUnlocked, locale, primaryCtaLabel]);

  const handleInviteCtaClick = useCallback(
    (event: ReactMouseEvent<HTMLAnchorElement>) => {
      if (typeof window === "undefined") {
        return;
      }

      event.preventDefault();

      if (inviteCtaStatus === "creating" || inviteCtaStatus === "copying") {
        return;
      }

      void (async () => {
        let targetHref = sectionInviteCtaHref.trim();
        if (!targetHref) {
          if (!inviteUnlockAttemptId) {
            setInviteCtaStatus("create_failed");
            trackEvent("invite_create_failed", {
              scale_code: "MBTI",
              attempt_id: "",
              reason: "missing_attempt_id",
            });
            return;
          }

          const existingCreateTask = inviteCreateInFlightRef.current;
          if (existingCreateTask) {
            setInviteCtaStatus("creating");
            try {
              targetHref = await existingCreateTask;
            } catch {
              setInviteCtaStatus("create_failed");
              return;
            }
          } else {
            setInviteCtaStatus("creating");
            trackEvent("invite_create_start", {
              scale_code: "MBTI",
              attempt_id: inviteUnlockAttemptId,
              has_invite: hasInvite,
            });
            const createTask = (async () => {
              const createdProgress = await createAttemptInviteUnlock({
                attemptId: inviteUnlockAttemptId,
                locale,
              });
              const normalizedProgress = normalizeAttemptInviteUnlockProgress(createdProgress, locale);
              const resolvedInviteHref = normalizeText(resolveInviteUnlockUrl({
                progress: normalizedProgress,
                locale,
              }));
              const resolvedInviteCode = normalizeText(normalizedProgress?.inviteCode);
              const createdHasInvite = Boolean(resolvedInviteHref || resolvedInviteCode);
              if (!resolvedInviteHref || resolvedInviteHref.startsWith("#") || !createdHasInvite) {
                throw new Error("invite_link_missing");
              }
              setRuntimeInviteState({
                inviteHref: resolvedInviteHref,
                inviteCode: resolvedInviteCode,
                hasInvite: true,
              });
              trackEvent("invite_create_success", {
                scale_code: "MBTI",
                attempt_id: inviteUnlockAttemptId,
                has_invite: true,
              });
              return resolvedInviteHref;
            })();
            inviteCreateInFlightRef.current = createTask;
            try {
              targetHref = await createTask;
            } catch {
              trackEvent("invite_create_failed", {
                scale_code: "MBTI",
                attempt_id: inviteUnlockAttemptId,
                reason: "request_failed",
              });
              setInviteCtaStatus("create_failed");
              return;
            } finally {
              inviteCreateInFlightRef.current = null;
            }
          }
        }

        if (inviteCtaStatus === "copy_failed") {
          trackEvent("invite_share_or_copy", {
            scale_code: "MBTI",
            attempt_id: inviteUnlockAttemptId ?? "",
            action: "open_invite_page",
          });
          assignWindowLocation(targetHref);
          return;
        }

        setInviteCtaStatus("copying");
        const absoluteHref = /^https?:\/\//i.test(targetHref)
          ? targetHref
          : new URL(targetHref, window.location.origin).toString();

        try {
          if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(absoluteHref);
            trackEvent("invite_share_or_copy", {
              scale_code: "MBTI",
              attempt_id: inviteUnlockAttemptId ?? "",
              action: "copy",
            });
            setInviteCtaStatus("copied");
            return;
          }
        } catch {
          // Keep user in place and show explicit fallback actions.
        }

        setInviteCtaStatus("copy_failed");
      })();
    },
    [hasInvite, inviteCtaStatus, inviteUnlockAttemptId, locale, sectionInviteCtaHref]
  );

  const railTools: DesktopCloneTool[] = [
    { label: shareCtaLabel, onClick: onShare, disabled: shareDisabled },
    { label: cloneLocale === "zh" ? "重测" : "Retest", href: retakeHref },
    ...(historyHref ? [{ label: cloneLocale === "zh" ? "历史" : "History", href: historyHref }] : []),
    ...(desktopWorkspaceHref && desktopWorkspaceHref !== historyHref
      ? [{ label: cloneLocale === "zh" ? "工作台" : "Workspace", href: desktopWorkspaceHref }]
      : []),
    ...(unlockedPdfHref ? [{ label: "PDF", href: unlockedPdfHref }] : []),
    ...(orderLookupHref ? [{ label: cloneLocale === "zh" ? "订单" : "Orders", href: orderLookupHref }] : []),
    ...(unlockedOrderDetailHref ? [{ label: cloneLocale === "zh" ? "详情" : "Detail", href: unlockedOrderDetailHref }] : []),
    ...(unlockedRelationshipHref ? [{ label: cloneLocale === "zh" ? "关系" : "Compare", href: unlockedRelationshipHref }] : []),
  ];

  const traitsTools: DesktopCloneTool[] = [
    { label: shareCtaLabel, onClick: onShare, disabled: shareDisabled },
    ...(unlockedPdfHref ? [{ label: cloneLocale === "zh" ? "导出 PDF" : "Export PDF", href: unlockedPdfHref }] : []),
    ...(historyHref ? [{ label: cloneLocale === "zh" ? "查看历史" : "History", href: historyHref }] : []),
  ];
  const traitsToolsPrompt = cloneLocale === "zh"
    ? "你可以继续保存、导出或查看历史结果。"
    : "You can save, export, or revisit this result.";
  const traitBodyParagraphs = slots.overview?.paragraphs ?? slots.traits.body;
  const traitBodySource = slots.overview ? "overview" : "traits";
  const showTopInviteProgress = isMobileViewport && inviteProgressDisplay.showProgressCard;
  const deepContentPlaceholderLabel = cloneLocale === "zh"
    ? "正在加载详细章节..."
    : "Loading detailed chapters...";
  const deepContentPlaceholderHint = cloneLocale === "zh"
    ? "首屏先展示类型、解锁状态与关键入口。"
    : "Showing type, unlock status, and key actions first.";
  const finalOfferNode = (
    <section id={LEGACY_OFFER_SECTION_ID} data-testid="mbti-offer-full" className={styles.section}>
      <div id={getMbtiDesktopAnchorId("offerFull")}>
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
        inviteCtaHref={inviteCtaRenderHref}
        onInviteCtaClick={handleInviteCtaClick}
        inviteCtaDisabled={inviteCtaBusy}
        inviteFallbackHint={inviteCtaFallbackHint}
        inviteProgressVisible={inviteProgressDisplay.showProgressCard}
        inviteProgressBadge={inviteProgressDisplay.badge}
        inviteProgressLabel={inviteProgressDisplay.progressLabel}
        inviteProgressHint={inviteProgressDisplay.progressHint}
        isCheckingOut={isCheckingOut}
        checkoutError={checkoutError}
        onCheckout={primaryOffer ? onCheckout : undefined}
        isUnlocked={isUnlocked}
        unlockedNode={unlockedOfferNode}
        illustrationSlotId={slots.finalOffer.asset.slotId}
        illustrationLabel={slots.finalOffer.asset.label}
        assetSlots={storageAssetSlots}
      />
      </div>
    </section>
  );
  const deepNarrativeSectionsNode = (
    <>
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
        unlockInviteHref={inviteCtaRenderHref}
        onInviteCtaClick={handleInviteCtaClick}
        postCoreBlocks={careerPostCoreBlocks}
        premiumTeasers={isUnlocked ? [] : [
          buildPremiumTeaserBlock({
            locale: cloneLocale,
            zhTitle: "你可能会喜欢的职业选择",
            source: null,
            fallback: MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH.chapters.career.lockedBlocks[0],
            testId: "mbti-premium-career-career-ideas",
          }),
          buildPremiumTeaserBlock({
            locale: cloneLocale,
            zhTitle: "适合你的工作方式",
            source: null,
            fallback: MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH.chapters.career.lockedBlocks[1],
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
        unlockInviteHref={inviteCtaRenderHref}
        onInviteCtaClick={handleInviteCtaClick}
        postCoreBlocks={growthPostCoreBlocks}
        premiumTeasers={isUnlocked ? [] : [
          buildPremiumTeaserBlock({
            locale: cloneLocale,
            zhTitle: "什么能让你充满活力？",
            source: null,
            fallback: MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH.chapters.growth.lockedBlocks[0],
            testId: "mbti-premium-growth-what-energizes",
          }),
          buildPremiumTeaserBlock({
            locale: cloneLocale,
            zhTitle: "什么让你精力力竭？",
            source: null,
            fallback: MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH.chapters.growth.lockedBlocks[1],
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
        unlockInviteHref={inviteCtaRenderHref}
        onInviteCtaClick={handleInviteCtaClick}
        postCoreBlocks={relationshipsPostCoreBlocks}
        premiumTeasers={isUnlocked ? [] : [
          buildPremiumTeaserBlock({
            locale: cloneLocale,
            zhTitle: "你的人际关系优势",
            source: null,
            fallback: MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH.chapters.relationships.lockedBlocks[0],
            testId: "mbti-premium-relationships-superpowers",
          }),
          buildPremiumTeaserBlock({
            locale: cloneLocale,
            zhTitle: "人际关系陷阱",
            source: null,
            fallback: MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH.chapters.relationships.lockedBlocks[1],
            testId: "mbti-premium-relationships-pitfalls",
          }),
        ]}
      />

      {supplementaryNodes.map((node, index) => (
        <div key={`mbti-clone-supplementary-${index}`}>{node}</div>
      ))}
    </>
  );
  const trailingNodes = (
    <>
      {recommendedReadsNode ? <div>{recommendedReadsNode}</div> : null}
      {footerNode ? <div>{footerNode}</div> : null}
    </>
  );

  return (
    <div
      data-testid="mbti-desktop-clone-shell"
      className={styles.cloneRoot}
      data-base-code={slots.meta.baseCode}
      data-invite-has-invite={hasInvite ? "true" : "false"}
      data-invite-code={sectionInviteCode || undefined}
      data-invite-href={sectionInviteCtaHref || undefined}
    >
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

            {showTopInviteProgress ? (
              <section data-testid="mbti-invite-progress-summary-top" className={styles.mobileInviteSummary}>
                <p className={styles.mobileInviteSummaryBadge}>{inviteProgressDisplay.badge}</p>
                <p className={styles.mobileInviteSummaryLabel}>{inviteProgressDisplay.progressLabel}</p>
                <p className={styles.mobileInviteSummaryHint}>{inviteProgressDisplay.progressHint}</p>
                {!isUnlocked ? (
                  <a href={desktopOfferHref} className={styles.mobileInviteSummaryLink}>
                    {cloneLocale === "zh" ? "去解锁入口" : "Go to unlock entry"}
                  </a>
                ) : null}
              </section>
            ) : null}

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

            {isMobileViewport ? finalOfferNode : null}
            {isDeepContentReady ? deepNarrativeSectionsNode : (
              <section
                data-testid="mbti-deferred-content-placeholder"
                data-pdf-placeholder="true"
                className={styles.deferredContentPlaceholder}
              >
                <p className={styles.deferredContentPlaceholderTitle}>{deepContentPlaceholderLabel}</p>
                <p className={styles.deferredContentPlaceholderHint}>{deepContentPlaceholderHint}</p>
              </section>
            )}
            {!isMobileViewport ? finalOfferNode : null}
            {isDeepContentReady ? trailingNodes : null}
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
