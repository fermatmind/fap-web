"use client";
import { Wave3cResultCard } from "./Wave3cResultCard";
import { ResultCoreBridge } from "./ResultCoreBridge";
import { useQuestionnaireDisplayCopy } from "./TraditionalQuestionnaireCopy";
import { QuestionnaireLegacyControl } from "./QuestionnaireTakeContext";
import { useEntertainmentMetrics, useEntertainmentResultView } from "@/components/entertainment/useEntertainmentMetrics";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { FourAxesResult } from "@/lib/questionnaires/fourAxes";
import type { Locale } from "@/lib/i18n/locales";
import type { QuestionnaireAnswers, QuestionnaireProfile } from "@/lib/questionnaires/types";
import { isFourAxesConfigurationValid, scoreFourAxesQuestionnaire, type FourAxesQuestionnaire } from "@/lib/questionnaires/fourAxes";
import { QuestionnaireFourAxesReport } from "./QuestionnaireFourAxesReport";

type Complete = Extract<FourAxesResult, { status: "complete" }>;
const button = "min-h-12 rounded-lg border border-slate-300 px-4 py-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700 disabled:opacity-50";
const subscribeReady = () => () => {};

export function QuestionnaireFourAxesClient({ quiz, locale, readingProfiles }: { quiz: unknown; locale: Locale; readingProfiles?: readonly QuestionnaireProfile[] }) {
  const { displayText } = useQuestionnaireDisplayCopy();
  if (!isFourAxesConfigurationValid(quiz)) return <p role="status">{locale === "zh" ? displayText("问卷内容暂不可用。") : "The questionnaire content is unavailable."}</p>;
  return <ValidFourAxesClient key={`${locale}:${quiz.version}`} quiz={quiz} locale={locale} readingProfiles={readingProfiles} />;
}

