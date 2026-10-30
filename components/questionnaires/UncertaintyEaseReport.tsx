import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { uncertaintyEaseCategories, type UncertaintyEaseRecord } from "@/lib/questionnaires/uncertaintyEase6";

export function UncertaintyEaseSupport({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <aside data-uncertainty-ease-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "这是成年人原创自述，不作精神病态、临床冲动或危险性筛查，也不判身份或关系安全。支持不以完成题目、标签或计数为条件。" : "This original adult self-description does not screen for psychopathy, clinical impulsivity or dangerousness or judge identity or relationship safety. Support is available without completion, a label or a count."}</p>
    <p>{zh ? "对令人困扰的体验寻求支持，不需标签、计数或完成。合格专业人士可在适当的个别场合考虑实际顾虑。本活动不作风险许可、不提治疗建议，也不授权重要后果的行动；不要求恐惧挑战、风险试验、披露或联系别人。可读完就停，有即时危险时寻求当地紧急帮助，不依赖记录。" : "You may seek support for a troubling experience without a label, a count or completion. A qualified professional can consider actual concerns in an appropriate individual setting. The activity gives no risk clearance, treatment advice or permission for a consequential action. It asks for no fear challenge, risky experiment, disclosure or contact with another person. You can stop after reading. For immediate danger, seek local emergency help rather than rely on this record."}</p>
    <p>{zh ? "不同描述分别保留，不作反向计分。可以随时暂停或离开，不必披露私人经历。" : "Different descriptions remain separate, without reverse scoring. You may pause or leave without private disclosure."}</p>
  </aside>;
}
export function UncertaintyEaseReport({ quiz, records, locale }: { quiz: Questionnaire; records: UncertaintyEaseRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-uncertainty-ease-result className="space-y-7" aria-labelledby="uncertainty-ease-result-heading">
    <h2 id="uncertainty-ease-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <p className="leading-7">{zh ? "类别只作记录，不作点数。各主题六类计数合计各自六条，逐条标签保留。内容方向不同，不能相加或排名；没有总分、均值、身份类别、诊断或医疗结论。" : "Categories are recorded without points. Each theme’s six counts add to its own item count (six), with individual labels retained. Different descriptions cannot be added or ranked; there is no total, mean, identity category, diagnosis or medical verdict."}</p>
    <UncertaintyEaseSupport locale={locale} />
    {records.map((r, i) => <section key={r.id} data-uncertainty-ease-theme={r.id} className="rounded-lg border border-slate-300 p-4">
      <h3 className="mb-4 text-xl font-semibold">{quiz.directions[i].title[locale]}</h3>
      {r.observations.every(o => ["unsure", "na", "withheld"].includes(o.category)) && <p data-uncertainty-ease-unscored className="mb-4 leading-7">{zh ? "本主题全部为未知、没有经历或保留回答，未据此推断个人情况，不代表不需要支持。" : "This theme is entirely unknown, inapplicable or withheld. No personal finding is inferred; this does not mean support is unnecessary."}</p>}
      <dl className="space-y-3">{uncertaintyEaseCategories.map(c => <div key={c.id} className="flex items-start justify-between gap-4"><dt className="min-w-0">{c.label[locale]}</dt><dd data-uncertainty-ease-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold">{r.counts[c.id]} / {r.observations.length}</dd></div>)}</dl>
      <h4 className="my-4 font-semibold">{zh ? "逐条陈述与所选类别" : "Individual statements and selected categories"}</h4>
      <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-uncertainty-ease-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{uncertaintyEaseCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
      <a className="mt-5 inline-block min-h-11 py-2 font-semibold underline" href={`#uncertainty-ease-public-${r.id}`}>{zh ? "阅读下方完整主题说明" : "Read the complete theme below"}</a>{" · "}
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, quiz.profiles[i].id)}>{zh ? "公开指南页" : "Public guide page"}</Link>
    </section>)}
  </section>;
}
