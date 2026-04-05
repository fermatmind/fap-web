"use client";

import { useState } from "react";
import type { TraitSlot, TraitUnlockBlock } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import styles from "@/components/result/mbti/clone/mbtiDesktopClone.module.css";

type MbtiCloneInfluentialTraitsCardProps = {
  sectionId: string;
  locale: "zh" | "en";
  traits: TraitSlot[];
  traitsUnlock?: TraitUnlockBlock | null;
  isUnlocked: boolean;
  unlockHref: string;
  unlockPayLabel: string;
  unlockInviteLabel: string;
  unlockInviteHref: string;
};

function normalizeTraitLetter(label: string) {
  const normalized = label.trim();
  return normalized ? normalized.slice(0, 1).toUpperCase() : "?";
}

export function MbtiCloneInfluentialTraitsCard({
  sectionId,
  locale,
  traits,
  traitsUnlock = null,
  isUnlocked,
  unlockHref,
  unlockPayLabel,
  unlockInviteLabel,
  unlockInviteHref,
}: MbtiCloneInfluentialTraitsCardProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const canShowDetails = isUnlocked && traitsUnlock?.items.length === 4;
  const activeIndex = canShowDetails ? Math.min(selectedIndex, 3) : 0;
  const detailItem = traitsUnlock?.items[activeIndex] ?? traitsUnlock?.items[0] ?? null;
  const fieldLabels =
    locale === "zh"
      ? {
          why: "为什么重要",
          expression: "在这一章里的表现",
          advantage: "它带来的优势",
          overuse: "过度使用的风险",
          signal: "现实中的信号",
          hint: "升级建议",
        }
      : {
          why: "Why it matters",
          expression: "How it shows up here",
          advantage: "Where it helps",
          overuse: "Overuse risk",
          signal: "Real-world signal",
          hint: "Upgrade hint",
        };
  const lockedCopy =
    locale === "zh"
      ? {
          title: "解锁完整报告",
          body: "解锁完整报告后即可查看这些结果，并纳入你的人格分析。",
        }
      : {
          title: "Unlock full report",
          body: "Unlock the full report to view these results and add them to your personality analysis.",
        };

  return (
    <section className={styles.influentialCard}>
      <p className={styles.microLabel}>{locale === "zh" ? "Influential Traits" : "Influential Traits"}</p>
      <div className={styles.traitSlotRow}>
        {traits.slice(0, 4).map((trait, index) => (
          <button
            type="button"
            key={`${trait.label}-${index}`}
            className={styles.traitSlotButton}
            data-placeholder={trait.isPlaceholder ? "true" : "false"}
            data-active={canShowDetails && index === activeIndex ? "true" : "false"}
            data-interactive={canShowDetails ? "true" : "false"}
            title={trait.body}
            aria-label={trait.body ? `${trait.label}: ${trait.body}` : trait.label}
            aria-pressed={canShowDetails ? index === activeIndex : undefined}
            disabled={!canShowDetails}
            onClick={() => setSelectedIndex(index)}
          >
            <span className={styles.traitSlot}>
              <span className={styles.traitSlotIcon} data-color={trait.colorKey ?? "blue"}>
                {normalizeTraitLetter(trait.label)}
              </span>
              <p className={styles.traitSlotLabel}>{trait.label}</p>
            </span>
          </button>
        ))}
      </div>
      {!isUnlocked ? (
        <>
          <div className={styles.unlockRule} />
          <div
            className={`${styles.unlockPanel} ${styles.unlockPanelCompact} ${styles.traitsLockPanel}`}
            data-testid={`mbti-${sectionId}-traits-lock-panel`}
          >
            <div className={styles.unlockPanelText}>
              <p className={styles.unlockTitle}>{lockedCopy.title}</p>
              <p className={styles.unlockCopy}>{lockedCopy.body}</p>
            </div>
            <div className={styles.unlockButtonRow} data-testid={`mbti-${sectionId}-unlock-actions`}>
              <a
                href={unlockHref}
                className={`${styles.unlockButton} ${styles.unlockButtonCompact}`}
                data-testid={`mbti-${sectionId}-pay-cta`}
              >
                {unlockPayLabel}
              </a>
              <a
                href={unlockInviteHref}
                className={`${styles.unlockButton} ${styles.unlockButtonCompact} ${styles.unlockButtonSecondary}`}
                data-testid={`mbti-${sectionId}-invite-cta`}
              >
                {unlockInviteLabel}
              </a>
            </div>
          </div>
        </>
      ) : canShowDetails && detailItem ? (
        <>
          <div className={styles.unlockRule} />
          <div className={styles.traitsUnlockPanel} data-testid={`mbti-${sectionId}-traits-unlock-panel`}>
            <div className={styles.traitsUnlockHeader}>
              <p className={styles.traitsUnlockEyebrow}>{traitsUnlock?.title}</p>
              <h3 className={styles.traitsUnlockTitle}>{detailItem.label}</h3>
              <p className={styles.traitsUnlockIntro}>{traitsUnlock?.intro}</p>
            </div>
            <div className={styles.traitsUnlockGrid}>
              <article className={styles.traitsUnlockItem}>
                <p className={styles.traitsUnlockItemLabel}>{fieldLabels.why}</p>
                <p className={styles.traitsUnlockItemBody}>{detailItem.whyItMatters}</p>
              </article>
              <article className={styles.traitsUnlockItem}>
                <p className={styles.traitsUnlockItemLabel}>{fieldLabels.expression}</p>
                <p className={styles.traitsUnlockItemBody}>{detailItem.expression}</p>
              </article>
              <article className={styles.traitsUnlockItem}>
                <p className={styles.traitsUnlockItemLabel}>{fieldLabels.advantage}</p>
                <p className={styles.traitsUnlockItemBody}>{detailItem.advantage}</p>
              </article>
              <article className={styles.traitsUnlockItem}>
                <p className={styles.traitsUnlockItemLabel}>{fieldLabels.overuse}</p>
                <p className={styles.traitsUnlockItemBody}>{detailItem.overuseRisk}</p>
              </article>
              <article className={styles.traitsUnlockItem}>
                <p className={styles.traitsUnlockItemLabel}>{fieldLabels.signal}</p>
                <p className={styles.traitsUnlockItemBody}>{detailItem.realWorldSignal}</p>
              </article>
              <article className={styles.traitsUnlockItem}>
                <p className={styles.traitsUnlockItemLabel}>{fieldLabels.hint}</p>
                <p className={styles.traitsUnlockItemBody}>{detailItem.upgradeHint}</p>
              </article>
            </div>
            <div className={styles.traitsUnlockDefinition}>
              <p className={styles.traitsUnlockItemLabel}>{locale === "zh" ? "定义" : "Definition"}</p>
              <p className={styles.traitsUnlockItemBody}>{detailItem.definition}</p>
            </div>
          </div>
        </>
      ) : (
        null
      )}
    </section>
  );
}
