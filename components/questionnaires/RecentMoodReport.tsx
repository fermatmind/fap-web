import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { recentMoodCategories, type RecentMoodRecord } from "@/lib/questionnaires/recentMood12";

export function RecentMoodSupport({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <aside data-recent-mood-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "这是供成年人自愿使用的12条原创近期心情描述，不是PHQ-9、SDS、临床筛查或诊断。三个可能重叠的编辑主题尚非验证独立维度。类别不能确认或排除抑郁或其他状况，不能建立原因、严重度、人群排名、智力、工作适配或个人价值，中英文测量等值尚未建立。一般心情主题本已存在于独立临床评估，本版不替代其题目或报告。" : "These 12 voluntary original recent-mood descriptions are for adults, not PHQ-9, SDS, a clinical screen or a diagnosis. Three overlapping editorial topics are not validated independent dimensions. Categories cannot confirm or exclude depression or another condition, establish a cause, severity, population rank, intelligence, work suitability or personal worth. English and Chinese measurement equivalence is not established. General mood themes already occur in the separate clinical assessment; this does not replace its questions or reports."}</p>
    <p>{zh ? "可向合格医疗或心理健康专业人员询问，不必达到计数、等待两周或完成记录。只凭回忆，不要求任务、睡眠饮食改变、身体测量或思维练习。已有照护、意见和安全支持独立保留；不要因记录推迟评估、改药或取消支持。页面不能解释身体变化或建立它无害，不评估医疗需要或紧急程度，也不替代已有专业意见。若有即时危险或无法保障安全，请寻求当地紧急援助而非继续。" : "You can ask a qualified healthcare or mental-health professional without a count, two weeks of symptoms or a completed record. Recall only: no task, sleep or food change, body measurement or thought exercise is required. Keep existing care, advice and safety support independent. Do not use a record to postpone assessment, change medicine or cancel support. The page cannot explain a physical change or establish that it is harmless. It cannot assess healthcare need or urgency or replace existing advice. In immediate danger or if you cannot stay safe, seek local emergency assistance instead of continuing."}</p>
    <p className="text-sm">{zh ? "计数针对描述，不是天数、症状、餐数、夜数、发作或影响程度。未计分与没有注意到分开；少量或未计分不证明健康或没有支持需要。没有自伤题不证明安全。三篇全文及支持说明始终公开，页面不能观察你或作紧急响应。" : "Counts concern descriptions, not days, symptoms, meals, nights, episodes or amounts of impact. Unscored stays separate from did not notice; a small or unscored record does not establish health or absence of support needs. No self-harm question does not establish safety. Three complete guides and support remain public. The page cannot observe you or provide an emergency response."}</p>
  </aside>;
}
export function RecentMoodReport({ quiz, records, locale }: { quiz: Questionnaire; records: RecentMoodRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-recent-mood-result className="space-y-7" aria-labelledby="recent-mood-result-heading">
    <h2 id="recent-mood-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <p className="leading-7">{zh ? "类别只作记录，不作点数。每个主题六种计数合计四条；未计分与没有注意到分别显示。没有总分、均值、最高项或风险判断。" : "Categories are recorded without points. Each theme’s six counts add to four statements; unscored stays separate from did not notice. There is no total, mean, highest theme or risk judgment."}</p>
    <RecentMoodSupport locale={locale} />
    {records.map((r, i) => <section key={r.id} data-recent-mood-theme={r.id} className="rounded-lg border border-slate-300 p-4">
      <h3 className="mb-4 text-xl font-semibold">{quiz.directions[i].title[locale]}</h3>
      {r.counts.na === 4 && <p data-recent-mood-unscored className="mb-4 leading-7">{zh ? "这四条全部未计分，不代表没有困难或不需要支持。" : "All four are unscored; this does not mean no difficulty or no need for support."}</p>}
      <dl className="space-y-3">{recentMoodCategories.map(c => <div key={c.id} className="flex items-start justify-between gap-4"><dt className="min-w-0">{c.id === "na" ? (zh ? "未计分：没有经历／无法回想／保留回答" : "Unscored: no experience / unclear recall / withheld") : c.label[locale]}</dt><dd data-recent-mood-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold">{r.counts[c.id]} / 4</dd></div>)}</dl>
      <h4 className="my-4 font-semibold">{zh ? "逐条观察与所选类别" : "Individual observations and selected categories"}</h4>
      <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-recent-mood-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{o.category === "na" ? (zh ? "未计分" : "Unscored") : recentMoodCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
      <a className="mt-5 inline-block min-h-11 py-2 font-semibold underline" href={`#recent-mood-public-${r.id}`}>{zh ? "阅读下方完整主题说明" : "Read the complete theme below"}</a>{" · "}
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, quiz.profiles[i].id)}>{zh ? "公开指南页" : "Public guide page"}</Link>
    </section>)}
  </section>;
}
