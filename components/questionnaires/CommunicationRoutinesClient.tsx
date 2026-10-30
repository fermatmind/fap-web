"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { recordCommunicationRoutines20, type CommunicationRoutinesRecord } from "@/lib/questionnaires/communicationRoutines20";
import { questionnairePath } from "@/lib/questionnaires/paths";
import { CommunicationRoutinesReport } from "./CommunicationRoutinesReport";
const subscribeReady = () => () => undefined;
const button = "min-h-12 rounded-lg border border-slate-400 px-5 py-3 font-semibold disabled:opacity-50";
export function CommunicationRoutinesClient({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  const ready = useSyncExternalStore(subscribeReady, () => true, () => false);
  const zh = locale === "zh", [stage, setStage] = useState<"ready" | "answer" | "result">("ready");
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({}), [position, setPosition] = useState(0);
  const [records, setRecords] = useState<CommunicationRoutinesRecord[]>([]), [message, setMessage] = useState("");
  const heading = useRef<HTMLHeadingElement>(null), context = useRef<HTMLDivElement>(null);
  function clear(notice = "") { setAnswers({}); setRecords([]); setPosition(0); setStage("ready"); setMessage(notice); }
  useEffect(() => {
    const leave = () => { setAnswers({}); setRecords([]); setPosition(0); setStage("ready"); setMessage(""); };
    const restore = (event: PageTransitionEvent) => { if (event.persisted) leave(); };
    window.addEventListener("pagehide", leave); window.addEventListener("pageshow", restore);
    return () => { window.removeEventListener("pagehide", leave); window.removeEventListener("pageshow", restore); };
  }, []);
  useEffect(() => {
    if (stage === "ready") return;
    const target = stage === "result" ? document.getElementById("communication-routines-result-heading") : heading.current;
    target?.focus({ preventScroll: true }); (stage === "answer" ? context.current : target)?.scrollIntoView({ block: "start" });
  }, [stage, position]);
  function next() {
    if (!Object.hasOwn(answers, quiz.questions[position].id)) { setMessage(zh ? "请选择一个类别或明确未计分。" : "Choose a category or explicitly leave this observation unscored."); return; }
    setMessage(""); if (position < 19) { setPosition(position + 1); return; }
    const result = recordCommunicationRoutines20(quiz, answers);
    if (result.status !== "complete") { clear(zh ? "记录无法核对，已清除。" : "The record could not be checked and was cleared."); return; }
    setRecords(result.records); setAnswers({}); setStage("result");
  }
  async function copyPublicEntry() {
    const text = `${quiz.title[locale]} — https://fermatmind.com${questionnairePath(locale, quiz.slug)}`;
    try { await navigator.clipboard.writeText(text); setMessage(zh ? "已复制公开标题与入口，不含回答。" : "Copied the public title and entry without answers."); }
    catch { setMessage(text); }
  }
  const q = quiz.questions[position];
  return <section id="take-test" data-communication-routines-stage={stage} className="my-8 space-y-5 rounded-lg border border-slate-300 bg-white p-4 sm:p-6">
    {stage === "ready" && <><h2 className="text-2xl font-semibold">{zh ? "自愿开始，随时离开" : "Begin only if you want; leave at any time"}</h2><p className="leading-7">{zh ? "20条原创描述，只回顾过去四周自己的普通情境。无需社交演示、眼神接触练习、感官暴露、私人对话或计时空间任务。回答只留在本页内存，不保存草稿、不提交，也没有问卷分析。下方五篇全文无需答题就能读。" : "20 original descriptions about your own ordinary situations during the past four weeks. No social demonstration, eye-contact exercise, sensory exposure, private conversation or timed spatial task is needed. Answers stay in this page’s memory, with no drafts, submission or questionnaire analytics. Read all five complete guides below without answering."}</p><button type="button" className={button} disabled={!ready} onClick={() => { clear(); setStage("answer"); }}>{zh ? "开始原创观察" : "Begin original observations"}</button></>}
    {stage === "answer" && <div ref={context} data-communication-routines-question-context className="scroll-mt-24 space-y-5">
      <p>{zh ? `第 ${position + 1} / 20 条 · 过去四周` : `Observation ${position + 1} / 20 · Past four weeks`}</p>
      <h2 ref={heading} id="communication-routines-active-question" tabIndex={-1} className="text-xl font-semibold leading-8 outline-none">{q.prompt[locale]}</h2>
      <fieldset className="min-w-0 space-y-3" aria-labelledby="communication-routines-active-question">{q.options.map(o => <label key={o.id} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-slate-300 p-3 leading-7"><input className="mt-2 h-5 w-5 shrink-0" type="radio" name={q.id} value={o.id} checked={answers[q.id] === o.id} onChange={() => { setAnswers({ ...answers, [q.id]: o.id }); setMessage(""); }} /><span className="min-w-0">{o.id === "na" ? `${zh ? "未计分：" : "Unscored: "}${o.label[locale]}` : o.label[locale]}</span></label>)}</fieldset>
      <div className="flex flex-wrap gap-3"><button type="button" className={button} disabled={position === 0} onClick={() => { setPosition(position - 1); setMessage(""); }}>{zh ? "上一条" : "Back"}</button><button type="button" className={button} onClick={next}>{position === 19 ? (zh ? "整理观察记录" : "Organize observations") : (zh ? "下一条" : "Next")}</button></div>
      <button type="button" className={button} onClick={() => clear(zh ? "已退出并清除回答。" : "Exited and cleared answers.")}>{zh ? "退出并清除" : "Exit and clear"}</button>
    </div>}
    {stage === "result" && <><CommunicationRoutinesReport quiz={quiz} records={records} locale={locale} /><button type="button" className={button} onClick={() => { clear(); setStage("answer"); }}>{zh ? "清除并重做" : "Clear and retake"}</button><button type="button" className={button} onClick={() => clear(zh ? "已退出并清除记录。" : "Exited and cleared the record.")}>{zh ? "退出并清除" : "Exit and clear"}</button><button type="button" className={button} onClick={copyPublicEntry}>{zh ? "复制公开入口" : "Copy public entry"}</button></>}
    {message && <p role="status" className="break-words leading-7">{message}</p>}
  </section>;
}
