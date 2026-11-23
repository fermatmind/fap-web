import { ArrowDown } from "lucide-react";
import type { RiasecPurchase } from "@/lib/api/v0_3";
import type { DisplayLocale } from "@/lib/i18n/locales";
import styles from "@/components/career/unlock-report-experience.module.css";

type ReportOffer = RiasecPurchase["offers"][number];

export function selectReportPurchaseOffer(offers: ReportOffer[], locale: DisplayLocale): ReportOffer | undefined {
  return offers.find(offer => offer.currency === (locale === "en" ? "USD" : "CNY")) ?? offers[0];
}

export function MobileReportPurchaseEntry({ offer, locale, onClick }: { offer: ReportOffer; locale: DisplayLocale; onClick: () => void }) {
  const price = `${offer.currency === "CNY" ? "¥" : "US$"}${(offer.amount_cents / 100).toFixed(2)}`;
  const label = locale === "en" ? `Unlock the full report · ${price}`
    : locale === "zh-TW" ? `${price} 解鎖完整報告` : `${price} 解锁完整报告`;
  return <a className={styles.mobilePurchase} href="#unlock-payment-options" data-report-purchase-entry onClick={onClick}>
    {label}<ArrowDown size={17} aria-hidden="true" />
  </a>;
}
