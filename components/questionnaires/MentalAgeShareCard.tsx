"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/locales";

type Format = "landscape" | "portrait";
const dimensions = { landscape: [1200, 630], portrait: [1080, 1920] } as const;

/** Personal numbers are drawn locally and never placed in a URL or an analytics payload. */
export function MentalAgeShareCard({ age, sum, locale }: { age: number; sum: number; locale: Locale }) {
  const zh = locale === "zh";
  const [format, setFormat] = useState<Format>("landscape");
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const objectUrl = useRef("");
  useEffect(() => () => { if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); }, []);

  async function generate(share: boolean) {
    if (busy) return;
    setBusy(true); setMessage("");
    try {
      await document.fonts.ready;
      const canvas = document.createElement("canvas");
      const [width, height] = dimensions[format]; canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      const tall = format === "portrait", pad = 72, top = tall ? 220 : 62;
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#102d32"); gradient.addColorStop(1, "#214e48");
      ctx.fillStyle = gradient; ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#a7f3d0"; ctx.font = '600 27px system-ui, sans-serif';
      ctx.fillText(zh ? "费马测试 · 趣味探索" : "FERMATMIND · JUST FOR FUN", pad, top);
      ctx.fillStyle = "#ffffff"; ctx.font = '600 48px system-ui, sans-serif';
      ctx.fillText(zh ? "我的娱乐心理年龄" : "My playful mental age", pad, top + 76);
      ctx.font = '700 178px system-ui, sans-serif'; ctx.fillText(String(age), pad - 8, top + (tall ? 330 : 270));
      ctx.font = '500 36px system-ui, sans-serif'; ctx.fillStyle = "#d1fae5";
      ctx.fillText(zh ? "岁 · 由12道日常选择生成" : "years · from 12 everyday choices", pad, top + (tall ? 405 : 332));
      const barY = tall ? 930 : 460, barWidth = width - pad * 2;
      ctx.fillStyle = "#52706b"; ctx.fillRect(pad, barY, barWidth, 8);
      ctx.fillStyle = "#a7f3d0"; ctx.fillRect(pad, barY, barWidth * sum / 36, 8);
      ctx.beginPath(); ctx.arc(pad + barWidth * sum / 36, barY + 4, 12, 0, Math.PI * 2); ctx.fill();
      ctx.font = '500 25px system-ui, sans-serif';
      ctx.fillText(zh ? "尝新" : "New experiences", pad, barY + 52);
      ctx.textAlign = "right"; ctx.fillText(zh ? "熟悉" : "Familiar choices", width - pad, barY + 52); ctx.textAlign = "left";
      const foot = tall ? 1400 : 566;
      ctx.fillStyle = "#ffffff"; ctx.font = '500 25px system-ui, sans-serif';
      ctx.fillText(zh ? "仅供娱乐，不衡量智力或成熟度" : "For fun. Not a measure of IQ or maturity.", pad, foot);
      ctx.fillStyle = "#a7f3d0"; ctx.font = '500 23px system-ui, sans-serif';
      ctx.fillText(`fermatmind.com/${locale}/tests/explore/mental-age`, pad, foot + 40);
      if (tall) {
        ctx.fillStyle = "#d1fae5"; ctx.font = '500 29px system-ui, sans-serif';
        ctx.fillText(zh ? "我的选择，我的当下。你的结果呢？" : "A snapshot of my choices. What about yours?", pad, 1150);
        ctx.font = '400 25px system-ui, sans-serif';
        ctx.fillText(zh ? "免费测试 · 无需注册 · 公开计算方法" : "Free quiz · No signup · Transparent calculation", pad, 1210);
      }
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error("PNG unavailable")), "image/png"));
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
      const url = URL.createObjectURL(blob); objectUrl.current = url; setPreview(url);
      const file = new File([blob], `fermatmind-mental-age-${locale}-${format}.png`, { type: "image/png" });
      if (share && navigator.canShare?.({ files: [file] }) && navigator.share) {
        try { await navigator.share({ files: [file] }); setMessage(zh ? "分享已完成。" : "Shared."); return; }
        catch (error) { if (error instanceof Error && error.name === "AbortError") { setMessage(zh ? "已取消分享，仍可保存下方图片。" : "Sharing canceled. You can still save the image below."); return; } }
      }
      if (share) { setMessage(zh ? "此浏览器无法直接分享图片，请保存下方图片。" : "Image sharing is unavailable here. Save the image below."); return; }
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = file.name; anchor.click();
      setMessage(zh ? "图片已生成；若未下载，请长按下方图片保存。" : "Image ready. If the download did not start, save the preview below.");
    } catch { setMessage(zh ? "图片暂时无法生成，请重试；也可以截图或复制公开入口。" : "Could not create the image. Try again, take a screenshot, or copy the public entry."); }
    finally { setBusy(false); }
  }

  return <section aria-label={zh ? "保存与分享年龄卡片" : "Save and share your age card"} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 sm:p-6" data-mental-age-sharing>
    <h3 className="text-xl font-semibold">{zh ? "把这一刻的选择做成卡片" : "Make a card of this moment"}</h3>
    <p className="text-sm leading-7 text-slate-600">{zh ? "图片含本次娱乐年龄，由本浏览器生成。保存或主动分享图片才会带出这个数字；复制公开入口仍不含年龄或答案。" : "Your browser creates the image with your playful age. Saving or sharing the image includes that number; copying the public entry still excludes your age and answers."}</p>
    <label className="flex flex-wrap items-center gap-3 font-medium">{zh ? "图片尺寸" : "Image size"}<select className="min-h-11 rounded-lg border border-slate-300 bg-white px-3" value={format} onChange={event => { setFormat(event.target.value as Format); setPreview(""); setMessage(""); }} disabled={busy}><option value="landscape">{zh ? "横版" : "Landscape"} · 1200 × 630</option><option value="portrait">{zh ? "竖版" : "Portrait"} · 1080 × 1920</option></select></label>
    <div className="flex flex-wrap gap-3"><button className="min-h-11 rounded-lg bg-emerald-900 px-5 py-3 font-semibold text-white disabled:opacity-50" disabled={busy} onClick={() => void generate(false)}>{busy ? (zh ? "正在生成…" : "Creating…") : (zh ? "保存年龄分享卡" : "Save age card")}</button><button className="min-h-11 rounded-lg border border-slate-300 px-5 py-3 font-semibold disabled:opacity-50" disabled={busy} onClick={() => void generate(true)}>{zh ? "分享年龄图片" : "Share age image"}</button></div>
    {message && <p role="status" className="text-sm leading-7">{message}</p>}
    {preview && <a href={preview} download={`fermatmind-mental-age-${locale}-${format}.png`} aria-label={zh ? "下载已生成的年龄图片" : "Download the generated age image"}><Image unoptimized width={dimensions[format][0]} height={dimensions[format][1]} className="mt-4 h-auto max-h-[42rem] max-w-full rounded-lg" src={preview} alt={zh ? `我的娱乐心理年龄：${age}岁。仅供娱乐，不衡量智力或成熟度。` : `My playful mental age: ${age} years. For fun, not a measure of IQ or maturity.`} /></a>}
  </section>;
}
