import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import Link from "next/link";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";
import type { ArchetypeResult } from "@/lib/questionnaires/scoring";
import type { Locale } from "@/lib/i18n/locales";
import styles from "./QuestionnaireResultPresentation.module.css";
import { PortraitResultLead, portraitResultLeadKind } from "./PortraitResultLead";
import { EdgerunnersPortrait } from "./EdgerunnersPortrait";

const comparisonFirst = new Set(["cyberpunk-edgerunners", "chiikawa", "south-park", "space-marine-chapter", "dexter", "dungeons-dragons-class", "blue-lock", "naruto-character", "gilmore-girls", "philosopher-personality-test"]);
const chartAfterLead = new Set(["anime-character-archetype-test", "spirit-animal", "tsundere-dere-type"]);
const chartAfterReading = new Set(["aura-color", "which-tarot-card-are-you"]);

function ChoiceRadar({ quiz, result }: { quiz: Questionnaire; result: Extract<ArchetypeResult, { status: "complete" }> }) {
  const point = (i: number, ratio: number) => {
    const a = (i * 2 * Math.PI / quiz.directions.length) - Math.PI / 2;
    return [100 + 81 * ratio * Math.cos(a), 100 + 81 * ratio * Math.sin(a)].join(",");
  };
  return <svg viewBox="0 0 200 200" className={styles.choiceRadar} aria-hidden="true">
    {[0.25, 0.5, 0.75, 1].map(ratio => <polygon key={ratio} points={quiz.directions.map((_, i) => point(i, ratio)).join(" ")} />)}
    {quiz.directions.map(({ id }, i) => <polyline key={id} points={`100,100 ${point(i, 1)}`} />)}
    <polygon data-choice-radar-shape points={quiz.directions.map((d, i) => point(i, d.comparisons ? result.counts[d.id] / d.comparisons : 0)).join(" ")} />
    {quiz.directions.map(({ id }, i) => {
      const [x, y] = point(i, 1.13).split(",");
      return <text key={id} x={x} y={y} textAnchor="middle" dominantBaseline="central">{i + 1}</text>;
    })}
  </svg>;
}

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

