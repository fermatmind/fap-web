"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
  displayName: string;
  typeCode: string;
  tags: string[];
  isUnlocked: boolean;
  summary: string;
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
  displayName,
  typeCode,
  tags,
  isUnlocked,
  summary,
  primaryCtaLabel,
  primaryCtaHref,
  tools,
}: MbtiCloneRailProps) {
  const [activeAnchor, setActiveAnchor] = useState("traits");

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
        <div className={styles.identityMini}>
          <span className={styles.identityBadge}>{normalizeText(typeCode).slice(0, 1) || "M"}</span>
          <div>
            <p className={styles.microLabel}>{locale === "zh" ? "人格类型" : "Type"}</p>
            <p className={styles.railTitle}>{displayName || typeCode}</p>
            <p className={styles.railCode}>{typeCode}</p>
          </div>
        </div>
        <p className={styles.railBody}>
          {isUnlocked
            ? locale === "zh"
              ? "完整访问已启用。桌面克隆壳继续保留 16P 式 rail 与章节阅读节奏。"
              : "Full access is enabled. The desktop clone keeps the 16P-style rail and reading cadence."
            : summary}
        </p>
        {tags.length > 0 ? (
          <div className={styles.tagRow}>
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        ) : null}
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
