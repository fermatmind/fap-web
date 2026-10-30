import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { numberContextCategories, type NumberContextRecord } from "@/lib/questionnaires/numberContext20";

export function NumberContextSupport({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <aside data-number-context-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "这是供成年人自愿使用的20条原创日常数字观察，不是计算障碍筛查工具、诊断或能力测试。四个可能重叠的主题尚非验证独立维度；使用工具和数学担忧不是追加诊断指标。类别不建立计算障碍、智力、努力、熟练程度、财务能力、工作适配或原因，中英文测量等值尚未建立。只凭回忆，可保留回答、暂停或离开。" : "These 20 voluntary original everyday-number observations are for adults, not a dyscalculia screener, diagnosis or ability test. Four overlapping topics are not validated independent dimensions; tool use and maths anxiety are not additional diagnostic indicators. Categories cannot establish dyscalculia, intelligence, effort, proficiency, financial capacity, work suitability or a cause. English and Chinese measurement equivalence is not established. Recall only; you may withhold, pause or leave."}</p>
    <p>{zh ? "可向合适的学习支持或评估专业人员询问，不必达到计数、证明童年困难或完成记录。不安排计算、看钟测试、测量、记忆或交易任务；无需撤掉工具、已有核对，提供真实数字或向雇主披露。不要用记录决定药物剂量、出行安全、电气工作、付款或财务事项，也不用它推迟医疗、评估或已有支持、解释掉新出现或变化的健康担忧。本页不评估医疗需要或紧急程度，不替代已有专业意见。若有即时危险或无法保障安全，请寻求当地紧急援助，而不是继续。" : "You can ask an appropriately qualified learning-support or assessment professional without a count, proof of childhood difficulty or a completed record. No calculation, clock-reading, measurement, memory or transaction task is assigned; no removal of tools or existing checks, real figures or employer disclosure is required. Do not use a record for medication doses, travel safety, electrical work, payments or financial decisions, or to postpone healthcare, assessment or existing support or explain away a new or changing health concern. This page cannot assess healthcare need or urgency or replace existing advice. If you are in immediate danger or cannot stay safe, seek local emergency assistance instead of continuing."}</p>
    <p className="text-sm">{zh ? "计数只算描述，不是错误、计算次数、金额、时长或计算障碍概率。数值推理练习保留独立题目、答对数与指南，不与本记录合并。四篇新全文及支持说明始终公开，未计分与没有注意到分开。页面不能观察你或作紧急响应。" : "Counts concern descriptions, not errors, calculations, amounts, time or the probability of dyscalculia. Numerical-reasoning practice retains its separate questions, correct counts and guides without combination with this record. Four complete new guides and support remain public; unscored stays separate from did not notice. The page cannot observe you or provide an emergency response."}</p>
  </aside>;
}
export function NumberContextReport({ quiz, records, locale }: { quiz: Questionnaire; records: NumberContextRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-number-context-result className="space-y-7" aria-labelledby="number-context-result-heading">
    <h2 id="number-context-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <p className="leading-7">{zh ? "类别只作记录，不作点数。每个主题六种计数合计五条；未计分与没有注意到分别显示。没有总分、均值、最高项或风险判断。" : "Categories are recorded without points. Each theme’s six counts add to five statements; unscored stays separate from did not notice. There is no total, mean, highest theme or risk judgment."}</p>
    <NumberContextSupport locale={locale} />
    {records.map((r, i) => <section key={r.id} data-number-context-theme={r.id} className="rounded-lg border border-slate-300 p-4">
      <h3 className="mb-4 text-xl font-semibold">{quiz.directions[i].title[locale]}</h3>
      {r.counts.na === 5 && <p data-number-context-unscored className="mb-4 leading-7">{zh ? "这五条全部未计分，不代表没有困难或不需要支持。" : "All five are unscored; this does not mean no difficulty or no need for support."}</p>}
      <dl className="space-y-3">{numberContextCategories.map(c => <div key={c.id} className="flex items-start justify-between gap-4"><dt className="min-w-0">{c.id === "na" ? (zh ? "未计分：没有经历／无法回想／保留回答" : "Unscored: no experience / unclear recall / withheld") : c.label[locale]}</dt><dd data-number-context-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold">{r.counts[c.id]} / 5</dd></div>)}</dl>
      <h4 className="my-4 font-semibold">{zh ? "逐条观察与所选类别" : "Individual observations and selected categories"}</h4>
      <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-number-context-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{o.category === "na" ? (zh ? "未计分" : "Unscored") : numberContextCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
      <a className="mt-5 inline-block min-h-11 py-2 font-semibold underline" href={`#number-context-public-${r.id}`}>{zh ? "阅读下方完整主题说明" : "Read the complete theme below"}</a>{" · "}
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, quiz.profiles[i].id)}>{zh ? "公开指南页" : "Public guide page"}</Link>
    </section>)}
  </section>;
}
