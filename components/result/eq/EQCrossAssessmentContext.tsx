import type { EqV5ViewModel } from "./types";
import { SectionHeading } from "./EQEvidenceSnapshot";
import { Stacked } from "./EQMechanismCard";

export function EQCrossAssessmentContext({ viewModel }: { viewModel: EqV5ViewModel }) {
  const contexts = viewModel.assets.cross_assessment_context;

  if (contexts.length === 0) {
    return null;
  }

  return (
    <section data-testid="eq-cross-assessment-context" className="space-y-4">
      <SectionHeading title={viewModel.locale === "zh" ? "跨测评上下文" : "Cross-Assessment Context"} />
      <div className="grid gap-3 md:grid-cols-2">
        {contexts.slice(0, 4).map((context) => (
          <article key={context.id ?? context.title} className="rounded-[8px] border border-slate-200 bg-white p-4">
            <h3 className="text-base font-semibold text-slate-950">{context.title || context.id}</h3>
            <Stacked label={viewModel.locale === "zh" ? "怎么使用" : "How to use"} value={context.how_to_use || context.summary} />
            <Stacked label={viewModel.locale === "zh" ? "边界" : "Boundary"} value={context.claim_boundary} />
          </article>
        ))}
      </div>
    </section>
  );
}
