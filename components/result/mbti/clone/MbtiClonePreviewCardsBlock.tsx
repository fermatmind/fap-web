"use client";

import type { MbtiPreviewSectionViewModel } from "@/lib/mbti/preview";
import styles from "@/components/result/mbti/clone/mbtiDesktopClone.module.css";

type MbtiClonePreviewCardsBlockProps = {
  locale: "zh" | "en";
  sectionId: string;
  previewSection: MbtiPreviewSectionViewModel;
};

function normalizePreviewCardKey(sectionId: string, cardId: string, index: number) {
  const normalized = cardId.trim();
  return normalized ? normalized : `${sectionId}-${index}`;
}

export function MbtiClonePreviewCardsBlock({
  locale,
  sectionId,
  previewSection,
}: MbtiClonePreviewCardsBlockProps) {
  if (previewSection.previewCards.length === 0) {
    return null;
  }

  return (
    <section className={`${styles.card} ${styles.previewBlock}`} data-testid={`mbti-desktop-preview-${sectionId}`}>
      <div className={styles.previewHeader}>
        <p className={styles.previewEyebrow}>
          {locale === "zh" ? "章节预览内容" : "Chapter preview cards"}
        </p>
        <p className={styles.previewIntro}>
          {locale === "zh"
            ? "这里展示当前已经开放的部分预览卡片；完整解锁后会继续补齐整章正文。"
            : "These cards are already open in preview mode. Unlocking the full report still completes the rest of the chapter."}
        </p>
      </div>

      <div className={styles.previewCardGrid}>
        {previewSection.previewCards.map((card, index) => (
          <article
            key={normalizePreviewCardKey(sectionId, card.id, index)}
            className={styles.previewCard}
            data-testid={`mbti-desktop-preview-${sectionId}-card-${normalizePreviewCardKey(sectionId, card.id, index)}`}
          >
            <p className={styles.previewCardTitle}>{card.title}</p>
            {card.body ? <p className={styles.previewCardBody}>{card.body}</p> : null}
            {card.bullets.length > 0 ? (
              <ul className={styles.previewBulletList}>
                {card.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
            {card.tips.length > 0 ? (
              <p className={styles.previewCardTips}>{card.tips.join(locale === "zh" ? "；" : "; ")}</p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
