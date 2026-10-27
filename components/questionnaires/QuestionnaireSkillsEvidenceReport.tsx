import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { skillsEvidenceStates, type SkillsEvidenceResult } from "@/lib/questionnaires/skillsEvidence";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire, Text } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

const labels: Record<typeof skillsEvidenceStates[number], Text> = {
  recent: { en: "Example within 12 months", zh: "近12个月实例" },
  older: { en: "Older example", zh: "更早实例" },
  explore: { en: "Would like to explore", zh: "想探索" },
  na: { en: "Not recorded", zh: "暂不记录" },
};
export function QuestionnaireSkillsEvidenceReport({ quiz, result, locale }: {
  quiz: Questionnaire;
  result: Extract<SkillsEvidenceResult, { status: "complete" }>;
  locale: Locale;
}) {
  const zh = locale === "zh";
  return <div className="my-6 space-y-8" data-skills-evidence-result>
    <p className="leading-8">{zh
      ? "以下只记录你为20项任务选择的实例状态，未核实事件或表现质量。近期实例可以失败，更早实例也可能相关；四类计数不换算成能力、等级或岗位匹配。"
      : "This records the example states you selected for twenty tasks, without verifying an event or its quality. A recent example can be unsuccessful, and an older example can remain relevant. Category counts are not ability, proficiency levels or job matches."}</p>
    {result.skillsEvidence.map(part => {
      const direction = quiz.directions.find(d => d.id === part.id)!, profile = quiz.profiles.find(p => p.id === part.profileId)!;
      return <section key={part.id} data-skills-evidence-part={part.id} aria-labelledby={`skills-evidence-${part.id}`}
        className="rounded-lg border border-slate-200 p-4 sm:p-6">
        <h3 id={`skills-evidence-${part.id}`} className="text-xl font-semibold">{direction.title[locale]}</h3>
        <dl className="my-5 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label={zh ? "五项任务的状态计数" : "State counts for five tasks"}>
          {skillsEvidenceStates.map(state => <div key={state} className="rounded-lg bg-slate-50 p-3">
            <dt className="text-sm leading-6">{labels[state][locale]}</dt>
            <dd className="mt-1 font-semibold" data-skills-evidence-count={`${part.id}-${state}`}>{part.counts[state]}</dd>
          </div>)}
        </dl>
        <p className="mb-3 text-sm leading-7">{zh ? "四种计数合计5，只对应本组五项；没有分值或排序。" : "The four counts sum to five, accounting for this group’s tasks only. There are no score values or ranking."}</p>
        <ul className="mb-6 divide-y divide-slate-200">
          {part.rows.map(row => <li key={row.questionId} data-skills-evidence-row={row.questionId} className="py-3 leading-7">
            <p>{quiz.questions.find(q => q.id === row.questionId)!.prompt[locale]}</p>
            <p className="text-sm font-semibold text-slate-600" data-skills-evidence-state={row.questionId}>{labels[row.stateId][locale]}</p>
          </li>)}
        </ul>
        <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`skills-evidence-report-${part.id}`} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline"
          href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读本组完整公开指南" : "Read this group’s full public guide"}</Link>
      </section>;
    })}
    <p className="leading-8">{zh
      ? "暂不记录不是能力不足。四篇指南在任何状态下都开放；本原创盘点未建立信度、常模或效度，不认证胜任、不纠正自评偏差，也不预测薪资、表现或录用。"
      : "Not recorded does not mean low ability. All four guides remain available for every state. This original inventory has no established reliability, norms or validity; it cannot certify competence, correct self-assessment bias or predict salary, performance or hiring."}</p>
  </div>;
}

export function QuestionnaireSkillsEvidenceNextSteps({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <section className="mt-10 border-t pt-7">
    <h3 className="text-xl font-semibold">{zh ? "盘点已记录，下一步由你选择" : "Your inventory is recorded. Choose what comes next."}</h3>
    <p className="my-4 leading-7 text-slate-600">{zh
      ? "可以在私下重看一个相关实例，或先查清一项真实任务的要求。无需上传证据、购买课程或继续测评；这些状态不会换算成性格、兴趣或职业适配。也可以在这里结束。"
      : "Privately revisit one relevant example or clarify a real task requirement. No evidence upload, course purchase or further test is required. These states are never converted into personality, interests or career fit. You can stop here."}</p>
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试与练习" : "Back to all tests and practice"}</Link>
  </section>;
}
