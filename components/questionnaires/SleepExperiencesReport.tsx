import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { sleepCategories, type SleepExperiencesRecord } from "@/lib/questionnaires/sleepExperiences20";

export function SleepExperiencesSupport({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <aside data-sleep-experiences-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "这是供成年人自愿使用的原创睡眠经历回顾，不是失眠严重程度指数、睡眠日记、诊断或治疗方案。五个可能重叠的主题尚非验证独立维度；类别不说明原因、睡眠是否足够、是否存在其他健康状况，也不评价努力、能力或价值。可以保留回答、暂停或离开。" : "This voluntary original sleep reflection is for adults. It is not the Insomnia Severity Index, a sleep diary, diagnosis or treatment plan. The five overlapping topics are not validated independent dimensions. Categories do not establish causes, sufficient sleep or the presence of another health condition, or judge effort, ability or worth. You may withhold answers, pause or leave."}</p>
    <p>{zh ? "想得到支持时，可以联系合格医疗专业人士，先问流程并决定分享多少；不必完成练习或达到某种计数，也不设求助等待期。任何回答都不要求改药、限制睡眠或故意保持清醒。感到困倦时不要驾车；先暂停警醒不足可能带来危险的活动，寻找合适安全替代。若有即时危险或无法保障安全，请寻求当地紧急援助，而不是继续本页。" : "When you want support, you can contact a qualified healthcare professional, ask about the process and choose how much to share. No completion or count is required, and there is no waiting period for asking about support. No answer directs medicine changes, sleep restriction or deliberately staying awake. Do not drive when sleepy; pause activities where reduced alertness could be dangerous and seek an appropriate safe alternative. If you are in immediate danger or cannot stay safe, seek local emergency assistance instead of continuing."}</p>
    <p className="text-sm">{zh ? "计数只算陈述，不是夜晚、醒来次数或时长。数量少或未计分不代表睡眠健康或活动安全；五篇全文及支持说明始终公开。页面不能观察你或提供紧急响应。" : "Counts concern statements, not nights, awakenings or time. A small count or unscored record does not establish healthy sleep or safety for an activity. All five full guides and support information remain public. The page cannot observe you or provide an emergency response."}</p>
  </aside>;
}
export function SleepExperiencesReport({ quiz, records, locale }: { quiz: Questionnaire; records: SleepExperiencesRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-sleep-experiences-result className="space-y-7" aria-labelledby="sleep-experiences-result-heading">
    <h2 id="sleep-experiences-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <p className="leading-7">{zh ? "类别只作记录，不作点数。每个主题六种计数合计四条；未计分与没有注意到分别显示。没有总分、均值、最高项或风险判断。" : "Categories are recorded without points. Each theme’s six counts add to four statements; unscored stays separate from did not notice. There is no total, mean, highest theme or risk judgment."}</p>
    <SleepExperiencesSupport locale={locale} />
    {records.map((r, i) => <section key={r.id} data-sleep-experiences-theme={r.id} className="rounded-lg border border-slate-300 p-4">
      <h3 className="mb-4 text-xl font-semibold">{quiz.directions[i].title[locale]}</h3>
      {r.counts.na === 4 && <p data-sleep-experiences-unscored className="mb-4 leading-7">{zh ? "这四条全部未计分，不代表没有困难或不需要支持。" : "All four are unscored; this does not mean no difficulty or no need for support."}</p>}
      <dl className="space-y-3">{sleepCategories.map(c => <div key={c.id} className="flex items-start justify-between gap-4"><dt className="min-w-0">{c.id === "na" ? (zh ? "未计分：没有经历／无法回想／保留回答" : "Unscored: no experience / unclear recall / withheld") : c.label[locale]}</dt><dd data-sleep-experiences-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold">{r.counts[c.id]} / 4</dd></div>)}</dl>
      <h4 className="my-4 font-semibold">{zh ? "逐条观察与所选类别" : "Individual observations and selected categories"}</h4>
      <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-sleep-experiences-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{o.category === "na" ? (zh ? "未计分" : "Unscored") : sleepCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
      <a className="mt-5 inline-block min-h-11 py-2 font-semibold underline" href={`#sleep-experiences-public-${r.id}`}>{zh ? "阅读下方完整主题说明" : "Read the complete theme below"}</a>{" · "}
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, quiz.profiles[i].id)}>{zh ? "公开指南页" : "Public guide page"}</Link>
    </section>)}
  </section>;
}
