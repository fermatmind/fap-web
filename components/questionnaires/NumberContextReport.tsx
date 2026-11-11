import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { ObservationChoiceCounts } from "./ObservationChoiceCounts";
import Link from "next/link";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { numberContextCategories, type NumberContextRecord } from "@/lib/questionnaires/numberContext20";

export function NumberContextSupport({ locale, compact = false, copy = text => text }: { locale: Locale; compact?: boolean; copy?: (text: string) => string }) {
  const zh = locale === "zh";
  if (compact) return <aside data-number-context-support className="border-l-2 border-amber-300 pl-4 text-sm leading-7 text-slate-700"><p>{zh ? copy("不必完成记录或达到某种计数，才可以询问合格专业人员。保留已有照护与有用辅助。若有即时危险或无法保障安全，请寻求当地紧急援助；本页不能评估紧急程度。") : "You can ask a qualified professional without completing the record or reaching a count. Keep existing care and useful aids. If you are in immediate danger or cannot stay safe, seek local emergency assistance; this page cannot assess urgency."}</p></aside>;
  return <aside data-number-context-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? copy("这是供成年人自愿使用的20条原创日常数字观察，不是计算障碍筛查工具、诊断或能力测试。四个可能重叠的主题尚非验证独立维度；使用工具和数学担忧不是追加诊断指标。类别不建立计算障碍、智力、努力、熟练程度、财务能力、工作适配或原因，中英文测量等值尚未建立。只凭回忆，可保留回答、暂停或离开。") : "These 20 voluntary original everyday-number observations are for adults, not a dyscalculia screener, diagnosis or ability test. Four overlapping topics are not validated independent dimensions; tool use and maths anxiety are not additional diagnostic indicators. Categories cannot establish dyscalculia, intelligence, effort, proficiency, financial capacity, work suitability or a cause. English and Chinese measurement equivalence is not established. Recall only; you may withhold, pause or leave."}</p>
    <p>{zh ? copy("可向合适的学习支持或评估专业人员询问，不必达到计数、证明童年困难或完成记录。不安排计算、看钟测试、测量、记忆或交易任务；无需撤掉工具、已有核对，提供真实数字或向雇主披露。不要用记录决定药物剂量、出行安全、电气工作、付款或财务事项，也不用它推迟医疗、评估或已有支持、解释掉新出现或变化的健康担忧。本页不评估医疗需要或紧急程度，不替代已有专业意见。若有即时危险或无法保障安全，请寻求当地紧急援助，而不是继续。") : "You can ask an appropriately qualified learning-support or assessment professional without a count, proof of childhood difficulty or a completed record. No calculation, clock-reading, measurement, memory or transaction task is assigned; no removal of tools or existing checks, real figures or employer disclosure is required. Do not use a record for medication doses, travel safety, electrical work, payments or financial decisions, or to postpone healthcare, assessment or existing support or explain away a new or changing health concern. This page cannot assess healthcare need or urgency or replace existing advice. If you are in immediate danger or cannot stay safe, seek local emergency assistance instead of continuing."}</p>
    <p className="text-sm">{zh ? copy("计数只算描述，不是错误、计算次数、金额、时长或计算障碍概率。数值推理练习保留独立题目、答对数与指南，不与本记录合并。四篇新全文及支持说明始终公开，未计分与没有注意到分开。页面不能观察你或作紧急响应。") : "Counts concern descriptions, not errors, calculations, amounts, time or the probability of dyscalculia. Numerical-reasoning practice retains its separate questions, correct counts and guides without combination with this record. Four complete new guides and support remain public; unscored stays separate from did not notice. The page cannot observe you or provide an emergency response."}</p>
  </aside>;
}
export function NumberContextReport({ quiz, records, locale, readingProfiles, displayLocale = locale, copy = text => text }: { quiz: Questionnaire; readingProfiles?: readonly QuestionnaireProfile[]; records: NumberContextRecord[]; locale: Locale; displayLocale?: DisplayLocale; copy?: (text: string) => string }) {
  const zh = locale === "zh";
  return <section data-number-context-result className="min-w-0 space-y-7 [overflow-wrap:anywhere]" aria-labelledby="number-context-result-heading">
    <header className="rounded-xl border border-cyan-200 bg-cyan-50/50 p-4 sm:p-6">
      <h2 id="number-context-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold text-cyan-950 outline-none">{quiz.resultHeading![locale]}</h2>
      <p className="mt-3 max-w-prose leading-7">{zh ? copy("找一类你想回看的日常数字任务。每栏列出本次选过的频率类别及对应题目数，帮助你找到下方相关情境。") : "Pick a kind of everyday number task to revisit. Each panel shows the frequencies you selected and their prompt counts, with links to the corresponding contexts below."}</p>
      <nav className="mt-5 grid gap-px overflow-hidden rounded-lg border border-cyan-200 bg-cyan-200 md:grid-cols-2" aria-label={zh ? copy("按日常数字任务阅读") : "Read by everyday number task"}>
        {records.map((record, index) => <div key={record.id} className="min-w-0 bg-white px-3 pb-3 sm:px-4">
          <a className="inline-flex min-h-11 items-center font-semibold text-cyan-950 underline underline-offset-4" href={`#record-${quiz.slug}-${record.id}`}>{quiz.directions[index].title[locale]}</a>
          <ObservationChoiceCounts copy={copy} categories={numberContextCategories} counts={record.counts} locale={locale} shortLabels={{ na: { zh: "未计分", en: "Unscored" } }} />
        </div>)}
      </nav>
    </header>
    <NumberContextSupport locale={locale} copy={copy} compact />
    {records.map((r, i) => {
      const original = quiz.profiles[i];
      const profile = readingProfiles?.find(item => item.id === original.id && item.directionIds.length === original.directionIds.length && item.directionIds.every((id, index) => id === original.directionIds[index]) && item.resultReading?.quizSlug === quiz.slug && item.resultReading.profileId === original.id) ?? original;
      const previewSectionIds = ["section-3", "section-5"];
      return <section key={r.id} id={`record-${quiz.slug}-${r.id}`} data-number-context-theme={r.id} aria-labelledby={`number-context-record-title-${r.id}`} className="scroll-mt-24 border-t border-slate-200 pt-6">
        <h3 id={`number-context-record-title-${r.id}`} className="mb-4 text-xl font-semibold leading-8">{quiz.directions[i].title[locale]}</h3>
        <p className="leading-8" data-number-context-topic-summary>{original.summary[locale]}</p>
        <p className="my-4 text-sm leading-7 text-slate-600" data-number-context-choice-pattern>{numberContextCategories.filter(category => r.counts[category.id] > 0).map(category => `${copy(category.label[locale])} ${r.counts[category.id]}${zh ? copy("条") : " statements"}`).join(zh ? copy("；") : "; ")}</p>
        {r.counts.na === 5 && <p data-number-context-unscored className="mb-4 leading-7">{zh ? copy("这五条全部未计分，不代表没有困难或不需要支持。") : "All five are unscored; this does not mean no difficulty or no need for support."}</p>}
        <div id={`number-context-public-${r.id}`} className="scroll-mt-24" data-number-context-full-reading>
          <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} traditional={displayLocale === "zh-TW"} headingLevel={4} idPrefix={`number-context-result-reading-${profile.id}`} mode="result" previewSectionIds={previewSectionIds} showHeadline={false} showSummary={false} />
        </div>
        <details className="my-5 border-t border-slate-200 pt-3">
          <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? copy(`查看这${r.observations.length}条回答与类别记录`) : `Review these ${r.observations.length} responses and categories`}</summary>
          <dl className="space-y-3">{numberContextCategories.map(c => <div key={c.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 rounded-lg bg-slate-50 px-3 py-3"><dt className="min-w-0">{c.id === "na" ? (zh ? copy("未计分：没有经历／无法回想／保留回答") : "Unscored: no experience / unclear recall / withheld") : copy(c.label[locale])}</dt><dd data-number-context-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold tabular-nums">{r.counts[c.id]} / 5</dd></div>)}</dl>
          <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-number-context-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{o.category === "na" ? (zh ? copy("未计分") : "Unscored") : copy(numberContextCategories.find(c => c.id === o.category)!.label[locale])}</p></li>)}</ul>
        </details>
        <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(displayLocale, quiz.slug, original.id)}>{zh ? copy("单独打开这篇完整公开指南") : "Open this complete public guide separately"}</Link>
      </section>;
    })}
    <details className="border-t border-slate-200 pt-4">
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? copy("计数方法、使用范围与支持说明") : "Counting method, scope and support"}</summary>
      <p className="leading-7">{zh ? copy("类别只作记录，不作点数。每个主题六种计数合计五条；未计分与没有注意到分别显示。没有总分、均值、最高项或风险判断。") : "Categories are recorded without points. Each theme’s six counts add to five statements; unscored stays separate from did not notice. There is no total, mean, highest theme or risk judgment."}</p>
      <NumberContextSupport locale={locale} copy={copy} />
    </details>
  </section>;
}
