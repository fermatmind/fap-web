import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { workRoleLabels, workRoleStates, type WorkRoleResult } from "@/lib/questionnaires/workRole12";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireWorkRoleReport({ quiz, result, locale }: {
  quiz: Questionnaire;
  result: Extract<WorkRoleResult, { status: "complete" }>;
  locale: Locale;
}) {
  const zh = locale === "zh";
  return <div className="my-6 space-y-8" data-work-role-result>
    <p className="leading-8">{zh
      ? "以下记录你为选定角色近12周的具体实例选择的参与方式，不核实表现质量。逐步指导、按检查点承担、支持他人是不同情境，不是初级、中级或专家等级；支持他人的人也可能在其他任务上需要指导。"
      : "These records show the participation context you selected for concrete instances in one role during the past twelve weeks, without verifying performance quality. Step-by-step guidance, task ownership and supporting another person are different contexts, not beginner, intermediate or expert levels. A person supporting others may need guidance on other tasks."}</p>
    {result.workRole.map(part => {
      const direction = quiz.directions.find(item => item.id === part.id)!, profile = quiz.profiles.find(item => item.id === part.profileId)!;
      return <section key={part.id} data-work-role-part={part.id} aria-labelledby={`work-role-${part.id}`}
        className="rounded-lg border border-slate-200 p-4 sm:p-6">
        <h3 id={`work-role-${part.id}`} className="text-xl font-semibold">{direction.title[locale]}</h3>
        <dl className="my-5 grid grid-cols-1 gap-3 sm:grid-cols-2" aria-label={zh ? "四项任务的情境计数" : "Context counts for four tasks"}>
          {workRoleStates.map(state => <div key={state} className="rounded-lg bg-slate-50 p-3">
            <dt className="text-sm leading-6">{workRoleLabels[state][locale]}</dt>
            <dd className="mt-1 font-semibold" data-work-role-count={`${part.id}-${state}`}>{part.counts[state]}</dd>
          </div>)}
        </dl>
        <p className="mb-3 text-sm leading-7">{zh
          ? "四种计数合计4，仅对应本组四项；无总分、均值、胜出类别或职业层级。没有实例／无法判断／不愿回答不会被当成能力不足。"
          : "The four counts sum to four and describe this group’s four tasks only. There is no total score, mean, winning category or career tier. No instance, uncertainty or choosing not to answer does not imply low ability."}</p>
        <ul className="mb-6 divide-y divide-slate-200">
          {part.rows.map(row => <li key={row.questionId} data-work-role-row={row.questionId} className="py-3 leading-7">
            <p>{quiz.questions.find(question => question.id === row.questionId)!.prompt[locale]}</p>
            <p className="text-sm font-semibold text-slate-600" data-work-role-state={row.questionId}>{workRoleLabels[row.stateId][locale]}</p>
          </li>)}
        </ul>
        <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`work-role-reading-${part.id}`} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline"
          href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读本组完整公开指南" : "Read this group’s full public guide"}</Link>
      </section>;
    })}
  </div>;
}

export function QuestionnaireWorkRoleNextSteps({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <section className="mt-10 border-t pt-7">
    <h3 className="text-xl font-semibold">{zh ? "选一个实例，讨论所需支持" : "Choose one instance and discuss the support it needs"}</h3>
    <p className="my-4 leading-7 text-slate-600">{zh
      ? "可在私下核对任务要求、自己的责任与已获得的反馈，不必上传工作材料。三份指南对全部回答开放；本原创回顾未建立常模或心理测量效度，不认证能力、决定晋升、筛选应聘者或匹配岗位。也可以在这里结束，无需购买服务或继续测试。"
      : "Privately review the task requirement, your responsibility and feedback you actually received. No work material upload is needed. All three guides remain open for every answer. This original reflection has no established norms or psychometric validity and cannot certify ability, decide promotion, screen applicants or match jobs. You can stop here without buying a service or taking another test."}</p>
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试与练习" : "Back to all tests and practice"}</Link>
  </section>;
}
