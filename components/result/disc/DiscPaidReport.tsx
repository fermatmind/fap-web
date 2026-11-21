"use client";

import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import { DiscResultDesignPreview } from "./DiscResultDesignPreview";
import { findDiscProfileByCounts } from "./discPreviewProfiles";

export function DiscPaidReport({ payload, displayLocale }: { payload: unknown; locale: Locale; displayLocale: DisplayLocale }) {
  const report = payload as { counts?: Record<string, number>; profile?: { id?: string } } | undefined;
  const profile = findDiscProfileByCounts(report?.counts);
  if (!profile || !report?.counts || profile.id !== report.profile?.id) return <p role="status">{displayLocale === "zh-TW" ? "暫時無法讀取報告，請稍後重試。" : displayLocale === "en" ? "The report is unavailable. Please try again later." : "暂时无法读取报告，请稍后重试。"}</p>;
  return <DiscResultDesignPreview profileId={profile.id} counts={report.counts} locale={displayLocale} mode="result" />;
}
