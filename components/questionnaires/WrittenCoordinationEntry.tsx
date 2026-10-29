"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/locales";
import { dataEntryCharacters, normalizeDataEntryText, scoreDataEntryRound, type DataEntryRound, type DataEntryResult } from "@/lib/questionnaires/dataEntry";
import { readWrittenCoordinationClock, type WrittenCoordinationPart } from "@/lib/questionnaires/writtenCoordination";

export type WrittenEntryRecord = Extract<DataEntryResult, { status: "complete" }>;
const button = "min-h-12 rounded-lg border border-slate-300 px-4 py-3 font-medium disabled:opacity-50";
const now = () => ({ wall: Date.now(), monotonic: performance.now() });

export function WrittenCoordinationEntry({ round, locale, onStart, onComplete, onCancel }: {
  round: DataEntryRound;
  locale: Locale;
  onStart: (id: WrittenCoordinationPart) => void;
  onComplete: (record: WrittenEntryRecord) => void;
  onCancel: (message: string) => void;
}) {
  const zh = locale === "zh", [running, setRunning] = useState(false), [position, setPosition] = useState(0);
  const [values, setValues] = useState(["", "", "", ""]), [remaining, setRemaining] = useState(60), [composing, setComposing] = useState(false), [message, setMessage] = useState("");
  const active = useRef<{ started: ReturnType<typeof now>; rows: Map<string, string[]> } | null>(null);
  const composition = useRef<number | null>(null), fields = useRef<(HTMLInputElement | null)[]>([]), heading = useRef<HTMLHeadingElement>(null);
  const record = round.records[position];
  const cancel = useCallback((notice: string) => {
    active.current = null; composition.current = null; setValues(["", "", "", ""]); setRunning(false); setComposing(false); onCancel(notice);
  }, [onCancel]);
  const finish = useCallback((elapsed: number) => {
    const attempt = active.current; if (!attempt) return;
    active.current = null;
    const result = scoreDataEntryRound(round, Array.from(attempt.rows, ([recordId, values]) => ({ recordId, values })), elapsed);
    attempt.rows.clear(); composition.current = null; setValues(["", "", "", ""]); setRunning(false); setComposing(false);
    if (result.status === "complete") onComplete(result);
    else onCancel(zh ? "本轮无法核对，已清空。" : "This round could not be checked and was cleared.");
  }, [round, onComplete, onCancel, zh]);
  const current = useCallback(() => {
    const attempt = active.current; if (!attempt) return null;
    const clock = readWrittenCoordinationClock(attempt.started, now(), 60);
    if (clock.status === "invalid") { cancel(zh ? "时钟不一致，本轮已取消并清空。" : "Inconsistent clocks cancelled and cleared this round."); return null; }
    setRemaining(clock.remainingSeconds);
    if (clock.status === "expired") { finish(clock.elapsedMs); return null; }
    return attempt;
  }, [cancel, finish, zh]);
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(current, 100);
    const hidden = () => { if (document.visibilityState === "hidden") cancel(zh ? "进入后台，本轮已取消并清空。" : "Backgrounding cancelled and cleared this round."); };
    document.addEventListener("visibilitychange", hidden);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", hidden); };
  }, [running, current, cancel, zh]);
  useEffect(() => {
    const leave = () => { if (active.current) cancel(""); };
    window.addEventListener("pagehide", leave);
    return () => { active.current?.rows.clear(); active.current = null; window.removeEventListener("pagehide", leave); };
  }, [cancel]);
  useEffect(() => {
    if (running) { heading.current?.scrollIntoView({ block: "start" }); fields.current[0]?.focus({ preventScroll: true }); }
  }, [running, position]);
  function start() {
    if (active.current) return;
    onStart("entry"); active.current = { started: now(), rows: new Map() }; setPosition(0); setValues(["", "", "", ""]); setRemaining(60); setMessage(""); setRunning(true);
  }
  function change(index: number, value: string, isComposing: boolean) {
    const attempt = current(); if (!attempt) return;
    const normalized = dataEntryCharacters(normalizeDataEntryText(value).replace(/[\u0000-\u001f\u007f]/g, "")).slice(0, 64).join("");
    setValues(old => old.map((v, i) => i === index ? normalized : v));
    if (isComposing) return;
    const next = [...(attempt.rows.get(record.id) ?? ["", "", "", ""])]; next[index] = normalized; attempt.rows.set(record.id, next);
  }
  function move(index: number, include: boolean) {
    const attempt = current(); if (!attempt || composition.current !== null) return;
    if (include && !attempt.rows.has(record.id)) attempt.rows.set(record.id, ["", "", "", ""]);
    const next = Math.max(0, Math.min(31, index)); setPosition(next); setValues([...(attempt.rows.get(round.records[next].id) ?? ["", "", "", ""])]);
  }
  return <section data-written-entry className="space-y-5" aria-label={zh ? "60秒虚构请求卡录入" : "60-second fictional request-card entry"}>
    <h3 ref={heading} tabIndex={-1} className="scroll-mt-24 text-xl font-semibold outline-none">{round.title[locale]}</h3>
    <p className="leading-7">{zh ? "32张虚构卡，每张四字段。大小写、空格、标点和前导零须原样相同。任一字段提交改动或点下一卡，会将整卡四字段含空白纳入；未触及卡排除。完整60秒后才算字符KPH，不使用真实个人或工作资料。" : "32 fictional cards, four fields each. Match case, spaces, punctuation and leading zeros. Committing any edit or choosing Next includes all four fields of that card, including blanks; untouched cards are excluded. Character KPH requires the full 60 seconds. Do not use personal or real work details."}</p>
    <p role="timer" data-written-entry-time className="font-semibold">{zh ? `剩余 ${remaining} 秒` : `${remaining} seconds remaining`}</p>
    {!running && <button type="button" className={button} onClick={start}>{zh ? "开始60秒录入" : "Start 60-second entry"}</button>}
    <form onSubmit={event => { event.preventDefault(); move(position + 1, true); }} className="space-y-5">
      <p data-written-entry-card className="font-semibold">{zh ? `卡片 ${position + 1} / 32` : `Card ${position + 1} / 32`}</p>
      {round.fields.map((field, index) => <div key={field.id}>
        <label htmlFor={`written-entry-${field.id}`} className="mb-2 block font-semibold">{field.title[locale]}</label>
        <p id={`written-source-${field.id}`} data-written-entry-source className="mb-2 break-all rounded border bg-slate-50 p-3 font-mono">{record.values[index]}</p>
        <input ref={element => { fields.current[index] = element; }} id={`written-entry-${field.id}`} type="text" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} maxLength={256}
          className="min-h-12 w-full min-w-0 scroll-mt-24 rounded border border-slate-400 p-3 text-lg" value={values[index]} disabled={!running} aria-describedby={`written-source-${field.id} written-entry-note`}
          onChange={event => change(index, event.target.value, composition.current === index || (event.nativeEvent as InputEvent).isComposing)}
          onPaste={event => { event.preventDefault(); setMessage(zh ? "请逐字段录入，本练习不接受粘贴。" : "Type each field; this practice does not accept paste."); }}
          onDrop={event => { event.preventDefault(); setMessage(zh ? "本练习不接受拖入文字。" : "This practice does not accept dropped text."); }}
          onCompositionStart={() => { if (current()) { composition.current = index; setComposing(true); } }}
          onCompositionEnd={event => { composition.current = null; setComposing(false); change(index, event.currentTarget.value, false); }}
          onKeyDown={event => { if (event.key === "Enter" && (composition.current !== null || event.nativeEvent.isComposing)) event.preventDefault(); }} />
      </div>)}
      {running && <div className="flex flex-wrap gap-3">
        <button type="button" className={button} disabled={position === 0 || composing} onClick={() => move(position - 1, false)}>{zh ? "上一卡并修改" : "Previous card and revise"}</button>
        <button type="submit" className={button} disabled={composing}>{position === 31 ? (zh ? "纳入末卡并继续核对" : "Include last card and keep checking") : (zh ? "下一卡（空字段也计入）" : "Next card (include blank fields)")}</button>
      </div>}
    </form>
    <p id="written-entry-note" className="text-sm leading-7 text-slate-600">{zh ? "只核对最终已提交文本，每字段上限64字符。允许修正；删除的文字不算产量，未完成输入法组合不计入。即使到末卡，也需等完整60秒；后台、离开或时钟不一致取消本轮。原始输入仅留内存，结束或退出时清除。" : "Final committed text only, up to 64 characters per field. Corrections are allowed; deleted text and unfinished IME composition are excluded. Reaching the last card still requires the full 60 seconds. Backgrounding, leaving or inconsistent clocks cancel the round. Raw input stays in memory and clears on completion or exit."}</p>
    <button type="button" className={button} onClick={() => cancel(zh ? "本轮已取消并清空。" : "This round was cancelled and cleared.")}>{zh ? "取消本轮并返回模块" : "Cancel this round and return to modules"}</button>
    {message && <p role="status">{message}</p>}
  </section>;
}
