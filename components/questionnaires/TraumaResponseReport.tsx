import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { traumaResponseCategories, type TraumaResponseRecord } from "@/lib/questionnaires/traumaResponse20";

export function TraumaResponseSupport({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <aside data-trauma-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "无需完成问卷或达到某种数量，想得到帮助时就可以联系合格健康专业人士。你可以先询问评估流程，决定分享多少信息，也可以暂停或退出。" : "You do not need to finish or reach a count to contact a qualified health professional when you want help. You can ask about the assessment process, decide how much to share, pause or leave."}</p>
    <p>{zh ? "若正处于即时危险或无法保障自身安全，请寻求当地紧急援助，而不是继续本练习。本页不能判断紧急程度，也不排除身体疾病。" : "If you are in immediate danger or cannot stay safe, seek local emergency help instead of continuing this exercise. This page cannot assess urgency or rule out a physical condition."}</p>
    <p className="text-sm">{zh ? "这是成年人的原创教育性观察，不是PCL-5或PTSD筛查；没有诊断、临床阈值、风险档位或治疗建议。无需讲述事件，也无需主动接触提醒材料。" : "This original educational observation is for adults, and is not the PCL-5 or a PTSD screen. It has no diagnosis, clinical cutoff, risk tier or treatment advice. No event narrative or deliberate contact with reminders is required."}</p>
  </aside>;
}
export function TraumaResponseReport({ quiz, records, locale }: { quiz: Questionnaire; records: TraumaResponseRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-trauma-result className="space-y-7" aria-labelledby="trauma-result-heading">
    <h2 id="trauma-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <p className="leading-7">{zh ? "类别只作记录，不作点数。每个主题六种计数合计五条；未计分与没有注意到分别显示。没有总分、均值、最高项或风险判断。" : "Categories are recorded without points. Each theme’s six counts add to five statements; unscored stays separate from did not notice. There is no total, mean, highest theme or risk judgment."}</p>
    <TraumaResponseSupport locale={locale} />
    {records.map((r, i) => <section key={r.id} data-trauma-theme={r.id} className="rounded-lg border border-slate-300 p-4">
      <h3 className="mb-4 text-xl font-semibold">{quiz.directions[i].title[locale]}</h3>
      {r.counts.na === 5 && <p data-trauma-unscored className="mb-4 leading-7">{zh ? "这五条全部未计分，不代表没有相关反应或不需要支持。" : "All five are unscored; this does not mean no reactions or no need for support."}</p>}
      <dl className="space-y-3">{traumaResponseCategories.map(c => <div key={c.id} className="flex items-start justify-between gap-4"><dt className="min-w-0">{c.id === "na" ? (zh ? "未计分：没有机会／无法回想／保留回答" : "Unscored: no opportunity / unclear recall / withheld") : c.label[locale]}</dt><dd data-trauma-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold">{r.counts[c.id]} / 5</dd></div>)}</dl>
      <h4 className="my-4 font-semibold">{zh ? "逐条观察与所选类别" : "Individual observations and selected categories"}</h4>
      <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-trauma-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{o.category === "na" ? (zh ? "未计分" : "Unscored") : traumaResponseCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
      <a className="mt-5 inline-block min-h-11 py-2 font-semibold underline" href={`#trauma-public-${r.id}`}>{zh ? "阅读下方完整主题说明" : "Read the complete theme below"}</a>{" · "}
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, quiz.profiles[i].id)}>{zh ? "公开指南页" : "Public guide page"}</Link>
    </section>)}
  </section>;
}
