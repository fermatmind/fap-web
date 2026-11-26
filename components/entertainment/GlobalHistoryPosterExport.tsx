"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { GLOBAL_HISTORY_SLUG, GLOBAL_HISTORY_VERSION, globalHistoryFilename, globalHistoryPath, globalHistoryPortraitPath } from "@/lib/entertainment/global-history/config";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { recordEntertainmentActivity } from "@/lib/entertainment/activity";
import styles from "./GlobalHistoryResultV2.module.css";

export type HistoryPosterContent = {
  name: string;
  title: string;
  description: string;
  traits?: readonly string[];
};

function loadPortrait(id: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Portrait could not be loaded"));
    image.src = globalHistoryPortraitPath(id);
  });
}

function wrapText(context: CanvasRenderingContext2D, text: string, width: number) {
  const lines: string[] = [];
  let line = "";
  for (const part of text.match(/[\p{Script=Latin}\p{N}'’-]+|\s+|[^\s]/gu) ?? []) {
    if (line && context.measureText(line + part).width > width) {
      lines.push(line.trimEnd());
      line = part.trimStart();
    } else {
      line += part;
    }
  }
  if (line) lines.push(line.trimEnd());
  return lines;
}

const posterCopy = {
  zh: { match: "你的历史同频人物", profile: "全球卷 · 历史人物卡", traits: "性格关键词", scan: "扫码 12 题，测测你的历史同频人物" },
  "zh-TW": { match: "你的歷史同頻人物", profile: "全球篇 · 歷史人物卡", traits: "性格關鍵字", scan: "掃碼 12 題，測測你的歷史同頻人物" },
  en: { match: "Your historical match", profile: "World Edition · Historical portrait", traits: "Core traits", scan: "Scan · 12 questions to find your historical match" },
} as const;

async function renderPoster(id: string, url: string, content: HistoryPosterContent, locale: DisplayLocale, matched: boolean) {
  const [portrait, { default: QRCode }] = await Promise.all([
    loadPortrait(id), import("qrcode"), document.fonts.ready,
  ]);
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 1200;
  const drawing = canvas.getContext("2d");
  if (!drawing) throw new Error("Canvas is unavailable");
  const context: CanvasRenderingContext2D = drawing;

  const copy = posterCopy[locale];
  const gold = "#e3c591";
  const paper = "#fff0d4";
  const serif = 'Georgia, "Noto Serif SC", "Noto Serif TC", serif';
  const sans = '"Noto Sans SC", "Noto Sans TC", system-ui, sans-serif';
  const background = context.createRadialGradient(450, 290, 30, 450, 400, 770);
  background.addColorStop(0, "#455745");
  background.addColorStop(1, "#16231b");
  context.fillStyle = background;
  context.fillRect(0, 0, 900, 1200);
  context.strokeStyle = "#a59167";
  context.lineWidth = 2;
  context.strokeRect(22, 22, 856, 1156);
  context.strokeStyle = "#6b634b";
  context.lineWidth = 1;
  context.strokeRect(32, 32, 836, 1136);

  function lines(text: string, x: number, centerY: number, width: number, maxLines: number,
    size: number, weight: number, color: string, family = sans, align: CanvasTextAlign = "center") {
    let wrapped: string[];
    for (;;) {
      context.font = `${weight} ${size}px ${family}`;
      wrapped = maxLines === 1 ? [text] : wrapText(context, text, width);
      if ((wrapped.length <= maxLines && wrapped.every(line => context.measureText(line).width <= width)) || size <= 12) break;
      size -= 2;
    }
    context.textAlign = align;
    context.textBaseline = "middle";
    context.fillStyle = color;
    const step = size * 1.25;
    const visible = wrapped.slice(0, maxLines);
    for (const [index, line] of visible.entries()) {
      context.fillText(line, x, centerY + (index - (visible.length - 1) / 2) * step, width);
    }
  }

  lines("FERMATMIND", 450, 73, 660, 1, 24, 800, gold);
  lines(matched ? copy.match : copy.profile, 450, 113, 710, 1, 34, 700, paper, serif);

  const side = Math.min(portrait.naturalWidth, portrait.naturalHeight);
  context.save();
  context.beginPath();
  context.arc(450, 325, 165, 0, Math.PI * 2);
  context.clip();
  context.drawImage(portrait, (portrait.naturalWidth - side) / 2, (portrait.naturalHeight - side) / 2, side, side, 285, 160, 330, 330);
  context.restore();
  context.strokeStyle = gold;
  context.lineWidth = 3;
  context.beginPath();
  context.arc(450, 325, 171, 0, Math.PI * 2);
  context.stroke();
  context.strokeStyle = "#9d875e";
  context.lineWidth = 1;
  context.beginPath();
  context.arc(450, 325, 179, 0, Math.PI * 2);
  context.stroke();

  const plate = context.createLinearGradient(58, 0, 842, 0);
  plate.addColorStop(0, "#c19b62");
  plate.addColorStop(.48, "#efdab0");
  plate.addColorStop(1, "#c19b62");
  context.fillStyle = plate;
  context.fillRect(60, 518, 780, 114);
  context.strokeStyle = "#f1dbac";
  context.strokeRect(66, 524, 768, 102);
  lines(content.name, 450, 577, 728, 1, 68, 750, "#291f16", serif);

  context.beginPath();
  context.roundRect(163, 651, 574, 55, 27);
  context.strokeStyle = "#ab976b";
  context.lineWidth = 2;
  context.stroke();
  lines(content.title, 450, 680, 540, 1, 32, 750, gold);

  const traits = content.traits ?? [];
  if (traits.length) {
    lines(copy.traits, 450, 745, 660, 1, 22, 750, gold);
    const gap = 12;
    const width = (780 - gap * (traits.length - 1)) / traits.length;
    for (const [index, trait] of traits.entries()) {
      const x = 60 + index * (width + gap);
      context.fillStyle = "#1c2a21";
      context.fillRect(x, 768, width, 62);
      context.strokeStyle = "#8f7d58";
      context.lineWidth = 1;
      context.strokeRect(x, 768, width, 62);
      lines(trait, x + width / 2, 800, width - 20, 2, 24, 650, paper);
    }
  }
  lines(content.description, 450, 906, 720, 3, 33, 550, paper, serif);

  const qr = await QRCode.toCanvas(new URL(globalHistoryPath(locale), url).href, {
    width: 136, margin: 4, errorCorrectionLevel: "M", color: { dark: "#111c15", light: "#fff3d6" },
  });
  context.fillStyle = "#d7b982";
  context.fillRect(33, 1009, 834, 158);
  context.drawImage(qr, 55, 1020);
  lines(copy.scan, 222, 1070, 604, 2, 34, 800, "#261e15", sans, "left");
  lines("FermatMind.com", 222, 1134, 604, 1, 28, 750, "#362819", sans, "left");
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("PNG export failed")), "image/png");
  });
}

