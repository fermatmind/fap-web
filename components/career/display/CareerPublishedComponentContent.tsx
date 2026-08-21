import type { CareerDisplayComponentId } from "@/lib/career/displaySurface";
import type { CareerPublishedScalar, CareerPublishedValue } from "@/lib/career/publishedComponentContract";

const COMPONENT_LABELS: Record<CareerDisplayComponentId, string> = {
  breadcrumb: "面包屑导航",
  hero: "职业概览",
  fermat_decision_card: "费马快速判断",
  primary_cta: "开始职业兴趣测评",
  career_snapshot_primary_locale: "职业快照：中国大陆参考",
  career_snapshot_secondary_locale: "海外职业数据参考",
  fit_decision_checklist: "如何判断是否适合",
  riasec_fit_block: "RIASEC 兴趣匹配",
  personality_fit_block: "人格与工作方式",
  definition_block: "职业定义",
  career_ai_description_block: "AI 职业解读",
  responsibilities_block: "核心职责",
  work_context_block: "工作场景",
  market_signal_card: "市场信号",
  adjacent_career_comparison_table: "相邻职业比较",
  ai_impact_table: "AI 影响与应对",
  career_risk_cards: "职业风险",
  career_path_block: "职业发展路径",
  contract_project_risk_block: "合同与项目风险",
  next_steps_block: "下一步准备",
  faq_block: "常见问题",
  related_next_pages: "相关职业",
  source_card: "资料来源",
  review_validity_card: "复核有效期",
  boundary_notice: "使用边界",
  final_cta: "下一步行动",
};

const FIELD_LABELS: Record<string, string> = {
  title: "标题",
  body: "正文",
  heading: "主题",
  summary: "结论",
  caveat: "边界说明",
  callout: "重点提示",
  scene: "典型场景",
  salary: "薪资与就业数据",
  bls_table: "美国 BLS 数据",
  us_growth: "美国就业增长",
  us_median: "美国薪资中位数",
  china_ref: "中国数据来源",
  china_intl: "跨市场口径说明",
  china_open: "在招口径",
  china_open_note: "在招补充说明",
  china_ai_row: "AI 曝光参考",
  china_soc_row: "SOC / O*NET 编码",
  china_name_row: "中英文职业名称",
  china_class_row: "中国职业分类",
  china_edu_table: "经验与岗位区间",
  china_salary_note: "中国薪资口径说明",
  china_salary_table: "中国城市薪资参考",
  china_industry_table: "行业需求参考",
  sources_note: "来源补充",
  edu: "典型入职教育",
  growth: "就业增长",
  median: "薪资中位数",
  boundary: "判断边界",
  how: "如何验证",
  suit: "适合信号",
  fit_interest: "兴趣匹配说明",
  interest: "兴趣体验",
  riasec: "RIASEC 代码",
  riasec_short: "RIASEC 概览",
  disclaimer: "适配边界",
  traits: "人格与行为特征",
  intro: "说明",
  facts: "事实与边界",
  signals: "趋势信号",
  badge: "风险标签",
  fact: "关键事实",
  risks: "风险清单",
  hot_skills: "热门技能",
  responsibilities: "优先准备的职责",
  skills: "基础技能",
  ai_head_sub: "核心判断",
  ai_s1_bls: "劳动力市场参考",
  ai_s1_p: "AI 影响结论",
  ai_s2_auto: "正在自动化的任务",
  ai_s2_accel: "被 AI 加速的任务",
  ai_s3_list: "仍需人承担的能力",
  ai_s4_p: "AI 曝光评分说明",
  ai_s4_p2: "评分边界",
  ai_s5_persona: "分人群建议",
  ai_s6_tools: "工具与能力",
  ai_s7_trends: "未来趋势",
  eeat_signals: "内容责任与来源",
  author: "内容责任方",
  source: "来源说明",
  updated_at: "更新时间",
  note: "补充说明",
  last_reviewed: "最近复核",
  next_review_due: "下次复核",
  market_signal_expiry: "市场信号有效期",
  label: "项目",
  value: "内容",
  occupation: "职业",
  diff: "区别",
  persona: "人群",
  advice: "建议",
  name: "工具",
  desc: "说明",
  path: "路径",
};

