import Link from "next/link";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { DistributedWorkResult } from "@/lib/questionnaires/distributedWork24";
import type { Locale } from "@/lib/i18n/locales";

export function DistributedWorkContext({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <aside data-distributed-work-context className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "费马原创24组协作选择与四篇完整读法。数量来自同一组相对选择，不是四个独立特质分；全部未计分也可阅读四篇全文。" : "FermatMind authored these 24 coordination pairs and four complete readings. Counts share one set of relative choices; they are not four independent trait scores. All four full guides remain open for an entirely unscored attempt."}</p>
    <p className="text-sm">{zh ? "尚未建立常模、心理测量学验证、训练效果或英中文等价，不能评价诚信、工作表现或远程工作适任。公开工作实践参考仅提供背景。" : "No norms, psychometric validation, training effect or English–Chinese equivalence has been established. The inventory cannot evaluate integrity, job performance or suitability for remote work. Public work-practice references supply background only."}</p>
  </aside>;
}

export function DistributedWorkReport({ quiz, result, locale }: {
  quiz: Questionnaire; result: Extract<DistributedWorkResult, { status: "complete" }>; locale: Locale;
}) {
  const zh = locale === "zh";
  return <div data-distributed-work-result className="my-6 space-y-7">
    <p className="leading-8">{zh ? "分别阅读四项记录。每个主题有十二次出现机会；选择本主题、选择另一行动和未计分合计十二。未选中不表示没有发生，未计分不转成低分；不计算总分、胜出项或等级。" : "Read the four records separately. Each theme has twelve appearances: selected, other action selected and left unscored sum to twelve. Unselected does not mean absent, and unscored is not converted into a low score. No overall, winner or level is calculated."}</p>
    {result.distributedWork.map(part => <section key={part.id} data-distributed-work-part={part.id} className="rounded-lg border border-slate-200 p-4 sm:p-6" aria-labelledby={`distributed-result-${part.id}`}>
      <h3 id={`distributed-result-${part.id}`} className="text-xl font-semibold">{quiz.directions.find(d => d.id === part.id)!.title[locale]}</h3>
      <dl className="my-5 grid grid-cols-1 gap-4 sm:grid-cols-3" aria-label={zh ? "十二次出现机会的选择记录" : "Choice records across twelve appearances"}>
        {([
          ["selected", zh ? "选择本主题" : "This theme selected", part.selected],
          ["other", zh ? "选择另一行动" : "Other action selected", part.otherSelected],
          ["unscored", zh ? "未计分" : "Left unscored", part.unscored],
        ] as const).map(([key, label, value]) => <div key={key}><dt>{label}</dt><dd data-distributed-count={`${part.id}-${key}`} className="mt-2 font-semibold">{value} / {part.appearances}</dd></div>)}
      </dl>
      {part.unscored === 12 && <p data-distributed-entirely-unscored className="my-4 leading-7">{zh ? "本主题没有已计入的相对选择，不能据此推断习惯或能力。" : "No relative choice was scored for this theme. This does not establish a habit or ability."}</p>}
      <a className="inline-block min-h-11 py-2 underline" href={`#distributed-public-${part.id}`}>{zh ? "阅读下方本主题完整指南" : "Read this theme’s full guide below"}</a>
    </section>)}
    <p className="leading-7">{zh ? "下方四篇完整指南与答题前相同，所有回答都可阅读。请结合选定安排、实际机会与一个具体实例，不跨人排名，也不把这些数量当作表现核验。" : "The four complete guides below are the same as before answering and remain available for every response. Consider the selected arrangement, actual opportunities and a concrete example. Do not rank people or treat these counts as verified performance."}</p>
  </div>;
}

export function DistributedWorkNextSteps({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <section className="mt-10 border-t pt-7">
    <h3 className="text-xl font-semibold">{zh ? "选一个普通实例，约定可行下一步" : "Choose one ordinary example and agree a workable next step"}</h3>
    <p className="my-4 leading-8">{zh ? "可以私下查看一次交接、状态更新、求助或回复窗口，核对相关人员实际需要什么。不必上传工作资料、披露私人处境或提高在线时间。也可以到此结束，四篇全文一直开放。" : "Privately examine one handover, status update, help request or reply window and ask what the people involved actually needed. No work-material upload, private disclosure or increased availability is required. You can stop here; all four full readings remain open."}</p>
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试与练习" : "Back to all tests and practice"}</Link>
  </section>;
}
