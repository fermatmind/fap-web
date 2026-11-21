"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useQuestionnaireDisplayCopy } from "@/components/questionnaires/TraditionalQuestionnaireCopy";
import { Crown, Share2 } from "lucide-react";
import reference from "./MbtiCloneRail.reference.module.css";
import {
  getMbtiDesktopAnchorHash,
  getMbtiDesktopAnchorId,
} from "@/components/result/mbti/mbtiDesktopAnchorTargets";
import type { ProfileIdentity } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import styles from "@/components/result/mbti/clone/mbtiDesktopClone.module.css";

type MbtiCloneRailProps = {
  locale: "zh" | "en";
  profileIdentity: ProfileIdentity;
  referenceLayout?: boolean;
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
  referenceLayout = false,
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

  const { displayText: copy, traditional } = useQuestionnaireDisplayCopy();
  const displayLocale = traditional ? "zh-TW" : locale;
  const baseCode = /^([IE][NS][TF][JP])(?:-[AT])?$/i.exec(profileIdentity.code)?.[1].toLowerCase();
  if (referenceLayout) return <aside data-testid="mbti-sticky-rail" data-result-sidebar="true" className={`${styles.rail} ${reference.rail}`}>
    <div className={reference.card}>
      <div className={reference.identity} data-testid="mbti-rail-profile-identity">
        {baseCode ? <div className={reference.avatar}><Image src={`/images/mbti/result-portraits/${baseCode}.webp`} alt="" width={90} height={130} unoptimized /></div> : null}
        <div>
          <p className={reference.caption}>{locale === "zh" ? copy("你的人格类型是：") : "Your personality type is:"}</p>
          <p className={reference.name}>{copy(nameLine)}</p>
          <p className={reference.code}>{profileIdentity.code}</p>
        </div>
      </div>
      <nav aria-label={locale === "zh" ? copy("本页内容") : "On this page"}>
        <p className={reference.navTitle}>{locale === "zh" ? copy("本页内容") : "On this page"}</p>
        {ANCHORS.map((anchor) => <a key={anchor.id} href={getMbtiDesktopAnchorHash(anchor.key)} aria-current={activeAnchor === anchor.id ? "location" : undefined} className={reference.link}>
          {locale === "zh" ? copy({ traits: "1. 人格特征", career: "2. 你的职业道路", growth: "3. 你的个人成长", relationships: "4. 你的人际关系" }[anchor.key]) : anchor.label.en}
        </a>)}
        <a href={`https://fermatmind.com/${displayLocale}/history/mbti`} className={reference.link}><Crown size={18} aria-hidden="true" />{locale === "zh" ? copy("解锁全部结果") : "Unlock all results"}</a>
      </nav>
      <div className={reference.tools}>
        <button type="button" disabled title={locale === "zh" ? copy("本地类型预览暂不支持分享个人结果") : "Sharing a personal result is unavailable in this local type preview"}><Share2 size={14} aria-hidden="true" />{locale === "zh" ? copy("分享你的结果") : "Share your results"}</button>
      </div>
    </div>
  </aside>;

  return (
    <aside data-testid="mbti-sticky-rail" data-result-sidebar="true" className={styles.rail}>
      <div className={styles.railCard}>
        <div className={styles.railIdentityCard} data-testid="mbti-rail-profile-identity">
          <p className={styles.railCodePrimary}>{profileIdentity.code}</p>
          {nameLine ? <p className={styles.railNameLine}>{copy(nameLine)}</p> : null}
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
