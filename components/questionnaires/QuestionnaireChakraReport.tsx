import { PortraitFacetLead } from "./PortraitFacetLead";
import Link from "next/link";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";

export function QuestionnaireChakraReport({ quiz, result, locale, displayLocale = locale, copy = text => text }: {
  quiz: Questionnaire;
  result: Extract<FacetResult, { status: "complete" }>;
  locale: Locale;
  displayLocale?: DisplayLocale;
  copy?: (text: string) => string;
}) {
  const zh = locale === "zh";
  return <div className="my-6 space-y-8">
    <PortraitFacetLead quiz={quiz} result={result} locale={locale} anchorPrefix="chakra-title-" />
    <section className="rounded-lg bg-slate-50 p-4 leading-8" aria-label={zh ? copy("七组自述怎样读") : "How to read seven separate self-reports"}>
      <h3 className="text-xl font-semibold">{zh ? copy("象征反思，不是能量测量") : "Symbolic reflection, not an energy reading"}</h3>
      <p className="mt-3">{zh ? copy("七组描述不同的日常行动与机会，分别阅读，不相加、不排名。较高均分只表示这四条自述经反向计分后的回答较高；不代表更健康、更平衡、脉轮更开放，或比别人更好。七组同分也不证明达成理想状态。") : "The seven groups concern different everyday actions and opportunities. Read them separately, without a total or ranking. A higher mean only summarises higher keyed responses to these four statements; it does not mean healthier, more balanced, more open or better than someone else. Equal means do not establish an ideal state."}</p>
      <p className="mt-3" data-chakra-legend>{quiz.questions[0].options.slice(0, 5).map(option => `${option.id} ${option.label[locale]}`).join(zh ? copy("；") : "; ")}</p>
      <p className="mt-3">{zh ? copy("每组第四题用6减原回答，其余保留1—5原值。无法评分项排除，不补零。至少三条有效评分才计算均分，显示到一位小数；这是本站资料完整规则，不是诊断阈值。") : "The fourth item in each group uses 6 minus the response; the other items retain their 1–5 values. Unavailable responses are excluded, never replaced with zero. A mean needs at least three ratings and is shown to one decimal: a website completeness rule, not a diagnostic cutoff."}</p>
    </section>
    {quiz.directions.map(direction => {
      const score = result.facets[direction.id];
      const profile = quiz.profiles.find(value => value.directionIds[0] === direction.id)!;
      const available = score.mean !== null;
      const missing = zh ? copy("资料不足") : "Insufficient information";
      return <section key={direction.id} data-chakra-group={direction.id} aria-labelledby={`chakra-title-${direction.id}`} className="rounded-lg border border-slate-200 p-4 sm:p-6">
        <h3 id={`chakra-title-${direction.id}`} className="scroll-mt-24 text-2xl font-semibold leading-snug [overflow-wrap:anywhere]">{direction.title[locale]}</h3>
        <dl className="my-5 space-y-3 rounded-lg bg-slate-50 p-4">
          <div className="grid grid-cols-1 gap-2 border-b border-slate-200 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(7rem,auto)] sm:gap-4 [&>dd]:font-semibold [&>dd]:tabular-nums"><dt>{zh ? copy("本次有效评分") : "Ratings supplied"}</dt><dd data-chakra-rated>{score.rated} / {score.total}</dd></div>
          <div className="grid grid-cols-1 gap-2 border-b border-slate-200 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(7rem,auto)] sm:gap-4 [&>dd]:font-semibold [&>dd]:tabular-nums"><dt>{zh ? copy("本组计分后总和") : "This group’s keyed sum"}</dt><dd data-chakra-sum>{available ? score.sum : missing}</dd></div>
          <div className="grid grid-cols-1 gap-2 border-b border-slate-200 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(7rem,auto)] sm:gap-4 [&>dd]:font-semibold [&>dd]:tabular-nums"><dt>{zh ? copy("本组自述均分") : "This group’s self-report mean"}</dt><dd data-chakra-mean>{available ? `${score.mean!.toFixed(1)} / 5` : missing}</dd></div>
        </dl>
        {!available && <p data-chakra-insufficient className="mb-5 rounded-lg bg-amber-50 p-4 leading-7">{zh ? copy(`本组${score.rated}条有效评分，少于所需${quiz.minimumRatedItems}条，不计算个人总和或均分。下面仍可读完整通用说明，不能据此解释你这次的状态。`) : `This group has ${score.rated} ratings, fewer than the ${quiz.minimumRatedItems} needed. No personal sum or mean is interpreted. The full general guide follows, but it is not an interpretation of your state in this attempt.`}</p>}
        <div data-chakra-guide={profile.id}><QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} traditional={displayLocale === "zh-TW"} headingLevel={4} idPrefix={`report-${profile.id}`} mode="result" previewSectionIds={["meaning", "scene", "try"]} /></div>
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(displayLocale, quiz.slug, profile.id)}>{zh ? copy("阅读这一主题的公开说明") : "Read this theme’s public guide"}</Link>
      </section>;
    })}
  </div>;
}
