import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";

export const questionnaireButtonClass = "min-h-12 rounded-lg border border-slate-300 px-5 py-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700 disabled:opacity-50";

export function QuestionnaireWelcome({ quiz, locale, ready, hasDraft, onStart }: {
  quiz: Pick<Questionnaire, "slug" | "kind" | "questions" | "instructions">;
  locale: Locale; ready: boolean; hasDraft: boolean; onStart: (resume?: boolean) => void;
}) {
  const zh = locale === "zh", button = questionnaireButtonClass;
  return <>
      <h2 className="text-2xl font-semibold">{quiz.slug === "disc" ? (zh ? "DISC测试作答说明" : "How to answer the DISC questionnaire") : quiz.kind === "work-role12" ? (zh ? "开始12项角色与支持方式回顾" : "Start your 12-task role reflection") : quiz.kind === "skills-evidence" ? (zh ? "开始20项任务实例盘点" : "Start your 20-task example inventory") : quiz.kind === "practice" ? (zh ? `开始${quiz.questions.length}题练习` : `Start your ${quiz.questions.length}-question practice`) : (zh ? `开始${quiz.questions.length}题的自我观察` : `Start your ${quiz.questions.length}-question reflection`)}</h2>
      <p className="my-4 leading-7">{quiz.instructions?.[locale] ?? (zh ? "每题比较两种做法，选择通常更自然或更先出现的一项。没有正确答案。答完全部题目后再生成计数和完整解释。" : "Each question compares two responses. Choose the one that comes more naturally or happens first. There are no correct answers. Counts and full explanations appear only after all questions are complete.")}</p>
      {!ready && <p role="status" className="my-3 text-sm text-slate-600">{zh ? "正在准备测试…" : "Preparing the test…"}</p>}
      <div className="flex flex-wrap gap-3"><button data-explore-start disabled={!ready} className={`${button} bg-violet-700 text-white`} onClick={() => onStart()}>{zh ? "开始测试" : "Start test"}</button>{hasDraft && <button data-questionnaire-resume disabled={!ready} className={button} onClick={() => onStart(true)}>{zh ? "恢复本标签页进度" : "Resume this tab's progress"}</button>}</div>
      <p className="mt-4 text-sm leading-7 text-slate-600">{zh ? "完整题目和结果免费，无需注册。只有主动保存才会在刷新或换语言后提供恢复；本标签页保存24小时后失效，完成或重测即清除。" : "All questions and full results are free, with no signup. Saving is optional; only saved attempts can be resumed after a refresh or language change. Tab drafts expire after 24 hours and clear on completion or retake."}</p>
      </>;
}
