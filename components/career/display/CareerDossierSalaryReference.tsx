import visual from "@/components/career/display/CareerProductionVisual.module.css";
import { CareerEvidenceLine } from "@/components/career/display/CareerEvidenceLine";
import type { CareerContentV3 } from "@/lib/career/contentV3";
import type { CareerPublishedValue } from "@/lib/career/publishedComponentContract";

type ScalarRow = Record<string, string>;

type ChinaSalaryContent = {
  ui: Record<string, string> | null;
  heading: string;
  answer: string;
  officialIntro: string;
  officialRows: ScalarRow[];
  scenarioRows: ScalarRow[];
  driverRows: ScalarRow[];
  aiAnswer: string;
  boundary: string;
  caseNote: string;
  experienceAnswer: string | null;
  sourceItems: Array<{ label: string; href: string }>;
  sourceFields: Array<{ field: string; value: string }>;
  factRefs: string[];
};

type UsSalaryContent = {
  heading: string;
  directAnswer: string;
  wageHeading: string;
  wageRows: ScalarRow[];
  suppliedWageTiers: UsWageTier[] | null;
  wageColumnLabels: string[] | null;
  industryValueLabel: string | null;
  interpretationHeading: string;
  interpretationRows: ScalarRow[];
  industryHeading: string;
  industryRows: ScalarRow[];
  factorsHeading: string;
  factorRows: ScalarRow[];
  outlookHeading: string;
  outlookRows: ScalarRow[];
  industryPeriod: string;
  outlookPeriod: string;
  boundary: string;
  authoritySourcesRaw: string;
  sourceItems: Array<{ label: string; href: string }>;
};

type UsWageTier = {
  label: string;
  annual: string;
  monthly: string;
  interpretation: string;
  sourceIndexes: number[];
};

const SALARY_SOURCE_HOSTS = new Set([
  "www.bls.gov",
  "www.ilo.org",
  "www.mohrss.gov.cn",
  "www.onetonline.org",
  "hrss.gd.gov.cn",
  "www.randstad.cn",
  "xahrss.xa.gov.cn",
  "www.leshan.gov.cn",
  "www.stats.gov.cn",
  "m.thepaper.cn",
  "rsj.beijing.gov.cn",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function rows(value: unknown, keys: string[], minimum: number, optionalKeys: string[] = []): ScalarRow[] | null {
  if (!Array.isArray(value) || value.length < minimum) return null;
  const parsed = value.map((item) => {
    if (!isRecord(item) || keys.some((key) => !(key in item))) return null;
    const row = Object.fromEntries(keys.map((key) => [key, text(item[key])])) as Record<string, string | null>;
    if (!Object.values(row).every(Boolean)) return null;
    for (const key of optionalKeys) {
      const optionalValue = text(item[key]);
      if (optionalValue) row[key] = optionalValue;
    }
    return row as ScalarRow;
  });
  return parsed.some((row) => row === null) ? null : parsed as ScalarRow[];
}

function safeSourceUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && SALARY_SOURCE_HOSTS.has(url.hostname) ? url.toString() : null;
  } catch {
    return null;
  }
}

function sourceItems(values: Array<string | null>): Array<{ label: string; href: string }> {
  const items = values.flatMap((value) => value?.split(/[；;]/) ?? []).map((item) => {
    const [labelValue, hrefValue] = item.split("｜").map((part) => part.trim());
    const href = hrefValue ? safeSourceUrl(hrefValue) : null;
    return labelValue && href ? { label: labelValue, href } : null;
  });
  const unique = new Map<string, { label: string; href: string }>();
  items.forEach((item) => {
    if (item) unique.set(item.href, item);
  });
  return [...unique.values()];
}

