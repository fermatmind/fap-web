"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getMbtiDesktopAnchorHash,
  getMbtiDesktopAnchorId,
} from "@/components/result/mbti/mbtiDesktopAnchorTargets";
import type { ProfileIdentity } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import styles from "@/components/result/mbti/clone/mbtiDesktopClone.module.css";

type RailTool = {
  label: string;
  href?: string;
  onClick?: () => void | Promise<void>;
  disabled?: boolean;
  kind?: "pill" | "text";
};

type MbtiCloneRailProps = {
  locale: "zh" | "en";
  profileIdentity: ProfileIdentity;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  tools: RailTool[];
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

function isHashHref(href: string) {
  return href.startsWith("#");
}

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
  primaryCtaLabel,
  primaryCtaHref,
  tools,
}: MbtiCloneRailProps) {
  const [activeAnchor, setActiveAnchor] = useState(TRAITS_ANCHOR_ID);
  const nameLine = [profileIdentity.name, profileIdentity.nickname]
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
    <aside data-testid="mbti-sticky-rail" className={styles.rail}>
      <div className={styles.railCard}>
        <div className={styles.railIdentityCard} data-testid="mbti-rail-profile-identity">
          <p className={styles.railCodePrimary}>{profileIdentity.code}</p>
          {nameLine ? <p className={styles.railNameLine}>{nameLine}</p> : null}
          {profileIdentity.rarity ? <p className={styles.railRarity}>{`稀有度：${profileIdentity.rarity}`}</p> : null}
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

      <div className={styles.railCard}>
        <p className={styles.microLabel}>{locale === "zh" ? "解锁入口" : "Unlock entry"}</p>
        {isHashHref(primaryCtaHref) ? (
          <a href={primaryCtaHref} className={styles.toolLinkText}>
            {primaryCtaLabel}
          </a>
        ) : (
          <Link href={primaryCtaHref} className={styles.toolLinkText}>
            {primaryCtaLabel}
          </Link>
        )}
      </div>

      {tools.length > 0 ? (
        <div className={styles.railCard}>
          <p className={styles.microLabel}>{locale === "zh" ? "工具" : "Tools"}</p>
          <div className={styles.railTools}>
            {tools.map((tool) => {
              const key = `${tool.label}-${tool.href ?? "button"}`;
              if (tool.onClick) {
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => void tool.onClick?.()}
                    disabled={tool.disabled}
                    className={styles.toolButton}
                  >
                    {tool.label}
                  </button>
                );
              }

              if (!tool.href) {
                return null;
              }

              if (isHashHref(tool.href)) {
                return (
                  <a key={key} href={tool.href} className={styles.toolLink}>
                    {tool.label}
                  </a>
                );
              }

              return (
                <Link key={key} href={tool.href} className={styles.toolLink}>
                  {tool.label}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </aside>
  );
}
