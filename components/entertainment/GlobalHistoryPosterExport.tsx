"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { GLOBAL_HISTORY_SLUG, GLOBAL_HISTORY_VERSION, globalHistoryFilename, globalHistoryPortraitPath } from "@/lib/entertainment/global-history/config";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { recordEntertainmentActivity } from "@/lib/entertainment/activity";

export type HistoryPosterContent = {
  name: string;
  title: string;
  description: string;
  detail?: string;
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
  for (const part of text.match(/[A-Za-z0-9'’-]+|\s+|[^\s]/gu) ?? []) {
    if (line && context.measureText(line + part).width > width) {
      lines.push(line.trimEnd());
      line = part.trimStart();
    } else {
      line += part;
    }
  }
  if (line) lines.push(line.trimEnd());
  return lines.slice(0, 3);
}

async function renderPoster(id: string, url: string, content: HistoryPosterContent) {
  const [portrait, { default: QRCode }] = await Promise.all([
    loadPortrait(id), import("qrcode"), document.fonts.ready,
  ]);
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 1200;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable");

  context.fillStyle = "#101715";
  context.fillRect(0, 0, canvas.width, canvas.height);
  const side = Math.min(portrait.naturalWidth, portrait.naturalHeight);
  context.drawImage(portrait, (portrait.naturalWidth - side) / 2, (portrait.naturalHeight - side) / 2, side, side, 0, 0, 900, 900);
  const shade = context.createLinearGradient(0, 280, 0, 850);
  shade.addColorStop(0, "rgba(16, 23, 21, 0)");
  shade.addColorStop(1, "#101715");
  context.fillStyle = shade;
  context.fillRect(0, 280, 900, 570);

  context.fillStyle = "#f5eee0";
  context.font = "700 58px system-ui, sans-serif";
  context.fillText(content.name, 52, 704, 796);
  context.fillStyle = "#e6c599";
  context.font = "700 39px system-ui, sans-serif";
  context.fillText(content.title, 52, 770, 796);
  context.fillStyle = "#f5eee0";
  context.font = "30px system-ui, sans-serif";
  wrapText(context, content.description, 796).forEach((line, index) => context.fillText(line, 52, 835 + index * 42));
  if (content.detail) {
    context.font = "24px system-ui, sans-serif";
    context.fillText(content.detail, 52, 975, 796);
  }

  const qr = await QRCode.toCanvas(url, { width: 142, margin: 2, color: { dark: "#101715", light: "#f5eee0" } });
  context.drawImage(qr, 52, 1015);
  context.font = "700 34px system-ui, sans-serif";
  context.fillText("FermatMind.com", 224, 1100);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("PNG export failed")), "image/png");
  });
}

export function GlobalHistoryPosterExport({ id, locale, url, content, saveLabel, openLabel, saveClassName }: {
  id: string;
  locale: DisplayLocale;
  url: string;
  content: HistoryPosterContent;
  saveLabel: string;
  openLabel: string;
  saveClassName?: string;
}) {
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
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

  async function exportPoster(download: boolean) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setFailed(false);
    try {
      if (!objectUrl.current) {
        const blob = await renderPoster(id, url, content);
        if (!mounted.current) return;
        objectUrl.current = URL.createObjectURL(blob);
      }
      const src = objectUrl.current;
      setPreview(src);
      if (download) {
        const link = document.createElement("a");
        link.href = src;
        link.download = filename;
        document.body.append(link);
        link.click();
        link.remove();
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
    {preview && <figure data-history-poster-preview style={{ gridColumn: "1 / -1", margin: 0 }}>
      <Image src={preview} alt={content.name} width={900} height={1200} unoptimized
        style={{ width: "min(100%, 420px)", height: "auto", WebkitTouchCallout: "default" }} />
      <figcaption>{zh ? "长按图片可保存。" : traditional ? "長按圖片可儲存。" : "Press and hold the image to save it."}</figcaption>
    </figure>}
  </>;
}
