"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/locales";
import { copyWorksheet } from "@/lib/marketing/riasecWorksheetRecord";
import { defaultResultExportDraft, serializeResultExport, type ResultExportProjection } from "@/lib/result-export/contract";

export function ResultExportPanel({ projection, locale, onDownloadPdf, pdfState = "unavailable" }: {
  projection: ResultExportProjection;
  locale: Locale;
  /** Uses the caller's existing authorized PDF chain; credentials never enter projection. */
  onDownloadPdf?: () => Promise<void>;
  pdfState?: "ready" | "pending" | "unavailable";
}) {
  const zh = locale === "zh";
  const id = useId();
  const [draft, setDraft] = useState(() => defaultResultExportDraft(projection, locale));
  const [hydrated, setHydrated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const preview = useRef<HTMLTextAreaElement>(null);
  useEffect(() => setHydrated(true), []);
  const output = serializeResultExport(projection, draft, locale);
  const disabled = !hydrated || busy || draft.selectedSections.length === 0;
  const inputClass = "w-full min-w-0 rounded-xl border border-slate-300 bg-white p-3 text-base text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700";
  async function copy() {
    setBusy(true); setStatus("");
    const result = await copyWorksheet(output, navigator.clipboard);
    setBusy(false);
    if (result === "success") setStatus(zh ? "已复制。请到你选择的 AI 中粘贴。" : "Copied. Paste it into the AI you choose.");
    else {
      setStatus(zh ? "浏览器未允许复制。请选择下方文本手动复制，或下载 TXT。" : "Copy was not available. Select the text below to copy manually, or download TXT.");
      preview.current?.focus(); preview.current?.select();
    }
  }
  function download(format: "text" | "markdown") {
    try {
      const text = serializeResultExport(projection, draft, locale, format);
      const url = URL.createObjectURL(new Blob([text], { type: `${format === "text" ? "text/plain" : "text/markdown"};charset=utf-8` }));
      const link = document.createElement("a");
      link.href = url; link.download = `FermatMind-${projection.product}-${locale}-selected-results.${format === "text" ? "txt" : "md"}`;
      link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus(zh ? "已请求下载，请检查浏览器下载列表。" : "Download requested. Check your browser's downloads.");
    } catch { setStatus(zh ? "下载未能开始。请选择预览文本手动复制。" : "Download could not start. Select the preview text to copy manually."); }
  }
  async function pdf() {
    if (!onDownloadPdf || pdfState !== "ready") return;
    setBusy(true); setStatus("");
    try { await onDownloadPdf(); setStatus(zh ? "已请求 PDF 下载，请检查浏览器下载列表。" : "PDF download requested. Check your browser's downloads."); }
    catch { setStatus(zh ? "PDF 暂时不可用。可以保留预览、下载 TXT，稍后重试 PDF。" : "PDF is unavailable. Keep the preview or download TXT, then retry PDF later."); }
    finally { setBusy(false); }
  }
  return <section className="min-w-0 [overflow-wrap:anywhere] space-y-4 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-slate-900 sm:p-6 print:hidden" data-testid="result-export-panel" aria-labelledby={`${id}-title`}>
    <h2 id={`${id}-title`} className="text-xl font-semibold">{zh ? "带着结果，与 AI 继续聊" : "Explore your results with AI"}</h2>
    <p>{zh ? "选择你愿意分享的结果，讨论现实经历和下一步。本站不会自动发送你的结果。公开分享和以后找回仍是独立功能。" : "Choose results you want to share and discuss real experiences and next steps. FermatMind will not send them automatically. Public sharing and finding saved results remain separate."}</p>
    <details>
      <summary className="cursor-pointer rounded-lg py-3 font-semibold focus-visible:outline-2 focus-visible:outline-sky-700">{zh ? "选择、预览并带走结果" : "Choose, preview and take your results"}</summary>
      <div className="space-y-5 pt-4">
        <fieldset disabled={!hydrated || busy} className="min-w-0 [overflow-wrap:anywhere] space-y-4">
          <legend className="font-semibold">{zh ? "1. 选择用途与数据" : "1. Choose purpose and data"}</legend>
          <label className="block space-y-2"><span>{zh ? "用途" : "Purpose"}</span><select className={inputClass} value={draft.purpose} onChange={event => { setDraft({ ...draft, purpose: event.target.value as typeof draft.purpose }); setStatus(""); }}>
            <option value="understand">{zh ? "理解我的结果" : "Understand my results"}</option><option value="situation">{zh ? "讨论一个现实问题" : "Discuss a real situation"}</option><option value="communication">{zh ? "生成可修改的 AI 沟通参考" : "Draft editable AI communication guidance"}</option>
          </select></label>
          <div className="flex flex-wrap gap-3">{projection.sections.map(section => <label key={section.id} className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2"><input type="checkbox" checked={draft.selectedSections.includes(section.id)} onChange={event => { setDraft({ ...draft, selectedSections: event.target.checked ? [...draft.selectedSections, section.id] : draft.selectedSections.filter(id => id !== section.id) }); setStatus(""); }} />{section.title}</label>)}</div>
          <label className="block space-y-2"><span>{zh ? "目标与经历（用户自述，可留空）" : "Goal and experience (your own words, optional)"}</span><textarea rows={4} className={inputClass} value={draft.goal} onChange={event => { setDraft({ ...draft, goal: event.target.value }); setStatus(""); }} /></label>
          <p className="text-sm">{zh ? "请检查自述中的个人信息。它只留在当前页面内存，刷新会丢失；不回写测评分数。" : "Check your text for personal information. It stays in this page's memory and is lost on refresh; it does not change scores."}</p>
          <label className="block space-y-2"><span>{zh ? "讨论提示词（可编辑，报告事实保持原值）" : "Discussion prompt (editable; report facts stay unchanged)"}</span><textarea rows={9} className={inputClass} value={draft.prompt} onChange={event => { setDraft({ ...draft, prompt: event.target.value }); setStatus(""); }} /></label>
        </fieldset>
        <label className="block space-y-2"><span className="font-semibold">{zh ? "2. 完整预览 · " : "2. Full preview · "}{output.length.toLocaleString()} {zh ? "字符，无静默截断" : "characters, no silent truncation"}</span><textarea ref={preview} rows={16} readOnly className={inputClass} value={output} aria-label={zh ? "完整导出预览" : "Full export preview"} /></label>
        {draft.selectedSections.length === 0 ? <p role="status">{zh ? "请至少选择一项结果。" : "Select at least one result section."}</p> : null}
        <div className="flex flex-wrap gap-3">
          <button type="button" className="min-h-11 rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white disabled:opacity-50" disabled={disabled} onClick={() => void copy()}>{zh ? "复制提示词和所选结果" : "Copy prompt and selected results"}</button>
          {(["text", "markdown"] as const).map(format => <button type="button" key={format} className="min-h-11 rounded-xl border border-slate-400 bg-white px-4 py-3 disabled:opacity-50" disabled={disabled} onClick={() => download(format)}>{format === "text" ? "TXT" : "Markdown"}</button>)}
          {onDownloadPdf && pdfState === "ready" ? <button type="button" className="min-h-11 rounded-xl border border-slate-400 bg-white px-4 py-3 disabled:opacity-50" disabled={!hydrated || busy} onClick={() => void pdf()}>{zh ? "下载现有报告 PDF" : "Download existing report PDF"}</button> : null}
        </div>
        <p role="status" aria-live="polite">{status}</p>
        {pdfState !== "ready" ? <p className="text-sm">{pdfState === "pending" ? (zh ? "PDF 仍在准备。你可以先复制结果摘要，稍后再试。" : "PDF is still being prepared. Copy the result summary first and try again later.") : (zh ? "此处未提供可用 PDF；TXT 和 Markdown 是所选结果摘要，不是完整报告。可沿报告原有合法打印或下载入口继续。" : "A PDF is not available here. TXT and Markdown contain selected result summaries, not the full report. Use the report's existing authorized print or download entry when available.")}</p> : null}
        <p>{zh ? "3. 自行打开 ChatGPT、DeepSeek、豆包或 Claude，粘贴或上传文件。先核对 AI 实际读到了哪些内容，再讨论经历、反例与小调整。无需使用 AI 也能继续阅读报告。" : "3. Open ChatGPT, DeepSeek, Doubao or Claude yourself, then paste or upload. Check what the AI actually read before discussing experiences, counterexamples and small adjustments. You can keep reading the report without AI."}</p>
        <details><summary className="cursor-pointer py-2">{zh ? "高级文本使用" : "Advanced text use"}</summary><p>{zh ? "Markdown 也可用于 Claude Code 等文本工具；无需安装开发工具。不要将私人报告放入公开仓库。" : "Markdown also works with text tools such as Claude Code; developer tools are optional. Keep private reports out of public repositories."}</p></details>
      </div>
    </details>
  </section>;
}
