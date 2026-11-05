import Link from "next/link";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireFriendshipFitReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh";
  const missing = zh ? "资料不足" : "Insufficient information";
  return <div className="my-6 space-y-8">
    <p className="leading-8">{zh ? "五组分别回顾过去四周同一段友谊中自己经历的互动，不相加、不排名，也不按最高均分派型。以下五份完整读法全部提供；频率不是两人匹配的百分比，也不能揭示朋友的意图。" : "Five groups describe interactions you experienced in one friendship during the past four weeks. They are not combined, ranked or assigned as a highest-mean type. All five complete readings are available. Frequency is not a two-person compatibility percentage and cannot reveal your friend’s intentions."}</p>
    <section data-friendfit-overview aria-label={zh ? "五组分别读数" : "Five separate friendship interaction readings"} className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-6">
      <h3 className="text-xl font-semibold">{zh ? "回想你与这位朋友的一次相处" : "Recall an interaction with this friend"}</h3>
      <p className="mt-3 max-w-prose leading-7">{zh ? "先选一类你在这段友谊里遇到的情境，再读它的例子。各项是本组频率，不用作两人匹配分。" : "Choose a situation from this friendship and read its example. Each number reflects a group of frequency ratings rather than a compatibility score."}</p>
      <dl className="mt-4 grid gap-x-6 gap-y-3 md:grid-cols-2">{quiz.directions.map(direction => {
        const score = result.facets[direction.id];
        const profile = quiz.profiles.find(item => item.directionIds[0] === direction.id)!;
        return <div key={direction.id} data-friendfit-summary={direction.id} className="min-w-0 space-y-2 border-t-2 border-emerald-300 pt-2">
          <dt className="font-semibold"><a className="inline-flex min-h-11 items-center py-2 text-emerald-950 underline underline-offset-4" href={`#friendfit-guide-${profile.id}`}>{direction.title[locale]}</a></dt>
          <dd data-friendfit-mean className="text-lg">{score.mean === null ? missing : `${(score.sum / score.total).toFixed(1)} / 5`}</dd>
          <dd data-friendfit-sum className="text-sm text-slate-600">{zh ? "频率评分和（4—20）" : "Frequency rating sum (4–20)"}: {score.mean === null ? missing : score.sum}</dd>
          <dd data-friendfit-rated className="text-sm text-slate-600">{zh ? "有效频率回答" : "Valid frequency ratings"}: {score.rated} / {score.total}</dd>
        </div>;
      })}</dl>
      <p className="mt-5 text-sm leading-7 text-slate-600">{zh ? "每组四题全有效才给个人评分和与均分；任一不计分只使所属组资料不足，不补零或中间值。全部二十题都按1—5正向计分。均分显示一位小数，不是契合百分比、人口排名或友谊质量的判决。" : "Each group requires all four frequency responses for its personal sum and mean. An unscored answer withholds only that group, without zero or midpoint filling. All twenty items keep their direct 1–5 values. The one-decimal mean is not a compatibility percentage, population rank or verdict on friendship quality."}</p>
    </section>
    {quiz.profiles.map(profile => {
      const score = result.facets[profile.directionIds[0]];
      return <section key={profile.id} data-friendfit-guide={profile.id} aria-labelledby={`friendfit-guide-${profile.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
        <h3 id={`friendfit-guide-${profile.id}`} className="scroll-mt-24 mb-5 scroll-mt-24 text-xl font-semibold leading-snug sm:text-2xl">{profile.title[locale]}</h3>
        {score.mean === null && <p data-friendfit-insufficient className="mb-5 rounded-lg bg-amber-50 p-4 leading-7">{zh ? "本组资料不足，未生成个人评分和或均分。完整通用说明仍可阅读，不替代个人读数，也不需要猜答。其他完整组照常显示。" : "This group has insufficient information, so no personal sum or mean was generated. The full general reading remains available without replacing a personal value or requiring guessed answers. Other complete groups remain shown."}</p>}
        <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`friendfit-report-${profile.id}`} mode="result" previewSectionIds={["meaning", "example", "action"]} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "打开这组完整公开指南" : "Open this complete public guide"}</Link>
      </section>;
    })}
  </div>;
}
