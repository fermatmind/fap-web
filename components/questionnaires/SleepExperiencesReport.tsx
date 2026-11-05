import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { ObservationChoiceCounts } from "./ObservationChoiceCounts";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { sleepCategories, type SleepExperiencesRecord } from "@/lib/questionnaires/sleepExperiences20";

export function SleepExperiencesSupport({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const zh = locale === "zh";
  if (compact) return <aside data-sleep-experiences-support className="border-l-2 border-amber-300 pl-4 text-sm leading-7 text-slate-700"><p>{zh ? "不必完成记录或达到某种计数，才可以询问合格专业人员。保留已有照护与有用辅助。若有即时危险或无法保障安全，请寻求当地紧急援助；本页不能评估紧急程度。" : "You can ask a qualified professional without completing the record or reaching a count. Keep existing care and useful aids. If you are in immediate danger or cannot stay safe, seek local emergency assistance; this page cannot assess urgency."}</p></aside>;
  return <aside data-sleep-experiences-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "这是供成年人自愿使用的原创睡眠经历回顾，不是失眠严重程度指数、睡眠日记、诊断或治疗方案。五个可能重叠的主题尚非验证独立维度；类别不说明原因、睡眠是否足够、是否存在其他健康状况，也不评价努力、能力或价值。可以保留回答、暂停或离开。" : "This voluntary original sleep reflection is for adults. It is not the Insomnia Severity Index, a sleep diary, diagnosis or treatment plan. The five overlapping topics are not validated independent dimensions. Categories do not establish causes, sufficient sleep or the presence of another health condition, or judge effort, ability or worth. You may withhold answers, pause or leave."}</p>
    <p>{zh ? "想得到支持时，可以联系合格医疗专业人士，先问流程并决定分享多少；不必完成练习或达到某种计数，也不设求助等待期。任何回答都不要求改药、限制睡眠或故意保持清醒。感到困倦时不要驾车；先暂停警醒不足可能带来危险的活动，寻找合适安全替代。若有即时危险或无法保障安全，请寻求当地紧急援助，而不是继续本页。" : "When you want support, you can contact a qualified healthcare professional, ask about the process and choose how much to share. No completion or count is required, and there is no waiting period for asking about support. No answer directs medicine changes, sleep restriction or deliberately staying awake. Do not drive when sleepy; pause activities where reduced alertness could be dangerous and seek an appropriate safe alternative. If you are in immediate danger or cannot stay safe, seek local emergency assistance instead of continuing."}</p>
    <p className="text-sm">{zh ? "计数只算陈述，不是夜晚、醒来次数或时长。数量少或未计分不代表睡眠健康或活动安全；五篇全文及支持说明始终公开。页面不能观察你或提供紧急响应。" : "Counts concern statements, not nights, awakenings or time. A small count or unscored record does not establish healthy sleep or safety for an activity. All five full guides and support information remain public. The page cannot observe you or provide an emergency response."}</p>
  </aside>;
}
export function SleepExperiencesReport({ quiz, records, locale, readingProfiles }: { quiz: Questionnaire; readingProfiles?: readonly QuestionnaireProfile[]; records: SleepExperiencesRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-sleep-experiences-result className="min-w-0 space-y-7 [overflow-wrap:anywhere]" aria-labelledby="sleep-experiences-result-heading">
    <header className="rounded-2xl bg-slate-900 p-4 text-slate-50 sm:p-7">
      <h2 id="sleep-experiences-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
      <p className="mt-3 max-w-prose leading-7 text-slate-200">{zh ? "从准备入睡到白天活动，沿着这些情境回看。数字是每类回答对应的题目数，展开后可读题目原文。" : "Follow the contexts from settling to sleep through daytime experiences. The numbers count prompts in each selected category. You can open the original prompts in the reading below."}</p>
      <nav className="mt-5" aria-label={zh ? "睡眠与白天情境" : "Sleep and daytime contexts"}>
        <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {records.map((record, index) => <li key={record.id} className="min-w-0 border-l-2 border-indigo-300/65 pl-3">
            <a className="inline-flex min-h-11 items-center font-semibold text-indigo-100 underline underline-offset-4" href={`#record-${quiz.slug}-${record.id}`}>{quiz.directions[index].title[locale]}</a>
            <ObservationChoiceCounts categories={sleepCategories} counts={record.counts} locale={locale} shortLabels={{ na: { zh: "未计分", en: "Unscored" } }} />
          </li>)}
        </ol>
      </nav>
    </header>
    <SleepExperiencesSupport locale={locale} compact />
    {records.map((r, i) => {
      const original = quiz.profiles[i];
      const profile = readingProfiles?.find(item => item.id === original.id && item.directionIds.length === original.directionIds.length && item.directionIds.every((id, index) => id === original.directionIds[index]) && item.resultReading?.quizSlug === quiz.slug && item.resultReading.profileId === original.id) ?? original;
      const previewSectionIds = (["settling-to-sleep-reading", "waking-during-rest-reading"].includes(original.id) ? ["section-3", "section-6"] : ["section-3", "section-5"]);
      return <section key={r.id} id={`record-${quiz.slug}-${r.id}`} data-sleep-experiences-theme={r.id} aria-labelledby={`sleep-experiences-record-title-${r.id}`} className="scroll-mt-24 border-t border-slate-200 pt-6">
        <h3 id={`sleep-experiences-record-title-${r.id}`} className="mb-4 text-xl font-semibold leading-8">{quiz.directions[i].title[locale]}</h3>
        <p className="leading-8" data-sleep-experiences-topic-summary>{original.summary[locale]}</p>
        <p className="my-4 text-sm leading-7 text-slate-600" data-sleep-experiences-choice-pattern>{sleepCategories.filter(category => r.counts[category.id] > 0).map(category => `${category.label[locale]} ${r.counts[category.id]}${zh ? "条" : " statements"}`).join(zh ? "；" : "; ")}</p>
        {r.counts.na === 4 && <p data-sleep-experiences-unscored className="mb-4 leading-7">{zh ? "这四条全部未计分，不代表没有困难或不需要支持。" : "All four are unscored; this does not mean no difficulty or no need for support."}</p>}
        <div id={`sleep-experiences-public-${r.id}`} className="scroll-mt-24" data-sleep-experiences-full-reading>
          <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`sleep-experiences-result-reading-${profile.id}`} mode="result" previewSectionIds={previewSectionIds} showHeadline={false} showSummary={false} />
        </div>
        <details className="my-5 border-t border-slate-200 pt-3">
          <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? `查看这${r.observations.length}条回答与类别记录` : `Review these ${r.observations.length} responses and categories`}</summary>
          <dl className="space-y-3">{sleepCategories.map(c => <div key={c.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 rounded-lg bg-slate-50 px-3 py-3"><dt className="min-w-0">{c.id === "na" ? (zh ? "未计分：没有经历／无法回想／保留回答" : "Unscored: no experience / unclear recall / withheld") : c.label[locale]}</dt><dd data-sleep-experiences-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold tabular-nums">{r.counts[c.id]} / 4</dd></div>)}</dl>
          <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-sleep-experiences-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{o.category === "na" ? (zh ? "未计分" : "Unscored") : sleepCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
        </details>
        <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, original.id)}>{zh ? "单独打开这篇完整公开指南" : "Open this complete public guide separately"}</Link>
      </section>;
    })}
    <details className="border-t border-slate-200 pt-4">
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? "计数方法、使用范围与支持说明" : "Counting method, scope and support"}</summary>
      <p className="leading-7">{zh ? "类别只作记录，不作点数。每个主题六种计数合计四条；未计分与没有注意到分别显示。没有总分、均值、最高项或风险判断。" : "Categories are recorded without points. Each theme’s six counts add to four statements; unscored stays separate from did not notice. There is no total, mean, highest theme or risk judgment."}</p>
      <SleepExperiencesSupport locale={locale} />
    </details>
  </section>;
}
