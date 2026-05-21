import type { EqV5ViewModel } from "./types";
import { SectionHeading } from "./EQEvidenceSnapshot";
import { Stacked } from "./EQMechanismCard";

export function EQCareerEnvironmentLens({ viewModel }: { viewModel: EqV5ViewModel }) {
  return (
    <section data-testid="eq-career-environment" className="space-y-4">
      <SectionHeading title={viewModel.locale === "zh" ? "职业环境变量" : "Career Environment Lens"} />
      <div className="grid gap-3 md:grid-cols-3">
        {viewModel.assets.career_environment.map((item) => (
          <article key={item.id ?? item.label} className="rounded-[8px] border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">{item.level || item.variable}</p>
            <h3 className="mt-2 text-base font-semibold text-slate-950">{item.label || item.id}</h3>
            <Stacked label={viewModel.locale === "zh" ? "含义" : "Meaning"} value={item.meaning} />
            <Stacked label={viewModel.locale === "zh" ? "更容易发挥" : "Fit signal"} value={item.fit_signal} />
            <Stacked label={viewModel.locale === "zh" ? "更容易消耗" : "Strain signal"} value={item.strain_signal} />
            <Stacked label={viewModel.locale === "zh" ? "需要验证" : "What to verify"} value={item.what_to_verify} />
          </article>
        ))}
      </div>
    </section>
  );
}
