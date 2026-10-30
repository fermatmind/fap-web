import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { moodActivityCategories, type MoodActivityRecord } from "@/lib/questionnaires/moodActivity16";

export function MoodActivitySupport({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <aside data-mood-activity-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "这是供成年人自愿使用的16条原创心情与活动回顾，不是MDQ、HCL-32、YMRS、临床筛查或诊断。四个可能重叠的编辑主题尚非验证独立维度。类别不能确认或排除双相障碍、躁狂、轻躁狂或其他状况，不能识别发作、建立原因、严重度、人群排名、人格或决策能力，中英文测量等值尚未建立。" : "These 16 voluntary original mood-and-activity recollections are for adults, not MDQ, HCL-32, YMRS, a clinical screen or a diagnosis. Four overlapping editorial topics are not validated independent dimensions. Categories cannot confirm or exclude bipolar disorder, mania, hypomania or another condition, identify an episode, establish a cause, severity, population rank, personality or decision-making capacity. English and Chinese measurement equivalence is not established."}</p>
    <p>{zh ? "可向合格医疗或心理健康专业人员询问，不必达到计数、证明特定时长或完成记录。只凭回忆，不要求睡眠或活动改变、身体检查、回看消息或决定任务。已有照护、意见和安全支持独立保留，不用记录推迟评估、改药或取消支持。页面不能认证睡眠足够或决定安全，不评估医疗需要或紧急程度，也不替代已有专业意见。若有即时危险或无法保障安全，请寻求当地紧急援助而非继续。" : "You can ask a qualified healthcare or mental-health professional without a count, a particular duration or a completed record. Recall only. No sleep or activity change, body check, message review or decision task is required. Keep existing care, advice and safety support independent; do not use a record to postpone assessment, change medicine or cancel support. The page cannot certify sleep is sufficient or a decision is safe. It cannot assess healthcare need or urgency or replace existing advice. In immediate danger or if you cannot stay safe, seek local emergency assistance instead of continuing."}</p>
    <p className="text-sm">{zh ? "参照同一段自选回忆，不输入日期或个人叙述，也不证明经历同时发生或构成一次发作。标签只描述对回忆的贴切程度，不是频率、点数或严重度。未计分与不符分开；少量或未计分不证明健康或没有支持需要。四篇全文及支持始终公开，页面不能观察你或作紧急响应。" : "Refer to one optional remembered period, without entering dates or a personal account; this does not prove experiences occurred together or formed an episode. Labels describe recollection matches, not frequency, points or severity. Unscored stays distinct from does not match; a small or unscored record does not establish health or absence of support needs. Four complete guides and support remain public. The page cannot observe you or provide an emergency response."}</p>
  </aside>;
}
export function MoodActivityReport({ quiz, records, locale }: { quiz: Questionnaire; records: MoodActivityRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-mood-activity-result className="space-y-7" aria-labelledby="mood-activity-result-heading">
    <h2 id="mood-activity-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <p className="leading-7">{zh ? "类别只作记录，不作点数。每个主题六种计数合计四条；未计分与不符分别显示。没有总分、均值、最高项或风险判断。" : "Categories are recorded without points. Each theme’s six counts add to four statements; unscored stays separate from does not match. There is no total, mean, highest theme or risk judgment."}</p>
    <MoodActivitySupport locale={locale} />
    {records.map((r, i) => <section key={r.id} data-mood-activity-theme={r.id} className="rounded-lg border border-slate-300 p-4">
      <h3 className="mb-4 text-xl font-semibold">{quiz.directions[i].title[locale]}</h3>
      {r.counts.na === 4 && <p data-mood-activity-unscored className="mb-4 leading-7">{zh ? "这四条全部未计分，不代表没有困难或不需要支持。" : "All four are unscored; this does not mean no difficulty or no need for support."}</p>}
      <dl className="space-y-3">{moodActivityCategories.map(c => <div key={c.id} className="flex items-start justify-between gap-4"><dt className="min-w-0">{c.id === "na" ? (zh ? "未计分：没有经历／无法回想／保留回答" : "Unscored: no experience / unclear recall / withheld") : c.label[locale]}</dt><dd data-mood-activity-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold">{r.counts[c.id]} / 4</dd></div>)}</dl>
      <h4 className="my-4 font-semibold">{zh ? "逐条观察与所选类别" : "Individual observations and selected categories"}</h4>
      <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-mood-activity-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{o.category === "na" ? (zh ? "未计分" : "Unscored") : moodActivityCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
      <a className="mt-5 inline-block min-h-11 py-2 font-semibold underline" href={`#mood-activity-public-${r.id}`}>{zh ? "阅读下方完整主题说明" : "Read the complete theme below"}</a>{" · "}
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, quiz.profiles[i].id)}>{zh ? "公开指南页" : "Public guide page"}</Link>
    </section>)}
  </section>;
}
