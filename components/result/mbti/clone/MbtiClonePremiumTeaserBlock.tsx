"use client";

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
  overlayCtaLabel: string;
  overlayCtaHref: string;
  testId: string;
};

export function MbtiClonePremiumTeaserBlock({
  title,
  items,
  overlayTitle,
  overlayBody,
  overlayCtaLabel,
  overlayCtaHref,
  testId,
}: MbtiClonePremiumTeaserBlockProps) {
  return (
    <section className={`${styles.card} ${styles.premiumTeaserBlock}`} data-testid={testId}>
      <h3 className={styles.premiumTeaserTitle}>{title}</h3>
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
        <div className={styles.premiumTeaserOverlay} data-testid={`${testId}-overlay`}>
          <div className={styles.unlockPanel}>
            <p className={styles.unlockTitle}>{overlayTitle}</p>
            <p className={styles.unlockCopy}>{overlayBody}</p>
            <a href={overlayCtaHref} className={styles.unlockButton}>
              {overlayCtaLabel}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
