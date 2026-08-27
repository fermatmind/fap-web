import visual from "@/components/career/display/CareerProductionVisual.module.css";
import type { CareerPublishedValue } from "@/lib/career/publishedComponentContract";

type PublishedRecord = Record<string, CareerPublishedValue>;

function asRecord(value: CareerPublishedValue): PublishedRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value : {};
}

function asString(value: CareerPublishedValue | undefined): string {
  return typeof value === "string" ? value : "";
}

export function CareerDossierQuickDecisionAnswer({ value }: { value: CareerPublishedValue }) {
  const decision = asRecord(value);

  return (
    <section
      className={visual.quickDecisionAnswer}
      data-testid="career-published-fermat_decision_card"
      data-career-api-component="fermat_decision_card"
    >
      <h3 className={visual.quickDecisionQuestion} data-career-api-field="fermat_decision_card.title">
        {asString(decision.title)}
      </h3>
      <div className={visual.quickDecisionLead}>
        <p className={visual.quickDecisionLeadAnswer} data-career-api-field="fermat_decision_card.summary">
          {asString(decision.summary)}
        </p>
      </div>
    </section>
  );
}

export function CareerDossierFitDecision({
  value,
  locale,
  subjectTitle,
}: {
  value: CareerPublishedValue;
  locale: "zh" | "en";
  subjectTitle: string;
}) {
  const decision = asRecord(value);
  const sections = [
    {
      key: "suit",
      number: "01",
      title: locale === "zh" ? `什么样的人更可能适合${subjectTitle}？` : `Who is more likely to fit ${subjectTitle}?`,
      tone: visual.quickDecisionItemFit,
    },
    {
      key: "boundary",
      number: "02",
      title: locale === "zh" ? `什么情况下需要慎重选择${subjectTitle}？` : `When should you be cautious about choosing ${subjectTitle}?`,
      tone: visual.quickDecisionItemCaution,
    },
    {
      key: "how",
      number: "03",
      title: locale === "zh" ? `如何用一次小实验判断自己是否适合${subjectTitle}？` : `How can a small experiment test your fit for ${subjectTitle}?`,
      tone: visual.quickDecisionItemExperiment,
    },
  ] as const;

  return (
    <section
      className={visual.quickDecisionEditorial}
      data-testid="fit-decision-checklist"
      data-career-api-component="fit_decision_checklist"
    >
      <div data-testid="career-published-fit_decision_checklist">
        {sections.map((section) => {
          const headingId = `career-fit-decision-${section.key}`;
          return (
            <section
              key={section.key}
              className={`${visual.quickDecisionItem} ${section.tone}`}
              aria-labelledby={headingId}
            >
              <span className={visual.quickDecisionNumber} aria-hidden="true">{section.number}</span>
              <div className={visual.quickDecisionItemBody}>
                <h3 id={headingId} className={visual.quickDecisionItemTitle}>{section.title}</h3>
                <p data-career-api-field={`fit_decision_checklist.${section.key}`}>
                  {asString(decision[section.key])}
                </p>
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
