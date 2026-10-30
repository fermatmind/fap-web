import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { birthContextCategories, type BirthContextRecord } from "@/lib/questionnaires/birthContext16";

export function BirthContextSupport({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <aside data-birth-context-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "这是供有分娩经历、愿意采用此背景的成年人本人使用的16条原创回顾，不作伴侣或照顾者代理报告，不是EPDS、PHQ-9、临床筛查或诊断。四个可能重叠的编辑主题尚非验证独立维度。类别不能确认或排除产后抑郁或其他状况，不能建立原因、严重度、人群排名、联结、身份或育儿能力，中英文测量等值尚未建立。" : "These 16 original self-recollections are for an adult who has given birth and chooses this context, not a partner or caregiver proxy report, EPDS, PHQ-9, a clinical screen or a diagnosis. Four overlapping editorial topics are not validated independent dimensions. Categories cannot confirm or exclude postpartum depression or another condition, establish a cause, severity, population rank, bonding, identity or parenting capacity. English and Chinese measurement equivalence is not established."}</p>
    <p>{zh ? "可向合格医疗或心理健康专业人员询问，不必达到计数、等待两周或完成记录。只凭回忆，不要求活动、身体检查、睡眠喂养改变、思维练习或重现分娩。已有照护、意见、监测和安全支持独立保留，不用记录推迟评估、改药或取消支持。页面不能判断本人或婴儿安全，不评估医疗需要或紧急程度，也不替代已有专业意见。若有即时危险或无法保障安全，请寻求当地紧急援助而非继续。" : "You can ask a qualified healthcare or mental-health professional without a count, a two-week wait or a completed record. Recall only. No activity, body check, sleep or feeding change, thought exercise or recreation of a birth is required. Keep existing care, advice, monitoring and safety support independent; do not use a record to postpone assessment, change medicine or cancel support. The page cannot assess your safety or an infant’s safety. It cannot assess healthcare need or urgency or replace existing advice. In immediate danger or if you cannot stay safe, seek local emergency assistance instead of continuing."}</p>
    <p className="text-sm">{zh ? "过去四周只是编辑回忆窗口，不是诊断的产后区间或等待期。不输入分娩日期、妊娠史、儿童信息或个人叙述；不假设性别、家长身份、婴儿存活、孩子在家或特定照护角色。标签描述回忆贴切程度，不是频率、点数或症状强度。未计分与不符分开，少量或未计分不证明健康或安全；未询问自伤不能证明安全。四篇全文与支持始终公开，页面不能观察任何人或紧急响应。" : "Four weeks is an editorial recall window, not a diagnostic postpartum interval or waiting rule. No birth date, pregnancy history, child information or personal account is entered; gender, parent identity, a living baby, a child at home and a particular care role are not assumed. Labels describe recollection matches, not frequency, points or symptom intensity. Unscored stays distinct from does not match; a small or unscored record does not establish health or safety. Not asking about self-harm does not establish safety. Four complete guides and support remain public. The page cannot observe anyone or provide emergency response."}</p>
  </aside>;
}
export function BirthContextReport({ quiz, records, locale }: { quiz: Questionnaire; records: BirthContextRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-birth-context-result className="space-y-7" aria-labelledby="birth-context-result-heading">
    <h2 id="birth-context-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <p className="leading-7">{zh ? "类别只作记录，不作点数。每个主题六种计数合计四条；未计分与不符分别显示。没有总分、均值、最高项或风险判断。" : "Categories are recorded without points. Each theme’s six counts add to four statements; unscored stays separate from does not match. There is no total, mean, highest theme or risk judgment."}</p>
    <BirthContextSupport locale={locale} />
    {records.map((r, i) => <section key={r.id} data-birth-context-theme={r.id} className="rounded-lg border border-slate-300 p-4">
      <h3 className="mb-4 text-xl font-semibold">{quiz.directions[i].title[locale]}</h3>
      {r.counts.na === 4 && <p data-birth-context-unscored className="mb-4 leading-7">{zh ? "这四条全部未计分，不代表没有困难或不需要支持。" : "All four are unscored; this does not mean no difficulty or no need for support."}</p>}
      <dl className="space-y-3">{birthContextCategories.map(c => <div key={c.id} className="flex items-start justify-between gap-4"><dt className="min-w-0">{c.id === "na" ? (zh ? "未计分：没有经历／无法回想／保留回答" : "Unscored: no experience / unclear recall / withheld") : c.label[locale]}</dt><dd data-birth-context-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold">{r.counts[c.id]} / 4</dd></div>)}</dl>
      <h4 className="my-4 font-semibold">{zh ? "逐条观察与所选类别" : "Individual observations and selected categories"}</h4>
      <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-birth-context-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{o.category === "na" ? (zh ? "未计分" : "Unscored") : birthContextCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
      <a className="mt-5 inline-block min-h-11 py-2 font-semibold underline" href={`#birth-context-public-${r.id}`}>{zh ? "阅读下方完整主题说明" : "Read the complete theme below"}</a>{" · "}
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, quiz.profiles[i].id)}>{zh ? "公开指南页" : "Public guide page"}</Link>
    </section>)}
  </section>;
}
