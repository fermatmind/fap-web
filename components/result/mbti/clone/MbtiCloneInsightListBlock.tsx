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

  const scenarioLayout = data.items.length > 0 && data.items.every((item) => item.tags.includes("scenario_editorial_v1"));
  if (scenarioLayout) return (
    <section className={`${styles.card} ${styles.p0Block} ${styles.scenarioBlock}`} data-testid={testId}>
      <h3 className={styles.p0Title}>{data.title}</h3>
      <p className={styles.p0Lead}>{data.intro}</p>
      <div>
        {data.items.map((item) => (
          <article key={item.id} className={styles.scenarioItem}>
            <h4 className={styles.scenarioTitle}>{item.title}</h4>
            <p className={styles.scenarioExplanation}>{item.body} {item.whyItMatters}</p>
            <div className={styles.scenarioPractice}>
              <h5>{locale === "zh" ? "可以试试" : "Try this"}</h5>
              <p>{item.actions.do} {item.signals.join(" ")}</p>
              <p className={styles.scenarioBoundary}>{item.actions.avoid}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );

  return (
    <section className={`${styles.card} ${styles.p0Block}`} data-testid={testId}>
      <h3 className={styles.p0Title}>{data.title}</h3>
      <p className={styles.p0Lead}>{data.intro}</p>
      <div className={styles.p0Stack}>
        {data.items.map((item) => (
          <article key={item.id} className={`${styles.p0Row} ${styles.insightRow}`}>
            <p className={styles.p0RowTitle}>{item.title}</p>
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

          </article>
        ))}
      </div>
    </section>
  );
}
