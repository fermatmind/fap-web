import type { EqV5ViewModel } from "./types";
import { SectionHeading } from "./EQEvidenceSnapshot";
import { Stacked } from "./EQMechanismCard";

export function EQRealitySceneCards({ viewModel }: { viewModel: EqV5ViewModel }) {
  const scenes = viewModel.assets.reality_scenes.slice(0, 3);

  return (
    <section data-testid="eq-reality-scenes" className="space-y-4">
      <SectionHeading title={viewModel.locale === "zh" ? "现实场景转译" : "Reality Translation"} />
      <div className="grid gap-3 md:grid-cols-3">
        {scenes.map((scene) => (
          <article key={scene.id ?? scene.title} className="rounded-[8px] border border-slate-200 bg-white p-4">
            <h3 className="text-base font-semibold text-slate-950">{scene.title || scene.id}</h3>
            <Stacked label={viewModel.locale === "zh" ? "典型反应" : "Typical response"} value={scene.typical_response} />
            <Stacked label={viewModel.locale === "zh" ? "优势" : "Strength"} value={scene.strength} />
            <Stacked label={viewModel.locale === "zh" ? "代价" : "Cost"} value={scene.cost} />
            <Stacked label={viewModel.locale === "zh" ? "替代策略" : "Better move"} value={scene.better_move} />
          </article>
        ))}
      </div>
    </section>
  );
}
