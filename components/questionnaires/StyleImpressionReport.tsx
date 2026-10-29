import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { ArchetypeResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function StyleImpressionReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<ArchetypeResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh", matched = quiz.profiles.filter(p => result.profileIds.includes(p.id));
  return <div className="my-6 space-y-8">
    <section className="space-y-4 rounded-lg bg-slate-50 p-4" aria-labelledby="sip-counts-title">
      <h3 id="sip-counts-title" className="text-xl font-semibold">{zh ? "八种造型氛围的原始选择次数" : "Raw choices across eight whole-look themes"}</h3>
      <p className="leading-8">{zh ? "十六次比较已完成。每主题出现八次、每个选项位置各两次；选中一次记一次。当题未出现不扣分，次数不是匹配百分比、面部类型、外貌评价或人格评分。" : "All sixteen comparisons are complete. Each theme appeared eight times and twice in each position. One selected description adds one count; absence from an item subtracts nothing. Counts are not a match percentage, face type, appearance rating or personality score."}</p>
      <dl className="space-y-4">{quiz.directions.map(direction => <div key={direction.id} data-sip-theme={direction.id} className="space-y-2">
        <dt className="font-semibold leading-7">{direction.title[locale]}</dt><dd data-sip-count>{result.counts[direction.id]} / 8</dd>
      </div>)}</dl>
      <p data-sip-selection-total className="text-sm leading-7">{zh ? "八项次数相加为16，表示16次选择；不合成人格总分，不强派副型。" : "The eight tallies sum to 16 selections, not a personality total. No secondary type is imposed."}</p>
      {matched.length > 1 && <p data-sip-tied className="leading-8">{zh ? `${matched.length}个主题最高并列，下面每篇都全文保留；没有隐藏的唯一赢家。` : `${matched.length} themes share the highest count. Every complete guide remains below; no hidden rule chooses a sole winner.`}</p>}
      <p className="text-sm leading-7">{zh ? "这些是当前文字对照里的相对选择，不证明某套衣服合适，也不决定别人怎样看你。次数接近没有经过验证的近分阈值；其他公开全文也可以继续比较。" : "These are relative choices among the written alternatives, without establishing actual fit or how anyone sees you. Nearby counts have no validated close-score threshold. You can also compare every other public full guide."}</p>
    </section>
    <p className="leading-8">{zh ? "每个最高并列的八节全文都已开放，实际合身与舒适仍需自己判断。" : "Every highest-count eight-section guide is open. Actual fit and comfort need your own judgement."}</p>
    {matched.map(profile => <section key={profile.id} data-sip-profile={profile.id} aria-labelledby={`sip-title-${profile.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
      <h3 id={`sip-title-${profile.id}`} className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h3>
      <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这一造型主题的公开指南" : "Read this style theme’s public guide"}</Link>
    </section>)}
  </div>;
}
