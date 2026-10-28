import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { MiniShadowQuestionnaire } from "@/lib/questionnaires/miniShadow";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireReport } from "./QuestionnaireReport";

type Complete = Extract<FacetResult, { status: "complete" }>;
export function QuestionnaireShadowReport({ quiz, result, locale }: { quiz: MiniShadowQuestionnaire; result: Complete; locale: Locale }) {
  const zh = locale === "zh";
  const valid = quiz.directions.every(direction => {
    const part = result.facets[direction.id];
    return part && part.rated === 4 && part.total === 4 && Number.isInteger(part.sum)
      && part.sum >= 4 && part.sum <= 20 && part.mean === part.sum / 4;
  });
  if (!valid) return <p role="status">{zh ? "本次记录暂不可用，可以清除后重新开始。" : "This record is unavailable. Clear it and start again."}</p>;
  return <div data-shadow-result className="my-6 space-y-8">
    <p className="leading-8">{zh ? "五组分别读，不合总分、不排名、不指定主导或混合人格。原始和与均值只汇总过去三个月对各组四句话的符合程度，不是发生频率、反应强度、风险或心理健康。3是有效的不确定或视情况；相同均值也可能来自不同回答。" : "Read the five groups separately, without a total, ranking, dominant or combined personality. Sums and means summarize agreement with four statements over three months, not frequency, intensity, risk or mental health. A 3 is valid uncertainty or depends, and different responses can have equal means."}</p>
    <aside role="note" className="rounded-lg border border-slate-200 p-4 leading-8">{zh ? "本题本不会揭露隐藏的真实人格。对象、关系、权力差异、现实安全和资源会影响反应。暴力、威胁、控制或胁迫不归为需要靠改分修正的普通沟通差异；没有哪个数值要求你继续交流、直接对抗或重新接触不安全的人。" : "This form does not reveal a hidden, truer personality. Relationships, power, safety and resources affect responses. Violence, threats, coercive control or intimidation are not ordinary communication differences to fix by changing a value. No value requires continued exchange, confrontation or renewed contact with an unsafe person."}</aside>
    {quiz.directions.map(direction => {
      const part = result.facets[direction.id];
      const profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
      return <section key={direction.id} data-shadow-part={direction.id} aria-labelledby={`shadow-${direction.id}`} className="rounded-lg border border-slate-200 p-4 sm:p-6">
        <h3 id={`shadow-${direction.id}`} className="text-2xl font-semibold">{direction.title[locale]}</h3>
        <p data-shadow-mean className="my-4 rounded-lg bg-slate-50 p-4 font-semibold">{zh ? `均值：${part.mean!.toFixed(4)} / 5（${part.sum} ÷ 4，显示至四位小数）` : `Mean: ${part.mean!.toFixed(4)} / 5 (${part.sum} ÷ 4, displayed to four decimals)`}</p>
        <p data-shadow-sum className="mb-4 leading-8">{zh ? `原始和：${part.sum}（四题范围4—20）。不设高低线，不代表次数、严重度或人格本质。` : `Raw sum: ${part.sum} (four-item range 4–20). No cutoff, frequency, severity or personality essence is assigned.`}</p>
        <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`shadow-report-${profile.id}`} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "单独阅读本组完整公开指南" : "Read this group’s complete public guide separately"}</Link>
      </section>;
    })}
    <aside className="rounded-lg border border-slate-200 p-4 leading-8"><p>{zh ? "原创题本与英文工作译文未经心理测量学验证，不是荣格阴影评估、潜意识分析、依恋测量或诊断。可选的事实观察均可跳过，不必分享答案或私人经历。" : "The original form and working English translation lack psychometric validation. This is not Jungian shadow assessment, unconscious analysis, attachment measurement or diagnosis. All factual observations are optional, without sharing responses or a personal experience."}</p><p className="mt-3">{zh ? "回答与本次记录只在当前页面内存中，刷新、换语或离开会清除。复制只含五篇公开指南链接，不含你的数值或选项。" : "Responses and this record stay only in current-page memory and clear on reload, language change or leaving. Copying includes five public guide links without your values or choices."}</p></aside>
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试" : "Back to all tests"}</Link>
  </div>;
}
