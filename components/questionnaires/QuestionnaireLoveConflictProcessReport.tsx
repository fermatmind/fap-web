import { ResultOverview, ResultPage } from "./QuestionnaireResultPresentation";
import Link from "next/link";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireLoveConflictProcessReport({ quiz, result, locale }: {
  quiz: Questionnaire;
  result: Extract<FacetResult, { status: "complete" }>;
  locale: Locale;
}) {
  const zh = locale === "zh";
  return <ResultPage variant="reflection" className="my-6 space-y-8" data-love-conflict-process-result>


    {quiz.directions.map(direction => {
      const score = result.facets[direction.id], profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
      return <section key={direction.id} className="rounded-lg border border-slate-200 p-4 sm:p-6"
        data-love-conflict-process-part={direction.id} aria-labelledby={`love-conflict-process-${direction.id}`}>
        <h3 id={`love-conflict-process-${direction.id}`} className="scroll-mt-24 text-xl font-semibold">{direction.title[locale]}</h3>
        <p data-love-conflict-process-score={direction.id} className="my-4 rounded-lg bg-slate-50 p-4 font-semibold">{score.mean === null
          ? (zh ? `资料不足：${score.rated}/5题有数值回答；需要五题完整，不计算本组均分。` : `Insufficient information: ${score.rated}/5 items rated; all five are needed. No mean is calculated for this group.`)
          : (zh ? `本组描述均分：${score.mean.toFixed(1)} / 5（5/5题有效）` : `Descriptive mean: ${score.mean.toFixed(1)} / 5 (5/5 items rated)`)}</p>
        {score.mean === null && <p className="mb-4 text-sm leading-7 text-slate-600">{zh
          ? "不适用、无法判断或不愿回答都保留为不计分，不变成人格或关系结论。以下是完整通用读法，不是本次个人结论。"
          : "Not applicable, uncertain or a choice not to answer remains unscored, never a character or relationship verdict. The full guide below is general information rather than a personal conclusion."}</p>}
        <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`love-conflict-process-report-${direction.id}`} mode="result" previewSectionIds={["meaning", "context", "conversation", "next"]} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline"
          href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读本观察区的完整公开指南" : "Read this observation area’s full public guide"}</Link>
      </section>;
    })}
    <p className="leading-8">{zh
      ? "本版二十题及读法为费马原创，没有已建立信度、本地常模、语言等价或分手预测。与五策略冲突题本和接收道歉偏好职责不同，不能换算。无需联系、披露、原谅、复合或继续不安全讨论，下一步由你选择。"
      : "These twenty items and readings are original to FermatMind, without established reliability, local norms, language equivalence or breakup prediction. They have a different purpose from five-strategy conflict and apology-reception preferences and cannot be converted to them. No contact, disclosure, forgiveness, reconciliation or continuation of an unsafe discussion is required; what comes next is your choice."}</p>

    <details className="border-t border-slate-200 pt-4" data-result-reading-method>
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? "查看全部读数、计分与使用说明" : "View all readings, scoring and use notes"}</summary>
      <ResultOverview locale={locale} title={zh ? "各部分读数概览" : "Your separate readings"}
      description={zh ? "按题本顺序呈现，各部分独立阅读。点击名称可查看完整解释；资料不足与低分分开保留。" : "Shown in the form’s order, with each part read separately. Select a name for its full explanation. Insufficient information stays distinct from a lower value."}
      items={quiz.directions.map(direction => {
        const score = result.facets[direction.id];
        return { id: direction.id, label: direction.title[locale], href: `#love-conflict-process-${direction.id}`,
          value: score.mean !== null ? `${score.mean.toFixed(1)} / 5` : (zh ? "资料不足" : "Insufficient information"),
          note: zh ? `${score.rated} / ${score.total}条有效回答` : `${score.rated} / ${score.total} rated items` };
      })} />
      <p className="leading-8">{zh
      ? "四个编辑观察区分别回看自己报告的升温、暂停、再谈与修复动作，不合总分、不排名或派吵架型，也不是固定顺序或已验证独立因子。相同或相近均分保留；修复不抵销伤害。"
      : "Four editorial observation areas separately describe your reports of escalation, pauses, returning to an issue and repair actions. There is no total, ranking or assigned fight type, and these are not fixed stages or validated independent factors. Close and equal means remain visible; repair does not cancel harm."}</p>
    </details>
  </ResultPage>;
}
