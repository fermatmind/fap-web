"use client";
import type { ReactNode } from "react";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";

import { personalityCareerHref } from "@/lib/mbti/personalityCareerHref";
import { MbtiDesktopCloneShell } from "@/components/result/mbti/clone/MbtiDesktopCloneShell";
import type { MbtiApplicationContent } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import type { PersonalityDesktopCloneContentPayload } from "@/lib/cms/personality-desktop-clone";

export function FullReportPreview({ data, isUnlocked, reportId, dimensions, suppressUnlockSurfaces = false, applicationContent, faqReplacementNode, fullWidthFooterNode, referenceRail, locale = "zh", displayLocale = locale }: { locale?: Locale; displayLocale?: DisplayLocale; data: PersonalityDesktopCloneContentPayload; applicationContent?: MbtiApplicationContent; faqReplacementNode?: ReactNode; fullWidthFooterNode?: ReactNode; referenceRail?: boolean; isUnlocked: boolean; suppressUnlockSurfaces?: boolean; reportId?: string; dimensions: Array<Record<string, unknown>> }) {
  const identity = data.content.hero.profileIdentity;
  const careerHref = `https://fermatmind.com${personalityCareerHref(displayLocale, data.fullCode)}`;
  const workspaceHref = `https://fermatmind.com/${displayLocale}/history/mbti?carryover_focus_key=career.next_step`;
  const careerEntry = <section data-testid="mbti-career-next-step" className="rounded-[28px] border border-emerald-300 bg-gradient-to-br from-sky-50 via-white to-emerald-50/60 p-5 md:p-6">
    <h2 className="m-0"><a href={careerHref} className="flex min-h-24 w-full items-center justify-center rounded-2xl bg-emerald-700 px-4 py-2 text-center text-2xl font-semibold tracking-tight text-white no-underline shadow-md hover:bg-emerald-800">
      {locale === "en" ? `Explore work and careers with ${data.baseCode}` : `查看 ${data.baseCode} 的工作与职业探索`}
    </a></h2>
  </section>;
  return <MbtiDesktopCloneShell locale={locale} applicationContent={applicationContent} faqReplacementNode={faqReplacementNode} fullWidthFooterNode={fullWidthFooterNode} referenceRail={referenceRail}
    headline={{ badge: "MBTI", typeCode: data.fullCode, displayName: identity?.name ?? "", supportingLine: "", summary: "", rarity: "" }}
    tags={identity?.keywords ?? []} dimensions={dimensions} highlights={[]} sections={[]} sectionUnlocks={{}} offers={[]}
    isUnlocked={isUnlocked} suppressUnlockSurfaces={suppressUnlockSurfaces} shareCtaLabel={locale === "en" ? "Share results" : "分享结果"} shareDisabled onShare={() => {}}
    retakeHref={`https://fermatmind.com/${displayLocale}/tests/mbti-personality-test-16-personality-types/take`}
    historyHref={`https://fermatmind.com/${displayLocale}/history/mbti`} workspaceHref={workspaceHref}
    orderLookupHref={`https://fermatmind.com/${displayLocale}/orders/lookup`}
    pdfHref={reportId ? `https://api.fermatmind.com/api/v0.3/attempts/${reportId}/result-page.pdf` : undefined} pdfReady={Boolean(reportId)}
    primaryCtaLabel={locale === "en" ? "My MBTI reports" : "我的 MBTI 报告"} primaryCtaHref={workspaceHref}
    unlockedOfferNode={isUnlocked ? careerEntry : undefined}
    storageContentOverride={data.content} storageAssetSlotsOverride={data.assetSlots} storageManagedExternally
    canLoadDesktopCloneStorage requirePublishedContent />;
}
