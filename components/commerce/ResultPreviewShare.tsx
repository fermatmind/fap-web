"use client";

import Image from "next/image";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Download, Link2, Share2, X } from "lucide-react";
import { siInstagram, siSnapchat, siTelegram, siTiktok, siWechat, siWhatsapp, siX } from "simple-icons";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { displayNavigationPath } from "@/lib/i18n/traditionalRoutes";
import type { DiscDesignPreview } from "./DiscUnlockPreview";
import type { ReasoningPreview } from "./ReasoningUnlockPreview";
import styles from "@/components/career/unlock-report-experience.module.css";

type Score = { axis: string; score: number };
export type StoryCard = { title: string; art: string; tags: string[] };

function drawPortrait(canvas: HTMLCanvasElement, name: string, highlight: string, example: string, scores: Score[], reasoning: ReasoningPreview | undefined, iqLabel: string, correctLabel: string, disc?: DiscDesignPreview, illustration?: HTMLImageElement, story?: StoryCard) {
  canvas.width = 720;
  canvas.height = 1280;
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;
  const background = ctx.createLinearGradient(0, 0, 720, 1280);
  background.addColorStop(0, "#08192a");
  background.addColorStop(.55, "#101934");
  background.addColorStop(1, "#0a1122");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, 720, 1280);

  const glow = ctx.createRadialGradient(325, 472, 32, 325, 472, 545);
  glow.addColorStop(0, "#288c9c50");
  glow.addColorStop(1, "#288c9c00");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 720, 1280);
  ctx.strokeStyle = "#99e6e11e";
  ctx.lineWidth = 1;
  for (let x = 40; x < 720; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x + 120, 440);
    ctx.lineTo(x - 150, 1080);
    ctx.stroke();
  }
  const accent = ctx.createLinearGradient(64, 0, 656, 0);
  accent.addColorStop(0, "#73eed5");
  accent.addColorStop(.55, "#80c5ff");
  accent.addColorStop(1, "#afa1ff");
  ctx.fillStyle = accent;
  ctx.fillRect(64, 175, 592, 3);
  ctx.fillRect(64, 1110, 592, 2);
  ctx.textAlign = "center";
  const text = (value: string, y: number, font: string, color = "#e8f4f7") => {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.fillText(value, 360, y, 590);
  };
  text("FERMATMIND", 125, "bold 36px sans-serif", "#d4f7f3");
  text(example, 240, "28px sans-serif", "#b7d4e4");
  text(name, 320, "bold 62px sans-serif");
  const drawIllustration = (image: HTMLImageElement) => {
    const scale = Math.min(515 / image.naturalWidth, 460 / image.naturalHeight);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    ctx.drawImage(image, (720 - width) / 2, 430 + (460 - height) / 2, width, height);
  };
  if (reasoning) {
    ctx.strokeStyle = "#91e4e13d";
    ctx.lineWidth = 2;
    for (const radius of [132, 158]) {
      ctx.beginPath();
      ctx.arc(360, 482, radius, Math.PI * 0.12, Math.PI * 1.88);
      ctx.stroke();
    }
    text(reasoning.referenceScore === null ? `${reasoning.correct} / ${reasoning.total}` : String(reasoning.referenceScore), 535, "bold 178px sans-serif", "#e6fff9");
    text(reasoning.referenceScore === null ? correctLabel : iqLabel, 584, "bold 30px sans-serif", "#ade7e7");

    reasoning.categories.forEach(({ label, items, correct }, index) => {
      const y = 724 + index * 106;
      ctx.fillStyle = "#ecf5ff";
      ctx.textAlign = "left";
      ctx.font = "bold 35px sans-serif";
      ctx.fillText(label, 64, y, 433);
      ctx.font = "bold 36px sans-serif";
      ctx.textAlign = "right";
      ctx.fillStyle = "#a9f4e3";
      ctx.fillText(`${correct} / ${items}`, 656, y);
      ctx.fillStyle = "#aec6f045";
      ctx.beginPath();
      ctx.roundRect(64, y + 22, 592, 10, 5);
      ctx.fill();
      if (correct > 0) {
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.roundRect(64, y + 22, 592 * correct / items, 10, 5);
        ctx.fill();
      }
    });
    ctx.textAlign = "center";
    text(`${correctLabel}  ${reasoning.correct} / ${reasoning.total}`, 1069, "bold 36px sans-serif", "#d6fff6");
  } else if (disc) {
    text(disc.title, 417, "bold 70px sans-serif", "#d6fff6");
    if (illustration) {
      drawIllustration(illustration);
    } else {
      text(disc.headline, 671, "bold 46px sans-serif", "#d6fff6");
    }
    disc.axes.forEach(({ code, count, total }, index) => {
      const x = 64 + index * 152;
      ctx.fillStyle = "#243c54";
      ctx.beginPath();
      ctx.roundRect(x, 920, 136, 134, 20);
      ctx.fill();
      ctx.font = "bold 31px sans-serif";
      ctx.fillStyle = "#a8e5e6";
      ctx.fillText(code, x + 68, 966);
      ctx.font = "bold 32px sans-serif";
      ctx.fillStyle = "#f0f7ff";
      ctx.fillText(`${count}/${total}`, x + 68, 1020);
    });
  } else if (story) {
    text(story.title, 409, "bold 54px sans-serif", "#d6fff6");
    if (illustration) drawIllustration(illustration);
    story.tags.slice(0, 3).forEach((tag, index) => {
      const y = 909 + index * 58;
      ctx.font = "bold 28px sans-serif";
      const width = Math.min(592, ctx.measureText(tag).width + 60);
      ctx.beginPath();
      ctx.roundRect((720 - width) / 2, y, width, 42, 21);
      ctx.fillStyle = "#b7e9ff24";
      ctx.fill();
      text(tag, y + 30, "bold 28px sans-serif", "#c9f3f3");
    });
  } else if (scores.length >= 3) {
    text(highlight, 400, "bold 40px sans-serif", "#a9e9e4");
    const point = (index: number, ratio: number) => {
      const angle = (index * 2 * Math.PI) / scores.length - Math.PI / 2;
      return [360 + Math.cos(angle) * ratio * 205, 720 + Math.sin(angle) * ratio * 205] as const;
    };
    const polygon = (ratios: number[]) => {
      ctx.beginPath();
      ratios.forEach((ratio, index) => {
        const [x, y] = point(index, ratio);
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
    };
    ctx.strokeStyle = "#8db6ca70";
    [1, .75, .5, .25].forEach(level => { polygon(scores.map(() => level)); ctx.stroke(); });
    scores.forEach(({axis, score}, index) => {
      const [x, y] = point(index, 1);
      const [labelX, labelY] = point(index, 1.19);
      ctx.beginPath();
      ctx.moveTo(360, 720);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.font = "bold 23px sans-serif";
      ctx.fillStyle = "#deedf1";
      ctx.fillText(`${axis}  ${score}`, labelX, labelY + 8);
    });
    polygon(scores.map(({ score }) => score / 100));
    ctx.fillStyle = "#72cfff48";
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 4;
    ctx.stroke();
  } else {
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#91d2ee56";
    for (let inset = 0; inset <= 80; inset += 20) {
      ctx.beginPath();
      ctx.roundRect(84 + inset, 485 + inset, 552 - 2 * inset, 445 - 2 * inset, 32);
      ctx.stroke();
    }
    text(highlight, 735, "bold 94px sans-serif", "#d6fff6");
  }
  text("fermatmind.com", 1194, "32px sans-serif", "#b7d4e4");
  return true;
}

export function ResultPreviewShare({ name, highlight, locale, samplePath, scores, reasoning, disc, story }: {
  name: string; highlight: string; locale: DisplayLocale; samplePath: string; scores?: Score[]; reasoning?: ReasoningPreview; disc?: DiscDesignPreview; story?: StoryCard;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [portrait, setPortrait] = useState("");
  const [status, setStatus] = useState("");
  const t = (zh: string, tw: string, en: string) => locale === "en" ? en : locale === "zh-TW" ? tw : zh;
  const example = t("示例结果", "示例結果", "Example result");
  const correctLabel = t("答对题数", "答對題數", "Correct answers");
  const iqLabel = t("IQ 题本预估分", "IQ 題本預估分", "Estimated IQ · Form model");
  const shareUrl = `https://fermatmind.com${samplePath}`;
  const encoded = encodeURIComponent(shareUrl);
  const resultTitle = disc?.title ?? story?.title;
  const title = resultTitle
    ? t(`分享「${resultTitle}」结果卡`, `分享「${resultTitle}」結果卡`, `Share the ${resultTitle} card`)
    : t(`分享${name}结果卡`, `分享${name}結果卡`, `Share your ${name} card`);
  const description = t("下载示例卡片，或把公开报告链接发给朋友。", "下載示例卡片，或把公開報告連結發給朋友。", "Download the example card or send a link to the public report.");
  const failed = t("操作未完成，请重试。", "操作未完成，請重試。", "Could not complete the action. Please try again.");
  useEffect(() => {
    let active = true;
    const artwork = disc?.art ?? story?.art;
    let frame = 0;
    const render = (image?: HTMLImageElement) => {
      if (!active || !canvas.current || !drawPortrait(canvas.current, name, highlight, example, scores ?? [], reasoning, iqLabel, correctLabel, disc, image, story)) return;
      frame = requestAnimationFrame(() => setPortrait(canvas.current?.toDataURL("image/png") ?? ""));
    };
    if (artwork) {
      const image = new window.Image();
      image.src = artwork;
      void image.decode().then(() => render(image), () => render());
    } else {
      render();
    }
    return () => { active = false; cancelAnimationFrame(frame); };
  }, [example, highlight, name, scores, reasoning, iqLabel, correctLabel, disc, story]);

  const card = portrait ? <Image unoptimized className={styles.previewShareCard} src={portrait} width={720} height={1280} alt={`${name} · ${example}${resultTitle ? ` · ${resultTitle}` : scores?.length ? ` · ${highlight}` : ""}${story?.tags.length ? ` · ${story.tags.join(" · ")}` : ""}${reasoning?.referenceScore == null ? "" : ` · ${iqLabel} ${reasoning.referenceScore}`}`} /> : <div className={styles.previewShareCard} aria-hidden="true" />;
  const downloadCard = (platform?: string) => {
    if (!portrait) { setStatus(failed); return; }
    const link = document.createElement("a");
    link.href = portrait;
    link.download = "fermatmind-example.png";
    link.click();
    setStatus(platform
      ? t(`已下载图片，可在 ${platform} 添加。`, `已下載圖片，可在 ${platform} 加入。`, `Image downloaded. Add it in ${platform}.`)
      : t("已下载结果卡。", "已下載結果卡。", "Assessment card downloaded."));
  };

  async function share(useSystem: boolean) {
    setStatus("");
    try {
      if (useSystem && navigator.share) {
        await navigator.share({ title: `FermatMind · ${name}`, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setStatus(t("已复制公开示例报告链接。", "已複製公開示例報告連結。", "Public sample report link copied."));
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) setStatus(failed);
    }
  }
  const platforms = [
    { name: "Instagram", color: "radial-gradient(circle at 22% 105%, #ffba48 0%, #db2879 50%, #7628ac 100%)", icon: siInstagram },
    { name: "TikTok", color: "#14212d", icon: siTiktok },
    { name: "Snapchat", color: "#ffeb43", ink: "#151b25", icon: siSnapchat },
    { name: "WhatsApp", color: "#147a44", icon: siWhatsapp, href: `https://wa.me/?text=${encoded}` },
    { name: t("微信", "WeChat", "WeChat"), icon: siWechat, color: "#197836" },
    { name: "Telegram", color: "#1179a6", icon: siTelegram, href: `https://t.me/share/url?url=${encoded}` },
    { name: "X", color: "#292b46", icon: siX, href: `https://x.com/intent/tweet?url=${encoded}` },
    { name: "LinkedIn", color: "#0966b1", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}` },
  ];

  return <section id="result-share" data-layout={reasoning ? "reasoning" : disc ? "disc" : story ? "story" : undefined} className={`${styles.previewPanel} ${styles.previewShareSection}`}>
    <canvas ref={canvas} hidden />
    <div className={styles.previewShareIntro}>{card}<div><h2>{title}</h2><p>{description}</p></div></div>
    <button type="button" className={styles.previewSharePrimary} onClick={() => { setStatus(""); dialog.current?.showModal(); }}>
      <Share2 size={17} />{t("打开分享", "開啟分享", "Open sharing")}
    </button>
    <dialog ref={dialog} className={styles.previewDialog} aria-labelledby="preview-share-title">
      <form method="dialog"><button type="submit" className={styles.previewClose} aria-label={t("关闭", "關閉", "Close")}><X size={20} /></button></form>
      {card}
      <h2 id="preview-share-title">{title}</h2>
      <p>{description}</p>
      <button type="button" className={styles.previewSharePrimary} onClick={() => void share(true)}><Share2 size={16} />{t("立即分享", "立即分享", "Share now")}</button>
      <div className={styles.previewPlatforms} role="group" aria-label={t("选择平台", "選擇平台", "Choose a platform")}>
        <p>{t("选择平台", "選擇平台", "Choose a platform")}</p>
        <div>{platforms.map(({ name: platform, icon, href, color, ink }) => {
          const symbol = icon ? <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d={icon.path} fill="currentColor" /></svg> : <strong aria-hidden="true">in</strong>;
          const buttonStyle = { "--platform-bg": color, "--platform-ink": ink } as CSSProperties;
          return href ? <a key={platform} style={buttonStyle} href={href} target="_blank" rel="noopener noreferrer" aria-label={platform} title={platform}>{symbol}</a>
            : <button key={platform} style={buttonStyle} type="button" aria-label={`${platform} · ${t("下载图片", "下載圖片", "Download image")}`} title={platform} onClick={() => downloadCard(platform)}>{symbol}</button>;
        })}</div>
      </div>
      <footer className={styles.previewShareActions}>
        <button type="button" onClick={() => void share(false)}><Link2 size={16} />{t("复制链接", "複製連結", "Copy link")}</button>
        <button type="button" onClick={() => downloadCard()}><Download size={16} />{t("下载 PNG", "下載 PNG", "Download PNG")}</button>
        <a href={displayNavigationPath("/tests", locale)}>{t("邀请朋友测一测", "邀請朋友測一測", "Invite a friend")} <ArrowUpRight size={14} /></a>
      </footer>
      <p role="status" className={styles.previewShareStatus}>{status}</p>
    </dialog>
  </section>;
}
