import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { drinkingExperiencesCategories, type DrinkingExperiencesRecord } from "@/lib/questionnaires/drinkingExperiences20";

export function DrinkingExperiencesSupport({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <aside data-drinking-experiences-support className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "这是成年人自述的原创饮酒经历回顾，不是临床筛查，不判断依赖、戒断或安全饮酒。支持信息始终开放，无需完成练习或达到计数。" : "This original adult self-description is not a clinical screen and gives no dependence, withdrawal or safe-drinking finding. Support stays available without completion or a count."}</p>
    <p>{zh ? "寻求支持不需要任何答案或计数。如果担心饮酒或身体症状，可以请合格医疗专业人士评估实际情况。本练习不指派突然停酒、减量、继续饮酒或自行处理戒断。酒精戒断可能危险；可能涉及依赖或戒断时，突然改变饮酒前应寻求医疗建议。有即时危险或当前严重症状时，应使用当地紧急医疗服务，不要靠本练习处理。" : "Support does not depend on any answer or count. If you are concerned about drinking or bodily symptoms, a qualified health professional can assess your actual circumstances. This exercise gives no instructions to stop suddenly, reduce, continue drinking or manage withdrawal. Alcohol withdrawal can be dangerous; seek medical advice before a sudden change if dependence or withdrawal may be involved. For an immediate danger or severe current symptoms, use local emergency medical care instead of this exercise."}</p>
    <p>{zh ? "未知、没有经历或保留回答不是一切没事的结论。可随时暂停或离开，不必披露私人经历。" : "Unknown, no relevant experience and withheld are not an all-clear finding. You may pause or leave without private disclosure."}</p>
  </aside>;
}
export function DrinkingExperiencesReport({ quiz, records, locale }: { quiz: Questionnaire; records: DrinkingExperiencesRecord[]; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-drinking-experiences-result className="space-y-7" aria-labelledby="drinking-experiences-result-heading">
    <h2 id="drinking-experiences-result-heading" tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
    <p className="leading-7">{zh ? "类别只作记录，不作点数。各主题六类计数合计各自五条，逐条标签保留。内容方向不同，不能相加或排名；没有总分、均值、饮酒安全等级、诊断或医疗结论。" : "Categories are recorded without points. Each theme’s six counts add to its own item count (five), with individual labels retained. Different descriptions cannot be added or ranked; there is no total, mean, safe-drinking tier, diagnosis or medical verdict."}</p>
    <DrinkingExperiencesSupport locale={locale} />
    {records.map((r, i) => <section key={r.id} data-drinking-experiences-theme={r.id} className="rounded-lg border border-slate-300 p-4">
      <h3 className="mb-4 text-xl font-semibold">{quiz.directions[i].title[locale]}</h3>
      {r.observations.every(o => ["unsure", "na", "withheld"].includes(o.category)) && <p data-drinking-experiences-unscored className="mb-4 leading-7">{zh ? "本主题全部为未知、没有经历或保留回答，未据此推断个人情况，不代表不需要支持。" : "This theme is entirely unknown, inapplicable or withheld. No personal finding is inferred; this does not mean support is unnecessary."}</p>}
      <dl className="space-y-3">{drinkingExperiencesCategories.map(c => <div key={c.id} className="flex items-start justify-between gap-4"><dt className="min-w-0">{c.label[locale]}</dt><dd data-drinking-experiences-count={`${r.id}-${c.id}`} className="shrink-0 font-semibold">{r.counts[c.id]} / {r.observations.length}</dd></div>)}</dl>
      <h4 className="my-4 font-semibold">{zh ? "逐条陈述与所选类别" : "Individual statements and selected categories"}</h4>
      <ul className="space-y-4 leading-7">{r.observations.map(o => <li key={o.questionId} data-drinking-experiences-observation={o.questionId}><p>{quiz.questions.find(q => q.id === o.questionId)!.prompt[locale]}</p><p className="font-semibold">{drinkingExperiencesCategories.find(c => c.id === o.category)!.label[locale]}</p></li>)}</ul>
      <a className="mt-5 inline-block min-h-11 py-2 font-semibold underline" href={`#drinking-experiences-public-${r.id}`}>{zh ? "阅读下方完整主题说明" : "Read the complete theme below"}</a>{" · "}
      <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, quiz.profiles[i].id)}>{zh ? "公开指南页" : "Public guide page"}</Link>
    </section>)}
  </section>;
}
