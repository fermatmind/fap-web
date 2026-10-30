import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { feedbackWorthCategories, type FeedbackWorthRecord } from "@/lib/questionnaires/feedbackWorth12";

export function FeedbackWorthSupport({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <aside data-feedback-worth-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "这是成年人原创自述，不作自恋或人格障碍筛查、身份或关系安全判断。支持不以完成题目、标签或计数为条件。" : "This original adult self-description does not screen for narcissism or a personality disorder or judge identity or relationship safety. Support is available without completion, a label or a count."}</p>
    <p>{zh ? "对实际顾虑寻求支持，不需标签、计数或完成。可与合格专业人士谈令人困扰的反应，自行决定分享多少。活动不要求披露、对峙、批评试验或联系反馈者，不判断安全、不规定治疗。可以随时离开；有即时危险时应寻求当地紧急援助，不继续依靠问卷。" : "Support is available for an actual concern without a label, a count or completion. You may discuss distressing reactions with a qualified professional and decide what to share. This activity asks for no disclosure, confrontation, criticism experiment or contact with someone who gave feedback. It cannot judge safety or prescribe treatment. You can leave at any time; immediate danger calls for local emergency help rather than continuing a questionnaire."}</p>
    <p>{zh ? "不同描述分别保留，不作反向计分。可以随时暂停或离开，不必披露私人经历。" : "Different descriptions remain separate, without reverse scoring. You may pause or leave without private disclosure."}</p>
  </aside>;
}
export function FeedbackWorthReport({ quiz, records, locale }: { quiz: Questionnaire; records: FeedbackWorthRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-feedback-worth-result className="space-y-7" aria-labelledby="feedback-worth-result-heading">
    <h2 id="feedback-worth-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <p className="leading-7">{zh ? "类别只作记录，不作点数。各主题六类计数合计各自四条，逐条标签保留。内容方向不同，不能相加或排名；没有总分、均值、身份类别、诊断或医疗结论。" : "Categories are recorded without points. Each theme’s six counts add to its own item count (four), with individual labels retained. Different descriptions cannot be added or ranked; there is no total, mean, identity category, diagnosis or medical verdict."}</p>
    <FeedbackWorthSupport locale={locale} />
    {records.map((r, i) => <section key={r.id} data-feedback-worth-theme={r.id} className="rounded-lg border border-slate-300 p-4">
      <h3 className="mb-4 text-xl font-semibold">{quiz.directions[i].title[locale]}</h3>
      {r.observations.every(o => ["unsure", "na", "withheld"].includes(o.category)) && <p data-feedback-worth-unscored className="mb-4 leading-7">{zh ? "本主题全部为未知、没有经历或保留回答，未据此推断个人情况，不代表不需要支持。" : "This theme is entirely unknown, inapplicable or withheld. No personal finding is inferred; this does not mean support is unnecessary."}</p>}
      <dl className="space-y-3">{feedbackWorthCategories.map(c => <div key={c.id} className="flex items-start justify-between gap-4"><dt className="min-w-0">{c.label[locale]}</dt><dd data-feedback-worth-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold">{r.counts[c.id]} / {r.observations.length}</dd></div>)}</dl>
      <h4 className="my-4 font-semibold">{zh ? "逐条陈述与所选类别" : "Individual statements and selected categories"}</h4>
      <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-feedback-worth-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{feedbackWorthCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
      <a className="mt-5 inline-block min-h-11 py-2 font-semibold underline" href={`#feedback-worth-public-${r.id}`}>{zh ? "阅读下方完整主题说明" : "Read the complete theme below"}</a>{" · "}
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, quiz.profiles[i].id)}>{zh ? "公开指南页" : "Public guide page"}</Link>
    </section>)}
  </section>;
}
