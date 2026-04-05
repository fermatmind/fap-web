"use client";

import { type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import { MbtiCloneAssetSlot } from "@/components/result/mbti/clone/MbtiCloneAssetSlot";
import type { MbtiDesktopCloneAssetSlotId } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import styles from "@/components/result/mbti/clone/mbtiDesktopClone.module.css";
import type { PersonalityDesktopCloneAssetSlot } from "@/lib/cms/personality-desktop-clone";

type MbtiCloneFinalOfferProps = {
  locale: "zh" | "en";
  eyebrow: string;
  headline: string;
  copy: string;
  priceLabel: string;
  price: string;
  guarantee: string;
  ctaLabel?: string;
  ctaHref?: string;
  inviteCtaLabel?: string;
  inviteCtaHref?: string;
  onInviteCtaClick?: (event: ReactMouseEvent<HTMLAnchorElement>) => void;
  inviteCtaDisabled?: boolean;
  inviteFallbackHint?: string | null;
  isCheckingOut?: boolean;
  checkoutError?: string | null;
  onCheckout?: () => void | Promise<void>;
  isUnlocked: boolean;
  unlockedNode?: ReactNode;
  illustrationSlotId: MbtiDesktopCloneAssetSlotId;
  illustrationLabel: string;
  assetSlots?: PersonalityDesktopCloneAssetSlot[] | null;
};

export function MbtiCloneFinalOffer({
  locale,
  eyebrow,
  headline,
  copy,
  priceLabel,
  price,
  guarantee,
  ctaLabel,
  ctaHref,
  inviteCtaLabel,
  inviteCtaHref,
  onInviteCtaClick,
  inviteCtaDisabled = false,
  inviteFallbackHint = null,
  isCheckingOut = false,
  checkoutError = null,
  onCheckout,
  isUnlocked,
  unlockedNode,
  illustrationSlotId,
  illustrationLabel,
  assetSlots,
}: MbtiCloneFinalOfferProps) {
  if (isUnlocked && unlockedNode) {
    return <div className={styles.finalOfferPurchased}>{unlockedNode}</div>;
  }

  return (
    <section data-testid="mbti-offer-comparison" className={styles.finalOffer}>
      <MbtiCloneAssetSlot
        slotId={illustrationSlotId}
        assetSlots={assetSlots}
        fallbackLabel={illustrationLabel}
        className={styles.finalOfferMedia}
        labelClassName={styles.slotLabel}
        testId="mbti-asset-slot-final-offer"
      />
      <div className={styles.finalOfferBody}>
        <p className={styles.microLabel}>{eyebrow}</p>
        <h2 className={styles.finalOfferTitle}>{headline}</h2>
        <p className={styles.finalOfferCopy}>{copy}</p>
        <div className={styles.finalOfferRow}>
          <div>
            <p className={styles.microLabel}>{priceLabel}</p>
            <p className={styles.finalOfferPrice}>{price}</p>
            <p className={styles.finalOfferMeta}>{guarantee || (locale === "zh" ? "一次解锁，继续使用当前阅读壳。" : "Unlock once and keep the current desktop reading shell.")}</p>
          </div>
          <div className={styles.finalOfferActions}>
            {ctaLabel && onCheckout ? (
              <button
                type="button"
                data-testid="mbti-offers-primary-cta"
                onClick={() => void onCheckout()}
                disabled={isCheckingOut}
                className={styles.finalOfferButton}
              >
                {isCheckingOut
                  ? locale === "zh"
                    ? "正在跳转..."
                    : "Redirecting..."
                  : ctaLabel}
              </button>
            ) : ctaLabel && ctaHref ? (
              <a href={ctaHref} data-testid="mbti-offers-primary-cta" className={styles.finalOfferButton}>
                {ctaLabel}
              </a>
            ) : null}
            {inviteCtaLabel && inviteCtaHref ? (
              <a
                href={inviteCtaHref}
                data-testid="mbti-offers-invite-cta"
                onClick={onInviteCtaClick}
                aria-disabled={inviteCtaDisabled ? "true" : undefined}
                className={`${styles.finalOfferButton} ${styles.finalOfferInviteButton} ${inviteCtaDisabled ? styles.finalOfferButtonDisabled : ""}`}
              >
                {inviteCtaLabel}
              </a>
            ) : null}
          </div>
        </div>
        {checkoutError ? (
          <p data-testid="mbti-offers-checkout-error" className={styles.errorText}>
            {checkoutError}
          </p>
        ) : null}
        {inviteFallbackHint ? (
          <p data-testid="mbti-offers-invite-fallback-hint" className={styles.errorText}>
            {inviteFallbackHint}
          </p>
        ) : null}
      </div>
    </section>
  );
}