function parseChinaSalary(value: CareerPublishedValue): ChinaSalaryContent | null {
  if (!isRecord(value) || !isRecord(value.salary)) return null;
  const salary = value.salary;
  let ui: Record<string, string> | null = null;
  if (Object.hasOwn(salary, "ui")) {
    const keys = ["official_heading", "scenario_heading", "scenario_caption", "scenario_role_label", "scenario_value_label", "scenario_interpretation_label", "driver_heading", "ai_heading"];
    if (!isRecord(salary.ui) || keys.some(key => !text((salary.ui as Record<string, unknown>)[key]))) return null;
    ui = Object.fromEntries(keys.map(key => [key, String((salary.ui as Record<string, unknown>)[key])]));
  }

  const heading = text(salary.china_name_row);
  const answer = text(salary.china_soc_row);
  const officialIntro = text(salary.china_class_row);
  const aiAnswer = text(salary.china_ai_row);
  const boundary = text(salary.china_salary_note);
  const caseNote = text(salary.china_open);
  const officialRows = rows(salary.china_salary_table, ["城市/区间", "月薪参考"], 3);
  const scenarioRows = rows(salary.china_edu_table, ["学历段", "岗位方向", "说明"], 4);
  const driverRows = rows(salary.china_industry_table, ["行业", "需求"], 3);
  const sources = sourceItems([
    text(salary.china_ref),
    text(salary.china_intl),
    text(salary.sources_note),
    text(salary.edu),
  ]);
  const sourceFields: Array<{ field: string; value: string }> = [];
  for (const [field, sourceValue] of [
    ["china_ref", text(salary.china_ref)],
    ["china_intl", text(salary.china_intl)],
    ["sources_note", text(salary.sources_note)],
  ] as const) {
    if (sourceValue) sourceFields.push({ field, value: sourceValue });
  }

  if (!heading || !answer || !officialIntro || !aiAnswer || !boundary || !caseNote ||
    !officialRows || !scenarioRows || !driverRows || sources.length < 2) {
    return null;
  }

  return {
    ui,
    heading,
    answer,
    officialIntro,
    officialRows,
    scenarioRows,
    driverRows,
    aiAnswer,
    boundary,
    caseNote,
    experienceAnswer: text(salary.china_open_note),
    sourceItems: sources,
    sourceFields,
    factRefs: Array.isArray(salary.fact_refs) ? salary.fact_refs.filter((entry): entry is string => typeof entry === "string" && entry.length > 0) : [],
  };
}

function parseUsSalary(value: CareerPublishedValue): UsSalaryContent | null {
  if (!isRecord(value)) return null;
  const heading = text(value.heading);
  const directAnswer = text(value.direct_answer);
  const wageHeading = text(value.wage_heading);
  const interpretationHeading = text(value.interpretation_heading);
  const interpretationRows = rows(value.interpretation_rows, ["question", "answer"], 4);
  const industryHeading = text(value.industry_heading);
  const industryRows = rows(value.industry_rows, ["industry", "median", "note"], 4, ["fact_ref"]);
  const factorsHeading = text(value.factors_heading);
  const factorRows = rows(value.factor_rows, ["factor", "answer"], 3);
  const outlookHeading = text(value.outlook_heading);
  const boundary = text(value.boundary);
  const authoritySourcesRaw = text(value.authority_sources);
  const blsRows = rows(value.bls_table, ["指标", "数值", "说明"], 8, ["fact_ref"]);
  if (!blsRows) return null;
  const wageRows = blsRows.filter((row) => /(?:薪资|wages)/iu.test(row["指标"]));
  const outlookRows = blsRows.filter((row) => /(?:就业|outlook)/iu.test(row["指标"]));
  const industryPeriod = text(value.industry_period) ?? `${industryHeading ?? ""} ${industryRows?.map((row) => row.note).join(" ") ?? ""}`.match(/20\d{2}/u)?.[0] ?? null;
  const outlookPeriod = text(value.outlook_period) ?? outlookRows[0]?.["指标"].match(/20\d{2}[–—-]20\d{2}/u)?.[0] ?? null;
  const sources = sourceItems([...blsRows.map((row) => row["说明"]), authoritySourcesRaw]);
  let suppliedWageTiers: UsWageTier[] | null = null;
  let wageColumnLabels: string[] | null = null;
  const industryValueLabel = text(value.industry_value_label);
  if (Object.hasOwn(value, "wage_tiers")) {
    const supplied = rows(value.wage_tiers, ["label", "value", "equivalent", "interpretation"], 3);
    if (!supplied || supplied.length !== 3 || !Array.isArray(value.wage_column_labels)
      || value.wage_column_labels.length !== 4 || value.wage_column_labels.some(label => !text(label))
      || !industryValueLabel) return null;
    suppliedWageTiers = supplied.map(row => ({label: row.label, annual: row.value, monthly: row.equivalent, interpretation: row.interpretation, sourceIndexes: []}));
    wageColumnLabels = value.wage_column_labels as string[];
  }
  if (!heading || !directAnswer || !wageHeading || !interpretationHeading || !interpretationRows ||
    !industryHeading || !industryRows || !factorsHeading || !factorRows || !outlookHeading || !boundary ||
    !authoritySourcesRaw || !industryPeriod || !outlookPeriod || wageRows.length !== 5 || outlookRows.length !== 3 || sources.length < 2) return null;
  return {
    heading,
    directAnswer,
    wageHeading,
    wageRows,
    suppliedWageTiers,
    wageColumnLabels,
    industryValueLabel,
    interpretationHeading,
    interpretationRows,
    industryHeading,
    industryRows,
    factorsHeading,
    factorRows,
    outlookHeading,
    outlookRows,
    industryPeriod,
    outlookPeriod,
    boundary,
    authoritySourcesRaw,
    sourceItems: sources,
  };
}

