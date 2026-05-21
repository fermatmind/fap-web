import { Info } from "lucide-react";
import type { EqV5ViewModel } from "./types";

export function EQQualityBanner({ viewModel }: { viewModel: EqV5ViewModel }) {
  const { quality, assets, locale } = viewModel;
  const flags = quality.flags ?? [];

  return (
    <section
      data-testid="eq-quality-banner"
      className="flex gap-3 rounded-[8px] border border-sky-200 bg-sky-50 p-4 text-sm text-sky-950"
    >
      <Info className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="space-y-2">
        <h2 className="font-semibold">{locale === "zh" ? "结果解释置信度" : "Interpretation Confidence"}</h2>
        <p>
          {locale === "zh" ? "等级" : "Level"} {quality.level || "—"} ·{" "}
          {quality.confidence_label || assets.quality.confidence_label || "—"}
        </p>
        {assets.scientific_contract.quality_rules_statement ? (
          <p className="leading-6">{assets.scientific_contract.quality_rules_statement}</p>
        ) : null}
        {flags.length > 0 ? (
          <ul className="list-inside list-disc">
            {flags.map((flag) => (
              <li key={flag}>{flag}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
