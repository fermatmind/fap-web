import type { EqV5ViewModel } from "./types";
import { SectionHeading } from "./EQEvidenceSnapshot";

export function EQMechanismCard({ viewModel }: { viewModel: EqV5ViewModel }) {
  const mechanisms = viewModel.assets.mechanisms.slice(0, 2);

  return (
    <section data-testid="eq-mechanism-section" className="space-y-4">
      <SectionHeading title={viewModel.locale === "zh" ? "模式机制" : "Pattern Mechanism"} />
      {mechanisms.length > 0 ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {mechanisms.map((item) => (
            <article key={item.id ?? item.title} data-testid="eq-mechanism-card" className="rounded-[8px] border border-slate-200 bg-white p-4">
              <h3 className="text-lg font-semibold text-slate-950">{item.title || item.id}</h3>
              <Stacked label={viewModel.locale === "zh" ? "为什么重要" : "Why it matters"} value={item.why_it_matters} />
              <Stacked label={viewModel.locale === "zh" ? "现实感受" : "What it feels like"} value={item.what_it_feels_like} />
              <Stacked label={viewModel.locale === "zh" ? "优势" : "Strength"} value={item.strength} />
              <Stacked label={viewModel.locale === "zh" ? "代价" : "Cost"} value={item.cost} />
              <Stacked label={viewModel.locale === "zh" ? "微行动" : "Micro action"} value={item.micro_action} />
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-[8px] border border-slate-200 bg-white p-4 text-sm text-slate-500">
          {viewModel.locale === "zh" ? "本次没有足够信号展示组合机制。" : "There is not enough signal to show a mechanism for this result."}
        </p>
      )}
    </section>
  );
}

export function Stacked({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="mt-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-sm leading-6 text-slate-700">{value}</p>
    </div>
  );
}
