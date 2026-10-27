import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireTriangleReport({ quiz, result, locale }: {
  quiz: Questionnaire;
  result: Extract<FacetResult, { status: "complete" }>;
  locale: Locale;
}) {
  const zh = locale === "zh";
  return <div className="my-6 space-y-8" data-triangle-reflection-result>
    <p className="leading-8">{zh
      ? "三组分别描述本题本中自己报告的亲密、激情与决定／承诺，不合成爱的总分、不选主导成分，也不按阈值派发八种理论类型。相近或相同均分保留，不证明成分同样强。"
      : "The three groups separately describe your reports of intimacy, passion and decision/commitment in this item set. There is no total love score, dominant component or cutoff assigning eight theoretical types. Close and equal means remain visible without proving equal components."}</p>
    {quiz.directions.map(direction => {
      const score = result.facets[direction.id], profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
      return <section key={direction.id} className="rounded-lg border border-slate-200 p-4 sm:p-6"
        data-triangle-reflection-part={direction.id} aria-labelledby={`triangle-reflection-${direction.id}`}>
        <h3 id={`triangle-reflection-${direction.id}`} className="text-xl font-semibold">{direction.title[locale]}</h3>
        <p data-triangle-reflection-score={direction.id} className="my-4 rounded-lg bg-slate-50 p-4 font-semibold">{score.mean === null
          ? (zh ? `资料不足：${score.rated}/5题有数值回答；需要五题完整，不计算本组均分。` : `Insufficient information: ${score.rated}/5 items rated; all five are needed. No mean is calculated for this group.`)
          : (zh ? `本组描述均分：${score.mean.toFixed(1)} / 5（5/5题有效）` : `Descriptive mean: ${score.mean.toFixed(1)} / 5 (5/5 items rated)`)}</p>
        {score.mean === null && <p className="mb-4 text-sm leading-7 text-slate-600">{zh
          ? "不适用、无法判断或不愿回答都保留为不计分，不变成低爱或缺陷。以下是完整通用读法，不是本次个人结论。"
          : "Not applicable, uncertain or a choice not to answer remains unscored, never low love or a defect. The full guide below is general information rather than a personal conclusion."}</p>}
        <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`triangle-reflection-report-${direction.id}`} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline"
          href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读本成分的完整公开指南" : "Read this component’s full public guide"}</Link>
      </section>;
    })}
    <p className="leading-8">{zh
      ? "本版是参照理论的费马原创反思，不是TLS原版或经验证短版，没有本地常模、跨语言等价性或关系预测证据。无需联系、披露、身体亲密或承诺继续；下一步由你选择。"
      : "This is a FermatMind original theory-informed reflection, not the original TLS or a validated short form. It has no local norms, established language equivalence or relationship-prediction evidence. No contact, disclosure, physical intimacy or promise to continue is required; what comes next is your choice."}</p>
  </div>;
}
