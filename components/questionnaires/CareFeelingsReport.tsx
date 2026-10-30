import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { careFeelingsCategories, type CareFeelingsRecord } from "@/lib/questionnaires/careFeelings20";

export function CareFeelingsSupport({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <aside data-care-feelings-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "供成年人自愿描述自己的回忆与近期感受，不是童年创伤问卷、忽视筛查或诊断。前15条回想童年或青少年时期，后5条只看过去四周。正向与困难经历不反向、不合分；当前感受不证明过去事件、原因或照顾者意图。回忆不清可选未计分，不必重建记忆、查照片或询问家人。" : "For adults voluntarily describing their own recollections and recent feelings, not the Childhood Trauma Questionnaire, a neglect screen or a diagnosis. The first fifteen concern childhood or adolescence; the last five concern the past four weeks. Positive and difficult descriptions are not reversed or combined. Current feelings cannot prove past events, causes or caregiver intentions. Unclear recall can stay unscored without reconstructing memories, searching photos or questioning family."}</p>
    <p>{zh ? "可向合格医疗专业人士询问支持，无需完成、达到计数或证明童年伤害。不要用记录推迟照护、改变药物或忽视安全担忧；页面不评医疗需要或紧急程度。若有即时危险或无法保障安全，请寻求当地紧急援助而非继续。四篇全文与支持说明始终公开，回答只在本页内存。" : "You can ask a qualified healthcare professional for support without completing, reaching a count or proving childhood harm. Do not use a record to delay care, change medicine or dismiss a safety concern; this page cannot assess medical need or urgency. If you are in immediate danger or cannot stay safe, seek local emergency assistance instead of continuing. All four full guides and support information remain public. Answers stay in this page’s memory only."}</p>
  </aside>;
}
export function CareFeelingsReport({ quiz, records, locale }: { quiz: Questionnaire; records: CareFeelingsRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-care-feelings-result className="space-y-7" aria-labelledby="care-feelings-result-heading">
    <h2 id="care-feelings-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <p className="leading-7">{zh ? "类别只作记录，不作点数。每个主题六种计数合计五条；未计分与回忆不符分别显示。没有总分、均值、最高项或风险判断。" : "Categories are recorded without points. Each theme’s six counts add to five descriptions; unscored stays separate from does not fit. There is no total, mean, highest theme or risk judgment."}</p>
    <CareFeelingsSupport locale={locale} />
    {records.map((r, i) => <section key={r.id} data-care-feelings-theme={r.id} className="rounded-lg border border-slate-300 p-4">
      <h3 className="mb-4 text-xl font-semibold">{quiz.directions[i].title[locale]}</h3>
      {r.counts.na === 5 && <p data-care-feelings-unscored className="mb-4 leading-7">{zh ? "这五条全部未计分，不代表没有困难或不需要支持。" : "All five are unscored; this does not mean no difficulty or no need for support."}</p>}
      <dl className="space-y-3">{careFeelingsCategories.map(c => <div key={c.id} className="flex items-start justify-between gap-4"><dt className="min-w-0">{c.id === "na" ? (zh ? "未计分：没有经历／无法回想／保留回答" : "Unscored: cannot say / no recall / withheld") : c.label[locale]}</dt><dd data-care-feelings-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold">{r.counts[c.id]} / 5</dd></div>)}</dl>
      <h4 className="my-4 font-semibold">{zh ? "逐条观察与所选类别" : "Individual observations and selected categories"}</h4>
      <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-care-feelings-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{o.category === "na" ? (zh ? "未计分" : "Unscored") : careFeelingsCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
      <a className="mt-5 inline-block min-h-11 py-2 font-semibold underline" href={`#care-feelings-public-${r.id}`}>{zh ? "阅读下方完整主题说明" : "Read the complete theme below"}</a>{" · "}
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, quiz.profiles[i].id)}>{zh ? "公开指南页" : "Public guide page"}</Link>
    </section>)}
  </section>;
}
