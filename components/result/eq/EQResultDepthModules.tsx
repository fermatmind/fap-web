import type { EqV5ViewModel } from "./types";
import { SectionHeading } from "./EQEvidenceSnapshot";

export function EQResultDepthModules({ viewModel }: { viewModel: EqV5ViewModel }) {
  const modules = viewModel.assets.result_page_depth_modules;

  if (modules.length === 0) {
    return null;
  }

  return (
    <section data-testid="eq-result-depth-modules" className="space-y-4">
      <SectionHeading title={viewModel.locale === "zh" ? "深读路径" : "Result Depth"} />
      <div className="grid gap-3 md:grid-cols-3">
        {modules.map((module) => (
          <article key={module.id ?? module.title} className="rounded-[8px] border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
              {module.placement || module.claim_risk || (viewModel.locale === "zh" ? "报告层" : "Report layer")}
            </p>
            <h3 className="mt-2 text-base font-semibold text-slate-950">{module.title || module.id}</h3>
            {module.body ? <p className="mt-2 text-sm leading-6 text-slate-700">{module.body}</p> : null}
            {Array.isArray(module.bullets) && module.bullets.length > 0 ? (
              <ul className="mt-3 list-inside list-disc space-y-1 text-sm leading-6 text-slate-700">
                {module.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
