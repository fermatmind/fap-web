"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { trackCareerToolEvent, type CareerToolEvent } from "@/lib/career/toolTracking";
import type { Locale } from "@/lib/i18n/locales";
import worksheet from "@/lib/marketing/riasecWorksheet.json";
import { copyWorksheet, emptyWorksheet, exampleWorksheet, serializeWorksheet, WORKSHEET_FIELDS, WORKSHEET_VERSION, worksheetLabel, type CopyResult, type WorksheetFormat } from "@/lib/marketing/riasecWorksheetRecord";
import styles from "./RiasecWorksheet.module.css";

export function RiasecWorksheet({ locale: initialLocale }: { locale: Locale }) {
  const [locale, setLocale] = useState(initialLocale);
  const [record, setRecord] = useState(emptyWorksheet);
  const [example, setExample] = useState(false);
  const [format, setFormat] = useState<WorksheetFormat>("text");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const fallback = useRef<HTMLTextAreaElement>(null);
  const operation = useRef(0);
  const toolRunId = useRef<string | null>(null);
  const entered = useRef(false);
  const started = useRef(false);
  const zh = locale === "zh";
  const copy = worksheet[locale];
  const active = example ? exampleWorksheet(locale) : record;
  const output = serializeWorksheet(active, locale, format, example);
  const hasRecord = Object.values(record).some(value => value.length > 0);
  const leaveMessage = zh ? "本人记录仅保留在当前页面内存中。离开将丢失文字，请先复制或下载。仍要离开？" : "Your record is held only in this page's memory. Leaving will lose it. Copy or download first. Leave anyway?";
  useEffect(() => {
    if (!hasRecord) return;
    const unload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    const navigate = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element).closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement) || link.hasAttribute("download") || link.target === "_blank") return;
      const url = new URL(link.href, window.location.href);
      if (url.origin === window.location.origin && url.pathname === window.location.pathname && url.search === window.location.search) return;
      if (!window.confirm(leaveMessage)) { event.preventDefault(); event.stopPropagation(); }
    };
    window.addEventListener("beforeunload", unload);
    document.addEventListener("click", navigate, true);
    return () => { window.removeEventListener("beforeunload", unload); document.removeEventListener("click", navigate, true); };
  }, [hasRecord, leaveMessage]);

  function track(eventName: CareerToolEvent, outputFormat?: WorksheetFormat | "print") {
    if (example) return;
    toolRunId.current ??= crypto.randomUUID();
    trackCareerToolEvent(eventName, { locale: initialLocale, toolRunId: toolRunId.current, outputFormat });
  }
  function enter() {
    if (!example && !entered.current) { entered.current = true; track("career_worksheet_entered"); }
  }
  function resetStatus() { operation.current++; setStatus(""); }
  async function copyOutput() {
    const token = ++operation.current;
    setBusy(true);
    track("career_worksheet_output_requested", format);
    const result: CopyResult = await copyWorksheet(output, navigator.clipboard);
    if (result === "success") track("career_worksheet_copy_succeeded", format);
    setBusy(false);
    if (token !== operation.current) return;
    const messages = {
      success: zh ? "已复制。请粘贴到你的本地文档核对并保存。" : "Copied. Paste into your local document, check it and save.",
      unsupported: zh ? "此浏览器不支持剪贴板。请手选下方文本复制，或下载文件。" : "Clipboard is unavailable. Select the text below to copy manually, or download it.",
      denied: zh ? "剪贴板权限被拒绝。请手选下方文本复制，或下载文件。" : "Clipboard permission was denied. Select the text below to copy manually, or download it.",
      cancelled: zh ? "复制已取消，记录仍在。可重试、手选文本或下载文件。" : "Copy was cancelled. Your record remains. Retry, select text, or download it.",
      failed: zh ? "复制未成功，记录仍在。请手选下方文本或下载文件。" : "Copy failed. Your record remains. Select the text below or download it.",
    };
    setStatus(messages[result]);
    if (result !== "success") { fallback.current?.focus(); fallback.current?.select(); }
  }
  function download() {
    resetStatus();
    track("career_worksheet_output_requested", format);
    try {
      const url = URL.createObjectURL(new Blob([output], { type: format === "text" ? "text/plain;charset=utf-8" : "text/markdown;charset=utf-8" }));
      const anchor = document.createElement("a");
      anchor.href = url; anchor.download = `fermatmind-${example ? "example" : "my-record"}-${locale}.${format === "text" ? "txt" : "md"}`;
      document.body.append(anchor); anchor.click(); anchor.remove();
      track("career_worksheet_download_requested", format);
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      setStatus(zh ? "已请求本地下载。请在下载列表确认文件已保存；取消下载不会保存记录。" : "Local download requested. Check your downloads to confirm the file was saved; cancelling does not save your record.");
    } catch { setStatus(zh ? "下载未能启动。请手选下方文本复制。" : "Download could not start. Select and copy the text below."); fallback.current?.focus(); fallback.current?.select(); }
  }
  return <section id="my-worksheet" aria-labelledby="my-worksheet-title" className={`${styles.shell} mx-auto max-w-4xl scroll-mt-24 space-y-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-8`} data-testid="riasec-worksheet">
    <div className="space-y-3">
      <h2 id="my-worksheet-title" className="m-0 text-2xl font-semibold">{zh ? "填写并带走我的探索记录" : "Fill in and take away my exploration record"}</h2>
      <p className="m-0 text-sm leading-7">{zh ? "仅在本页内存中填写，不自动保存。刷新、返回、切换整站语言或离开可能丢失记录；请先复制或下载。下方“工作表语言”可保留文字切换标签。" : "Entries stay only in this page's memory and are not autosaved. Refreshing, going back, switching the site's language or leaving may lose them. Copy or download first. The worksheet language control below preserves your entries."}</p>
      <p className="m-0 text-sm leading-7">{zh ? "填写内容不发送至服务器、分析系统或远程 PDF 服务。复制使用设备剪贴板；下载和打印由本机浏览器处理。这是行动工作表，不是测评题库或个人报告 PDF。所有字段均可留空，不自动计算分数或匹配职业。" : "Entries are not sent to a server, analytics or remote PDF service. Copy uses your device clipboard; downloads and printing use your local browser. This is an action worksheet, not a questionnaire or personal report PDF. All fields are optional; no scores or career matches are calculated."}</p>
    </div>
    <div className="flex flex-wrap items-center gap-3">
      <label className="flex min-h-12 items-center gap-2 text-sm">{zh ? "工作表语言" : "Worksheet language"}<select aria-label={zh ? "工作表语言" : "Worksheet language"} value={locale} onChange={event => { resetStatus(); setLocale(event.target.value as Locale); }} className="min-h-12 rounded-lg border border-slate-300 bg-white px-3"><option value="zh">中文</option><option value="en">English</option></select></label>
      <Button variant="outline" aria-pressed={example} onClick={() => { resetStatus(); setExample(!example); }}>{example ? (zh ? "返回本人记录" : "Return to my record") : (zh ? "查看合成填写示例" : "View a synthetic example")}</Button>
      <Button variant="ghost" disabled={!hasRecord || example} onClick={() => { if (window.confirm(zh ? "清除全部本人文字？此操作无法撤销。" : "Clear all my entries? This cannot be undone.")) { resetStatus(); setRecord(emptyWorksheet()); } }}>{zh ? "清除本人记录" : "Clear my record"}</Button>
    </div>
    <p role="note" className="m-0 font-semibold">{example ? (zh ? "合成填写示例：不是本人记录。本人文字保留在内存中，返回即可继续。" : "Synthetic example: not my record. Your entries remain in memory; return to continue.") : (zh ? "本人记录：按你的实际经历填写，可保留原始分数与单位。" : "My record: use your own experience; keep original score units.")}</p>
    {copy.pages.flatMap(page => page.sections).map((section, index) => <fieldset key={index} className="min-w-0 space-y-4 border-t border-slate-200 pt-4">
      <legend className="px-1 font-semibold">{section.heading}</legend>
      <p className="m-0 text-sm leading-7 text-slate-600">{section.body}</p>
      <div className="grid min-w-0 gap-4 sm:grid-cols-2">{WORKSHEET_FIELDS.filter(field => field[3] === index).map(field => <label key={field[0]} className="min-w-0 space-y-2 text-sm">{worksheetLabel(field, locale)}<textarea data-worksheet-field={field[0]} rows={field[3] === 0 ? 2 : 3} value={active[field[0]]} readOnly={example} onFocus={enter} autoComplete="off" spellCheck={false} onChange={event => { resetStatus(); enter(); if (!started.current && event.target.value.length > 0) { started.current = true; track("career_worksheet_started"); } setRecord(previous => ({ ...previous, [field[0]]: event.target.value })); }} className="block min-h-12 w-full rounded-lg border border-slate-300 bg-white p-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" /></label>)}</div>
    </fieldset>)}
    <div className="space-y-4 border-t border-slate-200 pt-6">
      <h3 className="m-0 text-xl font-semibold">{zh ? "带走当前记录" : "Take away the current record"}</h3>
      <p className="m-0 text-sm leading-7">{zh ? "纯文本：标签单独一行，字段间空一行，原值和换行保留。Markdown：每个原值置于独立代码块中，符号按字面显示。文件使用 UTF-8，页面输入换行采用 LF。" : "Plain text: labels on separate lines, a blank line between fields, original values and line breaks retained. Markdown: each value appears literally in its own code block. Files use UTF-8; input line breaks use LF."}</p>
      <label className="flex min-h-12 items-center gap-2 text-sm">{zh ? "输出格式" : "Output format"}<select aria-label={zh ? "输出格式" : "Output format"} value={format} onChange={event => { resetStatus(); setFormat(event.target.value as WorksheetFormat); }} className="min-h-12 rounded-lg border border-slate-300 bg-white px-3"><option value="text">{zh ? "纯文本 (.txt)" : "Plain text (.txt)"}</option><option value="markdown">Markdown (.md)</option></select></label>
      <div className="flex flex-wrap gap-3">
        <Button disabled={busy} onClick={copyOutput}>{busy ? (zh ? "正在复制…" : "Copying…") : (zh ? "复制当前记录" : "Copy current record")}</Button>
        <Button variant="outline" onClick={download}>{zh ? "下载当前记录" : "Download current record"}</Button>
        <Button variant="outline" onClick={() => { resetStatus(); track("career_worksheet_output_requested", "print"); track("career_worksheet_print_requested", "print"); setStatus(zh ? "请在浏览器打印窗口确认打印或另存 PDF。取消不会完成保存。" : "Confirm printing or Save as PDF in your browser. Cancelling does not save your record."); try { window.print(); } catch { setStatus(zh ? "打印未能打开，请下载文本或手选复制。" : "Printing could not open. Download the text or copy it manually."); } }}>{zh ? "打印当前记录 / 存为 PDF" : "Print current record / Save as PDF"}</Button>
      </div>
      <p role="status" aria-live="polite" className="m-0 min-h-6 text-sm">{status}</p>
      <label className="block space-y-2 text-sm">{zh ? "可手选的完整输出（只读）" : "Complete output for manual selection (read only)"}<textarea ref={fallback} value={output} readOnly rows={8} spellCheck={false} className="block w-full rounded-lg border border-slate-300 bg-white p-3 font-mono text-sm" /></label>
      <Button variant="ghost" onClick={() => { fallback.current?.focus(); fallback.current?.select(); }}>{zh ? "全选输出文本" : "Select all output text"}</Button>
    </div>
    <article data-worksheet-print className={styles.printRecord} aria-label={zh ? "当前记录打印版" : "Current record print view"}>
      <h2>{copy.title}</h2><p>{example ? (zh ? "合成填写示例（不是本人记录）" : "Synthetic example (not my record)") : (zh ? "本人探索记录" : "My exploration record")} · {WORKSHEET_VERSION}</p><p>{copy.intro}</p>
      {copy.pages.flatMap(page => page.sections).map((section, index) => <section key={index}><h3>{section.heading}</h3><dl>{WORKSHEET_FIELDS.filter(field => field[3] === index).map(field => <div key={field[0]}><dt>{worksheetLabel(field, locale)}</dt><dd className={styles.value} data-print-field={field[0]}>{active[field[0]] || "—"}</dd></div>)}</dl></section>)}
    </article>
  </section>;
}
