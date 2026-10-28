import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { QuestionnaireReport } from "./QuestionnaireReport";

export function QuestionnaireEmotionDashboardReport({ quiz, result, answers, locale }: {
  quiz: Questionnaire;
  result: Extract<FacetResult, { status: "complete" }>;
  answers: QuestionnaireAnswers;
  locale: Locale;
}) {
  const zh = locale === "zh";
  return <div className="my-6 space-y-8">
    <p className="leading-8">{zh ? "八类感受分别回看，不合成EQ能力、总体强度或主导人格。数字只概括本题组在相关机会中的频率选择，不同情境和机会使各部分不能排成最强情绪；较高不天然更好或更差。同值或接近不需要破同分，喜悦和难过等感受也不互相抵销。" : "Read eight feelings separately, without an EQ ability score, overall intensity or dominant personality. Numbers summarize these frequency selections on relevant occasions. Different contexts and opportunities prevent a strongest-emotion ranking; higher is not inherently better or worse. Equal or close means need no tie-break, and feelings such as Joy and Sadness do not cancel one another."}</p>
    <table data-emotion-overview className="w-full text-left text-sm">
      <caption className="mb-4 text-left text-base font-semibold">{zh ? "八项读数概览：固定顺序，不按数值排名" : "Eight readings at a glance: fixed order, without ranking"}</caption>
      <thead><tr className="border-b border-slate-200">
        <th scope="col" className="py-3 pr-2">{zh ? "感受与全文" : "Feeling and guide"}</th>
        <th scope="col" className="py-3 pr-2">{zh ? "频率均值" : "Frequency mean"}</th>
        <th scope="col" className="py-3">{zh ? "数值条目" : "Numeric items"}</th>
      </tr></thead>
      <tbody>{quiz.directions.map(direction => {
        const score = result.facets[direction.id];
        return <tr key={direction.id} data-emotion-overview-row={direction.id} className="border-b border-slate-200">
          <th scope="row" className="pr-2 font-medium"><a href={`#emotion-title-${direction.id}`} className="inline-block min-h-11 py-3 underline">{direction.title[locale]}</a></th>
          <td className="py-3 pr-2">{score.mean === null ? (zh ? "观察不足" : "Insufficient") : `${score.mean.toFixed(1)} / 5`}</td>
          <td className="py-3">{score.rated}/{score.total}</td>
        </tr>;
      })}</tbody>
    </table>
    {quiz.directions.map(direction => {
      const score = result.facets[direction.id];
      const profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
      return <section key={direction.id} data-emotion-part={direction.id} aria-labelledby={`emotion-title-${direction.id}`} className="rounded-lg border border-slate-200 p-4 sm:p-6">
        <h3 id={`emotion-title-${direction.id}`} className="text-2xl font-semibold">{direction.title[locale]}</h3>
        <p data-emotion-mean={direction.id} className="my-4 rounded-lg bg-slate-50 p-4 font-semibold">{score.mean === null
          ? (zh ? `观察不足：${score.rated}/${score.total}条数值，至少需要${quiz.minimumRatedItems}条，不给个人均值。` : `Insufficient observations: ${score.rated}/${score.total} numeric ratings; at least ${quiz.minimumRatedItems} are needed. No personal mean.`)
          : (zh ? `本题组频率均值：${score.mean.toFixed(1)} / 5（${score.rated}/${score.total}条数值）` : `Frequency mean for these items: ${score.mean.toFixed(1)} / 5 (${score.rated}/${score.total} numeric ratings)`)}</p>
        {score.mean === null && <p className="mb-4 text-sm leading-7 text-slate-600">{zh ? "观察不足不同于感受较少。以下是通用读法，不能当成对本次个人状态的解释。" : "Insufficient observations differ from a lower frequency. The following is a general guide, not an interpretation of a personal state in this attempt."}</p>}
        <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`emotion-${direction.id}`} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这类感受的公开完整指南" : "Read this emotion’s complete public guide"}</Link>
      </section>;
    })}
    <details data-emotion-review className="rounded-lg border border-slate-200 p-4">
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? "私下回看四十条原始选择" : "Privately review all forty original selections"}</summary>
      <p className="my-4 leading-7">{zh ? "这里只回看当前页面中的答案，不提交私人事件，也不加入分享。数值是所选频率；不计分不补零或中间值，均值不保留每题的全部差异。无需重新经历或制造题中的情境。" : "Review answers held in this page, without submitting private events or adding them to sharing. A number is the chosen frequency; unscored is never filled with zero or a midpoint, and a mean does not preserve every item difference. No situation needs to be repeated or created."}</p>
      <ol className="space-y-5">{quiz.questions.map((question, index) => {
        const option = question.options.find(o => o.id === answers[question.id]);
        return <li key={question.id} data-emotion-answer={question.id}>
          <h4 className="font-semibold">{index + 1}. {question.prompt[locale]}</h4>
          <p className="mt-2 leading-7">{option?.label[locale]}{option?.score !== null && option?.score !== undefined ? ` (${option.score})` : (zh ? "（不计分）" : " (unscored)")}</p>
        </li>;
      })}</ol>
    </details>
  </div>;
}

export function QuestionnaireEmotionDashboardNextSteps({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <section className="mt-10 border-t pt-7">
    <h3 className="text-xl font-semibold">{zh ? "把一个读数放回情境，或在这里结束" : "Place one reading in context, or finish here"}</h3>
    <p className="my-4 leading-7">{zh ? "可以私下选一个可承受的普通例子，区分发生了什么、当时的感受与实际行动，不必填写姓名或私人对话。不要为了分数重现不舒服的情境、接触物品或联系他人。也可以只比较八份全文、保留不确定或直接结束；无需继续其他测评，结果不换算成核心EQ、MBTI、职业或临床分数。" : "You may privately choose a manageable ordinary example and distinguish what happened, what you felt and what you actually did, without entering names or private conversations. Do not repeat an uncomfortable situation, handle an object or contact someone for a score. Compare the eight full guides, keep uncertainty or finish. No further assessment is required, and this result is not converted into core EQ, MBTI, career or clinical scores."}</p>
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`${questionnairePath(locale, "eq-dashboard")}#questionnaire-results`}>{zh ? "比较八份完整情绪读法" : "Compare eight complete emotion readings"}</Link><br />
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试" : "Back to all tests"}</Link>
  </section>;
}
