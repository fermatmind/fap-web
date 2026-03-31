"use client";

import { MbtiCloneAssetSlot } from "@/components/result/mbti/clone/MbtiCloneAssetSlot";
import { MbtiCloneEnergyBlock } from "@/components/result/mbti/clone/MbtiCloneEnergyBlock";
import { MbtiCloneIdeaListBlock } from "@/components/result/mbti/clone/MbtiCloneIdeaListBlock";
import { MbtiCloneInfluentialTraitsCard } from "@/components/result/mbti/clone/MbtiCloneInfluentialTraitsCard";
import { MbtiCloneLockedListBlock } from "@/components/result/mbti/clone/MbtiCloneLockedListBlock";
import { MbtiCloneMatchedGuides } from "@/components/result/mbti/clone/MbtiCloneMatchedGuides";
import { MbtiCloneMatchedJobs } from "@/components/result/mbti/clone/MbtiCloneMatchedJobs";
import { MbtiCloneRelationshipInsightBlock } from "@/components/result/mbti/clone/MbtiCloneRelationshipInsightBlock";
import { MbtiCloneSectionHeading } from "@/components/result/mbti/clone/MbtiCloneSectionHeading";
import { MbtiCloneStrengthWeaknessBlock } from "@/components/result/mbti/clone/MbtiCloneStrengthWeaknessBlock";
import { MbtiCloneTwoColumnList, type CloneListItem } from "@/components/result/mbti/clone/MbtiCloneTwoColumnList";
import type {
  EnergyBlock,
  IdeaListBlock,
  MatchedGuidesBlock,
  MatchedJobsBlock,
  MbtiDesktopCloneAssetSlotId,
  RelationshipInsightBlock,
  StrengthWeaknessBlock,
  TraitSlot,
} from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import styles from "@/components/result/mbti/clone/mbtiDesktopClone.module.css";
import type { PersonalityDesktopCloneAssetSlot } from "@/lib/cms/personality-desktop-clone";

type VisibleBlock = {
  title: string;
  items: CloneListItem[];
};

type LockedBlock = {
  title: string;
  items: CloneListItem[];
  overlayTitle: string;
  overlayCopy: string;
  ctaLabel: string;
};

type P1ModuleBlock =
  | {
      kind: "idea";
      data: IdeaListBlock;
      testId: string;
    }
  | {
      kind: "energy";
      data: EnergyBlock;
      testId: string;
    }
  | {
      kind: "relationshipInsight";
      data: RelationshipInsightBlock;
      testId: string;
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
  p1Blocks?: P1ModuleBlock[];
  visibleBlocks: VisibleBlock[];
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
  p1Blocks = [],
  visibleBlocks,
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
      {strengths ? (
        <MbtiCloneStrengthWeaknessBlock data={strengths} testId={`mbti-p0-${id}-strengths`} />
      ) : null}
      {weaknesses ? (
        <MbtiCloneStrengthWeaknessBlock data={weaknesses} testId={`mbti-p0-${id}-weaknesses`} />
      ) : null}
      {matchedJobs ? <MbtiCloneMatchedJobs locale={locale} data={matchedJobs} /> : null}
      {matchedGuides ? <MbtiCloneMatchedGuides data={matchedGuides} /> : null}
      {p1Blocks.map((block) => {
        if (block.kind === "idea") {
          return <MbtiCloneIdeaListBlock key={block.testId} data={block.data} testId={block.testId} />;
        }

        if (block.kind === "energy") {
          return <MbtiCloneEnergyBlock key={block.testId} data={block.data} testId={block.testId} />;
        }

        return <MbtiCloneRelationshipInsightBlock key={block.testId} data={block.data} testId={block.testId} />;
      })}
      <MbtiCloneInfluentialTraitsCard
        locale={locale}
        traits={traits}
        isUnlocked={isUnlocked}
        unlockHref={unlockHref}
        unlockLabel={unlockLabel}
      />
      {visibleBlocks.map((block) => (
        <MbtiCloneTwoColumnList key={`${id}-${block.title}`} title={block.title} items={block.items} />
      ))}
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
