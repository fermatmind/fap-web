"use client";

import { useRef, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MbtiDesktopCloneShell } from "./clone/MbtiDesktopCloneShell";
import { ResultEvidenceAndPrompts } from "./MbtiResultConversation";
import { TraditionalQuestionnaireCopy } from "@/components/questionnaires/TraditionalQuestionnaireCopy";
import { getMbtiResultContent } from "@/lib/mbti/result-content";
import { canDownloadReportPdf, type AttemptReportAccessView } from "@/lib/access/unifiedAccess";
import type { AttemptInviteUnlockProgressView } from "@/lib/access/inviteUnlock";
import { createAttemptShare, getAttemptResultPagePdfUrl, type ReportResponse, type ReportRecommendedRead } from "@/lib/api/v0_3";
import { coreShareUrlForDisplay } from "@/lib/i18n/coreShareDisplay";
import { historyDisplayHref } from "@/lib/i18n/historyDisplayRoutes";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import type { PersonalityDesktopCloneContentPayload } from "@/lib/cms/personality-desktop-clone";
import type { MbtiSnapshotContentStatus } from "@/lib/result/mbtiSnapshotContent";
import type { MbtiPreviewViewModel } from "@/lib/mbti/preview";
import type { MbtiResultProjectionViewModel } from "@/lib/mbti/publicProjection";
import type { RichResultHeadline, HighlightCard, ReportSection, MbtiSectionUnlock, ResolvedOffer } from "@/components/result/RichResultReport";
import { trackObservableFunnelEvent, trackEvent } from "@/lib/analytics";
import styles from "./MbtiResultConversation.module.css";

type MbtiResultShellProps = {
  locale: Locale;
  displayLocale?: DisplayLocale;
  scaleCode: "MBTI";
  reportData: ReportResponse;
  accessProjection?: AttemptReportAccessView | null;
  inviteUnlockProgress?: AttemptInviteUnlockProgressView | null;
  headline: RichResultHeadline;
  tags: string[];
  dimensions: Array<Record<string, unknown>>;
  projectionViewModel?: MbtiResultProjectionViewModel | null;
  highlights?: HighlightCard[];
  recommendedReads?: ReportRecommendedRead[];
  previewView?: MbtiPreviewViewModel | null;
  sections: ReportSection[];
  sectionUnlocks: Record<string, MbtiSectionUnlock>;
  offers: ResolvedOffer[];
  printSnapshotMode?: boolean;
  sampleMode?: boolean;
  initialDesktopCloneContent?: PersonalityDesktopCloneContentPayload | null;
  snapshotContentStatus?: MbtiSnapshotContentStatus | null;
  onDownloadPdf?: () => Promise<void>;
  onInternalNavigate?: (path: string) => void;
  onExternalNavigate?: (url: string) => void;
};

function resolveShareCtaLabel(
  locale: Locale,
  displayLocale: DisplayLocale,
  shareStatus: "idle" | "copied" | "failed",
  isSharing: boolean
) {
  if (displayLocale === "zh-TW") {
    if (isSharing) return "正在產生分享連結…";
    if (shareStatus === "copied") return "已複製分享連結";
    if (shareStatus === "failed") return "重試分享";
    return "分享結果";
  }
  if (isSharing) {
    return locale === "zh" ? "正在生成分享链接..." : "Preparing share link...";
  }

  if (shareStatus === "copied") {
    return locale === "zh" ? "已复制分享链接" : "Share link copied";
  }

  if (shareStatus === "failed") {
    return locale === "zh" ? "重试分享" : "Retry share";
  }

  return locale === "zh" ? "分享结果" : "Share result";
}


