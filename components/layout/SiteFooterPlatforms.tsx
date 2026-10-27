"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Pause, Play } from "lucide-react";
import type { Locale } from "@/lib/i18n/locales";
import styles from "./site-footer.module.css";

// Public listings only. Outbring has no verified stable product detail URL;
// Zearches links to the brand search result, not an individual product page.
const platforms = [
  { name: "Product Hunt", href: "https://www.producthunt.com/products/fermatmind" },
  { name: "SaaSHub", href: "https://www.saashub.com/fermatmind" },
  { name: "VibeCafé", href: "https://vibecafe.ai/products/cmvdd5x4o000002l1prsfmuoy" },
  { name: "Zearches", href: "https://zearches.com/directory.php?slug=education-learning&q=FermatMind" },
  { name: "Outbring", href: "https://outbring.lol/zh/" },
] as const;

// Original assets: producthunt.com/branding (logo, unmodified) and the badge
// embed offered by saashub.com/fermatmind. No ranking/featured badge is implied.
function PlatformMark({ name }: { name: string }) {
  if (name === "Product Hunt") {
    return <Image src="/images/platforms/product-hunt.png" alt={name} width={1224} height={440} className={styles.productHuntMark} unoptimized />;
  }
  if (name === "SaaSHub") {
    return <Image src="/images/platforms/saashub-approved.png" alt={name} width={300} height={100} className={styles.saashubMark} unoptimized />;
  }
  return <>{name}<ArrowUpRight size={14} aria-hidden="true" /></>;
}

export function SiteFooterPlatforms({ locale }: { locale: Locale }) {
  const [paused, setPaused] = useState(false);
  const zh = locale === "zh";
  const title = zh ? "平台收录" : "Find us on";
  const label = (name: string) => {
    const destination = name === "Outbring"
      ? (zh ? "产品排行榜" : "product leaderboard")
      : name === "Zearches"
        ? (zh ? "FermatMind 搜索结果" : "FermatMind search results")
        : (zh ? "FermatMind 条目" : "FermatMind listing");
    return `${name} — ${destination}${zh ? "（新窗口打开）" : " (opens in a new tab)"}`;
  };

  return (
    <section className={styles.platforms} aria-label={title} data-paused={paused}>
      <div className={styles.platformHeading}>
        <h2>{title}</h2>
        <button
          type="button"
          className={styles.platformPause}
          aria-label={zh ? "暂停平台展示滚动" : "Pause platform scrolling"}
          aria-pressed={paused}
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? <Play size={12} aria-hidden="true" /> : <Pause size={12} aria-hidden="true" />}
          <span>{paused ? (zh ? "继续滚动" : "Resume") : (zh ? "暂停滚动" : "Pause")}</span>
        </button>
      </div>
      <div className={styles.platformViewport}>
        <div className={styles.platformTrack}>
          {[false, true].map((duplicate) => (
            <ul key={String(duplicate)} className={styles.platformGroup} aria-hidden={duplicate || undefined}>
              {platforms.map(({ name, href }) => (
                <li key={name}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={duplicate ? -1 : undefined}
                    aria-label={label(name)}
                    className={styles.platformLink}
                  >
                    <PlatformMark name={name} />
                  </a>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
