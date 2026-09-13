"use client";

import { MbtiDesktopCloneShell } from "@/components/result/mbti/clone/MbtiDesktopCloneShell";
import type { PersonalityDesktopCloneContentPayload } from "@/lib/cms/personality-desktop-clone";

export function FullReportPreview({ data, isUnlocked, reportId, dimensions }: { data: PersonalityDesktopCloneContentPayload; isUnlocked: boolean; reportId?: string; dimensions: Array<Record<string, unknown>> }) {
  const identity = data.content.hero.profileIdentity;
  const careerHref = `https://fermatmind.com/zh/career/recommendations/mbti/${data.fullCode.toLowerCase()}`;
  const workspaceHref = "https://fermatmind.com/zh/history/mbti?carryover_focus_key=career.next_step";
  const careerEntry = <section data-testid="mbti-career-next-step" className="rounded-[28px] border border-emerald-300 bg-gradient-to-br from-sky-50 via-white to-emerald-50/60 p-5 md:p-6">
    <h2 className="m-0"><a href={careerHref} className="flex min-h-24 w-full items-center justify-center rounded-2xl bg-emerald-700 px-4 py-2 text-center text-2xl font-semibold tracking-tight text-white no-underline shadow-md hover:bg-emerald-800">
      {`继续查看 ${data.fullCode} 的职业推荐`}
    </a></h2>
  </section>;
  return <MbtiDesktopCloneShell locale="zh"
    headline={{ badge: "MBTI", typeCode: data.fullCode, displayName: identity?.name ?? "", supportingLine: "", summary: "", rarity: "" }}
    tags={identity?.keywords ?? []} dimensions={dimensions} highlights={[]} sections={[]} sectionUnlocks={{}} offers={[]}
    isUnlocked={isUnlocked} shareCtaLabel="分享结果" shareDisabled onShare={() => {}}
    retakeHref="https://fermatmind.com/zh/tests/mbti-personality-test-16-personality-types/take"
    historyHref="https://fermatmind.com/zh/history/mbti" workspaceHref={workspaceHref}
    orderLookupHref="https://fermatmind.com/zh/orders/lookup"
    pdfHref={reportId ? `https://api.fermatmind.com/api/v0.3/attempts/${reportId}/result-page.pdf` : undefined} pdfReady={Boolean(reportId)}
    primaryCtaLabel="我的 MBTI 报告" primaryCtaHref={workspaceHref}
    unlockedOfferNode={isUnlocked ? careerEntry : undefined}
    storageContentOverride={data.content} storageAssetSlotsOverride={data.assetSlots} storageManagedExternally
    canLoadDesktopCloneStorage requirePublishedContent />;
}
