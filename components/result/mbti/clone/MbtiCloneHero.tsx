"use client";

import { MbtiCloneAssetSlot } from "@/components/result/mbti/clone/MbtiCloneAssetSlot";
import type { MbtiDesktopCloneAssetSlotId, ProfileIdentity } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import styles from "@/components/result/mbti/clone/mbtiDesktopClone.module.css";
import type { PersonalityDesktopCloneAssetSlot } from "@/lib/cms/personality-desktop-clone";

type MbtiCloneHeroProps = {
  eyebrow: string;
  profileIdentity: ProfileIdentity;
  summary?: string;
  illustrationSlotId: MbtiDesktopCloneAssetSlotId;
  illustrationLabel: string;
  assetSlots?: PersonalityDesktopCloneAssetSlot[] | null;
};

function formatNameLine(profileIdentity: ProfileIdentity) {
  return [profileIdentity.name, profileIdentity.nickname].filter((value) => value.trim().length > 0).join(" · ");
}

export function MbtiCloneHero({
  eyebrow,
  profileIdentity,
  summary,
  illustrationSlotId,
  illustrationLabel,
  assetSlots,
}: MbtiCloneHeroProps) {
  const nameLine = formatNameLine(profileIdentity);

  return (
    <section id="hero" data-testid="mbti-hero" className={styles.hero}>
      <div className={styles.heroCopy}>
        <p className={styles.heroEyebrow}>{eyebrow}</p>
        <h1 className={styles.heroCodePrimary}>{profileIdentity.code}</h1>
        {nameLine ? (
          <p data-testid="mbti-hero-identity-line" className={styles.heroNameLine}>
            {nameLine}
          </p>
        ) : null}
        {profileIdentity.rarity ? (
          <p data-testid="mbti-hero-rarity" className={styles.heroRarityPill}>
            {`稀有度：${profileIdentity.rarity}`}
          </p>
        ) : null}
        {profileIdentity.keywords.length > 0 ? (
          <div className={styles.heroKeywordRow} data-testid="mbti-hero-keywords">
            {profileIdentity.keywords.slice(0, 6).map((keyword) => (
              <span key={keyword} className={styles.heroKeyword}>
                {keyword}
              </span>
            ))}
          </div>
        ) : null}
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
