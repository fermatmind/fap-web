import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { ObservationChoiceCounts } from "./ObservationChoiceCounts";
import Link from "next/link";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { unwantedActionsCategories, type UnwantedActionsRecord } from "@/lib/questionnaires/unwantedActions20";

export function UnwantedActionsSupport({ locale, compact = false, copy = text => text }: { locale: Locale; compact?: boolean; copy?: (text: string) => string }) {
  const zh = locale === "zh";
  if (compact) return <aside data-unwanted-actions-support className="border-l-2 border-amber-300 pl-4 text-sm leading-7 text-slate-700"><p>{zh ? copy("不必完成记录或达到某种计数，才可以询问合格专业人员。保留已有照护与有用辅助。若有即时危险或无法保障安全，请寻求当地紧急援助；本页不能评估紧急程度。") : "You can ask a qualified professional without completing the record or reaching a count. Keep existing care and useful aids. If you are in immediate danger or cannot stay safe, seek local emergency assistance; this page cannot assess urgency."}</p></aside>;
  return <aside data-unwanted-actions-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? copy("这是供成年人自愿使用的原创描述回顾，不是Y-BOCS、OCI、发表的囤积量表或诊断。五个可能重叠的阅读主题尚非验证独立维度，也不是五种强迫症亚型；囤积障碍被视为独立状况，本页两者均不诊断。不想要的想法本身不建立意图或行动；页面不能评估实际意图、计划、即时危险或能否保障安全，也不能用来忽视已有安全担忧。") : "This voluntary original adult reflection is not Y-BOCS, OCI, a published hoarding scale or a diagnosis. Five overlapping reading topics are not validated independent dimensions or five OCD subtypes. Hoarding disorder is considered a separate condition; the page diagnoses neither condition. An unwanted thought does not by itself establish intent or action. The page cannot assess actual intent, plans, immediate danger or ability to stay safe, and must not be used to dismiss an existing safety concern."}</p>
    <p>{zh ? copy("可向合格医疗专业人士询问，不必达到计数、耗时或完成记录。只凭回忆，不安排接触、阻止反应、压制、抵消、停止仪式、改变卫生或丢弃任务。不因记录改变安全要求、药物、照护、监测或财物决定，不用记录推迟评估。本页不评估医疗需要或紧急程度，也不替代专业意见。若有实际伤害意图或计划、即时危险或无法保障安全，请寻求合适的紧急或当地急救援助，而不是继续。") : "You can ask a qualified healthcare professional without a count, time threshold or completed record. Recall only; no exposure, response prevention, suppression, neutralising, stopping of rituals, hygiene change or discarding task is assigned. Do not change safety requirements, medicine, care, monitoring or property decisions because of the record, or use it to postpone assessment. This page cannot assess healthcare need or urgency or replace professional advice. If there is actual intent or a plan to harm, immediate danger or inability to stay safe, seek appropriate urgent or local emergency assistance instead of continuing."}</p>
    <p className="text-sm">{zh ? copy("计数只算描述，不是动作、想法、耗时、污染或住房安全。计数少或未计分不证明健康或安全，频繁也不证明意图或疾病；五篇全文和支持说明始终公开。页面不能观察你或作紧急响应。") : "Counts concern descriptions, not actions, thoughts, time, contamination or housing safety. A small or unscored record does not establish health or safety, and frequent labels do not establish intent or a disorder. Five full guides and support information remain public. The page cannot observe you or respond to an emergency."}</p>
  </aside>;
}
export function UnwantedActionsReport({ quiz, records, locale, readingProfiles, displayLocale = locale, copy = text => text }: { quiz: Questionnaire; readingProfiles?: readonly QuestionnaireProfile[]; records: UnwantedActionsRecord[]; locale: Locale; displayLocale?: DisplayLocale; copy?: (text: string) => string }) {
  const zh = locale === "zh";
  return <section data-unwanted-actions-result className="min-w-0 space-y-7 [overflow-wrap:anywhere]" aria-labelledby="unwanted-actions-result-heading">
    <h2 id="unwanted-actions-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <UnwantedActionsSupport locale={locale} copy={copy} compact />
    <section className="rounded-xl border border-stone-300 bg-stone-50 p-4 sm:p-6" aria-labelledby="unwanted-reading-start">
      <h3 id="unwanted-reading-start" className="text-xl font-semibold text-stone-950">{zh ? copy("从一项想法或动作读自己的记录") : "Start with one thought or action you recorded"}</h3>
      <p className="mt-3 max-w-prose leading-7">{zh ? copy("五部分各自保留你的回答。可以按自己想回看的情境阅读。数字是每类回答对应的题目数。") : "The five parts keep your responses separate. Open a context you want to revisit. The numbers count prompts for each response category."}</p>
      <ul className="mt-4 grid gap-x-6 md:grid-cols-2">
        {records.map((record, index) => <li key={record.id} className="min-w-0 border-l-2 border-stone-300 px-3 py-2">
          <a className="inline-flex min-h-11 items-center font-semibold text-stone-950 underline underline-offset-4" href={`#record-${quiz.slug}-${record.id}`}>{quiz.directions[index].title[locale]}</a>
          <ObservationChoiceCounts copy={copy} categories={unwantedActionsCategories} counts={record.counts} locale={locale} shortLabels={{ na: { zh: "未计分", en: "Unscored" } }} />
        </li>)}
      </ul>
    </section>
    {records.map((r, i) => {
      const original = quiz.profiles[i];
      const profile = readingProfiles?.find(item => item.id === original.id && item.directionIds.length === original.directionIds.length && item.directionIds.every((id, index) => id === original.directionIds[index]) && item.resultReading?.quizSlug === quiz.slug && item.resultReading.profileId === original.id) ?? original;
      const previewSectionIds = ["section-3", "section-4", "section-5"];
      return <section key={r.id} id={`record-${quiz.slug}-${r.id}`} data-unwanted-actions-theme={r.id} aria-labelledby={`unwanted-actions-record-title-${r.id}`} className="scroll-mt-24 border-t border-slate-200 pt-6">
        <h3 id={`unwanted-actions-record-title-${r.id}`} className="mb-4 text-xl font-semibold leading-8">{quiz.directions[i].title[locale]}</h3>
        <p className="leading-8" data-unwanted-actions-topic-summary>{original.summary[locale]}</p>
        <p className="my-4 text-sm leading-7 text-slate-600" data-unwanted-actions-choice-pattern>{unwantedActionsCategories.filter(category => r.counts[category.id] > 0).map(category => `${copy(category.label[locale])} ${r.counts[category.id]}${zh ? copy("条") : " statements"}`).join(zh ? copy("；") : "; ")}</p>
        {r.counts.na === 4 && <p data-unwanted-actions-unscored className="mb-4 leading-7">{zh ? copy("这四条全部未计分，不代表没有困难或不需要支持。") : "All four are unscored; this does not mean no difficulty or no need for support."}</p>}
        <div id={`unwanted-actions-public-${r.id}`} className="scroll-mt-24" data-unwanted-actions-full-reading>
          <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} traditional={displayLocale === "zh-TW"} headingLevel={4} idPrefix={`unwanted-actions-result-reading-${profile.id}`} mode="result" previewSectionIds={previewSectionIds} showHeadline={false} showSummary={false} />
        </div>
        <details className="my-5 border-t border-slate-200 pt-3">
          <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? copy(`查看这${r.observations.length}条回答与类别记录`) : `Review these ${r.observations.length} responses and categories`}</summary>
          <dl className="space-y-3">{unwantedActionsCategories.map(c => <div key={c.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 rounded-lg bg-slate-50 px-3 py-3"><dt className="min-w-0">{c.id === "na" ? (zh ? copy("未计分：没有经历／无法回想／保留回答") : "Unscored: no experience / unclear recall / withheld") : copy(c.label[locale])}</dt><dd data-unwanted-actions-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold tabular-nums">{r.counts[c.id]} / 4</dd></div>)}</dl>
          <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-unwanted-actions-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{o.category === "na" ? (zh ? copy("未计分") : "Unscored") : copy(unwantedActionsCategories.find(c => c.id === o.category)!.label[locale])}</p></li>)}</ul>
        </details>
        <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(displayLocale, quiz.slug, original.id)}>{zh ? copy("单独打开这篇完整公开指南") : "Open this complete public guide separately"}</Link>
      </section>;
    })}
    <details className="border-t border-slate-200 pt-4">
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? copy("计数方法、使用范围与支持说明") : "Counting method, scope and support"}</summary>
      <p className="leading-7">{zh ? copy("类别只作记录，不作点数。每个主题六种计数合计四条；未计分与没有注意到分别显示。没有总分、均值、最高项或风险判断。") : "Categories are recorded without points. Each theme’s six counts add to four statements; unscored stays separate from did not notice. There is no total, mean, highest theme or risk judgment."}</p>
      <UnwantedActionsSupport locale={locale} copy={copy} />
    </details>
  </section>;
}