function ValidFourAxesClient({ quiz, locale, readingProfiles }: { quiz: FourAxesQuestionnaire; locale: Locale; readingProfiles?: readonly QuestionnaireProfile[] }) {
  const { displayText, traditional } = useQuestionnaireDisplayCopy();
  const { start: recordStart, complete: recordComplete, view: recordView, consent: activityConsent, share: recordShare } = useEntertainmentMetrics(quiz.slug, quiz.version, locale, true, displayText);
  const ready = useSyncExternalStore(subscribeReady, () => true, () => false), zh = locale === "zh";
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({}), [stage, setStage] = useState<"welcome" | "answer" | "result">("welcome");
  const [position, setPosition] = useState(0), [result, setResult] = useState<Complete | null>(null);
  const [message, setMessage] = useState("");
  const heading = useRef<HTMLHeadingElement>(null), progress = useRef<HTMLParagraphElement>(null), revision = useRef(0);
  const clear = useCallback(() => {
    revision.current += 1; setAnswers({}); setStage("welcome"); setPosition(0); setResult(null); setMessage("");
  }, []);
  useEffect(() => {
    const leave = () => clear(), restore = (event: PageTransitionEvent) => { if (event.persisted) clear(); };
    window.addEventListener("pagehide", leave); window.addEventListener("pageshow", restore);
    return () => { revision.current += 1; window.removeEventListener("pagehide", leave); window.removeEventListener("pageshow", restore); };
  }, [clear]);
  useEffect(() => { if (stage !== "welcome") { heading.current?.focus({ preventScroll: true }); (stage === "answer" ? progress.current : heading.current)?.scrollIntoView({ block: "start" }); } }, [stage, position]);
  function next() {
    const checked = scoreFourAxesQuestionnaire(quiz, answers);
    if (checked.status === "invalid" || checked.status === "unavailable") { setMessage(zh ? displayText("当前回答无法读取，请清除后重新开始。") : "These responses cannot be read. Clear and start again."); return; }
    if (!Object.hasOwn(answers, quiz.questions[position].id)) { setMessage(zh ? displayText("请选择这句话的符合程度；也可以退出，直接读指南。") : "Choose how well the statement fits, or exit and read the guides."); return; }
    setMessage("");
    if (position < 59) setPosition(position + 1);
    else if (checked.status === "complete") { revision.current += 1; setResult(checked); setStage("result"); recordComplete(); }
    else setMessage(zh ? displayText("还有题目未选择，可以返回检查，也可以退出无分阅读。") : "Some choices are missing. Go back to check, or leave without a result.");
  }
  useEntertainmentResultView(recordView, stage === "result");
  return <section id="take-test" data-stage={stage} data-four-axes-client aria-busy={!ready} className="my-8 scroll-mt-24 rounded-xl border border-violet-200 bg-white p-5 sm:p-7">
    <fieldset disabled={!ready} className="min-w-0 space-y-5 p-0">
      <legend className="sr-only">{quiz.title[locale]}</legend>
      {stage === "welcome" && <>
        <button data-explore-start type="button" className={`${button} bg-violet-700 text-white`} onClick={() => { revision.current += 1; setStage("answer"); recordStart(); setPosition(0); setMessage(""); }}>{zh ? displayText("开始测试") : "Start test"}</button>
        <h2 className="text-2xl font-semibold">{zh ? displayText("从四个视角描述自己") : "Describe yourself from four perspectives"}</h2>
        <p className="leading-8">{quiz.instructions[locale]}</p>

      </>}
      {stage === "answer" && <>
        <p ref={progress} data-four-axes-progress className="scroll-mt-24 text-sm text-slate-600">{zh ? displayText(`第 ${position + 1} / 60 题`) : `Choice ${position + 1} of 60`}</p>
        <h2 ref={heading} tabIndex={-1} id="four-axes-question" className="scroll-mt-24 text-2xl font-semibold leading-relaxed">{quiz.questions[position].prompt[locale]}</h2>
        <div role="radiogroup" aria-labelledby="four-axes-question" className="space-y-3">{quiz.questions[position].options.map(option => <label key={option.id} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-slate-300 p-3">
          <input type="radio" name={quiz.questions[position].id} value={option.id} checked={answers[quiz.questions[position].id] === option.id} className="mt-1 size-5 shrink-0 accent-violet-700" onChange={() => { revision.current += 1; setAnswers({ ...answers, [quiz.questions[position].id]: option.id }); setMessage(""); setResult(null); }} />
          <span className="leading-7">{option.label[locale]}</span>
        </label>)}</div>
        <div className="flex flex-wrap gap-3"><button type="button" className={button} disabled={position === 0} onClick={() => { setPosition(position - 1); setMessage(""); }}>{zh ? displayText("上一题") : "Back"}</button><button data-questionnaire-next type="button" className={button} onClick={next}>{position === 59 ? (zh ? displayText("查看四轴位置") : "See four positions") : (zh ? displayText("下一题") : "Next")}</button></div>
      </>}
      {stage === "result" && result && <>
        <h2 ref={heading} tabIndex={-1} className="sr-only scroll-mt-24 text-2xl font-semibold">{quiz.resultHeading[locale]}</h2>
        <Wave3cResultCard quiz={quiz} result={result} locale={locale} onRetake={() => { clear(); setStage("answer"); recordStart(); }} onShare={recordShare} />
        <QuestionnaireFourAxesReport quiz={quiz} result={result} locale={locale} readingProfiles={readingProfiles} />
        <button type="button" className={button} onClick={() => { revision.current += 1; setResult(null); setMessage(""); setStage("answer"); setPosition(0); }}>{zh ? displayText("修改回答（清除当前结果）") : "Edit answers and clear this result"}</button>

        <ResultCoreBridge locale={traditional ? "zh-TW" : locale} target="BIG5_OCEAN" />
      </>}
      {stage !== "welcome" && <QuestionnaireLegacyControl><button type="button" className={button} onClick={clear}>{zh ? displayText("退出并清除本次回答") : "Exit and clear these responses"}</button></QuestionnaireLegacyControl>}
    </fieldset>
    <p className="mb-4 text-sm leading-7 text-slate-600">{zh ? displayText("只使用当前页面内存；不保存草稿或结果，不上传逐题选择。刷新、换语或离开会清除。") : "Current-page memory only: no draft or result is saved and choices are not uploaded. Reloading, changing language or leaving clears answers."}</p>
    {activityConsent}
    <p role="status" aria-live="polite" className="my-4 text-sm leading-7">{ready ? message : (zh ? displayText("正在准备问卷，请稍候。") : "Preparing the questionnaire. Please wait.")}</p>
    <noscript><p>{zh ? displayText("互动答题需要JavaScript；禁用时本网站部分页面可能停在加载画面。") : "Interactive answering requires JavaScript. Some pages on this website may remain at a loading screen when it is disabled."}</p></noscript>
  </section>;
}
