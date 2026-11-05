import { ObservationChoiceCounts } from "./ObservationChoiceCounts";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { eatingExperiencesCategories, type EatingExperiencesRecord } from "@/lib/questionnaires/eatingExperiences20";

export function EatingExperiencesSupport({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const zh = locale === "zh";
  if (compact) return <aside data-eating-experiences-support className="border-l-2 border-amber-300 pl-4 text-sm leading-7 text-slate-700"><p>{zh ? "本练习不指派限制进食、代偿、身体检查、称重、食物日记，或改变食物与活动。它不能判定紧急程度或解释身体症状。有即时危险或当前严重症状时，请寻求当地紧急医疗帮助，不要继续靠问卷处理。" : "This exercise prescribes no restriction, compensation, body checking, weighing, food diary or change to food or activity. It cannot decide urgency or explain physical symptoms. For immediate danger or severe current symptoms, seek local emergency medical help rather than continue the questionnaire."}</p></aside>;
  return <aside data-eating-experiences-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "这是成年人原创自述，不是进食障碍筛查或身体评定。支持始终可用，不以完成题目、外表或计数为条件。" : "This original adult self-description is not an eating-disorder screen or body assessment. Support is available without completion, a particular appearance or a count."}</p>
    <p>{zh ? "进食或身体相关顾虑让你难受时，可以向合格医疗专业人士寻求支持，不必完成表单、达到计数或符合某种外表。本练习不指派限制进食、代偿、身体检查、称重、食物日记，或改变食物与活动。它不能判定紧急程度或解释身体症状。有即时危险或当前严重症状时，请寻求当地紧急医疗帮助，不要继续靠问卷处理。" : "If eating or body concerns trouble you, you can seek support from a qualified health professional without finishing this form, a particular count or a particular appearance. This exercise prescribes no restriction, compensation, body checking, weighing, food diary or change to food or activity. It cannot decide urgency or explain physical symptoms. For immediate danger or severe current symptoms, seek local emergency medical help rather than continue the questionnaire."}</p>
    <p>{zh ? "未知、没有经历或保留回答不是一切没事的结论。可随时暂停或离开，不必披露私人经历。" : "Unknown, no relevant experience and withheld are not an all-clear finding. You may pause or leave without private disclosure."}</p>
  </aside>;
}
export function EatingExperiencesReport({ quiz, records, locale, readingProfiles }: { quiz: Questionnaire; readingProfiles?: readonly QuestionnaireProfile[]; records: EatingExperiencesRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-eating-experiences-result className="min-w-0 space-y-7 [overflow-wrap:anywhere]" aria-labelledby="eating-experiences-result-heading">
    <h2 id="eating-experiences-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <EatingExperiencesSupport locale={locale} compact />
    <section className="rounded-xl border border-teal-200 bg-teal-50/55 p-4 sm:p-6" aria-labelledby="eating-context-start">
      <h3 id="eating-context-start" className="text-xl font-semibold text-teal-950">{zh ? "从某个进食或想法情境读起" : "Choose one context involving food or thoughts"}</h3>
      <p className="mt-3 max-w-prose leading-7">{zh ? "各主题分开读，可以从你愿意回看的体验开始。这里的数字只统计你为几条题目选择了该类别。" : "Read the topics separately, starting with a context you choose. Each number counts the prompts you placed in that category."}</p>
      <ul className="mt-4 grid gap-3 md:grid-cols-2">
        {records.map((record, index) => <li key={record.id} className="min-w-0 rounded-lg bg-white px-3 pb-3">
          <a className="inline-flex min-h-11 items-center font-semibold text-teal-950 underline underline-offset-4" href={`#eating-experiences-record-${record.id}`}>{quiz.directions[index].title[locale]}</a>
          <ObservationChoiceCounts categories={eatingExperiencesCategories} counts={record.counts} locale={locale} />
        </li>)}
      </ul>
    </section>
    {records.map((r, i) => {
      const original = quiz.profiles[i];
      const profile = readingProfiles?.find(item => item.id === original.id && item.directionIds.length === original.directionIds.length && item.directionIds.every((id, index) => id === original.directionIds[index]) && item.resultReading?.quizSlug === quiz.slug && item.resultReading.profileId === original.id) ?? original;
      const previewSectionIds = ["section-2"] as const;
      return <section id={`eating-experiences-record-${r.id}`} key={r.id} data-eating-experiences-theme={r.id} aria-labelledby={`eating-experiences-record-title-${r.id}`} className="scroll-mt-24 border-b border-slate-200 pb-8 last:border-b-0">
      <h3 id={`eating-experiences-record-title-${r.id}`} className="mb-5 text-xl font-semibold leading-8 text-slate-950">{quiz.directions[i].title[locale]}</h3>
      <p data-eating-experiences-topic-summary className="text-base leading-8 text-slate-700">{original.summary[locale]}</p>
      <p data-eating-experiences-choice-pattern className="my-4 text-sm leading-7 text-slate-600">{eatingExperiencesCategories.filter(category => r.counts[category.id] > 0).map(category => `${category.label[locale]} ${r.counts[category.id]}${zh ? "条" : " statements"}`).join(zh ? "；" : "; ")}</p>
      {r.observations.every(o => ["unsure", "na", "withheld"].includes(o.category)) && <p data-eating-experiences-unscored className="mb-4 leading-7">{zh ? "本主题全部为未知、没有经历或保留回答，未据此推断个人情况，不代表不需要支持。" : "This theme is entirely unknown, inapplicable or withheld. No personal finding is inferred; this does not mean support is unnecessary."}</p>}
      <div id={`eating-experiences-public-${r.id}`} data-eating-experiences-full-reading className="scroll-mt-24">
        <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`eating-experiences-result-reading-${profile.id}`} mode="result" previewSectionIds={previewSectionIds} showHeadline={false} showSummary={false} />
      </div>
      <details className="my-5 border-t border-slate-200 pt-3"><summary className="min-h-11 cursor-pointer py-2 font-semibold underline">{zh ? `查看这${r.observations.length}条回答与类别记录` : `Review these ${r.observations.length} responses and categories`}</summary>
      <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2">{eatingExperiencesCategories.map(c => <div key={c.id} className="flex items-start justify-between gap-4 border-b border-slate-100 py-3"><dt className="min-w-0">{c.label[locale]}</dt><dd data-eating-experiences-count={`${r.id}-${c.id}`} className="shrink-0 text-lg font-semibold tabular-nums text-slate-900">{r.counts[c.id]} / {r.observations.length}</dd></div>)}</dl>
      <h4 className="mb-4 mt-7 font-semibold text-slate-700">{zh ? "逐条陈述与所选类别" : "Individual statements and selected categories"}</h4>
      <ul className="space-y-4 border-l-2 border-slate-200 pl-4 text-sm leading-7 sm:pl-5">{r.observations.map(o => <li key={o.questionId} data-eating-experiences-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{eatingExperiencesCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
      </details>
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, original.id)}>{zh ? "单独打开这篇公开指南" : "Open this public guide separately"}</Link>
    </section>; })}
    <details className="border-t border-slate-200 pt-4"><summary className="min-h-11 cursor-pointer py-2 font-semibold underline">{zh ? "计数方法、使用范围与支持说明" : "Counting method, scope and support"}</summary>
    <p className="leading-7">{zh ? "类别只作记录，不作点数。各主题六类计数合计各自四条，逐条标签保留。内容方向不同，不能相加或排名；没有总分、均值、健康等级、诊断或医疗结论。" : "Categories are recorded without points. Each theme’s six counts add to its own item count (four), with individual labels retained. Different descriptions cannot be added or ranked; there is no total, mean, health tier, diagnosis or medical verdict."}</p>
      <EatingExperiencesSupport locale={locale} />
    </details>
  </section>;
}
