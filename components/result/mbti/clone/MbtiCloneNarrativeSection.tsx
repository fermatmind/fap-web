"use client";

import type { ReactNode } from "react";
import { MbtiCloneAssetSlot } from "@/components/result/mbti/clone/MbtiCloneAssetSlot";
import { MbtiCloneInfluentialTraitsCard } from "@/components/result/mbti/clone/MbtiCloneInfluentialTraitsCard";
import { MbtiCloneMatchedGuides } from "@/components/result/mbti/clone/MbtiCloneMatchedGuides";
import { MbtiCloneMatchedJobs } from "@/components/result/mbti/clone/MbtiCloneMatchedJobs";
import { MbtiClonePremiumTeaserBlock, type PremiumTeaserItem } from "@/components/result/mbti/clone/MbtiClonePremiumTeaserBlock";
import { MbtiCloneSectionHeading } from "@/components/result/mbti/clone/MbtiCloneSectionHeading";
import { MbtiCloneStrengthWeaknessBlock } from "@/components/result/mbti/clone/MbtiCloneStrengthWeaknessBlock";
import type {
  MatchedGuidesBlock,
  MatchedJobsBlock,
  MbtiDesktopCloneAssetSlotId,
  StrengthWeaknessBlock,
  TraitSlot,
  TraitUnlockBlock,
} from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import styles from "@/components/result/mbti/clone/mbtiDesktopClone.module.css";
import type { PersonalityDesktopCloneAssetSlot } from "@/lib/cms/personality-desktop-clone";

type LockedBlock = {
  title: string;
  items: PremiumTeaserItem[];
  overlayTitle: string;
  overlayBody: string;
  overlayCtaLabel: string;
  testId: string;
};

type MbtiCloneNarrativeSectionProps = {
  locale: "zh" | "en";
  id: string;
  anchorId?: string;
  number: number;
  title: string;
  illustrationSlotId: MbtiDesktopCloneAssetSlotId;
  illustrationLabel: string;
  assetSlots?: PersonalityDesktopCloneAssetSlot[] | null;
  introParagraphs: string[];
  strengths: StrengthWeaknessBlock | null;
  weaknesses: StrengthWeaknessBlock | null;
  matchedJobs?: MatchedJobsBlock | null;
  matchedGuides?: MatchedGuidesBlock | null;
  traits: TraitSlot[];
  traitsUnlock?: TraitUnlockBlock | null;
  isUnlocked: boolean;
  unlockHref: string;
  unlockLabel: string;
  postCoreBlocks?: ReactNode[];
  premiumTeasers: LockedBlock[];
};

export function MbtiCloneNarrativeSection({
  locale,
  id,
  anchorId,
  number,
  title,
  illustrationSlotId,
  illustrationLabel,
  assetSlots,
  introParagraphs,
  strengths,
  weaknesses,
  matchedJobs = null,
  matchedGuides = null,
  traits,
  traitsUnlock = null,
  isUnlocked,
  unlockHref,
  unlockLabel,
  postCoreBlocks = [],
  premiumTeasers,
}: MbtiCloneNarrativeSectionProps) {
  return (
    <section id={anchorId ?? id} className={styles.section}>
      <MbtiCloneSectionHeading number={number} title={title} />
      <MbtiCloneAssetSlot
        slotId={illustrationSlotId}
        assetSlots={assetSlots}
        fallbackLabel={illustrationLabel}
        className={styles.illustrationSlot}
        labelClassName={styles.slotLabel}
        testId={`mbti-asset-slot-${id}`}
      />
      <div className={styles.sectionParagraphs}>
        {introParagraphs.map((paragraph, index) => (
          <p key={`${id}-paragraph-${index}`}>{paragraph}</p>
        ))}
      </div>
      <MbtiCloneInfluentialTraitsCard
        sectionId={id}
        locale={locale}
        traits={traits}
        traitsUnlock={traitsUnlock}
        isUnlocked={isUnlocked}
        unlockHref={unlockHref}
        unlockLabel={unlockLabel}
      />
      {strengths ? (
        <MbtiCloneStrengthWeaknessBlock data={strengths} testId={`mbti-p0-${id}-strengths`} />
      ) : null}
      {weaknesses ? (
        <MbtiCloneStrengthWeaknessBlock data={weaknesses} testId={`mbti-p0-${id}-weaknesses`} />
      ) : null}
      {matchedJobs ? <MbtiCloneMatchedJobs locale={locale} data={matchedJobs} /> : null}
      {matchedGuides ? <MbtiCloneMatchedGuides data={matchedGuides} /> : null}
      {postCoreBlocks.map((block, index) => (
        <div key={`${id}-post-core-${index}`}>{block}</div>
      ))}
      {premiumTeasers.map((block) => (
        <MbtiClonePremiumTeaserBlock
          key={`${id}-${block.testId}`}
          title={block.title}
          items={block.items}
          overlayTitle={block.overlayTitle}
          overlayBody={block.overlayBody}
          overlayCtaLabel={block.overlayCtaLabel || unlockLabel}
          overlayCtaHref={unlockHref}
          testId={block.testId}
        />
      ))}
    </section>
  );
}
