import { useEqDisplay } from "./display";
import type { EqV5ViewModel } from "./types";
import { SectionHeading } from "./EQEvidenceSnapshot";
import { Stacked } from "./EQMechanismCard";

const INTERNAL_SCENE_FAMILIES = new Set([
  "career_environment", "conflict", "feedback", "pressure_recovery",
  "relationship_boundary", "team_collaboration",
]);

function userFacingEvidenceSignal(signal: string): boolean {
  const value = signal.trim();
  if (!value || INTERNAL_SCENE_FAMILIES.has(value)) return false;
  if (value.includes("_")) return false;
  if (/^eq\./i.test(value)) return false;
  if (/^[A-Z]{2}_[A-Z]{2}/.test(value)) return false;
  if (/^[A-Z]{2}$/.test(value)) return false;
  return true;
}

export function EQRealitySceneCards({ viewModel }: { viewModel: EqV5ViewModel }) {
  const { copy } = useEqDisplay();
  const scenes = viewModel.assets.reality_scenes.slice(0, 3);

  return (
    <section data-testid="eq-reality-scenes" className="space-y-4">
      <SectionHeading title={viewModel.locale === "zh" ? copy("现实场景转译", "現實場景轉譯") : "Reality Translation"} />
      <div className="grid gap-3 md:grid-cols-3">
        {scenes.map((scene) => (
          <article key={scene.id ?? scene.title} className="rounded-[8px] border border-slate-200 bg-white p-4">
            <h3 className="text-base font-semibold text-slate-950">{scene.title || scene.id}</h3>
            <Stacked label={viewModel.locale === "zh" ? copy("典型反应", "典型反應") : "Typical response"} value={scene.typical_response} />
            <Stacked label={viewModel.locale === "zh" ? copy("优势", "優勢") : "Strength"} value={scene.strength} />
            <Stacked label={viewModel.locale === "zh" ? copy("代价", "代價") : "Cost"} value={scene.cost} />
            <Stacked label={viewModel.locale === "zh" ? "替代策略" : "Better move"} value={scene.better_move} />
            <Stacked label={viewModel.locale === "zh" ? copy("微脚本", "微指令碼") : "Micro script"} value={scene.micro_script} />
            {(() => {
              const visibleSignals = Array.isArray(scene.evidence_signals)
                ? scene.evidence_signals.filter(userFacingEvidenceSignal)
                : [];

              return visibleSignals.length > 0 ? (
                <div className="mt-3">
                  <p className="text-xs font-medium text-slate-500">
                    {viewModel.locale === "zh" ? copy("验证信号", "驗證訊號") : "Evidence signals"}
                  </p>
                  <ul className="mt-1 list-inside list-disc space-y-1 text-sm leading-6 text-slate-700">
                    {visibleSignals.map((signal) => (
                      <li key={signal}>{signal}</li>
                    ))}
                  </ul>
                </div>
              ) : null;
            })()}
            <Stacked label={viewModel.locale === "zh" ? copy("反思问题", "反思問題") : "Reflection prompt"} value={scene.reflection_prompt} />
            <Stacked label={viewModel.locale === "zh" ? copy("小实验", "小實驗") : "Tiny experiment"} value={scene.tiny_experiment} />
          </article>
        ))}
      </div>
    </section>
  );
}
