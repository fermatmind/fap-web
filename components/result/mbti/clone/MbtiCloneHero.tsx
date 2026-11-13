"use client";

import Image from "next/image";
import { useQuestionnaireDisplayCopy } from "@/components/questionnaires/TraditionalQuestionnaireCopy";

import { MbtiCloneAssetSlot } from "@/components/result/mbti/clone/MbtiCloneAssetSlot";
import { getMbtiDesktopAnchorId } from "@/components/result/mbti/mbtiDesktopAnchorTargets";
import type { MbtiDesktopCloneAssetSlotId, ProfileIdentity } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import styles from "@/components/result/mbti/clone/mbtiDesktopClone.module.css";
import type { PersonalityDesktopCloneAssetSlot } from "@/lib/cms/personality-desktop-clone";

type MbtiCloneHeroProps = {
  locale?: "zh" | "en";
  profileIdentity: ProfileIdentity;
  illustrationSlotId: MbtiDesktopCloneAssetSlotId;
  illustrationLabel: string;
  assetSlots?: PersonalityDesktopCloneAssetSlot[] | null;
};

function formatNameLine(profileIdentity: ProfileIdentity) {
  return [profileIdentity.name, profileIdentity.nickname].filter((value) => value.trim().length > 0).join(" · ");
}

export function MbtiCloneHero({
  locale = "zh",
  profileIdentity,
  illustrationSlotId,
  illustrationLabel,
  assetSlots,
}: MbtiCloneHeroProps) {
  const { displayText: copy } = useQuestionnaireDisplayCopy();
  const baseCode = /^([IE][NS][TF][JP])(?:-[AT])?$/i.exec(profileIdentity.code)?.[1].toLowerCase();
  const introduction = profileIdentity.introduction;
  const nameLine = locale === "zh" ? profileIdentity.name : formatNameLine(profileIdentity);

  return (
    <section id={getMbtiDesktopAnchorId("hero")} data-testid="mbti-hero" className={styles.hero}>
      <div className={styles.heroCopy}>
        <h1 className={styles.heroCodePrimary}>{profileIdentity.code}</h1>
        {nameLine ? (
          <p data-testid="mbti-hero-identity-line" className={styles.heroNameLine}>
            {nameLine}
          </p>
        ) : null}
        {profileIdentity.rarity ? (
          <p data-testid="mbti-hero-rarity" className={styles.heroRarityPill}>
            {locale === "zh" ? copy(`稀有度：${profileIdentity.rarity}`) : `Rarity: ${profileIdentity.rarity}`}
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
        {introduction ? (
          <p data-testid="mbti-hero-introduction" className={styles.heroIntroduction}>{introduction}</p>
        ) : null}
      </div>
      <div className={styles.heroIllustrationWrap}>
        {baseCode ? (
          <Image
            src={`/images/mbti/result-portraits/${baseCode}.webp`}
            alt=""
            width={360}
            height={520}
            unoptimized
            loading="eager"
            className={styles.heroPortrait}
            data-testid="mbti-hero-portrait"
          />
        ) : (
          <MbtiCloneAssetSlot
            slotId={illustrationSlotId}
            assetSlots={assetSlots}
            fallbackLabel={illustrationLabel}
            className={styles.heroIllustration}
            labelClassName={styles.slotLabel}
            testId="mbti-asset-slot-hero"
          />
        )}
      </div>
    </section>
  );
}
