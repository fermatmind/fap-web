import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { ObservationChoiceCounts } from "./ObservationChoiceCounts";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { pressureActionsCategories, type PressureActionsRecord } from "@/lib/questionnaires/pressureActions12";

export function PressureActionsSupport({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const zh = locale === "zh";
  if (compact) return <aside data-pressure-actions-support className="border-l-2 border-amber-300 pl-4 text-sm leading-7 text-slate-700"><p>{zh ? "不必完成记录或达到某种计数，才可以询问合格专业人员。保留已有照护与有用辅助。若有即时危险或无法保障安全，请寻求当地紧急援助；本页不能评估紧急程度。" : "You can ask a qualified professional without completing the record or reaching a count. Keep existing care and useful aids. If you are in immediate danger or cannot stay safe, seek local emergency assistance; this page cannot assess urgency."}</p></aside>;
  return <aside data-pressure-actions-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "这是成年人的原创日常行动观察，不分配四种默认反应类型，不测生理、不推断创伤经历，也不作诊断。你可以保留回答、暂停或离开，无需讲述事件、对抗或重新联系任何人。" : "This original everyday-action reflection is for adults. It assigns no default four-F type, measures no physiology, infers no trauma history and gives no diagnosis. You can withhold an answer, pause or leave without an event narrative, confrontation or renewed contact."}</p>
    <p>{zh ? "想得到支持时，可以联系合格专业人士，先问流程并决定分享多少；不必完成练习或达到某种计数。如果有即时危险或无法保障自身安全，请寻求当地紧急援助，而不是继续本练习。" : "When you want support, you can contact a qualified professional, ask about the process and choose how much to share. No completion or count is required. If you are in immediate danger or cannot stay safe, seek local emergency help instead of continuing."}</p>
    <p className="text-sm">{zh ? "频率类别不建立同意、责任、人格、治疗建议或未来行为预测。数量少或未计分不代表一切没事，四篇全文在任何回答状态都公开可读。" : "Frequency categories establish no consent, responsibility, personality, treatment advice or prediction. A small count or unscored record is not an all-clear finding. All four full guides remain public for every response pattern."}</p>
  </aside>;
}
export function PressureActionsReport({ quiz, records, locale, readingProfiles }: { quiz: Questionnaire; readingProfiles?: readonly QuestionnaireProfile[]; records: PressureActionsRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-pressure-actions-result className="min-w-0 space-y-7 [overflow-wrap:anywhere]" aria-labelledby="pressure-actions-result-heading">
    <h2 id="pressure-actions-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <nav aria-label={zh ? "回看压力下的四种动作" : "Revisit four actions under pressure"} className="rounded-xl border border-orange-200 bg-orange-50/60 p-4 sm:p-6">
      <p className="max-w-prose leading-7">{zh ? "守住立场、离开、卡住和先同意可以发生在不同情境。选一个你还记得的例子。每个数字是选了该类别的题目数。" : "Holding a position, stepping away, getting stuck and agreeing early can happen in different situations. Start with a moment you remember. The numbers count prompts in each category."}</p>
      <ol className="mt-4 grid gap-px overflow-hidden rounded-lg bg-orange-200 sm:grid-cols-2">
        {records.map((record, index) => <li key={record.id} className="min-w-0 bg-white p-3">
          <a className="inline-flex min-h-11 items-center font-semibold text-orange-950 underline underline-offset-4" href={`#record-${quiz.slug}-${record.id}`}>{quiz.directions[index].title[locale]}</a>
          <ObservationChoiceCounts categories={pressureActionsCategories} counts={record.counts} locale={locale} shortLabels={{ na: { zh: "未计分", en: "Unscored" } }} />
        </li>)}
      </ol>
    </nav>
    <PressureActionsSupport locale={locale} compact />
    {records.map((r, i) => {
      const original = quiz.profiles[i];
      const profile = readingProfiles?.find(item => item.id === original.id && item.directionIds.length === original.directionIds.length && item.directionIds.every((id, index) => id === original.directionIds[index]) && item.resultReading?.quizSlug === quiz.slug && item.resultReading.profileId === original.id) ?? original;
      const previewSectionIds = ["section-3", "section-5"];
      return <section key={r.id} id={`record-${quiz.slug}-${r.id}`} data-pressure-actions-theme={r.id} aria-labelledby={`pressure-actions-record-title-${r.id}`} className="scroll-mt-24 border-t border-slate-200 pt-6">
        <h3 id={`pressure-actions-record-title-${r.id}`} className="mb-4 text-xl font-semibold leading-8">{quiz.directions[i].title[locale]}</h3>
        <p className="leading-8" data-pressure-actions-topic-summary>{original.summary[locale]}</p>
        <p className="my-4 text-sm leading-7 text-slate-600" data-pressure-actions-choice-pattern>{pressureActionsCategories.filter(category => r.counts[category.id] > 0).map(category => `${category.label[locale]} ${r.counts[category.id]}${zh ? "条" : " statements"}`).join(zh ? "；" : "; ")}</p>
        {r.counts.na === 3 && <p data-pressure-actions-unscored className="mb-4 leading-7">{zh ? "这三条全部未计分，不代表没有相关行动或不需要支持。" : "All three are unscored; this does not mean no actions or no need for support."}</p>}
        <div id={`pressure-actions-public-${r.id}`} className="scroll-mt-24" data-pressure-actions-full-reading>
          <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`pressure-actions-result-reading-${profile.id}`} mode="result" previewSectionIds={previewSectionIds} showHeadline={false} showSummary={false} />
        </div>
        <details className="my-5 border-t border-slate-200 pt-3">
          <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? `查看这${r.observations.length}条回答与类别记录` : `Review these ${r.observations.length} responses and categories`}</summary>
          <dl className="space-y-3">{pressureActionsCategories.map(c => <div key={c.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 rounded-lg bg-slate-50 px-3 py-3"><dt className="min-w-0">{c.id === "na" ? (zh ? "未计分：没有机会／无法回想／保留回答" : "Unscored: no opportunity / unclear recall / withheld") : c.label[locale]}</dt><dd data-pressure-actions-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold tabular-nums">{r.counts[c.id]} / 3</dd></div>)}</dl>
          <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-pressure-actions-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{o.category === "na" ? (zh ? "未计分" : "Unscored") : pressureActionsCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
        </details>
        <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, original.id)}>{zh ? "单独打开这篇完整公开指南" : "Open this complete public guide separately"}</Link>
      </section>;
    })}
    <details className="border-t border-slate-200 pt-4">
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? "计数方法、使用范围与支持说明" : "Counting method, scope and support"}</summary>
      <p className="leading-7">{zh ? "类别只作记录，不作点数。每个主题六种计数合计三条；未计分与没有注意到分别显示。没有总分、均值、最高项或风险判断。" : "Categories are recorded without points. Each theme’s six counts add to three statements; unscored stays separate from did not notice. There is no total, mean, highest theme or risk judgment."}</p>
      <PressureActionsSupport locale={locale} />
    </details>
  </section>;
}
