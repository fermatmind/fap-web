import type { EqV5ViewModel } from "./types";
import { SectionHeading } from "./EQEvidenceSnapshot";
import { Stacked } from "./EQMechanismCard";

export function EQActionPrescription({ viewModel }: { viewModel: EqV5ViewModel }) {
  const action = viewModel.assets.action_prescription;

  return (
    <section data-testid="eq-action-prescription" className="space-y-4">
      <SectionHeading title={viewModel.locale === "zh" ? "行动处方" : "Action Prescription"} />
      <article className="rounded-[8px] border border-slate-200 bg-white p-4">
        <h3 className="text-lg font-semibold text-slate-950">{action.title || action.id || "—"}</h3>
        <Stacked label={viewModel.locale === "zh" ? "为什么重要" : "Why this matters"} value={action.why_this_matters} />
        <Stacked label={viewModel.locale === "zh" ? "今天做什么" : "Do today"} value={action.do_today} />
        <Stacked label={viewModel.locale === "zh" ? "沟通脚本" : "Script"} value={action.script} />
        {Array.isArray(action.seven_day_plan) && action.seven_day_plan.length > 0 ? (
          <details className="mt-4 rounded-[8px] border border-slate-200 bg-slate-50 p-3">
            <summary className="cursor-pointer text-sm font-semibold text-slate-900">
              {viewModel.locale === "zh" ? "7 天练习" : "7-day practice"}
            </summary>
            <ol className="mt-3 list-inside list-decimal space-y-2 text-sm leading-6 text-slate-700">
              {action.seven_day_plan.map((step, index) => (
                <li key={`${index}-${formatPracticeStep(step)}`}>{formatPracticeStep(step)}</li>
              ))}
            </ol>
          </details>
        ) : null}
        <Stacked label={viewModel.locale === "zh" ? "注意事项" : "Watch out"} value={action.watch_out} />
      </article>
    </section>
  );
}

function formatPracticeStep(step: NonNullable<EqV5ViewModel["assets"]["action_prescription"]["seven_day_plan"]>[number]): string {
  if (typeof step === "string") {
    return step;
  }

  const day = step?.day ? `Day ${step.day}: ` : "";
  return `${day}${String(step?.practice ?? "").trim()}`.trim() || "—";
}
