import { Lock } from "lucide-react";
import type { EqV5ViewModel } from "./types";
import { SectionHeading } from "./EQEvidenceSnapshot";

export function EQSJTBridgeCTA({ viewModel }: { viewModel: EqV5ViewModel }) {
  const bridge = viewModel.assets.sjt_bridge;
  const available = viewModel.nextModule.available === true && bridge.available === true;

  return (
    <section data-testid="eq-sjt-bridge" className="space-y-4">
      <SectionHeading title={bridge.title || (viewModel.locale === "zh" ? "情境判断模块" : "Scenario Module")} />
      <div className="rounded-[8px] border border-slate-200 bg-white p-4">
        {bridge.description ? <p className="text-sm leading-6 text-slate-700">{bridge.description}</p> : null}
        {bridge.complements ? <p className="mt-3 text-sm leading-6 text-slate-700">{bridge.complements}</p> : null}
        {bridge.not_this ? <p className="mt-3 text-sm leading-6 text-slate-600">{bridge.not_this}</p> : null}
        {Array.isArray(bridge.completed_report_adds) && bridge.completed_report_adds.length > 0 ? (
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-700">
            {bridge.completed_report_adds.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
        {!available ? (
          <div className="mt-4 inline-flex items-center gap-2 rounded-[8px] border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600">
            <Lock className="h-4 w-4" aria-hidden="true" />
            {viewModel.locale === "zh" ? "计划中，暂未开放" : "Planned, not available yet"}
          </div>
        ) : null}
      </div>
    </section>
  );
}
