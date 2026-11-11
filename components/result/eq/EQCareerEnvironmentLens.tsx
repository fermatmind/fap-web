import { useEqDisplay } from "./display";
import type { EqV5ViewModel } from "./types";
import { SectionHeading } from "./EQEvidenceSnapshot";
import { Stacked } from "./EQMechanismCard";
import { localizeEqTechnicalValue } from "./localization";

export function EQCareerEnvironmentLens({ viewModel }: { viewModel: EqV5ViewModel }) {
  const { copy, text: displayText } = useEqDisplay();
  return (
    <section data-testid="eq-career-environment" className="space-y-4">
      <SectionHeading title={viewModel.locale === "zh" ? copy("职业环境变量", "職業環境變數") : "Career Environment Lens"} />
      <div className="grid gap-3 md:grid-cols-3">
        {viewModel.assets.career_environment.map((item) => (
          <article key={item.id ?? item.label} className="rounded-[8px] border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
              {displayText(localizeEqTechnicalValue(item.level || item.variable, viewModel.locale))}
            </p>
            <h3 className="mt-2 text-base font-semibold text-slate-950">{item.label || item.id}</h3>
            <Stacked label={viewModel.locale === "zh" ? copy("含义", "含義") : "Meaning"} value={item.meaning} />
            <Stacked label={viewModel.locale === "zh" ? copy("更容易发挥", "更容易發揮") : "Fit signal"} value={item.fit_signal} />
            <Stacked label={viewModel.locale === "zh" ? "更容易消耗" : "Strain signal"} value={item.strain_signal} />
            <Stacked label={viewModel.locale === "zh" ? copy("需要验证", "需要驗證") : "What to verify"} value={item.what_to_verify} />
            <Stacked label={viewModel.locale === "zh" ? copy("面试验证问题", "面試驗證問題") : "Interview check"} value={item.interview_question} />
            {Array.isArray(item.role_observation_checklist) && item.role_observation_checklist.length > 0 ? (
              <div className="mt-3">
                <p className="text-xs font-medium text-slate-500">
                  {viewModel.locale === "zh" ? copy("岗位观察清单", "崗位觀察清單") : "Role observation checklist"}
                </p>
                <ul className="mt-1 list-inside list-disc space-y-1 text-sm leading-6 text-slate-700">
                  {item.role_observation_checklist.map((entry) => (
                    <li key={entry}>{entry}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <Stacked label={viewModel.locale === "zh" ? copy("团队协作风险", "團隊協作風險") : "Team risk"} value={item.team_risk} />
          </article>
        ))}
      </div>
    </section>
  );
}
