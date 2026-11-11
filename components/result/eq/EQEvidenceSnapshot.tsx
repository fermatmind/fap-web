import { useEqDisplay } from "./display";
import type { EqV5ViewModel } from "./types";
import { formatEqScore } from "./utils";
import { localizeEqTechnicalValue } from "./localization";

export function EQEvidenceSnapshot({ viewModel }: { viewModel: EqV5ViewModel }) {
  const { copy, text: displayText } = useEqDisplay();
  const { globalScore, methodology, assets, locale } = viewModel;
  return (
    <section data-testid="eq-evidence-snapshot" className="space-y-4">
      <SectionHeading
        title={locale === "zh" ? copy("证据快照", "證據快照") : "Evidence Snapshot"}
        subtitle={assets.score_system.global_index?.meaning}
      />
      <div className="grid gap-3 md:grid-cols-3">
        <SnapshotMetric
          label={globalScore?.label || assets.score_system.global_index?.label || (locale === "zh" ? copy("综合指数", "綜合指數") : "Global index")}
          value={`${formatEqScore(globalScore?.standard_score)} ${locale === "zh" ? copy("标准分", "標準分") : "standard score"}`}
          meta={`${locale === "zh" ? copy("原始总分", "原始總分") : "Raw sum"} ${formatEqScore(globalScore?.raw_score)} · ${locale === "zh" ? copy("参照百分位", "參照百分位") : "Reference percentile"} ${formatEqScore(globalScore?.percentile)}`}
        />
        <SnapshotMetric
          label={locale === "zh" ? copy("参照状态", "參照狀態") : "Reference status"}
          value={displayText(localizeEqTechnicalValue(methodology.norm_status, locale)) || "—"}
          meta={methodology.norm_provenance?.norm_version === "bootstrap_v1"
            ? (locale === "zh" ? copy("Bootstrap 模型参照 · bootstrap_v1", "Bootstrap 模型參照 · bootstrap_v1") : "Bootstrap model reference · bootstrap_v1")
            : methodology.norm_provenance?.norm_version || (locale === "zh" ? copy("参照版本未提供", "參照版本未提供") : "Reference version unavailable")}
        />
        <SnapshotMetric
          label={locale === "zh" ? copy("阅读路径", "閱讀路徑") : "Reading path"}
          value={(assets.personalization_route.route_headline || assets.core_formulation.title)!}
          meta={assets.personalization_route.evidence_snapshot_label}
        />
      </div>
    </section>
  );
}

function SnapshotMetric({ label, value, meta }: { label: string; value: string; meta?: string }) {
  return (
    <div className="rounded-[8px] border border-slate-200 bg-white p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-950">{value}</p>
      {meta ? <p className="mt-1 text-xs text-slate-500">{meta}</p> : null}
    </div>
  );
}

export function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="space-y-1">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      {subtitle ? <p className="text-sm leading-6 text-slate-600">{subtitle}</p> : null}
    </div>
  );
}
