import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireDarkTriadReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh", available = Object.values(result.facets).filter(f => f.rated >= 4).length;
  return <div className="my-6 space-y-8">
    <section className="space-y-4 rounded-lg bg-slate-50 p-4" aria-labelledby="dtt-summary-title">
      <h3 id="dtt-summary-title" className="text-xl font-semibold">{zh ? "过去三个月，三组分别阅读" : "Three separate readings of the past three months"}</h3>
      <p className="leading-8">{zh ? `${available} / 3组有足够数值。每组六条至少四条有效，才显示原始和、有效条数与从未舍入原始和除以有效条数计算的两位描述性均分。全部同向、0反向；不愿回答排除，不补零或3。` : `${available} / 3 groups have enough numeric ratings. Each six-item group needs four ratings for its raw sum, rated count and two-decimal descriptive mean from the unrounded sum divided by that count. All items are direct, with zero reversals; unscored responses are excluded without zero or three substitution.`}</p>
      <dl className="space-y-5">{quiz.directions.map(direction => {
        const facet = result.facets[direction.id], mean = facet.rated >= 4 ? facet.sum / facet.rated : null;
        return <div key={direction.id} data-dtt-facet={direction.id} className="space-y-2"><dt className="font-semibold leading-7">{direction.title[locale]}</dt><dd>
          <span data-dtt-mean>{mean === null ? (zh ? "资料不足" : "Insufficient information") : `${mean.toFixed(2)} / 5`}</span>
          {mean !== null && <span data-dtt-sum className="ml-3 text-sm">{zh ? `原始和${facet.sum} / ${facet.rated}条数值` : `Raw sum ${facet.sum} / ${facet.rated} rated items`}</span>}
          <span data-dtt-rated className="block text-sm text-slate-600">{zh ? `${facet.rated} / 6条数值有效；${6 - facet.rated}条不愿回答` : `${facet.rated} / 6 numeric ratings; ${6 - facet.rated} unscored responses`}</span>
        </dd></div>;
      })}</dl>
      {available === 0 && <p data-dtt-insufficient className="leading-8">{zh ? "本次作答已结束，没有生成个人均分。无需补答，三份完整说明仍在下方。" : "This attempt is finished without personal means. No further answers are required; all three full guides remain below."}</p>}
      <p className="text-sm leading-7">{zh ? "1完全不符合、2比较不符合、3不确定或视情况、4比较符合、5非常符合。均分描述符合度，不是频率或强度。三组不加总、不排序、不设阈值或派最高型，也不与SD3或Dirty Dozen换算。均分不证明等距精度、可靠改变、临床人格、善恶、能力、安全或风险。" : "1 Very inaccurate, 2 Somewhat inaccurate, 3 Uncertain or depends on the situation, 4 Somewhat accurate, 5 Very accurate. Means describe accuracy, not frequency or intensity. Groups are not added, ranked, assigned thresholds or converted into a dominant type, SD3 or Dirty Dozen scores. Means establish neither interval precision, reliable change, clinical personality, morality, ability, safety nor risk."}</p>
    </section>
    <p className="leading-8">{zh ? "三份九节全文全部保留，包括资料不足的组。它们是具体主题的说明，不是三种人格。可以读完后结束，不需另一测评解锁。" : "All three nine-section guides remain available, including for insufficient groups. They explain specific themes rather than three personalities. You may finish after reading, without another assessment unlocking anything."}</p>
    {quiz.profiles.map(profile => <section key={profile.id} data-dtt-profile={profile.id} aria-labelledby={`dtt-title-${profile.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
      <h3 id={`dtt-title-${profile.id}`} className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h3>
      <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这一主题的公开说明" : "Read this theme’s public explanation"}</Link>
    </section>)}
  </div>;
}
