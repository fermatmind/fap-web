import { AlertTriangle } from "lucide-react";
import type { EqV5ViewModel } from "./types";
import { formatEqScore, isLowConfidenceEqResult } from "./utils";

export function EQResultHero({ viewModel }: { viewModel: EqV5ViewModel }) {
  const { assets, globalScore, quality, interpretation, locale, lockedAnomaly } = viewModel;
  const formulation = assets.core_formulation;
  const snapshot = assets.result_snapshot;
  const route = assets.personalization_route;
  const lowConfidence = isLowConfidenceEqResult(viewModel);

  return (
    <section
      data-testid="eq-result-hero"
      className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            {locale === "zh" ? "情绪与关系模式报告" : "Emotional & Relational Pattern Report"}
          </p>
          <h1 className="text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
            {route.route_headline ||
              snapshot.headline ||
              formulation.title ||
              (locale === "zh" ? "结果解释暂不可用" : "Result interpretation unavailable")}
          </h1>
          {route.why_this_feels_specific || snapshot.core_judgment || formulation.one_liner ? (
            <p className="text-base leading-7 text-slate-700">
              {route.why_this_feels_specific || snapshot.core_judgment || formulation.one_liner}
            </p>
          ) : null}
          {route.evidence_snapshot_label || snapshot.evidence_point || formulation.core_claim ? (
            <p className="text-sm leading-6 text-slate-600">
              {route.evidence_snapshot_label || snapshot.evidence_point || formulation.core_claim}
            </p>
          ) : null}
        </div>

        <div className="grid min-w-[220px] grid-cols-2 gap-3 rounded-[8px] border border-slate-200 bg-slate-50 p-4 text-sm">
          <div>
            <p className="text-xs text-slate-500">{globalScore?.label || assets.score_system.global_index?.label}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">
              {formatEqScore(globalScore?.standard_score)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{locale === "zh" ? "解释置信度" : "Confidence"}</p>
            <p className="mt-1 text-2xl font-semibold uppercase text-slate-950">
              {quality.confidence_label || quality.level}
            </p>
          </div>
        </div>
      </div>

      {lockedAnomaly ? (
        <div
          className="mt-5 flex gap-3 rounded-[8px] border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
          role="status"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            {locale === "zh"
              ? "当前 EQ 报告按免费结果处理。若访问状态异常，请稍后刷新。"
              : "This EQ report is handled as a free result. Refresh later if access state looks inconsistent."}
          </span>
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <HeroSignal
          label={locale === "zh" ? "主要优势" : "Primary strength"}
          value={lowConfidence ? snapshot.core_judgment || formulation.one_liner : snapshot.top_strength || formulation.primary_strength}
        />
        <HeroSignal
          label={locale === "zh" ? "最小行动" : "Smallest next action"}
          value={route.next_best_action || snapshot.minimal_action || formulation.development_lever || interpretation.development_lever}
        />
        <HeroSignal
          label={locale === "zh" ? "分享句" : "Share-safe line"}
          value={route.save_reason || snapshot.share_safe_sentence || snapshot.do_not_overread || formulation.do_not_overread}
        />
      </div>
      {snapshot.continue_path ? (
        <p className="mt-4 rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
          {snapshot.continue_path}
        </p>
      ) : null}
    </section>
  );
}

function HeroSignal({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-[8px] border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-800">{value || "—"}</p>
    </div>
  );
}
