import type { Locale } from "@/lib/i18n/locales";
import type { MbtiScientificContextViewModel } from "@/lib/mbti/publicProjection";
import type { MbtiResultScientificInterpretation } from "@/lib/mbti/resultScientificInterpretation";

export function MbtiResultScientificContext({
  locale,
  context,
  interpretation,
}: {
  locale: Locale;
  context: MbtiScientificContextViewModel | null | undefined;
  interpretation: MbtiResultScientificInterpretation;
}) {
  if (locale !== "zh" || !context) return null;

  return (
    <section
      data-testid="mbti-scientific-context"
      className="space-y-5 rounded-[28px] border border-sky-200 bg-sky-50/70 p-5 text-slate-800 shadow-[0_18px_40px_rgba(15,23,42,0.06)] md:p-6"
    >
      <div className="space-y-2">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-sky-800">
          科学边界与结果读法
        </p>
        <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-950">
          {interpretation.overallTitle}
        </h2>
        <p className="m-0 text-sm leading-7">{context.metricDefinition}</p>
      </div>

      {interpretation.closeCallAxes.length > 0 ? (
        <div className="space-y-3" data-testid="mbti-close-call-axes">
          <h3 className="m-0 text-base font-semibold text-slate-950">临界轴提醒</h3>
          <p className="m-0 text-sm leading-7">{context.closeCallRule}</p>
          <ul className="m-0 grid list-none gap-3 p-0 md:grid-cols-2">
            {interpretation.closeCallAxes.map((axis) => (
              <li
                key={axis.axisCode}
                className="rounded-2xl border border-sky-200 bg-white/80 p-4"
              >
                <p className="m-0 font-semibold text-slate-950">
                  {axis.axisCode} · {axis.percent}% · {axis.label}
                </p>
                <p className="m-0 mt-1 text-sm leading-6 text-slate-700">{axis.description}</p>
              </li>
            ))}
          </ul>
          <p className="m-0 text-sm leading-7">{context.typeCodeRule}</p>
          {interpretation.adjacentTypeCodes.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2" data-testid="mbti-adjacent-types">
              <span className="text-sm font-semibold text-slate-950">相邻结果代码：</span>
              {interpretation.adjacentTypeCodes.map((typeCode) => (
                <span
                  key={typeCode}
                  className="rounded-full border border-sky-300 bg-white px-3 py-1 text-sm font-semibold text-sky-900"
                >
                  {typeCode}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-2 border-t border-sky-200 pt-4" data-testid="mbti-at-boundary">
        <h3 className="m-0 text-base font-semibold text-slate-950">{context.atDimension.label}</h3>
        <p className="m-0 text-sm leading-7">{context.atDimension.status}</p>
        <dl className="m-0 grid gap-2 text-sm leading-7">
          <div>
            <dt className="inline font-semibold text-slate-950">理论边界：</dt>
            <dd className="inline">{context.atDimension.theoreticalSource}</dd>
          </div>
          <div>
            <dt className="inline font-semibold text-slate-950">计算方式：</dt>
            <dd className="inline">{context.atDimension.calculation}</dd>
          </div>
          <div>
            <dt className="inline font-semibold text-slate-950">适用范围：</dt>
            <dd className="inline">{context.atDimension.scope}</dd>
          </div>
        </dl>
      </div>

      <div className="space-y-2 border-t border-sky-200 pt-4">
        <h3 className="m-0 text-base font-semibold text-slate-950">使用限制</h3>
        <ul className="m-0 space-y-1 pl-5 text-sm leading-7">
          {context.useLimits.map((limit) => <li key={limit}>{limit}</li>)}
        </ul>
      </div>
    </section>
  );
}
