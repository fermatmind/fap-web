"use client";

import { useEffect, useRef, useState } from "react";
import NextImage from "next/image";
import { useQuestionnaireDisplayCopy } from "./TraditionalQuestionnaireCopy";
import { hasTraditionalArchetype } from "@/lib/i18n/traditionalArchetypePaths";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnairePath } from "@/lib/questionnaires/paths";

export const fantasyCardSlugs = ["soldier-poet-king-quiz", "avatar-bender-quiz", "patronus-quiz"];

function lines(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, width: number, height: number, zh: boolean) {
  let line = "", row = 0;
  for (const word of zh ? [...value] : value.split(" ")) {
    const next = line + (line && !zh ? " " : "") + word;
    if (line && ctx.measureText(next).width > width) { ctx.fillText(line, x, y + row++ * height); line = word; }
    else line = next;
  }
  if (line) ctx.fillText(line, x, y + row * height);
}

/** The image is made locally. Only the user's explicit save/share action exports the public result names. */
export function FantasyPersonalCard({ quiz, ids, locale }: { quiz: Questionnaire; ids: string[]; locale: Locale }) {
  const display = useQuestionnaireDisplayCopy();
  const traditional = display.traditional && (hasTraditionalArchetype(quiz.slug) || quiz.slug === "patronus-quiz");
  const copy = traditional ? display.displayText : (value: string) => value;
  const displayLocale = traditional ? "zh-TW" : locale;
  const zh = locale === "zh", profiles = quiz.profiles.filter(p => ids.includes(p.id));
  const [preview, setPreview] = useState(""), [busy, setBusy] = useState(false), [message, setMessage] = useState("");
  const [tall, setTall] = useState(false);
  const objectUrl = useRef("");
  useEffect(() => () => { if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); }, []);
  if (!fantasyCardSlugs.includes(quiz.slug) || !profiles.length) return null;
  async function generate(share: boolean) {
    if (busy) return;
    setBusy(true); setMessage("");
    try {
      await document.fonts.ready;
      if (traditional && !Array.from(document.fonts).some(face => face.family === "FermatFantasyTaiwan" && face.status === "loaded")) {
        const face = new FontFace("FermatFantasyTaiwan", "url(/fonts/noto-sans-tc/archetype-questionnaire-700.ttf)");
        await face.load();
        document.fonts.add(face);
      }
      const fontFamily = traditional ? "FermatFantasyTaiwan, system-ui, sans-serif" : "system-ui, sans-serif";
      const pictures = await Promise.all(profiles.map(p => new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image(); img.onload = () => resolve(img); img.onerror = () => reject(new Error("Artwork unavailable"));
        img.src = `/images/quiz-portraits/${quiz.slug}/${p.id}.svg`;
      })));
      const canvas = document.createElement("canvas"); canvas.width = tall ? 1080 : 1200;
      canvas.height = tall ? Math.max(1920, 270 + profiles.length * 190) : Math.max(630, 270 + profiles.length * 190);
      const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Canvas unavailable");
      const w = canvas.width, h = canvas.height, pad = 48;
      ctx.fillStyle = "#111e30"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#dbbf83"; ctx.font = `600 25px ${fontFamily}`;
      ctx.fillText(zh ? copy("费马测试 · 我的本次结果") : "FERMATMIND · MY QUIZ RESULT", pad, 56);
      ctx.fillStyle = "#ffffff"; ctx.font = `700 38px ${fontFamily}`;
      lines(ctx, quiz.title[locale], pad, 118, w - pad * 2, 48, zh);
      const cell = (h - 270) / profiles.length;
      if (tall && profiles.length === 1) {
        const profile = profiles[0];
        ctx.strokeStyle = "#34465f"; ctx.lineWidth = 2; ctx.strokeRect(32, 220, w - 64, 1500);
        ctx.drawImage(pictures[0], 240, 280, 600, 600);
        ctx.textAlign = "center";
        ctx.fillStyle = "#dbbf83"; ctx.font = `700 76px ${fontFamily}`;
        lines(ctx, profile.title[locale], w / 2, 1040, w - pad * 2, 90, zh);
        ctx.fillStyle = "#ffffff"; ctx.font = `600 42px ${fontFamily}`;
        lines(ctx, profile.headline[locale], w / 2, 1160, w - 100, 60, zh);
        ctx.fillStyle = "#bec9d8"; ctx.font = `400 32px ${fontFamily}`;
        lines(ctx, profile.summary[locale], w / 2, 1370, w - 140, 48, zh);
        ctx.textAlign = "left";
      } else profiles.forEach((profile, i) => {
        const side = Math.min(cell - 24, tall ? 340 : 210), y = 175 + i * cell + (cell - side) / 2;
        ctx.drawImage(pictures[i], pad, y, side, side);
        const x = pad + side + 30, width = w - x - pad;
        ctx.fillStyle = "#dbbf83"; ctx.font = `700 ${tall ? 38 : 32}px ${fontFamily}`;
        lines(ctx, profile.title[locale], x, y + 42, width, 44, zh);
        ctx.fillStyle = "#e4eaf2"; ctx.font = `400 ${tall ? 29 : 25}px ${fontFamily}`;
        lines(ctx, profile.headline[locale], x, y + 104, width, tall ? 40 : 34, zh);
      });
      ctx.fillStyle = "#bec9d8"; ctx.font = `400 22px ${fontFamily}`;
      ctx.fillText(profiles.length > 1 ? (quiz.slug === "patronus-quiz" ? (zh ? copy("全部最近并列 · 不分主次 · 娱乐意象") : "All equally nearest images · No priority · For fun") : (zh ? copy("全部最高并列 · 不分主次 · 娱乐联想") : "All highest ties · No priority · For fun")) : (zh ? copy("原创娱乐联想 · 不代表固定性格") : "Original entertainment quiz · Not a fixed identity"), pad, h - 68);
      ctx.font = `400 20px ${fontFamily}`;
      ctx.fillText(`fermatmind.com${questionnairePath(displayLocale, quiz.slug)}`, pad, h - 28);
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error("PNG unavailable")), "image/png"));
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
      objectUrl.current = URL.createObjectURL(blob); setPreview(objectUrl.current);
      const filename = `fermatmind-${quiz.slug}-${displayLocale}.png`;
      if (share) {
        const file = new File([blob], filename, { type: "image/png" });
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          try { await navigator.share({ files: [file], title: quiz.title[locale], url: `https://fermatmind.com${questionnairePath(displayLocale, quiz.slug)}` }); }
          catch (error) { if (!(error instanceof Error && error.name === "AbortError")) throw error; setMessage(zh ? copy("分享已取消，可自行保存预览图。") : "Sharing canceled. You can save the preview."); return; }
          setMessage(zh ? copy("分享已完成。") : "Shared."); return;
        }
        setMessage(zh ? copy("此浏览器不支持图片分享，请保存下方PNG。") : "Image sharing is unavailable. Save the PNG below."); return;
      }
      const anchor = document.createElement("a"); anchor.href = objectUrl.current; anchor.download = filename; anchor.click();
      setMessage(zh ? copy("PNG已生成，也可长按下方预览图保存。") : "PNG ready. You can also save the preview below.");
    } catch { setMessage(zh ? copy("图片暂未生成，请重试或使用复制结果与链接。") : "Could not create the image. Retry or copy the result and link."); }
    finally { setBusy(false); }
  }
  return <section className="my-6 space-y-4 rounded-xl border border-slate-300 p-5" aria-label={zh ? copy("保存与分享本次结果图片") : "Save and share your result image"}>
    <h3 className="text-xl font-semibold">{zh ? copy("保存你的结果卡") : "Save your result card"}</h3>
    <p className="text-sm leading-7">{quiz.slug === "patronus-quiz" ? (zh ? copy("图片在本浏览器生成，保留本轮全部最近并列的守护意象，不含逐题选择、六维计数或距离。链接只打开公开测试。") : "Created in your browser with every equally nearest guardian, without answers, dimension counts or distances. The link opens the public quiz.") : (zh ? copy("图片在本浏览器生成，保留全部最高并列，不含逐题选择或分数。链接只打开公开测试。") : "Created in your browser with every highest tie, without answers or scores. The link opens the public quiz.")}</p>
    <label className="flex min-h-11 items-center gap-3"><input type="checkbox" checked={tall} disabled={busy} onChange={e => { setTall(e.target.checked); setPreview(""); }} />{zh ? copy("使用竖版图片") : "Use a portrait image"}</label>
    <div className="flex flex-wrap gap-3">
      <button disabled={busy} className="min-h-11 rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white disabled:opacity-50" onClick={() => void generate(false)}>{busy ? (zh ? copy("正在生成…") : "Creating…") : (zh ? copy("保存结果图片") : "Save result image")}</button>
      <button disabled={busy} className="min-h-11 rounded-lg border border-slate-400 px-5 py-3 font-semibold" onClick={() => void generate(true)}>{zh ? copy("分享结果图片") : "Share result image"}</button>
    </div>
    {preview && <><NextImage unoptimized src={preview} width={tall ? 1080 : 1200} height={tall ? Math.max(1920, 270 + profiles.length * 190) : Math.max(630, 270 + profiles.length * 190)} alt={zh ? copy("本次结果卡预览") : "Your result card preview"} className="h-auto w-full max-w-xl rounded-lg" /><a className="inline-flex min-h-11 items-center underline" href={preview} download={`fermatmind-${quiz.slug}-${displayLocale}.png`}>{zh ? copy("下载PNG图片") : "Download PNG image"}</a></>}
    {message && <p role="status" className="text-sm leading-7">{message}</p>}
  </section>;
}
