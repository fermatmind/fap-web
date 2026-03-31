"use client";

import styles from "@/components/result/mbti/clone/mbtiDesktopClone.module.css";

type MbtiCloneSectionHeadingProps = {
  number: number;
  title: string;
};

export function MbtiCloneSectionHeading({
  number,
  title,
}: MbtiCloneSectionHeadingProps) {
  return (
    <div className={styles.sectionHeading}>
      <span className={styles.numberCircle}>{number}</span>
      <h2 className={styles.sectionTitle}>{title}</h2>
    </div>
  );
}
