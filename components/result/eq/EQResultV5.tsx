import type { ReportResponse } from "@/lib/api/v0_3";
import type { Locale } from "@/lib/i18n/locales";
import { EQActionPrescription } from "./EQActionPrescription";
import { EQCareerEnvironmentLens } from "./EQCareerEnvironmentLens";
import { EQEmotionalMatrix } from "./EQEmotionalMatrix";
import { EQEvidenceSnapshot } from "./EQEvidenceSnapshot";
import { EQMechanismCard } from "./EQMechanismCard";
import { EQQualityBanner } from "./EQQualityBanner";
import { EQRealitySceneCards } from "./EQRealitySceneCards";
import { EQResultHero } from "./EQResultHero";
import { EQSaveShareRelated } from "./EQSaveShareRelated";
import { EQScientificBoundary } from "./EQScientificBoundary";
import { EQSJTBridgeCTA } from "./EQSJTBridgeCTA";
import type { EqAgentContextAccess, EqAgentContextLoader, EqAgentRuntimeMessageLoader } from "./types";
import { isEqV5AccessRestricted, normalizeEqV5Report } from "./utils";

export function EQResultV5({
  locale,
  reportData,
  attemptId,
  agentContextAccess,
  loadAgentContext,
  sendAgentRuntimeMessage,
}: {
  locale: Locale;
  reportData: ReportResponse;
  attemptId?: string;
  agentContextAccess?: EqAgentContextAccess;
  loadAgentContext?: EqAgentContextLoader;
  sendAgentRuntimeMessage?: EqAgentRuntimeMessageLoader;
}) {
  if (isEqV5AccessRestricted(reportData)) {
    return <EQResultV5AccessRestricted locale={locale} />;
  }

  const viewModel = normalizeEqV5Report(reportData, locale);

  if (!viewModel) {
    return null;
  }

  return (
    <main data-testid="eq-result-v5" className="mx-auto w-full max-w-6xl space-y-6">
      <EQResultHero viewModel={viewModel} />
      <EQEvidenceSnapshot viewModel={viewModel} />
      <EQQualityBanner viewModel={viewModel} />
      <EQEmotionalMatrix viewModel={viewModel} />
      <EQMechanismCard viewModel={viewModel} />
      <EQRealitySceneCards viewModel={viewModel} />
      <EQCareerEnvironmentLens viewModel={viewModel} />
      <EQActionPrescription viewModel={viewModel} />
      <EQSJTBridgeCTA viewModel={viewModel} />
      <EQScientificBoundary viewModel={viewModel} />
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

function EQResultV5AccessRestricted({ locale }: { locale: Locale }) {
  return (
    <main data-testid="eq-result-v5-access-restricted" className="mx-auto w-full max-w-3xl">
      <section className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
          {locale === "zh" ? "结果访问" : "Result access"}
        </p>
        <h1 className="mt-3 text-2xl font-semibold leading-tight text-slate-950">
          {locale === "zh" ? "当前报告暂不可查看" : "This report is not ready to view"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {locale === "zh"
            ? "我们没有在当前访问状态下展示完整 EQ 报告内容。请稍后刷新，或从订单/结果入口重新进入。"
            : "The full EQ report content is not displayed for the current access state. Refresh later or return from your order or result entry point."}
        </p>
      </section>
    </main>
  );
}
