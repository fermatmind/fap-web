import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { isNineStarReferenceValid, isNineStarYearConfigurationValid, type NineStarYearProfile, type NineStarYearQuestionnaire, type NineStarReference } from "@/lib/questionnaires/nineStarYear";

export function NineStarYearGuideBody({ profile, locale, headingLevel = 3, idPrefix = "nine-star-guide" }: {
  profile: NineStarYearProfile; locale: Locale; headingLevel?: 2 | 3 | 4; idPrefix?: string;
}) {
  const Heading = headingLevel === 2 ? "h2" : headingLevel === 4 ? "h4" : "h3";
  return <article data-nine-star-guide={profile.id} className="space-y-7 leading-8 [overflow-wrap:anywhere]">
    <p>{profile.summary[locale]}</p>
    <p className="rounded-lg bg-slate-50 p-4 text-sm leading-7">{profile.scoreReading[locale]}</p>
    {profile.sections.map(section => <section id={`${idPrefix}-${section.id}`} key={section.id} className="scroll-mt-24">
      <Heading className="mb-3 text-xl font-semibold">{section.title[locale]}</Heading>
      {section.paragraphs.map((paragraph, index) => <p className={index ? "mt-4" : undefined} key={index}>{paragraph[locale]}</p>)}
    </section>)}
  </article>;
}

export function NineStarYearAttribution({ quiz, locale }: { quiz: NineStarYearQuestionnaire; locale: Locale }) {
  return <aside data-nine-star-attribution className="my-6 rounded-lg border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-600">
    <p>{locale === "zh"
      ? "节年规则与1927／1928锚点参照园田真次郎编《改正方位明鉴》第4版（1934）；文化配属采用印刷页19的后天图，并参照《周易正义·说卦》的原文与疏文。立春界点取自日本国立天文台计算服务。日常例子和可选回想问题由费马原创。文化配属与可复算的历法不证明出生年份能够测量人格或预测未来。"
      : "The year rule and 1927/1928 anchors follow Sonoda’s Kaisei Hoi Meikan, fourth edition (1934). Cultural pairings use the Later Heaven diagram on printed page 19 and the text and commentary of Zhouyi Zhengyi, Shuo Gua. Beginning of Spring boundaries come from the National Astronomical Observatory of Japan calculation service. FermatMind wrote the everyday examples and optional reflection questions. Cultural correspondences and reproducible calendars do not establish that a birth year measures personality or predicts the future."}</p>
    <ul className="mt-3 space-y-2">{quiz.references.map(reference => <li key={reference.url}><a className="underline" href={reference.url} rel="noopener noreferrer">{reference.title[locale]}</a></li>)}</ul>
  </aside>;
}

export function NineStarYearReport({ quiz, result, locale }: { quiz: NineStarYearQuestionnaire; result: NineStarReference; locale: Locale }) {
  const zh = locale === "zh";
  if (!isNineStarYearConfigurationValid(quiz) || !isNineStarReferenceValid(result)) return <p role="status">{zh ? "这次节年参考暂不可用，请重新计算。" : "This year reference is unavailable. Calculate again."}</p>;
  const profiles = result.candidates.map(candidate => quiz.profiles.find(profile => profile.star === candidate.star));
  if (profiles.some(profile => !profile)) return <p role="status">{zh ? "文化指南暂不可用。" : "The cultural guide is unavailable."}</p>;
  return <div data-nine-star-result className="mt-6 space-y-8">
    <p className="rounded-lg bg-violet-50 p-4 leading-8" data-nine-star-certainty={result.certainty}>{result.certainty === "two-possibilities"
      ? (zh ? "时刻尚不确定：保留前后两个节年标签与两篇完整指南，不分配概率或强行选一。" : "Timing remains uncertain: retain both adjacent season labels and both full guides, without probabilities or a forced choice.")
      : (zh ? "这是按你明确选择的界点前后得到的单侧参考。若无法确定时刻，请改选“不确定”，保留两个可能结果。" : "This single reference is conditional on your explicit boundary-side selection. If you cannot locate the moment confidently, choose uncertain and keep both possibilities.")}</p>
    <p className="text-sm leading-7">{zh ? "所用立春界点" : "Beginning of Spring boundary used"}: <time data-nine-star-result-boundary dateTime={`${result.boundaryJst}+09:00`}>{result.boundaryJst.replace("T", " ")} JST (UTC+09:00)</time>. {zh ? "只显示到分钟，不是出生地的当地时间。" : "Shown to a minute; this is not the birth location’s local time."}</p>
    <div className="grid gap-5 sm:grid-cols-2">{result.candidates.map(candidate => {
      const profile = quiz.profiles.find(item => item.star === candidate.star)!;
      const difference = 1927 - candidate.seasonYear, remainder = ((difference % 9) + 9) % 9;
      return <section key={candidate.side} data-nine-star-candidate={candidate.side} className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 leading-8">
        <h3 className="text-xl font-semibold">{candidate.side === "before-boundary" ? (zh ? "立春界点之前" : "Before the boundary") : (zh ? "立春界点之后" : "After the boundary")}</h3>
        <p className="my-3">{zh ? "采用节年" : "Season year used"}: <span data-nine-star-season-year>{candidate.seasonYear}</span></p>
        <p className="my-3 text-xl font-semibold" data-nine-star-value={candidate.star}>{profile.title[locale]}</p>
        <p className="text-sm leading-7" data-nine-star-calculation><code className="[overflow-wrap:anywhere]">1927 − {candidate.seasonYear} = {difference}; mod 9 = {remainder}; {remainder} + 1 = {candidate.star}</code></p>
        <p className="mt-3 text-sm leading-7 text-slate-600">{zh ? "mod 9取0至8的非负余数。这个算式只为节年分配文化标签。" : "mod 9 uses the non-negative remainder from 0 to 8. This operation only assigns a cultural label to the season year."}</p>
      </section>;
    })}</div>
    {profiles.map(profile => profile && <section key={profile.id} className="rounded-lg border border-violet-200 bg-white p-5 sm:p-7" aria-labelledby={`nine-star-reading-${profile.id}`}>
      <h3 id={`nine-star-reading-${profile.id}`} className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h3>
      <NineStarYearGuideBody profile={profile} locale={locale} headingLevel={4} idPrefix={`nine-star-result-${profile.id}`} />
      <Link prefetch={false} className="mt-6 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这篇完整公开指南" : "Read this complete public guide"}</Link>
    </section>)}
    <NineStarYearAttribution quiz={quiz} locale={locale} />
  </div>;
}