export function QuestionnaireArchetypeReport({ quiz, result, locale, sampleId }: { quiz: Questionnaire; result: Extract<ArchetypeResult, { status: "complete" }>; locale: Locale; sampleId?: string }) {
  const zh = locale === "zh";
  const lead = portraitResultLeadKind(quiz.slug);
  const edgerunners = quiz.slug === "cyberpunk-edgerunners";
  const placement = edgerunners && result.profileIds.length === 1 ? "between" :
    comparisonFirst.has(quiz.slug) ? "before" : chartAfterLead.has(quiz.slug) ? "between" : chartAfterReading.has(quiz.slug) ? "after" : undefined;
  const matched = result.profileIds.map(id => quiz.profiles.find(p => p.id === id)!);
  const leadingDirections = new Set(matched.flatMap(profile => profile.directionIds));
  const showRadar = edgerunners || placement === "before" || quiz.slug === "anime-character-archetype-test";
  const countsId = sampleId ? `${sampleId}-counts` : "choice-counts";
  const CountHeading = sampleId ? "h4" : "h3";
  const chart = <section className={styles.choiceChart} id={countsId} aria-labelledby={`${countsId}-title`}>
    <CountHeading id={`${countsId}-title`}>{sampleId ? (zh ? "示例选择次数" : "Sample choice counts") : (zh ? "本次选择次数" : "Choice counts for this attempt")}</CountHeading>
    <div className={showRadar && !sampleId ? styles.choiceRadarLayout : undefined}>
      {showRadar && !sampleId && <ChoiceRadar quiz={quiz} result={result} />}
      <dl className={styles.choiceRows}>{quiz.directions.map((direction, index) => <div key={direction.id} className={styles.choiceRow} data-archetype-count={direction.id} data-matched={leadingDirections.has(direction.id) || undefined}>
        <dt>{showRadar && !sampleId && <span className={styles.choiceIndex} aria-hidden="true">{index + 1}</span>}{direction.title[locale]}</dt><dd>{result.counts[direction.id]} / {direction.comparisons}</dd>
        {placement && typeof direction.comparisons === "number" && direction.comparisons > 0 && <dd aria-hidden="true" className={styles.choiceTrack}>
          <div style={{ width: `${result.counts[direction.id] / direction.comparisons * 100}%` }} />
        </dd>}
      </div>)}</dl>
    </div>
    <p className="text-sm leading-6">{zh ? "分母是这一类选项出现的次数。所有最高计数都保留。计数占比不是相似度，也不是人群排名。" : "The denominator is how often those options appeared. Every highest count is kept. The fraction chosen is neither a similarity score nor a population rank."}</p>
  </section>;
  if (sampleId) return <div className="space-y-4">
    <ul className="space-y-2">
      {matched.map(profile => <li key={profile.id}>
        <Link prefetch={false} href={questionnaireGuidePath(locale, quiz.slug, profile.id)} className="flex min-h-11 items-center gap-3 font-semibold underline underline-offset-4">
          <EdgerunnersPortrait id={profile.id} className="size-12 shrink-0 rounded-lg" />
          {profile.title[locale]}
        </Link>
      </li>)}
    </ul>
    <details>
      <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold">{zh ? "查看七项选择次数" : "See all seven choice counts"}</summary>
      {chart}
    </details>
  </div>;
  const counts = placement === "before" || placement === "between" ? chart :
    <details className="border-t border-slate-200 pt-4" data-archetype-counts-details>
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{placement
        ? (zh ? "查看全部选择次数" : "View all choice counts")
        : (zh ? "为什么得到这些结果？查看全部选择次数" : "Why these results? View all choice counts")}</summary>
      {placement ? chart : <section className="mt-4" aria-label={zh ? "本次选择次数" : "Choice counts for this attempt"}>
        <h3 className="text-xl font-semibold">{zh ? "全部结果的本次计数" : "Your counts for every result"}</h3>
        <dl className="mt-4 space-y-3">{quiz.directions.map(direction => <div key={direction.id} className="flex justify-between gap-4" data-archetype-count={direction.id}>
          <dt>{direction.title[locale]}</dt><dd>{result.counts[direction.id]} / {direction.comparisons}</dd>
        </div>)}</dl>
        <p className="mt-4 text-sm leading-7">{zh ? "分母是这一类选项出现的次数，不是相似度百分比。所有最高计数都保留；差1次不代表已经验证的显著差异、固定主次型或人群排名。" : "The denominator is how often that result’s options appeared, not a match percentage. Every highest count is kept. One extra choice is not an established significant difference, a fixed primary or secondary type, or a population rank."}</p>
      </section>}
    </details>;
  return <div className={styles.profileReadings} data-profile-category={quiz.category} data-choice-chart-placement={placement}>
    {result.profileIds.length > 1 && <p className="leading-7">{zh ? `本次保留${result.profileIds.length}项并列匹配，可以分别阅读；顺序不代表主次。` : `All ${result.profileIds.length} tied matches are kept. Read each in turn; their order does not imply priority.`}</p>}
    {placement && matched.length > 1 && <nav className={styles.matchNav} aria-label={zh ? "跳到匹配结果" : "Jump to a match"}>
      {matched.map(profile => <a key={profile.id} href={`#animal-title-${profile.id}`}>
        {edgerunners && <EdgerunnersPortrait id={profile.id} className="mr-2 inline-block size-8 rounded-md align-middle" />}
        {profile.title[locale]}
      </a>)}
    </nav>}
    {placement === "before" && counts}
    {matched.map((profile, index) => {
      const id = profile.id;
      const titleId = `animal-title-${id}`;
      return <section key={id} aria-labelledby={titleId} data-archetype-match={id} className={styles.profileChapter}>
        {lead ? <PortraitResultLead kind={lead} quiz={quiz} profile={profile} result={result} locale={locale} titleId={titleId} /> : <header>
          <h3 id={titleId} className="scroll-mt-24 text-2xl font-semibold leading-snug">{profile.title[locale]}</h3>
          <p className={styles.summary}>{profile.summary[locale]}</p>
        </header>}
        {placement === "between" && index === 0 && counts}
        <div className={styles.profileBody}>
          <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${id}`} mode="result" showHeadline={false} showSummary={false} previewSectionIds={previewSections(profile)} />
          <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, id)}>{zh ? "单独阅读这项结果的完整指南" : "Read this result’s full guide separately"}</Link>
        </div>
      </section>;
    })}
    {(!placement || placement === "after") && counts}
  </div>;
}
