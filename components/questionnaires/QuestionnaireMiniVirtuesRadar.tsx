import type { Locale } from "@/lib/i18n/locales";
import styles from "./MiniVirtuesResult.module.css";

type Axis = { id: string; title: string; rawSum: number };
const labels = {
  zh: [["认可与自我定位"], ["资源安全与分享"], ["欲望吸引", "与边界"], ["比较敏感与欣赏"], ["即时满足与节制"], ["愤怒信号", "与耐心"], ["启动与休息回避"]],
  en: [["Recognition", "and self-view"], ["Resources", "and sharing"], ["Attraction", "and boundaries"], ["Comparison", "and appreciation"], ["Rewards", "and moderation"], ["Anger", "and patience"], ["Starting", "and rest"]],
};

/** Position within the original four-item 4–20 range; never a population percentile. */
export function miniVirtuesPosition(rawSum: number) { return (rawSum - 4) / 16 * 100; }

export function QuestionnaireMiniVirtuesRadar({ axes, locale }: { axes: Axis[]; locale: Locale }) {
  const point = (index: number, radius: number) => {
    const angle = (index * 360 / axes.length - 90) * Math.PI / 180;
    return [300 + radius * Math.cos(angle), 225 + radius * Math.sin(angle)];
  };
  const polygon = (values: number[]) => values.map((value, i) => point(i, 145 * value / 100).join(",")).join(" ");
  return <figure className={styles.radar} aria-describedby="mini-virtues-chart-caption">
    <svg viewBox="0 0 600 465" role="img" aria-label={locale === "zh" ? "七组本次作答位置雷达图，精确数值见各维度概览" : "Seven-group response-position radar; exact values are listed in the overview"}>
      {[25, 50, 75, 100].map(value => <polygon key={value} points={polygon(axes.map(() => value))} fill="none" stroke="#dfe1e9" strokeWidth="1.5" />)}
      {axes.map((axis, i) => {
        const [x, y] = point(i, 145), [tx, ty] = point(i, 195);
        const lines = labels[locale][i];
        const anchor = i === 0 ? "middle" : i <= 3 ? "start" : "end";
        const top = ty - (lines.length - 1) * 10;
        return <g key={axis.id}>
          <line x1="300" y1="225" x2={x} y2={y} stroke="#dfe1e9" strokeWidth="1.5" />
          <text x={tx} y={top} textAnchor={anchor} fill="#292733" fontSize={locale === "zh" ? 20 : 18}>
            {lines.map((line, index) => <tspan key={line} x={tx} dy={index ? 23 : 0}>{line}</tspan>)}
          </text>
          <text x={tx} y={top + (lines.length - 1) * 23 + 29} textAnchor={anchor} fill="#c72c70" fontSize="22" data-mini-virtues-radar-value={axis.id}>{Math.round(miniVirtuesPosition(axis.rawSum))}%</text>
        </g>;
      })}
      <polygon className={styles.radarFill} points={polygon(axes.map(axis => miniVirtuesPosition(axis.rawSum)))} fill="#f25392" fillOpacity=".14" />
      <polygon className={styles.radarLine} pathLength="1" points={polygon(axes.map(axis => miniVirtuesPosition(axis.rawSum)))} fill="none" stroke="#ef5599" strokeWidth="3" strokeLinejoin="round" />
      {axes.map((axis, i) => { const [x, y] = point(i, 145 * miniVirtuesPosition(axis.rawSum) / 100); return <circle key={axis.id} cx={x} cy={y} r="4.5" fill="#ef5599" />; })}
    </svg>
    <figcaption id="mini-virtues-chart-caption"><strong>{locale === "zh" ? "本次作答位置" : "Your response positions"}</strong><p>{locale === "zh" ? "百分比表示各组在本题组计分区间中的位置，不是人群百分位，也不是道德或能力等级。" : "Percentages locate each group within this form’s scoring range. They are not population percentiles or moral or ability levels."}</p></figcaption>
  </figure>;
}
