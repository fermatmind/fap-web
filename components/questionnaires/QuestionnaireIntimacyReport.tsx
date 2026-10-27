import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { MiniIntimacyQuestionnaire } from "@/lib/questionnaires/miniIntimacy";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Locale } from "@/lib/i18n/locales";

type Complete = Extract<FacetResult, { status: "complete" }>;

export function QuestionnaireIntimacyReport({ quiz, result, locale }: {
  quiz: MiniIntimacyQuestionnaire; result: Complete; locale: Locale;
}) {
  const zh = locale === "zh";
  return <div data-intimacy-result className="my-6 space-y-8">
    <p className="leading-8">{zh
      ? "四部分分别读，不合总分、不排名、不指定亲密类型。均分只摘要六次数值选择，不衡量情感成熟、接触需求、陪伴比例或关系公开程度；同样的均分也可能来自不同答案。3是有效的不确定或视情况，不计分不补零。"
      : "Read the four parts separately, without an overall total, ranking or assigned intimacy type. Each mean summarizes six numeric choices, not emotional maturity, a need for contact, a time-allocation ratio or relationship publicity. Different answers can produce the same mean. A 3 is a valid uncertain or depends response; unscored is not zero."}</p>
    <aside role="note" className="rounded-lg border border-slate-200 p-4 leading-8">{zh
      ? "偏好不代替当下同意。过去接受、关系身份、沉默或没有反抗都不自动表示现在愿意；任何分数都不授权身体靠近、公开关系或要求披露。你可以暂停、更改选择或在这里结束，无需拿答卷说服任何人。"
      : "A preference does not replace present consent. Past acceptance, relationship status, silence or lack of resistance do not automatically establish willingness now. No score authorizes contact, making a relationship public or demanding disclosure. You may pause, change a choice or finish here without using answers to persuade anyone."}</aside>
    {quiz.directions.map(direction => {
      const score = result.facets[direction.id];
      const profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
      return <section key={direction.id} data-intimacy-part={direction.id}
        className="rounded-lg border border-slate-200 p-4 sm:p-6" aria-labelledby={`intimacy-${direction.id}`}>
        <h3 id={`intimacy-${direction.id}`} className="text-2xl font-semibold">{direction.title[locale]}</h3>
        <p data-intimacy-mean className="my-4 rounded-lg bg-slate-50 p-4 font-semibold">{score.mean === null
          ? (zh ? `资料不足：${score.rated} / 6项有数值回答，需要完整六项。` : `Insufficient information: ${score.rated} / 6 items rated; all six are required.`)
          : (zh ? `均分：${score.mean.toFixed(4)} / 5（${score.sum} ÷ 6，显示至四位小数）` : `Mean: ${score.mean.toFixed(4)} / 5 (${score.sum} ÷ 6, rounded to four decimals)`)}</p>
        {score.mean !== null ? <p data-intimacy-sum className="mb-4 leading-8">{zh
          ? `原始和：${score.sum}（范围6—30）。只表示对本组混合陈述的符合程度，不转换为亲密度、概率、常模或同意。`
          : `Raw sum: ${score.sum} (range 6–30). This describes agreement with this group of mixed statements, without conversion to intimacy, probability, norms or consent.`}</p>
          : <p className="mb-4 leading-8 text-slate-600">{zh
            ? "本组暂不给个人数值，不以零或中点代答；其他完整组保留。以下完整通用指南始终可读，也不表示你被分配到这一类型。"
            : "This group has no personal value, without zero or midpoint imputation. Other complete groups remain available. Its complete general guide stays readable without assigning you a type."}</p>}
        <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`intimacy-report-${profile.id}`} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline"
          href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读本部分完整公开指南" : "Read this part’s complete public guide"}</Link>
      </section>;
    })}
    <section data-intimacy-next-steps className="rounded-lg border border-slate-200 p-4 sm:p-6">
      <h3 className="text-xl font-semibold">{zh ? "只选一件愿意说清楚的事，也可以结束" : "Choose one thing you want to clarify, or finish here"}</h3>
      <p className="mt-3 leading-8">{zh
        ? "你可以只为自己记下一个当前愿意的安排、一项需要先确认的条件和一种暂停方式。例如先问今晚是否有余力听，再决定是否聊；这项练习同样可跳过。无需分享答案、联系或说服任何人。"
        : "You may privately note one arrangement you want now, one condition to confirm first and one way to pause. For example, ask whether there is capacity to listen tonight before deciding to talk. You can skip this exercise. Sharing answers, contacting someone or persuading anyone is not required."}</p>
      <Link prefetch={false} className="mt-4 inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试" : "Back to all tests"}</Link>
    </section>
  </div>;
}
