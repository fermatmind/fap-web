"use client";

import { useEffect, useState } from "react";
import {
  getMbtiDesktopAnchorHash,
  getMbtiDesktopAnchorId,
} from "@/components/result/mbti/mbtiDesktopAnchorTargets";
import type { ProfileIdentity } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import styles from "@/components/result/mbti/clone/mbtiDesktopClone.module.css";

type MbtiCloneRailProps = {
  locale: "zh" | "en";
  profileIdentity: ProfileIdentity;
};

const ANCHORS = [
  { key: "traits", id: getMbtiDesktopAnchorId("traits"), label: { zh: "1. 人格特质", en: "1. Personality Traits" } },
  { key: "career", id: getMbtiDesktopAnchorId("career"), label: { zh: "2. 职业路径", en: "2. Your Career Path" } },
  { key: "growth", id: getMbtiDesktopAnchorId("growth"), label: { zh: "3. 个人成长", en: "3. Your Personal Growth" } },
  { key: "relationships", id: getMbtiDesktopAnchorId("relationships"), label: { zh: "4. 关系模式", en: "4. Your Relationships" } },
] as const;

const HERO_ANCHOR_ID = getMbtiDesktopAnchorId("hero");
const TRAITS_ANCHOR_ID = getMbtiDesktopAnchorId("traits");

const ACTIVE_IDS = [
  HERO_ANCHOR_ID,
  TRAITS_ANCHOR_ID,
  getMbtiDesktopAnchorId("career"),
  getMbtiDesktopAnchorId("growth"),
  getMbtiDesktopAnchorId("relationships"),
  getMbtiDesktopAnchorId("offerFull"),
] as const;

function normalizeText(...values: unknown[]) {
  for (const value of values) {
    const normalized = String(value ?? "").trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

export function MbtiCloneRail({
  locale,
  profileIdentity,
}: MbtiCloneRailProps) {
  const [activeAnchor, setActiveAnchor] = useState(TRAITS_ANCHOR_ID);
  const nameLine = (locale === "zh" ? [profileIdentity.name] : [profileIdentity.name, profileIdentity.nickname])
    .map((value) => normalizeText(value))
    .filter((value) => value.length > 0)
    .join(" · ");

  useEffect(() => {
    const updateFromViewport = () => {
      let next = TRAITS_ANCHOR_ID;
      for (const id of ACTIVE_IDS) {
        const element = document.getElementById(id);
        if (!element) {
          continue;
        }

        if (element.getBoundingClientRect().top <= 160) {
          next = id === HERO_ANCHOR_ID ? TRAITS_ANCHOR_ID : id;
        }
      }
      setActiveAnchor(next);
    };

    updateFromViewport();
    window.addEventListener("scroll", updateFromViewport, { passive: true });
    window.addEventListener("hashchange", updateFromViewport);

    return () => {
      window.removeEventListener("scroll", updateFromViewport);
      window.removeEventListener("hashchange", updateFromViewport);
    };
  }, []);

  return (
    <aside data-testid="mbti-sticky-rail" data-result-sidebar="true" className={styles.rail}>
      <div className={styles.railCard}>
        <div className={styles.railIdentityCard} data-testid="mbti-rail-profile-identity">
          <p className={styles.railCodePrimary}>{profileIdentity.code}</p>
          {nameLine ? <p className={styles.railNameLine}>{nameLine}</p> : null}
          {profileIdentity.rarity ? <p className={styles.railRarity}>{locale === "zh" ? `稀有度：${profileIdentity.rarity}` : `Rarity: ${profileIdentity.rarity}`}</p> : null}
          {profileIdentity.keywords.length > 0 ? (
            <div className={styles.railKeywordRow}>
              {profileIdentity.keywords.slice(0, 6).map((keyword) => (
                <span key={keyword} className={styles.railKeyword}>
                  {keyword}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className={styles.railCard}>
        <p className={styles.microLabel}>{locale === "zh" ? "本页导航" : "On this page"}</p>
        <div className={styles.anchorList}>
          {ANCHORS.map((anchor) => (
            <a
              key={anchor.id}
              href={getMbtiDesktopAnchorHash(anchor.key)}
              aria-current={activeAnchor === anchor.id ? "location" : undefined}
              className={`${styles.anchorLink} ${activeAnchor === anchor.id ? styles.anchorLinkActive : ""}`}
            >
              {anchor.label[locale]}
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
