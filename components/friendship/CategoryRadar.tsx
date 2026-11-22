import { friendshipCopy, type FriendshipDisplayLocale } from "@/lib/friendship/traditional";
import { average, CATEGORIES, type Result } from "@/lib/friendship/core";

export function CategoryRadar({ locale, result, landingSample = false }: { locale: FriendshipDisplayLocale; result: Pick<Result, "categories" | "entries" | "id">; landingSample?: boolean }) {
  const copy = friendshipCopy(locale);

  const keys = Object.keys(CATEGORIES);
  const labels = locale !== "en" ? ["美食", copy("相处"), copy("玩乐"), copy("真心话"), copy("风格"), "日常"] : ["Food", "Connection", "Fun", "Real talk", "Style", "Daily"];
  const point = (i: number, radius: number) => {
    const angle = (i * 60 - 90) * Math.PI / 180;
    return [200 + radius * Math.cos(angle), 160 + radius * Math.sin(angle)];
  };
  const polygon = (values: number[]) => values.map((value, i) => point(i, 110 * value / 100).join(",")).join(" ");
  const own = keys.map(key => { const c = result.categories[key]; return c?.total ? c.correct / c.total * 100 : 0; });
  const averages = keys.map(key => average(result.entries, key, result.id));
  const hasComparison = averages.every(value => value !== null);
  const legend = <figcaption data-ent-chart-legend={landingSample ? "" : undefined}>
    <span><i className="fq-radar-you" aria-hidden="true" />{landingSample
      ? { en: "Sample accuracy", zh: "示例猜中率", "zh-TW": "範例答對率" }[locale]
      : locale !== "en" ? "你的猜中率" : "Your accuracy"}</span>
    {hasComparison && <span><i className="fq-radar-average" aria-hidden="true" />{locale !== "en" ? copy("其他可见记录平均") : "Other visible entries’ average"}</span>}
  </figcaption>;
  return <figure className="fq-radar" data-ent-chart={landingSample ? "" : undefined}>
    {landingSample && legend}
    <svg viewBox="0 0 400 320" role="img" aria-label={locale !== "en" ? copy("六类猜中率雷达图，详细数值列在下方") : "Six-category accuracy radar; exact values follow below"}>
      <g data-ent-chart-plot={landingSample ? "" : undefined}>
        {[20, 40, 60, 80, 100].map(value => <polygon key={value} points={polygon(keys.map(() => value))} fill="none" stroke="#e2e8f0" />)}
        {keys.map((key, i) => { const [x, y] = point(i, 110); return <line key={key} x1={200} y1={160} x2={x} y2={y} stroke="#e2e8f0" />; })}
        {hasComparison && <polygon points={polygon(averages as number[])} fill="none" stroke="#64748b" strokeWidth={2} strokeDasharray="5 4" />}
        <polygon points={polygon(own)} fill="#7c3aed" fillOpacity={0.14} stroke="#7c3aed" strokeWidth={3} />
        {own.map((value, i) => { const [x, y] = point(i, 110 * value / 100); return <circle key={keys[i]} cx={x} cy={y} r={3.5} fill="#7c3aed" />; })}
      </g>
      {keys.map((key, i) => { const [x, y] = point(i, 136); return <text key={key} x={x} y={y} dominantBaseline="middle" textAnchor={i === 0 || i === 3 ? "middle" : i < 3 ? "start" : "end"} fill="#475569" fontSize={landingSample ? 15 : 12} data-ent-chart-label={landingSample ? "" : undefined}>{labels[i]}</text>; })}
    </svg>
    {!landingSample && legend}
  </figure>;
}
