import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import { isPreparationActions20ConfigurationValid, type PreparationActions20Questionnaire, type PreparationActions20Result } from "@/lib/questionnaires/preparationActions20";
import { scorePreparationActions20 } from "@/lib/questionnaires/preparationActions20Method";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { QuestionnaireReport } from "./QuestionnaireReport";

export function QuestionnairePreparationActions20Report({ quiz, result, locale }: {
  quiz: Omit<PreparationActions20Questionnaire, "kind">;
  result: Extract<PreparationActions20Result, { status: "complete" }>;
  locale: Locale;
}) {
  const zh = locale === "zh";
  // Bind the displayed values to this form and its twenty individual responses.
  const input = Object.fromEntries(result.preparationActions20.domains.flatMap(d => d.rows.map(r => [r.itemId, r.answer])));
  const checked = scorePreparationActions20(quiz.slug, input);
  if (!isPreparationActions20ConfigurationValid(quiz) || !checked
    || JSON.stringify(checked) !== JSON.stringify(result.preparationActions20)) {
    return <p role="alert">{zh ? "结果暂不可用，请重新作答。" : "Result unavailable. Please start a new attempt."}</p>;
  }
  return <div data-preparation-actions-result className="mt-6 space-y-8">
    <p className="leading-8 text-slate-700">{zh
      ? "以下五组按固定顺序呈现当前安排中的自报行动。每组四项都选数值时，分别显示原始合计与0—3均分（一位小数）。行动阶段由本网站原创，不是官方量表、能力评级或就业预测；不生成总分、准备率或主导类型。"
      : "The five groups appear in a fixed order and summarize actions you report for one current arrangement. Four numeric selections are required for each raw sum and 0–3 mean (one decimal). These original website action stages are not an official scale, ability rating or employment prediction. There is no overall score, readiness percentage or dominant type."}</p>
    {checked.domains.map((part, index) => <section key={part.id} data-preparation-actions-part={part.id}
      aria-labelledby={`preparation-part-${part.id}`} className="rounded-lg border border-slate-200 p-4 sm:p-5">
      <h3 id={`preparation-part-${part.id}`} className="text-xl font-semibold">{quiz.directions[index].title[locale]}</h3>
      <p data-preparation-actions-mean className="mt-3 leading-7">{part.mean === null
        ? (zh ? `本组不显示数值：${part.ratedItems}/4项有数值回答；不补值、不折算。` : `Value withheld: ${part.ratedItems}/4 actions rated. No imputation or rescaling.`)
        : (zh ? `合计 ${part.sum} / 12；均分 ${part.mean.toFixed(1)} / 3（4/4项有数值回答）` : `Sum ${part.sum} / 12; mean ${part.mean.toFixed(1)} / 3 (4/4 actions rated)`)}</p>
      <p data-preparation-actions-counts className="mt-3 leading-7">{zh
        ? `尚未开始 ${part.counts.unstarted}；草案 ${part.counts.draft}；已试跑 ${part.counts.tried}；已复盘调整 ${part.counts.reviewed}；不计分 ${part.counts.notRated}。`
        : `Not started ${part.counts.unstarted}; drafted ${part.counts.draft}; tried ${part.counts.tried}; reviewed and adjusted ${part.counts.reviewed}; not rated ${part.counts.notRated}.`}</p>
      <details className="mt-4"><summary className="cursor-pointer py-2 font-semibold">{zh ? "回看本组四项行动与选择" : "Review this group’s four actions and selections"}</summary>
        <ul className="space-y-4">{part.rows.map(row => {
          const question = quiz.questions.find(q => q.id === row.itemId)!;
          const option = question.options.find(o => o.id === String(row.answer))!;
          return <li key={row.itemId} data-preparation-action-row className="leading-7"><p>{question.prompt[locale]}</p><p className="text-slate-600">{option.label[locale]}</p></li>;
        })}</ul>
      </details>
    </section>)}
    <p className="leading-8 text-slate-700">{zh
      ? "相同或相近均分可以来自不同的具体缺口。比如3、3、0、0与2、2、1、1都显示1.5；请回到各项行动和资源条件，而不是排列强弱。不计分不是零分，一组不显示数值不影响其他组。全部不计分也已完成，五份完整指南照常开放。"
      : "Equal or close means can hide different gaps: 3, 3, 0, 0 and 2, 2, 1, 1 both show 1.5. Read individual actions and resource conditions rather than ranking strengths. Not rated is not zero, and a withheld value does not affect other groups. All non-rating choices still finish the attempt and keep all five full guides available."}</p>
    {quiz.profiles.map(profile => <section key={profile.id} data-preparation-actions-guide={profile.id}
      aria-labelledby={`preparation-guide-${profile.id}`}>
      <h3 id={`preparation-guide-${profile.id}`} className="mb-4 text-2xl font-semibold">{profile.title[locale]}</h3>
      <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`preparation-${profile.id}`} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这份公开完整指南" : "Read this complete public guide"}</Link>
    </section>)}
    <aside className="space-y-3 text-sm leading-7" data-preparation-actions-source>
      {quiz.guide.find(s => s.id === "source-boundary")?.paragraphs.map((p, i) => <p key={i}>{p[locale]}</p>)}
      {quiz.references?.map(r => <p key={r.url}><a className="underline" href={r.url}>{r.title[locale]}</a></p>)}
    </aside>
  </div>;
}

export function QuestionnairePreparationActions20NextSteps({ quiz, locale }: { quiz: Omit<PreparationActions20Questionnaire, "kind">; locale: Locale }) {
  const zh = locale === "zh";
  return <section data-preparation-actions-next-steps className="mt-10 border-t pt-7">
    <h3 className="text-xl font-semibold">{zh ? "本次作答已结束，选择一个小试验或在这里结束" : "This attempt is finished. Choose one small rehearsal, or finish here."}</h3>
    <p className="my-4 leading-7 text-slate-600">{zh
      ? "可以私下挑一项与当前安排有关的行动，用虚拟资料做一次低风险试跑，再检查需要谁配合、哪些条件尚未具备。无需真实客户、付费项目或新职位，也不必把均分当作辞职、接单或雇用决定。试跑后的变化用于复盘，不代表测试证明了能力提升。"
      : "Privately choose one relevant action, rehearse it with fictional information and check whose cooperation and which conditions are needed. No real client, paid project or new job is required. Do not use a mean to decide whether to resign, take a contract or hire someone. Changes after a trial support review; they do not prove an improvement in ability."}</p>
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`${questionnairePath(locale, quiz.slug)}#questionnaire-results`}>{zh ? "回看全部五份完整指南" : "Review all five complete guides"}</Link><br />
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试" : "Back to all tests"}</Link>
  </section>;
}
