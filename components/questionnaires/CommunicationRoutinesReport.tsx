import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { communicationRoutinesCategories, type CommunicationRoutinesRecord } from "@/lib/questionnaires/communicationRoutines20";

export function CommunicationRoutinesSupport({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <aside data-communication-routines-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "供成年人回顾过去四周的自身日常情境，不是自闭症筛查、神经类型判定或认知能力测试。五个可重叠主题不作校准维度；正向与困难描述不反向、不合分。无机会、回忆不清或保留回答可选未计分，不变成没有注意到。视觉辅助使用不等于视觉空间能力或内在意象。" : "For adults recalling their own everyday situations over the past four weeks, not an autism screen, neurotype classification or cognitive-ability test. Five overlapping topics are not calibrated dimensions. Positive and difficult descriptions are not reversed or combined. No opportunity, unclear recall and withholding can remain unscored rather than becoming did not notice. Use of visual aids is not visual-spatial ability or internal imagery."}</p>
    <p>{zh ? "可以依据实际需要向合适的专业人士询问支持，无需完成、达到计数或证明身份。本页不评发展史、医疗需要或紧急程度，不应用来推迟照护或替代已有意见。无需强迫眼神接触、制造感官输入、撤掉支持或演示社交。五篇全文始终公开，独立资源保留自身方法，不合成总分；回答只在本页内存。" : "You can discuss actual support needs with an appropriately qualified professional without completing, reaching a count or proving an identity. This page cannot assess developmental history, medical need or urgency and should not delay care or replace existing advice. No forced eye contact, added sensory input, removal of support or social demonstration is required. All five full guides remain public. Separate resources keep their own methods without a combined score; answers stay in this page’s memory only."}</p>
  </aside>;
}
export function CommunicationRoutinesReport({ quiz, records, locale }: { quiz: Questionnaire; records: CommunicationRoutinesRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-communication-routines-result className="space-y-7" aria-labelledby="communication-routines-result-heading">
    <h2 id="communication-routines-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <p className="leading-7">{zh ? "类别只作记录，不作点数。每个主题六种计数合计四条；未计分与有机会时没有注意到分别显示。没有总分、均值、最高项或风险判断。" : "Categories are recorded without points. Each theme’s six counts add to four descriptions; unscored stays separate from did not notice on relevant occasions. There is no total, mean, highest theme or risk judgment."}</p>
    <CommunicationRoutinesSupport locale={locale} />
    {records.map((r, i) => <section key={r.id} data-communication-routines-theme={r.id} className="rounded-lg border border-slate-300 p-4">
      <h3 className="mb-4 text-xl font-semibold">{quiz.directions[i].title[locale]}</h3>
      {r.counts.na === 4 && <p data-communication-routines-unscored className="mb-4 leading-7">{zh ? "这四条全部未计分，不代表没有困难或不需要支持。" : "All four are unscored; this does not mean no difficulty or no need for support."}</p>}
      <dl className="space-y-3">{communicationRoutinesCategories.map(c => <div key={c.id} className="flex items-start justify-between gap-4"><dt className="min-w-0">{c.id === "na" ? (zh ? "未计分：没有机会／无法回想／保留回答" : "Unscored: no opportunity / unclear recall / withheld") : c.label[locale]}</dt><dd data-communication-routines-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold">{r.counts[c.id]} / 4</dd></div>)}</dl>
      <h4 className="my-4 font-semibold">{zh ? "逐条观察与所选类别" : "Individual observations and selected categories"}</h4>
      <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-communication-routines-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{o.category === "na" ? (zh ? "未计分" : "Unscored") : communicationRoutinesCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
      <a className="mt-5 inline-block min-h-11 py-2 font-semibold underline" href={`#communication-routines-public-${r.id}`}>{zh ? "阅读下方完整主题说明" : "Read the complete theme below"}</a>{" · "}
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, quiz.profiles[i].id)}>{zh ? "公开指南页" : "Public guide page"}</Link>
    </section>)}
  </section>;
}
