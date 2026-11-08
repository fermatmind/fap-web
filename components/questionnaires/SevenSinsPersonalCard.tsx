"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { sevenSinsDisplay } from "@/lib/i18n/zh-TW/sevenSinsUi";
import type { DisplayLocale as Locale } from "@/lib/i18n/locales";
import type { MiniVirtuesDualResult } from "@/lib/questionnaires/miniVirtues";
import { sevenSinsCardRows } from "@/lib/questionnaires/sevenSinsCard";
import { recordEntertainmentActivity } from "@/lib/entertainment/activity";

export type SevenSinsPersonalCardProps = { result: MiniVirtuesDualResult; locale: Locale; formCode: string };
const width = 1080, height = 1440;

/** No score, answer, image or personal result is sent to a server. */
export function SevenSinsPersonalCard({ result, locale, formCode }: SevenSinsPersonalCardProps) {
  const zh = locale !== "en", rows = sevenSinsCardRows(result);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false), [message, setMessage] = useState("");
  const objectUrl = useRef("");
  useEffect(() => () => { if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); }, []);
  const publicUrl = `https://fermatmind.com/${locale}/tests/explore/seven-sins-virtues-test`;
  const filename = `fermatmind-seven-sins-result-${locale}.png`;
  if (!rows) return null;

  async function generate(share: boolean) {
    if (busy || !rows) return;
    setBusy(true); setMessage("");
    try {
      await document.fonts.ready;
      const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Canvas unavailable");
      ctx.fillStyle = "#101a2a"; ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#cab381"; ctx.font = "600 30px system-ui, sans-serif";
      ctx.fillText(zh ? sevenSinsDisplay("费马测试 · 本次作答结果", locale) : "FERMATMIND · MY RESPONSE RESULTS", 52, 65);
      ctx.fillStyle = "#f8fafc"; ctx.font = "700 48px system-ui, sans-serif";
      ctx.fillText(zh ? sevenSinsDisplay("我的七宗罪与七美德", locale) : "My Seven Deadly Sins", 52, 135);
      ctx.fillText(zh ? sevenSinsDisplay("14项分别计分", locale) : "and Seven Virtues", 52, 195);
      ctx.font = "600 32px system-ui, sans-serif";
      ctx.fillStyle = "#cab381"; ctx.fillText(zh ? sevenSinsDisplay("七美德", locale) : "Seven virtues", 52, 270);
      ctx.fillStyle = "#f19da5"; ctx.fillText(zh ? sevenSinsDisplay("七宗罪", locale) : "Seven sins", 565, 270);
      rows.forEach((row, index) => {
        const y = 330 + index * 120;
        for (const track of ["virtue", "sin"] as const) {
          const x = track === "virtue" ? 52 : 565;
          const leading = track === "virtue" ? row.leadingVirtue : row.leadingSin;
          ctx.fillStyle = track === "virtue" ? "#e6d2a9" : "#f5b3ba";
          ctx.font = "600 56px system-ui, sans-serif";
          ctx.fillText(`${leading ? "★ " : ""}${sevenSinsDisplay(row[track][locale === "en" ? "en" : "zh"], locale)}`, x, y);
          ctx.fillStyle = "#f8fafc"; ctx.font = "700 48px system-ui, sans-serif";
          ctx.fillText(`${row.scores[track]} / 100`, x, y + 55);
          ctx.fillStyle = "#324155"; ctx.fillRect(x, y + 75, 460, 4);
          ctx.fillStyle = track === "virtue" ? "#cab381" : "#d56875";
          ctx.fillRect(x, y + 75, 460 * row.scores[track] / 100, 4);
        }
      });
      ctx.fillStyle = "#e2e8f0"; ctx.font = "500 28px system-ui, sans-serif";
      const lines = zh ? [sevenSinsDisplay("★ 标出各侧全部最高项，包含并列。", locale), sevenSinsDisplay("每项来自两道题，罪与美德可以同时较高。", locale), sevenSinsDisplay("娱乐与自我反思；不是人群排名或心理诊断。", locale)]
        : ["★ marks every highest score on each side, including ties.", "Two questions per score; both sides can be high.", "For reflection, not a population rank or diagnosis."];
      lines.forEach((line, index) => ctx.fillText(line, 52, 1210 + index * 43));
      ctx.font = "500 23px system-ui, sans-serif";
      ctx.fillText(publicUrl.replace("https://", ""), 52, 1385);
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error("PNG unavailable")), "image/png"));
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
      objectUrl.current = URL.createObjectURL(blob); setPreview(objectUrl.current);
      if (share) {
        try {
          const file = new File([blob], filename, { type: "image/png" });
          if (navigator.share && navigator.canShare?.({ files: [file] })) {
            await navigator.share({ files: [file], title: zh ? sevenSinsDisplay("我的七宗罪与七美德结果", locale) : "My sins and virtues results", url: publicUrl });
            if (locale !== "zh-TW") recordEntertainmentActivity("seven-sins-virtues-test", formCode, locale, "share", "single", "system");
            setMessage(zh ? sevenSinsDisplay("已完成系统分享。", locale) : "System sharing completed."); return;
          }
          setMessage(zh ? sevenSinsDisplay("当前浏览器不支持图片分享，请保存下方预览。", locale) : "Image sharing is unavailable in this browser. Save the preview below.");
        } catch (error) {
          setMessage(error instanceof Error && error.name === "AbortError"
            ? (zh ? sevenSinsDisplay("已取消分享，未自动下载。", locale) : "Sharing cancelled. No download was started.")
            : (zh ? sevenSinsDisplay("分享未完成，可以保存下方预览后重试。", locale) : "Sharing did not complete. Save the preview or try again."));
        }
        return;
      }
      const anchor = document.createElement("a"); anchor.href = objectUrl.current; anchor.download = filename; anchor.click();
      if (locale !== "zh-TW") recordEntertainmentActivity("seven-sins-virtues-test", formCode, locale, "share", "single", "image");
      setMessage(zh ? sevenSinsDisplay("已生成PNG并请求下载；手机也可长按下方预览保存。", locale) : "PNG generated and download requested. You can also save the preview below.");
    } catch {
      setMessage(zh ? sevenSinsDisplay("图片暂未生成，请重试；仍可使用复制入口或浏览器打印。", locale) : "The image could not be generated. Try again, copy the entry link, or use browser print.");
    } finally { setBusy(false); }
  }
  return <section className="my-6 space-y-4 rounded-xl border border-slate-200 p-5 print:hidden" aria-label={zh ? sevenSinsDisplay("个人结果图片", locale) : "Personal result image"}>
    <h3 className="text-xl font-semibold">{zh ? sevenSinsDisplay("保存或分享本次14项结果", locale) : "Save or share your 14 scores"}</h3>
    <p className="text-sm leading-7">{zh ? sevenSinsDisplay("图片包含本次分数和全部最高并列项，不含原始答案。图片分享给他人后，对方可以看到这些分数；链接仍指向公开测试入口。", locale) : "The image includes your scores and every tied leader, without your answers. People you share it with can see these scores. The link opens the public test entry."}</p>
    <div className="flex flex-wrap gap-3"><button disabled={busy} onClick={() => void generate(false)} className="min-h-11 rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white disabled:opacity-50">{zh ? sevenSinsDisplay("保存结果PNG", locale) : "Save result PNG"}</button><button disabled={busy} onClick={() => void generate(true)} className="min-h-11 rounded-lg border border-slate-400 px-5 py-3 font-semibold disabled:opacity-50">{zh ? sevenSinsDisplay("分享结果图片", locale) : "Share result image"}</button></div>
    {message && <p role="status" className="text-sm leading-7">{message}</p>}
    {preview && <a href={preview} download={filename} className="block space-y-3 underline"><span>{zh ? sevenSinsDisplay("下载PNG；手机可长按图片保存", locale) : "Download PNG, or save the image on mobile"}</span><Image unoptimized src={preview} width={width} height={height} alt={rows.map(row => `${sevenSinsDisplay(row.virtue[locale === "en" ? "en" : "zh"], locale)} ${row.scores.virtue}/100${row.leadingVirtue ? " ★" : ""}; ${sevenSinsDisplay(row.sin[locale === "en" ? "en" : "zh"], locale)} ${row.scores.sin}/100${row.leadingSin ? " ★" : ""}`).join(" · ")} className="h-auto max-h-[48rem] max-w-full rounded-lg" /></a>}
  </section>;
}
