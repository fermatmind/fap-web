import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { writtenLanguageCategories, type WrittenLanguageRecord } from "@/lib/questionnaires/writtenLanguage20";

export function WrittenLanguageSupport({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <aside data-written-language-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "这是供成年人自愿使用的20条原创书面语言观察，不是BDA成人清单、阅读障碍筛查工具、诊断或能力测试。四个可能重叠的主题尚非验证独立维度；辅助方式不是追加症状。类别不建立阅读障碍、智力、努力、语言熟练度、神经类型、原因或教育就业资格，中英文测量等值尚未建立。只凭回忆，可保留回答、暂停或离开。" : "These 20 voluntary original written-language observations are for adults, not the BDA adult checklist, a dyslexia screener, diagnosis or ability test. Four overlapping topics are not validated independent dimensions; access methods are not additional symptoms. Categories cannot establish dyslexia, intelligence, effort, language proficiency, neurotype, a cause or eligibility for education or work. English and Chinese measurement equivalence is not established. Recall only; you may withhold, pause or leave."}</p>
    <p>{zh ? "可向合适的学习支持或评估专业人员询问，不必达到计数、证明童年困难或完成记录。不安排朗读、拼写、抄写、记忆测试或重现错误；无需撤掉有用辅助、上传文字或向雇主披露。不要用记录推迟医疗、评估或已有支持，也不应用它解释掉新出现或变化的健康担忧。本页不评估医疗需要或紧急程度，不替代已有专业意见。若有即时危险或无法保障安全，请寻求当地紧急援助，而不是继续。" : "You can ask an appropriately qualified learning-support or assessment professional without a count, proof of childhood difficulty or a completed record. No reading aloud, spelling, copying, memory test or recreated error is assigned; no removal of useful aids, writing upload or employer disclosure is required. Do not use the record to postpone healthcare, assessment or existing support, or explain away a new or changing health concern. This page cannot assess healthcare need or urgency or replace existing advice. If you are in immediate danger or cannot stay safe, seek local emergency assistance instead of continuing."}</p>
    <p className="text-sm">{zh ? "计数只算描述，不是错误、任务、分钟、熟练程度或阅读障碍概率。计数少或未计分不证明没有困难；四篇全文及支持说明始终公开。页面不能观察你或作紧急响应。" : "Counts concern descriptions, not errors, tasks, minutes, proficiency or the probability of dyslexia. A small or unscored record does not establish an absence of difficulty. Four complete guides and support information remain public. The page cannot observe you or provide an emergency response."}</p>
  </aside>;
}
export function WrittenLanguageReport({ quiz, records, locale }: { quiz: Questionnaire; records: WrittenLanguageRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-written-language-result className="space-y-7" aria-labelledby="written-language-result-heading">
    <h2 id="written-language-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <p className="leading-7">{zh ? "类别只作记录，不作点数。每个主题六种计数合计五条；未计分与没有注意到分别显示。没有总分、均值、最高项或风险判断。" : "Categories are recorded without points. Each theme’s six counts add to five statements; unscored stays separate from did not notice. There is no total, mean, highest theme or risk judgment."}</p>
    <WrittenLanguageSupport locale={locale} />
    {records.map((r, i) => <section key={r.id} data-written-language-theme={r.id} className="rounded-lg border border-slate-300 p-4">
      <h3 className="mb-4 text-xl font-semibold">{quiz.directions[i].title[locale]}</h3>
      {r.counts.na === 5 && <p data-written-language-unscored className="mb-4 leading-7">{zh ? "这五条全部未计分，不代表没有困难或不需要支持。" : "All five are unscored; this does not mean no difficulty or no need for support."}</p>}
      <dl className="space-y-3">{writtenLanguageCategories.map(c => <div key={c.id} className="flex items-start justify-between gap-4"><dt className="min-w-0">{c.id === "na" ? (zh ? "未计分：没有经历／无法回想／保留回答" : "Unscored: no experience / unclear recall / withheld") : c.label[locale]}</dt><dd data-written-language-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold">{r.counts[c.id]} / 5</dd></div>)}</dl>
      <h4 className="my-4 font-semibold">{zh ? "逐条观察与所选类别" : "Individual observations and selected categories"}</h4>
      <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-written-language-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{o.category === "na" ? (zh ? "未计分" : "Unscored") : writtenLanguageCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
      <a className="mt-5 inline-block min-h-11 py-2 font-semibold underline" href={`#written-language-public-${r.id}`}>{zh ? "阅读下方完整主题说明" : "Read the complete theme below"}</a>{" · "}
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, quiz.profiles[i].id)}>{zh ? "公开指南页" : "Public guide page"}</Link>
    </section>)}
  </section>;
}
