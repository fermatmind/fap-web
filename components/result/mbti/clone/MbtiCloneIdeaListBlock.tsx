"use client";

import Link from "next/link";
import { isSafeCareerJobSlug } from "@/lib/career/slugSafety";
import { useQuestionnaireDisplayCopy } from "@/components/questionnaires/TraditionalQuestionnaireCopy";
import type { IdeaListBlock } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import styles from "@/components/result/mbti/clone/mbtiDesktopClone.module.css";

type MbtiCloneIdeaListBlockProps = {
  data: IdeaListBlock;
  testId: string;
  locale?: "zh" | "en";
};

export function MbtiCloneIdeaListBlock({
  data,
  testId,
  locale = "zh",
}: MbtiCloneIdeaListBlockProps) {
  const { traditional } = useQuestionnaireDisplayCopy();
  const displayLocale = traditional ? "zh-TW" : locale;
  return (
    <section className={styles.readingListBlock} data-tone="idea" data-testid={testId}>
      <h3 className={styles.p0Title}>{data.title}</h3>
      <div className={styles.readingListGrid}>
        {data.items.map((item, index) => {
          const href = isSafeCareerJobSlug(item.careerSlug) ? `/${displayLocale}/career/jobs/${item.careerSlug}` : null;
          return (
            <article key={`${item.title}-${index}`} className={styles.readingListItem}>
              <span className={styles.readingListIcon} aria-hidden="true">{href ? "↗" : "•"}</span>
              <div>
                <p className={styles.readingListTitle}>
                  {href ? <Link href={href} prefetch={false} className={styles.careerIdeaLink}>{item.title}</Link> : item.title}
                </p>
                <p className={styles.readingListBody}>{item.description}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
