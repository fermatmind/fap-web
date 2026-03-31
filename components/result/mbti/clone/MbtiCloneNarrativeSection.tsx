"use client";

import { MbtiCloneInfluentialTraitsCard } from "@/components/result/mbti/clone/MbtiCloneInfluentialTraitsCard";
import { MbtiCloneLockedListBlock } from "@/components/result/mbti/clone/MbtiCloneLockedListBlock";
import { MbtiCloneSectionHeading } from "@/components/result/mbti/clone/MbtiCloneSectionHeading";
import { MbtiCloneTwoColumnList, type CloneListItem } from "@/components/result/mbti/clone/MbtiCloneTwoColumnList";
import styles from "@/components/result/mbti/clone/mbtiDesktopClone.module.css";

type VisibleBlock = {
  title: string;
  items: CloneListItem[];
};

type LockedBlock = {
  title: string;
  items: CloneListItem[];
  overlayTitle: string;
  overlayCopy: string;
};

type MbtiCloneNarrativeSectionProps = {
  locale: "zh" | "en";
  id: string;
  number: number;
  title: string;
  illustrationLabel: string;
  introParagraphs: string[];
  traitLabels: string[];
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
  illustrationLabel,
  introParagraphs,
  traitLabels,
  isUnlocked,
  unlockHref,
  unlockLabel,
  visibleBlocks,
  lockedBlocks,
}: MbtiCloneNarrativeSectionProps) {
  return (
    <section id={id} className={styles.section}>
      <MbtiCloneSectionHeading number={number} title={title} />
      <div className={styles.illustrationSlot}>
        <p className={styles.slotLabel}>{illustrationLabel}</p>
      </div>
      <div className={styles.sectionParagraphs}>
        {introParagraphs.map((paragraph, index) => (
          <p key={`${id}-paragraph-${index}`}>{paragraph}</p>
        ))}
      </div>
      <MbtiCloneInfluentialTraitsCard
        locale={locale}
        traits={traitLabels}
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
          ctaLabel={unlockLabel}
          ctaHref={unlockHref}
        />
      ))}
    </section>
  );
}
