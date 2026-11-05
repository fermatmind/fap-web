import Link from "next/link";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireTrustReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh", missing = zh ? "资料不足" : "Insufficient information";
  return <div className="my-6 space-y-8">

      <section data-trust-overview aria-label={zh ? "四组分别读数" : "Four separate everyday trust readings"} className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-6">
      <h3 className="text-xl font-semibold">{zh ? "当你决定怎么信任，做了什么" : "What did you do when deciding how to trust?"}</h3>
      <p className="mt-3 max-w-prose leading-7">{zh ? "开放、分步、核对和保持距离可以同时出现。选一项，把你报告的频率放回一段真实相处里看。" : "Opening up, building gradually, clarifying and keeping distance can coexist. Open one topic and put its reported frequency back into a real interaction."}</p>
      <dl className="mt-4 grid gap-5 sm:grid-cols-2">{quiz.directions.map(direction => {
        const score = result.facets[direction.id];
        return <div key={direction.id} data-trust-summary={direction.id} className="min-w-0 space-y-2">
          <dt className="font-semibold">{quiz.profiles.some(profile => profile.directionIds.includes(direction.id)) ? <a className="inline-flex min-h-11 items-center py-2 underline decoration-slate-300 underline-offset-4" href={`#trust-guide-${quiz.profiles.find(profile => profile.directionIds.includes(direction.id))!.id}`}>{direction.title[locale]}</a> : direction.title[locale]}</dt>
          <dd data-trust-mean className="text-lg">{score.mean === null ? missing : `${(score.sum / score.total).toFixed(1)} / 5`}</dd>
          <dd data-trust-sum className="text-sm text-slate-600">{zh ? "原始频率评分和（6—30）" : "Raw frequency-rating sum (6–30)"}: {score.mean === null ? missing : score.sum}</dd>
          <dd data-trust-rated className="text-sm text-slate-600">{zh ? "有效频率回答" : "Valid frequency ratings"}: {score.rated} / {score.total}</dd>
        </div>;
      })}</dl>
      <p className="mt-5 text-sm leading-7 text-slate-600">{zh ? "每组六条全有效才显示原始和与均分；任一NA只使所属组不足。4.0不是信任度80%，六是题目数，不是六次互动。四组为原创议题分组，没有常模、心理测量或跨语言等价验证。" : "Each group needs all six valid ratings for its sum and mean; any NA withholds only that group. A mean of 4.0 is not 80 percent trust. Six counts statements, not encounters. These original topic groups have no population norms, established psychometric validity or demonstrated language equivalence."}</p>
    </section>


    {quiz.profiles.map(profile => {
      const score = result.facets[profile.directionIds[0]];
      return <section key={profile.id} data-trust-guide={profile.id} aria-labelledby={`trust-guide-${profile.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
        <h3 id={`trust-guide-${profile.id}`} className="scroll-mt-24 mb-5 text-xl font-semibold leading-snug sm:text-2xl">{profile.title[locale]}</h3>
      {(() => { const facet = result.facets[profile.directionIds[0]], mean = facet.mean === null ? null : facet.sum / facet.total; return <p className="mb-5 text-lg font-semibold tabular-nums">{zh ? "本次均分：" : "Your mean: "}{mean === null ? (zh ? "资料不足" : "Insufficient information") : `${mean.toFixed(1)} / 5`}</p>; })()}

        {score.mean === null && <p data-trust-insufficient className="mb-5 rounded-lg bg-amber-50 p-4 leading-7">{zh ? "本组资料不足，未生成个人原始和或均分。下面四份完整通用说明仍可阅读，不替代你的个人评分；无需猜答。" : "This group has insufficient information, so no personal sum or mean was generated. All four complete general guides remain readable without replacing your personal score. There is no need to guess."}</p>}
        <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`trust-report-${profile.id}`} mode="result" previewSectionIds={["meaning", "scene", "private-practice"]} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这一部分的完整公开指南" : "Read this part’s complete public guide"}</Link>
      </section>;
    })}

    <details className="border-t border-slate-200 pt-4" data-result-reading-method>
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? "全部读数、计分与使用说明" : "All readings, scoring and use notes"}</summary>
      <p className="leading-8">{zh ? "四组分别回顾过去四周自己的日常行动频率，不相加、不相减、不按最高均分派型。开放、分步、核对和距离可以并存；均分不诊断信任问题，也不判断别人是否可靠。" : "Four groups describe your reported everyday-action frequency during the past four weeks. They are not added, subtracted or assigned as a type by the highest mean. Opening, staging, clarification and distance can coexist. Means do not diagnose trust issues or judge anyone else’s reliability."}</p>

    </details>
  </div>;
}
