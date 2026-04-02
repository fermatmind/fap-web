"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
  { id: "traits", label: "1. Personality Traits" },
  { id: "career", label: "2. Your Career Path" },
  { id: "growth", label: "3. Your Personal Growth" },
  { id: "relationships", label: "4. Your Relationships" },
];

const ACTIVE_IDS = ["hero", "traits", "career", "growth", "relationships", "offer-full"];

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
  const [activeAnchor, setActiveAnchor] = useState("traits");
  const nameLine = [profileIdentity.name, profileIdentity.nickname]
    .map((value) => normalizeText(value))
    .filter((value) => value.length > 0)
    .join(" · ");

  useEffect(() => {
    const updateFromViewport = () => {
      let next = "traits";
      for (const id of ACTIVE_IDS) {
        const element = document.getElementById(id);
        if (!element) {
          continue;
        }

        if (element.getBoundingClientRect().top <= 160) {
          next = id === "hero" ? "traits" : id;
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
        <p className={styles.microLabel}>On this page</p>
        <div className={styles.anchorList}>
          {ANCHORS.map((anchor) => (
            <a
              key={anchor.id}
              href={`#${anchor.id}`}
              aria-current={activeAnchor === anchor.id ? "location" : undefined}
              className={`${styles.anchorLink} ${activeAnchor === anchor.id ? styles.anchorLinkActive : ""}`}
            >
              {anchor.label}
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
          <p className={styles.microLabel}>Tools</p>
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
