"use client";
import { useQuestionnaireDisplayCopy } from "./TraditionalQuestionnaireCopy";

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

function QuestionModule({ quiz, id, mode, locale, onComplete, onCancel }: {
  quiz: WrittenCoordinationQuiz;
  id: QuestionPart;
  mode: WrittenCoordinationMode;
  locale: Locale;
  onComplete: (record: WrittenCoordinationReadout) => void;
  onCancel: (message: string) => void;
}) {
  const { displayText, traditional } = useQuestionnaireDisplayCopy();
  const zh = locale === "zh", section = quiz.coordination.sections.find(s => s.id === id)!;
  const qs = useMemo(() => quiz.questions.filter(q => q.options[0].directionId === id), [quiz, id]);
  const initialPhase = id === "memory" && mode === "timed" ? "study" : "answer";
  const [started] = useState(now);
  const [stage, setStage] = useState<"study" | "answer">(initialPhase), [position, setPosition] = useState(0);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({}), [remaining, setRemaining] = useState(initialPhase === "study" ? 15 : section.timeCapMs / 1000);
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
    if (mode === "study") return;
    const timer = window.setInterval(checkClock, 100);
    const hidden = () => { if (document.visibilityState === "hidden") cancel(zh ? "进入后台，本部分已取消并清空。" : "Backgrounding cancelled and cleared this section."); };
    document.addEventListener("visibilitychange", hidden);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", hidden); };
  }, [stage, mode, checkClock, cancel, zh]);
  useEffect(() => {
    active.current = { mode, phase: initialPhase, started, studyElapsedMs: 0 };
    const leave = () => { if (active.current) cancel(""); };
    window.addEventListener("pagehide", leave);
    return () => { active.current = null; answerRef.current = {}; window.removeEventListener("pagehide", leave); };
  }, [cancel, mode, initialPhase, started]);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); (stage === "answer" ? questionContext.current : heading.current)?.scrollIntoView({ block: "start" }); }, [stage, position]);
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
    <p className="font-semibold">{section.title[locale]} · {mode === "study" ? (zh ? displayText("不计时学习") : "Untimed study") : (zh ? displayText("本站计时练习") : "Site-timed practice")}</p>
    {sourceVisible && <div data-written-memory-study className="rounded-lg border bg-slate-50 p-4 leading-8"><h3 ref={stage === "study" ? heading : undefined} tabIndex={stage === "study" ? -1 : undefined} className="mb-3 scroll-mt-24 font-semibold outline-none">{stage === "study" ? (zh ? displayText("阅读这则虚构记录") : "Read this fictional note") : (zh ? displayText("可看来源学习：原文保持可见") : "Visible-source study: the note stays available")}</h3>{stage === "study" && <p role="timer" data-written-remaining className="mb-3 font-semibold">{zh ? displayText(`剩余 ${remaining} 秒`) : `${remaining} seconds remaining`}</p>}<p>{quiz.coordination.memoryText[locale]}</p></div>}
    {stage === "study" && <p>{zh ? displayText("呈现结束后自动进入回忆") : "Recall begins automatically after the exposure"}</p>}
    {stage === "answer" && <div ref={questionContext} data-written-question-context className="scroll-mt-24 space-y-5">
      <p>{zh ? displayText(`第 ${position + 1} / 6 题`) : `Question ${position + 1} / 6`}</p>
      {mode === "timed" && <p data-written-remaining role="timer" className="font-semibold">{zh ? displayText(`剩余 ${remaining} 秒`) : `${remaining} seconds remaining`}</p>}
      {id === "memory" && mode === "timed" && <p data-written-exposure className="text-sm leading-7">{zh ? displayText(`记录卡已移除；观察到呈现结束时段 ${(exposure / 1000).toFixed(1)} 秒。`) : `Study card removed; observed exposure end interval ${(exposure / 1000).toFixed(1)} seconds.`}</p>}
      <h3 ref={heading} id="written-active-question" tabIndex={-1} className="scroll-mt-24 whitespace-pre-line text-xl font-semibold leading-8 outline-none">{q.prompt[locale]}</h3>
      {id === "memory" && mode === "study" && <div data-written-memory-study className="rounded-lg border bg-slate-50 p-4 leading-8"><p className="mb-3 font-semibold">{zh ? displayText("可看来源学习：原文保持可见") : "Visible-source study: the note stays available"}</p><p>{quiz.coordination.memoryText[locale]}</p></div>}
      {id === "priority" && <p data-written-priority-rule className="rounded-lg border bg-slate-50 p-4 leading-8">{quiz.coordination.priorityRule[locale]}</p>}
      {id === "map" && <WrittenCoordinationGrid grid={quiz.coordination.grid} locale={locale} traditional={traditional} idPrefix="written-active-grid" />}
      <fieldset className="min-w-0 space-y-3" aria-labelledby="written-active-question">
        {[...q.options.map(o => ({ id: o.id, label: o.label[locale] })), { id: "skip", label: zh ? displayText("明确留空，计为未答") : "Leave unanswered explicitly" }].map(o => <label key={o.id} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-slate-300 p-3 leading-7"><input type="radio" name={q.id} value={o.id} checked={answers[q.id] === o.id} onChange={() => choose(o.id)} className="mt-2 h-5 w-5 shrink-0" /><span className="min-w-0">{o.label}</span></label>)}
      </fieldset>
      <div className="flex flex-wrap gap-3">
        <button type="button" className={button} disabled={position === 0} onClick={() => { if (checkClock() !== null) { setPosition(position - 1); setMessage(""); } }}>{zh ? displayText("上一题") : "Back"}</button>
        <button data-questionnaire-next type="button" className={button} onClick={next}>{position === 5 ? (zh ? displayText("完成本部分") : "Complete this section") : (zh ? displayText("下一题") : "Next")}</button>
      </div>
      <button type="button" className={button} onClick={() => { const elapsed = checkClock(); if (elapsed !== null) finish("finished", elapsed); }}>{zh ? displayText("现在结束，未做题保留未答") : "Finish now; untouched items remain unanswered"}</button>
    </div>}
    <button type="button" className={button} onClick={() => cancel(zh ? displayText("本部分已取消并清空。") : "This section was cancelled and cleared.")}>{zh ? displayText("取消本部分并返回模块") : "Cancel this section and return to modules"}</button>
    {message && <p role="status">{displayText(message)}</p>}
  </section>;
}

export function WrittenCoordinationClient({ quiz, locale }: { quiz: unknown; locale: Locale }) {
  const { displayText } = useQuestionnaireDisplayCopy();
  if (!isWrittenCoordinationConfigurationValid(quiz)) return <p role="status">{locale === "zh" ? displayText("书面练习内容暂不可用。") : "Written practice content is unavailable."}</p>;
  return <ValidWrittenCoordinationClient key={`${locale}:${quiz.version}`} quiz={quiz} locale={locale} />;
}
function ValidWrittenCoordinationClient({ quiz, locale }: { quiz: WrittenCoordinationQuiz; locale: Locale }) {
  const { displayText, traditional } = useQuestionnaireDisplayCopy();
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
    const text = `${quiz.title[locale]}\nhttps://fermatmind.com${questionnairePath(traditional ? "zh-TW" : locale, quiz.slug)}`, snapshot = revision.current;
    try { await navigator.clipboard.writeText(text); if (snapshot === revision.current) setMessage(zh ? "已复制公开标题与入口，不含练习输入或数量。" : "Copied the public title and entry, without exercise input or counts."); }
    catch { if (snapshot === revision.current) { setManual(text); setMessage(zh ? "请从下方手动复制公开链接。" : "Copy the public link below manually."); } }
  }
  const outcome = (value: string) => zh ? displayText({ correct: "正确", wrong: "错误", unanswered: "未答" }[value] ?? value) : value;
  return <section id="take-test" data-written-client aria-busy={!ready} className="my-8 scroll-mt-24 rounded-xl border border-violet-200 bg-white p-5 sm:p-7">
    <p className="mb-5 text-sm leading-7 text-slate-600">{zh ? displayText("只使用虚构材料。输入仅留页面内存，不存草稿、不发答案、不采流程统计；普通页面分析关闭。完成清除原始输入，退出并清除时删除本页全部练习记录。") : "Use fictional material only. Input stays in page memory: no drafts, answer submission or flow statistics. Ordinary page analytics are disabled. Completion clears raw input; exit-and-clear removes all exercise records on this page."}</p>
    <fieldset disabled={!ready} className="min-w-0 space-y-6"><legend className="sr-only">{quiz.title[locale]}</legend>
      {!selected && <>
        <h2 className="text-2xl font-semibold">{zh ? displayText("选择一项独立练习") : "Choose an independent exercise"}</h2>
        <p className="leading-7">{quiz.instructions![locale]}</p>
        <p className="text-sm leading-7">{zh ? displayText("选择下方模块即开始；计时模式的时钟也随即开始，无需再次确认。") : "Selecting a module starts it immediately, including its clock in timed mode, without another confirmation."}</p>
        <fieldset className="space-y-3 rounded-lg border p-4"><legend className="font-semibold">{zh ? displayText("五个问答模块的模式，录入始终60秒") : "Mode for five question modules; entry is always 60 seconds"}</legend>
          {(["timed", "study"] as const).map(value => <label key={value} className="flex min-h-11 items-center gap-3"><input type="radio" name="written-practice-mode" value={value} checked={mode === value} onChange={() => setMode(value)} />{value === "timed" ? (zh ? displayText("本站计时练习") : "Site-timed practice") : (zh ? displayText("不计时学习，记忆题可看原文") : "Untimed study; memory source stays visible")}</label>)}
        </fieldset>
        <div className="grid gap-3 sm:grid-cols-2">{quiz.directions.map(d => <button key={d.id} type="button" data-written-start={d.id} className={`${button} text-left`} onClick={() => { remove(d.id as WrittenCoordinationPart); setSelected(d.id as WrittenCoordinationPart); }}>{d.title[locale]}</button>)}</div>
      </>}
      {selected === "entry" && <WrittenCoordinationEntry round={quiz.coordination.entry} locale={locale} onComplete={completeEntry} onCancel={cancel} />}
      {selected && selected !== "entry" && <QuestionModule key={`${selected}:${mode}`} quiz={quiz} id={selected} mode={mode} locale={locale} onComplete={completeQuestions} onCancel={cancel} />}
      <div className="flex flex-wrap gap-3">
        <button type="button" className={button} onClick={share}>{zh ? displayText("复制公开入口") : "Copy public entry"}</button>
        <button type="button" className={button} onClick={clearAll}>{zh ? displayText("清除全部练习记录") : "Clear all exercise records"}</button>
      </div>
    </fieldset>
    {manual && <label className="my-4 block">{zh ? displayText("手动复制公开入口") : "Public entry for manual copying"}<textarea className="mt-2 min-h-28 w-full rounded border p-3" readOnly value={manual} /></label>}
    {message && <p role="status" className="my-4 leading-7">{displayText(message)}</p>}
    <section className="mt-8 space-y-6" aria-labelledby="written-records-heading"><h2 id="written-records-heading" ref={recordsHeading} tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">{quiz.resultHeading![locale]}</h2>
      <p className="leading-7">{zh ? displayText("单位不同，分别阅读，不产生总体平均、档位、排名或招聘结论。未尝试不等于零分，六篇全文始终开放。") : "Different units stay separate, without an overall average, band, ranking or hiring conclusion. Unattempted is not zero; all six full readings remain open."}</p>
      {(entryRecord || Object.keys(records).length > 0) && <nav className="rounded-xl border border-teal-200 bg-teal-50/60 p-4 sm:p-6" aria-label={zh ? displayText("打开已完成练习的记录") : "Open the records of completed exercises"}>
        <h3 className="text-lg font-semibold text-teal-950">{zh ? displayText("从一项已完成的练习开始复盘") : "Choose a completed exercise to review"}</h3>
        <ul className="mt-3 grid gap-x-6 md:grid-cols-2">
          {quiz.directions.map(direction => {
            if (direction.id === "entry") {
              if (!entryRecord) return null;
              return <li key={direction.id} className="min-w-0 border-t border-teal-200 py-2">
                <a className="inline-flex min-h-11 items-center font-semibold text-teal-950 underline underline-offset-4" href="#written-review-entry">{direction.title[locale]}</a>
                <p className="text-sm leading-6">{zh ? displayText(`一分钟录入 · ${entryRecord.exactFields} 个精确字段`) : `One-minute entry · ${entryRecord.exactFields} exact fields`}</p>
              </li>;
            }
            const record = records[direction.id as QuestionPart];
            if (!record) return null;
            return <li key={direction.id} className="min-w-0 border-t border-teal-200 py-2">
              <a className="inline-flex min-h-11 items-center font-semibold text-teal-950 underline underline-offset-4" href={`#written-review-${direction.id}`}>{direction.title[locale]}</a>
              <p className="text-sm leading-6">{zh ? displayText(`答对 ${record.correct}/6 · 未答 ${record.unanswered}`) : `${record.correct}/6 correct · ${record.unanswered} unanswered`}</p>
            </li>;
          })}
        </ul>
      </nav>}
      {quiz.directions.map(d => {
        const r = d.id === "entry" ? null : records[d.id as QuestionPart];
        return <article key={d.id} id={`written-review-${d.id}`} data-written-module-record={d.id} className="scroll-mt-24 space-y-4 rounded-lg border border-slate-200 p-4"><h3 className="text-xl font-semibold">{d.title[locale]}</h3>
          {d.id === "entry" ? entryRecord ? <div data-written-entry-result className="space-y-3 leading-7">
            <p>{zh ? displayText("本设备本次完整60秒，非招聘或能力等级。") : "This device, this full 60-second round; no hiring or ability level."}</p>
            <p data-written-entry-considered>{zh ? displayText("纳入记录／字段") : "Considered records / fields"}: {entryRecord.attemptedRecords} / {entryRecord.consideredFields}</p>
            <p data-written-entry-exact>{zh ? displayText("精确字段／完整记录") : "Exact fields / complete records"}: {entryRecord.exactFields} / {entryRecord.exactRecords}</p>
            <p data-written-entry-accuracy>{zh ? displayText("字段精确准确率") : "Exact field accuracy"}: {entryRecord.fieldAccuracy === null ? (zh ? displayText("未尝试记录，准确率不适用") : "No attempted records; accuracy unavailable") : `${entryRecord.fieldAccuracy.toFixed(1)}%`}</p>
            <p data-written-entry-output>{zh ? displayText("最终字符／字符KPH（非物理按键）") : "Final characters / character KPH (not physical keystrokes)"}: {entryRecord.enteredCharacters} / {entryRecord.characterKph.toFixed(1)}</p>
            <p>{zh ? displayText("精确字段字符KPH") : "Exact-field character KPH"}: {entryRecord.exactFieldCharacterKph.toFixed(1)}</p>
            <p>{zh ? displayText("一分钟折算不证明能持续一小时；未触及卡不进准确率分母，32卡完成后可能受来源上限限制。") : "A one-minute extrapolation does not establish hour-long output. Untouched cards stay outside the accuracy denominator, and completing all 32 cards can create a source ceiling."}</p>
          </div> : <p data-written-unattempted>{zh ? displayText("未尝试") : "Unattempted"}</p> : r ? <div className="space-y-4 leading-7">
            <p>{r.mode === "study" ? (zh ? displayText("不计时学习") : "Untimed study") : (zh ? displayText("本站计时练习") : "Site-timed practice")}{d.id === "memory" && r.mode === "study" ? (zh ? displayText("；可看来源，不称回忆表现") : "; visible-source study, not a recall performance") : ""}</p>
            <p data-written-counts={d.id}>{zh ? displayText(`正确 ${r.correct}；错误 ${r.wrong}；未答 ${r.unanswered}；共6题。`) : `Correct ${r.correct}; wrong ${r.wrong}; unanswered ${r.unanswered}; total 6.`}</p>
            {r.mode === "timed" && <p className="text-sm">{zh ? displayText(`结束：${r.reason === "expired" ? "到时关闭" : "主动完成"}；观察时段 ${(r.elapsedMs / 1000).toFixed(1)} 秒。`) : `${r.reason === "expired" ? "Closed at expiry" : "Finished explicitly"}; observed interval ${(r.elapsedMs / 1000).toFixed(1)} seconds.`}{d.id === "memory" ? (zh ? displayText(` 呈现结束时段 ${(r.studyElapsedMs / 1000).toFixed(1)} 秒。`) : ` Exposure end interval ${(r.studyElapsedMs / 1000).toFixed(1)} seconds.`) : ""}</p>}
            {d.id === "memory" && <p data-written-memory-review className="rounded bg-slate-50 p-3">{quiz.coordination.memoryText[locale]}</p>}
            <ol className="space-y-5">{r.items.map((item, i) => {
              const q = quiz.questions.find(q => q.id === item.id)!;
              return <li key={item.id} data-written-item-feedback={item.id}><p className="font-semibold">{i + 1}. {outcome(item.outcome)} · {zh ? displayText("正确选项") : "Matching option"}: {q.options.find(o => o.id === q.correctOptionId)!.label[locale]}</p><p className="mt-2">{q.explanation![locale]}</p></li>;
            })}</ol>
          </div> : <p data-written-unattempted>{zh ? displayText("未尝试") : "Unattempted"}</p>}
        </article>;
      })}
    </section>
  </section>;
}