export function MbtiResultShell({ locale, displayLocale = locale, reportData, accessProjection, headline, dimensions,
  projectionViewModel, printSnapshotMode = false, sampleMode = false, snapshotContentStatus, onDownloadPdf }: MbtiResultShellProps) {
  const pathname = usePathname();
  const fullCode = (projectionViewModel?.displayType || headline.typeCode || "").toUpperCase();
  const editorial = getMbtiResultContent(fullCode, displayLocale);
  const attemptId = /^\/(?:en|zh|zh-TW)\/result\/([^/]+)/.exec(pathname ?? "")?.[1] || accessProjection?.attemptId || (typeof reportData.attempt_id === "string" ? reportData.attempt_id : undefined);
  const historyHref = historyDisplayHref(accessProjection?.actions.historyHref || `/${displayLocale}/history/mbti`, displayLocale);
  const canDownloadPdf = canDownloadReportPdf(accessProjection ?? null);
  const pdfHref = attemptId && canDownloadPdf ? getAttemptResultPagePdfUrl({ attemptId }) : undefined;
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "failed">("idle");
  const [isSharing, setIsSharing] = useState(false);
  const shareBusy = useRef(false);
  const viewed = useRef("");
  useEffect(() => {
    const key = `${attemptId}:${fullCode}:${displayLocale}`;
    if (!attemptId || !/^[EI][SN][TF][JP](?:-[AT])?$/.test(fullCode) || printSnapshotMode || sampleMode || viewed.current === key) return;
    viewed.current = key;
    trackObservableFunnelEvent("view_result", { scale_code: "MBTI", attempt_id: attemptId, type_code: fullCode, typeCode: fullCode, locale: displayLocale });
  }, [attemptId, displayLocale, fullCode, printSnapshotMode, sampleMode]);

  async function handleShare() {
    if (!attemptId || shareBusy.current || printSnapshotMode || sampleMode) return;
    shareBusy.current = true;
    setIsSharing(true);
    try {
      const response = await createAttemptShare({ attemptId, locale });
      const value = response.share_url || response.shareUrl || response.url;
      const source = coreShareUrlForDisplay(typeof value === "string" ? value : "");
      if (typeof source !== "string" || !source) throw new Error("Share URL unavailable");
      const url = new URL(source, window.location.origin);
      if (!["http:", "https:"].includes(url.protocol)) throw new Error("Invalid share URL");
      const title = displayLocale === "zh-TW" ? "分享我的測評結果" : locale === "zh" ? "分享我的测试结果" : "Share my result";
      if (typeof navigator.share === "function") {
        await navigator.share({ title, text: title, url: url.toString() });
        setShareStatus("idle");
      } else {
        await navigator.clipboard.writeText(url.toString());
        setShareStatus("copied");
      }
      trackEvent("share_result", { scale_code: "MBTI", attempt_id: attemptId, type_code: fullCode });
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) setShareStatus("failed");
    } finally { shareBusy.current = false; setIsSharing(false); }
  }

  if (!editorial) return <div data-testid="mbti-result-shell" data-result-content-state="unavailable"><p role="alert">{displayLocale === "zh-TW" ? "結果類型暫時無法辨識，請重新整理後再試。" : locale === "zh" ? "结果类型暂时无法识别，请刷新后重试。" : "The result type is unavailable. Please refresh and try again."}</p></div>;
  const content = editorial.data.content;
  const contentStatus = snapshotContentStatus?.ok ? { ...snapshotContentStatus, source: "result-adapter" as const } : snapshotContentStatus;
  const result = <div data-testid="mbti-result-shell" data-result-content-version="editorial-v1" className={styles.report}>
    <MbtiDesktopCloneShell
      locale={locale} headline={{ ...headline, badge: "MBTI", typeCode: fullCode, displayName: content.hero.profileIdentity?.name || "" }}
      tags={content.hero.profileIdentity?.keywords || []} dimensions={dimensions} highlights={[]} sections={[]} sectionUnlocks={{}} offers={[]}
      isUnlocked suppressUnlockSurfaces referenceRail
      shareCtaLabel={resolveShareCtaLabel(locale, displayLocale, shareStatus, isSharing)} shareDisabled={isSharing || sampleMode || printSnapshotMode} onShare={handleShare}
      retakeHref={`/${displayLocale}/tests/mbti-personality-test-16-personality-types/take`}
      historyHref={historyHref} orderLookupHref={`/${displayLocale}/orders/lookup`}
      pdfHref={pdfHref} pdfReady={canDownloadPdf} onDownloadPdf={canDownloadPdf ? onDownloadPdf : undefined}
      primaryCtaLabel={locale === "zh" ? "我的 MBTI 报告" : "My MBTI reports"} primaryCtaHref={historyHref}
      storageContentOverride={content} storageAssetSlotsOverride={editorial.data.assetSlots} storageManagedExternally canLoadDesktopCloneStorage requirePublishedContent
      applicationContent={editorial.applications} faqReplacementNode={false}
      fullWidthFooterNode={<ResultEvidenceAndPrompts fullCode={fullCode} language={displayLocale} historyHref={historyHref} pdfAvailable={canDownloadPdf} onDownloadPdf={canDownloadPdf ? onDownloadPdf : undefined} />}
      snapshotMode={printSnapshotMode} sampleMode={sampleMode} snapshotContentStatus={contentStatus}
    />
  </div>;
  return displayLocale === "zh-TW" ? <TraditionalQuestionnaireCopy loadingText="正在準備繁體中文結果…" failureText="繁體中文結果暫時無法載入，請重新整理。">{result}</TraditionalQuestionnaireCopy> : result;
}
