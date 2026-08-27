import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookOpenCheck,
  BriefcaseBusiness,
  CalendarCheck2,
  Calculator,
  ChartPie,
  ClipboardCheck,
  Clock3,
  FileSearch,
  FileText,
  MessageSquareText,
  SearchCheck,
  ShieldCheck,
  TriangleAlert,
  UsersRound,
} from "lucide-react";
import styles from "@/components/career/display/CareerDossierProfile.module.css";
import type {
  CareerPublishedOnetStructuredFieldsBlock,
  CareerPublishedQuickAnswersBlock,
} from "@/lib/career/publishedComponentContract";

type Props = {
  definition: string;
  responsibilities: string[];
  workContext: string;
  quickAnswers: CareerPublishedQuickAnswersBlock;
  professionalBasis: CareerPublishedOnetStructuredFieldsBlock;
  locale: "zh" | "en";
};

const responsibilityIcons = [Calculator, ClipboardCheck, FileText, BarChart3, FileSearch, MessageSquareText] as const;

function splitPublished(value: string, delimiter: string, parts: number): string[] {
  const segments = value.split(delimiter).map((item) => item.trim());
  if (segments.length < parts) return ["", "", value];

  return [segments[0], segments[1], segments.slice(2).join(delimiter)];
}

function splitWorkFact(value: string): [string, string] {
  const delimiterIndex = value.indexOf("｜");
  if (delimiterIndex === -1) return ["", value.trim()];

  return [value.slice(0, delimiterIndex).trim(), value.slice(delimiterIndex + 1).trim()];
}

