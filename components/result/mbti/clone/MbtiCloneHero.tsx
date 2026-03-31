"use client";

import styles from "@/components/result/mbti/clone/mbtiDesktopClone.module.css";

type MbtiCloneHeroProps = {
  eyebrow: string;
  title: string;
  typeCode: string;
  illustrationLabel: string;
};

export function MbtiCloneHero({
  eyebrow,
  title,
  typeCode,
  illustrationLabel,
}: MbtiCloneHeroProps) {
  return (
    <section id="hero" data-testid="mbti-hero" className={styles.hero}>
      <div className={styles.heroCopy}>
        <p className={styles.heroEyebrow}>{eyebrow}</p>
        <h1 className={styles.heroTitle}>{title}</h1>
        <p className={styles.heroCode}>{typeCode}</p>
      </div>
      <div className={styles.heroIllustrationWrap}>
        <div className={styles.heroIllustration}>
          <p className={styles.slotLabel}>{illustrationLabel}</p>
        </div>
      </div>
    </section>
  );
}
