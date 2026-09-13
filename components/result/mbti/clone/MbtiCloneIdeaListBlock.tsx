"use client";

import type { IdeaListBlock } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import styles from "@/components/result/mbti/clone/mbtiDesktopClone.module.css";

type MbtiCloneIdeaListBlockProps = {
  data: IdeaListBlock;
  testId: string;
};

export function MbtiCloneIdeaListBlock({
  data,
  testId,
}: MbtiCloneIdeaListBlockProps) {
  return (
    <section className={styles.readingListBlock} data-tone="idea" data-testid={testId}>
      <h3 className={styles.p0Title}>{data.title}</h3>
      <div className={styles.readingListGrid}>
        {data.items.map((item, index) => (
          <article key={`${item.title}-${index}`} className={styles.readingListItem}>
            <span className={styles.readingListIcon} aria-hidden="true">↗</span>
            <div>
            <p className={styles.readingListTitle}>{item.title}</p>
            <p className={styles.readingListBody}>{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