function isRecord(value: CareerPublishedValue): value is Record<string, CareerPublishedValue> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function labelFor(key: string): string {
  return FIELD_LABELS[key] ?? key.replaceAll("_", " ");
}

function isScalar(value: CareerPublishedValue): value is CareerPublishedScalar {
  return value === null || typeof value === "string" || typeof value === "boolean";
}

function scalarContent(value: CareerPublishedScalar, path: string) {
  if (value === null || (typeof value === "string" && value.trim().length === 0)) {
    return <span data-career-api-empty={path} />;
  }
  return <span data-career-api-field={path}>{typeof value === "boolean" ? String(value) : value}</span>;
}

function ObjectTable({ rows, path }: { rows: Array<Record<string, CareerPublishedValue>>; path: string }) {
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  return (
    <div className="mt-4 w-full min-w-0 max-w-full overflow-x-auto rounded-xl border border-[#E5E9F2]">
      <table className="w-full min-w-[560px] border-collapse text-left text-sm" data-career-api-table={path}>
        <thead className="bg-[#F0F3FA] text-[#1A2233]">
          <tr>{columns.map((column) => <th key={column} scope="col" className="px-4 py-3 font-bold">{labelFor(column)}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`${path}:${rowIndex}`} className="border-t border-[#E5E9F2] align-top">
              {columns.map((column) => (
                <td key={column} className="min-w-36 px-4 py-3 leading-6 text-[#2a3346]">
                  {column in row && isScalar(row[column])
                    ? scalarContent(row[column], `${path}[${rowIndex}].${column}`)
                    : <span data-career-api-empty={`${path}[${rowIndex}].${column}`} />}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PublishedValue({ value, path }: { value: CareerPublishedValue; path: string }) {
  if (isScalar(value)) {
    return <p className="m-0 text-sm leading-7 text-[#2a3346]">{scalarContent(value, path)}</p>;
  }

  if (Array.isArray(value)) {
    if (value.every(isScalar)) {
      return (
        <ul className="m-0 mt-3 space-y-2 pl-5 text-sm leading-7 text-[#2a3346]" data-career-api-list={path}>
          {value.map((item, index) => <li key={`${path}:${index}`}>{scalarContent(item, `${path}[${index}]`)}</li>)}
        </ul>
      );
    }
    return <ObjectTable rows={value.filter(isRecord)} path={path} />;
  }

  if (!isRecord(value)) {
    return null;
  }

  return (
    <div className="mt-4 grid min-w-0 gap-5">
      {Object.entries(value).map(([key, item]) => (
        <section key={key} className="min-w-0" data-career-api-object-field={`${path}.${key}`}>
          <h3 className="m-0 text-base font-bold text-[#1A2233]">{labelFor(key)}</h3>
          <div className="mt-2"><PublishedValue value={item} path={`${path}.${key}`} /></div>
        </section>
      ))}
    </div>
  );
}

export function CareerPublishedComponentContent({
  componentId,
  testId,
  value,
}: {
  componentId: CareerDisplayComponentId;
  testId?: string;
  value: CareerPublishedValue;
}) {
  return (
    <section
      className="min-w-0 rounded-2xl border border-[#E5E9F2] bg-white p-5 shadow-[0_2px_12px_rgba(26,34,51,.05)] md:p-8"
      data-testid={testId ?? `career-published-${componentId}`}
      data-career-api-component={componentId}
    >
      <h2 className="m-0 text-2xl font-bold text-[#1A2233]">{COMPONENT_LABELS[componentId]}</h2>
      <div className="mt-4" data-testid={testId ? `career-published-${componentId}` : undefined}>
        <PublishedValue value={value} path={componentId} />
      </div>
    </section>
  );
}
