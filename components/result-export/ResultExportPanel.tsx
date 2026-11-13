"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { copyWorksheet } from "@/lib/marketing/riasecWorksheetRecord";
import { defaultResultExportDraft, serializeResultExport, type ResultExportProjection } from "@/lib/result-export/contract";
import { RESULT_EXPORT_PROMPTS } from "@/lib/result-export/prompts";
import { loadTraditionalAssessmentText } from "@/lib/tests/traditionalAssessmentDisplay";

type Props = {
  projection: ResultExportProjection;
  locale: DisplayLocale;
  mbtiType?: string;
  mbtiUnlockHref?: string;
  /** Uses the caller's existing authorized PDF chain; credentials never enter projection. */
  onDownloadPdf?: () => Promise<void>;
  pdfState?: "ready" | "pending" | "unavailable";
};

const originalText = (value: string) => value;

export function ResultExportPanel(props: Props) {
  const [traditionalText, setTraditionalText] = useState<((value: string) => string) | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const traditional = props.locale === "zh-TW";
  useEffect(() => {
    if (!traditional) return;
    let current = true;
    void loadTraditionalAssessmentText().then(
      (translate) => { if (current) setTraditionalText(() => translate); },
      () => { if (current) setUnavailable(true); },
    );
    return () => { current = false; };
  }, [traditional]);
  if (traditional && unavailable) return <p role="status">文字匯出暫時無法載入。</p>;
  const displayText = traditional ? traditionalText : originalText;
  if (!displayText) return null;
  if (props.projection.product === "MBTI") {
    return <MbtiPromptCard locale={props.locale} displayText={displayText} typeCode={props.mbtiType} unlockHref={props.mbtiUnlockHref} onDownloadPdf={props.onDownloadPdf} />;
  }
  return <ResultExportContent key={props.locale} {...props} displayText={displayText} />;
}

function MbtiPromptCard({ locale, displayText, typeCode, unlockHref, onDownloadPdf }: {
  locale: DisplayLocale;
  displayText: (value: string) => string;
  typeCode?: string;
  unlockHref?: string;
  onDownloadPdf?: () => Promise<void>;
}) {
  const id = useId();
  const [status, setStatus] = useState<"idle" | "copying" | "copied" | "failed">("idle");
  const copy = (zh: string, en: string) => locale === "en" ? en : displayText(zh);
  const [pdfStatus, setPdfStatus] = useState<"idle" | "downloading" | "requested" | "failed">("idle");
  const prompt = displayText(RESULT_EXPORT_PROMPTS.MBTI[locale === "en" ? "en" : "zh"]);
  const baseType = typeCode?.match(/^([EI][SN][TF][JP])(?:-[AT])?$/)?.[1]?.toLowerCase();
  const buttonClass = "inline-flex min-h-11 items-center rounded-full px-5 py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800";

  async function copyPrompt() {
    setStatus("copying");
    const result = await copyWorksheet(prompt, navigator.clipboard);
    setStatus(result === "success" ? "copied" : "failed");
  }

  async function downloadPdf() {
    if (!onDownloadPdf || pdfStatus === "downloading") return;
    setPdfStatus("downloading");
    try {
      await onDownloadPdf();
      setPdfStatus("requested");
    } catch {
      setPdfStatus("failed");
    }
  }

  return (
    <section id="mbti-ai-export" data-testid="result-export-panel" aria-labelledby={id}
      className="min-w-0 scroll-mt-24 rounded-xl border border-emerald-200 border-t-4 border-t-emerald-600 bg-[#e9f5ef] px-5 py-7 text-slate-900 sm:px-8 sm:py-10 print:hidden">
      <div className="grid items-center gap-7 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-10">
        <Image
          src={baseType ? `/images/mbti/ai-conversation/${baseType}.webp` : "/images/mbti/ai-result-conversation.webp"}
          alt=""
          width={768}
          height={512}
          className="mx-auto h-auto w-full max-w-sm"
        />
        <div className="min-w-0 space-y-4">
          <h2 id={id} className="text-2xl font-bold tracking-tight text-emerald-950 sm:text-3xl">
            {copy("和 AI 深聊，认识更真实的自己", "Get to know yourself in a deeper conversation with AI")}
          </h2>
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{prompt}</p>
          <div className="flex flex-wrap gap-3">
            <button type="button" disabled={status === "copying"} onClick={() => void copyPrompt()}
              className={`${buttonClass} bg-emerald-800 text-white hover:bg-emerald-900 disabled:opacity-50`}>
              {copy("复制提示词", "Copy prompt")}
            </button>
            {unlockHref ? <a href={unlockHref} className={`${buttonClass} border border-emerald-700 bg-white text-emerald-900 hover:bg-emerald-50`}>
              {copy("解锁全部结果页内容", "Unlock the full results page")}
            </a> : null}
            {onDownloadPdf ? (
              <button type="button" disabled={pdfStatus === "downloading"} onClick={() => void downloadPdf()}
                className={`${buttonClass} border border-emerald-700 bg-white text-emerald-900 hover:bg-emerald-50 disabled:opacity-50`}>
                {pdfStatus === "downloading" ? copy("正在请求 PDF…", "Requesting PDF…") : copy("下载 PDF", "Download PDF")}
              </button>
            ) : null}
          </div>
          {unlockHref ? <p className="text-sm text-emerald-950/80">
            {copy("付费解锁后可下载完整结果页 PDF。", "Paid unlock includes a PDF of the full results page.")}
          </p> : null}
          {pdfStatus === "requested" || pdfStatus === "failed" ? <p role="status" className="text-sm">
            {pdfStatus === "requested"
              ? copy("已请求 PDF 下载，请查看浏览器下载列表。", "PDF download requested. Check your browser’s downloads.")
              : copy("PDF 暂时无法下载，请稍后重试。", "The PDF is temporarily unavailable. Try again later.")}
          </p> : null}
          {status === "copied" || status === "failed" ? <p role="status" className="text-sm">
            {status === "copied"
              ? copy("已复制提示词。", "Prompt copied.")
              : copy("复制失败，请选中上方提示词手动复制。", "Copy failed. Select the prompt above to copy it manually.")}
          </p> : null}
        </div>
      </div>
    </section>
  );
}

