import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { ArchetypeResult } from "@/lib/questionnaires/scoring";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireArchetypeReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<ArchetypeResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh";
  return <div className="my-6 space-y-8">
    <section className="rounded-lg bg-slate-50 p-4" aria-label={zh ? "本次选择次数" : "Choice counts for this attempt"}>
      <h3 className="text-xl font-semibold">{zh ? "全部结果的本次计数" : "Your counts for every result"}</h3>
      <dl className="mt-4 space-y-3">{quiz.directions.map(direction => <div key={direction.id} className="flex justify-between gap-4" data-archetype-count={direction.id}><dt>{direction.title[locale]}</dt><dd>{result.counts[direction.id]} / {direction.comparisons}</dd></div>)}</dl>
      <p className="mt-4 text-sm leading-7">{zh ? "分母是这一类选项出现的次数，不是相似度百分比。所有最高计数都保留；差1次不代表已经验证的显著差异、固定主次型或人群排名。" : "The denominator is how often that result’s options appeared, not a match percentage. Every highest count is kept. One extra choice is not an established significant difference, a fixed primary or secondary type, or a population rank."}</p>
    </section>
    <p className="leading-8">{zh ? `本次有${result.profileIds.length}个最高计数匹配。下面逐份呈现完整说明；名单顺序不决定谁更重要。` : `This attempt has ${result.profileIds.length} highest-count match${result.profileIds.length === 1 ? "" : "es"}. Each complete explanation follows; list order does not make one more important.`}</p>
    {result.profileIds.map(id => {
      const profile = quiz.profiles.find(p => p.id === id)!;
      return <section key={id} aria-labelledby={`animal-title-${id}`} data-archetype-match={id} className="rounded-lg border border-slate-200 p-4 sm:p-6">
        <h3 id={`animal-title-${id}`} className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h3>
        <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${id}`} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, id)}>{zh ? "阅读这项结果的公开说明" : "Read this result’s public guide"}</Link>
      </section>;
    })}
  </div>;
}
