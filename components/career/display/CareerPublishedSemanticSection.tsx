import type { ReactNode } from "react";
import visual from "@/components/career/display/CareerProductionVisual.module.css";
import type { CareerDisplayComponentId, CareerDisplaySource } from "@/lib/career/displaySurface";
import type { CareerPublishedValue } from "@/lib/career/publishedComponentContract";

type PublishedRecord = Record<string, CareerPublishedValue>;

export const CAREER_COMPONENT_TITLES_ZH: Record<CareerDisplayComponentId, string> = {
  breadcrumb: "面包屑导航",
  hero: "职业概览",
  fermat_decision_card: "费马快速判断",
  primary_cta: "开始职业兴趣测评",
  career_snapshot_primary_locale: "职业快照",
  career_snapshot_secondary_locale: "海外薪资参考：美国 BLS 数据",
  fit_decision_checklist: "如何判断是否适合",
  riasec_fit_block: "RIASEC 兴趣匹配",
  personality_fit_block: "人格与工作方式",
  definition_block: "职业定义",
  career_ai_description_block: "AI 职业解读",
  responsibilities_block: "核心职责",
  work_context_block: "工作场景",
  career_quick_answers_block: "职业速答",
  onet_structured_fields_block: "O*NET 结构化字段",
  market_signal_card: "市场信号",
  adjacent_career_comparison_table: "相邻职业比较",
  ai_impact_table: "AI 影响与应对",
  career_risk_cards: "职业风险",
  career_path_block: "职业发展路径",
  contract_project_risk_block: "合同与项目风险",
  next_steps_block: "下一步准备",
  faq_block: "常见问题",
  related_next_pages: "相关职业",
  source_card: "资料来源与更新说明",
  review_validity_card: "复核有效期",
  boundary_notice: "使用边界",
  final_cta: "下一步行动",
};

export const CAREER_COMPONENT_TITLES_EN: Record<CareerDisplayComponentId, string> = {
  breadcrumb: "Breadcrumb",
  hero: "Career overview",
  fermat_decision_card: "Fermat quick fit check",
  primary_cta: "Start career-interest assessment",
  career_snapshot_primary_locale: "Career snapshot",
  career_snapshot_secondary_locale: "U.S. BLS reference",
  fit_decision_checklist: "How to judge fit",
  riasec_fit_block: "RIASEC interest fit",
  personality_fit_block: "Personality and work style",
  definition_block: "Career definition",
  career_ai_description_block: "AI career analysis",
  responsibilities_block: "Core responsibilities",
  work_context_block: "Work context",
  career_quick_answers_block: "Career quick answers",
  onet_structured_fields_block: "O*NET structured fields",
  market_signal_card: "Market signals",
  adjacent_career_comparison_table: "Adjacent career comparison",
  ai_impact_table: "AI impact and response",
  career_risk_cards: "Career risks",
  career_path_block: "Career path",
  contract_project_risk_block: "Contract and project risks",
  next_steps_block: "Next steps",
  faq_block: "Frequently asked questions",
  related_next_pages: "Related careers",
  source_card: "Sources",
  review_validity_card: "Review validity",
  boundary_notice: "Usage boundaries",
  final_cta: "Next action",
};

const CARD = `min-w-0 rounded-2xl border border-[#E5E9F2] bg-white shadow-[0_2px_12px_rgba(26,34,51,.05)] ${visual.card}`;
const BODY = "text-sm leading-7 text-[#2a3346]";
const CALLOUT_BLUE = `rounded-xl border-l-4 border-l-[#2C3E8C] bg-[#EEF1FB] text-[14.5px] leading-7 text-[#2a3346] ${visual.callout}`;
const CALLOUT_FORWARD = `rounded-xl border-l-4 border-l-[#0E9F94] bg-[#EAF7F4] text-[14.5px] leading-7 text-[#2a3346] ${visual.callout}`;
const CALLOUT_WARN = `rounded-xl border-l-4 border-l-[#E8920C] bg-[#FFF6E9] text-[14.5px] leading-7 text-[#2a3346] ${visual.callout}`;

function asRecord(value: CareerPublishedValue): PublishedRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value : {};
}

function asString(value: CareerPublishedValue | undefined): string {
  return typeof value === "string" ? value : "";
}

