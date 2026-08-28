import visual from "@/components/career/display/CareerProductionVisual.module.css";
import { CareerEvidenceLine } from "@/components/career/display/CareerEvidenceLine";
import type { CareerContentV3 } from "@/lib/career/contentV3";
import type { CareerPublishedValue } from "@/lib/career/publishedComponentContract";

type ScalarRow = Record<string, string>;

type AiImpactContent = {
  heading: string;
  answer: string;
  methodCards: ScalarRow[];
  taskRows: ScalarRow[];
  evidenceIntro: string;
  evidenceRows: ScalarRow[];
  differenceIntro: string;
  differenceRows: ScalarRow[];
  responsibilityIntro: string;
  responsibilitySteps: ScalarRow[];
  riskRows: ScalarRow[];
  actionRows: ScalarRow[];
  questions: ScalarRow[];
  authorityLinks: ScalarRow[];
  transition: string;
};

const AI_SOURCE_HOSTS = new Set([
  "www.bls.gov",
  "www.weforum.org",
  "www.ilo.org",
  "pcaobus.org",
  "www.cicpa.org.cn",
  "pubsonline.informs.org",
  "link.springer.com",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function rows(value: unknown, keys: string[], minimum: number, optionalKeys: string[] = []): ScalarRow[] | null {
  if (!Array.isArray(value) || value.length < minimum) return null;
  const parsed = value.map((item) => {
    if (!isRecord(item) || Object.keys(item).some((key) => !keys.includes(key) && !optionalKeys.includes(key)) || keys.some((key) => !(key in item))) return null;
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
    return url.protocol === "https:" && AI_SOURCE_HOSTS.has(url.hostname) ? url.toString() : null;
  } catch {
    return null;
  }
}

function parseAiImpact(value: CareerPublishedValue): AiImpactContent | null {
  if (!isRecord(value)) return null;

  const heading = text(value.heading);
  const answer = text(value.answer);
  const evidenceIntro = text(value.evidence_intro);
  const differenceIntro = text(value.difference_intro);
  const responsibilityIntro = text(value.responsibility_intro);
  const transition = text(value.transition);
  const methodCards = rows(value.method_cards, ["概念", "含义"], 3);
  const taskRows = rows(value.task_rows, ["工作方向", "任务", "当前变化", "人的控制点"], 4);
  const evidenceRows = rows(value.evidence_rows, ["来源", "研究对象", "结论", "使用限制", "链接"], 3, ["fact_ref", "source_ref"]);
  const differenceRows = rows(value.difference_rows, ["方向", "AI主要改变", "仍由人负责"], 2);
  const responsibilitySteps = rows(value.responsibility_steps, ["步骤", "说明"], 4);
  const riskRows = rows(value.risk_rows, ["风险", "为什么重要", "控制方式"], 3);
  const actionRows = rows(value.action_rows, ["人群", "应对重点"], 3);
  const questions = rows(value.questions, ["问题", "回答", "来源", "链接"], 3, ["fact_ref", "source_ref"]);
  const authorityLinks = rows(value.authority_links, ["来源", "类型", "适用范围", "链接"], 3);

  if (!heading || !answer || !evidenceIntro || !differenceIntro || !responsibilityIntro ||
    !transition || !methodCards || !taskRows || !evidenceRows || !differenceRows ||
    !responsibilitySteps || !riskRows || !actionRows || !questions || !authorityLinks ||
    [...evidenceRows, ...questions, ...authorityLinks].some((row) => safeSourceUrl(row["链接"]) === null)) {
    return null;
  }

  return {
    heading,
    answer,
    methodCards,
    taskRows,
    evidenceIntro,
    evidenceRows,
    differenceIntro,
    differenceRows,
    responsibilityIntro,
    responsibilitySteps,
    riskRows,
    actionRows,
    questions,
    authorityLinks,
    transition,
  };
}

export function supportsCareerDossierAiImpact(value: CareerPublishedValue): boolean {
  return parseAiImpact(value) !== null;
}

function SourceLink({ href, children, field }: { href: string; children: string; field: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" data-career-api-field={field}>
      {children}
    </a>
  );
}

export function CareerDossierAiImpact({ value, locale, contentV3 = null }: { value: CareerPublishedValue; locale: "zh" | "en"; contentV3?: CareerContentV3 | null }) {
  const content = parseAiImpact(value);
  if (!content) return null;

  return (
    <section
      className={visual.accountantsAiImpact}
      data-testid="career-dossier-ai-impact"
      data-career-api-component="ai_impact_table"
    >
      <header className={visual.aiImpactHeader}>
        <div className={visual.aiImpactEyebrowRow}>
          <p className={visual.aiImpactEyebrow}>{locale === "zh" ? "AI 对职业的影响" : "AI impact on this career"}</p>
          <span aria-hidden="true" />
        </div>
        <h2 data-career-api-field="ai_impact_table.heading">{content.heading}</h2>
        <p className={visual.aiImpactAnswer} data-career-api-field="ai_impact_table.answer">{content.answer}</p>
      </header>

      <section className={visual.aiImpactSection} aria-label={locale === "zh" ? "AI 影响判断层次" : "AI impact assessment layers"}>
        <div className={visual.aiImpactMethodGrid} data-career-api-list="ai_impact_table.method_cards">
          {content.methodCards.map((card, index) => (
            <article key={card["概念"]}>
              <h3 data-career-api-field={`ai_impact_table.method_cards[${index}].概念`}>{card["概念"]}</h3>
              <p data-career-api-field={`ai_impact_table.method_cards[${index}].含义`}>{card["含义"]}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={visual.aiImpactSection} aria-labelledby="ai-impact-task-title">
        <div className={visual.aiImpactSectionTitle}>
          <h3 id="ai-impact-task-title">{locale === "zh" ? "任务影响矩阵" : "Task impact matrix"}</h3>
        </div>
        <div className={visual.aiImpactTableWrap}>
          <table className={visual.aiImpactTable} data-career-api-table="ai_impact_table.task_rows">
            <caption className="sr-only">{locale === "zh" ? "职业任务受到人工智能影响的比较" : "Comparison of AI impact across career tasks"}</caption>
            <thead><tr><th scope="col">{locale === "zh" ? "工作方向" : "Work area"}</th><th scope="col">{locale === "zh" ? "任务" : "Task"}</th><th scope="col">{locale === "zh" ? "当前变化" : "Current change"}</th><th scope="col">{locale === "zh" ? "人的控制点" : "Human control point"}</th></tr></thead>
            <tbody>
              {content.taskRows.map((row, index) => (
                <tr key={`${row["工作方向"]}:${row["任务"]}`}>
                  <th scope="row" data-label="工作方向" data-career-api-field={`ai_impact_table.task_rows[${index}].工作方向`}>{row["工作方向"]}</th>
                  <td data-label="任务" data-career-api-field={`ai_impact_table.task_rows[${index}].任务`}>{row["任务"]}</td>
                  <td data-label="当前变化" data-career-api-field={`ai_impact_table.task_rows[${index}].当前变化`}>{row["当前变化"]}</td>
                  <td data-label="人的控制点" data-career-api-field={`ai_impact_table.task_rows[${index}].人的控制点`}>{row["人的控制点"]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={visual.aiImpactSection} aria-labelledby="ai-impact-evidence-title">
        <div className={visual.aiImpactSectionTitle}>
          <h3 id="ai-impact-evidence-title">{locale === "zh" ? "为什么就业证据会得出不同结论？" : "Why does employment evidence reach different conclusions?"}</h3>
          <p data-career-api-field="ai_impact_table.evidence_intro">{content.evidenceIntro}</p>
        </div>
        <div className={visual.aiImpactEvidenceGrid} data-career-api-list="ai_impact_table.evidence_rows">
          {content.evidenceRows.map((row, index) => (
            <article key={row["来源"]}>
              <div className={visual.aiImpactEvidenceHeading}>
                <h4 data-career-api-field={`ai_impact_table.evidence_rows[${index}].来源`}>{row["来源"]}</h4>
                <SourceLink href={row["链接"]} field={`ai_impact_table.evidence_rows[${index}].链接`}>{locale === "zh" ? "查看来源 ↗" : "View source ↗"}</SourceLink>
              </div>
              <dl>
                <div><dt>{locale === "zh" ? "研究对象" : "Subject"}</dt><dd data-career-api-field={`ai_impact_table.evidence_rows[${index}].研究对象`}>{row["研究对象"]}</dd></div>
                <div><dt>{locale === "zh" ? "主要结论" : "Finding"}</dt><dd data-career-api-field={`ai_impact_table.evidence_rows[${index}].结论`}>{row["结论"]}</dd></div>
                <div><dt>{locale === "zh" ? "使用限制" : "Limitation"}</dt><dd data-career-api-field={`ai_impact_table.evidence_rows[${index}].使用限制`}>{row["使用限制"]}</dd></div>
              </dl>
              <CareerEvidenceLine content={contentV3} factRefs={row.fact_ref ? [row.fact_ref] : []} sourceRefs={row.source_ref ? [row.source_ref] : []} />
            </article>
          ))}
        </div>
      </section>

      <section className={visual.aiImpactSection} aria-labelledby="ai-impact-difference-title">
        <div className={visual.aiImpactSectionTitle}>
          <h3 id="ai-impact-difference-title">{locale === "zh" ? "不同工作方向受到的影响为什么不同？" : "Why does impact differ by work direction?"}</h3>
          <p data-career-api-field="ai_impact_table.difference_intro">{content.differenceIntro}</p>
        </div>
        <div className={visual.aiImpactDirectionGrid} data-career-api-list="ai_impact_table.difference_rows">
          {content.differenceRows.map((row, index) => (
            <article key={row["方向"]}>
              <h4 data-career-api-field={`ai_impact_table.difference_rows[${index}].方向`}>{row["方向"]}</h4>
              <p><strong>{locale === "zh" ? "AI 主要改变" : "AI primarily changes"}</strong><span data-career-api-field={`ai_impact_table.difference_rows[${index}].AI主要改变`}>{row["AI主要改变"]}</span></p>
              <p><strong>{locale === "zh" ? "仍由人负责" : "Human responsibility remains"}</strong><span data-career-api-field={`ai_impact_table.difference_rows[${index}].仍由人负责`}>{row["仍由人负责"]}</span></p>
            </article>
          ))}
        </div>
      </section>

      <section className={visual.aiImpactSection} aria-labelledby="ai-impact-responsibility-title">
        <div className={visual.aiImpactSectionTitle}>
          <h3 id="ai-impact-responsibility-title">{locale === "zh" ? "AI 进入专业流程后，责任链不能断" : "Accountability must remain intact when AI enters professional workflows"}</h3>
          <p data-career-api-field="ai_impact_table.responsibility_intro">{content.responsibilityIntro}</p>
        </div>
        <ol className={visual.aiImpactResponsibility} data-career-api-list="ai_impact_table.responsibility_steps">
          {content.responsibilitySteps.map((step, index) => (
            <li key={step["步骤"]}>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <strong data-career-api-field={`ai_impact_table.responsibility_steps[${index}].步骤`}>{step["步骤"]}</strong>
              <p data-career-api-field={`ai_impact_table.responsibility_steps[${index}].说明`}>{step["说明"]}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={visual.aiImpactSection} aria-labelledby="ai-impact-risk-title">
        <h3 id="ai-impact-risk-title">{locale === "zh" ? "使用 AI 的专业风险" : "Professional risks of using AI"}</h3>
        <div className={visual.aiImpactRiskGrid} data-career-api-list="ai_impact_table.risk_rows">
          {content.riskRows.map((row, index) => (
            <article key={row["风险"]}>
              <h4 data-career-api-field={`ai_impact_table.risk_rows[${index}].风险`}>{row["风险"]}</h4>
              <p data-career-api-field={`ai_impact_table.risk_rows[${index}].为什么重要`}>{row["为什么重要"]}</p>
              <p><strong>{locale === "zh" ? "控制方式：" : "Control: "}</strong><span data-career-api-field={`ai_impact_table.risk_rows[${index}].控制方式`}>{row["控制方式"]}</span></p>
            </article>
          ))}
        </div>
      </section>

      <section className={visual.aiImpactSection} aria-labelledby="ai-impact-action-title">
        <h3 id="ai-impact-action-title">{locale === "zh" ? "不同人群应该如何应对？" : "How should different audiences respond?"}</h3>
        <div className={visual.aiImpactActionList} data-career-api-list="ai_impact_table.action_rows">
          {content.actionRows.map((row, index) => (
            <article key={row["人群"]}>
              <h4 data-career-api-field={`ai_impact_table.action_rows[${index}].人群`}>{row["人群"]}</h4>
              <p data-career-api-field={`ai_impact_table.action_rows[${index}].应对重点`}>{row["应对重点"]}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={visual.aiImpactSection} aria-labelledby="ai-impact-questions-title">
        <h3 id="ai-impact-questions-title">{locale === "zh" ? "关于 AI 与职业发展的常见问题" : "Common questions about AI and career development"}</h3>
        <div className={visual.aiImpactQuestions} data-career-api-list="ai_impact_table.questions">
          {content.questions.map((item, index) => (
            <article key={item["问题"]}>
              <h4 data-career-api-field={`ai_impact_table.questions[${index}].问题`}>{item["问题"]}</h4>
              <p data-career-api-field={`ai_impact_table.questions[${index}].回答`}>{item["回答"]}</p>
              <p className={visual.aiImpactQuestionSource}>
                {locale === "zh" ? "来源：" : "Source: "}<span data-career-api-field={`ai_impact_table.questions[${index}].来源`}>{item["来源"]}</span>
                <span aria-hidden="true"> · </span>
                <SourceLink href={item["链接"]} field={`ai_impact_table.questions[${index}].链接`}>{locale === "zh" ? "原始资料 ↗" : "Original source ↗"}</SourceLink>
              </p>
              <CareerEvidenceLine content={contentV3} factRefs={item.fact_ref ? [item.fact_ref] : []} sourceRefs={item.source_ref ? [item.source_ref] : []} />
            </article>
          ))}
        </div>
      </section>

      <aside className={visual.aiImpactSources} aria-labelledby="ai-impact-sources-title">
        <h3 id="ai-impact-sources-title">{locale === "zh" ? "权威来源与使用边界" : "Authoritative sources and usage boundaries"}</h3>
        <ul data-career-api-list="ai_impact_table.authority_links">
          {content.authorityLinks.map((source, index) => (
            <li key={source["链接"]}>
              <SourceLink href={source["链接"]} field={`ai_impact_table.authority_links[${index}].链接`}>{source["来源"]}</SourceLink>
              <span data-career-api-field={`ai_impact_table.authority_links[${index}].类型`}>{source["类型"]}</span>
              <span data-career-api-field={`ai_impact_table.authority_links[${index}].适用范围`}>{source["适用范围"]}</span>
            </li>
          ))}
        </ul>
      </aside>

      <p className={visual.aiImpactTransition} data-career-api-field="ai_impact_table.transition">{content.transition}</p>
    </section>
  );
}