export function GlobalHistoryPosterExport({ id, locale, url, content, saveLabel, openLabel, saveClassName, matched = false }: {
  id: string;
  locale: DisplayLocale;
  url: string;
  content: HistoryPosterContent;
  saveLabel: string;
  openLabel: string;
  saveClassName?: string;
  matched?: boolean;
}) {
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const objectUrl = useRef("");
  const pending = useRef(false);
  const mounted = useRef(false);
  const filename = globalHistoryFilename(locale, id);
  const zh = locale === "zh";
  const traditional = locale === "zh-TW";

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    };
  }, []);

  useEffect(() => {
    if (preview && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [preview]);

  async function exportPoster(download: boolean) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setFailed(false);
    try {
      if (!objectUrl.current) {
        const blob = await renderPoster(id, url, content, locale, matched);
        if (!mounted.current) return;
        objectUrl.current = URL.createObjectURL(blob);
      }
      const src = objectUrl.current;
      if (download) {
        const link = document.createElement("a");
        link.href = src;
        link.download = filename;
        document.body.append(link);
        link.click();
        link.remove();
      } else {
        setPreview(src);
      }
      recordEntertainmentActivity(GLOBAL_HISTORY_SLUG, GLOBAL_HISTORY_VERSION, locale === "en" ? "en" : "zh", "share", "single", "image");
    } catch {
      if (mounted.current) setFailed(true);
    } finally {
      pending.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  return <>
    <button type="button" className={saveClassName} disabled={busy} onClick={() => void exportPoster(true)}>{saveLabel}</button>
    <button type="button" disabled={busy} onClick={() => void exportPoster(false)}>{openLabel}</button>
    {busy && <p role="status">{zh ? "正在生成图片…" : traditional ? "正在產生圖片…" : "Creating your image…"}</p>}
    {failed && <p role="alert">{zh ? "图片生成失败，请重试。" : traditional ? "圖片產生失敗，請重試。" : "Could not create the image. Please try again."}</p>}
    {preview && <dialog ref={dialog} className={styles.posterDialog} data-history-poster-preview
      aria-labelledby="history-poster-hint" onClose={() => setPreview("")}
      onClick={event => { if (event.target === event.currentTarget) event.currentTarget.close(); }}>
      <figure className={styles.posterDialogBody}>
        <button type="button" className={styles.posterDialogClose}
          aria-label={zh ? "关闭图片" : traditional ? "關閉圖片" : "Close image"}
          onClick={() => dialog.current?.close()}><span aria-hidden="true">×</span></button>
        <Image src={preview} alt={content.name} width={900} height={1200} unoptimized />
        <figcaption id="history-poster-hint">{zh ? "长按图片即可保存" : traditional ? "長按圖片即可儲存" : "Press and hold the image to save it"}</figcaption>
      </figure>
    </dialog>}
  </>;
}