export function CareerDossierProfile({
  definition,
  responsibilities,
  workContext,
  quickAnswers,
  professionalBasis,
  locale,
}: Props) {
  const systemItem = quickAnswers.items[0];
  const boundaryItem = quickAnswers.items[1];
  const judgmentItem = quickAnswers.items[2];
  const systemRows = systemItem.table.rows;
  const accountingTrack = systemRows[0];
  const auditingTrack = systemRows[1];
  const sharedFoundation = systemRows[2];
  const workFacts = workContext.split("\n").map(splitWorkFact);
  const workTitle = workFacts.find(([label]) => label === "板块标题" || label === "Section title")?.[1] ?? (locale === "zh" ? "工作现实" : "Work reality");
  const workSummary = workFacts.find(([label]) => label === "直接答案" || label === "Direct answer")?.[1] ?? "";
  const workDetailFacts = workFacts.filter(([label]) => !["板块标题", "直接答案", "Section title", "Direct answer"].includes(label));
  const workFactIcons = [BriefcaseBusiness, FileText, ClipboardCheck, Clock3, UsersRound, SearchCheck, BadgeCheck] as const;

  return (
    <div className={styles.profile} data-testid="career-dossier-profile">
      <div
        id="career-component-definition_block"
        className={styles.definition}
        data-career-component-id="definition_block"
        data-career-api-component="definition_block"
        data-career-published-value={definition}
        data-testid="definition-block"
      >
        <div className={styles.titleRow}>
          <h2 id="career-visual-group-title-profile" className={styles.title}>{locale === "zh" ? "职业画像" : "Career profile"}</h2>
          <span aria-hidden="true" className={styles.titleRule} />
        </div>
        <p className={styles.thesis} data-career-api-field="definition_block">{definition}</p>
      </div>

      <div
        id="career-component-career_quick_answers_block"
        className={styles.systemSection}
        data-career-component-id="career_quick_answers_block"
        data-career-api-component="career_quick_answers_block"
        data-career-availability={quickAnswers.availability}
        data-career-schema-version={quickAnswers.schema_version}
        data-career-quick-answer-key={systemItem.key}
        data-career-published-answer={systemItem.answer}
      >
        <span className="sr-only" data-career-api-field="career_quick_answers_block.heading">{quickAnswers.heading}</span>
        <div
          className={styles.trackFigure}
          aria-label={systemItem.question}
          data-career-api-field="career_quick_answers_block.items[0].question"
        >
          {[accountingTrack, auditingTrack].map((track, trackIndex) => {
            const isAccounting = trackIndex === 0;
            const steps = track.value.split("→").map((item) => item.trim()).filter(Boolean);
            const stepIcons = isAccounting
              ? [FileText, Calculator, ClipboardCheck, CalendarCheck2, BarChart3, ChartPie]
              : [ShieldCheck, TriangleAlert, ClipboardCheck, SearchCheck, BadgeCheck, MessageSquareText];
            const path = `career_quick_answers_block.items[0].table.rows[${trackIndex}]`;
            return (
              <section key={track.label} className={isAccounting ? styles.accountingTrack : styles.auditingTrack}>
                <div className={styles.trackHeader}>
                  <h4>
                    <span data-career-api-field={`${path}.label`}>{track.label}</span>
                    <span>：</span>
                  </h4>
                  <p>
                    <strong data-career-api-field={`${path}.secondary_value`}>{track.secondary_value}</strong>
                  </p>
                </div>
                <ol className={styles.trackSteps} data-career-api-field={`${path}.value`}>
                  {steps.map((step, stepIndex) => {
                    const StepIcon = stepIcons[stepIndex] ?? ClipboardCheck;
                    return (
                    <li key={step}>
                      <span>
                        <StepIcon aria-hidden="true" size={16} strokeWidth={1.7} />
                        <i className="sr-only">{String(stepIndex + 1).padStart(2, "0")}</i>
                      </span>
                      <strong>{step}</strong>
                      {stepIndex < steps.length - 1 ? <ArrowRight aria-hidden="true" className={styles.trackArrow} size={15} strokeWidth={1.4} /> : null}
                    </li>
                    );
                  })}
                </ol>
              </section>
            );
          })}
          {sharedFoundation ? (
            <div className={styles.foundation}>
              <BookOpenCheck aria-hidden="true" size={18} strokeWidth={1.8} />
              <strong data-career-api-field="career_quick_answers_block.items[0].table.rows[2].label">{sharedFoundation.label}</strong>
              <span data-career-api-field="career_quick_answers_block.items[0].table.rows[2].value">{sharedFoundation.value}</span>
            </div>
          ) : null}
        </div>

        <section
          className={styles.boundarySection}
          data-career-quick-answer-key={boundaryItem.key}
          data-career-published-answer={boundaryItem.answer}
        >
          <div className={styles.sectionHeadingCompact}>
            <div>
              <h3 data-career-api-field="career_quick_answers_block.items[1].question">{boundaryItem.question}</h3>
            </div>
          </div>
          <p
            className={styles.directAnswer}
            data-career-api-field="career_quick_answers_block.items[1].answer"
          >
            {boundaryItem.answer}
          </p>
          <div className={styles.tableWrap}>
            <table aria-label={boundaryItem.question}>
              <thead>
                <tr><th>{locale === "zh" ? "维度" : "Dimension"}</th><th>{locale === "zh" ? "主要方向" : "Primary track"}</th><th>{locale === "zh" ? "比较方向" : "Comparison track"}</th></tr>
              </thead>
              <tbody>
                {boundaryItem.table.rows.map((row, index) => {
                  const path = `career_quick_answers_block.items[1].table.rows[${index}]`;
                  return (
                    <tr key={row.label}>
                      <th scope="row" data-career-api-field={`${path}.label`}>{row.label}</th>
                      <td data-career-api-field={`${path}.value`}>{row.value}</td>
                      <td data-career-api-field={`${path}.secondary_value`}>{row.secondary_value}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className={styles.detailGrid}>
        <section
          id="career-component-responsibilities_block"
          className={styles.responsibilities}
          data-career-component-id="responsibilities_block"
          data-career-api-component="responsibilities_block"
          data-testid="responsibilities-block"
        >
          <div className={styles.sectionHeadingCompact}>
            <div><h3>{locale === "zh" ? "核心工作" : "Core responsibilities"}</h3></div>
          </div>
          <ol className={styles.responsibilityList} data-career-api-list="responsibilities_block">
            {responsibilities.map((item, index) => {
              const [, title, description] = splitPublished(item, "｜", 3);
              const Icon = responsibilityIcons[index] ?? FileText;
              return (
                <li key={item} data-career-published-value={item}>
                  <span className={styles.responsibilityNumber}>{String(index + 1).padStart(2, "0")}</span>
                  <Icon aria-hidden="true" size={19} strokeWidth={1.75} />
                  <div>
                    <div className={styles.responsibilityTitle}>
                      <strong>{title}</strong>
                    </div>
                    <p data-career-api-field={`responsibilities_block[${index}]`}>{description}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <section
          className={styles.judgmentSection}
          data-career-quick-answer-key={judgmentItem.key}
          data-career-published-answer={judgmentItem.answer}
        >
          <div className={styles.sectionHeadingCompact}>
            <div>
              <h3 data-career-api-field="career_quick_answers_block.items[2].question">{judgmentItem.question}</h3>
            </div>
          </div>
          <ol className={styles.judgmentList}>
            {judgmentItem.table.rows.map((row, index) => {
              const path = `career_quick_answers_block.items[2].table.rows[${index}]`;
              return (
                <li key={row.label}>
                  <span
                    className={styles.responsibilityNumber}
                    data-career-api-field={`${path}.label`}
                  >
                    {row.label}
                  </span>
                  <div>
                    <h4 data-career-api-field={`${path}.value`}>{row.value}</h4>
                    {row.secondary_value ? (
                      <p data-career-api-field={`${path}.secondary_value`}>{row.secondary_value}</p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      </div>

      <div className={styles.footerGrid}>
        <section
          id="career-component-work_context_block"
          className={styles.workReality}
          data-career-component-id="work_context_block"
          data-career-api-component="work_context_block"
          data-career-published-value={workContext}
          data-testid="work-context-block"
        >
          <div className={styles.footerTitle}><h3>{workTitle}</h3></div>
          {workSummary ? (
            <p className={styles.workSummary} data-career-api-field="work_context_block">
              {workSummary}
            </p>
          ) : null}
          <dl>
            {workDetailFacts.map(([label, value], index) => {
              const Icon = workFactIcons[index] ?? BriefcaseBusiness;
              return (
                <div key={`${label}:${value}`}>
                  <Icon aria-hidden="true" size={18} strokeWidth={1.75} />
                  <dt>{label}</dt>
                  <dd data-career-api-field="work_context_block">{value}</dd>
                </div>
              );
            })}
          </dl>
        </section>

        <section
          id="career-component-onet_structured_fields_block"
          className={styles.professionalBasis}
          data-career-component-id="onet_structured_fields_block"
          data-career-api-component="onet_structured_fields_block"
          data-career-availability={professionalBasis.availability}
          data-career-schema-version={professionalBasis.schema_version}
        >
          <div className={styles.footerTitle}>
            <h3 data-career-api-field="onet_structured_fields_block.heading">{professionalBasis.heading}</h3>
          </div>
          <div className={styles.basisSummary}>
            <BookOpenCheck aria-hidden="true" size={20} strokeWidth={1.75} />
            <p>
              {professionalBasis.rows.map((row, index) => (
                <span
                  key={row.label}
                  title={row.value}
                  data-career-api-field={`onet_structured_fields_block.rows[${index}].label`}
                >
                  {row.label}
                </span>
              ))}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
