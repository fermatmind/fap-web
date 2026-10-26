import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { CompassResult } from "@/lib/questionnaires/compass";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireCompassReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<CompassResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh", title = (id: string) => quiz.directions.find(d => d.id === id)!.title[locale];
  return <div className="my-6 space-y-8">
    <section className="rounded-lg bg-slate-50 p-4" aria-label={zh ? "本次四向选择次数" : "Four direction counts for this attempt"}>
      <h3 className="text-xl font-semibold">{zh ? "四向共用36次选择" : "Four directions share thirty-six choices"}</h3>
      <dl className="mt-4 space-y-3">{quiz.directions.map(direction => <div key={direction.id} className="flex justify-between gap-4" data-compass-count={direction.id}><dt>{direction.title[locale]}</dt><dd>{result.counts[direction.id]} / 36</dd></div>)}</dl>
      <p className="mt-4 text-sm leading-7">{zh ? "四项合计36，分母是全卷选择次数；不是能力、相似度或人群排名。每个方向出现36次，在四个位置各9次。相差一次没有已验证的显著性或稳定类型含义。" : "The counts sum to thirty-six; the denominator is the total choice budget, not ability, similarity or population rank. Every direction appears thirty-six times and nine times in each position. One extra choice establishes no significant difference or stable type."}</p>
    </section>
    <section aria-label={zh ? "最高方向与邻向的本次比较" : "Highest directions and their neighbour comparisons"} className="space-y-4 leading-8">
      <h3 className="text-xl font-semibold">{zh ? "全部最高方向都保留" : "Every highest direction remains"}</h3>
      <p>{zh ? `本次有${result.leaders.length}个最高方向。逐一比较各自的两个垂直邻向；邻向不一定是全局第二。名单顺序不定主副。` : `This attempt has ${result.leaders.length} highest direction${result.leaders.length === 1 ? "" : "s"}. Each compares its two perpendicular neighbours; the neighbour need not be second overall. List order assigns no primary or secondary type.`}</p>
      <ul className="space-y-3">{result.leaders.map(id => <li key={id} data-compass-leader={id}>{title(id)}{zh ? "：" : ": "}{result.neighbours[id] === null ? (zh ? "两邻向同分，使用基础读法；没有明确邻向，不是纯人格。" : "The two neighbours are equal. Use the base guide with no distinguished neighbour, not a pure personality.") : (zh ? `垂直邻向中${title(result.neighbours[id]!)}次数较多，使用对应有序读法。` : `${title(result.neighbours[id]!)} has the greater count among the perpendicular neighbours, giving the corresponding ordered guide.`)}</li>)}</ul>
    </section>
    {result.compassProfileIds.map(id => {
      const profile = quiz.profiles.find(p => p.id === id)!;
      return <section key={id} aria-labelledby={`compass-title-${id}`} data-compass-match={id} className="rounded-lg border border-slate-200 p-4 sm:p-6">
        <h3 id={`compass-title-${id}`} className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h3>
        <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${id}`} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, id)}>{zh ? "阅读这项结果的公开说明" : "Read this result’s public guide"}</Link>
      </section>;
    })}
  </div>;
}
