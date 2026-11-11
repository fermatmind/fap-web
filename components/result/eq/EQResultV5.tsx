"use client";

import { useEffect, useState } from "react";
import { EqDisplayContext, useEqDisplay } from "./display";
import type { ReportResponse } from "@/lib/api/v0_3";
import { loadTraditionalAssessmentText } from "@/lib/tests/traditionalAssessmentDisplay";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import { isEqPrivateResultLocaleCompatible } from "@/lib/eq/privateResultLocale";
import { ResultExportPanel } from "@/components/result-export/ResultExportPanel";
import { buildEqResultExport } from "@/lib/eq/export";
import { EQEventPractice } from "./EQEventPractice";
import { EQActionPrescription } from "./EQActionPrescription";
import { EQCareerEnvironmentLens } from "./EQCareerEnvironmentLens";
import { EQCrossAssessmentContext } from "./EQCrossAssessmentContext";
import { EQEmotionalMatrix } from "./EQEmotionalMatrix";
import { EQEvidenceSnapshot } from "./EQEvidenceSnapshot";
import { EQMechanismCard } from "./EQMechanismCard";
import { EQQualityBanner } from "./EQQualityBanner";
import { EQRealitySceneCards } from "./EQRealitySceneCards";
import { EQResultDepthModules } from "./EQResultDepthModules";
import { EQResultHero } from "./EQResultHero";
import { EQSaveShareRelated } from "./EQSaveShareRelated";
import { EQScientificBoundary } from "./EQScientificBoundary";
import type { EqAgentContextAccess, EqAgentContextLoader, EqAgentRuntimeMessageLoader } from "./types";
import { isEqV5AccessRestricted, isLowConfidenceEqResult, normalizeEqV5Report } from "./utils";

type EqResultProps = {
  locale: Locale;
  displayLocale?: DisplayLocale;
  reportData: ReportResponse;
  attemptId?: string;
  agentContextAccess?: EqAgentContextAccess;
  loadAgentContext?: EqAgentContextLoader;
  sendAgentRuntimeMessage?: EqAgentRuntimeMessageLoader;
  exportPdfState?: "ready" | "pending" | "unavailable";
  onDownloadPdf?: () => Promise<void>;
};

export function EQResultV5(props: EqResultProps) {
  const displayLocale = props.displayLocale ?? props.locale;
  const [translate, setTranslate] = useState<((source: string) => string) | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    if (displayLocale !== "zh-TW") return;
    let active = true;
    void loadTraditionalAssessmentText().then(
      (convert) => { if (active) setTranslate(() => convert); },
      () => { if (active) setUnavailable(true); },
    );
    return () => { active = false; };
  }, [displayLocale]);

  if (displayLocale === "zh-TW" && unavailable) return <p role="status">繁體報告暫時無法載入，請稍後再試。</p>;
  if (displayLocale === "zh-TW" && !translate) return <p role="status">正在載入繁體報告…</p>;
  if (displayLocale !== "zh-TW" || !translate) return <EQResultContent {...props} />;
  return <EqDisplayContext.Provider value={{ locale: displayLocale, text: translate }}>
    <EQResultContent {...props} translate={translate} />
  </EqDisplayContext.Provider>;
}

