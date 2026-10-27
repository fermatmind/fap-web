import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireJealousyReport({ quiz, result, locale }: {
  quiz: Questionnaire;
  result: Extract<FacetResult, { status: "complete" }>;
  locale: Locale;
}) {
  const zh = locale === "zh";
  return <div className="my-6 space-y-8" data-jealousy-reflection-result>
    <p className="leading-8">{zh
      ? "三组分别描述思维频率、不适强度与行动频率，端点不同，不跨组排名或合成嫉妒总分，不选主导型或临床档位。相近与相同数值保留，不推断伴侣想法或事件真相。"
      : "The three groups separately describe thought frequency, discomfort intensity and action frequency. Their different anchors are not ranked or combined into a jealousy total, dominant type or clinical band. Close and equal numbers remain visible without establishing a partner’s thoughts or the truth of an event."}</p>
    {quiz.directions.map(direction => {
      const scoreLabel = direction.id === "discomfort" ? (zh ? "回想不适强度均分" : "Recalled discomfort-intensity mean") : (zh ? "回想频率均分" : "Recalled frequency mean");
      const score = result.facets[direction.id], profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
      return <section key={direction.id} className="rounded-lg border border-slate-200 p-4 sm:p-6"
        data-jealousy-reflection-part={direction.id} aria-labelledby={`jealousy-reflection-${direction.id}`}>
        <h3 id={`jealousy-reflection-${direction.id}`} className="text-xl font-semibold">{direction.title[locale]}</h3>
        <p data-jealousy-reflection-score={direction.id} className="my-4 rounded-lg bg-slate-50 p-4 font-semibold">{score.mean === null
          ? (zh ? `资料不足：${score.rated}/6题有数值回答；需要六题完整，不计算本组均分。` : `Insufficient information: ${score.rated}/6 items rated; all six are needed. No mean is calculated for this group.`)
          : (zh ? `${scoreLabel}：${score.mean.toFixed(1)} / 5（6/6题有效）` : `${scoreLabel}: ${score.mean.toFixed(1)} / 5 (6/6 items rated)`)}</p>
        {score.mean === null && <p className="mb-4 text-sm leading-7 text-slate-600">{zh
          ? "没有相关经历、无法判断或不愿回答都保留为不计分，不变成从未或没有不适。以下是完整通用读法，不是本次个人结论。"
          : "No relevant experience, uncertainty or a choice not to answer remains unscored, rather than becoming never or no discomfort. The full guide below is general information rather than a personal conclusion."}</p>}
        <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`jealousy-reflection-report-${direction.id}`} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline"
          href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读本组的完整公开指南" : "Read this group’s full public guide"}</Link>
      </section>;
    })}
    <p className="leading-8">{zh
      ? "本版是费马原创反思，不是MJS原版或经验证短版，没有本地常模、跨语言等价性或关系预测证据。无需联系、调查、查看私密材料或寻求安慰来完成；下一步由你选择。"
      : "This is a FermatMind original reflection, not the original MJS or a validated short form. It has no local norms, established language equivalence or relationship-prediction evidence. No contact, investigation, private-material check or reassurance seeking is required; what comes next is your choice."}</p>
  </div>;
}
