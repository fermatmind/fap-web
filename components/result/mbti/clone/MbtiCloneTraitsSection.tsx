"use client";

import Link from "next/link";
import { DimensionBars } from "@/components/result/DimensionBars";
import { MbtiCloneSectionHeading } from "@/components/result/mbti/clone/MbtiCloneSectionHeading";
import styles from "@/components/result/mbti/clone/mbtiDesktopClone.module.css";

type TraitTool = {
  label: string;
  href?: string;
  onClick?: () => void | Promise<void>;
  disabled?: boolean;
};

type MbtiCloneTraitsSectionProps = {
  title: string;
  illustrationLabel: string;
  dimensions: Array<Record<string, unknown>>;
  summaryTitle: string;
  summaryValue: string;
  summaryLabel: string;
  summaryDescription: string;
  summarySlotLabel: string;
  paragraphs: string[];
  tools: TraitTool[];
};

export function MbtiCloneTraitsSection({
  title,
  illustrationLabel,
  dimensions,
  summaryTitle,
  summaryValue,
  summaryLabel,
  summaryDescription,
  summarySlotLabel,
  paragraphs,
  tools,
}: MbtiCloneTraitsSectionProps) {
  return (
    <section id="traits" className={styles.section}>
      <div className={styles.illustrationSlot}>
        <p className={styles.slotLabel}>{illustrationLabel}</p>
      </div>
      <MbtiCloneSectionHeading number={1} title={title} />
      <div className={styles.traitsCard}>
        <DimensionBars
          dimensions={dimensions}
          variant="clone16p"
          summaryTitle={summaryTitle}
          summaryValue={summaryValue}
          summaryLabel={summaryLabel}
          summaryDescription={summaryDescription}
          className={styles.cloneBars}
        />
        <div className={styles.summaryPane}>
          <div>
            <p className={styles.microLabel}>{summaryTitle}</p>
            <p className={styles.summaryValue}>{summaryValue}</p>
            <p className={styles.summaryLead}>{summaryLabel}</p>
          </div>
          <div className={styles.summaryIllustration}>
            <p className={styles.slotLabel}>{summarySlotLabel}</p>
          </div>
          <p className={styles.summaryText}>{summaryDescription}</p>
        </div>
      </div>
      <div className={styles.sectionParagraphs}>
        {paragraphs.map((paragraph, index) => (
          <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
        ))}
      </div>
      {tools.length > 0 ? (
        <div className={styles.traitsTools}>
          {tools.map((tool) => {
            const key = `${tool.label}-${tool.href ?? "button"}`;
            if (tool.onClick) {
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => void tool.onClick?.()}
                  disabled={tool.disabled}
                  className={styles.subtleTool}
                >
                  {tool.label}
                </button>
              );
            }

            if (!tool.href) {
              return null;
            }

            if (tool.href.startsWith("#")) {
              return (
                <a key={key} href={tool.href} className={styles.subtleTool}>
                  {tool.label}
                </a>
              );
            }

            return (
              <Link key={key} href={tool.href} className={styles.subtleTool}>
                {tool.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
