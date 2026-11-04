import { ResultOverview, ResultPage } from "./QuestionnaireResultPresentation";
import Link from "next/link";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireWorkHabitsReport({ quiz, result, locale }: {
  quiz: Questionnaire;
  result: Extract<FacetResult, { status: "complete" }>;
  locale: Locale;
}) {
  const zh = locale === "zh";
  return <ResultPage variant="dimensions" className="my-6 space-y-8" data-work-habits-result>


    {quiz.directions.map(direction => {
      const score = result.facets[direction.id], profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
      return <section key={direction.id} className="rounded-lg border border-slate-200 p-4 sm:p-6"
        data-work-habits-part={direction.id} aria-labelledby={`work-habits-${direction.id}`}>
        <h3 id={`work-habits-${direction.id}`} className="scroll-mt-24 text-xl font-semibold">{direction.title[locale]}</h3>
        <p data-work-habits-score={direction.id} className="my-4 rounded-lg bg-slate-50 p-4 font-semibold">{score.mean === null
          ? (zh ? `资料不足：${score.rated}/6题有数值回答；需要六题完整，不计算本组均分。` : `Insufficient information: ${score.rated}/6 items rated; all six are needed. No mean is calculated for this group.`)
          : (zh ? `所选习惯均分：${score.mean.toFixed(1)} / 5（6/6题有效）` : `Selected-habit mean: ${score.mean.toFixed(1)} / 5 (6/6 items rated)`)}</p>
        {score.mean === null && <p className="mb-4 text-sm leading-7 text-slate-600">{zh
          ? "没有相关机会、无法判断或不愿回答都不计分，不转成低分或可疑标记。以下完整指南不是对品格或真实事件的裁定。"
          : "No relevant opportunity, uncertainty or a choice not to answer remains unscored, never low or suspicious. The complete guide below is not a finding about character or a real incident."}</p>}
        <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`work-habits-report-${direction.id}`} mode="result" previewSectionIds={["context", "example", "experiment"]} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline"
          href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读本组完整公开指南" : "Read this group’s full public guide"}</Link>
      </section>;
    })}
    <p className="leading-8">{zh
      ? "本原创双语反思没有建立信度、常模、预测效度或跨语言测量等价性，不能用于录用、晋升、处分或证明诚信。机会、资源、权限与安全都要考虑，不要求披露私密事件或承担控制范围外的责任。"
      : "This original bilingual reflection has no established reliability, norms, predictive validity or cross-language measurement equivalence. It cannot support hiring, promotion, discipline or proof of integrity. Consider opportunity, resources, authority and safety; no private incident disclosure or responsibility beyond your control is required."}</p>

    <details className="border-t border-slate-200 pt-4" data-result-reading-method>
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? "查看全部读数、计分与使用说明" : "View all readings, scoring and use notes"}</summary>
      <ResultOverview locale={locale} title={zh ? "各部分读数概览" : "Your separate readings"}
      description={zh ? "按题本顺序呈现，各部分独立阅读。点击名称可查看完整解释；资料不足与低分分开保留。" : "Shown in the form’s order, with each part read separately. Select a name for its full explanation. Insufficient information stays distinct from a lower value."}
      items={quiz.directions.map(direction => {
        const score = result.facets[direction.id];
        return { id: direction.id, label: direction.title[locale], href: `#work-habits-${direction.id}`,
          value: score.mean !== null ? `${score.mean.toFixed(1)} / 5` : (zh ? "资料不足" : "Insufficient information"),
          note: zh ? `${score.rated} / ${score.total}条有效回答` : `${score.rated} / ${score.total} rated items` };
      })} />
      <p className="leading-8">{zh
      ? "四组分别回看过去四周的自报任务习惯。反向处理只统一陈述方向，不测谎；没有整体可靠性等级、最弱环节判定或员工排名。"
      : "The four groups separately reflect on self-reported task habits over the past four weeks. Reverse coding aligns statement direction and does not detect lies. There is no overall reliability grade, weakest-link judgment or employee ranking."}</p>
    </details>
  </ResultPage>;
}
