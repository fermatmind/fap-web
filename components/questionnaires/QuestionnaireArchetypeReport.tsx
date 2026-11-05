import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import Link from "next/link";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";
import type { ArchetypeResult } from "@/lib/questionnaires/scoring";
import type { Locale } from "@/lib/i18n/locales";
import styles from "./QuestionnaireResultPresentation.module.css";
import { PortraitResultLead, portraitResultLeadKind } from "./PortraitResultLead";

/** Existing section identities across the original animal, character and symbolic editions. */
function previewSections(profile: QuestionnaireProfile) {
  const ids = new Set(profile.sections.map(section => section.id));
  const pick = (candidates: string[]) => candidates.find(id => ids.has(id));
  return [
    pick(["meaning", "motivation", "lens", "context", "route", "opening", "entrance", "selected", "image", "source-context", "theme", "cues", "what-it-opens", "reading-1", `${profile.id}-1`]),
    pick(["worked-example", "everyday", "example", "examples", "scene", "ordinary-example", "project", "reading-2", `${profile.id}-2`]),
    pick(["observation", "experiment", "optional-try", "try", "play", "next", "optional-check", "reading-5", `${profile.id}-5`]),
  ].filter((id): id is string => Boolean(id));
}

export function QuestionnaireArchetypeReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<ArchetypeResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh";
  const lead = portraitResultLeadKind(quiz.slug);
  return <div className={styles.profileReadings} data-profile-category={quiz.category}>
    {result.profileIds.length > 1 && <p className="leading-7">{zh ? `本次保留${result.profileIds.length}项并列匹配，可以分别阅读；顺序不代表主次。` : `All ${result.profileIds.length} tied matches are kept. Read each in turn; their order does not imply priority.`}</p>}
    {result.profileIds.map(id => {
      const profile = quiz.profiles.find(p => p.id === id)!;
      const titleId = `animal-title-${id}`;
      return <section key={id} aria-labelledby={titleId} data-archetype-match={id} className={styles.profileChapter}>
        {lead ? <PortraitResultLead kind={lead} quiz={quiz} profile={profile} result={result} locale={locale} titleId={titleId} /> : <header>
          <h3 id={titleId} className="scroll-mt-24 text-2xl font-semibold leading-snug">{profile.title[locale]}</h3>
          <p className={styles.summary}>{profile.summary[locale]}</p>
        </header>}
        <div className={styles.profileBody}>
          <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${id}`} mode="result" showHeadline={false} showSummary={false} previewSectionIds={previewSections(profile)} />
          <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, id)}>{zh ? "单独阅读这项结果的完整指南" : "Read this result’s full guide separately"}</Link>
        </div>
      </section>;
    })}
    <details className="border-t border-slate-200 pt-4" data-archetype-counts-details>
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? "为什么得到这些结果？查看全部选择次数" : "Why these results? View all choice counts"}</summary>
      <section className="mt-4" aria-label={zh ? "本次选择次数" : "Choice counts for this attempt"}>
        <h3 className="text-xl font-semibold">{zh ? "全部结果的本次计数" : "Your counts for every result"}</h3>
        <dl className="mt-4 space-y-3">{quiz.directions.map(direction => <div key={direction.id} className="flex justify-between gap-4" data-archetype-count={direction.id}><dt>{direction.title[locale]}</dt><dd>{result.counts[direction.id]} / {direction.comparisons}</dd></div>)}</dl>
        <p className="mt-4 text-sm leading-7">{zh ? "分母是这一类选项出现的次数，不是相似度百分比。所有最高计数都保留；差1次不代表已经验证的显著差异、固定主次型或人群排名。" : "The denominator is how often that result’s options appeared, not a match percentage. Every highest count is kept. One extra choice is not an established significant difference, a fixed primary or secondary type, or a population rank."}</p>
      </section>
    </details>
  </div>;
}
