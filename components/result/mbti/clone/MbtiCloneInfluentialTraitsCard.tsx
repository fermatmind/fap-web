"use client";

import { type MouseEvent as ReactMouseEvent } from "react";
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
  unlockInviteLabel?: string;
  unlockInviteHref?: string;
  onInviteCtaClick?: (event: ReactMouseEvent<HTMLAnchorElement>) => void;
};

export function MbtiCloneInfluentialTraitsCard({
  sectionId,
  locale,
  traitsUnlock = null,
  isUnlocked,
  unlockHref,
  unlockPayLabel,
  unlockInviteLabel,
  unlockInviteHref,
  onInviteCtaClick,
}: MbtiCloneInfluentialTraitsCardProps) {
  const canShowDetails = isUnlocked && traitsUnlock?.items.length === 4;
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
      <div className={styles.factorNavigation}>
      <div className={styles.influentialHeading}>
        <h3>{locale === "zh" ? "影响因素" : "Influential Traits"}</h3>
        <span>{locale === "zh" ? "从四个角度，理解自己的表现" : "Four perspectives on your patterns"}</span>
      </div>
      </div>
      {!isUnlocked ? (
        <>
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
              {unlockInviteLabel ? (
                <a
                  href={unlockInviteHref ?? ""}
                  onClick={onInviteCtaClick}
                  className={`${styles.unlockButton} ${styles.unlockButtonCompact} ${styles.unlockButtonSecondary}`}
                  data-testid={`mbti-${sectionId}-invite-cta`}
                >
                  {unlockInviteLabel}
                </a>
              ) : null}
            </div>
          </div>
        </>
      ) : canShowDetails && traitsUnlock ? (
        <div className={styles.traitsUnlockPanel} data-testid={`mbti-${sectionId}-traits-unlock-panel`}>
          {traitsUnlock.items.map((detailItem, index) => (
            <article className={styles.factorReading} key={detailItem.id}>
              <header className={styles.traitsUnlockHeader}>
                <span className={styles.factorChapterNumber} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h4 className={styles.traitsUnlockTitle}>{detailItem.label}</h4>
                  <p className={styles.factorDefinition}>{detailItem.definition}</p>
                </div>
              </header>
              <div className={styles.factorBody}>
                <section className={styles.factorMainText}>
                  <h5>{locale === "zh" ? "日常中的表现" : "In everyday life"}</h5>
                  <p>{detailItem.expression}</p>
                  <h5>{fieldLabels.why}</h5>
                  <p>{detailItem.whyItMatters}</p>
                </section>
                <div className={styles.factorPerspectives}>
                  <section>
                    <h5>{fieldLabels.advantage}</h5>
                    <p>{detailItem.advantage}</p>
                  </section>
                  <section>
                    <h5>{fieldLabels.overuse}</h5>
                    <p>{detailItem.overuseRisk}</p>
                  </section>
                </div>
                <section className={styles.factorObservation}>
                  <h5>{fieldLabels.signal}</h5>
                  <p>{detailItem.realWorldSignal}</p>
                </section>
                <section className={styles.factorPractice}>
                  <h5>{locale === "zh" ? "可以试试" : "Something to try"}</h5>
                  <p>{detailItem.upgradeHint}</p>
                </section>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
