import visual from "@/components/career/display/CareerProductionVisual.module.css";
import { CareerEvidenceLine } from "@/components/career/display/CareerEvidenceLine";
import type { CareerContentV3 } from "@/lib/career/contentV3";
import type { CareerPublishedValue } from "@/lib/career/publishedComponentContract";

type ScalarRow = Record<string, string>;

type ChinaSalaryContent = {
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
    !officialRows || !scenarioRows || !driverRows || sources.length < 3) {
    return null;
  }

  return {
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
  const outlookPeriod = text(value.outlook_period) ?? outlookRows[0]?.["指标"].match(/20\d{2}[–-]20\d{2}/u)?.[0] ?? null;
  const sources = sourceItems([...blsRows.map((row) => row["说明"]), authoritySourcesRaw]);
  if (!heading || !directAnswer || !wageHeading || !interpretationHeading || !interpretationRows ||
    !industryHeading || !industryRows || !factorsHeading || !factorRows || !outlookHeading || !boundary ||
    !authoritySourcesRaw || !industryPeriod || !outlookPeriod || wageRows.length !== 5 || outlookRows.length !== 3 || sources.length < 3) return null;
  return {
    heading,
    directAnswer,
    wageHeading,
    wageRows,
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
  return row["说明"].split(/[；;]/)[0]
    .replace("税前月均等值约 ", "")
    .replace("About ", "")
    .replace(" gross monthly equivalent", "");
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

function SalaryQuestion({ value }: { value: string }) {
  const hasQuestionMark = value.endsWith("？");
  return (
    <>
      {hasQuestionMark ? value.slice(0, -1) : value}
      {hasQuestionMark ? <span className={visual.salaryQuestionMark}>？</span> : null}
    </>
  );
}

export function CareerDossierChinaSalary({ value, locale, contentV3 = null }: { value: CareerPublishedValue; locale: "zh" | "en"; contentV3?: CareerContentV3 | null }) {
  const content = parseChinaSalary(value);
  if (!content) return null;

  return (
    <section
      className={`${visual.salaryReference} ${visual.salaryReferenceChina}`}
      data-testid="career-dossier-china-salary"
    >
      <header className={visual.salaryHeader} data-testid="career-published-primary-locale-china">
        <div className={visual.salaryTitleRow}>
          <p>{locale === "zh" ? "中国大陆薪资参考" : "Chinese mainland salary reference"}</p>
          <span aria-hidden="true" />
        </div>
        <h2 data-career-api-field="career_snapshot_primary_locale.salary.china_name_row">
          <SalaryQuestion value={content.heading} />
        </h2>
        <span aria-hidden="true" className="sr-only" data-career-api-field="career_snapshot_primary_locale.salary.china_soc_row">{content.answer}</span>
      </header>

      <section className={visual.salarySection} aria-labelledby="china-salary-official-title">
        <div className={visual.salarySectionTitle}>
          <h3 id="china-salary-official-title">{locale === "zh" ? "官方工资中位数" : "Official median wage"}</h3>
          <span aria-hidden="true" className="sr-only" data-career-api-field="career_snapshot_primary_locale.salary.china_class_row">{content.officialIntro}</span>
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
          <h3 id="china-salary-10k-title"><SalaryQuestion value={locale === "zh" ? "会计或审计月薪 1 万是什么水平？" : "How should the published salary ranges be interpreted?"} /></h3>
          <span aria-hidden="true" className="sr-only" data-career-api-field="career_snapshot_primary_locale.salary.china_open">{content.caseNote}</span>
        </div>
        <div className={visual.salaryTableWrap}>
          <table className={visual.salaryTable} data-career-api-table="career_snapshot_primary_locale.salary.china_edu_table">
            <caption className="sr-only">{locale === "zh" ? "会计和审计月薪一万元对应的城市、企业与岗位场景" : "Role scenarios represented by published salary ranges"}</caption>
            <thead><tr><th scope="col">{locale === "zh" ? "岗位场景" : "Role scenario"}</th><th scope="col">{locale === "zh" ? "公开薪资区间" : "Published range"}</th><th scope="col">{locale === "zh" ? "月薪 1 万怎么理解" : "Interpretation"}</th></tr></thead>
            <tbody>
              {content.scenarioRows.map((row, index) => (
                <tr key={row["学历段"]}>
                  <th scope="row" data-label="岗位场景" data-career-api-field={`career_snapshot_primary_locale.salary.china_edu_table[${index}].学历段`}>{row["学历段"]}</th>
                  <td data-label="公开薪资区间" data-career-api-field={`career_snapshot_primary_locale.salary.china_edu_table[${index}].岗位方向`}>{row["岗位方向"]}</td>
                  <td data-label="月薪 1 万怎么理解" data-career-api-field={`career_snapshot_primary_locale.salary.china_edu_table[${index}].说明`}>{row["说明"]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {content.experienceAnswer ? <p className={visual.salaryAnswerStrip} data-career-api-field="career_snapshot_primary_locale.salary.china_open_note">{content.experienceAnswer}</p> : null}
      </section>

      <section className={visual.salarySection} aria-labelledby="china-salary-driver-title">
        <div className={visual.salarySectionTitle}><h3 id="china-salary-driver-title"><SalaryQuestion value={locale === "zh" ? "哪些因素真正影响工资？" : "Which factors materially affect pay?"} /></h3></div>
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
        <h3 id="salary-ai-answer-title"><SalaryQuestion value={locale === "zh" ? "AI 会让会计师和审计师工资下降吗？" : "How could AI affect pay?"} /></h3>
        <p data-career-api-field="career_snapshot_primary_locale.salary.china_ai_row">{content.aiAnswer}</p>
      </section>

      <aside className={visual.salarySources} aria-label={locale === "zh" ? "中国大陆薪资数据来源与使用边界" : "Chinese mainland salary sources and usage boundaries"}>
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

export function CareerDossierUsSalary({ value, locale, contentV3 = null }: { value: CareerPublishedValue; locale: "zh" | "en"; contentV3?: CareerContentV3 | null }) {
  const content = parseUsSalary(value);
  if (!content) return null;
  const wageTiers = buildUsWageTiers(content.wageRows, locale);

  return (
    <section
      className={`${visual.salaryReference} ${visual.salaryReferenceUs}`}
      data-testid="career-dossier-us-salary"
      data-career-api-component="career_snapshot_secondary_locale"
    >
      <header className={visual.salaryHeader} data-testid="career-published-career_snapshot_secondary_locale">
        <div className={visual.salaryTitleRow}>
          <p>{locale === "zh" ? "美国薪资参考" : "U.S. salary reference"}</p>
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
              <th scope="col">{locale === "zh" ? "工资位置" : "Wage position"}</th>
              <th scope="col">{locale === "zh" ? "年工资参考" : "Annual wage"}</th>
              <th scope="col">{locale === "zh" ? "税前月均等值" : "Gross monthly equivalent"}</th>
              <th scope="col">{locale === "zh" ? "通常怎么理解" : "How to interpret"}</th>
            </tr></thead>
            <tbody>
              {wageTiers.map((tier) => (
                <tr key={tier.label}>
                  <th scope="row">{tier.label}</th>
                  <td data-label={locale === "zh" ? "年工资参考" : "Annual wage"}>{tier.annual}</td>
                  <td data-label={locale === "zh" ? "税前月均等值" : "Gross monthly equivalent"}>{tier.monthly}</td>
                  <td data-label={locale === "zh" ? "通常怎么理解" : "How to interpret"}>
                    {tier.interpretation}
                    {tier.sourceIndexes.map((index) => {
                      const row = content.wageRows[index];
                      return (
                        <span aria-hidden="true" className="sr-only" key={row["指标"]}>
                          <span data-career-api-field={`career_snapshot_secondary_locale.bls_table[${index}].指标`}>{row["指标"]}</span>
                          <span data-career-api-field={`career_snapshot_secondary_locale.bls_table[${index}].数值`}>{row["数值"]}</span>
                          <span data-career-api-field={`career_snapshot_secondary_locale.bls_table[${index}].说明`}>{row["说明"]}</span>
                        </span>
                      );
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
              <th scope="col">{locale === "zh" ? "行业" : "Industry"}</th>
              <th scope="col">{locale === "zh" ? `${content.industryPeriod} 年薪中位数` : `${content.industryPeriod} median annual wage`}</th>
              <th scope="col">{locale === "zh" ? "怎么理解" : "How to interpret"}</th>
            </tr></thead>
            <tbody>
              {content.industryRows.map((row, index) => (
                <tr key={row.industry}>
                  <th scope="row" data-career-api-field={`career_snapshot_secondary_locale.industry_rows[${index}].industry`}>{row.industry}</th>
                  <td data-label={locale === "zh" ? `${content.industryPeriod} 年薪中位数` : `${content.industryPeriod} median annual wage`} data-career-api-field={`career_snapshot_secondary_locale.industry_rows[${index}].median`}>{row.median}</td>
                  <td data-label={locale === "zh" ? "怎么理解" : "How to interpret"} data-career-api-field={`career_snapshot_secondary_locale.industry_rows[${index}].note`}>{row.note}</td>
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
              <span aria-hidden="true" className="sr-only" data-career-api-field={`career_snapshot_secondary_locale.bls_table[${index + content.wageRows.length}].说明`}>{row["说明"]}</span>
              <CareerEvidenceLine content={contentV3} factRefs={row.fact_ref ? [row.fact_ref] : []} />
            </article>
          ))}
        </div>
      </section>

      <aside className={visual.salarySources} aria-label={locale === "zh" ? "美国薪资和就业数据来源" : "U.S. wage and employment sources"}>
        <p data-career-api-field="career_snapshot_secondary_locale.boundary">{content.boundary}</p>
        <SourceLinks items={content.sourceItems} prefix="career_snapshot_secondary_locale" />
        <span aria-hidden="true" className="sr-only" data-career-api-field="career_snapshot_secondary_locale.authority_sources">{content.authoritySourcesRaw}</span>
      </aside>
    </section>
  );
}
