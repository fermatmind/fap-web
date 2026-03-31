"use client";

import type { MatchedGuidesBlock } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import styles from "@/components/result/mbti/clone/mbtiDesktopClone.module.css";

type MbtiCloneMatchedGuidesProps = {
  data: MatchedGuidesBlock;
};

export function MbtiCloneMatchedGuides({ data }: MbtiCloneMatchedGuidesProps) {
  return (
    <section className={`${styles.card} ${styles.p0Block}`} data-testid="mbti-p0-career-matched-guides">
      <h3 className={styles.p0Title}>{data.title}</h3>
      <p className={styles.p0Lead}>{data.summary}</p>
      <p className={styles.p0Meta}>{data.fitReason}</p>
    </section>
  );
}
