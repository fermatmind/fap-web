"use client";

import { MbtiCloneAssetSlot } from "@/components/result/mbti/clone/MbtiCloneAssetSlot";
import type { MbtiDesktopCloneAssetSlotId } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import styles from "@/components/result/mbti/clone/mbtiDesktopClone.module.css";
import type { PersonalityDesktopCloneAssetSlot } from "@/lib/cms/personality-desktop-clone";

type MbtiCloneHeroProps = {
  eyebrow: string;
  title: string;
  typeCode: string;
  summary?: string;
  illustrationSlotId: MbtiDesktopCloneAssetSlotId;
  illustrationLabel: string;
  assetSlots?: PersonalityDesktopCloneAssetSlot[] | null;
};

export function MbtiCloneHero({
  eyebrow,
  title,
  typeCode,
  summary,
  illustrationSlotId,
  illustrationLabel,
  assetSlots,
}: MbtiCloneHeroProps) {
  return (
    <section id="hero" data-testid="mbti-hero" className={styles.hero}>
      <div className={styles.heroCopy}>
        <p className={styles.heroEyebrow}>{eyebrow}</p>
        <h1 className={styles.heroTitle}>{title}</h1>
        <p className={styles.heroCode}>{typeCode}</p>
        {summary ? <p className={styles.heroSummary}>{summary}</p> : null}
      </div>
      <div className={styles.heroIllustrationWrap}>
        <MbtiCloneAssetSlot
          slotId={illustrationSlotId}
          assetSlots={assetSlots}
          fallbackLabel={illustrationLabel}
          className={styles.heroIllustration}
          labelClassName={styles.slotLabel}
          testId="mbti-asset-slot-hero"
        />
      </div>
    </section>
  );
}
