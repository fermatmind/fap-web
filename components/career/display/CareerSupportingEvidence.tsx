import type { ReactNode } from "react";
import visual from "@/components/career/display/CareerProductionVisual.module.css";
import type {
  CareerEvidenceChart,
  CareerEvidenceTable,
  CareerSupportingEvidenceV1,
} from "@/lib/career/supportingEvidenceV1";

type Placement = "profile" | "ai-impact" | "china-reference" | "fit-map" | "risk-change" | "market-signals";

const BODY = "text-sm leading-7 text-[#2a3346]";

function SourceKeys({ sourceKeys }: { sourceKeys: string[] }) {
  return <p className="m-0 mt-2 text-xs leading-5 text-[#5B6678]" data-career-supporting-source-keys={sourceKeys.join(" ")}>来源：{sourceKeys.join("、")}</p>;
}

function EvidenceTable({ table, path }: { table: CareerEvidenceTable; path: string }) {
  const columns = [...new Set(table.rows.flatMap((row) => Object.keys(row)))];
  if (columns.length === 0) return null;
  return (
    <section className="mt-5 min-w-0" data-career-supporting-table={path}>
      <h3 className="m-0 text-lg font-bold text-[#243049]">{table.title}</h3>
      <div className="mt-3 w-full min-w-0 max-w-full overflow-x-auto">
        <table className="m-0 w-full min-w-[560px] border-collapse text-left text-sm">
          <thead><tr>{columns.map((column) => <th key={column} scope="col" className={`border border-[#E5E9F2] bg-[#EEF1FB] font-bold text-[#2C3E8C] ${visual.tableCell}`}>{column}</th>)}</tr></thead>
          <tbody>{table.rows.map((row, rowIndex) => (
            <tr key={`${path}:${rowIndex}`} className="even:bg-[#FBFCFE]">
              {columns.map((column) => <td key={column} className={`min-w-36 border border-[#E5E9F2] align-top leading-6 text-[#2a3346] ${visual.tableCell}`}>{row[column] ?? ""}</td>)}
            </tr>
          ))}</tbody>
        </table>
      </div>
      <SourceKeys sourceKeys={table.sourceKeys} />
    </section>
  );
}

function EvidenceChart({ chart, path }: { chart: CareerEvidenceChart; path: string }) {
  return (
    <figure className="mt-5 overflow-hidden rounded-xl border border-[#E5E9F2] bg-white p-4" data-career-supporting-chart={path}>
      <h3 className="m-0 text-lg font-bold text-[#243049]">{chart.title}</h3>
      <svg role="img" aria-label={chart.ariaLabel} viewBox="0 0 680 360" className="mt-4 h-auto w-full min-w-0" preserveAspectRatio="xMidYMid meet">
        <rect x="56" y="20" width="590" height="286" rx="12" fill="#F8FAFD" stroke="#D9DFEA" />
        {[0, 25, 50, 75, 100].map((tick) => {
          const x = 56 + tick * 5.9;
          const y = 306 - tick * 2.86;
          return <g key={tick}><line x1={x} x2={x} y1="20" y2="306" stroke="#E5E9F2" /><line x1="56" x2="646" y1={y} y2={y} stroke="#E5E9F2" /></g>;
        })}
        {chart.points.map((point, index) => {
          const color = chart.legend.find((item) => item.label === point.category)?.color ?? "#2C3E8C";
          const x = 56 + point.x * 5.9;
          const y = 306 - point.y * 2.86;
          return <g key={point.key}><circle cx={x} cy={y} r="7" fill={color}><title>{point.label}</title></circle><text x={x + 10} y={y + (index % 2 === 0 ? -8 : 16)} fontSize="12" fill="#243049">{point.label}</text></g>;
        })}
        <text x="351" y="344" textAnchor="middle" fontSize="12" fill="#5B6678">横轴</text>
        <text x="18" y="163" textAnchor="middle" fontSize="12" fill="#5B6678" transform="rotate(-90 18 163)">纵轴</text>
      </svg>
      <div className="mt-3 flex flex-wrap gap-4" aria-label="图例">
        {chart.legend.map((item) => <span key={item.label} className="inline-flex items-center gap-2 text-xs text-[#5B6678]"><span aria-hidden="true" className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />{item.label}</span>)}
      </div>
      <figcaption className="mt-3 text-xs leading-6 text-[#5B6678]">{chart.caption}</figcaption>
      <SourceKeys sourceKeys={chart.sourceKeys} />
    </figure>
  );
}