function asStringArray(value: CareerPublishedValue | undefined): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function asRows(value: CareerPublishedValue | undefined): PublishedRecord[] {
  return Array.isArray(value)
    ? value.filter((item): item is PublishedRecord => typeof item === "object" && item !== null && !Array.isArray(item))
    : [];
}

const API_COLUMN_LABELS_ZH: Record<string, string> = {
  title: "项目",
  body: "内容",
  heading: "主题",
  label: "项目",
  source_key: "来源",
  "说明": "数据说明",
  "结论": "判断",
};

const API_COLUMN_LABELS_EN: Record<string, string> = {
  title: "Item",
  body: "Content",
  heading: "Topic",
  label: "Item",
  source_key: "Source",
  "指标": "Metric",
  "数值": "Value",
  "说明": "Notes",
  "结论": "Conclusion",
  "职业": "Career",
  "区别": "Difference",
  "AI影响": "AI impact",
  "AI 影响": "AI impact",
  "城市/区间": "City / range",
  "月薪参考": "Monthly pay reference",
  "学历段": "Experience / education stage",
  "岗位方向": "Role direction",
  "行业": "Industry",
  "需求": "Demand",
  "备注": "Notes",
  "人群": "Audience",
  "建议": "Advice",
  "工具": "Tool",
  "定位": "Focus",
  "代表能力": "Key capability",
  "路径": "Path",
  "风险": "Risk",
  "可控": "Controllable factor",
  "技能": "Skill",
  "信号": "Signal",
  "解读": "Interpretation",
  "岗位": "Role",
  "重心": "Focus",
  "产出": "Output",
};

function displayColumnLabel(column: string, locale: "en" | "zh"): string {
  return (locale === "zh" ? API_COLUMN_LABELS_ZH : API_COLUMN_LABELS_EN)[column] ?? column.replaceAll("_", " ");
}

function SectionTitle({ children, tag }: { children: ReactNode; tag?: string }) {
  return (
    <h2 className={`m-0 flex items-center text-[23px] font-bold leading-tight text-[#1A2233] ${visual.sectionTitle}`}>
      {children}
      {tag ? <span className={`rounded-md bg-[#EEF1FB] text-[11px] font-bold text-[#2C3E8C] ${visual.tag}`}>{tag}</span> : null}
    </h2>
  );
}

function Field({ path, children }: { path: string; children: ReactNode }) {
  return <span data-career-api-field={path}>{children}</span>;
}

function mergedFieldItems(entries: Array<{ text: string; path: string }>): Array<{ text: string; paths: string[] }> {
  return entries.reduce<Array<{ text: string; paths: string[] }>>((items, entry) => {
    if (!entry.text) return items;
    const existing = items.find((item) => item.text === entry.text);
    if (existing) existing.paths.push(entry.path);
    else items.push({ text: entry.text, paths: [entry.path] });
    return items;
  }, []);
}

function MergedField({ item }: { item: { text: string; paths: string[] } }) {
  return <span data-career-api-field={item.paths[0]} data-career-api-fields={item.paths.join(" ")}>{item.text}</span>;
}

function ApiList({ items, path, ordered = false }: { items: string[]; path: string; ordered?: boolean }) {
  if (items.length === 0) return null;
  const List = ordered ? "ol" : "ul";
  return (
    <List className={`mb-0 mt-3 pl-5 ${BODY} ${visual.list}`} data-career-api-list={path}>
      {items.map((item, index) => <li key={`${path}:${index}`}><Field path={`${path}[${index}]`}>{item}</Field></li>)}
    </List>
  );
}

