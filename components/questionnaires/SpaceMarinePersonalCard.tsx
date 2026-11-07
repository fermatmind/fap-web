"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { ArchetypeResult } from "@/lib/questionnaires/scoring";
import { chapterHobbyLens, chapterPortraitPath } from "@/lib/questionnaires/spaceMarineChapters";

const sizes = { landscape: [1200, 630], portrait: [1080, 1920] } as const;
type Format = keyof typeof sizes;
function text(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, width: number, lineHeight: number, maxLines: number, zh: boolean) {
  const tokens = zh ? (value.match(/[A-Za-z]+(?: [A-Za-z]+)*|[0-9]+|[^A-Za-z0-9]/g) ?? []) : value.split(" "), lines: string[] = [];
  let line = "";
  for (const token of tokens) {
    const next = line + (!zh && line ? " " : "") + token;
    if (line && ctx.measureText(next).width > width) { lines.push(line); line = token; } else line = next;
  }
  if (line) lines.push(line);
  lines.slice(0, maxLines).forEach((part, i) => ctx.fillText(part + (i === maxLines - 1 && lines.length > maxLines ? "…" : ""), x, y + i * lineHeight));
}

/** Counts are drawn locally. Requests contain public artwork paths only. */
export function SpaceMarinePersonalCard({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<ArchetypeResult, {status: "complete"}>; locale: Locale }) {
  const zh = locale === "zh";
  const entries = quiz.directions.filter(d => result.profileIds.includes(d.id) && chapterHobbyLens(d.id));
  const [format, setFormat] = useState<Format>("landscape"), [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false), [message, setMessage] = useState(""), [manual, setManual] = useState("");
  const objectUrl = useRef("");
  useEffect(() => () => { if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); }, []);
  const publicUrl = `https://fermatmind.com/${locale}/tests/explore/space-marine-chapter`;
  const filename = `fermatmind-space-marine-result-${locale}-${format}.png`;
  async function copy() {
    try { await navigator.clipboard.writeText(publicUrl); setManual(""); setMessage(zh ? "已复制公开测试入口，不含本次计数。" : "Copied the public quiz entry, without your counts."); }
    catch { setManual(publicUrl); setMessage(zh ? "请手动复制公开入口。" : "Copy the public entry below manually."); }
  }
  async function generate(share: boolean) {
    if (busy || !entries.length) return;
    setBusy(true); setMessage("");
    try {
      await document.fonts.ready;
      const pictures = await Promise.all(entries.map(d => new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new window.Image(); image.onload = () => resolve(image); image.onerror = () => reject(new Error("Artwork unavailable")); image.src = chapterPortraitPath(d.id)!;
      })));
      const canvas = document.createElement("canvas"), [w, h] = sizes[format]; canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Canvas unavailable");
      const tall = format === "portrait", single = entries.length === 1, pad = 48;
      ctx.fillStyle = "#0f172a"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#cbd5e1"; ctx.font = '600 26px system-ui, sans-serif';
      ctx.fillText(zh ? "费马测试 · 我的战团爱好结果" : "FERMATMIND · MY CHAPTER HOBBY RESULT", pad, tall ? 100 : 58);
      ctx.fillStyle = "#f8fafc"; ctx.font = `700 ${tall ? 48 : 34}px system-ui, sans-serif`;
      ctx.fillText(entries.length === 1 ? (zh ? "本次最高计数战团" : "My highest-count Chapter") : (zh ? `${entries.length}个战团最高并列 · 全部保留` : `All ${entries.length} highest-count Chapters are tied`), pad, tall ? 205 : 116);
      if (single) {
        const d = entries[0], lens = chapterHobbyLens(d.id)!;
        const side = tall ? 840 : 400, x = tall ? 120 : pad, y = tall ? 280 : 150;
        ctx.drawImage(pictures[0], x, y, side, side);
        const tx = tall ? pad : 500, ty = tall ? 1240 : 235, tw = tall ? w - pad * 2 : 650;
        ctx.fillStyle = "#f8fafc"; ctx.font = `700 ${tall ? 72 : 54}px system-ui, sans-serif`;
        text(ctx, d.title[locale], tx, ty, tw, tall ? 90 : 67, 2, zh);
        ctx.fillStyle = "#cbd5e1"; ctx.font = `600 ${tall ? 48 : 36}px system-ui, sans-serif`;
        text(ctx, lens[locale], tx, ty + (tall ? 210 : 150), tw, tall ? 64 : 50, 2, zh);
        ctx.font = `500 ${tall ? 36 : 28}px system-ui, sans-serif`;
        text(ctx, zh ? `本次选中 ${result.counts[d.id]} / ${d.comparisons} 次出现` : `Chosen ${result.counts[d.id]} / ${d.comparisons} appearances`, tx, tall ? 1590 : 480, tw, 44, 2, zh);
      } else {
        const columns = tall ? (entries.length === 2 ? 1 : 2) : Math.min(3, entries.length), rows = Math.ceil(entries.length / columns);
        const gap = 24, cellW = (w - pad * 2 - gap * (columns - 1)) / columns;
        const top = tall ? 320 : 160, rowH = tall ? (h - top - 240) / rows : 195;
        entries.forEach((d, i) => {
          const x = pad + (i % columns) * (cellW + gap), y = top + Math.floor(i / columns) * rowH;
          const side = tall ? Math.min(350, rowH - 220) : entries.length === 2 ? 180 : 114;
          ctx.drawImage(pictures[i], tall ? x + (cellW - side) / 2 : x, y, side, side);
          const tx = tall ? x : x + side + 16, ty = tall ? y + side + 44 : y + 30, tw = tall ? cellW : cellW - side - 16;
          ctx.fillStyle = "#f8fafc"; ctx.font = `700 ${tall ? 34 : 26}px system-ui, sans-serif`;
          text(ctx, d.title[locale], tx, ty, tw, tall ? 43 : 33, 2, zh);
          ctx.fillStyle = "#cbd5e1"; ctx.font = `500 ${tall ? 29 : 22}px system-ui, sans-serif`;
          text(ctx, chapterHobbyLens(d.id)![locale], tx, ty + (tall ? 100 : 75), tw, tall ? 39 : 29, 2, zh);
          ctx.font = `500 ${tall ? 27 : 21}px system-ui, sans-serif`;
          ctx.fillText(`${result.counts[d.id]} / ${d.comparisons}${zh ? " 次出现" : " appearances"}`, tx, ty + (tall ? 153 : 130));
        });
      }
      ctx.fillStyle = "#cbd5e1"; ctx.font = `500 ${tall ? 28 : 22}px system-ui, sans-serif`;
      text(ctx, zh ? "18道纸模爱好选择 · 非官方娱乐结果 · 次数不是匹配百分比" : "18 paper-model hobby choices · Unofficial · Counts are not match percentages", pad, h - (tall ? 160 : 52), w - pad * 2, 35, 2, zh);
      ctx.font = `500 ${tall ? 27 : 21}px system-ui, sans-serif`;
      ctx.fillText(publicUrl.replace("https://", ""), pad, h - (tall ? 65 : 18));
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error("PNG unavailable")), "image/png"));
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
      objectUrl.current = URL.createObjectURL(blob); setPreview(objectUrl.current);
      if (share) {
        try {
          const file = new File([blob], filename, {type: "image/png"});
          if (navigator.share && navigator.canShare?.({files: [file]})) {
            await navigator.share({files: [file], title: zh ? "我的战团爱好结果" : "My Chapter hobby result", url: publicUrl});
            setMessage(zh ? "已完成分享。" : "Shared."); return;
          }
        } catch (error) {
          setMessage(error instanceof Error && error.name === "AbortError" ? (zh ? "已取消分享，仍可保存预览图。" : "Sharing canceled. You can still save the preview.") : (zh ? "未能打开系统分享，请保存下方PNG。" : "Could not open system sharing. Save the PNG below.")); return;
        }
        setMessage(zh ? "此浏览器不支持直接分享，请下载下方PNG。" : "This browser cannot share images directly. Download the PNG below."); return;
      }
      const anchor = document.createElement("a"); anchor.href = objectUrl.current; anchor.download = filename; anchor.click();
      setMessage(zh ? "个人结果PNG已生成；也可长按预览或使用下载链接保存。" : "Your result PNG is ready. Save the preview or use the download link below.");
    } catch { setMessage(zh ? "暂时无法生成个人图片，请重试、截图或复制公开入口；本次结果仍可阅读。" : "Could not create the personal image. Retry, take a screenshot or copy the public entry; your result remains readable."); }
    finally { setBusy(false); }
  }
  return <section data-space-marine-personal-card className="space-y-4 rounded-xl border border-slate-300 bg-white p-5" aria-label={zh ? "本次个人结果卡" : "Your personal result card"}>
    <h3 className="text-xl font-semibold">{zh ? "把本次全部最高战团做成一张卡" : "Put every highest-count Chapter on one card"}</h3>
    <p className="text-sm leading-7 text-slate-600">{zh ? "个人PNG在本浏览器生成，包含本次全部最高战团、爱好结论与各项计数，不含逐题答案或个人资料。主动保存或分享才会带出这些结果；公开入口不含你的计数。公开指南卡人人相同，与这张个人结果卡不同。" : "Your browser creates a personal PNG with every highest-count Chapter, hobby theme and count, without item answers or personal details. Saving or sharing includes those results; the public entry contains no counts. The public guide cards are the same for everyone and are separate from this personal card."}</p>
    <label className="flex flex-wrap items-center gap-3 font-semibold">{zh ? "个人卡尺寸" : "Personal card size"}<select className="min-h-11 rounded-lg border px-3" value={format} disabled={busy} onChange={e => {setFormat(e.target.value as Format);setPreview("");setMessage("");if (objectUrl.current) {URL.revokeObjectURL(objectUrl.current);objectUrl.current = "";}}}><option value="landscape">1200 × 630 · {zh ? "横版" : "Landscape"}</option><option value="portrait">1080 × 1920 · {zh ? "竖版" : "Portrait"}</option></select></label>
    <div className="flex flex-wrap gap-3"><button disabled={busy} className="min-h-11 rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white disabled:opacity-50" onClick={() => void generate(false)}>{zh ? "保存个人结果卡" : "Save personal result card"}</button><button disabled={busy} className="min-h-11 rounded-lg border px-5 py-3 font-semibold" onClick={() => void generate(true)}>{zh ? "分享个人结果图" : "Share personal result image"}</button><button className="min-h-11 px-3 underline" onClick={() => void copy()}>{zh ? "复制公开测试入口" : "Copy public quiz entry"}</button></div>
    {message && <p role="status" className="text-sm leading-7">{message}</p>}
    {manual && <textarea readOnly aria-label={zh ? "公开入口手动复制" : "Public entry for manual copying"} value={manual} className="min-h-24 w-full rounded-lg border p-3" onFocus={e => e.target.select()} />}
    {preview && <a href={preview} download={filename} className="block space-y-2 underline"><span>{zh ? "下载个人PNG；手机可长按保存" : "Download personal PNG, or save the preview on mobile"}</span><Image unoptimized src={preview} width={sizes[format][0]} height={sizes[format][1]} alt={`${zh ? "本次个人结果" : "Personal result"}: ${entries.map(d => `${d.title[locale]} ${result.counts[d.id]}/${d.comparisons}`).join(" · ")}`} className="h-auto max-h-[42rem] max-w-full rounded-lg" /></a>}
  </section>;
}
