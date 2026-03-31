"use client";

import { MbtiCloneAssetSlot } from "@/components/result/mbti/clone/MbtiCloneAssetSlot";
import { MbtiCloneInfluentialTraitsCard } from "@/components/result/mbti/clone/MbtiCloneInfluentialTraitsCard";
import { MbtiCloneLockedListBlock } from "@/components/result/mbti/clone/MbtiCloneLockedListBlock";
import { MbtiCloneSectionHeading } from "@/components/result/mbti/clone/MbtiCloneSectionHeading";
import { MbtiCloneTwoColumnList, type CloneListItem } from "@/components/result/mbti/clone/MbtiCloneTwoColumnList";
import type { MbtiDesktopCloneAssetSlotId, TraitSlot } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
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

type MbtiCloneNarrativeSectionProps = {
  locale: "zh" | "en";
  id: string;
  number: number;
  title: string;
  illustrationSlotId: MbtiDesktopCloneAssetSlotId;
  illustrationLabel: string;
  assetSlots?: PersonalityDesktopCloneAssetSlot[] | null;
  introParagraphs: string[];
  traits: TraitSlot[];
  isUnlocked: boolean;
  unlockHref: string;
  unlockLabel: string;
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
  traits,
  isUnlocked,
  unlockHref,
  unlockLabel,
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
