"use client";

import type { StrengthWeaknessBlock } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import styles from "@/components/result/mbti/clone/mbtiDesktopClone.module.css";

type MbtiCloneStrengthWeaknessBlockProps = {
  data: StrengthWeaknessBlock;
  testId: string;
  tone?: "strength" | "weakness";
};

export function MbtiCloneStrengthWeaknessBlock({
  data,
  testId,
  tone = "strength",
}: MbtiCloneStrengthWeaknessBlockProps) {
  return (
    <section className={styles.readingListBlock} data-tone={tone} data-testid={testId}>
      <h3 className={styles.p0Title}>{data.title}</h3>
      <div className={styles.readingListGrid}>
        {data.items.map((item, index) => (
          <article key={`${item.title}-${index}`} className={styles.readingListItem}>
            <span className={styles.readingListIcon} aria-hidden="true">{tone === "weakness" ? "!" : "✓"}</span>
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