function ResultExportContent({ projection, locale, onDownloadPdf, pdfState = "unavailable", displayText }: Props & {
  displayText: (value: string) => string;
}) {
  const copy = (zh: string, en: string) => locale === "en" ? en : displayText(zh);
  const id = useId();
  const [draft, setDraft] = useState(() => defaultResultExportDraft(projection, locale, displayText));
  const [hydrated, setHydrated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [status, setStatus] = useState("");
  const preview = useRef<HTMLTextAreaElement>(null);
  useEffect(() => setHydrated(true), []);
  const output = serializeResultExport(projection, draft, locale, "text", displayText);
  const disabled = !hydrated || busy || draft.selectedSections.length === 0;
  const inputClass = "w-full min-w-0 rounded-xl border border-slate-300 bg-white p-3 text-base text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700";
  async function copyOutput() {
    setBusy(true); setStatus("");
    const result = await copyWorksheet(output, navigator.clipboard);
    setBusy(false);
    if (result === "success") setStatus(copy("已复制。请到你选择的 AI 中粘贴。", "Copied. Paste it into the AI you choose."));
    else {
      setStatus(copy("浏览器未允许复制。请选择下方文本手动复制，或下载 TXT。", "Copy was not available. Select the text below to copy manually, or download TXT."));
      preview.current?.focus(); preview.current?.select();
    }
  }
  function download(format: "text" | "markdown") {
    try {
      const text = serializeResultExport(projection, draft, locale, format, displayText);
      const url = URL.createObjectURL(new Blob([text], { type: `${format === "text" ? "text/plain" : "text/markdown"};charset=utf-8` }));
      const link = document.createElement("a");
      link.href = url; link.download = `FermatMind-${projection.product}-${locale}-selected-results.${format === "text" ? "txt" : "md"}`;
      link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus(copy("已请求下载，请检查浏览器下载列表。", "Download requested. Check your browser's downloads."));
    } catch { setStatus(copy("下载未能开始。请选择预览文本手动复制。", "Download could not start. Select the preview text to copy manually.")); }
  }
  async function pdf() {
    if (!onDownloadPdf || pdfState !== "ready" || pdfBusy) return;
    setPdfBusy(true); setStatus("");
    try { await onDownloadPdf(); setStatus(copy("已请求 PDF 下载，请检查浏览器下载列表。", "PDF download requested. Check your browser's downloads.")); }
    catch { setStatus(copy("PDF 暂时不可用。可以保留预览、下载 TXT，稍后重试 PDF。", "PDF is unavailable. Keep the preview or download TXT, then retry PDF later.")); }
    finally { setPdfBusy(false); }
  }
  const title = copy("带着结果，与 AI 继续聊", "Explore your results with AI");
  const description = copy(
    "选择你愿意分享的结果，讨论现实经历和下一步。本站不会自动发送你的结果。公开分享和以后找回仍是独立功能。",
    "Choose results you want to share and discuss real experiences and next steps. FermatMind will not send them automatically. Public sharing and finding saved results remain separate.",
  );

  return <section
    className="min-w-0 [overflow-wrap:anywhere] space-y-4 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-slate-900 sm:p-6 print:hidden"
    data-testid="result-export-panel"
    aria-labelledby={`${id}-title`}
  >
    <h2 id={`${id}-title`} className="text-xl font-semibold">{title}</h2>
    <p>{description}</p>
    <details>
      <summary className="cursor-pointer rounded-lg py-3 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
      >{copy("选择、预览并带走结果", "Choose, preview and take your results")}</summary>
      <div className="space-y-5 pt-4">
        <fieldset disabled={!hydrated || busy} className="min-w-0 [overflow-wrap:anywhere] space-y-4">
          <legend className="font-semibold">{copy("1. 选择用途与数据", "1. Choose purpose and data")}</legend>
          <label className="block space-y-2"><span>{copy("用途", "Purpose")}</span><select className={inputClass} value={draft.purpose} onChange={event => { setDraft({ ...draft, purpose: event.target.value as typeof draft.purpose }); setStatus(""); }}>
            <option value="understand">{copy("理解我的结果", "Understand my results")}</option><option value="situation">{copy("讨论一个现实问题", "Discuss a real situation")}</option><option value="communication">{copy("生成可修改的 AI 沟通参考", "Draft editable AI communication guidance")}</option>
          </select></label>
          <div className="flex flex-wrap gap-3">{projection.sections.map(section => <label key={section.id} className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2"><input type="checkbox" checked={draft.selectedSections.includes(section.id)} onChange={event => { setDraft({ ...draft, selectedSections: event.target.checked ? [...draft.selectedSections, section.id] : draft.selectedSections.filter(id => id !== section.id) }); setStatus(""); }} />{displayText(section.title)}</label>)}</div>
          <label className="block space-y-2"><span>{copy("目标与经历（用户自述，可留空）", "Goal and experience (your own words, optional)")}</span><textarea rows={4} className={inputClass} value={draft.goal} onChange={event => { setDraft({ ...draft, goal: event.target.value }); setStatus(""); }} /></label>
          <p className="text-sm">{copy("请检查自述中的个人信息。它只留在当前页面内存，刷新会丢失；不回写测评分数。", "Check your text for personal information. It stays in this page's memory and is lost on refresh; it does not change scores.")}</p>
          <label className="block space-y-2"><span>{copy("讨论提示词（可编辑，报告事实保持原值）", "Discussion prompt (editable; report facts stay unchanged)")}</span><textarea rows={9} className={inputClass} value={draft.prompt} onChange={event => { setDraft({ ...draft, prompt: event.target.value }); setStatus(""); }} /></label>
        </fieldset>
        <label className="block space-y-2"><span className="font-semibold">{copy("2. 完整预览 · ", "2. Full preview · ")}{output.length.toLocaleString()} {copy("字符，无静默截断", "characters, no silent truncation")}</span><textarea ref={preview} rows={16} readOnly className={inputClass} value={output} aria-label={copy("完整导出预览", "Full export preview")} /></label>
        {draft.selectedSections.length === 0 ? <p role="status">{copy("请至少选择一项结果。", "Select at least one result section.")}</p> : null}
        <div className="flex flex-wrap gap-3">
          <button type="button" className="min-h-11 rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white disabled:opacity-50" disabled={disabled} onClick={() => void copyOutput()}>{copy("复制提示词和所选结果", "Copy prompt and selected results")}</button>
          {(["text", "markdown"] as const).map(format => <button type="button" key={format} className="min-h-11 rounded-xl border border-slate-400 bg-white px-4 py-3 disabled:opacity-50" disabled={disabled} onClick={() => download(format)}>{format === "text" ? "TXT" : "Markdown"}</button>)}
          {onDownloadPdf && pdfState === "ready" ? <button type="button" className="min-h-11 rounded-xl border border-slate-400 bg-white px-4 py-3 disabled:opacity-50" disabled={!hydrated || pdfBusy} onClick={() => void pdf()}>{pdfBusy ? (copy("正在请求 PDF…", "Requesting PDF…")) : (copy("下载现有报告 PDF", "Download existing report PDF"))}</button> : null}
        </div>
        <p role="status" aria-live="polite">{status}</p>
        {pdfState !== "ready" ? <p className="text-sm">{pdfState === "pending" ? (copy("PDF 仍在准备。你可以先复制结果摘要，稍后再试。", "PDF is still being prepared. Copy the result summary first and try again later.")) : (copy("此处未提供可用 PDF；TXT 和 Markdown 是所选结果摘要，不是完整报告。可沿报告原有合法打印或下载入口继续。", "A PDF is not available here. TXT and Markdown contain selected result summaries, not the full report. Use the report's existing authorized print or download entry when available."))}</p> : null}
        <p>{copy("3. 自行打开 ChatGPT、DeepSeek、豆包或 Claude，粘贴或上传文件。先核对 AI 实际读到了哪些内容，再讨论经历、反例与小调整。无需使用 AI 也能继续阅读报告。", "3. Open ChatGPT, DeepSeek, Doubao or Claude yourself, then paste or upload. Check what the AI actually read before discussing experiences, counterexamples and small adjustments. You can keep reading the report without AI.")}</p>
        <details><summary className="cursor-pointer py-2">{copy("高级文本使用", "Advanced text use")}</summary><p>{copy("Markdown 也可用于 Claude Code 等文本工具；无需安装开发工具。不要将私人报告放入公开仓库。", "Markdown also works with text tools such as Claude Code; developer tools are optional. Keep private reports out of public repositories.")}</p></details>
      </div>
    </details>
  </section>;
}
