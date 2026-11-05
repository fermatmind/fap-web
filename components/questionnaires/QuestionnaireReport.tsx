import { QuestionnairePaletteSwatches } from "./QuestionnairePaletteSwatches";
import type { QuestionnaireProfile, QuestionnaireSection } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";
import { ResultReadingNav, ResultSection } from "./QuestionnaireResultPresentation";
import styles from "./QuestionnaireResultPresentation.module.css";

export type QuestionnaireReportPresentationProps = {
  profile: QuestionnaireProfile; locale: Locale; headingLevel?: 2 | 3 | 4; idPrefix?: string;
  /** Hide only introductory copy already rendered by the caller. Full sections remain intact. */
  showHeadline?: boolean; showSummary?: boolean; navigation?: boolean;
  mode?: "guide" | "result";
  /** Exact, reviewed section IDs in display order. No text truncation or title guessing. */
  previewSectionIds?: readonly string[];
};

const contextIds = ["editorial-scene", "context", "example", "examples", "concrete-example", "fictional-example", "scene", "everyday", "ordinary-context", "real-world-scenes", "editorial-character-scene", "dialogue", "editorial-comparison-scene", "editorial-comparison-example", "original-portrait", "meaning"];
const actionIds = ["choice", "editorial-experiment", "experiment", "optional-experiment", "action", "next-step", "private-exercise", "try", "counterbalance-prompts", "observation", "optional-observation", "reflection", "balancing-actions", "next", "practice-review", "editorial-conversation", "share-conversation", "editorial-follow-up"];

export function QuestionnaireReport({ profile, locale, headingLevel = 3, idPrefix = "report", showHeadline = true, showSummary = true, navigation = false, mode = "guide", previewSectionIds }: QuestionnaireReportPresentationProps) {
  const headline = profile.headline[locale], summary = profile.summary[locale], scoreReading = profile.scoreReading[locale];
  // Some source editions deliberately include the summary in a named reading section.
  // Keep those section bytes and anchors intact, and avoid repeating it in the introduction.
  const summaryInSections = profile.sections.some(section => section.paragraphs.some(paragraph => paragraph[locale] === summary));
  const headlineVisible = showHeadline && headline !== summary;
  const summaryVisible = showSummary && (mode === "result" || !summaryInSections);
  const scoreReadingVisible = scoreReading !== summary && scoreReading !== headline;
  const selectedIds = previewSectionIds ?? [
    contextIds.find(id => profile.sections.some(section => section.id === id)),
    actionIds.find(id => profile.sections.some(section => section.id === id)),
  ].filter((id): id is string => Boolean(id));
  const previews = mode === "result" ? [...new Set(selectedIds)].flatMap(id => profile.sections.filter(section => section.id === id)) : [];
  const remaining = profile.sections.filter(section => !previews.includes(section));
  const renderSection = (section: QuestionnaireSection, preview = false) => <ResultSection id={`${idPrefix}-${section.id}`} key={section.id} title={section.title[locale]} headingLevel={headingLevel} tone={!preview && ["limits", "scope", "boundary", "source", "source-method", "edition"].includes(section.id) ? "muted" : "default"}>
    {section.paragraphs.map((line, index) => <p key={index}>{line[locale]}</p>)}
  </ResultSection>;
  const score = scoreReadingVisible ? <p className={styles.scoreReading}>{scoreReading}</p> : null;
  const contents = navigation && profile.sections.length > 2 ? <ResultReadingNav label={locale === "zh" ? "结果解读目录" : "Result reading contents"} sections={(mode === "result" ? remaining : profile.sections).map(section => ({ id: `${idPrefix}-${section.id}`, title: section.title[locale] }))} /> : null;
  return <article className={styles.reading} data-reading-mode={mode} data-preview-count={previews.length > 1 ? previews.length : undefined}>
    {(headlineVisible || summaryVisible) && <header className={styles.intro}>
      {headlineVisible && <p className={styles.headline}>{headline}</p>}
      {summaryVisible && <p className={styles.summary}>{summary}</p>}
    </header>}
    {profile.paletteSwatches && <div><p className="font-semibold">{locale === "zh" ? "本组原创示例色" : "Original colour examples in this palette"}</p><QuestionnairePaletteSwatches swatches={profile.paletteSwatches} locale={locale} /></div>}
    {mode === "result" ? <>
      {previews.map(section => renderSection(section, true))}
      {/* Unmapped editions retain expanded source until their caller supplies reviewed IDs. */}
      <details className={styles.fullReading} open={previews.length === 0}>
        <summary>{locale === "zh" ? "查看完整解释、计分与依据" : "Read the full explanation, scoring and background"}</summary>
        {!showHeadline && <p className={styles.summary}>{headline}</p>}
        {score}{contents}{remaining.map(section => renderSection(section))}
      </details>
    </> : <>{score}{contents}{profile.sections.map(section => renderSection(section))}</>}
  </article>;
}
