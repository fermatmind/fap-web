"use client";

import type { TraitSlot } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import styles from "@/components/result/mbti/clone/mbtiDesktopClone.module.css";

type MbtiCloneInfluentialTraitsCardProps = {
  locale: "zh" | "en";
  traits: TraitSlot[];
  isUnlocked: boolean;
  unlockHref: string;
  unlockLabel: string;
};

function normalizeTraitLetter(label: string) {
  const normalized = label.trim();
  return normalized ? normalized.slice(0, 1).toUpperCase() : "?";
}

export function MbtiCloneInfluentialTraitsCard({
  locale,
  traits,
  isUnlocked,
  unlockHref,
  unlockLabel,
}: MbtiCloneInfluentialTraitsCardProps) {
  return (
    <section className={styles.influentialCard}>
      <p className={styles.microLabel}>{locale === "zh" ? "Influential Traits" : "Influential Traits"}</p>
      <div className={styles.traitSlotRow}>
        {traits.slice(0, 4).map((trait, index) => (
          <div
            key={`${trait.label}-${index}`}
            className={styles.traitSlot}
            data-placeholder={trait.isPlaceholder ? "true" : "false"}
            title={trait.body}
            aria-label={trait.body ? `${trait.label}: ${trait.body}` : trait.label}
          >
            <span className={styles.traitSlotIcon} data-color={trait.colorKey ?? "blue"}>
              {normalizeTraitLetter(trait.label)}
            </span>
            <p className={styles.traitSlotLabel}>{trait.label}</p>
          </div>
        ))}
      </div>
      <div className={styles.unlockRule} />
      {isUnlocked ? (
        <div className={styles.unlockedState}>
          <p className={styles.unlockedStateLead}>{locale === "zh" ? "已解锁完整章节内容" : "Full chapter content unlocked"}</p>
          <p className={styles.unlockedStateBody}>
            {locale === "zh"
              ? "同一位置继续保留卡片语法，后续真实内容会接入这一块而不是替换成别的样式。"
              : "The same card grammar stays in place after unlock instead of switching to a different component style."}
          </p>
        </div>
      ) : (
        <div className={styles.unlockPanel}>
          <p className={styles.unlockTitle}>{locale === "zh" ? "解锁这一章的完整细节" : "Unlock the full details for this chapter"}</p>
          <p className={styles.unlockCopy}>
            {locale === "zh"
              ? "桌面 clone 壳保留 16P 式中央解锁面板，点击后进入真实购买收口。"
              : "The desktop clone keeps the central 16P-style unlock panel and sends readers to the real offer block."}
          </p>
          <a href={unlockHref} className={styles.unlockButton}>
            {unlockLabel}
          </a>
        </div>
      )}
    </section>
  );
}
