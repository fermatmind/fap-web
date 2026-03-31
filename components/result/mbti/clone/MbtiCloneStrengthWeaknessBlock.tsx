"use client";

import type { StrengthWeaknessBlock } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import styles from "@/components/result/mbti/clone/mbtiDesktopClone.module.css";

type MbtiCloneStrengthWeaknessBlockProps = {
  data: StrengthWeaknessBlock;
  testId: string;
};

export function MbtiCloneStrengthWeaknessBlock({
  data,
  testId,
}: MbtiCloneStrengthWeaknessBlockProps) {
  return (
    <section className={`${styles.card} ${styles.p0Block}`} data-testid={testId}>
      <h3 className={styles.p0Title}>{data.title}</h3>
      <div className={styles.p0Stack}>
        {data.items.map((item, index) => (
          <article key={`${item.title}-${index}`} className={styles.p0Row}>
            <p className={styles.p0RowTitle}>{item.title}</p>
            <p className={styles.p0RowBody}>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
