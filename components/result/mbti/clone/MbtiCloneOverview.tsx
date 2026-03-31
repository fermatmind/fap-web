"use client";

import type { OverviewBlock } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import styles from "@/components/result/mbti/clone/mbtiDesktopClone.module.css";

type MbtiCloneOverviewProps = {
  data: OverviewBlock;
};

export function MbtiCloneOverview({ data }: MbtiCloneOverviewProps) {
  return (
    <section className={`${styles.card} ${styles.p0Block}`} data-testid="mbti-p0-overview">
      <h3 className={styles.p0Title}>{data.title}</h3>
      <div className={styles.sectionParagraphs}>
        {data.paragraphs.map((paragraph, index) => (
          <p key={`overview-paragraph-${index}`}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}
