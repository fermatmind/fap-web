import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireWholesomePartnerReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh";
  const missing = zh ? "资料不足" : "Insufficient information";
  return <div className="my-6 space-y-8">
    <p className="leading-8">{zh ? "八组分别回顾过去四周自己的相处行动，不相加、不跨组排名或按最高均分派型。以下完整读法全部提供，不需要把自己或伴侣归为健康／有毒类型；任何均分都不证明一段关系安全。" : "Eight groups describe your own reported interactions during the past four weeks. They are not combined, ranked or assigned as a highest-mean type. Every full reading is available without a healthy/toxic label for you or a partner. No mean establishes that a relationship is safe."}</p>
    <section data-wholesome-overview aria-label={zh ? "八组分别读数" : "Eight separate partner-behavior readings"} className="rounded-xl bg-slate-50 p-4 sm:p-6">
      <h3 className="text-xl font-semibold">{zh ? "先看八组读数，再读每组完整说明" : "Read eight separate values, then every full guide"}</h3>
      <dl className="mt-4 grid gap-5 sm:grid-cols-2">{quiz.directions.map(direction => {
        const score = result.facets[direction.id];
        const profile = quiz.profiles.find(item => item.directionIds[0] === direction.id)!;
        return <div key={direction.id} data-wholesome-summary={direction.id} className="min-w-0 space-y-2">
          <dt className="font-semibold"><a className="inline-block min-h-11 py-2 underline" href={`#wholesome-guide-${profile.id}`}>{direction.title[locale]}</a></dt>
          <dd data-wholesome-mean className="text-lg">{score.mean === null ? missing : `${(score.sum / score.total).toFixed(1)} / 5`}</dd>
          <dd data-wholesome-sum className="text-sm text-slate-600">{zh ? "计分后评分和（4—20）" : "Keyed rating sum (4–20)"}: {score.mean === null ? missing : score.sum}</dd>
          <dd data-wholesome-rated className="text-sm text-slate-600">{zh ? "有效频率回答" : "Valid frequency ratings"}: {score.rated} / {score.total}</dd>
        </div>;
      })}</dl>
      <p className="mt-5 text-sm leading-7 text-slate-600">{zh ? "每组四题全有效才给个人评分和与均分；任一跳过只使所属组不足，不补零或中间值。两道正向题保留1—5，两道反向题用6减原值；各指南写明对应行动。均分显示一位小数，不是百分比、人口排名或伴侣价值。" : "Each group requires all four frequency responses for its personal sum and mean. Any skip withholds only that group, without zero or midpoint filling. Two direct items keep their 1–5 values and two reverse items use 6 minus the response; each guide names the actions. The one-decimal mean is not a percentage, population rank or partner value."}</p>
    </section>
    {quiz.profiles.map(profile => {
      const score = result.facets[profile.directionIds[0]];
      return <section key={profile.id} data-wholesome-guide={profile.id} aria-labelledby={`wholesome-guide-${profile.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
        <h3 id={`wholesome-guide-${profile.id}`} className="mb-5 scroll-mt-24 text-2xl font-semibold">{profile.title[locale]}</h3>
        {score.mean === null && <p data-wholesome-insufficient className="mb-5 rounded-lg bg-amber-50 p-4 leading-7">{zh ? "本组资料不足，未生成个人评分和或均分。完整通用说明仍可阅读，不替代个人读数，也不需要猜答。其他完整组照常显示。" : "This group has insufficient information, so no personal sum or mean was generated. The full general reading remains available without replacing a personal value or requiring guessed answers. Other complete groups remain shown."}</p>}
        <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`wholesome-report-${profile.id}`} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "打开这组完整公开指南" : "Open this complete public guide"}</Link>
      </section>;
    })}
  </div>;
}
