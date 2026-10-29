import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { connectionCheckInCategories, type ConnectionCheckInRecord } from "@/lib/questionnaires/connectionCheckIn21";

export function ConnectionCheckInSupport({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <aside data-connection-checkin-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "这是成年人的原创联系与归属回顾，不施测UCLA量表，不生成孤独等级、人格或诊断。主动独处不等于不想要的孤独；类别也不评价你的身份、关系或价值。可以保留回答、暂停或离开，无需披露私人经历、重新联系或加入群体。" : "This original connection and belonging reflection is for adults. It administers no UCLA scale and assigns no loneliness level, personality or diagnosis. Chosen solitude need not be unwanted loneliness; categories do not judge identity, relationships or worth. You may withhold answers, pause or leave without private disclosure, renewed contact or joining a group."}</p>
    <p>{zh ? "想得到支持时，可以联系合格专业人士，先问流程并决定分享多少；不必完成练习或达到某种计数。如果有即时危险或无法保障自身安全，请寻求当地紧急援助，而不是继续本练习。" : "When you want support, you can contact a qualified professional, ask about the process and choose how much to share. No completion or count is required. If you are in immediate danger or cannot stay safe, seek local emergency help instead of continuing."}</p>
    <p className="text-sm">{zh ? "三个主题可能重叠，不是已验证的独立维度。数量少或未计分不代表没有困难；三篇全文在任何回答状态都公开可读。" : "The three topics may overlap and are not validated independent dimensions. A small count or unscored record does not establish an absence of difficulty. All three full guides remain public for every response pattern."}</p>
  </aside>;
}
export function ConnectionCheckInReport({ quiz, records, locale }: { quiz: Questionnaire; records: ConnectionCheckInRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-connection-checkin-result className="space-y-7" aria-labelledby="connection-checkin-result-heading">
    <h2 id="connection-checkin-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <p className="leading-7">{zh ? "类别只作记录，不作点数。每个主题六种计数合计七条；未计分与没有注意到分别显示。没有总分、均值、最高项或风险判断。" : "Categories are recorded without points. Each theme’s six counts add to seven statements; unscored stays separate from did not notice. There is no total, mean, highest theme or risk judgment."}</p>
    <ConnectionCheckInSupport locale={locale} />
    {records.map((r, i) => <section key={r.id} data-connection-checkin-theme={r.id} className="rounded-lg border border-slate-300 p-4">
      <h3 className="mb-4 text-xl font-semibold">{quiz.directions[i].title[locale]}</h3>
      {r.counts.na === 7 && <p data-connection-checkin-unscored className="mb-4 leading-7">{zh ? "这七条全部未计分，不代表没有困难或不需要支持。" : "All seven are unscored; this does not mean no difficulty or no need for support."}</p>}
      <dl className="space-y-3">{connectionCheckInCategories.map(c => <div key={c.id} className="flex items-start justify-between gap-4"><dt className="min-w-0">{c.id === "na" ? (zh ? "未计分：没有经历／无法回想／保留回答" : "Unscored: no experience / unclear recall / withheld") : c.label[locale]}</dt><dd data-connection-checkin-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold">{r.counts[c.id]} / 7</dd></div>)}</dl>
      <h4 className="my-4 font-semibold">{zh ? "逐条观察与所选类别" : "Individual observations and selected categories"}</h4>
      <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-connection-checkin-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{o.category === "na" ? (zh ? "未计分" : "Unscored") : connectionCheckInCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
      <a className="mt-5 inline-block min-h-11 py-2 font-semibold underline" href={`#connection-checkin-public-${r.id}`}>{zh ? "阅读下方完整主题说明" : "Read the complete theme below"}</a>{" · "}
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, quiz.profiles[i].id)}>{zh ? "公开指南页" : "Public guide page"}</Link>
    </section>)}
  </section>;
}
