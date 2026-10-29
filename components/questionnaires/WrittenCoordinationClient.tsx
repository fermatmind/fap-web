"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { Locale } from "@/lib/i18n/locales";
import type { QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { isWrittenCoordinationConfigurationValid, readWrittenCoordinationClock, scoreWrittenCoordinationModule, type WrittenCoordinationMode, type WrittenCoordinationPart, type WrittenCoordinationQuiz, type WrittenCoordinationReadout } from "@/lib/questionnaires/writtenCoordination";
import { questionnairePath } from "@/lib/questionnaires/paths";
import { WrittenCoordinationEntry, type WrittenEntryRecord } from "./WrittenCoordinationEntry";
import { WrittenCoordinationGrid } from "./WrittenCoordinationGrid";

const button = "min-h-12 rounded-lg border border-slate-300 px-4 py-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700 disabled:opacity-50";
const subscribeReady = () => () => {};
const now = () => ({ wall: Date.now(), monotonic: performance.now() });
type QuestionPart = Exclude<WrittenCoordinationPart, "entry">;

function QuestionModule({ quiz, id, mode, locale, onStart, onComplete, onCancel }: {
  quiz: WrittenCoordinationQuiz;
  id: QuestionPart;
  mode: WrittenCoordinationMode;
  locale: Locale;
  onStart: (id: WrittenCoordinationPart) => void;
  onComplete: (record: WrittenCoordinationReadout) => void;
  onCancel: (message: string) => void;
}) {
  const zh = locale === "zh", section = quiz.coordination.sections.find(s => s.id === id)!;
  const qs = useMemo(() => quiz.questions.filter(q => q.options[0].directionId === id), [quiz, id]);
  const [stage, setStage] = useState<"ready" | "study" | "answer">("ready"), [position, setPosition] = useState(0);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({}), [remaining, setRemaining] = useState(section.timeCapMs / 1000);
  const [exposure, setExposure] = useState(0), [message, setMessage] = useState("");
  const answerRef = useRef<QuestionnaireAnswers>({}), heading = useRef<HTMLHeadingElement>(null), questionContext = useRef<HTMLDivElement>(null);
  const active = useRef<{ mode: WrittenCoordinationMode; phase: "study" | "answer"; started: ReturnType<typeof now>; studyElapsedMs: number } | null>(null);
  const cancel = useCallback((notice: string) => {
    active.current = null; answerRef.current = {}; setAnswers({}); onCancel(notice);
  }, [onCancel]);
  const finish = useCallback((reason: "finished" | "expired", elapsedMs: number) => {
    const attempt = active.current; if (!attempt || attempt.phase !== "answer") return;
    active.current = null;
    const result = scoreWrittenCoordinationModule(quiz, id, { mode: attempt.mode, reason, elapsedMs, studyElapsedMs: attempt.studyElapsedMs, answers: answerRef.current });
    answerRef.current = {}; setAnswers({});
    if (result.status === "complete") onComplete(result.result);
    else onCancel(zh ? "本部分无法核对，记录已清除。" : "This section could not be checked and its record was cleared.");
  }, [quiz, id, onComplete, onCancel, zh]);
  const checkClock = useCallback((): number | null => {
    const attempt = active.current; if (!attempt) return null;
    if (attempt.mode === "study") return 0;
    const clock = readWrittenCoordinationClock(attempt.started, now(), attempt.phase === "study" ? 15 : section.timeCapMs / 1000);
    if (clock.status === "invalid") { cancel(zh ? "时钟不一致，本部分已取消并清空。" : "Inconsistent clocks cancelled and cleared this section."); return null; }
    setRemaining(clock.remainingSeconds);
    if (clock.status === "expired") {
      if (attempt.phase === "study") {
        active.current = { mode: attempt.mode, phase: "answer", started: now(), studyElapsedMs: clock.elapsedMs };
        setExposure(clock.elapsedMs); setRemaining(section.timeCapMs / 1000); setPosition(0); setStage("answer");
      } else finish("expired", clock.elapsedMs);
      return null;
    }
    return clock.elapsedMs;
  }, [section.timeCapMs, finish, cancel, zh]);
  useEffect(() => {
    if (stage === "ready" || mode === "study") return;
    const timer = window.setInterval(checkClock, 100);
    const hidden = () => { if (document.visibilityState === "hidden") cancel(zh ? "进入后台，本部分已取消并清空。" : "Backgrounding cancelled and cleared this section."); };
    document.addEventListener("visibilitychange", hidden);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", hidden); };
  }, [stage, mode, checkClock, cancel, zh]);
  useEffect(() => {
    const leave = () => { if (active.current) cancel(""); };
    window.addEventListener("pagehide", leave);
    return () => { active.current = null; answerRef.current = {}; window.removeEventListener("pagehide", leave); };
  }, [cancel]);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); (stage === "answer" ? questionContext.current : heading.current)?.scrollIntoView({ block: "start" }); }, [stage, position]);
  function start() {
    if (active.current) return;
    onStart(id); answerRef.current = {}; setAnswers({}); setMessage(""); setPosition(0); setExposure(0);
    const phase = id === "memory" && mode === "timed" ? "study" : "answer";
    active.current = { mode, phase, started: now(), studyElapsedMs: 0 }; setStage(phase); setRemaining(phase === "study" ? 15 : section.timeCapMs / 1000);
  }
  function choose(value: string) {
    if (active.current?.phase !== "answer" || checkClock() === null) return;
    answerRef.current = { ...answerRef.current, [qs[position].id]: value }; setAnswers(answerRef.current); setMessage("");
  }
  function next() {
    if (active.current?.phase !== "answer") return;
    const elapsed = checkClock(); if (elapsed === null) return;
    if (!Object.hasOwn(answerRef.current, qs[position].id)) { setMessage(zh ? "请选择一个选项或明确留空。" : "Choose an option or explicitly leave this item unanswered."); return; }
    setMessage(""); if (position < 5) setPosition(position + 1); else finish("finished", elapsed);
  }
  const q = qs[position], sourceVisible = id === "memory" && stage === "study";
  return <section data-written-question-module={id} data-written-phase={stage} className="space-y-5">
    <p className="font-semibold">{section.title[locale]} · {mode === "study" ? (zh ? "不计时学习" : "Untimed study") : (zh ? "本站计时练习" : "Site-timed practice")}</p>
    {stage === "ready" && <>
      <h3 ref={heading} tabIndex={-1} className="scroll-mt-24 text-xl font-semibold outline-none">{zh ? "准备好后开始本部分" : "Start this section when you are ready"}</h3>
      <p className="leading-7">{mode === "study" ? (zh ? "六题不计时，记忆模块保留原文，明确为可看来源学习。未答题保留未答；其他模块无需完成。" : "Six untimed questions. The memory module keeps its source visible and is explicitly visible-source study. Missing items stay unanswered; other modules need not be completed.") : id === "memory" ? (zh ? "先以15秒为目标呈现一则英文虚构记录，再移除卡片并给120秒回答六题。浏览器可能延后更新，实际呈现结束时段会显示；不能返回记录卡。" : "A fictional English note has a nominal 15-second exposure, then its card is removed and six questions have a 120-second cap. Browser updates may be delayed; the observed exposure end interval is shown. You cannot return to the study card.") : (zh ? "六道原创题，本站上限180秒。可在同一部分返回修改，时间不暂停；到时未做题保留未答。这不是官方时限或通过标准。" : "Six original questions with a site cap of 180 seconds. Return and revise within the same running clock; untouched items remain unanswered at expiry. This is not an official limit or pass standard.")}</p>
      <button type="button" className={button} onClick={start}>{mode === "study" ? (zh ? "开始不计时学习" : "Start untimed study") : (zh ? "开始计时部分" : "Start timed section")}</button>
    </>}
    {sourceVisible && <div data-written-memory-study className="rounded-lg border bg-slate-50 p-4 leading-8"><h3 ref={stage === "study" ? heading : undefined} tabIndex={stage === "study" ? -1 : undefined} className="mb-3 scroll-mt-24 font-semibold outline-none">{stage === "study" ? (zh ? "阅读这则虚构记录" : "Read this fictional note") : (zh ? "可看来源学习：原文保持可见" : "Visible-source study: the note stays available")}</h3>{stage === "study" && <p role="timer" data-written-remaining className="mb-3 font-semibold">{zh ? `剩余 ${remaining} 秒` : `${remaining} seconds remaining`}</p>}<p>{quiz.coordination.memoryText[locale]}</p></div>}
    {stage === "study" && <p>{zh ? "呈现结束后自动进入回忆" : "Recall begins automatically after the exposure"}</p>}
    {stage === "answer" && <div ref={questionContext} data-written-question-context className="scroll-mt-24 space-y-5">
      <p>{zh ? `第 ${position + 1} / 6 题` : `Question ${position + 1} / 6`}</p>
      {mode === "timed" && <p data-written-remaining role="timer" className="font-semibold">{zh ? `剩余 ${remaining} 秒` : `${remaining} seconds remaining`}</p>}
      {id === "memory" && mode === "timed" && <p data-written-exposure className="text-sm leading-7">{zh ? `记录卡已移除；观察到呈现结束时段 ${(exposure / 1000).toFixed(1)} 秒。` : `Study card removed; observed exposure end interval ${(exposure / 1000).toFixed(1)} seconds.`}</p>}
      <h3 ref={heading} id="written-active-question" tabIndex={-1} className="scroll-mt-24 whitespace-pre-line text-xl font-semibold leading-8 outline-none">{q.prompt[locale]}</h3>
      {id === "memory" && mode === "study" && <div data-written-memory-study className="rounded-lg border bg-slate-50 p-4 leading-8"><p className="mb-3 font-semibold">{zh ? "可看来源学习：原文保持可见" : "Visible-source study: the note stays available"}</p><p>{quiz.coordination.memoryText[locale]}</p></div>}
      {id === "priority" && <p data-written-priority-rule className="rounded-lg border bg-slate-50 p-4 leading-8">{quiz.coordination.priorityRule[locale]}</p>}
      {id === "map" && <WrittenCoordinationGrid grid={quiz.coordination.grid} locale={locale} idPrefix="written-active-grid" />}
      <fieldset className="min-w-0 space-y-3" aria-labelledby="written-active-question">
        {[...q.options.map(o => ({ id: o.id, label: o.label[locale] })), { id: "skip", label: zh ? "明确留空，计为未答" : "Leave unanswered explicitly" }].map(o => <label key={o.id} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-slate-300 p-3 leading-7"><input type="radio" name={q.id} value={o.id} checked={answers[q.id] === o.id} onChange={() => choose(o.id)} className="mt-1.5 h-5 w-5 shrink-0" /><span className="min-w-0">{o.label}</span></label>)}
      </fieldset>
      <div className="flex flex-wrap gap-3">
        <button type="button" className={button} disabled={position === 0} onClick={() => { if (checkClock() !== null) { setPosition(position - 1); setMessage(""); } }}>{zh ? "上一题" : "Back"}</button>
        <button type="button" className={button} onClick={next}>{position === 5 ? (zh ? "完成本部分" : "Complete this section") : (zh ? "下一题" : "Next")}</button>
      </div>
      <button type="button" className={button} onClick={() => { const elapsed = checkClock(); if (elapsed !== null) finish("finished", elapsed); }}>{zh ? "现在结束，未做题保留未答" : "Finish now; untouched items remain unanswered"}</button>
    </div>}
    <button type="button" className={button} onClick={() => cancel(zh ? "本部分已取消并清空。" : "This section was cancelled and cleared.")}>{zh ? "取消本部分并返回模块" : "Cancel this section and return to modules"}</button>
    {message && <p role="status">{message}</p>}
  </section>;
}

export function WrittenCoordinationClient({ quiz, locale }: { quiz: unknown; locale: Locale }) {
  if (!isWrittenCoordinationConfigurationValid(quiz)) return <p role="status">{locale === "zh" ? "书面练习内容暂不可用。" : "Written practice content is unavailable."}</p>;
  return <ValidWrittenCoordinationClient key={`${locale}:${quiz.version}`} quiz={quiz} locale={locale} />;
}
function ValidWrittenCoordinationClient({ quiz, locale }: { quiz: WrittenCoordinationQuiz; locale: Locale }) {
  const zh = locale === "zh", ready = useSyncExternalStore(subscribeReady, () => true, () => false);
  const [selected, setSelected] = useState<WrittenCoordinationPart | null>(null), [mode, setMode] = useState<WrittenCoordinationMode>("timed");
  const [entryRecord, setEntryRecord] = useState<WrittenEntryRecord | null>(null), [records, setRecords] = useState<Partial<Record<QuestionPart, WrittenCoordinationReadout>>>({});
  const [message, setMessage] = useState(""), [manual, setManual] = useState("");
  const revision = useRef(0), recordsHeading = useRef<HTMLHeadingElement>(null);
  const clearAll = useCallback(() => { revision.current++; setSelected(null); setMode("timed"); setEntryRecord(null); setRecords({}); setManual(""); setMessage(""); }, []);
  const remove = useCallback((id: WrittenCoordinationPart) => {
    revision.current++; setManual(""); setMessage("");
    if (id === "entry") setEntryRecord(null);
    else setRecords(old => { const next = { ...old }; delete next[id]; return next; });
  }, []);
  const cancel = useCallback((notice: string) => { revision.current++; setSelected(null); setManual(""); setMessage(notice); }, []);
  const focusRecord = useCallback(() => window.requestAnimationFrame(() => { recordsHeading.current?.focus(); recordsHeading.current?.scrollIntoView({ block: "start" }); }), []);
  const completeEntry = useCallback((record: WrittenEntryRecord) => { setEntryRecord(record); setSelected(null); setManual(""); setMessage(""); focusRecord(); }, [focusRecord]);
  const completeQuestions = useCallback((record: WrittenCoordinationReadout) => { setRecords(old => ({ ...old, [record.id]: record })); setSelected(null); setManual(""); setMessage(""); focusRecord(); }, [focusRecord]);
  useEffect(() => {
    const generation = revision;
    const leave = () => clearAll(), restore = (event: PageTransitionEvent) => { if (event.persisted) clearAll(); };
    window.addEventListener("pagehide", leave); window.addEventListener("pageshow", restore);
    return () => { generation.current++; window.removeEventListener("pagehide", leave); window.removeEventListener("pageshow", restore); };
  }, [clearAll]);
  async function share() {
    const text = `${quiz.title[locale]}\nhttps://fermatmind.com${questionnairePath(locale, quiz.slug)}`, snapshot = revision.current;
    try { await navigator.clipboard.writeText(text); if (snapshot === revision.current) setMessage(zh ? "已复制公开标题与入口，不含练习输入或数量。" : "Copied the public title and entry, without exercise input or counts."); }
    catch { if (snapshot === revision.current) { setManual(text); setMessage(zh ? "请从下方手动复制公开链接。" : "Copy the public link below manually."); } }
  }
  const outcome = (value: string) => zh ? ({ correct: "正确", wrong: "错误", unanswered: "未答" }[value] ?? value) : value;
  return <section id="take-test" data-written-client aria-busy={!ready} className="my-8 scroll-mt-24 rounded-xl border border-violet-200 bg-white p-5 sm:p-7">
    <p className="mb-5 text-sm leading-7 text-slate-600">{zh ? "只使用虚构材料。输入仅留页面内存，不存草稿、不发答案、不采流程统计；普通页面分析关闭。完成清除原始输入，退出并清除时删除本页全部练习记录。" : "Use fictional material only. Input stays in page memory: no drafts, answer submission or flow statistics. Ordinary page analytics are disabled. Completion clears raw input; exit-and-clear removes all exercise records on this page."}</p>
    <fieldset disabled={!ready} className="min-w-0 space-y-6"><legend className="sr-only">{quiz.title[locale]}</legend>
      {!selected && <>
        <h2 className="text-2xl font-semibold">{zh ? "选择一项独立练习" : "Choose an independent exercise"}</h2>
        <fieldset className="space-y-3 rounded-lg border p-4"><legend className="font-semibold">{zh ? "五个问答模块的模式，录入始终60秒" : "Mode for five question modules; entry is always 60 seconds"}</legend>
          {(["timed", "study"] as const).map(value => <label key={value} className="flex min-h-11 items-center gap-3"><input type="radio" name="written-practice-mode" value={value} checked={mode === value} onChange={() => setMode(value)} />{value === "timed" ? (zh ? "本站计时练习" : "Site-timed practice") : (zh ? "不计时学习，记忆题可看原文" : "Untimed study; memory source stays visible")}</label>)}
        </fieldset>
        <div className="grid gap-3 sm:grid-cols-2">{quiz.directions.map(d => <button key={d.id} type="button" data-written-start={d.id} className={`${button} text-left`} onClick={() => { remove(d.id as WrittenCoordinationPart); setSelected(d.id as WrittenCoordinationPart); }}>{d.title[locale]}</button>)}</div>
      </>}
      {selected === "entry" && <WrittenCoordinationEntry round={quiz.coordination.entry} locale={locale} onStart={remove} onComplete={completeEntry} onCancel={cancel} />}
      {selected && selected !== "entry" && <QuestionModule key={`${selected}:${mode}`} quiz={quiz} id={selected} mode={mode} locale={locale} onStart={remove} onComplete={completeQuestions} onCancel={cancel} />}
      <div className="flex flex-wrap gap-3"><button type="button" className={button} onClick={share}>{zh ? "复制公开入口" : "Copy public entry"}</button><button type="button" className={button} onClick={clearAll}>{zh ? "退出并清除全部练习记录" : "Exit and clear all exercise records"}</button></div>
    </fieldset>
    {manual && <label className="my-4 block">{zh ? "手动复制公开入口" : "Public entry for manual copying"}<textarea className="mt-2 min-h-28 w-full rounded border p-3" readOnly value={manual} /></label>}
    {message && <p role="status" className="my-4 leading-7">{message}</p>}
    <section className="mt-8 space-y-6" aria-labelledby="written-records-heading"><h2 id="written-records-heading" ref={recordsHeading} tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
      <p className="leading-7">{zh ? "单位不同，分别阅读，不产生总体平均、档位、排名或招聘结论。未尝试不等于零分，六篇全文始终开放。" : "Different units stay separate, without an overall average, band, ranking or hiring conclusion. Unattempted is not zero; all six full readings remain open."}</p>
      {quiz.directions.map(d => {
        const r = d.id === "entry" ? null : records[d.id as QuestionPart];
        return <article key={d.id} data-written-module-record={d.id} className="space-y-4 rounded-lg border border-slate-200 p-4"><h3 className="text-xl font-semibold">{d.title[locale]}</h3>
          {d.id === "entry" ? entryRecord ? <div data-written-entry-result className="space-y-3 leading-7">
            <p>{zh ? "本设备本次完整60秒，非招聘或能力等级。" : "This device, this full 60-second round; no hiring or ability level."}</p>
            <p data-written-entry-considered>{zh ? "纳入记录／字段" : "Considered records / fields"}: {entryRecord.attemptedRecords} / {entryRecord.consideredFields}</p>
            <p data-written-entry-exact>{zh ? "精确字段／完整记录" : "Exact fields / complete records"}: {entryRecord.exactFields} / {entryRecord.exactRecords}</p>
            <p data-written-entry-accuracy>{zh ? "字段精确准确率" : "Exact field accuracy"}: {entryRecord.fieldAccuracy === null ? (zh ? "未尝试记录，准确率不适用" : "No attempted records; accuracy unavailable") : `${entryRecord.fieldAccuracy.toFixed(1)}%`}</p>
            <p data-written-entry-output>{zh ? "最终字符／字符KPH（非物理按键）" : "Final characters / character KPH (not physical keystrokes)"}: {entryRecord.enteredCharacters} / {entryRecord.characterKph.toFixed(1)}</p>
            <p>{zh ? "精确字段字符KPH" : "Exact-field character KPH"}: {entryRecord.exactFieldCharacterKph.toFixed(1)}</p>
            <p>{zh ? "一分钟折算不证明能持续一小时；未触及卡不进准确率分母，32卡完成后可能受来源上限限制。" : "A one-minute extrapolation does not establish hour-long output. Untouched cards stay outside the accuracy denominator, and completing all 32 cards can create a source ceiling."}</p>
          </div> : <p data-written-unattempted>{zh ? "未尝试" : "Unattempted"}</p> : r ? <div className="space-y-4 leading-7">
            <p>{r.mode === "study" ? (zh ? "不计时学习" : "Untimed study") : (zh ? "本站计时练习" : "Site-timed practice")}{d.id === "memory" && r.mode === "study" ? (zh ? "；可看来源，不称回忆表现" : "; visible-source study, not a recall performance") : ""}</p>
            <p data-written-counts={d.id}>{zh ? `正确 ${r.correct}；错误 ${r.wrong}；未答 ${r.unanswered}；共6题。` : `Correct ${r.correct}; wrong ${r.wrong}; unanswered ${r.unanswered}; total 6.`}</p>
            {r.mode === "timed" && <p className="text-sm">{zh ? `结束：${r.reason === "expired" ? "到时关闭" : "主动完成"}；观察时段 ${(r.elapsedMs / 1000).toFixed(1)} 秒。` : `${r.reason === "expired" ? "Closed at expiry" : "Finished explicitly"}; observed interval ${(r.elapsedMs / 1000).toFixed(1)} seconds.`}{d.id === "memory" ? (zh ? ` 呈现结束时段 ${(r.studyElapsedMs / 1000).toFixed(1)} 秒。` : ` Exposure end interval ${(r.studyElapsedMs / 1000).toFixed(1)} seconds.`) : ""}</p>}
            {d.id === "memory" && <p data-written-memory-review className="rounded bg-slate-50 p-3">{quiz.coordination.memoryText[locale]}</p>}
            <ol className="space-y-5">{r.items.map((item, i) => {
              const q = quiz.questions.find(q => q.id === item.id)!;
              return <li key={item.id} data-written-item-feedback={item.id}><p className="font-semibold">{i + 1}. {outcome(item.outcome)} · {zh ? "正确选项" : "Matching option"}: {q.options.find(o => o.id === q.correctOptionId)!.label[locale]}</p><p className="mt-2">{q.explanation![locale]}</p></li>;
            })}</ol>
          </div> : <p data-written-unattempted>{zh ? "未尝试" : "Unattempted"}</p>}
        </article>;
      })}
    </section>
  </section>;
}
