import type { EqDimensionRankingEntry, EqV5ViewModel } from "./types";
import { formatEqScore, getEqDimensionLabel } from "./utils";

export function EQEvidenceSnapshot({ viewModel }: { viewModel: EqV5ViewModel }) {
  const { globalScore, dimensions, interpretation, methodology, assets, locale } = viewModel;
  const strongest = rankingValue(
    interpretation.dimension_ranking?.strongest,
    interpretation.strongest_dimension,
    "strongest",
    viewModel
  );
  const development = rankingValue(
    interpretation.dimension_ranking?.development,
    interpretation.development_lever,
    "development",
    viewModel
  );

  return (
    <section data-testid="eq-evidence-snapshot" className="space-y-4">
      <SectionHeading
        title={locale === "zh" ? "证据快照" : "Evidence Snapshot"}
        subtitle={assets.score_system.global_index?.meaning}
      />
      <div className="grid gap-3 md:grid-cols-5">
        <SnapshotMetric
          label={globalScore?.label || assets.score_system.global_index?.label || (locale === "zh" ? "综合指数" : "Global index")}
          value={formatEqScore(globalScore?.standard_score)}
          meta={globalScore?.percentile !== undefined ? `${locale === "zh" ? "百分位" : "Percentile"} ${formatEqScore(globalScore.percentile)}` : undefined}
        />
        {strongest ? (
          <SnapshotMetric label={locale === "zh" ? "最强信号" : "Strongest signal"} value={strongest} />
        ) : null}
        {development ? (
          <SnapshotMetric label={locale === "zh" ? "发展杠杆" : "Development lever"} value={development} />
        ) : null}
        <SnapshotMetric
          label={locale === "zh" ? "常模状态" : "Norm status"}
          value={methodology.norm_status || "—"}
          meta={methodology.norm_status === "provisional" ? (locale === "zh" ? "阶段性常模" : "Provisional norms") : undefined}
        />
        <SnapshotMetric
          label={locale === "zh" ? "阅读路径" : "Reading path"}
          value={assets.personalization_route.route_headline || assets.core_formulation.title || labelForCode(interpretation.route_id, dimensions, viewModel)}
          meta={
            assets.personalization_route.evidence_snapshot_label ||
            (viewModel.route.signalSignature.match_pattern
              ? locale === "zh"
                ? "由后端路径矩阵选择"
                : "Selected by backend route matrix"
              : undefined)
          }
        />
      </div>
    </section>
  );
}

function rankingValue(
  ranking: EqDimensionRankingEntry | undefined,
  legacyCode: string | undefined,
  kind: "strongest" | "development",
  viewModel: EqV5ViewModel
): string | null {
  if (!ranking) {
    return labelForCode(legacyCode, viewModel.dimensions, viewModel);
  }

  if (ranking.status === "suppressed") {
    return null;
  }

  if (ranking.status === "unavailable") {
    return "—";
  }

  const labels = ranking.codes.map((code) => labelForCode(code, viewModel.dimensions, viewModel));
  if (ranking.status === "unique") {
    return labels[0] || "—";
  }

  const isFourWayTie = ranking.codes.length === 4;
  if (kind === "strongest") {
    if (isFourWayTie) {
      return viewModel.locale === "zh" ? "四维并列" : "Four-way tie";
    }
    return viewModel.locale === "zh" ? `并列：${labels.join("、")}` : `Tie: ${labels.join(", ")}`;
  }

  if (isFourWayTie) {
    return viewModel.locale === "zh" ? "无单一练习重点" : "No single practice focus";
  }
  return viewModel.locale === "zh"
    ? `无单一练习重点：${labels.join("、")}`
    : `No single practice focus: ${labels.join(", ")}`;
}

function labelForCode(code: string | undefined, dimensions: EqV5ViewModel["dimensions"], viewModel: EqV5ViewModel): string {
  const found = dimensions.find((item) => item.code === code);
  return found ? getEqDimensionLabel(found, viewModel.assets.score_system) : code || "—";
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
