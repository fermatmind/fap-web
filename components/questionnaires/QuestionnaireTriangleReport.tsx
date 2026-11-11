import { ResultPage } from "./QuestionnaireResultPresentation";
import Link from "next/link";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";

export function QuestionnaireTriangleReport({ quiz, result, locale, displayLocale = locale, copy = text => text }: {
  quiz: Questionnaire;
  result: Extract<FacetResult, { status: "complete" }>;
  locale: Locale; displayLocale?: DisplayLocale; copy?: (text: string) => string;
}) {
  const zh = locale === "zh";
  return <ResultPage variant="dimensions" className="my-6 space-y-8" data-triangle-reflection-result>
    <section className="rounded-xl border border-fuchsia-200 bg-fuchsia-50/55 p-4 sm:p-6" aria-labelledby="love-components">
      <h3 id="love-components" className="text-xl font-semibold text-fuchsia-950">{zh ? copy("亲密、激情和决定各自看") : "Look at intimacy, passion and commitment separately"}</h3>
      <p className="mt-3 max-w-prose leading-7">{zh ? copy("围绕同一段关系，选一项你想多了解的体验。每项只取本组五道题的均分。资料不够时，仍可读例子。") : "Think about the same relationship and choose one experience to read more about. Each mean comes from five ratings in that group. Examples remain available when there are too few ratings."}</p>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {quiz.directions.map(direction => {
          const score = result.facets[direction.id];
          return <a key={direction.id} href={`#triangle-reflection-${direction.id}`} className="block min-w-0 border-t-2 border-fuchsia-300 py-3 text-fuchsia-950">
            <span className="block font-semibold underline decoration-fuchsia-400 underline-offset-4">{direction.title[locale]}</span>
            <span className="mt-2 block font-semibold tabular-nums">{score.mean === null ? (zh ? copy(`${score.rated}/5 项有效，未算均分`) : `${score.rated}/5 rated, no mean`) : `${score.mean.toFixed(1)} / 5`}</span>
          </a>;
        })}
      </div>
    </section>

    {quiz.directions.map(direction => {
      const score = result.facets[direction.id], profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
      return <section key={direction.id} className="rounded-lg border border-slate-200 p-4 sm:p-6"
        data-triangle-reflection-part={direction.id} aria-labelledby={`triangle-reflection-${direction.id}`}>
        <h3 id={`triangle-reflection-${direction.id}`} className="scroll-mt-24 text-xl font-semibold">{direction.title[locale]}</h3>
        <p data-triangle-reflection-score={direction.id} className="my-4 rounded-lg bg-slate-50 p-4 font-semibold">{score.mean === null
          ? (zh ? copy(`资料不足：${score.rated}/5题有数值回答；需要五题完整，不计算本组均分。`) : `Insufficient information: ${score.rated}/5 items rated; all five are needed. No mean is calculated for this group.`)
          : (zh ? copy(`本组描述均分：${score.mean.toFixed(1)} / 5（5/5题有效）`) : `Descriptive mean: ${score.mean.toFixed(1)} / 5 (5/5 items rated)`)}</p>
        {score.mean === null && <p className="mb-4 text-sm leading-7 text-slate-600">{zh
          ? copy("不适用、无法判断或不愿回答都保留为不计分，不变成低爱或缺陷。以下是完整通用读法，不是本次个人结论。")
          : "Not applicable, uncertain or a choice not to answer remains unscored, never low love or a defect. The full guide below is general information rather than a personal conclusion."}</p>}
        <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} traditional={displayLocale === "zh-TW"} headingLevel={4} idPrefix={`triangle-reflection-report-${direction.id}`} mode="result" previewSectionIds={["meaning", "context", "conversation", "next"]} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline"
          href={questionnaireGuidePath(displayLocale, quiz.slug, profile.id)}>{zh ? copy("阅读本成分的完整公开指南") : "Read this component’s full public guide"}</Link>
      </section>;
    })}
    <p className="leading-8">{zh
      ? copy("本版是参照理论的费马原创反思，不是TLS原版或经验证短版，没有本地常模、跨语言等价性或关系预测证据。无需联系、披露、身体亲密或承诺继续；下一步由你选择。")
      : "This is a FermatMind original theory-informed reflection, not the original TLS or a validated short form. It has no local norms, established language equivalence or relationship-prediction evidence. No contact, disclosure, physical intimacy or promise to continue is required; what comes next is your choice."}</p>

    <details className="border-t border-slate-200 pt-4" data-result-reading-method>
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? copy("查看计分与使用说明") : "View scoring and use notes"}</summary>
      <p className="leading-8">{zh
      ? copy("三组分别描述本题本中自己报告的亲密、激情与决定／承诺，不合成爱的总分、不选主导成分，也不按阈值派发八种理论类型。相近或相同均分保留，不证明成分同样强。")
      : "The three groups separately describe your reports of intimacy, passion and decision/commitment in this item set. There is no total love score, dominant component or cutoff assigning eight theoretical types. Close and equal means remain visible without proving equal components."}</p>
    </details>
  </ResultPage>;
}
