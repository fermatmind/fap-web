"use client";

import type { LettersIntroBlock } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import styles from "@/components/result/mbti/clone/mbtiDesktopClone.module.css";

type MbtiCloneLettersIntroProps = {
  data: LettersIntroBlock;
};

export function MbtiCloneLettersIntro({ data }: MbtiCloneLettersIntroProps) {
  return (
    <section className={`${styles.card} ${styles.p0Block}`} data-testid="mbti-p0-letters-intro">
      <h3 className={styles.p0Title}>{data.headline}</h3>
      <div className={styles.lettersGrid}>
        {data.letters.map((entry, index) => (
          <article key={`${entry.letter}-${entry.title}-${index}`} className={styles.letterItem}>
            <p className={styles.letterBadge}>{entry.letter}</p>
            <div>
              <p className={styles.letterItemTitle}>{entry.title}</p>
              <p className={styles.letterItemBody}>{entry.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