function monthlyEquivalent(row: ScalarRow): string {
  const described = row["说明"].split(/[；;]/)[0]
    .replace("税前月均等值约 ", "")
    .replace("About ", "")
    .replace(" gross monthly equivalent", "");
  if (/^\$[\d,]+(?:\.\d+)?$/u.test(described)) return described;

  const annual = Number(row["数值"].replace(/[^\d.]/gu, ""));
  return Number.isFinite(annual) && annual > 0
    ? `$${Math.round(annual / 12).toLocaleString("en-US")}`
    : described;
}

function buildUsWageTiers(wageRows: ScalarRow[], locale: "zh" | "en"): UsWageTier[] {
  const [p10, p25, median, p75, p90] = wageRows;
  return [
    {
      label: locale === "zh" ? "入门或较低工资岗位" : "Entry or lower-wage roles",
      annual: `${p10["数值"]}–${p25["数值"].replace(/^\$/, "")}`,
      monthly: `${monthlyEquivalent(p10)}–${monthlyEquivalent(p25).replace(/^\$/, "")}`,
      interpretation: locale === "zh"
        ? "大致对应工资分布的 10–25 分位；常见于经验较少、工资水平较低地区或职责较基础的岗位。"
        : "Roughly the 10th–25th percentile range; it may reflect less experience, lower-paying areas or narrower responsibilities.",
      sourceIndexes: [0, 1],
    },
    {
      label: locale === "zh" ? "市场中位水平" : "National median",
      annual: median["数值"],
      monthly: monthlyEquivalent(median),
      interpretation: locale === "zh"
        ? "全美一半从业者低于这一年薪，一半高于；它不是会计师或审计师的平均起薪。"
        : "Half of U.S. workers in the occupation earn less and half earn more; this is not an average starting salary.",
      sourceIndexes: [2],
    },
    {
      label: locale === "zh" ? "资深或高薪岗位" : "Senior or higher-wage roles",
      annual: `${p75["数值"]}–${p90["数值"].replace(/^\$/, "")}`,
      monthly: `${monthlyEquivalent(p75)}–${monthlyEquivalent(p90).replace(/^\$/, "")}`,
      interpretation: locale === "zh"
        ? "大致对应 75–90 分位；通常与更高经验、专业责任、管理职责或高薪地区有关。"
        : "Roughly the 75th–90th percentile range; it often reflects greater experience, responsibility, management scope or a higher-paying area.",
      sourceIndexes: [3, 4],
    },
  ];
}

export function supportsCareerDossierChinaSalary(value: CareerPublishedValue): boolean {
  return parseChinaSalary(value) !== null;
}

export function supportsCareerDossierUsSalary(value: CareerPublishedValue): boolean {
  return parseUsSalary(value) !== null;
}

function SourceLinks({ items, prefix }: { items: Array<{ label: string; href: string }>; prefix: string }) {
  return (
    <p className={visual.salarySourceLinks} data-career-api-list={`${prefix}.sources`}>
      {items.map((item, index) => (
        <span key={item.href}>
          {index > 0 ? " · " : null}
          <a href={item.href} target="_blank" rel="noopener noreferrer">{item.label}</a>
        </span>
      ))}
    </p>
  );
}

// A published note can contain prose or the existing label｜URL source encoding.
// Keep every non-link chunk readable, and use the same source URL policy as SourceLinks.
function SalaryExplanation({ value }: { value: string }) {
  return value.split(/[；;]/).map((chunk, index) => {
    const parts = chunk.trim().split("｜");
    const href = parts.length === 2 ? safeSourceUrl(parts[1].trim()) : null;
    return <span key={index}>{index > 0 ? "；" : null}{href && parts[0].trim()
      ? <a href={href} target="_blank" rel="noopener noreferrer">{parts[0].trim()}</a>
      : chunk}</span>;
  });
}

