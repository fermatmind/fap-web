"use client";

import { useQuestionnaireDisplayCopy } from "./TraditionalQuestionnaireCopy";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import Link from "next/link";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { DistributedWorkResult } from "@/lib/questionnaires/distributedWork24";
import type { Locale } from "@/lib/i18n/locales";

export function DistributedWorkContext({ locale }: { locale: Locale }) {
  const { displayText } = useQuestionnaireDisplayCopy();
  const zh = locale === "zh";
  return <aside data-distributed-work-context className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? displayText("费马原创24组协作选择与四篇完整读法。数量来自同一组相对选择，不是四个独立特质分；全部未计分也可阅读四篇全文。") : "FermatMind authored these 24 coordination pairs and four complete readings. Counts share one set of relative choices; they are not four independent trait scores. All four full guides remain open for an entirely unscored attempt."}</p>
    <p className="text-sm">{zh ? displayText("尚未建立常模、心理测量学验证、训练效果或英中文等价，不能评价诚信、工作表现或远程工作适任。公开工作实践参考仅提供背景。") : "No norms, psychometric validation, training effect or English–Chinese equivalence has been established. The inventory cannot evaluate integrity, job performance or suitability for remote work. Public work-practice references supply background only."}</p>
  </aside>;
}

export function DistributedWorkReport({ quiz, result, locale, readingProfiles = quiz.profiles }: {
  readingProfiles?: Questionnaire["profiles"];
  quiz: Questionnaire; result: Extract<DistributedWorkResult, { status: "complete" }>; locale: Locale;
}) {
  const { displayText } = useQuestionnaireDisplayCopy();
  const zh = locale === "zh";
  return <div data-distributed-work-result className="my-6 space-y-7">

    <section className="rounded-xl border border-sky-200 bg-sky-50/60 p-4 sm:p-6" aria-labelledby="distributed-review-start">
      <h3 id="distributed-review-start" className="text-xl font-semibold text-sky-950">{zh ? displayText("从一次具体的远程协作开始回看") : "Start with a concrete remote-work situation"}</h3>
      <p className="mt-3 max-w-prose leading-7">{zh ? displayText("每个主题在本题本里出现十二次。下方记录选择这个行动、选择另一行动和未计分的次数。选一个主题，可读工作里的例子。") : "Each theme appears twelve times in the questionnaire. The counts show how often you picked that action, picked the other action or left the choice unscored. Open any theme for a work example."}</p>
      <div className="mt-4 grid gap-x-6 md:grid-cols-2">
        {result.distributedWork.map(part => <div key={part.id} className="min-w-0 border-t border-sky-200 py-2">
          <a href={`#distributed-result-${part.id}`} className="inline-flex min-h-11 items-center font-semibold text-sky-950 underline underline-offset-4">{quiz.directions.find(direction => direction.id === part.id)!.title[locale]}</a>
          <p className="text-sm leading-6 tabular-nums">{zh ? displayText(`选本项 ${part.selected} · 选另一项 ${part.otherSelected} · 未计分 ${part.unscored}`) : `This action ${part.selected} · Other action ${part.otherSelected} · Unscored ${part.unscored}`}</p>
        </div>)}
      </div>
    </section>
    {result.distributedWork.map(part => {
      const profile = readingProfiles.find(profile => profile.id === part.profileId) ?? quiz.profiles.find(profile => profile.id === part.profileId)!;
      return <section key={part.id} data-distributed-work-part={part.id} className="rounded-lg border border-slate-200 p-4 sm:p-6" aria-labelledby={`distributed-result-${part.id}`}>
      <h3 id={`distributed-result-${part.id}`} className="scroll-mt-24 text-xl font-semibold">{quiz.directions.find(d => d.id === part.id)!.title[locale]}</h3>
      <dl className="my-5 grid grid-cols-1 gap-4 sm:grid-cols-3" aria-label={zh ? displayText("十二次出现机会的选择记录") : "Choice records across twelve appearances"}>
        {([
          ["selected", zh ? displayText("选择本主题") : "This theme selected", part.selected],
          ["other", zh ? displayText("选择另一行动") : "Other action selected", part.otherSelected],
          ["unscored", zh ? displayText("未计分") : "Left unscored", part.unscored],
        ] as const).map(([key, label, value]) => <div key={key}><dt>{label}</dt><dd data-distributed-count={`${part.id}-${key}`} className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{value} / {part.appearances}</dd></div>)}
      </dl>
      {part.unscored === 12 && <p data-distributed-entirely-unscored className="my-4 leading-7">{zh ? displayText("本主题没有已计入的相对选择，不能据此推断习惯或能力。") : "No relative choice was scored for this theme. This does not establish a habit or ability."}</p>}
      <div id={`distributed-public-${part.id}`} className="scroll-mt-24"><QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`distributed-result-reading-${profile.id}`} mode="result" previewSectionIds={["section-2", "section-5"]} /></div>
    </section>; })}
    <p className="leading-7">{zh ? displayText("下方四篇完整指南与答题前相同，所有回答都可阅读。请结合选定安排、实际机会与一个具体实例，不跨人排名，也不把这些数量当作表现核验。") : "The four complete guides below are the same as before answering and remain available for every response. Consider the selected arrangement, actual opportunities and a concrete example. Do not rank people or treat these counts as verified performance."}</p>
    <details><summary className="min-h-11 cursor-pointer py-2 font-semibold underline">{zh ? displayText("怎样读这些选择记录") : "How to read these choice records"}</summary>
    <p className="leading-8">{zh ? displayText("分别阅读四项记录。每个主题有十二次出现机会；选择本主题、选择另一行动和未计分合计十二。未选中不表示没有发生，未计分不转成低分；不计算总分、胜出项或等级。") : "Read the four records separately. Each theme has twelve appearances: selected, other action selected and left unscored sum to twelve. Unselected does not mean absent, and unscored is not converted into a low score. No overall, winner or level is calculated."}</p>
    </details>
  </div>;
}

export function DistributedWorkNextSteps({ locale }: { locale: Locale }) {
  const { displayText, traditional } = useQuestionnaireDisplayCopy();
  const zh = locale === "zh";
  return <section className="mt-10 border-t pt-7">
    <h3 className="text-xl font-semibold">{zh ? displayText("选一个普通实例，约定可行下一步") : "Choose one ordinary example and agree a workable next step"}</h3>
    <p className="my-4 leading-8">{zh ? displayText("可以私下查看一次交接、状态更新、求助或回复窗口，核对相关人员实际需要什么。不必上传工作资料、披露私人处境或提高在线时间。也可以到此结束，四篇全文一直开放。") : "Privately examine one handover, status update, help request or reply window and ask what the people involved actually needed. No work-material upload, private disclosure or increased availability is required. You can stop here; all four full readings remain open."}</p>
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${traditional ? "zh-TW" : locale}/tests#more-tests`}>{zh ? displayText("返回全部测试与练习") : "Back to all tests and practice"}</Link>
  </section>;
}
