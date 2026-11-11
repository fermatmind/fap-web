import { ObservationChoiceCounts } from "./ObservationChoiceCounts";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import Link from "next/link";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { communicationRoutinesCategories, type CommunicationRoutinesRecord } from "@/lib/questionnaires/communicationRoutines20";

export function CommunicationRoutinesSupport({ locale, compact = false, copy = text => text }: { locale: Locale; compact?: boolean; copy?: (text: string) => string }) {
  const zh = locale === "zh";
  if (compact) return <aside data-communication-routines-support className="border-l-2 border-amber-300 pl-4 text-sm leading-7 text-slate-700"><p>{zh ? copy("本页不评发展史、医疗需要或紧急程度，不应用来推迟照护或替代已有意见。无需强迫眼神接触、制造感官输入、撤掉支持或演示社交。") : "This page cannot assess developmental history, medical need or urgency and should not delay care or replace existing advice. No forced eye contact, added sensory input, removal of support or social demonstration is required."}</p></aside>;
  return <aside data-communication-routines-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? copy("供成年人回顾过去四周的自身日常情境，不是自闭症筛查、神经类型判定或认知能力测试。五个可重叠主题不作校准维度；正向与困难描述不反向、不合分。无机会、回忆不清或保留回答可选未计分，不变成没有注意到。视觉辅助使用不等于视觉空间能力或内在意象。") : "For adults recalling their own everyday situations over the past four weeks, not an autism screen, neurotype classification or cognitive-ability test. Five overlapping topics are not calibrated dimensions. Positive and difficult descriptions are not reversed or combined. No opportunity, unclear recall and withholding can remain unscored rather than becoming did not notice. Use of visual aids is not visual-spatial ability or internal imagery."}</p>
    <p>{zh ? copy("可以依据实际需要向合适的专业人士询问支持，无需完成、达到计数或证明身份。本页不评发展史、医疗需要或紧急程度，不应用来推迟照护或替代已有意见。无需强迫眼神接触、制造感官输入、撤掉支持或演示社交。五篇全文始终公开，独立资源保留自身方法，不合成总分；回答只在本页内存。") : "You can discuss actual support needs with an appropriately qualified professional without completing, reaching a count or proving an identity. This page cannot assess developmental history, medical need or urgency and should not delay care or replace existing advice. No forced eye contact, added sensory input, removal of support or social demonstration is required. All five full guides remain public. Separate resources keep their own methods without a combined score; answers stay in this page’s memory only."}</p>
  </aside>;
}
export function CommunicationRoutinesReport({ quiz, records, locale, readingProfiles, displayLocale = locale, copy = text => text }: { quiz: Questionnaire; readingProfiles?: readonly QuestionnaireProfile[]; records: CommunicationRoutinesRecord[]; locale: Locale; displayLocale?: DisplayLocale; copy?: (text: string) => string }) {
  const zh = locale === "zh";
  return <section data-communication-routines-result className="min-w-0 space-y-7 [overflow-wrap:anywhere]" aria-labelledby="communication-routines-result-heading">
    <h2 id="communication-routines-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <section className="rounded-xl bg-sky-50/65 p-4 sm:p-6" aria-labelledby="communication-context-reading">
      <h3 id="communication-context-reading" className="text-xl font-semibold text-sky-950">{zh ? copy("选一类交流或日常安排") : "Choose a communication or routine context"}</h3>
      <p className="mt-3 max-w-prose leading-7">{zh ? copy("同一个人在不同安排里可能有不同体验。先看本次选过的类别和对应题目数，再进入具体情境。") : "The same person can have different experiences in different arrangements. Review the category counts, then open a particular context."}</p>
      <ul className="mt-4 grid gap-x-5 md:grid-cols-2 xl:grid-cols-3">{records.map((record, index) => <li key={record.id} className="min-w-0 border-t border-sky-200 py-3">
        <a className="inline-flex min-h-11 items-center font-semibold text-sky-950 underline underline-offset-4" href={`#communication-routines-record-${record.id}`}>{quiz.directions[index].title[locale]}</a>
        <ObservationChoiceCounts copy={copy} categories={communicationRoutinesCategories} counts={record.counts} locale={locale} shortLabels={{ na: { zh: "未计分", en: "Unscored" } }} />
      </li>)}</ul>
    </section>
    <CommunicationRoutinesSupport locale={locale} copy={copy} compact />
    {records.map((r, i) => {
      const original = quiz.profiles[i];
      const profile = readingProfiles?.find(item => item.id === original.id && item.directionIds.length === original.directionIds.length && item.directionIds.every((id, index) => id === original.directionIds[index]) && item.resultReading?.quizSlug === quiz.slug && item.resultReading.profileId === original.id) ?? original;
      const previewSectionIds = ["section-3"] as const;
      return <section id={`communication-routines-record-${r.id}`} key={r.id} data-communication-routines-theme={r.id} aria-labelledby={`communication-routines-record-title-${r.id}`} className="scroll-mt-24 border-b border-slate-200 pb-8 last:border-b-0">
      <h3 id={`communication-routines-record-title-${r.id}`} className="mb-5 text-xl font-semibold leading-8 text-slate-950">{quiz.directions[i].title[locale]}</h3>
      <p data-communication-routines-topic-summary className="text-base leading-8 text-slate-700">{original.summary[locale]}</p>
      <p data-communication-routines-choice-pattern className="my-4 text-sm leading-7 text-slate-600">{communicationRoutinesCategories.filter(category => r.counts[category.id] > 0).map(category => `${copy(category.label[locale])} ${r.counts[category.id]}${zh ? copy("条") : " statements"}`).join(zh ? copy("；") : "; ")}</p>
      {r.counts.na === 4 && <p data-communication-routines-unscored className="mb-4 leading-7">{zh ? copy("这四条全部未计分，不代表没有困难或不需要支持。") : "All four are unscored; this does not mean no difficulty or no need for support."}</p>}
      <div id={`communication-routines-public-${r.id}`} data-communication-routines-full-reading className="scroll-mt-24">
        <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} traditional={displayLocale === "zh-TW"} headingLevel={4} idPrefix={`communication-routines-result-reading-${profile.id}`} mode="result" previewSectionIds={previewSectionIds} showHeadline={false} showSummary={false} />
      </div>
      <details className="my-5 border-t border-slate-200 pt-3"><summary className="min-h-11 cursor-pointer py-2 font-semibold underline">{zh ? copy(`查看这${r.observations.length}条回答与类别记录`) : `Review these ${r.observations.length} responses and categories`}</summary>
      <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2">{communicationRoutinesCategories.map(c => <div key={c.id} className="flex items-start justify-between gap-4 border-b border-slate-100 py-3"><dt className="min-w-0">{c.id === "na" ? (zh ? copy("未计分：没有机会／无法回想／保留回答") : "Unscored: no opportunity / unclear recall / withheld") : copy(c.label[locale])}</dt><dd data-communication-routines-count={`${r.id}-${c.id}`} className="shrink-0 text-lg font-semibold tabular-nums text-slate-900">{r.counts[c.id]} / 4</dd></div>)}</dl>
      <h4 className="mb-4 mt-7 font-semibold text-slate-700">{zh ? copy("逐条观察与所选类别") : "Individual observations and selected categories"}</h4>
      <ul className="space-y-4 border-l-2 border-slate-200 pl-4 text-sm leading-7 sm:pl-5">{r.observations.map(o => <li key={o.questionId} data-communication-routines-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{o.category === "na" ? (zh ? copy("未计分") : "Unscored") : copy(communicationRoutinesCategories.find(c => c.id === o.category)!.label[locale])}</p></li>)}</ul>
      </details>
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(displayLocale, quiz.slug, original.id)}>{zh ? copy("单独打开这篇公开指南") : "Open this public guide separately"}</Link>
    </section>; })}
    <details className="border-t border-slate-200 pt-4"><summary className="min-h-11 cursor-pointer py-2 font-semibold underline">{zh ? copy("计数方法、使用范围与支持说明") : "Counting method, scope and support"}</summary>
    <p className="leading-7">{zh ? copy("类别只作记录，不作点数。每个主题六种计数合计四条；未计分与有机会时没有注意到分别显示。没有总分、均值、最高项或风险判断。") : "Categories are recorded without points. Each theme’s six counts add to four descriptions; unscored stays separate from did not notice on relevant occasions. There is no total, mean, highest theme or risk judgment."}</p>
      <CommunicationRoutinesSupport locale={locale} copy={copy} />
    </details>
  </section>;
}
