import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { ArchetypeResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { QuestionnaireReport } from "./QuestionnaireReport";

export function QuestionnaireWorkValuesReport({ quiz, result, answers, locale }: {
  quiz: Questionnaire;
  result: Extract<ArchetypeResult, { status: "complete" }>;
  answers: QuestionnaireAnswers;
  locale: Locale;
}) {
  const zh = locale === "zh";
  const ordered = [...quiz.directions].sort((a, b) => result.counts[b.id] - result.counts[a.id]);
  return <div className="my-6 space-y-8">
    <section className="rounded-lg bg-slate-50 p-4" aria-label={zh ? "十项工作价值的次数与并列名次" : "Counts and shared ranks for ten work values"}>
      <h3 className="text-xl font-semibold">{zh ? "本题组的完整优先次序" : "The complete order in this question set"}</h3>
      <table className="my-4 w-full table-fixed text-left">
        <caption className="sr-only">{zh ? "相同次数保持相同名次" : "Equal counts keep equal ranks"}</caption>
        <thead><tr><th className="w-1/2 py-2 pr-2">{zh ? "工作价值" : "Work value"}</th><th className="py-2 pr-2">{zh ? "次数" : "Count"}</th><th className="py-2">{zh ? "并列名次" : "Shared rank"}</th></tr></thead>
        <tbody>{ordered.map(direction => <tr key={direction.id} data-work-value={direction.id} className="border-t border-slate-200">
          <th scope="row" className="py-3 pr-2 font-normal [overflow-wrap:anywhere]">{direction.title[locale]}</th>
          <td className="py-3 pr-2">{result.counts[direction.id]} / {direction.comparisons}</td>
          <td className="py-3">{1 + quiz.directions.filter(other => result.counts[other.id] > result.counts[direction.id]).length}</td>
        </tr>)}</tbody>
      </table>
      <p className="text-sm leading-7">{zh ? "分母是该价值出现的十二次机会。每次选择也放弃同题另外三项；次数较少不等于反对、能力低或人格缺陷。相同次数保留同名次，列表顺序不破同分。差一次没有已验证的显著性；这些不是人口排名、百分比或岗位适配度。" : "The denominator is twelve appearances of that value. Each choice also declines three alternatives; a lower count means neither rejection nor low ability or a character flaw. Equal counts share a rank, without a list-order tie-break. A one-choice gap has no established significance. These are not population ranks, percentages or job-fit scores."}</p>
    </section>
    <p className="leading-8">{zh ? `本次有${result.profileIds.length}项并列最高，下面分别保留完整读法；这不是固定人格或职业分类。其他价值的全文始终可以阅读。` : `${result.profileIds.length} value${result.profileIds.length === 1 ? " has" : "s have"} the highest count. Each full reading follows, without a fixed personality or career classification. Every other value’s complete guide remains available.`}</p>
    {result.profileIds.map(id => {
      const profile = quiz.profiles.find(p => p.id === id)!;
      return <section key={id} data-work-value-reading={id} aria-labelledby={`work-value-title-${id}`} className="rounded-lg border border-slate-200 p-4 sm:p-6">
        <h3 id={`work-value-title-${id}`} className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h3>
        <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`work-value-${id}`} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, id)}>{zh ? "阅读这项工作价值的公开指南" : "Read this work value’s public guide"}</Link>
      </section>;
    })}
    <details data-work-value-review className="rounded-lg border border-slate-200 p-4">
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? "私下回看三十题的选择与替代项" : "Privately review all thirty choices and alternatives"}</summary>
      <p className="my-4 leading-7">{zh ? "下面只回看当前页面中的答案，不会提交到服务器或加入分享。请留意自己保留了什么、同题放弃了什么；不必给未选价值贴负面标签。" : "Review answers held in this page without submitting them to a server or adding them to sharing. Notice what you protected and what you declined in the same question; an unselected value needs no negative label."}</p>
      <ol className="space-y-5">{quiz.questions.map((question, index) => <li key={question.id}>
        <h4 className="font-semibold">{index + 1}. {question.prompt[locale]}</h4>
        <ul className="mt-2 space-y-2">{question.options.map(option => <li key={option.id} data-work-value-option={option.id} data-selected={answers[question.id] === option.id ? "true" : "false"} className="leading-7">
          {answers[question.id] === option.id ? (zh ? "已选：" : "Selected: ") : (zh ? "未选：" : "Not selected: ")}{option.label[locale]} <span className="text-slate-600">({quiz.directions.find(d => d.id === option.directionId)!.title[locale]})</span>
        </li>)}</ul>
      </li>)}</ol>
    </details>
  </div>;
}

export function QuestionnaireWorkValuesNextSteps({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <section className="mt-10 border-t pt-7">
    <h3 className="text-xl font-semibold">{zh ? "核对一项工作条件，或在这里结束" : "Investigate one work condition, or finish here"}</h3>
    <p className="my-4 leading-7">{zh ? "可以比较十份读法，再私下选一个条件寻找具体证据；无需填写单位名称、收入或个人经历。数字不替你选择岗位、评价雇主或决定去留。如果另想了解喜欢什么工作活动，RIASEC需要独立完整作答，也不把本次次数换算成能力或匹配度。" : "Compare all ten readings and privately seek concrete evidence about one condition, without entering an employer name, income or personal history. Counts do not choose a job, rate an employer or decide whether to stay. To explore enjoyable work activities separately, RIASEC needs its own full attempt; these counts are never converted into ability or fit."}</p>
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`${questionnairePath(locale, "values-assessment")}#questionnaire-results`}>{zh ? "比较全部十份完整读法" : "Compare all ten complete readings"}</Link><br />
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests/holland-career-interest-test-riasec`}>{zh ? "可选：另做RIASEC职业兴趣测试" : "Optional: take a separate RIASEC career-interest test"}</Link><br />
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试" : "Back to all tests"}</Link>
  </section>;
}
