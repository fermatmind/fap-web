import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import type { ArchetypeResult } from "@/lib/questionnaires/basicScoring";
import { FantasyPersonalCard } from "./FantasyPersonalCard";
import { FantasyPortrait, FantasyRoster } from "./FantasyRoster";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";

export function FantasyArchetypeReport({ quiz, result, locale, answers }: { quiz: Questionnaire; result: Extract<ArchetypeResult, { status: "complete" }>; locale: Locale; answers?: QuestionnaireAnswers }) {
  const zh = locale === "zh", matched = quiz.profiles.filter(p => result.profileIds.includes(p.id));
  const total = Object.values(result.counts).reduce((sum, n) => sum + n, 0);
  const ranked = quiz.questions.some(q => q.interaction === "rank");
  return <div className="space-y-8" data-fantasy-result={quiz.slug}>
    <p className="mt-4 text-lg leading-8">{matched.length === 1 ? (zh ? "本轮得分最高的原型" : "Your highest-scoring archetype this round") : (zh ? `保留全部${matched.length}项最高并列，顺序不分主次。` : `All ${matched.length} highest ties are kept, without a primary or secondary order.`)}</p>
    {quiz.slug === "avatar-bender-quiz" && <p data-bending-boundary className="rounded-lg bg-sky-50 p-4 leading-8">{quiz.instructions?.[locale]}</p>}
    <nav className="flex flex-wrap gap-3" aria-label={zh ? "本次匹配结果" : "Your matches"}>{matched.map(p => <a key={p.id} href={`#fantasy-${p.id}`} className="inline-flex min-h-11 items-center rounded-lg border px-4 underline">{p.title[locale]}</a>)}</nav>
    {matched.map(profile => <section key={profile.id} id={`fantasy-${profile.id}`} className="scroll-mt-24 space-y-4 rounded-2xl border border-slate-200 p-5 sm:p-7" data-archetype-match={profile.id}>
      <FantasyPortrait slug={quiz.slug} id={profile.id} name={profile.title[locale]} large />
      <h3 className="text-2xl font-bold">{profile.title[locale]}</h3>
      <p className="text-xl leading-8">{profile.headline[locale]}</p>
      <p className="leading-8">{profile.summary[locale]}</p>
      {answers && <details className="rounded-lg bg-slate-50 p-4"><summary className="min-h-11 cursor-pointer font-semibold">{zh ? "这次选择提供的线索" : "Clues from your choices"}</summary><ul className="list-disc space-y-3 pl-5">{quiz.questions.filter(q => q.options.some(o => o.id === answers[q.id] && o.directionId === profile.id)).slice(0, 3).map(q => <li key={q.id} className="leading-7">{q.prompt[locale]} — {q.options.find(o => o.id === answers[q.id])!.label[locale]}</li>)}</ul><p className="mt-3 text-sm leading-7">{zh ? "以上是实际计入该原型的选择示例；完整次数如下。它们不证明固定性格。" : "These are actual choices counted toward this archetype, not proof of a fixed personality. All counts appear below."}</p></details>}
      <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`fantasy-reading-${profile.id}`} showSummary={false} showHeadline={false} mode="result" />
    </section>)}
    <section className="rounded-xl bg-slate-50 p-5" aria-label={zh ? "全部原型计数" : "All archetype counts"}>
      <h3 className="text-xl font-semibold">{zh ? "每一次选择怎样计入结果？" : "How did your choices add up?"}</h3>
      <dl className="my-4 space-y-3">{quiz.directions.map(d => <div key={d.id} data-archetype-count={d.id} className="flex flex-wrap justify-between gap-3"><dt>{d.title[locale]}</dt><dd>{result.counts[d.id]} / {total} · {(100 * result.counts[d.id] / total).toFixed(1)}%</dd></div>)}</dl>
      <p className="text-sm leading-7">{ranked ? quiz.guide.find(s => s.id === "archetype-counts")?.paragraphs[0][locale] : (zh ? `每个选择加1点，共${total}点。` : `Each choice adds one point, totaling ${total}.`)}</p>
      <p className="mt-3 text-sm leading-7">{zh ? "百分比是本轮计分点数的份额，四舍五入可能造成合计误差；不是相似度、人口百分位或心理测量分数。最高分相同就全部保留，没有隐藏决胜规则。" : "Percentages are shares of this round’s points; rounding may affect their sum. They are not resemblance, population percentiles or psychometric scores. Every highest tie remains, with no hidden tiebreak."}</p>
    </section>
    <FantasyPersonalCard quiz={quiz} ids={result.profileIds} locale={locale} />
    <FantasyRoster quiz={quiz} locale={locale} preserveResult />
  </div>;
}
