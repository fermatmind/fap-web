"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { recordBereavement16, isBereavementTimeId, type BereavementTimeId, type BereavementRecord } from "@/lib/questionnaires/bereavement16";
import { questionnairePath } from "@/lib/questionnaires/paths";
import { BereavementReport } from "./BereavementReport";
const subscribeReady = () => () => undefined;
const button = "min-h-12 rounded-lg border border-slate-400 px-5 py-3 font-semibold disabled:opacity-50";
export function BereavementClient({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  const ready = useSyncExternalStore(subscribeReady, () => true, () => false);
  const zh = locale === "zh", [stage, setStage] = useState<"ready" | "answer" | "result">("ready");
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({}), [position, setPosition] = useState(0);
  const [records, setRecords] = useState<BereavementRecord[]>([]), [message, setMessage] = useState("");
  const [timeContext, setTimeContext] = useState<BereavementTimeId>("withheld");
  const heading = useRef<HTMLHeadingElement>(null), context = useRef<HTMLDivElement>(null);
  function clear(notice = "", keepTime = false) { if (!keepTime) setTimeContext("withheld"); setAnswers({}); setRecords([]); setPosition(0); setStage("ready"); setMessage(notice); }
  useEffect(() => {
    const leave = () => { setTimeContext("withheld"); setAnswers({}); setRecords([]); setPosition(0); setStage("ready"); setMessage(""); };
    const restore = (event: PageTransitionEvent) => { if (event.persisted) leave(); };
    window.addEventListener("pagehide", leave); window.addEventListener("pageshow", restore);
    return () => { window.removeEventListener("pagehide", leave); window.removeEventListener("pageshow", restore); };
  }, []);
  useEffect(() => {
    if (stage === "ready") return;
    const target = stage === "result" ? document.getElementById("bereavement-result-heading") : heading.current;
    target?.focus({ preventScroll: true }); (stage === "answer" ? context.current : target)?.scrollIntoView({ block: "start" });
  }, [stage, position]);
  function next() {
    if (!Object.hasOwn(answers, quiz.questions[position].id)) { setMessage(zh ? "请选择一个类别或明确未计分。" : "Choose a category or explicitly leave this observation unscored."); return; }
    setMessage(""); if (position < 15) { setPosition(position + 1); return; }
    const result = recordBereavement16(quiz, answers, timeContext);
    if (result.status !== "complete") { clear(zh ? "记录无法核对，已清除。" : "The record could not be checked and was cleared."); return; }
    setTimeContext(result.timeContext); setRecords(result.records); setAnswers({}); setStage("result");
  }
  async function copyPublicEntry() {
    const text = `${quiz.title[locale]} — https://fermatmind.com${questionnairePath(locale, quiz.slug)}`;
    try { await navigator.clipboard.writeText(text); setMessage(zh ? "已复制公开标题与入口，不含回答。" : "Copied the public title and entry without answers."); }
    catch { setMessage(text); }
  }
  const q = quiz.questions[position];
  return <section id="take-test" data-bereavement-stage={stage} className="my-8 space-y-5 rounded-lg border border-slate-300 bg-white p-4 sm:p-6">
    {stage !== "result" && <div className="space-y-3"><label className="block font-semibold" htmlFor="bereavement-time-context">{quiz.bereavementTimeContext!.question[locale]}</label><select id="bereavement-time-context" data-bereavement-time-select className="min-h-12 w-full rounded-lg border border-slate-400 bg-white p-3" disabled={!ready} value={timeContext} onChange={event => { if (isBereavementTimeId(event.target.value)) setTimeContext(event.target.value); }}>{quiz.bereavementTimeContext!.options.map(o => <option key={o.id} value={o.id}>{o.label[locale]}</option>)}</select><p className="leading-7">{quiz.bereavementTimeContext!.boundary[locale]}</p></div>}
    {stage === "ready" && <><h2 className="text-2xl font-semibold">{zh ? "自愿开始，随时离开" : "Begin only if you want; leave at any time"}</h2><p className="leading-7">{zh ? "16条原创观察，回顾重要的人去世后过去四周的经历；若更近，只回顾去世以来。可以不选时间背景。回答与时间只留在本页内存，不保存草稿、不提交，也没有问卷分析。下方五篇全文无需答题就能读。" : "16 original observations about the past four weeks after a significant person died; if more recent, reflect only since the death. Timing is optional. Answers and timing stay in this page’s memory, with no drafts, submission or questionnaire analytics. Read all five complete guides below without answering."}</p><button type="button" className={button} disabled={!ready} onClick={() => { clear("", true); setStage("answer"); }}>{zh ? "开始原创观察" : "Begin original observations"}</button></>}
    {stage === "answer" && <div ref={context} data-bereavement-question-context className="scroll-mt-24 space-y-5">
      <p>{zh ? `第 ${position + 1} / 16 条 · 去世后过去四周` : `Observation ${position + 1} / 16 · Past four weeks after the death`}</p>
      <h2 ref={heading} id="bereavement-active-question" tabIndex={-1} className="text-xl font-semibold leading-8 outline-none">{q.prompt[locale]}</h2>
      <fieldset className="min-w-0 space-y-3" aria-labelledby="bereavement-active-question">{q.options.map(o => <label key={o.id} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-slate-300 p-3 leading-7"><input className="mt-2 h-5 w-5 shrink-0" type="radio" name={q.id} value={o.id} checked={answers[q.id] === o.id} onChange={() => { setAnswers({ ...answers, [q.id]: o.id }); setMessage(""); }} /><span className="min-w-0">{o.id === "na" ? `${zh ? "未计分：" : "Unscored: "}${o.label[locale]}` : o.label[locale]}</span></label>)}</fieldset>
      <div className="flex flex-wrap gap-3"><button type="button" className={button} disabled={position === 0} onClick={() => { setPosition(position - 1); setMessage(""); }}>{zh ? "上一条" : "Back"}</button><button type="button" className={button} onClick={next}>{position === 15 ? (zh ? "整理观察记录" : "Organize observations") : (zh ? "下一条" : "Next")}</button></div>
      <button type="button" className={button} onClick={() => clear(zh ? "已退出并清除回答与时间背景。" : "Exited and cleared answers and timing.")}>{zh ? "退出并清除" : "Exit and clear"}</button>
    </div>}
    {stage === "result" && <><BereavementReport quiz={quiz} records={records} timeContext={timeContext} locale={locale} /><button type="button" className={button} onClick={() => { clear(); setStage("answer"); }}>{zh ? "清除并重做" : "Clear and retake"}</button><button type="button" className={button} onClick={() => clear(zh ? "已退出并清除记录与时间背景。" : "Exited and cleared the record and timing.")}>{zh ? "退出并清除" : "Exit and clear"}</button><button type="button" className={button} onClick={copyPublicEntry}>{zh ? "复制公开入口" : "Copy public entry"}</button></>}
    {message && <p role="status" className="break-words leading-7">{message}</p>}
  </section>;
}
