"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useQuestionnaireDisplayCopy } from "./TraditionalQuestionnaireCopy";
import type { Locale } from "@/lib/i18n/locales";
import { moonPhaseDisplayCopy, moonPhasePresentations, type MoonPhaseId } from "@/lib/questionnaires/moonPhasePresentation";

type Format = "landscape" | "portrait";
const sizes = { landscape: [1200, 630], portrait: [1080, 1920] } as const;

function drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, width: number, lineHeight: number, maxLines: number, zh: boolean) {
  const words = zh ? [...text] : text.split(" ");
  const lines: string[] = []; let line = "";
  for (const word of words) {
    const next = line + (!zh && line ? " " : "") + word;
    if (ctx.measureText(next).width > width && line) {
      if (zh && /^[，。！？；：、]$/.test(word) && line.length > 1) { lines.push(line.slice(0, -1)); line = line.slice(-1) + word; }
      else { lines.push(line); line = word; }
    } else line = next;
  }
  if (line) lines.push(line);
  lines.slice(0, maxLines).forEach((value, i) => ctx.fillText(value + (i === maxLines - 1 && lines.length > maxLines ? "…" : ""), x, y + i * lineHeight));
}

/** Only names and reading themes leave the browser; no answers or counts enter a URL or image request. */
export function MoonPhaseShareCard({ ids, locale, publicGuide = false }: { ids: string[]; locale: Locale; publicGuide?: boolean }) {
  const { traditional, displayText } = useQuestionnaireDisplayCopy();
  const displayLocale = traditional ? "zh-TW" : locale;
  const copy = moonPhaseDisplayCopy(traditional ? displayText : undefined);
  const zh = locale === "zh", selected = ids.filter((id): id is MoonPhaseId => Object.hasOwn(moonPhasePresentations, id));
  const [format, setFormat] = useState<Format>("landscape"), [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false), [message, setMessage] = useState(""), [manualLink, setManualLink] = useState("");
  const objectUrl = useRef("");
  useEffect(() => () => { if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); }, []);
  const path = `/${displayLocale}/tests/explore/moon-phase${selected.length === 1 ? `/results/${selected[0]}` : ""}`;
  const publicUrl = `https://fermatmind.com${path}`;
  const filename = `fermatmind-moon-phase-${displayLocale}-${format}.png`;

  async function copyLink() {
    try { await navigator.clipboard.writeText(publicUrl); setManualLink(""); setMessage(zh ? copy("公开链接已复制。") : "Public link copied."); }
    catch { setManualLink(publicUrl); setMessage(zh ? copy("请手动复制下方公开链接。") : "Copy the public link below manually."); }
  }
  async function generate(share: boolean) {
    if (busy || !selected.length) return;
    setBusy(true); setMessage("");
    try {
      await document.fonts.ready;
      const pictures = await Promise.all(selected.map(id => new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new window.Image(); img.onload = () => resolve(img); img.onerror = () => reject(new Error("Portrait unavailable"));
        img.src = `/images/moon-phases/${id}.svg`;
      })));
      const canvas = document.createElement("canvas"), [w, h] = sizes[format]; canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Canvas unavailable");
      const tall = format === "portrait", single = selected.length === 1, pad = 54;
      ctx.fillStyle = "#f4eee5"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#356d70"; ctx.font = '600 26px system-ui, sans-serif';
      ctx.fillText(zh ? copy("费马测试 · 月相测试") : "FermatMind · Moon Phase Personality Test", pad, tall ? 120 : 66);
      ctx.fillStyle = "#586055"; ctx.font = '500 22px system-ui, sans-serif';
      ctx.fillText(publicGuide ? (zh ? copy("公开指南 · 不是个人结果") : "Public guide · Not a personal result") : (zh ? copy("我的结果 · 娱乐问卷") : "My result · Entertainment quiz"), pad, tall ? 174 : 100);
      if (single) {
        const person = moonPhasePresentations[selected[0]];
        const px = tall ? 315 : 54, py = tall ? 220 : 132, pw = tall ? 450 : 280;
        ctx.drawImage(pictures[0], px, py, pw, pw);
        const tx = tall ? pad : 390, ty = tall ? 900 : 205, tw = tall ? w - pad * 2 : 740;
        ctx.fillStyle = "#202d38"; ctx.font = `700 ${tall ? 66 : 58}px system-ui, sans-serif`;
        drawText(ctx, copy(person.name[locale]), tx, ty, tw, 72, 2, zh);
        ctx.fillStyle = "#85683a"; ctx.font = `600 ${tall ? 45 : 34}px system-ui, sans-serif`;
        drawText(ctx, copy(person.conclusion[locale]), tx, ty + (tall ? 180 : 135), tw, tall ? 64 : 48, 3, zh);
        ctx.fillStyle = "#586055"; ctx.font = `400 ${tall ? 32 : 26}px system-ui, sans-serif`;
        drawText(ctx, publicGuide ? (zh ? copy("公开月相指南 · 无需答题即可阅读") : "Public moon phase guide · No answers required") : (zh ? copy("从本次日常选择出发，看看你匹配哪种月相。") : "A playful activity-pace metaphor based on everyday choices."), tx, tall ? 1360 : 445, tw, 42, 2, zh);
      } else {
        ctx.fillStyle = "#202d38"; ctx.font = `700 ${tall ? 50 : 40}px system-ui, sans-serif`;
        ctx.fillText(zh ? copy(`${selected.length}种并列月相`) : `${selected.length} tied moon phase metaphors`, pad, tall ? 258 : 145);
        const columns = selected.length === 2 ? (tall ? 1 : 2) : 3;
        const gap = 18, cellW = (w - pad * 2 - gap * (columns - 1)) / columns;
        const cellH = tall ? (selected.length === 2 ? 620 : 440) : (selected.length === 2 ? 320 : 118);
        selected.forEach((id, i) => {
          const person = moonPhasePresentations[id], x = pad + (i % columns) * (cellW + gap), y = (tall ? 350 : 174) + Math.floor(i / columns) * cellH;
          const side = selected.length === 2 ? (tall ? 220 : 140) : (tall ? 152 : 78);
          const px = tall ? x + (cellW - side) / 2 : x;
          ctx.drawImage(pictures[i], px, y, side, side);
          const tx = tall ? x : x + side + 14, ty = tall ? y + side + 48 : y + 30, tw = tall ? cellW : cellW - side - 14;
          ctx.fillStyle = "#202d38"; ctx.font = `700 ${selected.length === 2 ? 36 : tall ? 30 : 24}px system-ui, sans-serif`;
          drawText(ctx, copy(person.name[locale]), tx, ty, tw, selected.length === 2 ? 46 : 32, 2, zh);
          ctx.fillStyle = "#85683a"; ctx.font = `500 ${selected.length === 2 ? 28 : tall ? 26 : 20}px system-ui, sans-serif`;
          drawText(ctx, copy(person.conclusion[locale]), tx, ty + (selected.length === 2 ? 110 : tall ? 70 : 44), tw, selected.length === 2 ? 38 : 29, tall ? 3 : 2, zh);
        });
      }
      ctx.fillStyle = "#6d6658"; ctx.font = `500 ${tall ? 28 : 22}px system-ui, sans-serif`;
      drawText(ctx, publicGuide ? (zh ? copy("公开月相意象指南 · 不是出生月相计算") : "Public quiz metaphor guide · Not a birth moon calculation") : (zh ? copy("问卷娱乐结果，不是出生月相计算。") : "Entertainment questionnaire result · Not a birth moon calculation"), pad, h - (tall ? 180 : 64), w - pad * 2, 34, 2, zh);
      ctx.font = `500 ${tall ? 25 : 20}px system-ui, sans-serif`;
      drawText(ctx, `fermatmind.com/${displayLocale}/tests/explore/moon-phase`, pad, h - (tall ? 82 : 24), w - pad * 2, 32, 1, false);
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error("PNG unavailable")), "image/png"));
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
      const url = URL.createObjectURL(blob); objectUrl.current = url; setPreview(url);
      if (share) {
        try {
          const file = typeof File === "function" ? new File([blob], filename, { type: "image/png" }) : undefined;
          if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
            await navigator.share({ files: [file], title: publicGuide ? (zh ? copy("月相公开指南") : "Public moon phase guide") : (zh ? copy("我的月相") : "My moon phase metaphors"), url: publicUrl });
            setMessage(zh ? copy("已完成分享。") : "Shared."); return;
          }
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") { setMessage(zh ? copy("已取消分享，仍可保存下方图片。") : "Sharing canceled. You can still save the image below."); return; }
          setMessage(zh ? copy("未能打开系统分享，请保存下方图片。") : "Could not open system sharing. Save the image below."); return;
        }
        setMessage(zh ? copy("此浏览器不支持直接分享图片，请保存下方PNG。") : "This browser cannot share images directly. Save the PNG below."); return;
      }
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; anchor.click();
      setMessage(zh ? copy("PNG已生成；若未开始下载，请长按预览图或使用下方下载链接。") : "PNG ready. If the download did not start, save the preview or use the download link below.");
    } catch { setMessage(zh ? copy("暂时无法生成图片，请重试；也可以截图或复制公开链接。") : "Could not create the image. Try again, take a screenshot, or copy the public link."); }
    finally { setBusy(false); }
  }
  return <section className="space-y-4 rounded-xl border border-amber-200 bg-white p-5 sm:p-6" aria-label={zh ? copy("保存与分享月相卡片") : "Save and share your Moon Phase card"} data-moon-phase-sharing>
    <h3 className="text-xl font-semibold">{publicGuide ? (zh ? copy("保存这份公开阅读指南卡片") : "Save this public reading guide card") : (zh ? copy("把这次月相结果做成卡片") : "Make a card of your moon phase metaphors")}</h3>
    <p className="text-sm leading-7 text-slate-600">{publicGuide ? (zh ? copy("这张PNG介绍当前公开指南，不表示你已获得这一结果。图片在本浏览器生成，无需先答题。") : "This PNG introduces the public guide, without assigning it to you as a result. Your browser creates it; no prior answers are needed.") : zh ? copy("本浏览器生成PNG，包含本次全部最高月相的名称与阅读主题，不含答案或次数。保存或主动分享图片才会带出这些月相；公开链接只打开指南或测试入口。") : "Your browser creates a PNG with every tied metaphor’s name and choice theme, without answers or counts. Saving or sharing includes these names; the public link opens a guide or the quiz entry."}</p>
    <label className="flex flex-wrap items-center gap-3 font-medium">{zh ? copy("图片尺寸") : "Image size"}<select className="min-h-11 rounded-lg border border-slate-300 bg-white px-3" value={format} disabled={busy} onChange={e => { setFormat(e.target.value as Format); setPreview(""); setMessage(""); if (objectUrl.current) { URL.revokeObjectURL(objectUrl.current); objectUrl.current = ""; } }}><option value="landscape">{zh ? copy("横版") : "Landscape"} · 1200 × 630</option><option value="portrait">{zh ? copy("竖版") : "Portrait"} · 1080 × 1920</option></select></label>
    <div className="flex flex-wrap gap-3">
      <button disabled={busy} className="min-h-11 rounded-lg bg-emerald-900 px-5 py-3 font-semibold text-white disabled:opacity-50" onClick={() => void generate(false)}>{busy ? (zh ? copy("正在生成…") : "Creating…") : (zh ? copy("保存月相卡片") : "Save Moon Phase card")}</button>
      <button disabled={busy} className="min-h-11 rounded-lg border border-slate-300 px-5 py-3 font-semibold disabled:opacity-50" onClick={() => void generate(true)}>{zh ? copy("分享月相图片") : "Share Moon Phase image"}</button>
      <button className="min-h-11 px-2 py-3 font-semibold underline" onClick={() => void copyLink()}>{zh ? copy("复制公开链接") : "Copy public link"}</button>
    </div>
    {message && <p role="status" className="text-sm leading-7">{message}</p>}
    {manualLink && <textarea readOnly value={manualLink} onFocus={e => e.target.select()} aria-label={zh ? copy("公开链接手动复制") : "Public link for manual copying"} className="min-h-24 w-full rounded-lg border border-slate-300 p-3" />}
    {preview && <a href={preview} download={filename} aria-label={zh ? copy("下载已生成的月相PNG") : "Download the generated Moon Phase PNG"} className="block space-y-2 font-semibold underline"><span>{zh ? copy("下载PNG；手机也可长按预览保存") : "Download PNG, or save the preview on mobile"}</span><Image unoptimized src={preview} width={sizes[format][0]} height={sizes[format][1]} alt={publicGuide ? (zh ? copy(`公开阅读指南：${selected.map(id => moonPhasePresentations[id].name.zh).join("、")}`) : `Public reading guide: ${selected.map(id => moonPhasePresentations[id].name.en).join(", ")}`) : zh ? copy(`我的月相：${selected.map(id => moonPhasePresentations[id].name.zh).join("、")}`) : `My moon phase metaphors: ${selected.map(id => moonPhasePresentations[id].name.en).join(", ")}`} className="h-auto max-h-[42rem] max-w-full rounded-lg" /></a>}
  </section>;
}