function EQResultContent({
  locale,
  displayLocale = locale,
  reportData,
  attemptId,
  agentContextAccess,
  loadAgentContext,
  sendAgentRuntimeMessage,
  exportPdfState = "unavailable",
  translate,
}: EqResultProps & { translate?: (source: string) => string }) {
  if (isEqV5AccessRestricted(reportData)) {
    return <EQResultV5AccessRestricted locale={locale} />;
  }

  if (!isEqPrivateResultLocaleCompatible(reportData, locale)) {
    return <EQResultV5Unavailable locale={locale} />;
  }

  const viewModel = normalizeEqV5Report(reportData, locale, translate);

  if (!viewModel) {
    return <EQResultV5Unavailable locale={locale} />;
  }

  const lowConfidence = isLowConfidenceEqResult(viewModel);
  const exportProjection = buildEqResultExport(reportData, locale);
  // Current EQ /report.pdf contains report metadata only, even when the
  // generic access projection says ready. Do not offer it as the user's
  // result report. Keep preparing/unavailable text and TXT/MD alternatives.
  const resultPdfState = exportPdfState === "pending" ? "pending" : "unavailable";

  return (
    <main data-testid="eq-result-v5" data-reading-copy-revision={viewModel.displayCopy?.revision} data-reading-source-hash={viewModel.displayCopy?.sourceHash} className="mx-auto w-full min-w-0 max-w-6xl space-y-6 [overflow-wrap:anywhere]">
      <EQResultHero viewModel={viewModel} />
      {exportProjection ? <ResultExportPanel projection={exportProjection} locale={displayLocale} pdfState={resultPdfState} /> : null}
      {lowConfidence ? (
        <>
          <EQQualityBanner viewModel={viewModel} />
          {viewModel.interpretation.action_prescription_id === "retest_reflection" ? (
            <EQActionPrescription viewModel={viewModel} />
          ) : null}
        </>
      ) : (
        <>
          <EQEvidenceSnapshot viewModel={viewModel} />
          <EQResultDepthModules viewModel={viewModel} />
          <EQQualityBanner viewModel={viewModel} />
          <EQEmotionalMatrix viewModel={viewModel} />
          <EQMechanismCard viewModel={viewModel} />
          <EQRealitySceneCards viewModel={viewModel} />
          <EQCareerEnvironmentLens viewModel={viewModel} />
          <EQActionPrescription viewModel={viewModel} />
        </>
      )}
      {lowConfidence ? null : <EQEventPractice locale={locale} />}
      <EQScientificBoundary viewModel={viewModel} />
      {lowConfidence ? null : <EQCrossAssessmentContext viewModel={viewModel} />}
      <EQSaveShareRelated
        viewModel={viewModel}
        attemptId={attemptId}
        agentContextAccess={agentContextAccess}
        loadAgentContext={loadAgentContext}
        sendAgentRuntimeMessage={sendAgentRuntimeMessage}
      />
    </main>
  );
}

function EQResultV5Unavailable({ locale }: { locale: Locale }) {
  const { copy } = useEqDisplay();
  return (
    <main data-testid="eq-result-v5-unavailable" className="mx-auto w-full max-w-3xl">
      <section className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7" role="status">
        <h1 className="text-xl font-semibold text-slate-950">
          {locale === "zh" ? copy("报告暂不可用", "報告暫不可用") : "Report unavailable"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {locale === "zh" ? copy("报告数据未通过完整性校验，请稍后刷新。", "報告資料未通過完整性校驗，請稍後重新整理。") : "The report data did not pass integrity checks. Refresh later."}
        </p>
      </section>
    </main>
  );
}

function EQResultV5AccessRestricted({ locale }: { locale: Locale }) {
  const { copy } = useEqDisplay();
  return (
    <main data-testid="eq-result-v5-access-restricted" className="mx-auto w-full max-w-3xl">
      <section className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
          {locale === "zh" ? copy("结果访问", "查看結果") : "Result access"}
        </p>
        <h1 className="mt-3 text-2xl font-semibold leading-tight text-slate-950">
          {locale === "zh" ? copy("当前报告暂不可查看", "目前報告暫不可檢視") : "This report is not ready to view"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {locale === "zh"
            ? copy("我们没有在当前访问状态下展示完整 EQ 报告内容。请稍后刷新，或从订单/结果入口重新进入。", "目前無法查看完整 EQ 報告。請稍後重新整理，或從訂單或結果頁重新開啟。")
            : "The full EQ report content is not displayed for the current access state. Refresh later or return from your order or result entry point."}
        </p>
      </section>
    </main>
  );
}
