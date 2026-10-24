import type { EqV5ViewModel } from "./types";
import { formatEqScore, getEqDimensionLabel } from "./utils";
import { SectionHeading } from "./EQEvidenceSnapshot";
import { localizeEqTechnicalValue } from "./localization";

const MATRIX: Array<{ code: string; axis: "self" | "relationship"; mode: "understand" | "act" }> = [
  { code: "SA", axis: "self", mode: "understand" },
  { code: "ER", axis: "self", mode: "act" },
  { code: "EM", axis: "relationship", mode: "understand" },
  { code: "RM", axis: "relationship", mode: "act" },
];

export function EQEmotionalMatrix({ viewModel }: { viewModel: EqV5ViewModel }) {
  const { locale, dimensions, assets } = viewModel;

  return (
    <section data-testid="eq-emotional-matrix" className="space-y-4">
      <SectionHeading
        title={locale === "zh" ? "情绪与关系矩阵" : "Emotional Matrix"}
      />
      <div className="space-y-2 text-sm leading-6 text-slate-700" data-testid="eq-score-units">
        <p>{assets.score_system.score_notes?.standard_score}</p>
        <p>{assets.score_system.score_notes?.percentile}</p>
        <p>{locale === "zh" ? "原始分为计分后题目总和；标准分与参照百分位保留报告单位。POMP是可用分值范围百分比，不是人口百分位；本报告未提供的指标不换算。" : "Raw score is the scored item sum. Standard scores and reference percentiles retain the report’s units. POMP is percentage of the possible score range, not a population percentile; unavailable metrics are not derived."}</p>
        <p>{locale === "zh" ? "参照状态：" : "Reference status: "}{viewModel.methodology.norm_status || (locale === "zh" ? "未知" : "Unknown")} · {locale === "zh" ? "PROVISIONAL为阶段性参照，MISSING为缺失参照，均不表示成熟人口常模。自评不是MSCEIT能力测验或临床诊断。" : "PROVISIONAL is a provisional reference and MISSING means missing reference; neither establishes mature population norms. This self-report is not an MSCEIT ability test or clinical diagnosis."}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {MATRIX.map((cell) => {
          const score = dimensions.find((item) => item.code === cell.code);
          const band = score?.display_band || score?.band;
          const bandCopy = band ? assets.score_system.dimensions?.[cell.code]?.band_explanations?.[band] : undefined;
          return (
            <article key={cell.code} className="rounded-[8px] border border-slate-200 bg-white p-4" data-testid={`eq-matrix-${cell.code}`}>
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                {cell.axis === "self"
                  ? locale === "zh"
                    ? "自己"
                    : "Self"
                  : locale === "zh"
                    ? "他人 / 关系"
                    : "Others / Relationships"}{" "}
                · {cell.mode === "understand" ? (locale === "zh" ? "理解 / 识别" : "Understand / Notice") : locale === "zh" ? "调节 / 行动" : "Regulate / Act"}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-slate-950">
                {score ? getEqDimensionLabel(score, assets.score_system) : cell.code}
              </h3>
              {score ? (
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                  <Metric label={locale === "zh" ? "原始总分" : "Raw sum"} value={formatEqScore(score.raw_score)} />
                  <Metric label={locale === "zh" ? "标准分" : "Score"} value={formatEqScore(score.standard_score)} />
                  <Metric label={locale === "zh" ? "参照百分位" : "Reference percentile"} value={formatEqScore(score.percentile)} />
                  <Metric
                    label={locale === "zh" ? "等级" : "Band"}
                    value={localizeEqTechnicalValue(band, locale) || "—"}
                  />
                </div>
              ) : null}
              {bandCopy ? <p className="mt-3 text-sm leading-6 text-slate-600">{bandCopy}</p> : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] bg-slate-50 p-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  );
}
