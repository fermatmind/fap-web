"use client";

import { type MouseEvent as ReactMouseEvent } from "react";
import styles from "@/components/result/mbti/clone/mbtiDesktopClone.module.css";

export type PremiumTeaserItem = {
  title: string;
  body: string;
  tone?: "positive" | "negative" | "neutral";
  isPlaceholder?: boolean;
};

type MbtiClonePremiumTeaserBlockProps = {
  title: string;
  items: PremiumTeaserItem[];
  overlayTitle: string;
  overlayBody: string;
  overlayPayCtaLabel: string;
  overlayPayCtaHref: string;
  overlayInviteCtaLabel?: string;
  overlayInviteCtaHref?: string;
  onInviteCtaClick?: (event: ReactMouseEvent<HTMLAnchorElement>) => void;
  testId: string;
};

export function MbtiClonePremiumTeaserBlock({
  title,
  items,
  overlayTitle,
  overlayBody,
  overlayPayCtaLabel,
  overlayPayCtaHref,
  overlayInviteCtaLabel,
  overlayInviteCtaHref,
  onInviteCtaClick,
  testId,
}: MbtiClonePremiumTeaserBlockProps) {
  return (
    <section className={`${styles.card} ${styles.premiumTeaserBlock}`} data-testid={testId}>
      <h3 className={styles.premiumTeaserTitle}>{title}</h3>
      <div
        className={`${styles.unlockPanel} ${styles.unlockPanelCompact} ${styles.premiumTeaserUnlock}`}
        data-testid={`${testId}-overlay`}
      >
        <div className={styles.unlockPanelText}>
          <p className={styles.unlockTitle}>{overlayTitle}</p>
          <p className={styles.unlockCopy}>{overlayBody}</p>
        </div>
        <div className={styles.unlockButtonRow} data-testid={`${testId}-unlock-actions`}>
          <a
            href={overlayPayCtaHref}
            className={`${styles.unlockButton} ${styles.unlockButtonCompact}`}
            data-testid={`${testId}-pay-cta`}
          >
            {overlayPayCtaLabel}
          </a>
          {overlayInviteCtaLabel ? (
            <a
              href={overlayInviteCtaHref ?? ""}
              onClick={onInviteCtaClick}
              className={`${styles.unlockButton} ${styles.unlockButtonCompact} ${styles.unlockButtonSecondary}`}
              data-testid={`${testId}-invite-cta`}
            >
              {overlayInviteCtaLabel}
            </a>
          ) : null}
        </div>
      </div>
      <div className={styles.premiumTeaserBody}>
        <div className={styles.premiumTeaserBlurLayer}>
          <div className={styles.premiumTeaserGrid}>
            {items.map((item, index) => (
              <article
                key={`${item.title}-${index}`}
                className={styles.premiumTeaserItem}
                data-placeholder={item.isPlaceholder ? "true" : "false"}
              >
                <span aria-hidden className={styles.listIcon} data-tone={item.tone ?? "neutral"} />
                <div>
                  <p className={styles.listItemTitle}>{item.title}</p>
                  <p className={styles.listItemBody}>{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
