"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import type { DisplayLocale } from "@/lib/i18n/locales";
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
const startupFame = {
  name: "Startup Fame",
  href: "https://startupfa.me/s/fermatmind?utm_source=fermatmind.com",
};

// Original assets: producthunt.com/branding (logo, unmodified) and the badge
// embed offered by saashub.com/fermatmind. No ranking/featured badge is implied.
function PlatformMark({ name }: { name: string }) {
  if (name === "Product Hunt") {
    return <Image src="/images/platforms/product-hunt.png" alt={name} width={1224} height={440} className={styles.productHuntMark} unoptimized />;
  }
  if (name === "SaaSHub") {
    return <Image src="/images/platforms/saashub-approved.png" alt={name} width={300} height={100} className={styles.saashubMark} unoptimized />;
  }
  if (name === "Startup Fame") {
    return <Image src="/images/platforms/startup-fame-featured.webp" alt="FermatMind on Startup Fame" width={224} height={36} unoptimized />;
  }
  return <>{name}<ArrowUpRight size={14} aria-hidden="true" /></>;
}

export function SiteFooterPlatforms({ locale }: { locale: DisplayLocale }) {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "/zh" || pathname === "/en" || pathname === "/zh-TW";
  const displayedPlatforms = isHome ? [startupFame, ...platforms] : platforms;
  const zh = locale === "zh";
  const taiwan = locale === "zh-TW";
  const title = taiwan ? "平台收錄" : zh ? "平台收录" : "Find us on";
  const label = (name: string) => {
    const destination = name === "Outbring"
      ? (taiwan ? "產品排行榜" : zh ? "产品排行榜" : "product leaderboard")
      : name === "Zearches"
        ? (taiwan ? "FermatMind 搜尋結果" : zh ? "FermatMind 搜索结果" : "FermatMind search results")
        : (taiwan ? "FermatMind 項目" : zh ? "FermatMind 条目" : "FermatMind listing");
    return `${name} — ${destination}${taiwan ? "（在新分頁開啟）" : zh ? "（新窗口打开）" : " (opens in a new tab)"}`;
  };

  return (
    <section className={styles.platforms} aria-label={title}>
      <ul className={styles.platformGroup}>
        {displayedPlatforms.map(({ name, href }) => (
          <li key={name}>
            <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label(name)} className={styles.platformLink}>
              <PlatformMark name={name} />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
