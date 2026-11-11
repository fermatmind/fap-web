import { useQuestionnaireDisplayCopy } from "./TraditionalQuestionnaireCopy";
import { ResultPage } from "./QuestionnaireResultPresentation";
import Link from "next/link";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { MiniFrictionResult } from "@/lib/questionnaires/miniFriction";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireMiniFrictionReport({ quiz, result, locale }: {
  quiz: Questionnaire; result: Extract<MiniFrictionResult, { status: "complete" }>; locale: Locale;
}) {
  const { traditional } = useQuestionnaireDisplayCopy();
  const zh = locale === "zh";
  return <ResultPage variant="reflection" className="my-6 space-y-8" data-mini-friction-result>
    <section className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-6" aria-labelledby="friction-situation-start">
      <h3 id="friction-situation-start" className="text-xl font-semibold text-emerald-950">{zh ? (traditional ? "從一件相處小事讀起" : "从一件相处小事读起") : "Start with one everyday interaction"}</h3>
      <p className="mt-3 max-w-prose leading-7">{zh ? (traditional ? "五組分開看。想起一次沒說清楚、計劃臨時變化或需要表達邊界時，可以開啟對應例子。均分只概括你對本組陳述的回答。" : "五组分开看。想起一次没说清楚、计划临时变化或需要表达边界时，可以打开对应例子。均分只概括你对本组陈述的回答。") : "Read the five groups separately. If you remember a misunderstanding, a changed plan or a boundary you needed to express, open that example. The means reflect your answers to each set of statements."}</p>
      <ul className="mt-4 grid gap-3 md:grid-cols-2">
        {result.miniFriction.map(part => <li key={part.id} className="min-w-0 rounded-lg bg-white px-3 pb-3">
          <a className="inline-flex min-h-11 items-center font-semibold text-emerald-950 underline decoration-emerald-400 underline-offset-4" href={`#mini-friction-${part.id}`}>{quiz.directions.find(direction => direction.id === part.id)!.title[locale]}</a>
          <p className="text-sm leading-6 tabular-nums">{zh ? (traditional ? `本組均分 ${part.mean.toFixed(2)} / 5` : `本组均分 ${part.mean.toFixed(2)} / 5`) : `Group mean ${part.mean.toFixed(2)} / 5`}</p>
        </li>)}
      </ul>
    </section>

    {result.miniFriction.map(part => {
      const direction = quiz.directions.find(d => d.id === part.id)!;
      const profile = quiz.profiles.find(p => p.id === part.profileId)!;
      return <section key={part.id} className="rounded-lg border border-slate-200 p-4 sm:p-6"
        data-mini-friction-part={part.id} aria-labelledby={`mini-friction-${part.id}`}>
        <h3 id={`mini-friction-${part.id}`} className="scroll-mt-24 text-xl font-semibold">{direction.title[locale]}</h3>
        <p data-mini-friction-score={part.id} className="my-4 rounded-lg bg-slate-50 p-4 font-semibold">{zh
          ? (traditional ? `四題原始和：${part.rawSum}（範圍4—20）；符合程度均值：${part.mean.toFixed(2)}（範圍1—5）。` : `四题原始和：${part.rawSum}（范围4—20）；符合程度均值：${part.mean.toFixed(2)}（范围1—5）。`)
          : `Four-item raw sum: ${part.rawSum} (range 4–20); endorsement mean: ${part.mean.toFixed(2)} (range 1–5).`}</p>
        <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`mini-friction-report-${part.id}`} mode="result" previewSectionIds={["meaning", "example", "next"]} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(traditional ? "zh-TW" : locale, quiz.slug, profile.id)}>{zh ? (traditional ? "閱讀本組完整公開指南" : "阅读本组完整公开指南") : "Read this group’s full public guide"}</Link>
      </section>;
    })}
    <p className="leading-8">{zh
      ? (traditional ? "原題本及新工作英譯尚無獨立心理測量驗證或中英等價證據。均值只概括題組，不反推出單題、真實行為或他人感受。無需討好、解釋拒絕、降低邊界或恢復不安全聯絡。" : "原题本及新工作英译尚无独立心理测量验证或中英等价证据。均值只概括题组，不反推出单题、真实行为或他人感受。无需讨好、解释拒绝、降低边界或恢复不安全联系。")
      : "The original form and new working English have no independent psychometric validation or established language equivalence. A mean summarises a group rather than recovering an item response, actual behaviour or another person’s feelings. No people-pleasing, explanation of a refusal, lowered boundary or resumed unsafe contact is required."}</p>

    <details className="border-t border-slate-200 pt-4" data-result-reading-method>
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? (traditional ? "檢視計分與使用說明" : "查看计分与使用说明") : "View scoring and use notes"}</summary>
      <p className="leading-8">{zh
      ? (traditional ? "二十項有效選擇已齊，以下分別閱讀五組本次自報，不合總分、不排名、不指定主要問題或負面人格。同和只表示數值相同，不表示同等嚴重；未詢問任何其他人，不能確認誰討厭你或其原因。" : "二十项有效选择已齐，以下分别阅读五组本次自报，不合总分、不排名、不指定主要问题或负面人格。同和只表示数值相同，不表示同等严重；未询问任何其他人，不能确认谁讨厌你或其原因。")
      : "All twenty valid choices are complete. Read five separate self-reports, without a total, ranking, main problem or negative personality type. Equal sums are equal numbers rather than equal severity. No other person was asked, so this cannot confirm who dislikes you or why."}</p>
    </details>
  </ResultPage>;
}

export function QuestionnaireMiniFrictionNextSteps({ locale }: { locale: Locale }) {
  const { traditional } = useQuestionnaireDisplayCopy();
  return <section className="mt-10 border-t pt-7"><h3 className="text-xl font-semibold">{locale === "zh" ? (traditional ? "保留一個自選觀察，或在這裡結束" : "保留一个自选观察，或在这里结束") : "Keep one optional observation, or finish here"}</h3>
    <p className="my-4 leading-8">{locale === "zh"
      ? (traditional ? "可以回看五份公開全文，私下區分事實、自報與未知；也可不採取行動。均值不轉成MBTI、人緣、可靠性或他人評價。所有安全與拒絕選擇都不需要測試許可。" : "可以回看五份公开全文，私下区分事实、自报与未知；也可不采取行动。均值不转成MBTI、人缘、可靠性或他人评价。所有安全与拒绝选择都不需要测试许可。")
      : "You may reread the five public guides and privately distinguish facts, self-reports and unknowns, or take no action. Means do not convert to MBTI, popularity, reliability or another person’s evaluation. Safety and refusal choices need no permission from a test."}</p>
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${traditional ? "zh-TW" : locale}/tests/explore/annoying-person-test#questionnaire-results`}>{locale === "zh" ? "回看五份完整指南" : "Reread all five full guides"}</Link><br />
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${traditional ? "zh-TW" : locale}/tests#more-tests`}>{locale === "zh" ? (traditional ? "返回全部測試" : "返回全部测试") : "Back to all tests"}</Link>
  </section>;
}
