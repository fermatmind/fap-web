import Link from "next/link";
import visual from "@/components/career/display/CareerProductionVisual.module.css";
import type { CareerPublishedFitDecisionCenter } from "@/lib/career/publishedComponentContract";

type RiasecFit = {
  fit_interest: string;
  interest: string;
  riasec: string;
  riasec_short: string;
};

type Props = {
  value: CareerPublishedFitDecisionCenter;
  riasec: RiasecFit;
  locale: "en" | "zh";
  sectionLabel: string;
  sectionLabelId: string;
};

type AssessmentId = CareerPublishedFitDecisionCenter["assessments"][number]["id"];

function AssessmentGlyph({ id }: { id: AssessmentId }) {
  const commonProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.7,
  };

  const glyph = (() => {
    switch (id) {
      case "riasec":
        return (
          <svg {...commonProps}>
            <circle cx="12" cy="12" r="8.25" />
            <path d="m15.7 8.3-2.3 5.1-5.1 2.3 2.3-5.1 5.1-2.3Z" />
            <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
          </svg>
        );
      case "big-five":
        return (
          <svg {...commonProps}>
            <path d="m12 3.7 2.45 5.05 5.55.78-4.02 3.91.95 5.52L12 16.35l-4.93 2.61.95-5.52L4 9.53l5.55-.78L12 3.7Z" />
            <circle cx="12" cy="12" r="2.15" />
          </svg>
        );
      case "mbti":
        return (
          <svg {...commonProps}>
            <rect x="4" y="4" width="6.25" height="6.25" rx="1.5" />
            <rect x="13.75" y="4" width="6.25" height="6.25" rx="1.5" />
            <rect x="4" y="13.75" width="6.25" height="6.25" rx="1.5" />
            <rect x="13.75" y="13.75" width="6.25" height="6.25" rx="1.5" />
          </svg>
        );
      case "enneagram":
        return (
          <svg {...commonProps}>
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 3.5 16.25 19.35 4.64 9.05h14.72L7.75 19.35 12 3.5Z" />
          </svg>
        );
      case "iq":
        return (
          <svg {...commonProps}>
            <circle cx="6" cy="7" r="2" />
            <circle cx="18" cy="6" r="2" />
            <circle cx="12" cy="18" r="2" />
            <path d="m7.75 8 3.15 7.9M16.4 7.2l-3.3 8.7M8 6.8l8-.6" />
          </svg>
        );
      case "eq":
        return (
          <svg {...commonProps}>
            <path d="M20 8.35c0 5-8 10.15-8 10.15S4 13.35 4 8.35A4.1 4.1 0 0 1 11.1 5.5L12 6.4l.9-.9A4.1 4.1 0 0 1 20 8.35Z" />
            <path d="M7.25 11h2.2l1.15-2.2 2.1 4.4 1.1-2.2h2.95" />
          </svg>
        );
    }
  })();

  return (
    <span
      className={visual.fitAssessmentIcon}
      data-fit-assessment-icon={id}
      aria-hidden="true"
    >
      <span className={visual.fitAssessmentIconHalo} />
      {glyph}
    </span>
  );
}

function apiField(path: string) {
  return { "data-career-api-field": path };
}

export function supportsCareerDossierFitCenter(value: unknown): value is CareerPublishedFitDecisionCenter {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const candidate = value as Partial<CareerPublishedFitDecisionCenter>;
  return candidate.schema_version === "career.fit_decision_center.v1" &&
    typeof candidate.heading === "string" &&
    typeof candidate.direct_answer === "string" &&
    Array.isArray(candidate.signals) && candidate.signals.length === 3 &&
    Array.isArray(candidate.assessments) && candidate.assessments.length === 6 &&
    Array.isArray(candidate.directions) && candidate.directions.length === 6 &&
    Array.isArray(candidate.questions) && candidate.questions.length >= 8 &&
    Array.isArray(candidate.source_links) && candidate.source_links.length >= 4;
}

