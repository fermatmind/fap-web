import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { ArchetypeResult } from "@/lib/questionnaires/scoring";
import { philosopherPresentations } from "@/lib/questionnaires/philosopherPresentation";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { PhilosopherPortrait } from "./PhilosopherPortrait";
import { PhilosopherShareCard } from "./PhilosopherShareCard";

type Complete = Extract<ArchetypeResult, { status: "complete" }>;
export function PhilosopherReport({ quiz, result, locale }: { quiz: Questionnaire; result: Complete; locale: Locale }) {
  const zh = locale === "zh";
  const matched = quiz.profiles.filter(profile => result.profileIds.includes(profile.id));
  const tied = matched.length > 1;
  return <div className="space-y-8" data-philosopher-report>
    <section className="space-y-5" aria-label={zh ? "本次哲学家揭晓" : "Your philosopher reveal"}>
      <p className="text-sm font-semibold uppercase tracking-wide text-amber-900">{zh ? "18道日常选择 · 你的思考起点" : "18 everyday choices · Your starting points"}</p>
      <p className="text-lg leading-8">{tied ? (zh ? `这次有${matched.length}位哲学家的阅读入口并列最高。全部保留，顺序不代表主次。` : `${matched.length} philosopher reading paths share the highest count. All are kept; their order does not imply priority.`) : (zh ? "这次可以从这位哲学家的问题开始读。" : "Start with this philosopher’s questions this time.")}</p>
      {tied && <nav aria-label={zh ? "本次全部最高人物" : "Every highest-count philosopher"} className="grid grid-cols-3 gap-2">
        {matched.map(profile => <a key={profile.id} href={`#philosopher-reveal-${profile.id}`} className="flex min-h-11 items-center rounded-lg border border-amber-200 bg-white px-2 py-2 text-sm font-semibold underline underline-offset-4">{philosopherPresentations[profile.id].name[locale]}</a>)}
      </nav>}
      <div className={tied ? "grid items-start gap-4 sm:grid-cols-2" : ""}>
        {matched.map(profile => {
          const person = philosopherPresentations[profile.id];
          return <article key={profile.id} id={`philosopher-reveal-${profile.id}`} data-philosopher-reveal={profile.id} className={`overflow-hidden rounded-xl border border-amber-200 bg-[#f7f2e7] ${tied ? "p-4" : "grid gap-5 p-5 sm:grid-cols-[12rem_minmax(0,1fr)] sm:p-6"}`}>
            <PhilosopherPortrait id={profile.id} locale={locale} eager={profile.id === matched[0].id} className={tied ? "float-left mr-4 h-28 w-24 rounded-lg object-cover" : "mx-auto h-48 w-40 rounded-lg object-cover sm:h-auto sm:w-full"} />
            <div className="space-y-3">
              <h3 className="text-2xl font-semibold leading-tight sm:text-3xl">{person.name[locale]}</h3>
              <p className="text-lg font-semibold leading-7" style={{ color: person.accent }}>{person.conclusion[locale]}</p>
              <p className="clear-both text-sm leading-7 text-slate-700">{person.reason[locale]}</p>
              <p className="text-sm font-semibold">{zh ? `本次选中这组理由 ${result.counts[profile.id]} 次（共出现8次）` : `You chose this group ${result.counts[profile.id]} times across 8 appearances`}</p>
              <a href={`#animal-title-${profile.id}`} className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4">{zh ? "看看原典中的问题" : "Explore the question in its text"}</a>
            </div>
          </article>;
        })}
      </div>
      <p className="text-sm leading-7 text-slate-600">{zh ? "这是本次选择对应的阅读联想，不是历史人物性格鉴定。插画是原创人物意象，并非经核实的历史容貌。" : "A reading association from these choices, not a historical personality assessment. The original illustrations are imagined, not verified historical likenesses."}</p>
    </section>
    <PhilosopherShareCard ids={matched.map(profile => profile.id)} locale={locale} />
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5" aria-labelledby="philosopher-counts">
      <h3 id="philosopher-counts" className="text-xl font-semibold">{zh ? "为什么出现这些人物？" : "Why these philosophers?"}</h3>
      <p className="leading-7">{zh ? "每次选择为对应阅读入口加1次；18题合计18。以下展示全部九项，保留每个最高计数。" : "Each choice adds one to its reading path, for 18 choices in total. Here are all nine counts; every highest count is kept."}</p>
      <dl className="space-y-3">{quiz.directions.map(direction => <div key={direction.id} data-archetype-count={direction.id} className="flex items-start justify-between gap-4 border-b border-slate-100 pb-2">
        <dt>{philosopherPresentations[direction.id].name[locale]}{result.profileIds.includes(direction.id) && <span className="ml-2 text-sm font-semibold text-amber-900">{zh ? "最高" : "Highest"}</span>}</dt><dd className="shrink-0 font-semibold tabular-nums">{result.counts[direction.id]} / {direction.comparisons}</dd>
      </div>)}</dl>
      <p className="text-sm leading-7 text-slate-600">{zh ? "8是每个方向的出现次数，分数不是人物相似度、学说认同比例或人群排名。差1次不证明稳定类型。" : "Eight is the number of appearances, not resemblance, philosophical agreement or population rank. A one-choice gap does not establish a stable type."}</p>
    </section>
    <nav aria-label={zh ? "跳到匹配结果" : "Jump to a match"} className="flex flex-wrap gap-x-5 gap-y-2">{matched.map(profile => <a key={profile.id} href={`#animal-title-${profile.id}`} className="inline-flex min-h-11 items-center underline underline-offset-4">{philosopherPresentations[profile.id].name[locale]}</a>)}</nav>
    {matched.map(profile => <section key={profile.id} data-archetype-match={profile.id} className="space-y-5 border-t border-slate-200 pt-6">
      <h3 id={`animal-title-${profile.id}`} className="scroll-mt-24 text-2xl font-semibold">{profile.title[locale]}</h3>
      <p className="leading-8 text-slate-700">{profile.summary[locale]}</p>
      <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} mode="result" showHeadline={false} showSummary={false} previewSectionIds={["source-context", "example", "optional-try"]} />
      <Link prefetch={false} className="inline-flex min-h-11 items-center underline underline-offset-4" href={questionnaireGuidePath(locale, quiz.slug, profile.id)} target="_blank" rel="noopener">{zh ? "单独阅读这项结果的完整指南（新标签页）" : "Read this result’s full guide separately (new tab)"}</Link>
    </section>)}
  </div>;
}
