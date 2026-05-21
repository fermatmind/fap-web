import type { EqV5ViewModel } from "./types";
import { formatEqScore, getEqDimensionLabel } from "./utils";
import { SectionHeading } from "./EQEvidenceSnapshot";

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
        subtitle={locale === "zh" ? "四个维度按对象和行动方式组织。" : "Four dimensions organized by target and response mode."}
      />
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
                <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                  <Metric label={locale === "zh" ? "标准分" : "Score"} value={formatEqScore(score.standard_score)} />
                  <Metric label={locale === "zh" ? "百分位" : "Percentile"} value={formatEqScore(score.percentile)} />
                  <Metric label={locale === "zh" ? "等级" : "Band"} value={band || "—"} />
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">{locale === "zh" ? "该维度暂不可用。" : "This dimension is unavailable."}</p>
              )}
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
