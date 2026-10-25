import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { AlignmentResult } from "@/lib/questionnaires/alignment";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireAlignmentReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<AlignmentResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh";
  const columns = [{ id: "lawful", label: zh ? "守序" : "Lawful" }, { id: "order-neutral", label: zh ? "中立" : "Neutral" }, { id: "chaotic", label: zh ? "混乱" : "Chaotic" }];
  const rows = [{ id: "good", label: zh ? "善良" : "Good" }, { id: "moral-neutral", label: zh ? "中立" : "Neutral" }, { id: "evil", label: zh ? "邪恶" : "Evil" }];
  return <div className="my-6 space-y-8">
    <section className="rounded-lg bg-slate-50 p-4" aria-label={zh ? "本次两轴原始计数" : "Raw counts on both axes"}>
      <h3 className="text-xl font-semibold">{zh ? "两条轴分别看，不合并总分" : "Two separate axes, without a total"}</h3>
      <dl className="mt-4 space-y-3">{quiz.directions.map(d => <div key={d.id} className="flex justify-between gap-4" data-alignment-count={d.id}><dt>{d.title[locale]}</dt><dd>{result.counts[d.id]} / 12</dd></div>)}</dl>
      <p className="mt-4 text-sm leading-7">{zh ? "守序／混乱共12次选择，善良／邪恶另计12次。次数不是道德品质分数、百分比或人群排名。本版以守序端与善良端定位：0—3低端，4低端与中立，5—7中立，8中立与高端，9—12高端；低端为混乱／邪恶，高端为守序／善良。这是原创显示约定，不是官方阈值或统计置信区间。" : "Lawful/Chaotic share twelve choices; Good/Evil have twelve separate choices. These are not moral-quality scores, percentages or population ranks. Each Lawful or Good count locates a band: 0–3 low; 4 low and neutral; 5–7 neutral; 8 neutral and high; 9–12 high. Low is Chaotic/Evil; high is Lawful/Good. These original display conventions are neither official cutoffs nor statistical confidence intervals."}</p>
    </section>
    <table className="w-full table-fixed border-collapse text-sm leading-6 [overflow-wrap:anywhere]">
      <caption className="mb-4 text-left text-lg font-semibold">{zh ? "阵营九宫格：标记本次所有匹配" : "Nine-alignment grid: every match marked"}</caption>
      <thead><tr><td className="w-14" /><th scope="col" className="p-2">{columns[0].label}</th><th scope="col" className="p-2">{columns[1].label}</th><th scope="col" className="p-2">{columns[2].label}</th></tr></thead>
      <tbody>{rows.map(row => <tr key={row.id}><th scope="row" className="p-2">{row.label}</th>{columns.map(column => {
        const profile = quiz.profiles.find(p => p.directionIds.includes(row.id) && p.directionIds.includes(column.id))!;
        const matched = result.alignmentIds.includes(profile.id);
        return <td key={column.id} className={`border border-slate-300 p-2 align-top ${matched ? "bg-violet-50" : ""}`} data-alignment-cell={profile.id}>
          <Link prefetch={false} href={questionnaireGuidePath(locale, quiz.slug, profile.id)} className="inline-block min-h-11 py-2 underline">{profile.title[locale]}</Link>
          {matched && <p className="font-semibold text-violet-900">{zh ? "本次匹配" : "Matched here"}</p>}
        </td>;
      })}</tr>)}</tbody>
    </table>
    <p className="leading-8">{zh ? `本次保留${result.alignmentIds.length}项匹配，下面逐份呈现完整报告。九宫格是角色框架，不能据此判断现实品格、心理健康或危险性；本题本不评估暴力。合理自我照顾与拒绝请求不自动计成邪恶。` : `This attempt keeps ${result.alignmentIds.length} match${result.alignmentIds.length === 1 ? "" : "es"}; every full report follows. This character grid cannot establish real character, mental health or dangerousness, and these items do not assess violence. Legitimate self-care and declining a request are not automatically scored as Evil.`}</p>
    {result.alignmentIds.map(id => {
      const profile = quiz.profiles.find(p => p.id === id)!;
      return <section key={id} aria-labelledby={`alignment-title-${id}`} data-alignment-match={id} className="rounded-lg border border-slate-200 p-4 sm:p-6">
        <h3 id={`alignment-title-${id}`} className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h3>
        <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${id}`} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, id)}>{zh ? "阅读这项结果的公开说明" : "Read this result’s public guide"}</Link>
      </section>;
    })}
  </div>;
}
