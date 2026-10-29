import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { supportReflectionCategories, type SupportReflectionRecord } from "@/lib/questionnaires/supportReflection18";

export function SupportReflectionSupport({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <aside data-support-reflection-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "这是成年人的原创个人回顾，不是临床筛查，不判是否需要治疗、是否准备好，也不划改变阶段。困扰、资源、障碍与疑问可以并存，不相互抵消。可以保留回答、暂停或离开，无需披露私人经历。" : "This original personal reflection is for adults, not a clinical screen. It gives no verdict about needing therapy, being ready or a stage of change. Concerns, resources, barriers and questions can coexist without cancelling each other. You may withhold answers, pause or leave without private disclosure."}</p>
    <p>{zh ? "想得到支持时，可以联系合格专业人士，先问流程并决定分享多少；不必完成练习、达到计数或等待规定时长。如果有即时危险或无法保障自身安全，请寻求当地紧急援助，而不是继续本练习。" : "When you want support, you can contact a qualified professional, ask about the process and choose how much to share. No completion or count is required, and this reflection sets no waiting period. If you are in immediate danger or cannot stay safe, seek local emergency help instead of continuing."}</p>
    <p className="text-sm">{zh ? "未知、没有经历或保留回答不代表一切没事；四篇全文在任何回答状态都公开。记录不替代个别评估，也不能解释或排除身体健康问题。" : "Unknown, inapplicable or withheld answers are not an all-clear finding. All four full guides remain public for every response pattern. The record does not replace an individual assessment or explain or exclude a physical health concern."}</p>
  </aside>;
}
export function SupportReflectionReport({ quiz, records, locale }: { quiz: Questionnaire; records: SupportReflectionRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-support-reflection-result className="space-y-7" aria-labelledby="support-reflection-result-heading">
    <h2 id="support-reflection-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <p className="leading-7">{zh ? "类别只作记录，不作点数。各主题六类计数合计各自条数（4或5条），逐条标签保留。内容方向不同，不能相加或排名；没有总分、均值、准备等级、诊断或治疗结论。" : "Categories are recorded without points. Each theme’s six counts add to its own item count (four or five), with individual labels retained. Different descriptions cannot be added or ranked; there is no total, mean, readiness tier, diagnosis or therapy verdict."}</p>
    <SupportReflectionSupport locale={locale} />
    {records.map((r, i) => <section key={r.id} data-support-reflection-theme={r.id} className="rounded-lg border border-slate-300 p-4">
      <h3 className="mb-4 text-xl font-semibold">{quiz.directions[i].title[locale]}</h3>
      {r.observations.every(o => ["unsure", "na", "withheld"].includes(o.category)) && <p data-support-reflection-unscored className="mb-4 leading-7">{zh ? "本主题全部为未知、没有经历或保留回答，未据此推断个人情况，不代表不需要支持。" : "This theme is entirely unknown, inapplicable or withheld. No personal finding is inferred; this does not mean support is unnecessary."}</p>}
      <dl className="space-y-3">{supportReflectionCategories.map(c => <div key={c.id} className="flex items-start justify-between gap-4"><dt className="min-w-0">{c.label[locale]}</dt><dd data-support-reflection-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold">{r.counts[c.id]} / {r.observations.length}</dd></div>)}</dl>
      <h4 className="my-4 font-semibold">{zh ? "逐条陈述与所选类别" : "Individual statements and selected categories"}</h4>
      <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-support-reflection-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{supportReflectionCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
      <a className="mt-5 inline-block min-h-11 py-2 font-semibold underline" href={`#support-reflection-public-${r.id}`}>{zh ? "阅读下方完整主题说明" : "Read the complete theme below"}</a>{" · "}
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, quiz.profiles[i].id)}>{zh ? "公开指南页" : "Public guide page"}</Link>
    </section>)}
  </section>;
}
