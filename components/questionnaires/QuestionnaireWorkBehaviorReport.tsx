import { ResultOverview, ResultPage } from "./QuestionnaireResultPresentation";
import Link from "next/link";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Locale } from "@/lib/i18n/locales";
export function QuestionnaireWorkBehaviorReport({ quiz, result, locale }: {
  quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale;
}) {
  const zh = locale === "zh";
  return <ResultPage variant="dimensions" className="my-6 space-y-8" data-work-behavior-result>
    <ResultOverview locale={locale} title={zh ? "近期六组工作行为" : "Six groups of recent work behaviors"}
      className="border-slate-300 bg-slate-50"
      description={zh ? "各组独立呈现，从一个近期工作情境继续读。" : "Each group is shown separately. Start with one recent work situation."}
      items={quiz.directions.map(direction => {
        const score = result.facets[direction.id];
        return { id: direction.id, label: direction.title[locale], href: `#work-behavior-${direction.id}`,
          value: score.mean !== null ? `${score.mean.toFixed(1)} / 5` : (zh ? "资料不足" : "Insufficient information"),
          note: zh ? `${score.rated} / ${score.total}条有效回答` : `${score.rated} / ${score.total} rated items` };
      })} />


    {quiz.directions.map(direction => {
      const score = result.facets[direction.id], profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
      return <section key={direction.id} className="rounded-lg border border-slate-200 p-4 sm:p-6" data-work-behavior-part={direction.id} aria-labelledby={`work-behavior-${direction.id}`}>
        <h3 id={`work-behavior-${direction.id}`} className="scroll-mt-24 text-xl font-semibold">{direction.title[locale]}</h3>
        <p data-work-behavior-score={direction.id} className="my-4 font-semibold">{score.mean === null
          ? (zh ? `资料不足：${score.rated}/6题有数值回答；需要六题完整，不计算本组均分。` : `Insufficient information: ${score.rated}/6 items rated; all six are needed. No mean is calculated for this group.`)
          : (zh ? `行为频率均分：${score.mean.toFixed(1)} / 5（6/6题有效）` : `Behavior frequency mean: ${score.mean.toFixed(1)} / 5 (6/6 items rated)`)}</p>
        {score.mean === null && <p className="mb-4 text-sm leading-7 text-slate-600">{zh
          ? "没有相关机会、无法判断或暂不回答，不计成零分，也不表示没有能力。其他完整分组分别保留，以下完整指南始终可读。"
          : "No relevant occasion, uncertainty or a choice not to answer never becomes zero or evidence of lacking ability. Other complete groups remain separate and the full guide stays readable below."}</p>}
        <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`work-behavior-report-${direction.id}`} mode="result" previewSectionIds={["context", "example", "experiment"]} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读本组完整公开指南" : "Read this group’s full public guide"}</Link>
      </section>;
    })}
    <p className="leading-8">{zh
      ? "可以选择一个实际例子，看看当时的机会、限制和可观察结果，再决定是否尝试一个小调整。六个主题是相关的编辑分组，尚未建立独立因子、信效度、常模或跨语言等价性。它不转换人格、职位匹配或资格，也可以在这里结束。"
      : "Choose an actual example, examine its opportunities, constraints and observable outcome, then decide whether a small adjustment is useful. The six topics are related editorial groups without established independent factors, reliability, validity, norms or language equivalence. They do not convert into a personality type, job match or qualification. You may also finish here."}</p>

    <details className="border-t border-slate-200 pt-4" data-result-reading-method>
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? "查看全部读数、计分与使用说明" : "View all readings, scoring and use notes"}</summary>
      <p className="leading-8">{zh
      ? "六组分别概括过去四周有相关机会时，题述工作行为的自报频率。没有综合胜任力分、最强最弱型或录用等级；频繁做某件事不证明做得合适、有效或具备岗位能力。"
      : "The six groups separately summarize reported frequency of the listed work behaviors when an occasion arose in the past four weeks. There is no overall competency score, strongest or weakest type, or hiring grade. Doing something often does not prove appropriateness, effectiveness or ability for a job."}</p>
      <p className="text-sm leading-7 text-slate-600">{zh
      ? "选项依次为1从未、2很少、3有时、4经常、5几乎每次。每组需要六项数值齐全，均分不是实际机会中行为出现的百分比。"
      : "Anchors are 1 Never, 2 Rarely, 3 Sometimes, 4 Often and 5 Almost always. Each group needs all six numeric responses. A mean is not a percentage of occasions on which the behavior occurred."}</p>
    </details>
  </ResultPage>;
}

export function QuestionnaireWorkBehaviorNextSteps({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <section data-work-behavior-next-steps className="mt-10 border-t pt-7">
    <h3 className="text-xl font-semibold">{zh ? "本次作答已结束，下一步由你选择" : "This attempt is finished. Choose what comes next."}</h3>
    <p className="my-4 leading-7 text-slate-600">{zh
      ? "六份完整指南均可阅读，资料不足的部分也会保留。若想继续，可以选一个真实任务，核对当时的机会、限制和可观察结果，再决定是否做一个小调整。频率不证明能力，不转换录用资格、职位匹配或MBTI类型。也可以在这里结束。"
      : "All six full guides remain available, including parts with insufficient information. If useful, choose an actual task, examine its opportunities, constraints and observable outcome, then decide whether to make one small adjustment. Frequency does not prove ability or convert into hiring eligibility, job matching or an MBTI type. You may also finish here."}</p>
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests/explore/competency-test#questionnaire-results`}>{zh ? "回看六份完整指南" : "Review all six full guides"}</Link><br />
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试" : "Back to all tests"}</Link>
  </section>;
}