export function CareerDossierFitCenter({ value, riasec, locale, sectionLabel, sectionLabelId }: Props) {
  const isZh = locale === "zh";

  return (
    <div className={visual.fitCenter} data-testid="career-dossier-fit-center" data-career-api-component="personality_fit_block">
      <header className={visual.fitCenterHero}>
        <div className={visual.fitCenterTitleRow}>
          <p id={sectionLabelId}>{sectionLabel}</p>
          <span aria-hidden="true" />
        </div>
        <h2 className={visual.fitCenterTitle} {...apiField("personality_fit_block.heading")}>{value.heading}</h2>
        <p className={visual.fitCenterAnswer} {...apiField("personality_fit_block.direct_answer")}>{value.direct_answer}</p>
      </header>

      <section className={visual.fitCenterSection} aria-labelledby="career-fit-assessments-title">
        <div className={visual.fitCenterSectionHeading}>
          <div>
            <h3 id="career-fit-assessments-title">{isZh ? "不要用一个测试替你决定职业" : "Do not let one test decide your career"}</h3>
          </div>
        </div>

        <aside className={visual.fitRiasecEvidence} data-career-api-component="riasec_fit_block" data-career-riasec-role="official-baseline">
          <header className={visual.fitRiasecEvidenceHeader}>
            <span className={visual.fitRiasecCode} {...apiField("riasec_fit_block.riasec")}>{riasec.riasec}</span>
            <div>
              <p>{isZh ? "O*NET 职业兴趣基线" : "O*NET occupational interest baseline"}</p>
              <strong {...apiField("riasec_fit_block.riasec_short")}>{riasec.riasec_short}</strong>
            </div>
          </header>
          <div className={visual.fitRiasecEvidenceDetails}>
            <article>
              <h4>{isZh ? "这类工作的兴趣体验" : "What can feel rewarding in this work"}</h4>
              <p {...apiField("riasec_fit_block.interest")}>{riasec.interest}</p>
            </article>
            <article>
              <h4>{isZh ? "怎样理解 CEI" : "How to interpret CEI"}</h4>
              <p {...apiField("riasec_fit_block.fit_interest")}>{riasec.fit_interest}</p>
            </article>
          </div>
        </aside>

        <div className={visual.fitAssessmentGrid} data-career-api-list="personality_fit_block.assessments">
          {value.assessments.map((assessment, index) => (
            <article key={assessment.id} className={visual.fitAssessmentCard} data-fit-assessment={assessment.id}>
              <div className={visual.fitAssessmentHeader}>
                <AssessmentGlyph id={assessment.id} />
                <div>
                  <h4 {...apiField(`personality_fit_block.assessments[${index}].label`)}>{assessment.label}</h4>
                  <span {...apiField(`personality_fit_block.assessments[${index}].evidence_level`)}>{assessment.evidence_level}</span>
                </div>
              </div>
              <p className={visual.fitAssessmentQuestion} {...apiField(`personality_fit_block.assessments[${index}].question`)}>{assessment.question}</p>
              <p className={visual.fitAssessmentAnswer} {...apiField(`personality_fit_block.assessments[${index}].answer`)}>{assessment.answer}</p>
              <ul data-career-api-list={`personality_fit_block.assessments[${index}].signals`}>
                {assessment.signals.map((signal, signalIndex) => (
                  <li key={signal} {...apiField(`personality_fit_block.assessments[${index}].signals[${signalIndex}]`)}>{signal}</li>
                ))}
              </ul>
              <p className={visual.fitAssessmentWatchout} {...apiField(`personality_fit_block.assessments[${index}].watchout`)}>
                <strong>{isZh ? "别这样用：" : "Do not use it this way: "}</strong>{assessment.watchout}
              </p>
              <Link
                href={assessment.cta_href}
                className={visual.fitAssessmentCta}
                data-career-api-field={`personality_fit_block.assessments[${index}].cta_label`}
                data-career-api-href={assessment.cta_href}
              >
                {assessment.cta_label}<span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>

      </section>

      <section className={visual.fitCenterSection} aria-labelledby="career-fit-directions-title">
        <div className={visual.fitCenterSectionHeading}>
          <div>
            <h3 id="career-fit-directions-title">{isZh ? "你更可能适合哪条会计方向？" : "Which accounting direction may fit you better?"}</h3>
          </div>
        </div>
        <div className={visual.fitDirectionGrid} data-career-api-list="personality_fit_block.directions">
          {value.directions.map((direction, index) => {
            const cardContent = (
              <>
              <h4 {...apiField(`personality_fit_block.directions[${index}].direction`)}>{direction.direction}</h4>
              <p><strong>{isZh ? "更匹配：" : "Fits better when: "}</strong><span {...apiField(`personality_fit_block.directions[${index}].fit_signals`)}>{direction.fit_signals}</span></p>
              <p><strong>{isZh ? "注意：" : "Watch for: "}</strong><span {...apiField(`personality_fit_block.directions[${index}].watchouts`)}>{direction.watchouts}</span></p>
              {direction.target ? (
                <span className={visual.fitDirectionTarget} {...apiField(`personality_fit_block.directions[${index}].target.title`)}>
                  {isZh ? "查看相关职业：" : "Explore related career: "}{direction.target.title}<span aria-hidden="true">→</span>
                </span>
              ) : null}
              </>
            );

            return direction.target ? (
              <Link
                key={direction.direction}
                href={direction.target.href}
                className={visual.fitDirectionCard}
                data-career-direction-target={direction.target.slug}
                data-career-api-href={direction.target.href}
              >
                {cardContent}
              </Link>
            ) : (
              <article key={direction.direction} className={visual.fitDirectionCard}>
                {cardContent}
              </article>
            );
          })}
        </div>
      </section>

      <section className={visual.fitCenterSection} aria-labelledby="career-fit-questions-title">
        <div className={visual.fitCenterSectionHeading}>
          <div>
            <h3 id="career-fit-questions-title">{isZh ? "职业适配常见问题" : "Career fit questions"}</h3>
          </div>
        </div>
        <div className={visual.fitQuestionList} data-career-api-list="personality_fit_block.questions">
          {value.questions.map((item, index) => (
            <details key={item.question} className={visual.fitQuestionItem}>
              <summary><span {...apiField(`personality_fit_block.questions[${index}].question`)}>{item.question}</span></summary>
              <p {...apiField(`personality_fit_block.questions[${index}].answer`)}>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className={visual.fitCenterFooter}>
        <p {...apiField("personality_fit_block.boundary")}>{value.boundary}</p>
        <div data-career-api-list="personality_fit_block.source_links">
          {value.source_links.map((source, index) => (
            <a key={source.href} href={source.href} target="_blank" rel="noreferrer" title={source.usage} data-career-api-field={`personality_fit_block.source_links[${index}].label`}>
              {source.label}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
