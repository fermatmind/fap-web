import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { MiniVirtuesResult } from "@/lib/questionnaires/miniVirtues";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireMiniVirtuesReport({ quiz, result, locale }: {
  quiz: Questionnaire; result: Extract<MiniVirtuesResult, { status: "complete" }>; locale: Locale;
}) {
  const zh = locale === "zh";
  return <div className="my-6 space-y-8" data-mini-virtues-result>
    <p className="leading-8">{zh
      ? "下面七组分别呈现本次四题原始和与均值。每组都可能同时包含反应线索与调节方式，均值不代表单一强度；没有善恶总分、道德等级、首要罪或第一美德。需要结合四条陈述及具体情境阅读，汇总数字不解释每个回答的原因。"
      : "Seven groups show their own four-item sums and means. A group may combine reactions with ways of responding, so its mean is not one underlying intensity. There is no good-or-evil total, moral level, leading sin or first virtue. Read the four statements in context; the aggregate does not explain the reasons behind any response."}</p>
    {result.equalFactorGroups.length > 0 && <p className="rounded-lg bg-slate-50 p-4 leading-8" data-mini-virtues-equal>{zh
      ? "有些组的原始和相同，只表示本次数字相同。各组题目不同，不能据此比较心理意义，也不表示罪与美德平衡、混合人格或同样严重。七组仍分别完整阅读，不打破相同数值。"
      : "Some groups have equal sums. That establishes equal numbers in this attempt only. Their statements differ, so equal sums do not establish equivalent meaning, a balance of sins and virtues, a mixed identity or equal seriousness. Read all seven separately; no equal score is broken."}</p>}
    {result.miniVirtues.map(part => {
      const direction = quiz.directions.find(d => d.id === part.id)!;
      const profile = quiz.profiles.find(p => p.id === part.profileId)!;
      return <section key={part.id} className="rounded-lg border border-slate-200 p-4 sm:p-6"
        data-mini-virtues-part={part.id} aria-labelledby={`mini-virtues-${part.id}`}>
        <h3 id={`mini-virtues-${part.id}`} className="text-xl font-semibold">{direction.title[locale]}</h3>
        <p data-mini-virtues-score={part.id} className="my-4 rounded-lg bg-slate-50 p-4 font-semibold">{zh
          ? `本次四题原始和：${part.rawSum}（范围4—20）；均值：${part.mean.toFixed(2)}（范围1—5）`
          : `This attempt: four-item sum ${part.rawSum} (range 4–20); mean ${part.mean.toFixed(2)} (range 1–5)`}</p>
        <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline"
          href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这组公开完整指南" : "Read this group’s full public guide"}</Link>
      </section>;
    })}
  </div>;
}

export function QuestionnaireMiniVirtuesNextSteps({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <section className="mt-10 border-t pt-7"><h3 className="text-xl font-semibold">{zh ? "保留一个自选观察，或在这里结束" : "Keep one optional observation, or finish here"}</h3>
    <p className="my-4 leading-8">{zh
      ? "可以分别回看七份完整指南，私下核对一件事实、一项未知或一个边界；也可不行动。本结果不换算MBTI、善恶、人品、自律或能力，不用于评价他人。无需披露答卷、接受羞辱或放弃安全与拒绝。"
      : "You may reread the seven guides separately and privately check one fact, unknown or boundary, or take no action. These results do not convert to MBTI, morality, personal worth, discipline or ability, and should not judge another person. No disclosure, shame, loss of safety or surrender of refusal is required."}</p>
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests/explore/seven-sins-virtues-test#questionnaire-results`}>{zh ? "回看七份完整指南" : "Reread all seven full guides"}</Link><br />
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试" : "Back to all tests"}</Link>
  </section>;
}
