import type { Locale } from "@/lib/i18n/locales";
import type { WrittenCoordinationGrid as Grid } from "@/lib/questionnaires/writtenCoordination";

const position = (id: string) => ({ x: 40 + (id.charCodeAt(0) - 65) * 75, y: 40 + (Number(id[1]) - 1) * 75 });
export function WrittenCoordinationGrid({ grid, locale, idPrefix }: { grid: Grid; locale: Locale; idPrefix: string }) {
  const zh = locale === "zh", caption = `${idPrefix}-caption`;
  return <figure data-written-grid className="my-5 rounded-lg border border-slate-300 bg-white p-3">
    <svg viewBox="0 0 380 380" className="mx-auto h-auto w-full max-w-sm" aria-hidden="true" focusable="false">
      {Object.entries(grid.edges).flatMap(([a, neighbours]) => neighbours.filter(b => a < b).map(b => {
        const from = position(a), to = position(b);
        return <line key={`${a}-${b}`} data-written-edge={`${a}-${b}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#475569" strokeWidth="3" />;
      }))}
      {grid.blockedEdges.map(([a, b]) => {
        const from = position(a), to = position(b), x = (from.x + to.x) / 2, y = (from.y + to.y) / 2;
        return <g key={`${a}-${b}`} data-written-closed-edge={`${a}-${b}`}>
          <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#b91c1c" strokeWidth="2" strokeDasharray="4 4" />
          <path d={`M${x - 7},${y - 7}L${x + 7},${y + 7}M${x - 7},${y + 7}L${x + 7},${y - 7}`} stroke="#b91c1c" strokeWidth="3" />
        </g>;
      })}
      {Object.keys(grid.edges).map(id => {
        const p = position(id);
        return <g key={id} data-written-node={id}><circle cx={p.x} cy={p.y} r="15" fill="#f8fafc" stroke="#0f172a" /><text x={p.x} y={p.y + 5} textAnchor="middle" fontSize="13" fill="#0f172a">{id}</text></g>;
      })}
    </svg>
    <figcaption id={caption} className="space-y-2 text-sm leading-7 text-slate-700">
      <p className="font-semibold">{zh ? "原创虚构网格：文字与图示使用同一规则" : "Original fictional grid: text and diagram use the same rules"}</p>
      <p>{zh ? "五列A至E自西向东，五行1至5自北向南；节点由列字母加行数字命名。实线允许通行，红色虚线与叉号表示关闭，不能通行。" : "Five columns A–E run west to east; five rows 1–5 run north to south. Node names combine column and row. Solid lines are permitted; red dashed lines with crosses are closed and cannot be used."}</p>
      <p>{grid.instructions[locale]}</p>
    </figcaption>
  </figure>;
}
