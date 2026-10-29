import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { bereavementCategories, bereavementTimeChoices, type BereavementTimeId, type BereavementRecord } from "@/lib/questionnaires/bereavement16";

export function BereavementSupport({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <aside data-bereavement-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "这是供成年人自愿使用的原创丧失回顾，不是哀伤量表、诊断或康复进度表。五个主题可能重叠，不是已验证的独立维度；想念、时间或某个类别都不衡量爱、忠诚或你是否应该放下。可以保留回答、暂停或离开，无需写姓名、日期或事件经过。" : "This voluntary original bereavement reflection is for adults. It is not a grief scale, diagnosis or recovery timetable. The five overlapping topics are not validated independent dimensions. Missing someone, elapsed time and response categories do not measure love, loyalty or whether you should move on. You may withhold answers, pause or leave without names, dates or an account of what happened."}</p>
    <p>{zh ? "想得到支持时，可以联系合格专业人士或适合自己的丧失支持服务，先问流程并决定分享多少；不必完成练习、达到某种计数或等待某个时间点。如果有即时危险或无法保障自身安全，请寻求当地紧急援助，而不是继续本练习。" : "When you want support, you can contact a qualified professional or a bereavement support service that suits you, ask about the process and choose how much to share. No completion, count or waiting period is required. If you are in immediate danger or cannot stay safe, seek local emergency help instead of continuing."}</p>
    <p className="text-sm">{zh ? "时间选项只是方便整理的背景，不是临床界线、阶段或求助门槛。数量少或未计分不代表没有困难；五篇全文在任何回答和时间状态都公开可读。无需回看照片、整理遗物、重返现场、联系他人或披露私人经历。" : "Time options are convenience context, not clinical cutoffs, stages or conditions for help. A small count or unscored record does not establish an absence of difficulty. All five full guides remain public for every response and timing choice. No photo viewing, belongings sorting, revisiting, contact or private disclosure is required."}</p>
  </aside>;
}
export function BereavementReport({ quiz, records, timeContext, locale }: { quiz: Questionnaire; records: BereavementRecord[]; timeContext: BereavementTimeId; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-bereavement-result className="space-y-7" aria-labelledby="bereavement-result-heading">
    <h2 id="bereavement-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <p className="leading-7">{zh ? "类别只作记录，不作点数。每个主题六种计数合计各自的四条或三条；未计分与没有注意到分别显示。没有总分、均值、最高项或风险判断。" : "Categories are recorded without points. Each theme’s six counts add to its four or three statements; unscored stays separate from did not notice. There is no total, mean, highest theme or risk judgment."}</p>
    <div data-bereavement-time-context={timeContext} className="space-y-3 leading-7"><p>{zh ? "自选时间背景：" : "Optional timing context: "}<strong>{bereavementTimeChoices.find(c => c.id === timeContext)!.label[locale]}</strong></p><p>{quiz.bereavementTimeContext!.boundary[locale]}</p></div>
    <BereavementSupport locale={locale} />
    {records.map((r, i) => <section key={r.id} data-bereavement-theme={r.id} className="rounded-lg border border-slate-300 p-4">
      <h3 className="mb-4 text-xl font-semibold">{quiz.directions[i].title[locale]}</h3>
      {r.counts.na === r.observations.length && <p data-bereavement-unscored className="mb-4 leading-7">{zh ? "这个主题全部未计分，不代表没有困难或不需要支持。" : "All observations in this theme are unscored; this does not mean no difficulty or no need for support."}</p>}
      <dl className="space-y-3">{bereavementCategories.map(c => <div key={c.id} className="flex items-start justify-between gap-4"><dt className="min-w-0">{c.id === "na" ? (zh ? "未计分：没有经历／无法回想／保留回答" : "Unscored: no experience / unclear recall / withheld") : c.label[locale]}</dt><dd data-bereavement-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold">{r.counts[c.id]} / {r.observations.length}</dd></div>)}</dl>
      <h4 className="my-4 font-semibold">{zh ? "逐条观察与所选类别" : "Individual observations and selected categories"}</h4>
      <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-bereavement-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{o.category === "na" ? (zh ? "未计分" : "Unscored") : bereavementCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
      <a className="mt-5 inline-block min-h-11 py-2 font-semibold underline" href={`#bereavement-public-${r.id}`}>{zh ? "阅读下方完整主题说明" : "Read the complete theme below"}</a>{" · "}
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, quiz.profiles[i].id)}>{zh ? "公开指南页" : "Public guide page"}</Link>
    </section>)}
  </section>;
}
