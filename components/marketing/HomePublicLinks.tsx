"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { OPEN_DATASET_ARCHIVES, OPEN_DATASET_LABELS, showsHomePublicLinks } from "@/lib/site/openDatasetArchives";
import styles from "./home-public-links.module.css";

// Public listings only. Outbring has no verified stable product detail URL;
// Zearches links to the brand search result, not an individual product page.
const platforms = [
  { name: "Product Hunt", href: "https://www.producthunt.com/products/fermatmind" },
  { name: "SaaSHub", href: "https://www.saashub.com/fermatmind" },
  { name: "VibeCafé", href: "https://vibecafe.ai/products/cmvdd5x4o000002l1prsfmuoy" },
  { name: "Zearches", href: "https://zearches.com/directory.php?slug=education-learning&q=FermatMind" },
  { name: "Outbring", href: "https://outbring.lol/zh/" },
  { name: "CareerFlora", href: "https://careerflora.com/open-source-tools?q=FermatMind&category=Education" },
] as const;
const startupFame = {
  name: "Startup Fame",
  href: "https://startupfa.me/s/fermatmind?utm_source=fermatmind.com",
};

const directoryItems = [startupFame,
  { name: "Twelve Tools", href: "https://twelve.tools" },
  { name: "SaaSBison", href: "https://saasbison.com" },
  ...platforms,
] as const;

// Original assets: producthunt.com/branding (logo, unmodified) and the badge
// embed offered by saashub.com/fermatmind. No ranking/featured badge is implied.
function PlatformMark({ name, allowWebViewImageStyles }: { name: string; allowWebViewImageStyles?: boolean }) {
  if (name === "Product Hunt") {
    return <Image src="/images/platforms/product-hunt.png" alt={name} width={1224} height={440} className={styles.productHuntMark} unoptimized suppressHydrationWarning={allowWebViewImageStyles} />;
  }
  if (name === "SaaSHub") {
    return <Image src="/images/platforms/saashub-approved.png" alt={name} width={300} height={100} className={styles.saashubMark} unoptimized suppressHydrationWarning={allowWebViewImageStyles} />;
  }
  if (name === "Startup Fame") {
    return <Image src="/images/platforms/startup-fame-featured.webp" alt="FermatMind on Startup Fame" width={224} height={36} unoptimized suppressHydrationWarning={allowWebViewImageStyles} />;
  }
  return <>{name}<ArrowUpRight size={14} aria-hidden="true" /></>;
}

const text = {
  zh: { title: "公开数据与平台页面", platform: "平台页面" },
  "zh-TW": { title: "公開資料與平台頁面", platform: "平台頁面" },
  en: { title: "Open data & platform pages", platform: "Platform page" },
};

export function HomePublicLinks({ locale }: { locale: DisplayLocale }) {
  const pathname = usePathname();
  const allowed = showsHomePublicLinks(pathname, locale);
  const labels = text[locale];

  if (!allowed) return null;


  return (
    <section className={styles.section} data-home-public-links aria-label={labels.title}>
      <Container className="max-w-[82rem] px-6 md:px-8">
        <ul className={styles.track} tabIndex={0} aria-label={labels.title}>
          {OPEN_DATASET_ARCHIVES.map(item => (
            <li key={item.id} data-home-link-kind="dataset">
              <a href={item.href} target="_blank" rel="noopener noreferrer" className={styles.card}>
                <span className={styles.kind}>{OPEN_DATASET_LABELS[locale]}</span>
                <span className={styles.mark}>{item.names[locale]} <span aria-hidden="true">↗</span></span>
              </a>
            </li>
          ))}
          {directoryItems.map(({ name, href }) => (
            <li key={name} data-home-link-kind="platform">
              <a href={href} target="_blank" rel={name === "SaaSBison" ? "dofollow" : name === "Twelve Tools" ? "noopener" : "noopener noreferrer"} className={styles.card}>
                <span className={styles.kind}>{labels.platform}</span>
                <span className={styles.mark}>
                  {name === "SaaSBison" ? (
                    // Official static image only; no third-party script.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src="https://saasbison.com/badge.png" alt="Featured on SaaSBison" width="200" height="54" loading="lazy" className={styles.saasBisonMark} />
                  ) : <PlatformMark name={name} />}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
