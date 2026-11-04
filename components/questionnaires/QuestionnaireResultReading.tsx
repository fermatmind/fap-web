import { QuestionnaireReport, type QuestionnaireReportPresentationProps } from "./QuestionnaireReport";
import styles from "./QuestionnaireResultPresentation.module.css";

export function QuestionnaireResultReading({ quizSlug, profile, locale, headingLevel = 3, idPrefix = "report", showHeadline, showSummary, navigation = true }: QuestionnaireReportPresentationProps & { quizSlug: string }) {
  const candidate = profile.resultReading;
  const reading = candidate?.quizSlug === quizSlug && candidate.profileId === profile.id ? candidate : null;
  const report = <QuestionnaireReport profile={profile} locale={locale} headingLevel={headingLevel} idPrefix={idPrefix} showHeadline={showHeadline} showSummary={showSummary} navigation={navigation} />;
  if (!reading) return report;
  return <div {...{ [`data-${reading.attribute}-result-reading`]: profile.id }}>
    {report}
    {reading.note && <p className="mt-5 text-sm leading-7">{reading.note[locale]}</p>}
    {reading.references && <aside className={styles.references} aria-label={locale === "zh" ? "参考资料" : "References"}><p className={styles.eyebrow}>{locale === "zh" ? "参考资料" : "References"}</p><ul>{reading.references.map(reference => <li key={reference.url}><a className="underline" href={reference.url}>{reference.title[locale]}</a></li>)}</ul></aside>}
  </div>;
}
