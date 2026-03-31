"use client";

import type { MatchedJobsBlock } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import styles from "@/components/result/mbti/clone/mbtiDesktopClone.module.css";

type MbtiCloneMatchedJobsProps = {
  locale: "zh" | "en";
  data: MatchedJobsBlock;
};

function fitBucketLabel(locale: "zh" | "en", bucket: "primary" | "secondary") {
  if (locale === "zh") {
    return bucket === "primary" ? "高匹配" : "中匹配";
  }

  return bucket === "primary" ? "High fit" : "Medium fit";
}

export function MbtiCloneMatchedJobs({ locale, data }: MbtiCloneMatchedJobsProps) {
  return (
    <section className={`${styles.card} ${styles.p0Block}`} data-testid="mbti-p0-career-matched-jobs">
      <div className={styles.p0HeaderInline}>
        <h3 className={styles.p0Title}>{data.title}</h3>
        <span className={styles.fitBucketTag}>{fitBucketLabel(locale, data.fitBucket)}</span>
      </div>
      <p className={styles.p0Lead}>{data.summary}</p>
      <p className={styles.p0Meta}>{data.fitReason}</p>
      <div className={styles.jobExamplesRow}>
        {data.jobExamples.map((example, index) => (
          <span key={`${example}-${index}`} className={styles.jobExampleChip}>{example}</span>
        ))}
      </div>
    </section>
  );
}
