"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { displayNavigationPath } from "@/lib/i18n/traditionalRoutes";
import styles from "./AssessmentTake.module.css";

import { FOCUSED_ASSESSMENT_SLUGS } from "@/lib/quiz/assessmentTakeUi";
import { isImmersiveSingleFlowEnabled } from "@/lib/quiz/uxFlags";
import { parseQuestionnaireTakePath } from "@/lib/questionnaires/takePath";

export function AssessmentSiteFrame({ children, header, footer, locale }: {
  children: ReactNode;
  header: ReactNode;
  footer: ReactNode;
  locale: DisplayLocale;
}) {
  const pathname = usePathname();
  useEffect(() => {
    const changed = (event: StorageEvent) => {
      if (event.key === "fm_account_session_v1" && event.oldValue !== event.newValue) window.location.reload();
    };
    window.addEventListener("storage", changed);
    return () => window.removeEventListener("storage", changed);
  }, []);
  const withLocale = (path: string) => displayNavigationPath(path, locale);
  const taiwan = locale === "zh-TW";
  const focusedSlug = FOCUSED_ASSESSMENT_SLUGS.find((slug) => pathname === withLocale(`/tests/${slug}/take`));
  const questionnaireTake = parseQuestionnaireTakePath(taiwan ? pathname.replace(/^\/zh-TW(?=\/)/u, "/zh") : pathname);
  const friendshipInvite = /^\/(?:en|zh|zh-TW)\/share\/friendship\/[a-f0-9-]+\/?$/i.test(pathname);
  const focused = friendshipInvite || Boolean(questionnaireTake) || (Boolean(focusedSlug) && isImmersiveSingleFlowEnabled());

  if (pathname === withLocale("/account")) return <>{children}</>;

  if (!focused) {
    return <div className={`fm-page-background min-h-screen text-[var(--fm-text)] ${styles.pageChrome}`}>{header}{children}{footer}</div>;
  }

  return (
    <div className={`${styles.siteFrame} ${styles.pageChrome}`}>
      {header}
      <div className={styles.assessmentExit}>
        <Link prefetch={questionnaireTake || friendshipInvite ? false : undefined} href={friendshipInvite ? withLocale("/tests/play/friendship-quiz") : questionnaireTake ? (taiwan ? withLocale(questionnaireTake.landing.slice("/zh".length)) : questionnaireTake.landing) : withLocale(`/tests/${focusedSlug}`)} className={styles.exitLink}>
          {taiwan ? "返回測驗介紹" : locale === "zh" ? "返回测评介绍" : "Back to assessment"}<span aria-hidden>↗</span>
        </Link>
      </div>
      {children}
      <footer className={styles.siteFooter}>
        <span>FermatMind</span>
        <nav aria-label={taiwan ? "測驗相關資訊" : locale === "zh" ? "测评相关信息" : "Assessment information"}>
          <Link href={withLocale("/science")} target="_blank" rel="noopener noreferrer">{taiwan ? "測評科學" : locale === "zh" ? "测评科学" : "Assessment science"}</Link>
          <Link href={withLocale("/privacy")} target="_blank" rel="noopener noreferrer">{taiwan ? "隱私保護" : locale === "zh" ? "隐私保护" : "Privacy"}</Link>
        </nav>
      </footer>
    </div>
  );
}
