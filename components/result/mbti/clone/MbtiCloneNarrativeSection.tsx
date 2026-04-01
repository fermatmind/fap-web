"use client";

import { MbtiCloneAssetSlot } from "@/components/result/mbti/clone/MbtiCloneAssetSlot";
import { MbtiCloneInfluentialTraitsCard } from "@/components/result/mbti/clone/MbtiCloneInfluentialTraitsCard";
import { MbtiCloneLockedListBlock } from "@/components/result/mbti/clone/MbtiCloneLockedListBlock";
import { MbtiCloneMatchedGuides } from "@/components/result/mbti/clone/MbtiCloneMatchedGuides";
import { MbtiCloneMatchedJobs } from "@/components/result/mbti/clone/MbtiCloneMatchedJobs";
import { MbtiCloneSectionHeading } from "@/components/result/mbti/clone/MbtiCloneSectionHeading";
import { MbtiCloneStrengthWeaknessBlock } from "@/components/result/mbti/clone/MbtiCloneStrengthWeaknessBlock";
import type {
  MatchedGuidesBlock,
  MatchedJobsBlock,
  MbtiDesktopCloneAssetSlotId,
  StrengthWeaknessBlock,
  TraitSlot,
} from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import styles from "@/components/result/mbti/clone/mbtiDesktopClone.module.css";
import type { PersonalityDesktopCloneAssetSlot } from "@/lib/cms/personality-desktop-clone";

type LockedBlock = {
  title: string;
  items: Array<{ title: string; body: string; tone?: "positive" | "negative" | "neutral" }>;
  overlayTitle: string;
  overlayCopy: string;
  ctaLabel: string;
};

type MbtiCloneNarrativeSectionProps = {
  locale: "zh" | "en";
  id: string;
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
  isUnlocked: boolean;
  unlockHref: string;
  unlockLabel: string;
  lockedBlocks: LockedBlock[];
};

export function MbtiCloneNarrativeSection({
  locale,
  id,
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
  isUnlocked,
  unlockHref,
  unlockLabel,
  lockedBlocks,
}: MbtiCloneNarrativeSectionProps) {
  return (
    <section id={id} className={styles.section}>
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
        locale={locale}
        traits={traits}
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
      {lockedBlocks.map((block) => (
        <MbtiCloneLockedListBlock
          key={`${id}-${block.title}`}
          title={block.title}
          items={block.items}
          overlayTitle={block.overlayTitle}
          overlayCopy={block.overlayCopy}
          ctaLabel={block.ctaLabel || unlockLabel}
          ctaHref={unlockHref}
        />
      ))}
    </section>
  );
}
