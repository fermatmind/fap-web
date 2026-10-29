import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { pressureActionsCategories, type PressureActionsRecord } from "@/lib/questionnaires/pressureActions12";

export function PressureActionsSupport({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <aside data-pressure-actions-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "这是成年人的原创日常行动观察，不分配四种默认反应类型，不测生理、不推断创伤经历，也不作诊断。你可以保留回答、暂停或离开，无需讲述事件、对抗或重新联系任何人。" : "This original everyday-action reflection is for adults. It assigns no default four-F type, measures no physiology, infers no trauma history and gives no diagnosis. You can withhold an answer, pause or leave without an event narrative, confrontation or renewed contact."}</p>
    <p>{zh ? "想得到支持时，可以联系合格专业人士，先问流程并决定分享多少；不必完成练习或达到某种计数。如果有即时危险或无法保障自身安全，请寻求当地紧急援助，而不是继续本练习。" : "When you want support, you can contact a qualified professional, ask about the process and choose how much to share. No completion or count is required. If you are in immediate danger or cannot stay safe, seek local emergency help instead of continuing."}</p>
    <p className="text-sm">{zh ? "频率类别不建立同意、责任、人格、治疗建议或未来行为预测。数量少或未计分不代表一切没事，四篇全文在任何回答状态都公开可读。" : "Frequency categories establish no consent, responsibility, personality, treatment advice or prediction. A small count or unscored record is not an all-clear finding. All four full guides remain public for every response pattern."}</p>
  </aside>;
}
export function PressureActionsReport({ quiz, records, locale }: { quiz: Questionnaire; records: PressureActionsRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-pressure-actions-result className="space-y-7" aria-labelledby="pressure-actions-result-heading">
    <h2 id="pressure-actions-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <p className="leading-7">{zh ? "类别只作记录，不作点数。每个主题六种计数合计三条；未计分与没有注意到分别显示。没有总分、均值、最高项或风险判断。" : "Categories are recorded without points. Each theme’s six counts add to three statements; unscored stays separate from did not notice. There is no total, mean, highest theme or risk judgment."}</p>
    <PressureActionsSupport locale={locale} />
    {records.map((r, i) => <section key={r.id} data-pressure-actions-theme={r.id} className="rounded-lg border border-slate-300 p-4">
      <h3 className="mb-4 text-xl font-semibold">{quiz.directions[i].title[locale]}</h3>
      {r.counts.na === 3 && <p data-pressure-actions-unscored className="mb-4 leading-7">{zh ? "这三条全部未计分，不代表没有相关行动或不需要支持。" : "All three are unscored; this does not mean no actions or no need for support."}</p>}
      <dl className="space-y-3">{pressureActionsCategories.map(c => <div key={c.id} className="flex items-start justify-between gap-4"><dt className="min-w-0">{c.id === "na" ? (zh ? "未计分：没有机会／无法回想／保留回答" : "Unscored: no opportunity / unclear recall / withheld") : c.label[locale]}</dt><dd data-pressure-actions-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold">{r.counts[c.id]} / 3</dd></div>)}</dl>
      <h4 className="my-4 font-semibold">{zh ? "逐条观察与所选类别" : "Individual observations and selected categories"}</h4>
      <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-pressure-actions-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{o.category === "na" ? (zh ? "未计分" : "Unscored") : pressureActionsCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
      <a className="mt-5 inline-block min-h-11 py-2 font-semibold underline" href={`#pressure-actions-public-${r.id}`}>{zh ? "阅读下方完整主题说明" : "Read the complete theme below"}</a>{" · "}
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, quiz.profiles[i].id)}>{zh ? "公开指南页" : "Public guide page"}</Link>
    </section>)}
  </section>;
}
