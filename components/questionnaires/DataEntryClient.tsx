"use client";
import { useEntertainmentMetrics, useEntertainmentResultView } from "@/components/entertainment/useEntertainmentMetrics";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";
import { DATA_ENTRY_DURATION_MS, dataEntryCharacters, isDataEntryConfigurationValid, normalizeDataEntryText, scoreDataEntryRound, type DataEntryConfiguration, type DataEntryResult, type DataEntryError } from "@/lib/questionnaires/dataEntry";
import { QuestionnaireReport } from "./QuestionnaireReport";

const button = "min-h-12 rounded-lg border border-slate-300 px-4 py-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700 disabled:opacity-50";
const subscribeReady = () => () => {};
type Active = { mode: number; started: number; wallStarted: number; rows: Map<string, string[]> };
type Complete = Extract<DataEntryResult, { status: "complete" }>;

export function DataEntryClient({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  if (!isDataEntryConfigurationValid(quiz)) return <p role="status">{locale === "zh" ? "录入练习配置或浏览器字符支持暂不可用。" : "Entry configuration or browser character support is unavailable."}</p>;
  return <ValidDataEntryClient quiz={quiz} locale={locale} />;
}
function ValidDataEntryClient({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  const { start: recordStart, complete: recordComplete, view: recordView, consent: activityConsent, share: recordShare } = useEntertainmentMetrics(quiz.slug, quiz.version, locale, true);
  const ready = useSyncExternalStore(subscribeReady, () => true, () => false), zh = locale === "zh";
  const config = (quiz as Questionnaire & { dataEntry: DataEntryConfiguration }).dataEntry;
  const [mode, setMode] = useState(0), [recordIndex, setRecordIndex] = useState(0), [phase, setPhase] = useState<"ready" | "running" | "result">("ready");
  const [values, setValues] = useState(["", "", "", ""]), [remaining, setRemaining] = useState(DATA_ENTRY_DURATION_MS), [composingField, setComposingField] = useState<number | null>(null);
  const [message, setMessage] = useState(""), [finished, setFinished] = useState<Complete | null>(null), [manual, setManual] = useState("");
  const active = useRef<Active | null>(null), composing = useRef<number | null>(null), inputs = useRef<(HTMLInputElement | null)[]>([]), heading = useRef<HTMLHeadingElement>(null), runningHeading = useRef<HTMLHeadingElement>(null);
  const round = config.rounds[mode], record = round.records[recordIndex];
  const reset = useCallback((reason = "") => {
    active.current = null; composing.current = null; setComposingField(null); setValues(["", "", "", ""]); setRecordIndex(0);
    setRemaining(DATA_ENTRY_DURATION_MS); setFinished(null); setManual(""); setMessage(reason); setPhase("ready");
  }, []);
  const finish = useCallback((elapsed: number) => {
    const attempt = active.current; if (!attempt || elapsed < DATA_ENTRY_DURATION_MS) return;
    const result = scoreDataEntryRound(config.rounds[attempt.mode], Array.from(attempt.rows, ([recordId, values]) => ({ recordId, values })), elapsed);
    active.current = null; composing.current = null; setComposingField(null); setValues(["", "", "", ""]); setRemaining(0);
    if (result.status !== "complete") { reset(zh ? "本轮输入无法核对，已清空，请重新开始。" : "This round could not be checked and was cleared. Start again."); return; }
    setFinished(result); setMessage(""); setPhase("result"); recordComplete();
  }, [config.rounds, reset, zh, recordComplete]);
  const current = useCallback(() => {
    const attempt = active.current; if (!attempt) return null;
    const elapsed = Math.max(0, performance.now() - attempt.started), wallElapsed = Date.now() - attempt.wallStarted;
    if (Math.abs(wallElapsed - elapsed) > 1500) { reset(zh ? "时钟发生明显偏差，本轮已取消并清空。" : "A clock divergence cancelled and cleared this round."); return null; }
    if (elapsed >= DATA_ENTRY_DURATION_MS) { finish(elapsed); return null; }
    return attempt;
  }, [finish, reset, zh]);
  useEffect(() => {
    if (phase !== "running") return;
    const tick = window.setInterval(() => { const attempt = current(); if (attempt) setRemaining(Math.max(0, DATA_ENTRY_DURATION_MS - (performance.now() - attempt.started))); }, 100);
    return () => window.clearInterval(tick);
  }, [current, phase]);
  useEffect(() => {
    const hidden = () => { if (document.visibilityState === "hidden" && active.current) reset(zh ? "页面进入后台，本轮已取消并清空。" : "Moving to the background cancelled and cleared this round."); };
    const leave = () => { if (active.current) reset(); };
    const restore = (event: PageTransitionEvent) => { if (event.persisted) reset(); };
    document.addEventListener("visibilitychange", hidden); window.addEventListener("pagehide", leave); window.addEventListener("pageshow", restore);
    return () => { document.removeEventListener("visibilitychange", hidden); window.removeEventListener("pagehide", leave); window.removeEventListener("pageshow", restore); active.current = null; };
  }, [reset, zh]);
  useEffect(() => {
    if (phase === "running") { inputs.current[0]?.focus({ preventScroll: true }); runningHeading.current?.scrollIntoView({ block: "start" }); }
    if (phase === "result") heading.current?.focus();
  }, [phase, recordIndex]);
  function start() {
    reset(); active.current = { mode, started: performance.now(), wallStarted: Date.now(), rows: new Map() }; setPhase("running"); recordStart();
  }
  function change(field: number, value: string, isComposing: boolean) {
    const attempt = current(); if (!attempt) return;
    const normalized = normalizeDataEntryText(value).replace(/[\u0000-\u001f\u007f]/g, "");
    const limited = dataEntryCharacters(normalized).slice(0, 64).join("");
    setValues(old => old.map((v, i) => i === field ? limited : v));
    if (isComposing) return;
    const next = [...(attempt.rows.get(record.id) ?? ["", "", "", ""])]; next[field] = limited; attempt.rows.set(record.id, next);
  }
  function navigate(nextIndex: number, mark: boolean) {
    const attempt = current(); if (!attempt || composing.current !== null) return;
    if (mark && !attempt.rows.has(record.id)) attempt.rows.set(record.id, ["", "", "", ""]);
    const next = Math.max(0, Math.min(round.records.length - 1, nextIndex)); setRecordIndex(next);
    setValues([...(attempt.rows.get(round.records[next].id) ?? ["", "", "", ""])]);
    if (next === recordIndex) inputs.current[0]?.focus();
  }
  async function share() {
    const text = `${quiz.title[locale]}\nhttps://fermatmind.com/${locale}/tests/explore/${quiz.slug}`;
    try { await navigator.clipboard.writeText(text); recordShare(); setMessage(zh ? "已复制公开练习链接。" : "Public practice link copied."); }
    catch { setManual(text); setMessage(zh ? "无法自动复制，可在下方手动复制。" : "Automatic copying is unavailable; copy the text below."); }
  }
  const labels: Record<DataEntryError, string> = zh ? { blank: "空字段", "case-spacing": "大小写或空白差异", transposition: "一对相邻字符颠倒", omission: "仅漏字符", addition: "仅多字符", other: "其他差异" }
    : { blank: "Blank field", "case-spacing": "Case or whitespace difference", transposition: "One adjacent transposition", omission: "Characters omitted only", addition: "Characters added only", other: "Other difference" };
  useEntertainmentResultView(recordView, phase === "result");
  return <section id="take-test" className="my-8 scroll-mt-24 rounded-xl border border-violet-200 bg-white p-5 sm:p-8" aria-label={zh ? "60秒结构化录入练习" : "60-second structured entry practice"}>
    {activityConsent}
    {phase !== "result" && <>
      <label htmlFor="data-entry-mode" className="mb-2 block font-semibold">{zh ? "选择记录模式，两语界面使用相同原始字段" : "Choose records; both interface languages use identical source values"}</label>
      <select id="data-entry-mode" className="mb-5 min-h-12 w-full rounded-lg border border-slate-400 p-3" value={mode} disabled={phase !== "ready"} onChange={event => { reset(); setMode(Number(event.target.value)); }}>{config.rounds.map((r, i) => <option key={r.id} value={i}>{r.title[locale]}</option>)}</select>
      <h2 ref={runningHeading} className="scroll-mt-24 text-2xl font-semibold">{round.title[locale]}</h2>
      <p className="my-3 font-semibold" data-data-entry-remaining role="timer" aria-label={zh ? "剩余秒数" : "Seconds remaining"}>{zh ? `剩余${Math.ceil(remaining / 1000)}秒` : `${Math.ceil(remaining / 1000)} seconds remaining`}</p>
      <progress className="h-3 w-full" value={remaining} max={DATA_ENTRY_DURATION_MS} aria-label={zh ? "剩余时间" : "Time remaining"} />
      {phase === "ready" && <p className="my-4 leading-7 text-slate-700">{zh ? "对照下方虚构源字段原样录入，不填自己的资料。每种模式32条、每条4字段；任一字段提交过文本改动或点下一条，会把该记录全部4字段（包括空字段）纳入准确率。未触及记录不扣分。可在60秒内返回改答；到末条仍须等待计时结束。" : "Copy the fictional source values below; do not enter your own information. Each mode has 32 records of four fields. Committing an edit in any field or choosing Next includes all four fields of that record, including blanks, in accuracy. Untouched records are excluded. Return and correct within 60 seconds; reaching the last record still requires waiting for the timer."}</p>}
      {phase === "ready" && <button type="button" className={`${button} w-full bg-violet-700 text-white`} disabled={!ready} onClick={start}>{zh ? "开始60秒录入" : "Start 60-second entry"}</button>}
      <form className="mt-5" onSubmit={event => { event.preventDefault(); if (phase === "running") navigate(recordIndex + 1, true); }}>
        <p className="mb-4 font-semibold" data-data-entry-record>{zh ? `记录${recordIndex + 1} / 32` : `Record ${recordIndex + 1} / 32`}</p>
        <div className="space-y-5">{round.fields.map((field, index) => <div key={field.id}>
          <label className="mb-2 block font-semibold" htmlFor={`data-entry-field-${index}`}>{field.title[locale]}</label>
          <p id={`data-entry-source-${index}`} data-data-entry-source className="mb-2 whitespace-pre-wrap break-all rounded border border-slate-200 bg-slate-50 p-3 font-mono text-lg">{record.values[index]}</p>
          <input ref={element => { inputs.current[index] = element; }} id={`data-entry-field-${index}`} className="min-h-12 w-full scroll-mt-24 rounded border border-slate-400 p-3 text-lg focus-visible:outline-2 focus-visible:outline-violet-700" type="text" inputMode="text" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} maxLength={256} value={values[index]} disabled={phase !== "running"} aria-describedby={`data-entry-source-${index} data-entry-input-note`} onPaste={event => { event.preventDefault(); setMessage(zh ? "本练习禁止粘贴，请逐字段录入。" : "Pasting is blocked; type each field."); }} onDrop={event => { event.preventDefault(); setMessage(zh ? "本练习禁止拖入文字。" : "Dropping text is blocked."); }} onChange={event => change(index, event.target.value, composing.current === index || (event.nativeEvent as InputEvent).isComposing)} onCompositionStart={() => { if (current()) { composing.current = index; setComposingField(index); } }} onCompositionEnd={event => { composing.current = null; setComposingField(null); change(index, event.currentTarget.value, false); }} onKeyDown={event => { if (event.key === "Enter" && (composing.current !== null || event.nativeEvent.isComposing)) event.preventDefault(); }} />
        </div>)}</div>
        {phase === "running" && <div className="my-5 flex flex-wrap gap-3"><button type="button" className={button} disabled={recordIndex === 0 || composingField !== null} onClick={() => navigate(recordIndex - 1, false)}>{zh ? "上一条并修改" : "Previous and revise"}</button><button type="submit" className={button} disabled={composingField !== null}>{recordIndex === 31 ? (zh ? "将末条计入并继续核对" : "Include last record and keep checking") : (zh ? "下一条（空字段也计入）" : "Next (include blank fields)")}</button></div>}
      </form>
      <p id="data-entry-input-note" className="my-4 text-sm leading-7 text-slate-600">{zh ? "按最终已提交文本核对，大小写、空格、前导零和标点均须相同；每字段上限64个字符。退格、修正允许，但删掉的文字不算字符产量，修改耗时仍在计时内。未完成输入法组合文字不计入。设备、软键盘建议和输入法会改变条件，本工具不做跨设备排名或防作弊认证。" : "Final committed text is checked exactly, including case, spacing, leading zeros and punctuation; each field is capped at 64 characters. Backspace and corrections are allowed, but deleted text does not count as output and correction time remains inside the clock. Unfinished IME composition is excluded. Devices, keyboard suggestions and input methods change conditions; this tool provides no cross-device ranking or proctoring certification."}</p>
      {phase === "running" && <button type="button" className={button} onClick={() => reset(zh ? "本轮已取消并清空。" : "Round cancelled and cleared.")}>{zh ? "取消并清空本轮" : "Cancel and clear this round"}</button>}
      <p className="mt-4 text-sm leading-7 text-slate-600">{zh ? "页面进入后台、离开或时钟明显偏差会取消本轮；刷新丢失进度。输入只在页面内存中，不保存草稿、不发服务器、不进URL或分析事件。完成后清空原始输入，仅在本页保留汇总数字。" : "Backgrounding, leaving the page or a clock divergence cancels the round; refreshing loses progress. Input stays in page memory, without drafts, server submission, URL content or analytics events. Completion clears raw input and retains aggregate numbers only on this page."}</p>
    </>}
    {phase === "result" && finished && <div data-data-entry-result data-observed-elapsed-ms={finished.observedElapsedMs}>
      <h2 ref={heading} tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold">{quiz.resultHeading![locale]}</h2>
      <p className="my-4 leading-7">{zh ? `本次60秒 · ${round.title.zh} · 仅本设备本次条件；不是招聘、资格或能力等级。` : `This 60-second round · ${round.title.en} · This device and attempt only; no hiring, qualification or ability band.`}</p>
      <dl className="grid gap-4 sm:grid-cols-2">
        <div><dt>{zh ? "纳入记录／字段" : "Considered records / fields"}</dt><dd data-data-entry-considered>{finished.attemptedRecords} / {finished.consideredFields}</dd></div>
        <div><dt>{zh ? "精确字段／完整记录" : "Exact fields / complete records"}</dt><dd data-data-entry-exact>{finished.exactFields} / {finished.exactRecords}</dd></div>
        <div><dt>{zh ? "字段精确准确率" : "Exact field accuracy"}</dt><dd data-data-entry-accuracy>{finished.fieldAccuracy === null ? (zh ? "未尝试记录，准确率不适用" : "No attempted records; accuracy not applicable") : `${finished.fieldAccuracy.toFixed(1)}%`}</dd></div>
        <div><dt>{zh ? "最终录入字符数" : "Final entered characters"}</dt><dd data-data-entry-characters>{finished.enteredCharacters}</dd></div>
        <div><dt>{zh ? "字符KPH（非物理按键）" : "Character KPH (not physical keystrokes)"}</dt><dd data-data-entry-kph>{finished.characterKph.toFixed(1)}</dd></div>
        <div><dt>{zh ? "精确字段字符KPH" : "Exact-field character KPH"}</dt><dd data-data-entry-exact-kph>{finished.exactFieldCharacterKph.toFixed(1)}</dd></div>
        <div><dt>{zh ? "精确字段／小时折算" : "Exact fields per hour, extrapolated"}</dt><dd>{finished.exactFieldsPerHour.toFixed(1)}</dd></div>
      </dl>
      <p className="my-5 leading-7 text-slate-600">{zh ? "字符KPH=60秒内最终录入字符数×60；精确字段字符KPH只计算整字段精确匹配的字符。字段准确率=精确字段数÷纳入字段数。它们是不同单位，没有相乘成一个等级。一分钟折算不证明能持续一小时。" : "Character KPH equals final characters entered in 60 seconds × 60. Exact-field character KPH counts characters only in wholly matching fields. Field accuracy is exact fields divided by considered fields. These are separate units, not multiplied into a band. A one-minute extrapolation does not establish hour-long performance."}</p>
      <h3 className="text-xl font-semibold">{zh ? "错误字段的文本差异" : "Text differences in incorrect fields"}</h3><ul className="my-4 space-y-2">{(Object.keys(labels) as DataEntryError[]).map(key => <li key={key} data-data-entry-error={key}>{labels[key]}: {finished.errors[key]}</li>)}</ul>
      <p className="my-4 text-sm leading-7 text-slate-600">{zh ? "每错字段按上述顺序归入第一个匹配描述，大小写和空白先于漏字、多字；不是失误原因诊断。未触及的后续记录没有加入分母。全部32条记录都完成时，来源上限可能限制产量。" : "Each incorrect field uses the first matching description in the displayed order; case or whitespace differences precede omissions and additions. This does not diagnose the cause of an error. Untouched later records are excluded. Completing all 32 records may make the source cap limit output."}</p>
      <div className="my-5 flex flex-wrap gap-3"><button type="button" className={button} onClick={() => reset()}>{zh ? "重新选择并练习" : "Choose again and practise"}</button><button type="button" className={button} onClick={share}>{zh ? "复制公开练习链接" : "Copy public practice link"}</button></div>
      {manual && <label className="block">{zh ? "可手动复制的公开链接" : "Public link for manual copying"}<textarea readOnly rows={3} value={manual} className="mt-2 w-full rounded border p-3" /></label>}
      <h3 className="my-5 text-xl font-semibold">{zh ? "两份完整复习指南" : "Both complete revision guides"}</h3>
      {quiz.profiles.map(profile => <article key={profile.id} data-data-entry-guide={profile.id} className="my-5 border-t border-slate-200 pt-5"><h3 className="mb-4 text-xl font-semibold">{profile.title[locale]}</h3><QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`data-entry-${profile.id}`} /><Link prefetch={false} className="my-4 inline-block underline" href={`/${locale}/tests/explore/${quiz.slug}/results/${profile.id}`}>{zh ? "打开公开专题页" : "Open the public topic page"}</Link></article>)}
    </div>}
    <p role="status" aria-live="polite" className="mt-4 leading-7 text-violet-800">{message}</p>
  </section>;
}
