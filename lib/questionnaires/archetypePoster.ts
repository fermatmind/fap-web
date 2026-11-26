import type { DisplayLocale } from "@/lib/i18n/locales";
import type { ArchetypeHonorCopy } from "./archetypeHonorCardCopy";
import { archetypeCardThemes, archetypePosterSize } from "./archetypeResultCard";
import { honorMetricCopy, scalePosition, type HonorResultMetrics } from "./honorResultMetrics";
import { storyHonorLabels, type StoryHonorMode } from "@/lib/entertainment/wave3aStory";
import { archetypeResultCopy } from "./archetypeResultShare";

type Poster = {
  locale: DisplayLocale;
  theme: keyof typeof archetypeCardThemes;
  shortTitle: string;
  names: string[];
  runnerUp?: string;
  reading?: ArchetypeHonorCopy;
  artwork?: string;
  age?: { value: number; unit: string; label: string };
  credit?: string;
  metrics?: HonorResultMetrics;
  storyMode?: StoryHonorMode;
  monogram: string;
  url: string;
};

async function loadArtwork(src: string | undefined) {
  if (!src) return;
  const image = new Image();
  image.src = src;
  try {
    await image.decode();
    return image;
  } catch {
    return undefined;
  }
}

export async function renderArchetypePoster(data: Poster) {
  const { default: QRCode } = await import("qrcode");
  const [qr, image] = await Promise.all([
    QRCode.toCanvas(data.url, { width: 158, margin: 4, errorCorrectionLevel: "M", color: { dark: "#231b18", light: "#ffffff" } }),
    loadArtwork(data.artwork),
    document.fonts.ready,
  ]);
  const { width, height } = archetypePosterSize;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  const copy = archetypeResultCopy[data.locale];
  const color = archetypeCardThemes[data.theme];
  const middle = width / 2;
  const footer = 1252;
  const tied = data.metrics?.tied ?? data.names.length > 1;
  const metricCopy = honorMetricCopy[data.locale];
  const tieLabel = data.metrics?.kind === "dimensions" ? data.metrics.tieLabel : undefined;
  const glow = ctx.createRadialGradient(middle, 460, 70, middle, 460, 785);
  glow.addColorStop(0, color.glow);
  glow.addColorStop(1, color.background);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = color.line;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(27, 27, width - 54, footer - 54, 31);
  ctx.stroke();

  const serif = data.locale === "zh-TW" ? '"Songti TC", "Noto Serif TC", serif'
    : data.locale === "zh" ? '"Songti SC", "Noto Serif SC", serif' : "Georgia, serif";
  const type = (size: number, display = false) => `650 ${size}px ${display ? serif : "system-ui, sans-serif"}`;
  const text = (value: string, x: number, y: number, size: number, options: { color?: string; align?: CanvasTextAlign; max?: number; display?: boolean } = {}) => {
    ctx.font = type(size, options.display);
    ctx.fillStyle = options.color ?? color.ink;
    ctx.textAlign = options.align ?? "left";
    ctx.fillText(value, x, y, options.max);
  };
  const center = (value: string, y: number, size: number, tint: string = color.ink, display = false, max = 918) =>
    text(value, middle, y, size, { color: tint, align: "center", max, display });
  const rule = (x: number, y: number, length: number, opacity: number) => {
    ctx.save();
    ctx.strokeStyle = color.line;
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + length, y);
    ctx.stroke();
    ctx.restore();
  };

  text(`${copy.brand} · ${data.shortTitle}`, 68, 98, 34, { max: 630 });
  text(tied ? tieLabel ?? copy.tied : data.metrics?.label ?? data.age?.label ?? (data.storyMode === "branch" ? storyHonorLabels[data.locale].branch : copy.closest), 1012, 98, 27, { align: "right", color: color.light, max: 292 });
  rule(68, 132, 944, .65);

  const many = data.names.length > 6;
  const panel = { width: many ? 572 : 672, y: 169, height: data.metrics ? (data.names.length > 12 ? 376 : data.names.length > 8 ? 445 : data.names.length > 5 ? 490 : 557) : many || (tied && data.reading) ? 355 : tied ? 515 : 585 };
  const left = (width - panel.width) / 2;
  const middleY = panel.y + panel.height / 2;
  const arch = { x: panel.width * .48, y: panel.height * .25 };
  const frame = new Path2D();
  frame.roundRect(left, panel.y, panel.width, panel.height, [arch, arch, 18, 18]);
  ctx.save();
  ctx.clip(frame);
  const panelGlow = ctx.createRadialGradient(middle, middleY, 10, middle, middleY, panel.width * .59);
  panelGlow.addColorStop(0, color.glow);
  panelGlow.addColorStop(1, color.background);
  ctx.fillStyle = panelGlow;
  ctx.fillRect(left, panel.y, panel.width, panel.height);

  const emblem = data.artwork?.startsWith("data:image/svg+xml");
  if (!data.age && !data.metrics && (!image || emblem)) {
    const radius = panel.height * .31;
    ctx.save();
    ctx.translate(middle, middleY);
    ctx.rotate(Math.PI / 4);
    ctx.strokeStyle = color.line;
    ctx.strokeRect(-radius, -radius, radius * 2, radius * 2);
    ctx.globalAlpha = .58;
    ctx.strokeRect(-radius + 17, -radius + 17, radius * 2 - 34, radius * 2 - 34);
    ctx.restore();
  }
  if (data.metrics) {
    if (data.metrics.kind === "dimensions" && data.metrics.rows.length) {
      const step = 96;
      const top = middleY - (data.metrics.rows.length - 1) * step / 2;
      data.metrics.rows.forEach((row, i) => {
        const y = top + i * step;
        text(row.label, left + 65, y, 30, { max: panel.width - 300 });
        text(row.value, left + panel.width - 65, y, 30, { align: "right", color: color.light, max: 156 });
        rule(left + 65, y + 29, panel.width - 130, .55);
        ctx.fillStyle = color.light;
        ctx.beginPath();
        ctx.roundRect(left + 65, y + 25, (panel.width - 130) * row.position / 100, 8, 4);
        ctx.fill();
      });
    } else if (data.metrics.kind !== "dimensions" && data.metrics.scale) {
      const { scale } = data.metrics;
      center(scale.display, middleY + 12, 108, color.ink, true, panel.width - 90);
      const start = left + 83, span = panel.width - 166, y = middleY + 128;
      rule(start, y, span, .8);
      for (let tick = 0; tick <= 12; tick++) {
        const x = start + tick / 12 * span;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - (tick % 3 === 0 ? 25 : 13));
        ctx.stroke();
      }
      scale.ticks.forEach(tick => text(String(tick), start + scalePosition(tick, scale.min, scale.max) * span / 100, y + 38, 24, { color: color.light, align: "center" }));
      const marker = start + scalePosition(scale.value, scale.min, scale.max) * span / 100;
      ctx.fillStyle = color.light;
      ctx.beginPath();
      ctx.roundRect(marker - 4, y - 49, 8, 55, 4);
      ctx.fill();
    } else {
      center(data.monogram, middleY + 56, 145, color.light, true, 255);
    }
  } else if (data.age) {
    center(String(data.age.value), 486, 230, color.ink, true);
    center(data.age.unit, 554, 48, color.light);
    const start = 296, span = 488, y = 647;
    rule(start, y, span, .8);
    for (let tick = 0; tick <= 12; tick++) {
      const x = start + tick / 12 * span;
      const major = tick % 3 === 0;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - (major ? 25 : 13));
      ctx.stroke();
      if (major) text(String(10 + tick * 5), x, y + 38, 24, { color: color.light, align: "center" });
    }
    const marker = start + (data.age.value - 10) / 60 * span;
    ctx.fillStyle = color.light;
    ctx.beginPath();
    ctx.roundRect(marker - 4, y - 49, 8, 55, 4);
    ctx.fill();
  } else if (image) {
    const scale = emblem
      ? Math.min(panel.width * .43 / image.naturalWidth, panel.height * .56 / image.naturalHeight)
      : Math.max(panel.width / image.naturalWidth, panel.height / image.naturalHeight);
    const w = image.naturalWidth * scale;
    const h = image.naturalHeight * scale;
    ctx.drawImage(image, middle - w / 2, panel.y + (panel.height - h) * (emblem ? .5 : .39), w, h);
  } else {
    const size = many ? 104 : 145;
    center(data.monogram, middleY + size * .33, size, color.light, true, 255);
  }
  ctx.restore();
  ctx.strokeStyle = color.line;
  ctx.lineWidth = 3;
  ctx.stroke(frame);
  ctx.lineWidth = 2;

  const artBottom = panel.y + panel.height;
  let tagTop = artBottom + (data.age ? 104 : data.runnerUp ? 213 : 177);
  if (tied || (data.metrics && data.names.length > 1)) {
    center(data.metrics ? (tied ? tieLabel ?? metricCopy.ties : metricCopy.axes) : data.storyMode ? storyHonorLabels[data.locale].tied : copy.tieLine, artBottom + 62, 32, color.light);
    const columns = data.metrics && data.names.length > 12 ? 3 : data.names.length > 5 ? 2 : 1;
    const size = data.names.length <= 3 ? 64 : 38;
    const step = columns === 3 ? 37 : many ? 47 : data.reading ? 53 : 70;
    data.names.forEach((name, i) => {
      const x = columns === 1 ? middle : columns === 3 ? 68 + (i % columns + .5) * 944 / columns : (i % 2 === 0 ? 299 : 781);
      text(name, x, artBottom + 134 + Math.floor(i / columns) * step, size, { align: "center", display: true, max: columns === 1 ? 900 : columns === 3 ? 296 : 445 });
    });
    tagTop = artBottom + 194 + (Math.ceil(data.names.length / columns) - 1) * step;
  } else {
    if (!data.age && data.metrics?.kind !== "practice") center(data.names[0], artBottom + 96, 82, color.ink, true);
    if (data.runnerUp) center(`${copy.runner} · ${data.runnerUp}`, artBottom + 154, 31, color.light);
  }
  if (data.metrics?.kind === "practice") tagTop = artBottom + 150;
  if (data.reading) {
    rule(268, tagTop - 26, 544, .39);
    ctx.font = type(28);
    const widths = data.reading.personalityTags.map(tag => ctx.measureText(tag).width + 52);
    const gap = 16;
    const scale = Math.min(1, (918 - gap * (widths.length - 1)) / widths.reduce((sum, w) => sum + w, 0));
    let x = (width - widths.reduce((sum, w) => sum + w * scale, 0) - gap * (widths.length - 1)) / 2;
    data.reading.personalityTags.forEach((tag, i) => {
      const pill = widths[i] * scale;
      ctx.beginPath();
      ctx.roundRect(x, tagTop, pill, 53, 26);
      ctx.stroke();
      text(tag, x + pill / 2, tagTop + 36, 28, { color: color.light, align: "center", max: pill - 24 });
      x += pill + gap;
    });
    const sentence = data.reading.soulVerdict;
    ctx.font = type(36, true);
    const units = data.locale === "en" ? sentence.split(" ") : Array.from(sentence);
    const join = (part: string[]) => part.join(data.locale === "en" ? " " : "");
    if (ctx.measureText(sentence).width <= 890) {
      center(sentence, tagTop + 114, 36, color.ink, true, 890);
    } else {
      // Balance both lines at an actual word or character boundary, without dropping text.
      const splits = units.slice(1).map((_, i) => i + 1)
        .filter(i => !/^[，。！？、；：]/u.test(units[i]));
      const split = splits.reduce((best, i) => {
        const delta = (at: number) => Math.abs(ctx.measureText(join(units.slice(0, at))).width - ctx.measureText(join(units.slice(at))).width);
        return delta(i) < delta(best) ? i : best;
      }, splits[0]);
      center(join(units.slice(0, split)), tagTop + 112, 36, color.ink, true, 890);
      center(join(units.slice(split)), tagTop + 160, 36, color.ink, true, 890);
    }
  }

  if (data.credit) center(data.credit, 1190, 25, color.light);

  ctx.fillStyle = "#ebbd73";
  ctx.fillRect(0, footer, width, height - footer);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(qr, 43, 1267);
  const scan = data.storyMode ? storyHonorLabels[data.locale] : data.metrics ? metricCopy : copy;
  text(scan.scan(data.shortTitle), 239, 1338, 38, { color: "#241a18", max: 790 });
  text(scan.scanDetail, 239, 1387, 26, { color: "#33231e", max: 790 });
  return new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("PNG unavailable")), "image/png"));
}
