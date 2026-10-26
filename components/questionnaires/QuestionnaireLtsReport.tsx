import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireLtsReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh", valid = quiz.directions.filter(d => result.facets[d.id].mean !== null).length;
  const total = quiz.directions.every(d => result.facets[d.id].rated === 4) ? quiz.directions.reduce((sum, d) => sum + result.facets[d.id].sum, 0) : null;
  const missing = zh ? "资料不足" : "Insufficient information";
  return <div className="my-6 space-y-8">
    <section className="space-y-4 rounded-lg bg-slate-50 p-4" aria-labelledby="lts-overall-title">
      <h3 id="lts-overall-title" className="text-xl font-semibold">{zh ? "先读整体LTS原始分数" : "Read the overall LTS raw score first"}</h3>
      <dl className="space-y-3"><div className="flex flex-wrap justify-between gap-3"><dt>{zh ? "整体原始总分（12—60）" : "Overall raw total (12–60)"}</dt><dd data-lts-total>{total === null ? missing : total}</dd></div><div className="flex flex-wrap justify-between gap-3"><dt>{zh ? "整体均分（1—5）" : "Overall mean (1–5)"}</dt><dd data-lts-overall-mean>{total === null ? missing : (total / 12).toFixed(2)}</dd></div></dl>
      {total === null && <p data-lts-overall-insufficient className="leading-8">{zh ? "整体需要十二条全部有效评分；暂不作答不补零、中点或由其他条目推算。已完整的四条侧面仍可描述性阅读，三份全文都保留。" : "An overall score requires all twelve ratings. Unscored responses are never filled with zero, a midpoint or estimates from other items. Fully rated four-item facets remain descriptive, and all three full guides stay available."}</p>}
      <p className="text-sm leading-7">{zh ? "英文十二条按发表Table 3保留，1非常不同意至5非常同意，所有条目同向计分。原句里的不或很少不是反向键。整体由未舍入的十二条原始和计算，不平均已舍入的侧面均分；显示小数不提供测量精度。原作者建议优先关注总分，三个侧面保持描述性，不派唯一类型。原研究不验证本站中文试译、NA规则或解释。" : "Twelve English items preserve published Table 3 wording and use 1 Strongly disagree to 5 Strongly agree with the same key direction. Not or rarely does not mean reverse-keyed. Compute the overall result from unrounded item sums rather than rounded facet means; displayed decimals imply no measurement precision. The authors recommend focusing on the total, with descriptive facets rather than a sole type. Original research validates neither this Chinese trial, NA convention nor website interpretation."}</p>
    </section>
    <section className="space-y-4 rounded-lg bg-slate-50 p-4" aria-labelledby="lts-facets-title">
      <h3 id="lts-facets-title" className="text-xl font-semibold">{zh ? "三个侧面的原始自报阅读" : "Three descriptive self-report facets"}</h3>
      <p className="leading-8">{zh ? `三个侧面中，${valid}个有完整四条资料。原始和范围4—20，均分范围1—5；缺一条就保留该侧面不足。它们不是好坏、信任资格、职业或临床结论，也不相互补分。` : `${valid} of three facets have all four ratings. Raw sums range from 4–20 and means from 1–5. One unscored item retains an insufficient facet. They establish no goodness, trustworthiness, career or clinical verdict and cannot supply one another’s missing responses.`}</p>
      <dl className="space-y-5">{quiz.directions.map(direction => {
        const facet = result.facets[direction.id], rated = facet.mean !== null;
        return <div key={direction.id} data-lts-facet={direction.id} className="flex flex-wrap justify-between gap-3"><dt className="font-medium">{direction.title[locale]}</dt><dd><span className="block">{zh ? "原始和：" : "Raw sum: "}<span data-lts-sum>{rated ? facet.sum : missing}</span></span><span className="block">{zh ? "均分：" : "Mean: "}<span data-lts-mean>{rated ? `${(facet.sum / facet.rated).toFixed(2)} / 5` : missing}</span></span><span className="block text-sm text-slate-600">{zh ? `${facet.rated} / 4条有效同意程度评分` : `${facet.rated} / 4 rated agreement items`}</span></dd></div>;
      })}</dl>
      {valid === 0 && <p data-lts-insufficient className="leading-8">{zh ? "本次作答已结束，没有生成整体或侧面个人分数。可以重测，下面三份完整公开说明仍可阅读。" : "This attempt is finished without personal overall or facet scores. You can retake it; all three full public guides remain available below."}</p>}
      <p className="text-sm leading-7">{zh ? "三份说明一起呈现，不按最高、并列顺序或目录位置派人格。整体LTS不直接反向等于黑暗三联征，本版未测黑暗特质，不做100%减光明或光暗比例。均分3仅是回答中点，不是最理想或人群平均。高分不认证安全、善良或诚实，低分不证明邪恶；原题宽恕不要求原谅、和解、恢复接触或放弃边界。" : "All three guides appear together without a highest-score, tie-order or list-position personality. LTS is not a direct inverse of the Dark Triad, which was not measured here: no complementary percentage or light/dark ratio is computed. Three is only a response midpoint, not an ideal or population average. Higher scores certify no safety, goodness or honesty and lower scores establish no evil. Forgiveness items require no forgiveness, reconciliation, renewed contact or abandoned boundary."}</p>
    </section>
    {quiz.profiles.map(profile => <section key={profile.id} data-lts-profile={profile.id} aria-labelledby={`lts-title-${profile.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
      <h3 id={`lts-title-${profile.id}`} className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h3>
      <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这一侧面的公开说明" : "Read this facet’s public guide"}</Link>
    </section>)}
  </div>;
}
