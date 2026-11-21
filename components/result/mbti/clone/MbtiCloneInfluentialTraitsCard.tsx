"use client";

import { useQuestionnaireDisplayCopy } from "@/components/questionnaires/TraditionalQuestionnaireCopy";

import { type MouseEvent as ReactMouseEvent } from "react";
import type { TraitSlot, TraitUnlockBlock } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import styles from "@/components/result/mbti/clone/mbtiDesktopClone.module.css";

type MbtiCloneInfluentialTraitsCardProps = {
  sectionId: string;
  locale: "zh" | "en";
  traits: TraitSlot[];
  traitsUnlock?: TraitUnlockBlock | null;
  isUnlocked: boolean;
  snapshotMode?: boolean;
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
  snapshotMode = false,
  unlockHref,
  unlockPayLabel,
  unlockInviteLabel,
  unlockInviteHref,
  onInviteCtaClick,
}: MbtiCloneInfluentialTraitsCardProps) {
  const { displayText: copy } = useQuestionnaireDisplayCopy();
  const canShowDetails = isUnlocked && traitsUnlock?.items.length === 4;
  const fieldLabels =
    locale === "zh"
      ? {
          why: copy("为什么重要"),
          expression: copy("在这一章里的表现"),
          advantage: copy("它带来的优势"),
          overuse: copy("过度使用的风险"),
          signal: copy("现实中的信号"),
          hint: copy("升级建议"),
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
          title: copy("解锁完整报告"),
          body: copy("解锁完整报告后即可查看这些结果，并纳入你的人格分析。"),
        }
      : {
          title: "Unlock full report",
          body: "Unlock the full report to view these results and add them to your personality analysis.",
        };

  return (
    <section className={styles.influentialCard}>
      <div className={styles.factorNavigation}>
      <div className={styles.influentialHeading}>
        <h3>{canShowDetails ? (locale === "zh" ? copy("把这些倾向用在日常") : "Put these patterns into practice") : (locale === "zh" ? copy("影响因素") : "Influential Traits")}</h3>
        <span>{locale === "zh" ? copy("选一个与你近况相关的建议，先试一次") : "Pick one suggestion that fits your situation and try it"}</span>
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
        <div className={styles.factorActionGrid} data-testid={`mbti-${sectionId}-traits-unlock-panel`}>
          {traitsUnlock.items.map((detailItem) => (
            <article className={styles.factorActionCard} key={detailItem.id}>
              <h4>{detailItem.label}</h4>
              <p className={styles.factorActionRisk}>
                <span>{locale === "zh" ? copy("留意") : "Watch for"}</span>
                {detailItem.overuseRisk}
              </p>
              <p className={styles.factorActionStep}>
                <span>{locale === "zh" ? copy("试试") : "Try this"}</span>
                {detailItem.upgradeHint}
              </p>
              <details className={styles.factorActionContext} open={snapshotMode || undefined}>
                <summary>{locale === "zh" ? copy("查看具体表现") : "See how it shows up"}</summary>
                <p>{detailItem.definition}</p>
                <dl>
                  <dt>{locale === "zh" ? copy("日常中的表现") : "In everyday life"}</dt>
                  <dd>{detailItem.expression}</dd>
                  <dt>{fieldLabels.advantage}</dt>
                  <dd>{detailItem.advantage}</dd>
                  <dt>{fieldLabels.signal}</dt>
                  <dd>{detailItem.realWorldSignal}</dd>
                  <dt>{fieldLabels.why}</dt>
                  <dd>{detailItem.whyItMatters}</dd>
                </dl>
              </details>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
