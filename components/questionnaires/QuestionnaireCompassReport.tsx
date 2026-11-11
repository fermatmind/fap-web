import { useQuestionnaireDisplayCopy } from "./TraditionalQuestionnaireCopy";
import Link from "next/link";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { CompassResult } from "@/lib/questionnaires/compass";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireCompassReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<CompassResult, { status: "complete" }>; locale: Locale }) {
  const { displayText, traditional } = useQuestionnaireDisplayCopy();
  const zh = locale === "zh", title = (id: string) => quiz.directions.find(d => d.id === id)!.title[locale];
  return <div className="my-6 space-y-8">
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
    <section className="min-w-0 rounded-xl border border-sky-200 bg-sky-50 p-4 sm:p-6" aria-label={zh ? displayText("本次四向选择次数") : "Four direction counts for this attempt"}>
      <h3 className="text-xl font-semibold">{zh ? displayText("四向共用36次选择") : "Four directions share thirty-six choices"}</h3>
      <dl className="mt-4 grid gap-2 sm:grid-cols-2">{quiz.directions.map(direction => <div key={direction.id} className="min-w-0 rounded-lg border border-sky-100 bg-white p-3" data-compass-count={direction.id}><dt className="text-sm leading-6">{direction.title[locale]}</dt><dd className="mt-1 text-xl font-semibold tabular-nums text-sky-950">{result.counts[direction.id]} / 36</dd></div>)}</dl>
      <p className="mt-4 text-sm leading-7">{zh ? displayText("四项合计36，分母是全卷选择次数；不是能力、相似度或人群排名。每个方向出现36次，在四个位置各9次。相差一次没有已验证的显著性或稳定类型含义。") : "The counts sum to thirty-six; the denominator is the total choice budget, not ability, similarity or population rank. Every direction appears thirty-six times and nine times in each position. One extra choice establishes no significant difference or stable type."}</p>
    </section>
    <section aria-label={zh ? displayText("最高方向与邻向的本次比较") : "Highest directions and their neighbour comparisons"} className="min-w-0 space-y-4 rounded-xl border border-sky-200 bg-white p-4 leading-7 sm:p-6">
      <h3 className="text-xl font-semibold">{zh ? displayText("全部最高方向都保留") : "Every highest direction remains"}</h3>
      <p>{zh ? displayText(`本次有${result.leaders.length}个最高方向。逐一比较各自的两个垂直邻向；邻向不一定是全局第二。名单顺序不定主副。`) : `This attempt has ${result.leaders.length} highest direction${result.leaders.length === 1 ? "" : "s"}. Each compares its two perpendicular neighbours; the neighbour need not be second overall. List order assigns no primary or secondary type.`}</p>
      <ul className="space-y-3">{result.leaders.map(id => <li key={id} data-compass-leader={id}>{title(id)}{zh ? displayText("：") : ": "}{result.neighbours[id] === null ? (zh ? displayText("两邻向同分，使用基础读法；没有明确邻向，不是纯人格。") : "The two neighbours are equal. Use the base guide with no distinguished neighbour, not a pure personality.") : (zh ? displayText(`垂直邻向中${title(result.neighbours[id]!)}次数较多，使用对应有序读法。`) : `${title(result.neighbours[id]!)} has the greater count among the perpendicular neighbours, giving the corresponding ordered guide.`)}</li>)}</ul>
      <ul className="space-y-1">{result.compassProfileIds.map(id => <li key={id}><a className="inline-block min-h-11 py-2 font-medium underline" href={`#compass-title-${id}`}>{quiz.profiles.find(profile => profile.id === id)!.title[locale]}</a></li>)}</ul>
    </section>
    </div>
    {result.compassProfileIds.map(id => {
      const profile = quiz.profiles.find(p => p.id === id)!;
      return <section key={id} aria-labelledby={`compass-title-${id}`} data-compass-match={id} className="rounded-lg border border-slate-200 p-4 sm:p-6">
        <h3 id={`compass-title-${id}`} className="scroll-mt-24 mb-5 text-xl font-semibold leading-snug sm:text-2xl">{profile.title[locale]}</h3>
        <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} traditional={traditional} headingLevel={4} idPrefix={`report-${id}`} mode="result" previewSectionIds={["meaning", "example", "observation"]} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(traditional ? "zh-TW" : locale, quiz.slug, id)} target="_blank" rel="noopener">{zh ? displayText("阅读这项结果的公开说明（新标签页）") : "Read this result’s public guide (new tab)"}</Link>
      </section>;
    })}
  </div>;
}
