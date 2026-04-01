"use client";

import Link from "next/link";
import { DimensionBars } from "@/components/result/DimensionBars";
import { MbtiCloneAssetSlot } from "@/components/result/mbti/clone/MbtiCloneAssetSlot";
import { MbtiCloneSectionHeading } from "@/components/result/mbti/clone/MbtiCloneSectionHeading";
import type { MbtiDesktopCloneAssetSlotId } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import styles from "@/components/result/mbti/clone/mbtiDesktopClone.module.css";
import type { PersonalityDesktopCloneAssetSlot } from "@/lib/cms/personality-desktop-clone";

type TraitTool = {
  label: string;
  href?: string;
  onClick?: () => void | Promise<void>;
  disabled?: boolean;
};

type MbtiCloneTraitsSectionProps = {
  title: string;
  illustrationSlotId: MbtiDesktopCloneAssetSlotId;
  illustrationLabel: string;
  assetSlots?: PersonalityDesktopCloneAssetSlot[] | null;
  dimensions: Array<Record<string, unknown>>;
  summaryTitle: string;
  summaryValue: string;
  summaryLabel: string;
  summaryDescription: string;
  summarySlotId: MbtiDesktopCloneAssetSlotId;
  summarySlotLabel: string;
  paragraphs: string[];
  bodySource: "overview" | "traits";
  tools: TraitTool[];
  toolsPrompt?: string;
};

export function MbtiCloneTraitsSection({
  title,
  illustrationSlotId,
  illustrationLabel,
  assetSlots,
  dimensions,
  summaryTitle,
  summaryValue,
  summaryLabel,
  summaryDescription,
  summarySlotId,
  summarySlotLabel,
  paragraphs,
  bodySource,
  tools,
  toolsPrompt,
}: MbtiCloneTraitsSectionProps) {
  return (
    <section id="traits" className={styles.section}>
      <MbtiCloneAssetSlot
        slotId={illustrationSlotId}
        assetSlots={assetSlots}
        fallbackLabel={illustrationLabel}
        className={styles.illustrationSlot}
        labelClassName={styles.slotLabel}
        testId="mbti-asset-slot-traits"
      />
      <MbtiCloneSectionHeading number={1} title={title} />
      <div className={styles.traitsCard} data-testid="mbti-traits-card">
        <div className={styles.traitsOverviewRow}>
          <div className={styles.traitsMetrics}>
            <DimensionBars
              dimensions={dimensions}
              variant="clone16p"
              summaryTitle={summaryTitle}
              summaryValue={summaryValue}
              summaryLabel={summaryLabel}
              summaryDescription={summaryDescription}
              className={styles.cloneBars}
            />
          </div>
          <aside className={styles.summaryPane}>
            <div>
              <p className={styles.microLabel}>{summaryTitle}</p>
              <p className={styles.summaryValue}>{summaryValue}</p>
              <p className={styles.summaryLead}>{summaryLabel}</p>
            </div>
            <MbtiCloneAssetSlot
              slotId={summarySlotId}
              assetSlots={assetSlots}
              fallbackLabel={summarySlotLabel}
              className={styles.summaryIllustration}
              labelClassName={styles.slotLabel}
              testId="mbti-asset-slot-traits-summary"
            />
            <p className={styles.summaryText}>{summaryDescription}</p>
          </aside>
        </div>
        {tools.length > 0 ? (
          <div className={styles.traitsFooter} data-testid="mbti-traits-tools">
            {toolsPrompt ? <p className={styles.traitsFooterLead}>{toolsPrompt}</p> : null}
            <div className={styles.traitsTools}>
              {tools.map((tool, index) => {
                const key = `${tool.label}-${tool.href ?? "button"}`;
                const className = [
                  styles.subtleTool,
                  index === 0 ? styles.subtleToolPrimary : "",
                ]
                  .filter(Boolean)
                  .join(" ");

                if (tool.onClick) {
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => void tool.onClick?.()}
                      disabled={tool.disabled}
                      className={className}
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
                    <a key={key} href={tool.href} className={className}>
                      {tool.label}
                    </a>
                  );
                }

                return (
                  <Link key={key} href={tool.href} className={className}>
                    {tool.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
      <div
        className={styles.sectionParagraphs}
        data-testid="mbti-traits-body"
        data-body-source={bodySource}
      >
        {paragraphs.map((paragraph, index) => (
          <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}