function SalaryQuestion({ value }: { value: string }) {
  const hasQuestionMark = value.endsWith("？");
  return (
    <>
      {hasQuestionMark ? value.slice(0, -1) : value}
      {hasQuestionMark ? <span className={visual.salaryQuestionMark}>？</span> : null}
    </>
  );
}

export function CareerDossierChinaSalary({ value, locale, contentV3 = null, interfaceLabels }: { value: CareerPublishedValue; locale: "zh" | "en"; contentV3?: CareerContentV3 | null; interfaceLabels?: Record<string, string> }) {
  const content = parseChinaSalary(value);
  if (!content) return null;

  return (
    <section
      className={`${visual.salaryReference} ${visual.salaryReferenceChina}`}
      data-testid="career-dossier-china-salary"
    >
      <header className={visual.salaryHeader} data-testid="career-published-primary-locale-china">
        <div className={visual.salaryTitleRow}>
          <p>{interfaceLabels?.["interface.china_salary.section_label"] ?? (locale === "zh" ? "中国大陆薪资参考" : "Chinese mainland salary reference")}</p>
          <span aria-hidden="true" />
        </div>
        <h2 data-career-api-field="career_snapshot_primary_locale.salary.china_name_row">
          <SalaryQuestion value={content.heading} />
        </h2>
        <p className={visual.salaryLead} data-career-api-field="career_snapshot_primary_locale.salary.china_soc_row">{content.answer}</p>
      </header>

      <section className={visual.salarySection} aria-labelledby="china-salary-official-title">
        <div className={visual.salarySectionTitle}>
          <h3 id="china-salary-official-title">{content.ui?.official_heading ?? (locale === "zh" ? "官方工资中位数" : "Official median wage")}</h3>
          <p data-career-api-field="career_snapshot_primary_locale.salary.china_class_row">{content.officialIntro}</p>
        </div>
        <div className={visual.salaryOfficialGrid} data-career-api-list="career_snapshot_primary_locale.salary.china_salary_table">
          {content.officialRows.map((row, index) => (
            <article key={row["城市/区间"]}>
              <h4 data-career-api-field={`career_snapshot_primary_locale.salary.china_salary_table[${index}].城市/区间`}>{row["城市/区间"]}</h4>
              <p data-career-api-field={`career_snapshot_primary_locale.salary.china_salary_table[${index}].月薪参考`}>{row["月薪参考"]}</p>
            </article>
          ))}
        </div>
        <CareerEvidenceLine content={contentV3} factRefs={content.factRefs} />
      </section>

      <section className={visual.salarySection} aria-labelledby="china-salary-10k-title">
        <div className={visual.salarySectionTitle}>
          <h3 id="china-salary-10k-title"><SalaryQuestion value={content.ui?.scenario_heading ?? (locale === "zh" ? "会计或审计月薪 1 万是什么水平？" : "How should the published salary ranges be interpreted?")} /></h3>
          <p data-career-api-field="career_snapshot_primary_locale.salary.china_open">{content.caseNote}</p>
        </div>
        <div className={visual.salaryTableWrap}>
          <table className={visual.salaryTable} data-career-api-table="career_snapshot_primary_locale.salary.china_edu_table">
            <caption className="sr-only">{content.ui?.scenario_caption ?? (locale === "zh" ? "会计和审计月薪一万元对应的城市、企业与岗位场景" : "Role scenarios represented by published salary ranges")}</caption>
            <thead><tr><th scope="col">{content.ui?.scenario_role_label ?? (locale === "zh" ? "岗位场景" : "Role scenario")}</th><th scope="col">{content.ui?.scenario_value_label ?? (locale === "zh" ? "公开薪资区间" : "Published range")}</th><th scope="col">{content.ui?.scenario_interpretation_label ?? (locale === "zh" ? "月薪 1 万怎么理解" : "Interpretation")}</th></tr></thead>
            <tbody>
              {content.scenarioRows.map((row, index) => (
                <tr key={row["学历段"]}>
                  <th scope="row" data-label={content.ui?.scenario_role_label ?? "岗位场景"} data-career-api-field={`career_snapshot_primary_locale.salary.china_edu_table[${index}].学历段`}>{row["学历段"]}</th>
                  <td data-label={content.ui?.scenario_value_label ?? "公开薪资区间"} data-career-api-field={`career_snapshot_primary_locale.salary.china_edu_table[${index}].岗位方向`}>{row["岗位方向"]}</td>
                  <td data-label={content.ui?.scenario_interpretation_label ?? "月薪 1 万怎么理解"} data-career-api-field={`career_snapshot_primary_locale.salary.china_edu_table[${index}].说明`}>{row["说明"]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {content.experienceAnswer ? <p className={visual.salaryAnswerStrip} data-career-api-field="career_snapshot_primary_locale.salary.china_open_note">{content.experienceAnswer}</p> : null}
      </section>

      <section className={visual.salarySection} aria-labelledby="china-salary-driver-title">
        <div className={visual.salarySectionTitle}><h3 id="china-salary-driver-title"><SalaryQuestion value={content.ui?.driver_heading ?? (locale === "zh" ? "哪些因素真正影响工资？" : "Which factors materially affect pay?")} /></h3></div>
        <div className={visual.salaryDriverGrid} data-career-api-list="career_snapshot_primary_locale.salary.china_industry_table">
          {content.driverRows.map((row, index) => (
            <article key={row["行业"]}>
              <h4 data-career-api-field={`career_snapshot_primary_locale.salary.china_industry_table[${index}].行业`}>{row["行业"]}</h4>
              <p data-career-api-field={`career_snapshot_primary_locale.salary.china_industry_table[${index}].需求`}>{row["需求"]}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={visual.salaryAiAnswer} aria-labelledby="salary-ai-answer-title">
        <h3 id="salary-ai-answer-title"><SalaryQuestion value={content.ui?.ai_heading ?? (locale === "zh" ? "AI 会让会计师和审计师工资下降吗？" : "How could AI affect pay?")} /></h3>
        <p data-career-api-field="career_snapshot_primary_locale.salary.china_ai_row">{content.aiAnswer}</p>
      </section>

      <aside className={visual.salarySources} aria-label={interfaceLabels?.["interface.china_salary.sources_label"] ?? (locale === "zh" ? "中国大陆薪资数据来源与使用边界" : "Chinese mainland salary sources and usage boundaries")}>
        {isRecord(value) && isRecord(value.salary) && Array.isArray(value.salary.bls_table) ? value.salary.bls_table.map((row, index) => isRecord(row) ? (
          <p key={index}>
            <span data-career-api-field={`career_snapshot_primary_locale.salary.bls_table[${index}].数值`}>{text(row["数值"])}</span>{" · "}
            <span data-career-api-field={`career_snapshot_primary_locale.salary.bls_table[${index}].说明`}>{text(row["说明"])}</span>
          </p>
        ) : null) : null}
        {isRecord(value) && text(value.callout) ? <p data-career-api-field="career_snapshot_primary_locale.callout">{text(value.callout)}</p> : null}
        {isRecord(value) && text(value.scene) ? <p data-career-api-field="career_snapshot_primary_locale.scene">{text(value.scene)}</p> : null}
        <p data-career-api-field="career_snapshot_primary_locale.salary.china_salary_note">{content.boundary}</p>
        <SourceLinks items={content.sourceItems} prefix="career_snapshot_primary_locale.salary" />
        {content.sourceFields.map((item) => (
          <span
            aria-hidden="true"
            className="sr-only"
            data-career-api-field={`career_snapshot_primary_locale.salary.${item.field}`}
            key={item.field}
          >
            {item.value}
          </span>
        ))}
      </aside>
    </section>
  );
}

export function CareerDossierUsSalary({ value, locale, contentV3 = null, interfaceLabels }: { value: CareerPublishedValue; locale: "zh" | "en"; contentV3?: CareerContentV3 | null; interfaceLabels?: Record<string, string> }) {
  const content = parseUsSalary(value);
  if (!content) return null;
  const wageTiers = content.suppliedWageTiers ?? buildUsWageTiers(content.wageRows, locale);

  return (
    <section
      className={`${visual.salaryReference} ${visual.salaryReferenceUs}`}
      data-testid="career-dossier-us-salary"
      data-career-api-component="career_snapshot_secondary_locale"
    >
      <header className={visual.salaryHeader} data-testid="career-published-career_snapshot_secondary_locale">
        <div className={visual.salaryTitleRow}>
          <p>{interfaceLabels?.["interface.us_salary.section_label"] ?? (locale === "zh" ? "美国薪资参考" : "U.S. salary reference")}</p>
          <span aria-hidden="true" />
        </div>
        <h2><SalaryQuestion value={content.heading} /></h2>
        <p className={visual.salaryDirectAnswer}>{content.directAnswer}</p>
      </header>

      <section className={visual.salarySection} aria-labelledby="us-salary-distribution-title">
        <div className={visual.salarySectionTitle}>
          <h3 id="us-salary-distribution-title">{content.wageHeading}</h3>
        </div>
        <div className={visual.salaryTableWrap}>
          <table className={visual.salaryTable} data-career-api-table="career_snapshot_secondary_locale.bls_table.wages">
            <caption className="sr-only">{content.wageHeading}</caption>
            <thead><tr>
              <th scope="col">{content.wageColumnLabels?.[0] ?? (locale === "zh" ? "工资位置" : "Wage position")}</th>
              <th scope="col">{content.wageColumnLabels?.[1] ?? (locale === "zh" ? "年工资参考" : "Annual wage")}</th>
              <th scope="col">{content.wageColumnLabels?.[2] ?? (locale === "zh" ? "税前月均等值（编辑换算）" : "Gross monthly equivalent")}</th>
              <th scope="col">{content.wageColumnLabels?.[3] ?? (locale === "zh" ? "通常怎么理解" : "How to interpret")}</th>
            </tr></thead>
            <tbody>
              {wageTiers.map((tier, tierIndex) => (
                <tr key={tier.label}>
                  <th scope="row" {...(content.suppliedWageTiers ? {"data-career-api-field": `career_snapshot_secondary_locale.wage_tiers[${tierIndex}].label`} : {})}>{tier.label}</th>
                  <td data-label={content.wageColumnLabels?.[1] ?? (locale === "zh" ? "年工资参考" : "Annual wage")} {...(content.suppliedWageTiers ? {"data-career-api-field": `career_snapshot_secondary_locale.wage_tiers[${tierIndex}].value`} : {})}>{tier.annual}</td>
                  <td data-label={content.wageColumnLabels?.[2] ?? (locale === "zh" ? "税前月均等值" : "Gross monthly equivalent")} {...(content.suppliedWageTiers ? {"data-career-api-field": `career_snapshot_secondary_locale.wage_tiers[${tierIndex}].equivalent`} : {})}>{tier.monthly}</td>
                  <td data-label={content.wageColumnLabels?.[3] ?? (locale === "zh" ? "通常怎么理解" : "How to interpret")}>
                    {content.suppliedWageTiers ? <span data-career-api-field={`career_snapshot_secondary_locale.wage_tiers[${tierIndex}].interpretation`}>{tier.interpretation}</span> : tier.interpretation}

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={visual.salarySectionTitle} data-career-api-list="career_snapshot_secondary_locale.bls_table.wage_notes">
          {content.wageRows.map((row, index) => (
            <p key={row["指标"]}>
              <span data-career-api-field={`career_snapshot_secondary_locale.bls_table[${index}].指标`}>{row["指标"]}</span>
              {"："}<span data-career-api-field={`career_snapshot_secondary_locale.bls_table[${index}].数值`}>{row["数值"]}</span>
              {"；"}<span data-career-api-field={`career_snapshot_secondary_locale.bls_table[${index}].说明`}><SalaryExplanation value={row["说明"]} /></span>
            </p>
          ))}
        </div>
        <CareerEvidenceLine content={contentV3} factRefs={content.wageRows.flatMap((row) => row.fact_ref ? [row.fact_ref] : [])} />
      </section>

      <section className={visual.salarySection} aria-labelledby="us-salary-interpretation-title">
        <div className={visual.salarySectionTitle}>
          <h3 id="us-salary-interpretation-title">{content.interpretationHeading}</h3>
        </div>
        <div className={visual.salaryQuestionGrid} data-career-api-list="career_snapshot_secondary_locale.interpretation_rows">
          {content.interpretationRows.map((row, index) => (
            <article key={row.question}>
              <h4 data-career-api-field={`career_snapshot_secondary_locale.interpretation_rows[${index}].question`}>
                <SalaryQuestion value={row.question} />
              </h4>
              <p data-career-api-field={`career_snapshot_secondary_locale.interpretation_rows[${index}].answer`}>{row.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={visual.salarySection} aria-labelledby="us-salary-industry-title">
        <div className={visual.salarySectionTitle}>
          <h3 id="us-salary-industry-title">{content.industryHeading}</h3>
        </div>
        <div className={visual.salaryTableWrap}>
          <table className={visual.salaryTable} data-career-api-table="career_snapshot_secondary_locale.industry_rows">
            <caption className="sr-only">{content.industryHeading}</caption>
            <thead><tr>
              <th scope="col">{interfaceLabels?.["interface.us_salary.industry.industry_header"] ?? (locale === "zh" ? "行业" : "Industry")}</th>
              <th scope="col">{content.industryValueLabel ?? (locale === "zh" ? `${content.industryPeriod} 年薪中位数` : `${content.industryPeriod} median annual wage`)}</th>
              <th scope="col">{interfaceLabels?.["interface.us_salary.industry.interpretation_header"] ?? (locale === "zh" ? "怎么理解" : "How to interpret")}</th>
            </tr></thead>
            <tbody>
              {content.industryRows.map((row, index) => (
                <tr key={row.industry}>
                  <th scope="row" data-career-api-field={`career_snapshot_secondary_locale.industry_rows[${index}].industry`}>{row.industry}</th>
                  <td data-label={content.industryValueLabel ?? (locale === "zh" ? `${content.industryPeriod} 年薪中位数` : `${content.industryPeriod} median annual wage`)} data-career-api-field={`career_snapshot_secondary_locale.industry_rows[${index}].median`}>{row.median}</td>
                  <td data-label={interfaceLabels?.["interface.us_salary.industry.interpretation_header"] ?? (locale === "zh" ? "怎么理解" : "How to interpret")} data-career-api-field={`career_snapshot_secondary_locale.industry_rows[${index}].note`}>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CareerEvidenceLine content={contentV3} factRefs={content.industryRows.flatMap((row) => row.fact_ref ? [row.fact_ref] : [])} />
      </section>

      <section className={visual.salarySection} aria-labelledby="us-salary-factors-title">
        <div className={visual.salarySectionTitle}>
          <h3 id="us-salary-factors-title">{content.factorsHeading}</h3>
        </div>
        <div className={visual.salaryFactorGrid} data-career-api-list="career_snapshot_secondary_locale.factor_rows">
          {content.factorRows.map((row, index) => (
            <article key={row.factor}>
              <h4 data-career-api-field={`career_snapshot_secondary_locale.factor_rows[${index}].factor`}>{row.factor}</h4>
              <p data-career-api-field={`career_snapshot_secondary_locale.factor_rows[${index}].answer`}>{row.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={visual.salarySection} aria-labelledby="us-salary-outlook-title">
        <div className={visual.salarySectionTitle}>
          <h3 id="us-salary-outlook-title">{content.outlookHeading}</h3>
        </div>
        <div className={visual.salaryOutlookGrid} data-career-api-list="career_snapshot_secondary_locale.bls_table.outlook">
          {content.outlookRows.map((row, index) => (
            <article key={row["指标"]}>
              <h4>
                <span>{row["指标"].replace(/^20\d{2}[–-]20\d{2} (?:就业|outlook) · /iu, "")}</span>
                <span aria-hidden="true" className="sr-only" data-career-api-field={`career_snapshot_secondary_locale.bls_table[${index + content.wageRows.length}].指标`}>{row["指标"]}</span>
              </h4>
              <strong data-career-api-field={`career_snapshot_secondary_locale.bls_table[${index + content.wageRows.length}].数值`}>{row["数值"]}</strong>
              <p data-career-api-field={`career_snapshot_secondary_locale.bls_table[${index + content.wageRows.length}].说明`}><SalaryExplanation value={row["说明"]} /></p>
              <CareerEvidenceLine content={contentV3} factRefs={row.fact_ref ? [row.fact_ref] : []} />
            </article>
          ))}
        </div>
      </section>

      <aside className={visual.salarySources} aria-label={interfaceLabels?.["interface.us_salary.sources_label"] ?? (locale === "zh" ? "美国薪资和就业数据来源" : "U.S. wage and employment sources")}>
        <p data-career-api-field="career_snapshot_secondary_locale.boundary">{content.boundary}</p>
        <SourceLinks items={content.sourceItems} prefix="career_snapshot_secondary_locale" />
        <span aria-hidden="true" className="sr-only" data-career-api-field="career_snapshot_secondary_locale.authority_sources">{content.authoritySourcesRaw}</span>
      </aside>
    </section>
  );
}
