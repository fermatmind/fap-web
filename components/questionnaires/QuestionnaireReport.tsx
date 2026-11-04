import { QuestionnairePaletteSwatches } from "./QuestionnairePaletteSwatches";
import type { QuestionnaireProfile } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";
import { ResultReadingNav, ResultSection } from "./QuestionnaireResultPresentation";
import styles from "./QuestionnaireResultPresentation.module.css";

export type QuestionnaireReportPresentationProps = {
  profile: QuestionnaireProfile; locale: Locale; headingLevel?: 2 | 3 | 4; idPrefix?: string;
  /** Hide only introductory copy already rendered by the caller. Full sections remain intact. */
  showHeadline?: boolean; showSummary?: boolean; navigation?: boolean;
};

export function QuestionnaireReport({ profile, locale, headingLevel = 3, idPrefix = "report", showHeadline = true, showSummary = true, navigation = false }: QuestionnaireReportPresentationProps) {
  const headline = profile.headline[locale], summary = profile.summary[locale], scoreReading = profile.scoreReading[locale];
  // Some source editions deliberately include the summary in a named reading section.
  // Keep those section bytes and anchors intact, and avoid repeating it in the introduction.
  const summaryInSections = profile.sections.some(section => section.paragraphs.some(paragraph => paragraph[locale] === summary));
  const headlineVisible = showHeadline && headline !== summary;
  const summaryVisible = showSummary && !summaryInSections;
  const scoreReadingVisible = scoreReading !== summary && scoreReading !== headline;
  return <article className={styles.reading}>
    {(headlineVisible || summaryVisible) && <header className={styles.intro}>
      {headlineVisible && <p className={styles.headline}>{headline}</p>}
      {summaryVisible && <p className={styles.summary}>{summary}</p>}
    </header>}
    {profile.paletteSwatches && <div><p className="font-semibold">{locale === "zh" ? "本组原创示例色" : "Original colour examples in this palette"}</p><QuestionnairePaletteSwatches swatches={profile.paletteSwatches} locale={locale} /></div>}
    {scoreReadingVisible && <p className={styles.scoreReading}>{scoreReading}</p>}
    {navigation && profile.sections.length > 2 && <ResultReadingNav collapsible label={locale === "zh" ? "结果解读目录" : "Result reading contents"} sections={profile.sections.map(section => ({ id: `${idPrefix}-${section.id}`, title: section.title[locale] }))} />}
    {profile.sections.map(section => <ResultSection id={`${idPrefix}-${section.id}`} key={section.id} title={section.title[locale]} headingLevel={headingLevel} tone={["limits", "scope", "boundary", "source", "source-method", "edition"].includes(section.id) ? "muted" : "default"}>
      <div className={styles.paragraphs}>{section.paragraphs.map((line, index) => <p key={index}>{line[locale]}</p>)}</div>
    </ResultSection>)}
  </article>;
}
