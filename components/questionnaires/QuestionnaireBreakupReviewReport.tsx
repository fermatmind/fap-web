import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Locale } from "@/lib/i18n/locales";

type Complete = Extract<FacetResult, { status: "complete" }>;

export function QuestionnaireBreakupReviewReport({ quiz, result, locale }: {
  quiz: Questionnaire; result: Complete; locale: Locale;
}) {
  const zh = locale === "zh";
  return <div data-breakup-review-result className="my-6 space-y-8">
    <p className="leading-8">{zh
      ? "四组记录分别阅读，不合总分、不排名、不指定主要分手原因。它们只摘要你对一段已结束关系的回顾，不分配责任，不决定复合、伴侣适配或下一段关系。原数值中点3表示不确定或视情况，不是中等严重程度；网页新增不计分选项不补零。"
      : "Read four separate records without an overall total, ranking or main-cause verdict. They summarise your recollection of one relationship that ended, without assigning responsibility, deciding reconciliation or predicting compatibility or another relationship. The original numeric midpoint 3 means uncertain or depends on the situation, not moderate severity. The website’s added unscored choice is not filled with zero."}</p>
    <aside role="note" className="rounded-lg border border-slate-200 p-4 leading-8">{zh
      ? "安全边界与任何分数无关：暴力、胁迫、跟踪、威胁、强迫和控制不属于普通沟通不良或双方不合。无需联系、对质、解释或复合；若有现实安全威胁，可暂停作答或联系，向可信的人、当地紧急服务或合适的专业支持求助。"
      : "The safety boundary applies at every score: violence, coercion, stalking, threats, force and control are not ordinary poor communication or mutual incompatibility. Contact, confrontation, explanation and reconciliation are not required. If there is a practical safety threat, you can pause the test or contact with the former partner, and seek help from a trusted person, local emergency services or appropriate professional support."}</aside>
    {quiz.directions.map(direction => {
      const score = result.facets[direction.id];
      const profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
      const available = score.rated === 6;
      // Match the original six-item arithmetic and its four-decimal rounding.
      const mean = score.mean;
      return <section key={direction.id} data-breakup-review-part={direction.id}
        className="rounded-lg border border-slate-200 p-4 sm:p-6" aria-labelledby={`breakup-review-${direction.id}`}>
        <h3 id={`breakup-review-${direction.id}`} className="text-2xl font-semibold">{direction.title[locale]}</h3>
        <p data-breakup-review-mean className="my-4 rounded-lg bg-slate-50 p-4 font-semibold">{mean === null
          ? (zh ? `资料不足：${score.rated} / 6项有数值回答，需要完整六项。` : `Insufficient information: ${score.rated} / 6 items rated; all six are required.`)
          : (zh ? `均分：${mean.toFixed(4)} / 5（${score.sum} ÷ 6，显示至四位小数）` : `Mean: ${mean.toFixed(4)} / 5 (${score.sum} ÷ 6, rounded to four decimals)`)}</p>
        {available && <p data-breakup-review-sum className="mb-4 leading-8">{zh
          ? `原始和：${score.sum}（范围6—30）。这是六次数值选择的摘要，不是频率、概率、严重等级或导致分手的份额。`
          : `Raw sum: ${score.sum} (range 6–30). This summarises six numeric choices, not frequency, probability, severity or a share of what caused the breakup.`}</p>}
        {!available && <p className="mb-4 leading-8 text-slate-600">{zh
          ? "本组保留暂缺，不以零或中点代答；其他完整组仍分别保留。以下通用指南可读，但不是本次个人因素解释。全部不计分也可以完成并阅读四份全文。"
          : "This group remains unavailable without zero or midpoint imputation. Other complete groups remain separate. The general guide below is readable without assigning a personal interpretation. An entirely unscored attempt can finish and read all four full guides."}</p>}
        <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`breakup-review-report-${profile.id}`} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline"
          href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读本组完整公开指南" : "Read this group’s complete public guide"}</Link>
      </section>;
    })}
  </div>;
}

export function QuestionnaireBreakupReviewNextSteps({ result, locale }: { result: Complete; locale: Locale }) {
  const zh = locale === "zh";
  const allUnavailable = Object.values(result.facets).every(part => part.rated < 6);
  return <section data-breakup-review-next-steps className="rounded-lg border border-slate-200 p-4 sm:p-6">
    <h2 className="text-xl font-semibold">{allUnavailable
      ? (zh ? "本次作答已结束，下一步由你选择" : "This attempt is finished. Choose what comes next.")
      : (zh ? "留下一个你愿意核对的事实，也可以在这里结束" : "Keep one fact you would like to check, or finish here")}</h2>
    <p className="mt-3 leading-8">{zh
      ? "可以只在私人笔记里记一件可确认的事、一个仍不确定的地方和以后想更早说明的需要。无需向前伴侣交答卷、证明责任或尝试复合。你也可以不做练习，选择读其他指南、重做或退出；现实安全始终优先。"
      : "You may privately note one fact you can confirm, one uncertainty and a need you would want to express earlier in the future. There is no requirement to send answers to a former partner, prove responsibility or try to reconcile. You can skip the exercise, read another guide, retake or leave. Practical safety comes first."}</p>
    <Link prefetch={false} className="mt-4 inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试" : "Back to all tests"}</Link>
  </section>;
}
