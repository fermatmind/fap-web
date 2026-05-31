import { Lock } from "lucide-react";
import Link from "next/link";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import { localizedPath } from "@/lib/i18n/locales";
import type { EqV5ViewModel } from "./types";
import { SectionHeading } from "./EQEvidenceSnapshot";

export function EQSJTBridgeCTA({ viewModel }: { viewModel: EqV5ViewModel }) {
  const bridge = viewModel.assets.sjt_bridge;
  const nextModuleStatus = String(viewModel.nextModule.status ?? "").trim().toLowerCase();
  const available =
    viewModel.nextModule.available === true &&
    bridge.available === true &&
    viewModel.nextModule.module_code === "EQ_SJT_16" &&
    nextModuleStatus !== "planned";
  const complements = bridge.complements || bridge.what_it_adds;
  const notThis = bridge.not_this || bridge.what_it_is_not;
  const takeHref = localizedPath(`/tests/${SCALE_CANONICAL_SLUG_MAP.EQ_SJT_16}/take`, viewModel.locale);
  const buttonLabel =
    bridge.button_label || (viewModel.locale === "zh" ? "继续情境判断模块" : "Continue scenario module");

  return (
    <section data-testid="eq-sjt-bridge" className="space-y-4">
      <SectionHeading title={bridge.title || (viewModel.locale === "zh" ? "情境判断模块" : "Scenario Module")} />
      <div className="rounded-[8px] border border-slate-200 bg-white p-4">
        {bridge.description ? <p className="text-sm leading-6 text-slate-700">{bridge.description}</p> : null}
        {complements ? <p className="mt-3 text-sm leading-6 text-slate-700">{complements}</p> : null}
        {notThis ? <p className="mt-3 text-sm leading-6 text-slate-600">{notThis}</p> : null}
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
        ) : (
          <Link
            data-testid="eq-sjt-bridge-link"
            href={takeHref}
            className="mt-4 inline-flex rounded-[8px] bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            {buttonLabel}
          </Link>
        )}
      </div>
    </section>
  );
}