function Card({ children }: { children: ReactNode }) {
  return <div className="min-w-0 max-w-full rounded-xl border border-[#E5E9F2] bg-[#F8FAFD] p-4">{children}</div>;
}

export function CareerSupportingEvidence({ evidence, placement }: { evidence: CareerSupportingEvidenceV1 | null; placement: Placement }) {
  if (!evidence) return null;

  if (placement === "profile" && (evidence.quickAnswers.length > 0 || evidence.onet.tables.length > 0)) {
    return <div className="mt-6 border-t border-[#E5E9F2] pt-6" data-career-supporting-placement={placement}>
      {evidence.quickAnswers.length > 0 ? <section className="min-w-0"><h3 className="m-0 text-xl font-bold text-[#1A2233]">职业速答</h3><div className="mt-4 grid min-w-0 max-w-full gap-4 xl:grid-cols-3">{evidence.quickAnswers.map((answer) => <Card key={answer.key}><h4 className="m-0 font-bold text-[#2C3E8C]">{answer.title}</h4><p className={`mb-0 mt-2 ${BODY}`}>{answer.answer}</p><EvidenceTable table={answer} path={`quick_answers.${answer.key}`} /></Card>)}</div></section> : null}
      {evidence.onet.tables.length > 0 ? <section className="mt-7"><h3 className="m-0 text-xl font-bold text-[#1A2233]">O*NET 权威结构数据</h3>{evidence.onet.reviewedAt ? <p className="m-0 mt-2 text-xs text-[#5B6678]">最近复核：{evidence.onet.reviewedAt}</p> : null}{evidence.onet.tables.map((item) => <EvidenceTable key={item.key} table={item} path={`onet.${item.key}`} />)}</section> : null}
    </div>;
  }

  if (placement === "ai-impact" && (evidence.charts.taskAutomation || evidence.aiCases.length > 0)) {
    return <div className="mt-6" data-career-supporting-placement={placement}>
      {evidence.charts.taskAutomation ? <EvidenceChart chart={evidence.charts.taskAutomation} path="charts.task_automation" /> : null}
      {evidence.aiCases.length > 0 ? <section className="mt-6"><h3 className="m-0 text-lg font-bold text-[#243049]">已复核案例</h3><div className="mt-3 grid gap-3 md:grid-cols-2">{evidence.aiCases.map((item) => <Card key={`${item.organization}:${item.sourceUrl}`}><h4 className="m-0 font-bold text-[#2C3E8C]">{item.organization}</h4><p className={`mb-0 mt-2 ${BODY}`}>{item.summary}</p><a href={item.sourceUrl} className="mt-2 inline-block text-xs font-semibold text-[#2C3E8C] hover:underline">{item.sourceLabel}</a><p className="m-0 mt-1 text-xs text-[#5B6678]">复核日期：{item.reviewedAt}</p></Card>)}</div></section> : null}
    </div>;
  }

  if (placement === "china-reference" && evidence.chinaReference) {
    return <div className="mt-5" data-career-supporting-placement={placement}>
      <p className="m-0 rounded-xl border-l-4 border-l-[#E8920C] bg-[#FFF6E9] p-4 text-sm leading-7 text-[#55401a]">市场：{evidence.chinaReference.market}；样本：{evidence.chinaReference.sample}；采样时间：{evidence.chinaReference.capturedAt}。{evidence.chinaReference.boundary}</p>
      {evidence.chinaReference.tables.map((item, index) => <EvidenceTable key={`${item.title}:${index}`} table={item} path={`china_reference.tables[${index}]`} />)}
    </div>;
  }

  if (placement === "fit-map" && evidence.charts.riasec) return <EvidenceChart chart={evidence.charts.riasec} path="charts.riasec" />;
  if (placement === "risk-change" && evidence.careerPath) return <EvidenceTable table={evidence.careerPath} path="career_path" />;

  if (placement === "market-signals" && evidence.marketFacts.length > 0) {
    return <div className="mt-4 grid gap-3 sm:grid-cols-3" data-career-supporting-placement={placement}>{evidence.marketFacts.map((fact) => <Card key={fact.key}><p className="m-0 text-xs font-bold text-[#5B6678]">{fact.label}</p><p className="m-0 mt-2 text-lg font-extrabold text-[#2C3E8C]">{fact.value}</p><SourceKeys sourceKeys={fact.sourceKeys} /></Card>)}</div>;
  }
  return null;
}
