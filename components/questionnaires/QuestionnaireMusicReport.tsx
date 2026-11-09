import { PortraitFacetLead } from "./PortraitFacetLead";
import Link from "next/link";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireMusicReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh", valid = Object.values(result.facets).filter(f => f.mean !== null).length;
  return <div className="my-6 space-y-8">
    <PortraitFacetLead quiz={quiz} result={result} locale={locale} anchorPrefix="music-title-" />

    {quiz.profiles.map(profile => <section key={profile.id} data-music-profile={profile.id} aria-labelledby={`music-title-${profile.id}`} className="rounded-lg border border-slate-200 p-4 sm:p-6">
      <h3 id={`music-title-${profile.id}`} className="scroll-mt-24 mb-5 text-xl font-semibold leading-snug sm:text-2xl">{profile.title[locale]}</h3>
      {(() => { const facet = result.facets[profile.directionIds[0]], mean = facet.mean; return <p className="mb-5 text-lg font-semibold tabular-nums">{zh ? "本次均分：" : "Your mean: "}{mean === null ? (zh ? "资料不足" : "Insufficient information") : `${mean.toFixed(1)} / 5`}</p>; })()}

      <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} mode="result" previewSectionIds={["meaning", "context", "experiment"]} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)} target="_blank" rel="noopener">{zh ? "阅读这类声音的公开说明（新标签页）" : "Read this sound family’s public guide (new tab)"}</Link>
    </section>)}

    <details className="border-t border-slate-200 pt-4" data-result-reading-method>
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? "全部读数、计分与使用说明" : "All readings, scoring and use notes"}</summary>
      <section className="space-y-4 rounded-lg bg-slate-50 p-4" aria-labelledby="music-ratings-title">
      <h3 id="music-ratings-title" className="text-xl font-semibold">{zh ? "八类声音偏好分别阅读，不派主类型" : "Read eight sound preferences separately, without a primary type"}</h3>
      <p className="leading-8">{zh ? `八部分中，${valid}个有足够资料显示均分。每项3题至少2条有效评分，按1很不喜欢至5很喜欢取一位小数均分；NA不补零或中性。` : `${valid} of eight parts have enough information for a mean. Each three-item part needs two ratings, from 1 Strongly dislike to 5 Strongly like, rounded to one decimal. NA is neither zero nor neutrality.`}</p>
      <dl className="space-y-5">{quiz.directions.map(direction => {
        const facet = result.facets[direction.id];
        return <div key={direction.id} data-music-facet={direction.id} className="grid grid-cols-1 gap-2 border-b border-slate-200 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(7rem,auto)] sm:gap-4 [&>dd]:font-semibold [&>dd]:tabular-nums"><dt className="font-medium">{quiz.profiles.some(profile => profile.directionIds.includes(direction.id)) ? <a className="inline-flex min-h-11 items-center py-2 underline decoration-slate-300 underline-offset-4" href={`#music-title-${quiz.profiles.find(profile => profile.directionIds.includes(direction.id))!.id}`}>{direction.title[locale]}</a> : direction.title[locale]}</dt><dd><span data-music-mean>{facet.mean === null ? (zh ? "资料不足" : "Insufficient information") : `${facet.mean.toFixed(1)} / 5`}</span><span className="block text-sm text-slate-600">{zh ? `${facet.rated} / 3条有效评分` : `${facet.rated} / 3 rated items`}</span></dd></div>;
      })}</dl>
      {valid === 0 && <p className="leading-8" data-music-insufficient>{zh ? "本次作答已结束，八部分均未生成个人均分。可以重新测试，下方八份完整公开说明仍可阅读。" : "This attempt is finished without personal means for any part. You can retake it; all eight full public guides remain available below."}</p>}
      <p className="text-sm leading-7">{zh ? "均分只概括你对选定文字声音描述的喜欢程度，不是听歌频率、品味质量、知识、智力、阶层或能力。八类可以重叠，不按最高值派人格，不合成总分、比例或常模；小数差异不等于统计显著。未覆盖的音乐不自动算低分。" : "Means summarise liking for selected word-described sounds, not listening frequency, taste quality, knowledge, intelligence, status or ability. Families can overlap without a highest-score personality, total, proportion or norm. Decimal differences establish no statistical significance; uncovered music is not automatically a low score."}</p>
    </section>
      <p className="leading-8">{zh ? "以下八份完整说明都保留具体声音线索、内部差异、场景、取舍、相近比较、反例和可选聆听小尝试。均分或资料不足均不隐藏正文。想配合心情、细听、共同选歌、发现新声音或回到熟悉作品，要按实际场景另外选择，不由曲风推定能力或健康效果。" : "All eight full guides retain sound cues, variation, contexts, tradeoffs, comparisons, counterexamples and optional listening experiments. Means or insufficient information never hide the text. Choosing for a mood, listening closely, making a shared choice, discovering sounds or returning to familiar music depends on the actual context; genres establish neither abilities nor health effects."}</p>
    </details>
  </div>;
}
