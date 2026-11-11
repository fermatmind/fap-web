import { useQuestionnaireDisplayCopy } from "./TraditionalQuestionnaireCopy";
import { ResultPage } from "./QuestionnaireResultPresentation";
import Link from "next/link";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import type { QuestionnaireProfile } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { MiniIntimacyQuestionnaire } from "@/lib/questionnaires/miniIntimacy";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Locale } from "@/lib/i18n/locales";

type Complete = Extract<FacetResult, { status: "complete" }>;

export function QuestionnaireIntimacyReport({ quiz, result, locale, readingProfiles }: {
  quiz: MiniIntimacyQuestionnaire; result: Complete; locale: Locale; readingProfiles?: readonly QuestionnaireProfile[];
}) {
  const { traditional } = useQuestionnaireDisplayCopy();
  const zh = locale === "zh";
  return <ResultPage variant="reflection" data-intimacy-result className="my-6 space-y-8">


    <aside role="note" className="rounded-lg border border-slate-200 p-4 leading-8">{zh
      ? (traditional ? "偏好不代替當下同意。過去接受、關係身份、沉默或沒有反抗都不自動錶示現在願意；任何分數都不授權身體靠近、公開關係或要求披露。你可以暫停、更改選擇或在這裡結束，無需拿答卷說服任何人。" : "偏好不代替当下同意。过去接受、关系身份、沉默或没有反抗都不自动表示现在愿意；任何分数都不授权身体靠近、公开关系或要求披露。你可以暂停、更改选择或在这里结束，无需拿答卷说服任何人。")
      : "A preference does not replace present consent. Past acceptance, relationship status, silence or lack of resistance do not automatically establish willingness now. No score authorizes contact, making a relationship public or demanding disclosure. You may pause, change a choice or finish here without using answers to persuade anyone."}</aside>
    <section className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 sm:p-6" aria-labelledby="intimacy-review-start">
      <h3 id="intimacy-review-start" className="text-xl font-semibold text-rose-950">{zh ? (traditional ? "哪一項偏好值得先說清楚" : "哪一项偏好值得先说清楚") : "Which preference would you like to clarify?"}</h3>
      <p className="mt-3 max-w-prose leading-7">{zh ? (traditional ? "選一項，看看不同情境會怎樣影響安排。每組完整六題才顯示均分。任何讀數都可以配合當下意願重新商量。" : "选一项，看看不同情境会怎样影响安排。每组完整六题才显示均分。任何读数都可以配合当下意愿重新商量。") : "Choose a topic to see how a different context can change an arrangement. A mean requires all six ratings for that topic. Any preference can be discussed again as willingness changes."}</p>
      <ul className="mt-4 grid gap-3 md:grid-cols-2">
        {quiz.directions.map(direction => {
          const score = result.facets[direction.id];
          return <li key={direction.id} className="min-w-0 rounded-lg bg-white px-3 pb-3">
            <a href={`#intimacy-${direction.id}`} className="inline-flex min-h-11 items-center font-semibold text-rose-950 underline decoration-rose-400 underline-offset-4">{direction.title[locale]}</a>
            <p className="text-sm leading-6 tabular-nums">{score.mean === null ? (zh ? (traditional ? `${score.rated}/6 項有效，未算均分` : `${score.rated}/6 项有效，未算均分`) : `${score.rated}/6 rated, no mean`) : `${score.mean.toFixed(4)} / 5`}</p>
          </li>;
        })}
      </ul>
    </section>
    {quiz.directions.map(direction => {
      const score = result.facets[direction.id];
      const profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
      const readingProfile = readingProfiles?.find(item => item.id === profile.id && item.directionIds[0] === direction.id && item.resultReading?.quizSlug === quiz.slug && item.resultReading.profileId === profile.id) ?? profile;
      return <section key={direction.id} data-intimacy-part={direction.id}
        className="rounded-lg border border-slate-200 p-4 sm:p-6" aria-labelledby={`intimacy-${direction.id}`}>
        <h3 id={`intimacy-${direction.id}`} className="scroll-mt-24 text-xl font-semibold leading-snug sm:text-2xl">{direction.title[locale]}</h3>
        <p data-intimacy-mean className="my-4 rounded-lg bg-slate-50 p-4 font-semibold">{score.mean === null
          ? (zh ? (traditional ? `資料不足：${score.rated} / 6項有數值回答，需要完整六項。` : `资料不足：${score.rated} / 6项有数值回答，需要完整六项。`) : `Insufficient information: ${score.rated} / 6 items rated; all six are required.`)
          : (zh ? (traditional ? `均分：${score.mean.toFixed(4)} / 5（${score.sum} ÷ 6，顯示至四位小數）` : `均分：${score.mean.toFixed(4)} / 5（${score.sum} ÷ 6，显示至四位小数）`) : `Mean: ${score.mean.toFixed(4)} / 5 (${score.sum} ÷ 6, rounded to four decimals)`)}</p>
        {score.mean !== null ? <p data-intimacy-sum className="mb-4 leading-8">{zh
          ? (traditional ? `原始和：${score.sum}（範圍6—30）。只表示對本組混合陳述的符合程度，不轉換為親密度、機率、常模或同意。` : `原始和：${score.sum}（范围6—30）。只表示对本组混合陈述的符合程度，不转换为亲密度、概率、常模或同意。`)
          : `Raw sum: ${score.sum} (range 6–30). This describes agreement with this group of mixed statements, without conversion to intimacy, probability, norms or consent.`}</p>
          : <p className="mb-4 leading-8 text-slate-600">{zh
            ? (traditional ? "本組暫不給個人數值，不以零或中點代答；其他完整組保留。以下完整通用指南始終可讀，也不表示你被分配到這一型別。" : "本组暂不给个人数值，不以零或中点代答；其他完整组保留。以下完整通用指南始终可读，也不表示你被分配到这一类型。")
            : "This group has no personal value, without zero or midpoint imputation. Other complete groups remain available. Its complete general guide stays readable without assigning you a type."}</p>}
        <QuestionnaireResultReading quizSlug={quiz.slug} profile={readingProfile} locale={locale} headingLevel={4} idPrefix={`intimacy-report-${profile.id}`} mode="result" previewSectionIds={[`${readingProfile.id}-example`, `${readingProfile.id}-action`]} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline"
          href={questionnaireGuidePath(traditional ? "zh-TW" : locale, quiz.slug, profile.id)}>{zh ? (traditional ? "閱讀本部分完整公開指南" : "阅读本部分完整公开指南") : "Read this part’s complete public guide"}</Link>
      </section>;
    })}
    <section data-intimacy-next-steps className="rounded-lg border border-slate-200 p-4 sm:p-6">
      <h3 className="text-xl font-semibold">{zh ? (traditional ? "只選一件願意說清楚的事，也可以結束" : "只选一件愿意说清楚的事，也可以结束") : "Choose one thing you want to clarify, or finish here"}</h3>
      <p className="mt-3 leading-8">{zh
        ? (traditional ? "你可以只為自己記下一個當前願意的安排、一項需要先確認的條件和一種暫停方式。例如先問今晚是否有餘力聽，再決定是否聊；這項練習同樣可跳過。無需分享答案、聯絡或說服任何人。" : "你可以只为自己记下一个当前愿意的安排、一项需要先确认的条件和一种暂停方式。例如先问今晚是否有余力听，再决定是否聊；这项练习同样可跳过。无需分享答案、联系或说服任何人。")
        : "You may privately note one arrangement you want now, one condition to confirm first and one way to pause. For example, ask whether there is capacity to listen tonight before deciding to talk. You can skip this exercise. Sharing answers, contacting someone or persuading anyone is not required."}</p>
      <Link prefetch={false} className="mt-4 inline-block min-h-11 py-2 underline" href={`/${traditional ? "zh-TW" : locale}/tests#more-tests`}>{zh ? (traditional ? "返回全部測試" : "返回全部测试") : "Back to all tests"}</Link>
    </section>

    <details className="border-t border-slate-200 pt-4" data-result-reading-method>
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? (traditional ? "檢視計分與使用說明" : "查看计分与使用说明") : "View scoring and use notes"}</summary>
      <p className="leading-8">{zh
      ? (traditional ? "四部分分別讀，不合總分、不排名、不指定親密型別。均分只摘要六次數值選擇，不衡量情感成熟、接觸需求、陪伴比例或關係公開程度；同樣的均分也可能來自不同答案。3是有效的不確定或視情況，不計分不補零。" : "四部分分别读，不合总分、不排名、不指定亲密类型。均分只摘要六次数值选择，不衡量情感成熟、接触需求、陪伴比例或关系公开程度；同样的均分也可能来自不同答案。3是有效的不确定或视情况，不计分不补零。")
      : "Read the four parts separately, without an overall total, ranking or assigned intimacy type. Each mean summarizes six numeric choices, not emotional maturity, a need for contact, a time-allocation ratio or relationship publicity. Different answers can produce the same mean. A 3 is a valid uncertain or depends response; unscored is not zero."}</p>
    </details>
  </ResultPage>;
}
