"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import styles from "./AssessmentTake.module.css";

import { FOCUSED_ASSESSMENT_SLUGS } from "@/lib/quiz/assessmentTakeUi";
import { isImmersiveSingleFlowEnabled } from "@/lib/quiz/uxFlags";

export function AssessmentSiteFrame({ children, header, footer, locale }: {
  children: ReactNode;
  header: ReactNode;
  footer: ReactNode;
  locale: Locale;
}) {
  const pathname = usePathname();
  const focusedSlug = FOCUSED_ASSESSMENT_SLUGS.find((slug) => pathname === localizedPath(`/tests/${slug}/take`, locale));
  const focused = Boolean(focusedSlug) && isImmersiveSingleFlowEnabled();

  if (!focused) {
    return <div className="fm-page-background min-h-screen text-[var(--fm-text)]">{header}{children}{footer}</div>;
  }

  return (
    <div className={styles.siteFrame}>
      <header className={styles.siteHeader}>
        <Link href={localizedPath("/", locale)} className={styles.wordmark}>
          {locale === "zh" ? "费马测试" : "FermatMind"}
        </Link>
        <Link href={localizedPath(`/tests/${focusedSlug}`, locale)} className={styles.exitLink}>
          {locale === "zh" ? "返回测评介绍" : "Back to assessment"}<span aria-hidden>↗</span>
        </Link>
      </header>
      {children}
      <footer className={styles.siteFooter}>
        <span>FermatMind</span>
        <nav aria-label={locale === "zh" ? "测评相关信息" : "Assessment information"}>
          <Link href={localizedPath("/science", locale)} target="_blank" rel="noopener noreferrer">{locale === "zh" ? "测评科学" : "Assessment science"}</Link>
          <Link href={localizedPath("/privacy", locale)} target="_blank" rel="noopener noreferrer">{locale === "zh" ? "隐私保护" : "Privacy"}</Link>
        </nav>
      </footer>
    </div>
  );
}
