"use client";

import styles from "@/components/result/mbti/clone/mbtiDesktopClone.module.css";

export type CloneListItem = {
  title: string;
  body: string;
  tone?: "positive" | "negative" | "neutral";
  isPlaceholder?: boolean;
};

type MbtiCloneTwoColumnListProps = {
  title: string;
  items: CloneListItem[];
};

export function MbtiCloneTwoColumnList({
  title,
  items,
}: MbtiCloneTwoColumnListProps) {
  return (
    <section className={`${styles.card} ${styles.twoColumnList}`}>
      <h3 className={styles.twoColumnTitle}>{title}</h3>
      <div className={styles.twoColumnGrid}>
        {items.map((item, index) => (
          <article
            key={`${item.title}-${index}`}
            className={styles.listItem}
            data-placeholder={item.isPlaceholder ? "true" : "false"}
          >
            <span aria-hidden className={styles.listIcon} data-tone={item.tone ?? "neutral"} />
            <div>
              <p className={styles.listItemTitle}>{item.title}</p>
              <p className={styles.listItemBody}>{item.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
