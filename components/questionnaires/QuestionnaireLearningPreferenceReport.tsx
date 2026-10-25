import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireLearningPreferenceReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh", valid = Object.values(result.facets).filter(f => f.mean !== null).length;
  return <div className="my-6 space-y-8">
    <section className="space-y-4 rounded-lg bg-slate-50 p-4" aria-labelledby="learning-preferences-title">
      <h3 id="learning-preferences-title" className="text-xl font-semibold">{zh ? "四项当前使用意愿，不是学习效果" : "Four current format preferences, not learning effectiveness"}</h3>
      <p className="leading-8">{zh ? `四部分中，${valid}个有足够资料显示均分。每部分5条至少3条有效，按1完全不想用至5很想用取一位小数均分。没有反向条目，NA排除不补零；最低条数只是本站完整度规则。` : `${valid} of four parts have enough information for a one-decimal mean. Each five-item part needs three ratings from 1 Not at all to 5 Very much wanting to use the format. There are no reverse items; NA is excluded without zero-filling. The minimum is a website completeness rule.`}</p>
      <dl className="space-y-5">{quiz.directions.map(direction => {
        const facet = result.facets[direction.id];
        return <div key={direction.id} data-learning-facet={direction.id} className="flex flex-wrap justify-between gap-3"><dt className="font-medium">{direction.title[locale]}</dt><dd><span data-learning-mean>{facet.mean === null ? (zh ? "资料不足" : "Insufficient information") : `${facet.mean.toFixed(1)} / 5`}</span><span className="block text-sm text-slate-600">{zh ? `${facet.rated} / 5条有效意愿评分` : `${facet.rated} / 5 rated items`}</span></dd></div>;
      })}</dl>
      {valid === 0 && <p className="leading-8" data-learning-insufficient>{zh ? "本次作答已结束，四部分均未生成个人均分。可以重新测试，下面四份完整公开说明仍可阅读。" : "This attempt is finished without personal means for any part. You can retake it; all four full public guides remain available below."}</p>}
      <p className="text-sm leading-7">{zh ? "均分描述本次想采用的形式，不测实际理解、记忆、速度、成绩或能力。没有总分、主导脑类型、最高项派型或占比；四项可以同时较高或较低。相同均分保留，小数差异不证明显著、效果或改变，不保证按偏好匹配教学更有效。" : "Means describe formats wanted in this attempt, not actual comprehension, memory, speed, grades or ability. There is no total, dominant brain type, highest-score assignment or percentage; all four can be higher or lower together. Equal means remain equal, and decimals establish neither significance, effectiveness nor change. Matched instruction is not promised to improve learning."}</p>
    </section>
    <p className="leading-8">{zh ? "全部四份完整说明保留高低与混合读法、同一内容的不同呈现、对话、比较、反例与可选小观察。材料、任务与可访问需要仍要分别核对；不能访问不代表不喜欢，均分或资料不足都不隐藏正文，也不决定课程、职业、固定分班或无障碍安排。" : "All four full guides retain higher, lower and mixed readings, alternative presentations of one topic, dialogue, comparisons, counterexamples and optional observations. Material, task and access needs still matter. Inaccessibility is not dislike. Means or insufficient information never hide the body or determine courses, careers, fixed groups or accommodations."}</p>
    {quiz.profiles.map(profile => <section key={profile.id} data-learning-profile={profile.id} aria-labelledby={`learning-title-${profile.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
      <h3 id={`learning-title-${profile.id}`} className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h3>
      <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这一部分的公开说明" : "Read this part’s public guide"}</Link>
    </section>)}
  </div>;
}
