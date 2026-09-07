import styles from "@/components/result/mbti/clone/mbtiDesktopClone.module.css";
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
      className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 px-5 py-4 text-slate-700"
    >
      <div className="space-y-2">
        <h2 className="m-0 text-base font-semibold text-slate-800">
          {interpretation.overallTitle}
        </h2>
        {interpretation.closeCallAxes.length > 0 ? (
          <p className="m-0 text-sm leading-6">{context.closeCallRule}</p>
        ) : null}
      </div>

      <details className={styles.scientificDetails}>
        <summary className="cursor-pointer text-sm font-medium text-slate-600 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-4">
          查看计分说明与结果边界
        </summary>
        <div className="space-y-5 pt-4">
          <p className="m-0 text-sm leading-7">{context.metricDefinition}</p>
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

        </div>
      </details>
    </section>
  );
}
