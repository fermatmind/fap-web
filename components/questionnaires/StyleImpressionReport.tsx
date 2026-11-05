import Link from "next/link";
import { QuestionnairePaletteSwatches } from "./QuestionnairePaletteSwatches";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { ArchetypeResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function StyleImpressionReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<ArchetypeResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh", matched = quiz.profiles.filter(p => result.profileIds.includes(p.id));
  const featured = matched.length === 1 ? matched[0] : undefined;
  return <div className="my-6 space-y-8">
    {featured && <section className="grid gap-4 rounded-xl border border-fuchsia-200 bg-fuchsia-50/70 p-4 sm:p-6 md:grid-cols-2" aria-labelledby="sip-featured-title">
      <div>
        <p className="text-sm font-semibold text-fuchsia-900">{zh ? "这次最常选择的造型主题" : "The look you chose most often"}</p>
        <h3 id="sip-featured-title" className="mt-2 text-2xl font-semibold">{featured.title[locale]}</h3>
        <p className="mt-2 leading-7">{featured.headline[locale]}</p>
        <a className="mt-2 inline-flex min-h-11 items-center underline" href={`#sip-title-${featured.id}`}>{zh ? "看这套造型的搭配例子" : "See styling examples for this look"}</a>
      </div>
      {featured.paletteSwatches && <div className="min-w-0 rounded-lg bg-white p-3">
        <p className="text-sm font-semibold">{zh ? "这个主题的示例配色" : "Example colors for this look"}</p>
        <QuestionnairePaletteSwatches swatches={featured.paletteSwatches} locale={locale} />
      </div>}
    </section>}
    <section className="space-y-4 rounded-xl border border-fuchsia-200 bg-fuchsia-50/70 p-4 sm:p-6" aria-labelledby="sip-counts-title">
      <h3 id="sip-counts-title" className="text-xl font-semibold">{zh ? "八种造型氛围的原始选择次数" : "Raw choices across eight whole-look themes"}</h3>
      <p className="text-sm leading-7 text-slate-700">{zh ? "选择一个造型主题，从这次对照读到配色、轮廓和细节的例子。" : "Choose a styling theme to go from these comparisons to examples of color, outline and detail."}</p>
      <dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{quiz.directions.map(direction => {
        const profile = quiz.profiles.find(item => item.directionIds.includes(direction.id));
        return <div key={direction.id} data-sip-theme={direction.id} className="min-w-0 rounded-lg border border-fuchsia-100 bg-white px-3 pb-3">
          <dt className="font-semibold leading-7">{profile && (matched.includes(profile) ? <a className="inline-flex min-h-11 items-center py-2 underline" href={`#sip-title-${profile.id}`}>{direction.title[locale]}</a>
            : <Link prefetch={false} className="inline-flex min-h-11 items-center py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{direction.title[locale]}</Link>) || direction.title[locale]}</dt>
          <dd className="tabular-nums" data-sip-count>{result.counts[direction.id]} / 8</dd>
        </div>;
      })}</dl>
      <p className="leading-8">{zh ? "十六次比较已完成。每主题出现八次、每个选项位置各两次；选中一次记一次。当题未出现不扣分，次数不是匹配百分比、面部类型、外貌评价或人格评分。" : "All sixteen comparisons are complete. Each theme appeared eight times and twice in each position. One selected description adds one count; absence from an item subtracts nothing. Counts are not a match percentage, face type, appearance rating or personality score."}</p>
      <p data-sip-selection-total className="text-sm leading-7">{zh ? "八项次数相加为16，表示16次选择；不合成人格总分，不强派副型。" : "The eight tallies sum to 16 selections, not a personality total. No secondary type is imposed."}</p>
      {matched.length > 1 && <p data-sip-tied className="leading-8">{zh ? `${matched.length}个主题最高并列，下面每篇都全文保留；没有隐藏的唯一赢家。` : `${matched.length} themes share the highest count. Every complete guide remains below; no hidden rule chooses a sole winner.`}</p>}
      <p className="text-sm leading-7">{zh ? "这些是当前文字对照里的相对选择，不证明某套衣服合适，也不决定别人怎样看你。次数接近没有经过验证的近分阈值；其他公开全文也可以继续比较。" : "These are relative choices among the written alternatives, without establishing actual fit or how anyone sees you. Nearby counts have no validated close-score threshold. You can also compare every other public full guide."}</p>
    </section>
    <p className="leading-8">{zh ? "每个最高并列的八节全文都已开放，实际合身与舒适仍需自己判断。" : "Every highest-count eight-section guide is open. Actual fit and comfort need your own judgement."}</p>
    {matched.map(profile => <section key={profile.id} data-sip-profile={profile.id} aria-labelledby={`sip-title-${profile.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
      <h3 id={`sip-title-${profile.id}`} className="scroll-mt-24 mb-5 text-xl font-semibold leading-snug sm:text-2xl">{profile.title[locale]}</h3>
      <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} mode="result" previewSectionIds={["reading-4", "reading-6"]} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这一造型主题的公开指南" : "Read this style theme’s public guide"}</Link>
    </section>)}
  </div>;
}