function ApiTable({ rows, path, locale }: { rows: PublishedRecord[]; path: string; locale: "en" | "zh" }) {
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  if (rows.length === 0 || columns.length === 0) return null;
  return (
    <div className="my-4 w-full min-w-0 max-w-full overflow-x-auto" data-career-table-wrap={path}>
      <table className="m-0 w-full min-w-[560px] border-collapse text-left text-sm" data-career-api-table={path}>
        <thead>
          <tr>
            {columns.map((column) => <th key={column} scope="col" className={`border border-[#E5E9F2] bg-[#EEF1FB] font-bold text-[#2C3E8C] ${visual.tableCell}`}>{displayColumnLabel(column, locale)}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`${path}:${rowIndex}`} className="even:bg-[#FBFCFE]">
              {columns.map((column) => {
                const item = row[column];
                const text = item === null ? "" : typeof item === "boolean" ? String(item) : typeof item === "string" ? item : "";
                return <td key={column} className={`min-w-36 border border-[#E5E9F2] align-top leading-6 text-[#2a3346] ${visual.tableCell}`}><Field path={`${path}[${rowIndex}].${column}`}>{text}</Field></td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ScalarOrPair({ value, path, locale }: { value: CareerPublishedValue | undefined; path: string; locale: "en" | "zh" }) {
  if (typeof value === "string") return <p className={`m-0 ${BODY}`}><Field path={path}>{value}</Field></p>;
  const row = asRecord(value ?? null);
  return (
    <div className="grid gap-1">
      {Object.entries(row).map(([key, item]) => (
        <p key={key} className={`m-0 ${BODY}`}>
          <strong className="text-[#2C3E8C]">{displayColumnLabel(key, locale)}: </strong>
          <Field path={`${path}.${key}`}>{typeof item === "string" ? item : ""}</Field>
        </p>
      ))}
    </div>
  );
}

function Fact({ title, value, path }: { title: string; value: string; path: string }) {
  if (!value) return null;
  return (
    <div className="rounded-xl bg-[#F0F3FA] p-4">
      <h3 className={`m-0 text-sm font-bold text-[#2C3E8C] ${visual.factTitle}`}>{title}</h3>
      <p className={`m-0 ${BODY}`}><Field path={path}>{value}</Field></p>
    </div>
  );
}

function PublishedRoot({ componentId, testId, children, className = CARD }: {
  componentId: CareerDisplayComponentId;
  testId?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={className} data-testid={testId ?? `career-published-${componentId}`} data-career-api-component={componentId}>
      <div data-testid={testId ? `career-published-${componentId}` : undefined}>{children}</div>
    </section>
  );
}

export function CareerPublishedSemanticSection({
  componentId,
  value,
  testId,
  sources = [],
  snapshotVariant = "complete",
  snapshotFacts = [],
  snapshotCallout,
  snapshotTitle,
  salaryBoundary,
  usageBoundary,
  aiExposureNote,
  locale = "zh",
}: {
  componentId: CareerDisplayComponentId;
  value: CareerPublishedValue;
  testId?: string;
  sources?: CareerDisplaySource[];
  snapshotVariant?: "complete" | "overview" | "china";
  snapshotFacts?: Array<{ key: "interest" | "scene" | "risk"; sourceIndex: number; text: string }>;
  snapshotCallout?: string | null;
  snapshotTitle?: string;
  salaryBoundary?: string | null;
  usageBoundary?: string[] | null;
  aiExposureNote?: string | null;
  locale?: "en" | "zh";
}) {
  const data = asRecord(value);
  const isZh = locale === "zh";
  const componentTitle = isZh ? CAREER_COMPONENT_TITLES_ZH[componentId] : CAREER_COMPONENT_TITLES_EN[componentId];

  switch (componentId) {
    case "fermat_decision_card":
      return (
        <PublishedRoot componentId={componentId} testId={testId}>
          <SectionTitle>{asString(data.title)}</SectionTitle>
          <p className={`mb-0 mt-3 font-semibold ${BODY}`}><Field path={`${componentId}.summary`}>{asString(data.summary)}</Field></p>
          <p className={`mb-0 mt-4 ${CALLOUT_BLUE}`}><Field path={`${componentId}.caveat`}>{asString(data.caveat)}</Field></p>
        </PublishedRoot>
      );

    case "career_snapshot_primary_locale": {
      const salary = asRecord(data.salary ?? null);
      if (snapshotVariant === "overview") {
        const scene = asString(data.scene);
        const factLabels = isZh
          ? { interest: "兴趣结构", scene: "典型场景", risk: "主要风险" } as const
          : { interest: "Interest structure", scene: "Typical context", risk: "Main risk" } as const;
        const facts = snapshotFacts.map((fact) => ({
          key: fact.key,
          label: factLabels[fact.key],
          items: mergedFieldItems([
            ...(fact.key === "scene" && scene
              ? [{ text: scene, path: `${componentId}.scene` }]
              : [{ text: fact.text, path: `presentation_v1.hero.badges[${fact.sourceIndex}].text` }]),
          ]),
        }));
        if (facts.every((fact) => fact.key !== "scene") && scene) {
          facts.push({
            key: "scene",
            label: factLabels.scene,
            items: mergedFieldItems([{ text: scene, path: `${componentId}.scene` }]),
          });
        }
        const callouts = mergedFieldItems([
          { text: asString(data.callout), path: `${componentId}.callout` },
          { text: snapshotCallout ?? "", path: "presentation_v1.notices.snapshot_callout" },
        ]);
        if (facts.length === 0 && callouts.length === 0) return null;
        return (
          <PublishedRoot componentId={componentId} testId={testId}>
            <SectionTitle>{componentTitle}</SectionTitle>
            {facts.length > 0 ? <div className={`mt-4 grid md:grid-cols-3 ${visual.factGrid}`}>
              {facts.map((fact) => (
                <div key={fact.key} className="rounded-xl bg-[#F0F3FA] p-4">
                  <h3 className={`m-0 text-sm font-bold text-[#2C3E8C] ${visual.factTitle}`}>{fact.label}</h3>
                  {fact.items.map((item) => <p key={item.text} className={`m-0 ${BODY}`}><MergedField item={item} /></p>)}
                </div>
              ))}
            </div> : null}
            {callouts.map((item) => <p key={item.text} className={`mb-0 mt-4 ${CALLOUT_FORWARD}`}><MergedField item={item} /></p>)}
          </PublishedRoot>
        );
      }

      if (snapshotVariant === "china") {
        const scalarKeys = (["china_name_row", "china_soc_row", "china_class_row", "china_ai_row"] as const)
          .filter((key) => asString(salary[key]) || Object.keys(asRecord(salary[key] ?? null)).length > 0);
        const chinaSalaryRows = asRows(salary.china_salary_table);
        const chinaEducationRows = asRows(salary.china_edu_table);
        const chinaIndustryRows = asRows(salary.china_industry_table);
        const blsRows = asRows(salary.bls_table);
        const detailKeys = (["us_median", "us_growth", "china_ref", "china_intl", "china_open", "china_open_note", "edu", "sources_note"] as const)
          .filter((key) => asString(salary[key]));
        const salaryBoundaries = mergedFieldItems([
          { text: asString(salary.china_salary_note), path: `${componentId}.salary.china_salary_note` },
          { text: salaryBoundary ?? "", path: "presentation_v1.notices.salary_boundary" },
        ]);
        if (
          scalarKeys.length === 0 &&
          chinaSalaryRows.length === 0 &&
          chinaEducationRows.length === 0 &&
          chinaIndustryRows.length === 0 &&
          blsRows.length === 0 &&
          detailKeys.length === 0 &&
          salaryBoundaries.length === 0
        ) return null;
        return (
          <section className={CARD} data-testid="career-published-primary-locale-china" data-career-api-component-fragment={componentId}>
            <SectionTitle>{snapshotTitle ?? (isZh ? "中国大陆参考" : "China reference")}</SectionTitle>
            {scalarKeys.length > 0 ? <div className={`mt-4 grid md:grid-cols-2 ${visual.factGrid}`}>
              {scalarKeys.map((key) => (
                <div key={key} className="rounded-xl bg-[#F0F3FA] p-4"><ScalarOrPair value={salary[key]} path={`${componentId}.salary.${key}`} locale={locale} /></div>
              ))}
            </div> : null}
            <ApiTable rows={chinaSalaryRows} path={`${componentId}.salary.china_salary_table`} locale={locale} />
            {salaryBoundaries.map((item) => <p key={item.text} className={CALLOUT_WARN}><MergedField item={item} /></p>)}
            <ApiTable rows={chinaEducationRows} path={`${componentId}.salary.china_edu_table`} locale={locale} />
            <ApiTable rows={chinaIndustryRows} path={`${componentId}.salary.china_industry_table`} locale={locale} />
            <ApiTable rows={blsRows} path={`${componentId}.salary.bls_table`} locale={locale} />
            <div className="grid gap-2">
              {detailKeys.map((key) => <p key={key} className={`m-0 ${BODY}`}><Field path={`${componentId}.salary.${key}`}>{asString(salary[key])}</Field></p>)}
            </div>
          </section>
        );
      }

      return (
        <PublishedRoot componentId={componentId} testId={testId}>
          <SectionTitle>{componentTitle}</SectionTitle>
          <div className={`mt-4 grid md:grid-cols-3 ${visual.factGrid}`}>
            <Fact title={isZh ? "典型场景" : "Typical context"} value={asString(data.scene)} path={`${componentId}.scene`} />
            <Fact title={isZh ? "美国薪资中位数" : "U.S. median pay"} value={asString(salary.us_median)} path={`${componentId}.salary.us_median`} />
            <Fact title={isZh ? "美国就业增长" : "U.S. employment growth"} value={asString(salary.us_growth)} path={`${componentId}.salary.us_growth`} />
          </div>
          <p className={`mb-0 mt-4 ${CALLOUT_FORWARD}`}><Field path={`${componentId}.callout`}>{asString(data.callout)}</Field></p>
          <div className={`mt-4 grid md:grid-cols-2 ${visual.factGrid}`}>
            {(["china_name_row", "china_soc_row", "china_class_row", "china_ai_row"] as const).map((key) => (
              <div key={key} className="rounded-xl bg-[#F0F3FA] p-4"><ScalarOrPair value={salary[key]} path={`${componentId}.salary.${key}`} locale={locale} /></div>
            ))}
          </div>
          <ApiTable rows={asRows(salary.china_salary_table)} path={`${componentId}.salary.china_salary_table`} locale={locale} />
          <p className={CALLOUT_WARN}><Field path={`${componentId}.salary.china_salary_note`}>{asString(salary.china_salary_note)}</Field></p>
          <ApiTable rows={asRows(salary.china_edu_table)} path={`${componentId}.salary.china_edu_table`} locale={locale} />
          <ApiTable rows={asRows(salary.china_industry_table)} path={`${componentId}.salary.china_industry_table`} locale={locale} />
          <ApiTable rows={asRows(salary.bls_table)} path={`${componentId}.salary.bls_table`} locale={locale} />
          <div className="grid gap-2">
            {(["china_ref", "china_intl", "china_open", "china_open_note", "edu", "sources_note"] as const).map((key) => asString(salary[key]) ? (
              <p key={key} className={`m-0 ${BODY}`}><Field path={`${componentId}.salary.${key}`}>{asString(salary[key])}</Field></p>
            ) : null)}
          </div>
        </PublishedRoot>
      );
    }

    case "career_snapshot_secondary_locale": {
      const median = asString(data.median);
      const growth = asString(data.growth);
      const blsRows = asRows(data.bls_table);
      if (!median && !growth && blsRows.length === 0) return null;
      return (
        <PublishedRoot componentId={componentId} testId={testId}>
          <SectionTitle>{isZh ? CAREER_COMPONENT_TITLES_ZH[componentId] : "U.S. BLS data"}</SectionTitle>
          {median || growth ? <div className={`mt-4 grid sm:grid-cols-2 ${visual.factGrid}`}>
            <Fact title={isZh ? "薪资中位数" : "Median pay"} value={median} path={`${componentId}.median`} />
            <Fact title={isZh ? "就业增长" : "Employment growth"} value={growth} path={`${componentId}.growth`} />
          </div> : null}
          <ApiTable rows={blsRows} path={`${componentId}.bls_table`} locale={locale} />
        </PublishedRoot>
      );
    }

    case "fit_decision_checklist":
      return (
        <PublishedRoot componentId={componentId} testId={testId}>
          <SectionTitle>{componentTitle}</SectionTitle>
          <div className={`mt-4 grid md:grid-cols-3 ${visual.factGrid}`}>
            <Fact title={isZh ? "适合信号" : "Fit signal"} value={asString(data.suit)} path={`${componentId}.suit`} />
            <Fact title={isZh ? "如何验证" : "How to validate"} value={asString(data.how)} path={`${componentId}.how`} />
            <Fact title={isZh ? "判断边界" : "Decision boundary"} value={asString(data.boundary)} path={`${componentId}.boundary`} />
          </div>
        </PublishedRoot>
      );

    case "riasec_fit_block":
      return (
        <PublishedRoot componentId={componentId} testId={testId}>
          <SectionTitle>{componentTitle}</SectionTitle>
          <p className={`mb-0 mt-4 ${CALLOUT_BLUE}`}><Field path={`${componentId}.riasec_short`}>{asString(data.riasec_short)}</Field></p>
          <div className={`mt-4 grid md:grid-cols-3 ${visual.factGrid}`}>
            <Fact title={isZh ? "RIASEC 代码" : "RIASEC code"} value={asString(data.riasec)} path={`${componentId}.riasec`} />
            <Fact title={isZh ? "兴趣体验" : "Interest experience"} value={asString(data.interest)} path={`${componentId}.interest`} />
            <Fact title={isZh ? "兴趣匹配" : "Interest fit"} value={asString(data.fit_interest)} path={`${componentId}.fit_interest`} />
          </div>
        </PublishedRoot>
      );

    case "personality_fit_block":
      return (
        <PublishedRoot componentId={componentId} testId={testId}>
          <SectionTitle>{componentTitle}</SectionTitle>
          <p className={`mb-0 mt-4 ${CALLOUT_FORWARD}`}><Field path={`${componentId}.callout`}>{asString(data.callout)}</Field></p>
          <ApiList items={asStringArray(data.traits)} path={`${componentId}.traits`} />
          <p className={`mb-0 mt-4 ${CALLOUT_WARN}`}><Field path={`${componentId}.disclaimer`}>{asString(data.disclaimer)}</Field></p>
        </PublishedRoot>
      );

    case "definition_block":
    case "work_context_block":
    case "contract_project_risk_block":
      return (
        <PublishedRoot componentId={componentId} testId={testId}>
          <SectionTitle>{componentTitle}</SectionTitle>
          <p className={`mb-0 mt-3 ${componentId === "contract_project_risk_block" ? CALLOUT_WARN : BODY}`}><Field path={componentId}>{asString(value)}</Field></p>
        </PublishedRoot>
      );

    case "career_ai_description_block":
      return (
        <PublishedRoot componentId={componentId} testId={testId}>
          <SectionTitle>{componentTitle}</SectionTitle>
          <p className={`mb-0 mt-3 font-semibold ${CALLOUT_BLUE}`}><Field path={`${componentId}.heading`}>{asString(data.heading)}</Field></p>
          <div className={`mt-3 grid gap-3 ${BODY}`}>
            {asStringArray(data.body).map((paragraph, index) => <p key={index} className="m-0"><Field path={`${componentId}.body[${index}]`}>{paragraph}</Field></p>)}
          </div>
        </PublishedRoot>
      );

    case "responsibilities_block":
      return (
        <PublishedRoot componentId={componentId} testId={testId}>
          <SectionTitle>{componentTitle}</SectionTitle>
          <ApiList items={asStringArray(value)} path={componentId} />
        </PublishedRoot>
      );

    case "market_signal_card": {
      const signals = data.signals;
      return (
        <PublishedRoot componentId={componentId} testId={testId}>
          <SectionTitle>{componentTitle}</SectionTitle>
          <p className={`mb-0 mt-3 ${BODY}`}><Field path={`${componentId}.intro`}>{asString(data.intro)}</Field></p>
          <ApiList items={asStringArray(data.facts)} path={`${componentId}.facts`} />
          {asStringArray(signals).length > 0
            ? <ApiList items={asStringArray(signals)} path={`${componentId}.signals`} />
            : <ApiTable rows={asRows(signals)} path={`${componentId}.signals`} locale={locale} />}
          <p className={`mb-0 mt-4 ${CALLOUT_FORWARD}`}><Field path={`${componentId}.callout`}>{asString(data.callout)}</Field></p>
        </PublishedRoot>
      );
    }

    case "adjacent_career_comparison_table":
    case "career_path_block":
      return (
        <PublishedRoot componentId={componentId} testId={testId}>
          <SectionTitle>{componentTitle}</SectionTitle>
          <ApiTable rows={asRows(value)} path={componentId} locale={locale} />
        </PublishedRoot>
      );

    case "ai_impact_table":
      return (
        <PublishedRoot
          componentId={componentId}
          testId={testId}
          className="min-w-0"
        >
          <div className={`rounded-2xl bg-gradient-to-br from-[#0E9F94] to-[#13b3a6] text-white ${visual.aiHead}`}>
            <SectionTitle><span className="text-white">{componentTitle}</span></SectionTitle>
            <p className="mb-0 mt-2 max-w-[680px] text-[14.5px] leading-7 text-white/95"><Field path={`${componentId}.ai_head_sub`}>{asString(data.ai_head_sub)}</Field></p>
          </div>
          <div className={`${CARD} ${visual.aiBody}`}>
            {aiExposureNote ? <p className={`mb-0 ${CALLOUT_FORWARD}`}><Field path="presentation_v1.hero.ai_exposure.note">{aiExposureNote}</Field></p> : null}
            <h3 className="m-0 text-lg font-bold text-[#243049]">{isZh ? "AI 会怎样改变这份工作" : "How AI will change this work"}</h3>
            <p className={`mb-0 mt-3 ${BODY}`}><Field path={`${componentId}.ai_s1_bls`}>{asString(data.ai_s1_bls)}</Field></p>
            <p className={`mb-0 mt-3 ${CALLOUT_BLUE}`}><Field path={`${componentId}.ai_s1_p`}>{asString(data.ai_s1_p)}</Field></p>
            <div className={`mt-5 grid md:grid-cols-2 ${visual.personaGrid}`}>
              <div className="rounded-xl border-t-[3px] border-t-[#0E9F94] bg-[#F0F3FA] p-4"><h4 className="m-0 font-bold text-[#2C3E8C]">{isZh ? "正在自动化" : "Being automated"}</h4><ApiList items={asStringArray(data.ai_s2_auto)} path={`${componentId}.ai_s2_auto`} /></div>
              <div className="rounded-xl border-t-[3px] border-t-[#0E9F94] bg-[#F0F3FA] p-4"><h4 className="m-0 font-bold text-[#2C3E8C]">{isZh ? "正在被 AI 加速" : "Being accelerated by AI"}</h4><ApiList items={asStringArray(data.ai_s2_accel)} path={`${componentId}.ai_s2_accel`} /></div>
            </div>
            <h3 className="mb-0 mt-6 text-lg font-bold text-[#243049]">{isZh ? "仍需人承担的能力" : "Capabilities that still require people"}</h3>
            <ApiList items={asStringArray(data.ai_s3_list)} path={`${componentId}.ai_s3_list`} ordered />
            <p className={`mb-0 mt-4 ${CALLOUT_FORWARD}`}><Field path={`${componentId}.ai_s4_p`}>{asString(data.ai_s4_p)}</Field></p>
            <p className={`mb-0 mt-3 ${BODY}`}><Field path={`${componentId}.ai_s4_p2`}>{asString(data.ai_s4_p2)}</Field></p>
            <div className={`mt-5 grid md:grid-cols-2 ${visual.personaGrid}`}>
              {asRows(data.ai_s5_persona).map((row, index) => (
                <div key={index} className="rounded-xl border-t-[3px] border-t-[#0E9F94] bg-[#F0F3FA] p-4">
                  {Object.entries(row).map(([key, item]) => <p key={key} className={`m-0 mt-1 first:mt-0 ${BODY}`}><strong className="text-[#2C3E8C]">{displayColumnLabel(key, locale)}: </strong><Field path={`${componentId}.ai_s5_persona[${index}].${key}`}>{asString(item)}</Field></p>)}
                </div>
              ))}
            </div>
            <ApiTable rows={asRows(data.ai_s6_tools)} path={`${componentId}.ai_s6_tools`} locale={locale} />
            <h3 className="mb-0 mt-6 text-lg font-bold text-[#243049]">{isZh ? "未来趋势" : "Future trends"}</h3>
            <ApiList items={asStringArray(data.ai_s7_trends)} path={`${componentId}.ai_s7_trends`} />
          </div>
        </PublishedRoot>
      );

    case "career_risk_cards": {
      const risks = asStringArray(data.risks);
      return (
        <PublishedRoot componentId={componentId} testId={testId}>
          <SectionTitle tag={asString(data.badge)}>{componentTitle}</SectionTitle>
          <p className="m-0 mt-4 rounded-xl border-l-4 border-blue-700 bg-blue-50 px-5 py-4 text-sm font-semibold leading-7 text-slate-800">
            <Field path={`${componentId}.fact`}>{asString(data.fact)}</Field>
          </p>
          {risks.length > 0 ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2" data-career-api-list={`${componentId}.risks`}>
              {risks.map((risk, index) => {
                const separatorIndex = risk.indexOf("：");
                const title = separatorIndex >= 0 ? risk.slice(0, separatorIndex) : risk;
                const detail = separatorIndex >= 0 ? risk.slice(separatorIndex + 1) : "";

                return (
                  <article
                    className={`rounded-xl border border-slate-200 bg-slate-50 p-4 ${risks.length % 2 === 1 && index === risks.length - 1 ? "md:col-span-2" : ""}`}
                    key={`${componentId}.risks[${index}]`}
                  >
                    <Field path={`${componentId}.risks[${index}]`}>
                      <strong className="block text-sm font-bold text-slate-900">{title}</strong>
                      {detail ? <span className="mt-2 block text-sm leading-6 text-slate-600">{detail}</span> : null}
                    </Field>
                  </article>
                );
              })}
            </div>
          ) : null}
          <p className={`mb-0 mt-4 ${CALLOUT_WARN}`}><Field path={`${componentId}.callout`}>{asString(data.callout)}</Field></p>
        </PublishedRoot>
      );
    }

    case "next_steps_block": {
      const skills = data.skills;
      return (
        <PublishedRoot componentId={componentId} testId={testId}>
          <SectionTitle>{componentTitle}</SectionTitle>
          <div className={`mt-4 grid md:grid-cols-2 ${visual.factGrid}`}>
            <div className="rounded-xl bg-[#F0F3FA] p-4"><h3 className="m-0 font-bold text-[#2C3E8C]">{isZh ? "热门技能" : "In-demand skills"}</h3><ApiList items={asStringArray(data.hot_skills)} path={`${componentId}.hot_skills`} /></div>
            <div className="rounded-xl bg-[#F0F3FA] p-4"><h3 className="m-0 font-bold text-[#2C3E8C]">{isZh ? "优先准备的职责" : "Responsibilities to prepare for"}</h3><ApiList items={asStringArray(data.responsibilities)} path={`${componentId}.responsibilities`} /></div>
          </div>
          {asStringArray(skills).length > 0
            ? <ApiList items={asStringArray(skills)} path={`${componentId}.skills`} />
            : <ApiTable rows={asRows(skills)} path={`${componentId}.skills`} locale={locale} />}
        </PublishedRoot>
      );
    }

    case "source_card": {
      const eeat = asRecord(data.eeat_signals ?? null);
      return (
        <PublishedRoot componentId={componentId} testId={testId}>
          <SectionTitle>{componentTitle}</SectionTitle>
          <p className={`mb-0 mt-3 ${BODY}`}><Field path={`${componentId}.note`}>{asString(data.note)}</Field></p>
          <div className="mt-4 grid gap-3 rounded-xl bg-[#F0F3FA] p-4 sm:grid-cols-3">
            {(["author", "source", "updated_at"] as const).map((key) => <p key={key} className={`m-0 ${BODY}`}><Field path={`${componentId}.eeat_signals.${key}`}>{asString(eeat[key])}</Field></p>)}
          </div>
          <ul className="m-0 mt-4 space-y-3 p-0" data-testid="source-list">
            {sources.map((source) => <SourceItem key={source.key} source={source} />)}
          </ul>
        </PublishedRoot>
      );
    }

    case "review_validity_card":
      return (
        <PublishedRoot componentId={componentId} testId={testId}>
          <SectionTitle>{componentTitle}</SectionTitle>
          <p className={`mb-0 mt-3 ${BODY}`}><Field path={`${componentId}.last_reviewed`}>{asString(data.last_reviewed)}</Field></p>
        </PublishedRoot>
      );

    case "boundary_notice": {
      const componentNotices = asStringArray(value);
      const notices = mergedFieldItems([
        ...componentNotices.map((text, index) => ({ text, path: `${componentId}[${index}]` })),
        ...(usageBoundary ?? []).map((text, index) => ({ text, path: `presentation_v1.notices.usage_boundary[${index}]` })),
      ]);
      if (notices.length === 0) return null;
      return (
        <PublishedRoot componentId={componentId} testId={testId} className={CALLOUT_WARN}>
          <SectionTitle>{componentTitle}</SectionTitle>
          <ul className={`mb-0 mt-3 pl-5 ${BODY} ${visual.list}`} data-career-api-list={componentId}>
            {notices.map((item) => <li key={item.text}><MergedField item={item} /></li>)}
          </ul>
        </PublishedRoot>
      );
    }

    default:
      return null;
  }
}

function SourceItem({ source }: { source: CareerDisplaySource }) {
  return (
    <li className={`list-none ${BODY}`}>
      {source.url ? <a href={source.url} className="font-semibold text-[#2C3E8C] hover:underline">{source.label}</a> : <span className="font-semibold">{source.label}</span>}
      {source.urlNote ? <span> — {source.urlNote}</span> : null}
      {typeof source.usage === "string" ? <span> — {source.usage}</span> : null}
      {Array.isArray(source.usage) ? <ul className="m-0 mt-1 list-disc pl-5">{source.usage.map((item) => <li key={item}>{item}</li>)}</ul> : null}
    </li>
  );
}
