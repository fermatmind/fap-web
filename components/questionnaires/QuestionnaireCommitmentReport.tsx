import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireCommitmentReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh", missing = zh ? "资料不足" : "Insufficient information";
  return <div className="my-6 space-y-8">
    <p className="leading-8">{zh ? "四部分分别记录自己的当前自报，不相加、不按最高项派型，也不推算对方的意愿、关系质量或分手概率。较高并不是四部分都更好：关系外选择不等于不忠，既有投入不等于必须留下。" : "Four parts record your current self-reports separately, without a combined total, highest-mean type, partner judgement, relationship-quality rating or breakup probability. Higher is not better across all four: outside options are not infidelity, and investment is not an obligation to stay."}</p>
    <section data-commitment-overview aria-label={zh ? "四部分分别读数" : "Four separate relationship readings"} className="rounded-xl bg-slate-50 p-4 sm:p-6">
      <h3 className="text-xl font-semibold">{zh ? "先分别看四项，再读全部解释" : "Read four separate values, then every full guide"}</h3>
      <dl className="mt-4 grid gap-5 sm:grid-cols-2">{quiz.directions.map(direction => {
        const score = result.facets[direction.id];
        return <div key={direction.id} data-commitment-summary={direction.id} className="min-w-0 space-y-2">
          <dt className="font-semibold">{direction.title[locale]}</dt>
          <dd data-commitment-mean className="text-lg">{score.mean === null ? missing : `${(score.sum / score.total).toFixed(1)} / 5`}</dd>
          <dd data-commitment-sum className="text-sm text-slate-600">{zh ? "键向调整后总数（6—30）" : "Key-adjusted sum (6–30)"}: {score.mean === null ? missing : score.sum}</dd>
          <dd data-commitment-rated className="text-sm text-slate-600">{zh ? "有效符合度回答" : "Valid fit ratings"}: {score.rated} / {score.total}</dd>
        </div>;
      })}</dl>
      <p className="mt-5 text-sm leading-7 text-slate-600">{zh ? "每组六条全有效才显示个人总数与均分；任一NA只使所属部分保留资料不足。3不是人口平均，4.0不代表80%会继续。本版原创题没有常模、效度或跨语言等价验证。" : "Each part needs all six valid ratings for its sum and mean; any NA withholds only that part. Three is not a population average, and 4.0 is not an 80% chance of continuing. These original items have no population norms, established validity or demonstrated language equivalence."}</p>
    </section>
    {quiz.profiles.map(profile => {
      const score = result.facets[profile.directionIds[0]];
      return <section key={profile.id} data-commitment-guide={profile.id} aria-labelledby={`commitment-guide-${profile.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
        <h3 id={`commitment-guide-${profile.id}`} className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h3>
        {score.mean === null && <p data-commitment-insufficient className="mb-5 rounded-lg bg-amber-50 p-4 leading-7">{zh ? "本部分资料不足，未生成个人总数或均分。以下是完整通用解释，不能当作对本次个人状态的判断；可以保留未评分。" : "This part has insufficient information, so no personal sum or mean was generated. The complete general guide below is not a judgement of your state in this attempt. You can leave this part unscored."}</p>}
        <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这一部分的完整公开指南" : "Read this part’s complete public guide"}</Link>
      </section>;
    })}
  </div>;
}
