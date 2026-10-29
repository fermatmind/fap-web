import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { ArchetypeResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function ConnectionIdealsReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<ArchetypeResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh", matched = quiz.profiles.filter(p => result.profileIds.includes(p.id));
  return <div className="my-6 space-y-8">
    <section className="space-y-4 rounded-lg bg-slate-50 p-4" aria-labelledby="ci-counts-title">
      <h3 id="ci-counts-title" className="text-xl font-semibold">{zh ? "六种连接偏好的原始选择次数" : "Raw choices across six connection ideals"}</h3>
      <p className="leading-8">{zh ? "十二次比较已完成。每主题出现八次、每个选项位置各两次；选中一次记一次。当题未出现不扣分，次数不是伴侣匹配百分比、命定证明、关系质量或人格评分。" : "All twelve comparisons are complete. Each theme appeared eight times and twice in each position. One selected description adds one count; absence from an item subtracts nothing. Counts are not partner-match percentages, proof of destiny, relationship quality or personality scores."}</p>
      <dl className="space-y-4">{quiz.directions.map(direction => <div key={direction.id} data-ci-theme={direction.id} className="space-y-2">
        <dt className="font-semibold leading-7">{direction.title[locale]}</dt><dd data-ci-count>{result.counts[direction.id]} / 8</dd>
      </div>)}</dl>
      <p data-ci-selection-total className="text-sm leading-7">{zh ? "六项次数相加为12，表示12次选择；不合成人格总分，不强派副型。" : "The six tallies sum to 12 selections. There is no personality total or forced secondary type."}</p>
      {matched.length > 1 && <p data-ci-tied className="leading-8">{zh ? `${matched.length}个主题最高并列，下面每篇都全文保留；没有隐藏的唯一赢家。` : `${matched.length} themes share the highest count. Every complete guide remains below; no hidden rule chooses a sole winner.`}</p>}
      <p className="text-sm leading-7">{zh ? "这些是当前文字对照里的相对选择，不评估他人，也不决定现实关系。次数接近没有经过验证的近分阈值；其他公开全文也可以继续比较。" : "These are relative choices among the written alternatives, without assessing another person or deciding a real relationship. Nearby counts have no validated close-score threshold. You can also compare every other public full guide."}</p>
    </section>
    <p className="leading-8">{zh ? "每个最高并列的八节全文都已开放；想象偏好不能代替真实意愿与行为。" : "Every highest-count eight-section guide is open. Imagined preferences do not replace actual wishes and conduct."}</p>
    {matched.map(profile => <section key={profile.id} data-ci-profile={profile.id} aria-labelledby={`ci-title-${profile.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
      <h3 id={`ci-title-${profile.id}`} className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h3>
      <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这一连接主题的公开指南" : "Read this connection theme’s public guide"}</Link>
    </section>)}
  </div>;
}
