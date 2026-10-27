import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Locale } from "@/lib/i18n/locales";

type Complete = Extract<FacetResult, { status: "complete" }>;

export function QuestionnaireMotivationThemesReport({ quiz, result, locale }: {
  quiz: Questionnaire; result: Complete; locale: Locale;
}) {
  const zh = locale === "zh";
  return <div data-deep-desire-result className="my-6 space-y-8">
    <p className="leading-8">{zh
      ? "六主题分别阅读，不合总分、不排名、不选最深或主导欲望。这里保留原小程序的四题原始和与准确均分，不把动机当能力。原中点表示不确定或视情况，新增不计分不补零。"
      : "Read the six themes separately, without an overall total, ranking or deepest-desire label. These are the mini-program’s four-item raw sums and exact means, not ability scores. The original midpoint means uncertainty or depending on the situation; the added unscored choice is not zero-filled."}</p>
    {quiz.directions.map(direction => {
      const score = result.facets[direction.id];
      const profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
      const available = score.rated === 4;
      // Preserve the source's exact quarter steps; the shared facet mean rounds to one decimal.
      const exactMean = available ? score.sum / 4 : null;
      return <section key={direction.id} data-deep-desire-part={direction.id}
        className="rounded-lg border border-slate-200 p-4 sm:p-6" aria-labelledby={`deep-motivation-${direction.id}`}>
        <h3 id={`deep-motivation-${direction.id}`} className="text-2xl font-semibold">{direction.title[locale]}</h3>
        <p data-deep-desire-mean className="my-4 rounded-lg bg-slate-50 p-4 font-semibold">{exactMean === null
          ? (zh ? `资料不足：${score.rated} / 4项有数值回答，需要完整四项。` : `Insufficient information: ${score.rated} / 4 items rated; all four are required.`)
          : (zh ? `准确均分：${exactMean.toFixed(2)} / 5（${score.sum} ÷ 4）` : `Exact mean: ${exactMean.toFixed(2)} / 5 (${score.sum} ÷ 4)`)}</p>
        {available && <p data-deep-desire-sum className="mb-4 leading-8">{zh
          ? `原始和：${score.sum}（范围4—20）；这是四项认同回答的运算，不是百分比或需要强弱排名。`
          : `Raw sum: ${score.sum} (range 4–20). This calculates four agreement responses, not a percentage or ranking of needs.`}</p>}
        {!available && <p className="mb-4 leading-8 text-slate-600">{zh
          ? "不确定可选原数值中点；不计分则保留暂缺，不补中点或零。下面仍可读完整通用指南，不能当本次个人结果。其他完整主题分别保留。"
          : "Uncertainty can use the original numeric midpoint. Unscored remains missing, without midpoint or zero imputation. The full general guide below remains readable without assigning a personal result. Other complete themes remain separate."}</p>}
        <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`deep-motivation-report-${profile.id}`} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline"
          href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读本主题完整公开指南" : "Read this theme’s complete public guide"}</Link>
      </section>;
    })}
  </div>;
}

export function QuestionnaireMotivationThemesNextSteps({ result, locale }: { result: Complete; locale: Locale }) {
  const zh = locale === "zh";
  const allUnavailable = Object.values(result.facets).every(part => part.rated < 4);
  return <section data-deep-desire-next-steps className="rounded-lg border border-slate-200 p-4 sm:p-6">
    <h2 className="text-xl font-semibold">{allUnavailable
      ? (zh ? "本次作答已结束，下一步由你选择" : "This attempt is finished. Choose what comes next.")
      : (zh ? "下一步回到一项真实安排" : "Bring the next step to one real arrangement")}</h2>
    <p className="mt-3 leading-8">{zh
      ? "可以回看一项具体安排：想参与哪部分决定，需要怎样的连接、反馈或信息，是否有成本可控的小变化。对方可以拒绝，你也可以不做练习。六个均分不决定身份、价值或人生选择；可以读指南、重做或在这里结束。"
      : "You may revisit one arrangement: which decision you want a say in, what connection, feedback or information would help, and whether a small change is feasible. Others can decline, and you can skip the exercise. The means do not decide identity, worth or life choices. Read a guide, retake or finish here."}</p>
    <Link prefetch={false} className="mt-4 inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试" : "Back to all tests"}</Link>
  </section>;
}
