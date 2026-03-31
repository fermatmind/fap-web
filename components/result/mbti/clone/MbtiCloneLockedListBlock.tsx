"use client";

import styles from "@/components/result/mbti/clone/mbtiDesktopClone.module.css";
import { MbtiCloneTwoColumnList, type CloneListItem } from "@/components/result/mbti/clone/MbtiCloneTwoColumnList";

type MbtiCloneLockedListBlockProps = {
  title: string;
  items: CloneListItem[];
  overlayTitle: string;
  overlayCopy: string;
  ctaLabel: string;
  ctaHref: string;
};

export function MbtiCloneLockedListBlock({
  title,
  items,
  overlayTitle,
  overlayCopy,
  ctaLabel,
  ctaHref,
}: MbtiCloneLockedListBlockProps) {
  return (
    <section className={styles.lockedBlock}>
      <div className={styles.blurredList}>
        <MbtiCloneTwoColumnList title={title} items={items} />
      </div>
      <div className={styles.lockedOverlay}>
        <div className={styles.unlockPanel}>
          <p className={styles.unlockTitle}>{overlayTitle}</p>
          <p className={styles.unlockCopy}>{overlayCopy}</p>
          <a href={ctaHref} className={styles.unlockButton}>
            {ctaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
