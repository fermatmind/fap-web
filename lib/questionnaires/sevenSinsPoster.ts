import type { DisplayLocale } from "@/lib/i18n/locales";
import { sevenSinsCardPeaks, sevenSinsRadarPoint, sevenSinsPosterSize, type SevenSinsCardRow } from "./sevenSinsCard";
import { sevenSinsShareCopy, sevenSinsTrackLabel } from "./sevenSinsShareCopy";

const tracks = ["sin", "virtue"] as const;
const colors = { sin: "#ffa0aa", virtue: "#f5d18c" };
const ink = "#f9ebd6";

export async function renderSevenSinsPoster(rows: SevenSinsCardRow[], locale: DisplayLocale, url: string) {
  const { default: QRCode } = await import("qrcode");
  await document.fonts.ready;
  const qr = await QRCode.toCanvas(url, { width: 154, margin: 4, errorCorrectionLevel: "M", color: { dark: "#211b18", light: "#ffffff" } });
  const canvas = document.createElement("canvas");
  canvas.width = sevenSinsPosterSize.width;
  canvas.height = sevenSinsPosterSize.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  const copy = sevenSinsShareCopy[locale];
  const peaks = sevenSinsCardPeaks(rows);
  function text(value: string, x: number, y: number, size: number, color = ink, align: CanvasTextAlign = "left", maxWidth?: number) {
    ctx!.fillStyle = color;
    ctx!.font = `650 ${size}px system-ui, sans-serif`;
    ctx!.textAlign = align;
    ctx!.fillText(value, x, y, maxWidth);
  }
  const bg = ctx.createLinearGradient(0, 0, 1080, 1250);
  bg.addColorStop(0, "#31212c");
  bg.addColorStop(.65, "#151824");
  bg.addColorStop(1, "#241c24");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1080, 1440);
  ctx.strokeStyle = "#9a754a";
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, 1032, 1216);
  text(copy.name, 56, 78, 32);
  text(copy.time, 1024, 78, 23, colors.virtue, "right");

  tracks.forEach((track, index) => {
    const x = 58 + index * 488;
    const leaders = peaks[track];
    ctx.fillStyle = track === "sin" ? "#472936" : "#493a2e";
    ctx.beginPath();
    ctx.roundRect(x, 104, 476, 166, 22);
    ctx.fill();
    ctx.strokeStyle = colors[track];
    ctx.stroke();
    text(track === "sin" ? copy.shadow : copy.light, x + 20, 141, 23, colors[track]);
    text(String(Math.round(leaders[0].scores[track])), x + 450, 156, 47, colors[track], "right");
    const names = leaders.map(row => sevenSinsTrackLabel(row, track, locale));
    const middle = names.length > 4 ? Math.ceil(names.length / 2) : names.length;
    text(names.slice(0, middle).join(" · "), x + 20, 202, 30, ink, "left", 435);
    if (middle < names.length) text(names.slice(middle).join(" · "), x + 20, 237, 29, ink, "left", 435);
    else if (names.length > 1) text(copy.tied, x + 20, 238, 20, colors[track]);
  });

  const origin = { x: 540, y: 532 };
  const point = (index: number, score: number) => sevenSinsRadarPoint(index, 198 * score / 100, origin.x, origin.y);
  const polygon = (values: number[]) => {
    ctx.beginPath();
    values.forEach((value, index) => {
      const p = point(index, value);
      if (index === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
  };
  ctx.strokeStyle = "#d5ae7055";
  for (const score of [25, 50, 75, 100]) {
    polygon(rows.map(() => score));
    ctx.stroke();
  }
  rows.forEach((_, index) => {
    const outer = point(index, 100);
    const label = point(index, 118);
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(outer.x, outer.y);
    ctx.stroke();
    text(copy.pairs[index], label.x, label.y + 7, 21, ink, "center");
  });
  for (const track of tracks) {
    polygon(rows.map(row => row.scores[track]));
    ctx.fillStyle = `${colors[track]}30`;
    ctx.strokeStyle = colors[track];
    ctx.lineWidth = 5;
    ctx.fill();
    ctx.stroke();
    for (const [index, row] of rows.entries()) {
      const p = point(index, row.scores[track]);
      ctx.beginPath();
      ctx.fillStyle = colors[track];
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  tracks.forEach((track, side) => {
    const x = 64 + side * 488;
    text(copy.legend[side], x, 795, 24, colors[track]);
    rows.forEach((row, index) => {
      const y = 842 + index * 46;
      const label = sevenSinsTrackLabel(row, track, locale);
      const leading = track === "sin" ? row.leadingSin : row.leadingVirtue;
      text(leading ? `• ${label}` : label, x, y, 29);
      text(String(Math.round(row.scores[track])), x + 438, y, 29, colors[track], "right");
    });
  });
  text(copy.patterns[peaks.pattern], 540, 1199, 26, ink, "center", 951);

  ctx.fillStyle = "#ebbd73";
  ctx.fillRect(0, 1252, 1080, 188);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(qr, 46, 1269);
  text(copy.scan, 230, 1331, 37, "#251b19", "left", 805);
  text(copy.scanSub, 230, 1385, 26, "#33231f", "left", 805);

  return new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("PNG unavailable")), "image/png"));
}
