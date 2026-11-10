import Link from "next/link";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";

export function QuestionnaireConflictStylesReport({ quiz, result, locale, displayLocale = locale, copy = text => text }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale; displayLocale?: DisplayLocale; copy?: (text: string) => string }) {
  const zh = locale === "zh";
  const missing = zh ? copy("资料不足") : "Insufficient information";
  return <div className="my-6 space-y-8">
    <p className="leading-8">{zh ? copy("五组分别回顾过去四周在选定场景中自己处理分歧的行动，不相加、不排名，也不按最高均分派型。以下五份完整读法全部提供；频率不能确定行动是否公平、安全或有效。") : "Five groups describe your own reported actions during disagreements in the past four weeks, within your chosen setting. They are not combined, ranked or assigned as a highest-mean type. All five complete readings are available. Frequency alone does not establish whether an action was fair, safe or effective."}</p>
    <section data-conflict-overview aria-label={zh ? copy("五组分别读数") : "Five separate conflict-handling readings"} className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 sm:p-6">
      <h3 className="text-xl font-semibold">{zh ? copy("选一个你在分歧中用过的做法") : "Choose an action you have used in a disagreement"}</h3>
      <p className="mt-3 max-w-prose leading-7">{zh ? copy("可以先看它在不同场合什么时候有用，再回看频率。五种做法各自有例子，也可以在一次分歧中并存。") : "Start with when it can be useful, then revisit its frequency. Each action has examples, and several can appear in the same disagreement."}</p>
      <dl className="mt-4 divide-y divide-amber-200">{quiz.directions.map(direction => {
        const score = result.facets[direction.id];
        const profile = quiz.profiles.find(item => item.directionIds[0] === direction.id)!;
        return <div key={direction.id} data-conflict-summary={direction.id} className="min-w-0 space-y-2 py-2 sm:grid sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] sm:gap-x-4">
          <dt className="font-semibold"><a className="inline-flex min-h-11 items-center py-2 text-amber-950 underline underline-offset-4" href={`#conflict-guide-${profile.id}`}>{direction.title[locale]}</a></dt>
          <dd data-conflict-mean className="text-lg">{score.mean === null ? missing : `${(score.sum / score.total).toFixed(1)} / 5`}</dd>
          <dd data-conflict-sum className="text-sm text-slate-600">{zh ? copy("频率评分和（4—20）") : "Frequency rating sum (4–20)"}: {score.mean === null ? missing : score.sum}</dd>
          <dd data-conflict-rated className="text-sm text-slate-600">{zh ? copy("有效频率回答") : "Valid frequency ratings"}: {score.rated} / {score.total}</dd>
        </div>;
      })}</dl>
      <p className="mt-5 text-sm leading-7 text-slate-600">{zh ? copy("每组四题全有效才给个人评分和与均分；任一不计分只使所属组资料不足，不补零或中间值。全部二十题都按1—5正向计分。均分显示一位小数，不是两轴坐标、人口排名或冲突处理能力总分。") : "Each group requires all four frequency responses for its personal sum and mean. An unscored answer withholds only that group, without zero or midpoint filling. All twenty items keep their direct 1–5 values. The one-decimal mean is not a two-axis coordinate, population rank or overall conflict competence score."}</p>
    </section>
    {quiz.profiles.map(profile => {
      const score = result.facets[profile.directionIds[0]];
      return <section key={profile.id} data-conflict-guide={profile.id} aria-labelledby={`conflict-guide-${profile.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
        <h3 id={`conflict-guide-${profile.id}`} className="scroll-mt-24 mb-5 scroll-mt-24 text-xl font-semibold leading-snug sm:text-2xl">{profile.title[locale]}</h3>
        {score.mean === null && <p data-conflict-insufficient className="mb-5 rounded-lg bg-amber-50 p-4 leading-7">{zh ? copy("本组资料不足，未生成个人评分和或均分。完整通用说明仍可阅读，不替代个人读数，也不需要猜答。其他完整组照常显示。") : "This group has insufficient information, so no personal sum or mean was generated. The full general reading remains available without replacing a personal value or requiring guessed answers. Other complete groups remain shown."}</p>}
        <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} traditional={displayLocale === "zh-TW"} headingLevel={4} idPrefix={`conflict-report-${profile.id}`} mode="result" previewSectionIds={["meaning", "example", "action"]} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(displayLocale, quiz.slug, profile.id)}>{zh ? copy("打开这组完整公开指南") : "Open this complete public guide"}</Link>
      </section>;
    })}
  </div>;
}
