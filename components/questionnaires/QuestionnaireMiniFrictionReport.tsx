import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { MiniFrictionResult } from "@/lib/questionnaires/miniFriction";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireMiniFrictionReport({ quiz, result, locale }: {
  quiz: Questionnaire; result: Extract<MiniFrictionResult, { status: "complete" }>; locale: Locale;
}) {
  const zh = locale === "zh";
  return <div className="my-6 space-y-8" data-mini-friction-result>
    <p className="leading-8">{zh
      ? "二十项有效选择已齐，以下分别阅读五组本次自报，不合总分、不排名、不指定主要问题或负面人格。同和只表示数值相同，不表示同等严重；未询问任何其他人，不能确认谁讨厌你或其原因。"
      : "All twenty valid choices are complete. Read five separate self-reports, without a total, ranking, main problem or negative personality type. Equal sums are equal numbers rather than equal severity. No other person was asked, so this cannot confirm who dislikes you or why."}</p>
    {result.miniFriction.map(part => {
      const direction = quiz.directions.find(d => d.id === part.id)!;
      const profile = quiz.profiles.find(p => p.id === part.profileId)!;
      return <section key={part.id} className="rounded-lg border border-slate-200 p-4 sm:p-6"
        data-mini-friction-part={part.id} aria-labelledby={`mini-friction-${part.id}`}>
        <h3 id={`mini-friction-${part.id}`} className="text-xl font-semibold">{direction.title[locale]}</h3>
        <p data-mini-friction-score={part.id} className="my-4 rounded-lg bg-slate-50 p-4 font-semibold">{zh
          ? `四题原始和：${part.rawSum}（范围4—20）；符合程度均值：${part.mean.toFixed(2)}（范围1—5）。`
          : `Four-item raw sum: ${part.rawSum} (range 4–20); endorsement mean: ${part.mean.toFixed(2)} (range 1–5).`}</p>
        <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`mini-friction-report-${part.id}`} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读本组完整公开指南" : "Read this group’s full public guide"}</Link>
      </section>;
    })}
    <p className="leading-8">{zh
      ? "原题本及新工作英译尚无独立心理测量验证或中英等价证据。均值只概括题组，不反推出单题、真实行为或他人感受。无需讨好、解释拒绝、降低边界或恢复不安全联系。"
      : "The original form and new working English have no independent psychometric validation or established language equivalence. A mean summarises a group rather than recovering an item response, actual behaviour or another person’s feelings. No people-pleasing, explanation of a refusal, lowered boundary or resumed unsafe contact is required."}</p>
  </div>;
}

export function QuestionnaireMiniFrictionNextSteps({ locale }: { locale: Locale }) {
  return <section className="mt-10 border-t pt-7"><h3 className="text-xl font-semibold">{locale === "zh" ? "保留一个自选观察，或在这里结束" : "Keep one optional observation, or finish here"}</h3>
    <p className="my-4 leading-8">{locale === "zh"
      ? "可以回看五份公开全文，私下区分事实、自报与未知；也可不采取行动。均值不转成MBTI、人缘、可靠性或他人评价。所有安全与拒绝选择都不需要测试许可。"
      : "You may reread the five public guides and privately distinguish facts, self-reports and unknowns, or take no action. Means do not convert to MBTI, popularity, reliability or another person’s evaluation. Safety and refusal choices need no permission from a test."}</p>
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests/explore/annoying-person-test#questionnaire-results`}>{locale === "zh" ? "回看五份完整指南" : "Reread all five full guides"}</Link><br />
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{locale === "zh" ? "返回全部测试" : "Back to all tests"}</Link>
  </section>;
}
