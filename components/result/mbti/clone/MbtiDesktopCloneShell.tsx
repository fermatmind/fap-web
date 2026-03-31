"use client";

import type { ReactNode } from "react";
import type { HighlightCard, MbtiSectionUnlock, ReportSection, ResolvedOffer, RichResultHeadline } from "@/components/result/RichResultReport";
import { MbtiCloneFinalOffer } from "@/components/result/mbti/clone/MbtiCloneFinalOffer";
import { MbtiCloneHero } from "@/components/result/mbti/clone/MbtiCloneHero";
import { MbtiCloneNarrativeSection } from "@/components/result/mbti/clone/MbtiCloneNarrativeSection";
import { MbtiCloneRail } from "@/components/result/mbti/clone/MbtiCloneRail";
import { MbtiCloneTraitsSection } from "@/components/result/mbti/clone/MbtiCloneTraitsSection";
import { resolveMbtiDesktopCloneSlots } from "@/components/result/mbti/clone/mbtiDesktopClone.resolve";
import styles from "@/components/result/mbti/clone/mbtiDesktopClone.module.css";
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
  const slots = resolveMbtiDesktopCloneSlots({
    locale,
    headline,
    dimensions,
    highlights,
    sections,
    sectionUnlocks,
    offers,
    projectionViewModel,
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

  return (
    <div data-testid="mbti-desktop-clone-shell" className={styles.cloneRoot} data-base-code={slots.meta.baseCode}>
      <div className={styles.shell}>
        <MbtiCloneHero
          eyebrow={slots.hero.eyebrow}
          title={slots.hero.title}
          typeCode={slots.hero.typeCode}
          summary={slots.hero.summary}
          illustrationLabel={slots.hero.asset.label}
        />

        <div className={styles.pageGrid}>
          <main className={styles.main}>
            <section className={styles.introBlock}>
              <p>{slots.intro.paragraphs[0]}</p>
              <p>{slots.intro.paragraphs[1]}</p>
            </section>

            <MbtiCloneTraitsSection
              title={slots.traits.title}
              illustrationLabel={slots.traits.asset.label}
              dimensions={dimensions}
              summaryTitle={slots.traits.summaryPane.eyebrow}
              summaryValue={slots.traits.summaryPane.value}
              summaryLabel={slots.traits.summaryPane.title}
              summaryDescription={slots.traits.summaryPane.body}
              summarySlotLabel={slots.traits.summaryPane.asset.label}
              paragraphs={slots.traits.body}
              tools={traitsTools}
            />

            <MbtiCloneNarrativeSection
              locale={cloneLocale}
              id="career"
              number={Number(slots.chapters.career.step)}
              title={slots.chapters.career.title}
              illustrationLabel={slots.chapters.career.asset.label}
              introParagraphs={slots.chapters.career.intro}
              traits={slots.chapters.career.influentialTraits}
              isUnlocked={isUnlocked}
              unlockHref="#offer-full"
              unlockLabel={primaryCtaLabel}
              visibleBlocks={slots.chapters.career.visibleBlocks.filter(Boolean).map((block) => ({ title: block!.title, items: block!.items }))}
              lockedBlocks={slots.chapters.career.lockedBlocks.map((block) => ({
                title: block.title,
                items: block.blurredItems,
                overlayTitle: block.overlayTitle,
                overlayCopy: block.overlayBody,
                ctaLabel: normalizeText(primaryCtaLabel, block.overlayCtaLabel),
              }))}
            />

            <MbtiCloneNarrativeSection
              locale={cloneLocale}
              id="growth"
              number={Number(slots.chapters.growth.step)}
              title={slots.chapters.growth.title}
              illustrationLabel={slots.chapters.growth.asset.label}
              introParagraphs={slots.chapters.growth.intro}
              traits={slots.chapters.growth.influentialTraits}
              isUnlocked={isUnlocked}
              unlockHref="#offer-full"
              unlockLabel={primaryCtaLabel}
              visibleBlocks={slots.chapters.growth.visibleBlocks.filter(Boolean).map((block) => ({ title: block!.title, items: block!.items }))}
              lockedBlocks={slots.chapters.growth.lockedBlocks.map((block) => ({
                title: block.title,
                items: block.blurredItems,
                overlayTitle: block.overlayTitle,
                overlayCopy: block.overlayBody,
                ctaLabel: normalizeText(primaryCtaLabel, block.overlayCtaLabel),
              }))}
            />

            <MbtiCloneNarrativeSection
              locale={cloneLocale}
              id="relationships"
              number={Number(slots.chapters.relationships.step)}
              title={slots.chapters.relationships.title}
              illustrationLabel={slots.chapters.relationships.asset.label}
              introParagraphs={slots.chapters.relationships.intro}
              traits={slots.chapters.relationships.influentialTraits}
              isUnlocked={isUnlocked}
              unlockHref="#offer-full"
              unlockLabel={primaryCtaLabel}
              visibleBlocks={slots.chapters.relationships.visibleBlocks.filter(Boolean).map((block) => ({ title: block!.title, items: block!.items }))}
              lockedBlocks={slots.chapters.relationships.lockedBlocks.map((block) => ({
                title: block.title,
                items: block.blurredItems,
                overlayTitle: block.overlayTitle,
                overlayCopy: block.overlayBody,
                ctaLabel: normalizeText(primaryCtaLabel, block.overlayCtaLabel),
              }))}
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
                isCheckingOut={isCheckingOut}
                checkoutError={checkoutError}
                onCheckout={primaryOffer ? onCheckout : undefined}
                isUnlocked={isUnlocked}
                unlockedNode={unlockedOfferNode}
                illustrationLabel={slots.finalOffer.asset.label}
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
