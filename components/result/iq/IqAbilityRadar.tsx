import type { Locale } from "@/lib/i18n/locales";

export type IqRadarAxis = {
  code: string;
  label: string;
  correct: number | null;
  total: number | null;
  unmeasured?: boolean;
};

const COLORS = ["#78a9ff", "#bf9bf3", "#edbe4b", "#69d2b0", "#eb8da1"];
const CENTER = [200, 166];

function point(index: number, fraction: number) {
  const angle = (-90 + index * 72) * Math.PI / 180;
  return [CENTER[0] + 102 * fraction * Math.cos(angle), CENTER[1] + 102 * fraction * Math.sin(angle)];
}

function polygon(values: number[]) {
  return values.map((value, index) => point(index, value).join(",")).join(" ");
}

export function IqAbilityRadar({ axes, locale }: { axes: IqRadarAxis[]; locale: Locale }) {
  const zh = locale === "zh";
  const values = axes.map((axis) => axis.unmeasured ? null : axis.correct !== null && axis.total !== null && axis.total > 0
    && axis.correct >= 0 && axis.correct <= axis.total ? axis.correct / axis.total : null);
  const complete = values.length === 5 && axes.every((axis, index) => axis.unmeasured || values[index] !== null);
  return <div className="mx-auto flex aspect-square w-full max-w-[440px] flex-col justify-center rounded-2xl bg-[#142038] px-3 pb-5 pt-2 text-[#aab7ca]" data-testid="iq-five-axis-chart">
    <svg viewBox="0 0 400 325" className="mx-auto w-full max-w-[440px]" role="img"
      aria-label={zh ? "本题本答题正确率图；逻辑与言语未测，无数值" : "Form-specific item accuracy; logic and verbal are unmeasured and have no numeric value"}>
      {[0.2, 0.4, 0.6, 0.8, 1].map((level) => <polygon key={level} points={polygon(Array(5).fill(level))}
        fill="none" stroke="#2b3851" strokeWidth="1" />)}
      {axes.map((axis, index) => {
        const end = point(index, 1);
        const label = point(index, 1.38);
        return <g key={axis.code}>
          <line x1={CENTER[0]} y1={CENTER[1]} x2={end[0]} y2={end[1]} stroke="#2b3851" />
          <text x={label[0]} y={label[1] - 4} textAnchor="middle" fill="#edbe4b" fontSize="13" fontWeight="650">
            {axis.unmeasured ? zh ? "未测" : "Unmeasured" : values[index] !== null ? `${Math.round(values[index]! * 100)}%` : zh ? "数据暂缺" : "Not available"}
          </text>
          <text x={label[0]} y={label[1] + 13} textAnchor="middle" fill="#aab7ca" fontSize="12">{axis.label}</text>
        </g>;
      })}
      {complete ? <g data-testid="iq-radar-values">
        {values.map((value, index) => {
          if (value === null) return null;
          const location = point(index, value);
          return <circle key={axes[index].code} cx={location[0]} cy={location[1]} r="3.5" fill="#edbe4b" />;
        })}
      </g> : null}
    </svg>
    <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm" aria-label={zh ? "雷达图各维度数据" : "Radar values by dimension"}>
      {axes.map((axis, index) => <li key={axis.code} className="inline-flex items-center gap-1">
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: COLORS[index] }} aria-hidden="true" />
        <span>{axis.label}</span>
        <span className="tabular-nums">{axis.unmeasured ? zh ? "未测" : "Unmeasured" : values[index] !== null ? `${axis.correct}/${axis.total}` : "—"}</span>
      </li>)}
    </ul>
  </div>;
}
