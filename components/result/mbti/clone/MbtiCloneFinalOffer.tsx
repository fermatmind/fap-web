"use client";

import { type ReactNode } from "react";
import styles from "@/components/result/mbti/clone/mbtiDesktopClone.module.css";

type MbtiCloneFinalOfferProps = {
  locale: "zh" | "en";
  eyebrow: string;
  headline: string;
  copy: string;
  price: string;
  ctaLabel?: string;
  isCheckingOut?: boolean;
  checkoutError?: string | null;
  onCheckout?: () => void | Promise<void>;
  isUnlocked: boolean;
  unlockedNode?: ReactNode;
  illustrationLabel: string;
};

export function MbtiCloneFinalOffer({
  locale,
  eyebrow,
  headline,
  copy,
  price,
  ctaLabel,
  isCheckingOut = false,
  checkoutError = null,
  onCheckout,
  isUnlocked,
  unlockedNode,
  illustrationLabel,
}: MbtiCloneFinalOfferProps) {
  if (isUnlocked && unlockedNode) {
    return <div className={styles.finalOfferPurchased}>{unlockedNode}</div>;
  }

  return (
    <section data-testid="mbti-offer-comparison" className={styles.finalOffer}>
      <div className={styles.finalOfferMedia}>
        <p className={styles.slotLabel}>{illustrationLabel}</p>
      </div>
      <div className={styles.finalOfferBody}>
        <p className={styles.microLabel}>{eyebrow}</p>
        <h2 className={styles.finalOfferTitle}>{headline}</h2>
        <p className={styles.finalOfferCopy}>{copy}</p>
        <div className={styles.finalOfferRow}>
          <div>
            <p className={styles.finalOfferPrice}>{price}</p>
            <p className={styles.finalOfferMeta}>
              {locale === "zh"
                ? "当前价格与购买逻辑沿用现有 checkout 流。"
                : "Pricing and purchase behavior reuse the current checkout flow."}
            </p>
          </div>
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
          ) : null}
        </div>
        {checkoutError ? <p className={styles.errorText}>{checkoutError}</p> : null}
      </div>
    </section>
  );
}
