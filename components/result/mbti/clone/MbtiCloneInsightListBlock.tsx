"use client";

import type { InsightListBlock } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import styles from "@/components/result/mbti/clone/mbtiDesktopClone.module.css";

type MbtiCloneInsightListBlockProps = {
  data: InsightListBlock;
  locale: "zh" | "en";
  testId: string;
};

function copy(locale: "zh" | "en") {
  if (locale === "zh") {
    return {
      whyItMatters: "为什么重要",
      signals: "可观察信号",
      actions: "建议动作",
      do: "去做",
      avoid: "避免",
    };
  }

  return {
    whyItMatters: "Why it matters",
    signals: "Observable signals",
    actions: "Actions",
    do: "Do",
    avoid: "Avoid",
  };
}

export function MbtiCloneInsightListBlock({
  data,
  locale,
  testId,
}: MbtiCloneInsightListBlockProps) {
  const labels = copy(locale);

  return (
    <section className={`${styles.card} ${styles.p0Block}`} data-testid={testId}>
      <h3 className={styles.p0Title}>{data.title}</h3>
      <p className={styles.p0Lead}>{data.intro}</p>
      <div className={styles.p0Stack}>
        {data.items.map((item) => (
          <article key={item.id} className={`${styles.p0Row} ${styles.insightRow}`}>
            <p className={styles.p0RowTitle}>{item.title}</p>
            <p className={styles.p0RowBody}>{item.description}</p>
            <p className={styles.p0Meta}>{item.body}</p>

            <div className={styles.insightMetaSection}>
              <p className={styles.insightSectionTitle}>{labels.whyItMatters}</p>
              <p className={styles.p0Meta}>{item.whyItMatters}</p>
            </div>

            <div className={styles.insightMetaSection}>
              <p className={styles.insightSectionTitle}>{labels.signals}</p>
              <ul className={styles.insightList}>
                {item.signals.map((signal, index) => (
                  <li key={`${item.id}-signal-${index}`} className={styles.p0Meta}>
                    {signal}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.insightMetaSection}>
              <p className={styles.insightSectionTitle}>{labels.actions}</p>
              <div className={styles.insightActions}>
                <div className={styles.insightActionCard}>
                  <p className={styles.insightActionLabel}>{labels.do}</p>
                  <p className={styles.p0Meta}>{item.actions.do}</p>
                </div>
                <div className={styles.insightActionCard}>
                  <p className={styles.insightActionLabel}>{labels.avoid}</p>
                  <p className={styles.p0Meta}>{item.actions.avoid}</p>
                </div>
              </div>
            </div>

            <div className={styles.jobExamplesRow}>
              {item.tags.map((tag) => (
                <span key={`${item.id}-${tag}`} className={styles.jobExampleChip}>
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
