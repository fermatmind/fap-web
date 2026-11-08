"use client";

import { EightQuizOverview } from "./EightQuizOverview";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { eightQuizCardRows, eightQuizScene, type EightQuizResult } from "@/lib/questionnaires/eightQuizCard";

function wrap(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, width: number, lineHeight: number) {
  let line = "", lines = 0;
  const tokens = value.match(/[\u3400-\u9fff]|[^\u3400-\u9fff\s]+|\s+/gu) ?? [];
  for (const token of tokens) {
    if (line && ctx.measureText(line + token).width > width) { ctx.fillText(line.trimEnd(), x, y + lines++ * lineHeight); line = token.trimStart(); }
    else line += token;
  }
  if (line.trim()) ctx.fillText(line.trimEnd(), x, y + lines++ * lineHeight);
  return lines * lineHeight;
}

/** A local personal image; the copied URL always opens a fresh public entry. */
export function EightQuizPersonalCard({ quiz, result, locale }: { quiz: Questionnaire; result: EightQuizResult; locale: Locale }) {
  const rows = eightQuizCardRows(quiz, result, locale), zh = locale === "zh";
  const [preview, setPreview] = useState(""), [busy, setBusy] = useState(false), [message, setMessage] = useState(""), [manual, setManual] = useState("");
  const objectUrl = useRef(""), generation = useRef(0);
  useEffect(() => () => { generation.current++; if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); }, []);
  if (!rows) return null;
  const publicUrl = `https://fermatmind.com/${locale}/tests/explore/${quiz.slug}`;
  const filename = `fermatmind-${quiz.slug}-${locale}-personal.png`;
  async function copy() {
    try { await navigator.clipboard.writeText(publicUrl); setManual(""); setMessage(zh ? "已复制公开入口；新会话不会带入本次结果。" : "Public entry copied. A new session will not inherit your result."); }
    catch { setManual(publicUrl); setMessage(zh ? "请手动复制公开入口。" : "Copy the public entry manually below."); }
  }
  async function generate(share: boolean) {
    if (busy || !rows) return;
    const current = ++generation.current;
    setBusy(true); setMessage("");
    try {
      await document.fonts.ready;
      const canvas = document.createElement("canvas"), ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      const w = 1080, pad = 56, scene = quiz.slug === "sbti-test" ? `/images/quiz-portraits/sbti-test/${rows[0].id}.png` : eightQuizScene[quiz.slug];
      let picture: HTMLImageElement | undefined;
      if (scene) picture = await new Promise<HTMLImageElement>((resolve, reject) => { const image = new window.Image(); image.onload = () => resolve(image); image.onerror = () => reject(new Error("Scene unavailable")); image.src = scene; });
      if (current !== generation.current) return;
      canvas.width = w;
      // Measure every row before allocating; even all sixteen tied codes remain on the image.
      ctx.font = "500 27px system-ui, sans-serif";
      const rowHeights = rows.map(row => {
        ctx.font = "700 30px system-ui, sans-serif"; const title = wrap(ctx, `◆ ${row.title}`, 0, 0, w - pad * 2 - 48, 37);
        ctx.font = "500 27px system-ui, sans-serif"; const detail = wrap(ctx, row.detail, 0, 0, w - pad * 2 - 48, 37);
        return 60 + title + detail;
      });
      const gridHeight = quiz.slug === "moral-alignment" ? 520 : 0;
      const pictureHeight = picture ? (quiz.slug === "sbti-test" ? 380 : Math.round((w - pad * 2) * picture.naturalHeight / picture.naturalWidth)) : 0;
      canvas.height = 370 + gridHeight + (picture ? pictureHeight + 40 : 0) + rowHeights.reduce((sum, h) => sum + h, 0);
      const h = canvas.height;
      ctx.fillStyle = "#f8f4ec"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#192a35"; ctx.font = "600 25px system-ui, sans-serif"; ctx.fillText("FERMATMIND · " + (zh ? "本次个人结果" : "MY RESULT"), pad, 62);
      ctx.font = "700 43px system-ui, sans-serif"; wrap(ctx, quiz.title[locale], pad, 125, w - pad * 2, 54);
      let y = 220;
      if (picture) {
        const pictureWidth = quiz.slug === "sbti-test" ? Math.round(pictureHeight * picture.naturalWidth / picture.naturalHeight) : w - pad * 2;
        ctx.drawImage(picture, (w - pictureWidth) / 2, y, pictureWidth, pictureHeight); y += pictureHeight + 40;
      }
      if (gridHeight) {
        const order = ["lawful-good", "neutral-good", "chaotic-good", "lawful-neutral", "true-neutral", "chaotic-neutral", "lawful-evil", "neutral-evil", "chaotic-evil"];
        order.forEach((id, i) => {
          const x = pad + i % 3 * 322, top = y + Math.floor(i / 3) * 162;
          const matched = rows.some(row => row.id === id && row.matched);
          ctx.fillStyle = matched ? "#cce3d2" : "#ffffff"; ctx.fillRect(x, top, 314, 154);
          ctx.fillStyle = "#192a35"; ctx.font = "700 27px system-ui, sans-serif";
          wrap(ctx, (matched ? "◆ " : "") + quiz.profiles.find(p => p.id === id)!.title[locale], x + 14, top + 42, 286, 36);
        });
        y += gridHeight;
      }
      rows.forEach((row, i) => {
        ctx.fillStyle = row.matched ? "#deeadf" : "#ffffff"; ctx.fillRect(pad, y, w - pad * 2, rowHeights[i] - 12);
        ctx.fillStyle = "#192a35"; ctx.font = "700 30px system-ui, sans-serif";
        const titleHeight = wrap(ctx, `${row.matched ? "◆ " : ""}${row.title}`, pad + 24, y + 38, w - pad * 2 - 48, 37);
        ctx.font = "500 27px system-ui, sans-serif"; wrap(ctx, row.detail, pad + 24, y + 45 + titleHeight, w - pad * 2 - 48, 37); y += rowHeights[i];
      });
      ctx.fillStyle = "#43545c"; ctx.font = "500 23px system-ui, sans-serif";
      wrap(ctx, zh ? "仅供娱乐与自我观察 · 保留全部结果 · 无逐题答案" : "Entertainment and reflection · All matches kept · No item answers", pad, h - 82, w - pad * 2, 30);
      ctx.font = "500 22px system-ui, sans-serif"; ctx.fillText(publicUrl.replace("https://", ""), pad, h - 25);
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error("PNG unavailable")), "image/png"));
      if (current !== generation.current) return;
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
      objectUrl.current = URL.createObjectURL(blob); setPreview(objectUrl.current);
      if (share) {
        const file = new File([blob], filename, { type: "image/png" });
        if (!navigator.share || !navigator.canShare?.({ files: [file] })) { setMessage(zh ? "此浏览器不支持图片分享，可保存下方PNG。" : "Image sharing is unavailable. Save the PNG below."); return; }
        try { await navigator.share({ files: [file], title: quiz.title[locale], url: publicUrl }); setMessage(zh ? "分享完成。" : "Shared."); }
        catch (error) { setMessage(error instanceof Error && error.name === "AbortError" ? (zh ? "已取消分享。图片仍可手动保存。" : "Sharing canceled. You can still save the image.") : (zh ? "分享未完成，可手动保存图片。" : "Sharing did not complete. Save the image manually.")); }
        return;
      }
      const anchor = document.createElement("a"); anchor.href = objectUrl.current; anchor.download = filename; anchor.click();
      setMessage(zh ? "个人PNG已生成，可下载或长按保存预览。" : "Personal PNG ready. Download or save the preview on mobile.");
    } catch { setMessage(zh ? "暂时无法生成图片，可重试或复制公开入口；完整结果仍可阅读。" : "The image could not be created. Retry or copy the public entry; your full result remains readable."); }
    finally { setBusy(false); }
  }
  return <section data-eight-quiz-personal-card={quiz.slug} className="my-8 space-y-4 rounded-xl border border-slate-300 bg-white p-4 sm:p-6">
    <h3 className="text-xl font-semibold">{zh ? "保存本次个人结果卡" : "Save your personal result card"}</h3>
    <p className="text-sm leading-7">{zh ? "图片在本浏览器生成，包含本次结果和汇总读数，不含逐题回答。保存或分享由你主动选择；复制的公开入口不含本次结果。" : "Your browser creates an image of this result and its aggregate readouts, without item answers. You choose whether to save or share. The copied public entry contains no personal result."}</p>
    <div className="flex flex-wrap gap-3"><button disabled={busy} onClick={() => void generate(false)} className="min-h-11 rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white disabled:opacity-50">{zh ? "保存个人PNG" : "Save personal PNG"}</button><button disabled={busy} onClick={() => void generate(true)} className="min-h-11 rounded-lg border px-5 py-3 font-semibold">{zh ? "分享个人图片" : "Share personal image"}</button><button onClick={() => void copy()} className="min-h-11 px-3 underline">{zh ? "复制测试入口" : "Copy quiz entry"}</button></div>
    {message && <p role="status" className="text-sm leading-7">{message}</p>}
    {manual && <textarea readOnly aria-label={zh ? "手动复制测试入口" : "Quiz entry for manual copying"} value={manual} className="min-h-24 w-full border p-3" onFocus={event => event.target.select()} />}
    <details className="border-t pt-3"><summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? "比较本版结果与完整指南" : "Compare this edition’s results and full guides"}</summary><EightQuizOverview quiz={quiz} locale={locale} compact /></details>
    {preview && <a href={preview} download={filename} className="block underline"><span>{zh ? "下载个人PNG；手机可长按保存" : "Download personal PNG, or save the preview on mobile"}</span><Image unoptimized src={preview} width={1080} height={1600} alt={zh ? "本次个人结果卡预览" : "Your personal result card preview"} className="mt-3 h-auto max-h-[44rem] max-w-full rounded-lg" /></a>}
  </section>;
}
