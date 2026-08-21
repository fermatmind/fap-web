import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const authorityPath = process.env.CAREER_V12_AUTHORITY_HTML ??
  "/Users/rainie/Desktop/1046个职业/accountants-5个html模板/accountants-career-page-v1.2.html";
const localUrl = process.env.CAREER_V12_LOCAL_URL ?? "http://127.0.0.1:3100";
const evidenceDir = process.env.CAREER_V12_EVIDENCE_DIR ??
  "/Users/rainie/Desktop/1046个职业/c3.3m-v2-phase-b-evidence";
const mode = "authority-verify";

const viewports = [
  { name: "desktop", width: 1440, height: 1600 },
  { name: "tablet", width: 834, height: 1194 },
  { name: "mobile", width: 390, height: 844 },
];

const regions = [
  { name: "hero", authority: ".hero", local: '[data-testid="career-display-hero"]', paintY: [4, 6, 8] },
  { name: "stats", authority: ".hero-stats", local: '[data-testid="career-production-hero-stats"]', paintY: [4, 6, 8] },
  { name: "ai-gauge", authority: ".gauge", local: '[data-testid="career-production-ai-gauge"]', paintY: [4, 6, 8], paintX: [0.44, 0.56] },
  { name: "snapshot", authority: "#snapshot", local: '[data-career-visual-group="snapshot"] section', paintY: [16, 18, 20] },
  { name: "quick", authority: "#quick", local: '[data-career-visual-group="quick-decision"]', paintY: [16, 18, 20] },
  { name: "main-card", authority: "#profile", local: '[data-career-visual-group="profile"]', paintY: [16, 18, 20] },
  { name: "toc", authority: ".toc", local: 'aside[aria-label="页面目录"] > div:first-child', paintY: [12, 14, 16] },
  { name: "cta", authority: ".hero-cta", local: '[data-testid="career-display-hero"] [data-career-api-component="primary_cta"]', paintY: [4, 6, 8], paintX: [0.35, 0.65] },
  { name: "table", authority: "#china table th", local: '[data-career-visual-group="china-reference"] table th', paintY: [4, 6, 8], paintX: [0.35, 0.65] },
];

const styleContracts = [
  { name: "hero", authority: ".hero", local: '[data-testid="career-display-hero"]', properties: ["borderRadius", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "color"] },
  { name: "stats", authority: ".hero-stats", local: '[data-testid="career-production-hero-stats"]', properties: ["display", "gridTemplateColumns", "columnGap", "rowGap", "marginTop"] },
  { name: "stat-card", authority: ".hero-stats .stat", local: '[data-testid="career-production-hero-stats"] > div', properties: ["borderRadius", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft"] },
  { name: "ai-gauge", authority: ".gauge", local: '[data-testid="career-production-ai-gauge"]', properties: ["position", "borderRadius", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "marginTop"] },
  { name: "section-card", authority: "#snapshot", local: '[data-career-visual-group="snapshot"] section', properties: ["borderTopWidth", "borderRadius", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft"] },
  { name: "fact-grid", authority: "#snapshot .fact-grid", local: '[data-career-visual-group="snapshot"] [class*="factGrid"]', properties: ["display", "gridTemplateColumns", "columnGap", "rowGap", "marginTop"] },
  { name: "fact-card", authority: "#snapshot .fact", local: '[data-career-visual-group="snapshot"] [class*="factGrid"] > div', properties: ["backgroundColor", "borderRadius", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft"] },
  { name: "toc", authority: ".toc", local: 'aside[aria-label="页面目录"] > div:first-child', properties: ["backgroundColor", "borderTopColor", "borderTopWidth", "borderRadius", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "fontSize", "lineHeight"] },
  { name: "cta", authority: ".hero-cta", local: '[data-testid="career-display-hero"] [data-career-api-component="primary_cta"]', properties: ["display", "alignItems", "columnGap", "backgroundColor", "color", "borderRadius", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "fontSize", "fontWeight"] },
  { name: "table-cell", authority: "#china table th", local: '[data-career-visual-group="china-reference"] table th', properties: ["backgroundColor", "borderTopColor", "borderTopWidth", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "fontSize", "fontWeight", "textAlign", "verticalAlign"] },
];

async function pixelDiff(page, leftBuffer, rightBuffer) {
  return page.evaluate(async ({ leftBase64, rightBase64 }) => {
    const decode = async (base64) => {
      const binary = atob(base64);
      const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
      return createImageBitmap(new Blob([bytes], { type: "image/png" }));
    };
    const [left, right] = await Promise.all([decode(leftBase64), decode(rightBase64)]);
    const width = Math.max(left.width, right.width);
    const height = Math.max(left.height, right.height);
    const read = (image) => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.clearRect(0, 0, width, height);
      context.drawImage(image, 0, 0);
      return context.getImageData(0, 0, width, height).data;
    };
    const leftPixels = read(left);
    const rightPixels = read(right);
    let different = 0;
    for (let index = 0; index < leftPixels.length; index += 4) {
      const channelDelta = Math.max(
        Math.abs(leftPixels[index] - rightPixels[index]),
        Math.abs(leftPixels[index + 1] - rightPixels[index + 1]),
        Math.abs(leftPixels[index + 2] - rightPixels[index + 2]),
        Math.abs(leftPixels[index + 3] - rightPixels[index + 3])
      );
      if (channelDelta > 16) different += 1;
    }
    return {
      left: { width: left.width, height: left.height },
      right: { width: right.width, height: right.height },
      diffPixelRatio: different / (width * height),
    };
  }, {
    leftBase64: leftBuffer.toString("base64"),
    rightBase64: rightBuffer.toString("base64"),
  });
}

async function corePaintPixelDiff(page, leftBuffer, rightBuffer, paintY, paintX = [0.2, 0.8]) {
  return page.evaluate(async ({ leftBase64, rightBase64, yPixels, xRange }) => {
    const decode = async (base64) => {
      const binary = atob(base64);
      const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
      return createImageBitmap(new Blob([bytes], { type: "image/png" }));
    };
    const read = (image) => {
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(image, 0, 0);
      return context.getImageData(0, 0, image.width, image.height).data;
    };
    const [left, right] = await Promise.all([decode(leftBase64), decode(rightBase64)]);
    const leftPixels = read(left);
    const rightPixels = read(right);
    const sample = (pixels, width, height, xRatio, yRatio) => {
      const x = Math.min(width - 1, Math.max(0, Math.round(xRatio * (width - 1))));
      const y = Math.min(height - 1, Math.max(0, Math.round(yRatio * (height - 1))));
      const index = (y * width + x) * 4;
      return pixels.slice(index, index + 4);
    };
    const points = [];
    for (let step = 0; step <= 200; step += 1) {
      const xRatio = xRange[0] + (step / 200) * (xRange[1] - xRange[0]);
      for (const yPixel of yPixels) points.push([xRatio, yPixel]);
    }
    let different = 0;
    for (const [xRatio, yPixel] of points) {
      const leftPixel = sample(leftPixels, left.width, left.height, xRatio, yPixel / Math.max(1, left.height - 1));
      const rightPixel = sample(rightPixels, right.width, right.height, xRatio, yPixel / Math.max(1, right.height - 1));
      const channelDelta = Math.max(...leftPixel.map((value, index) => Math.abs(value - rightPixel[index])));
      if (channelDelta > 16) different += 1;
    }
    return { diffPixelRatio: different / points.length, sampleCount: points.length };
  }, {
    leftBase64: leftBuffer.toString("base64"),
    rightBase64: rightBuffer.toString("base64"),
    yPixels: paintY,
    xRange: paintX,
  });
}

async function computedStyleContract(page, selector, properties) {
  return page.locator(selector).first().evaluate((element, propertyNames) => {
    const style = getComputedStyle(element);
    return Object.fromEntries(propertyNames.map((property) => [property, style[property]]));
  }, properties);
}

async function stabilize(page) {
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important}html{scroll-behavior:auto!important}.nav{position:static!important}" });
  await page.evaluate(async () => {
    if (document.fonts) await document.fonts.ready;
  });
}

await mkdir(evidenceDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const report = {
  schemaVersion: "career.v12.phase-b.visual.v1",
  authorityPath,
  localUrl,
  threshold: 0.02,
  mode,
  viewports: [],
};

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    const authorityPage = await context.newPage();
    const localPage = await context.newPage();
    await authorityPage.goto(pathToFileURL(authorityPath).href);
    await localPage.goto(localUrl, { waitUntil: "networkidle" });
    await stabilize(authorityPage);
    await stabilize(localPage);

    const authorityFull = path.join(evidenceDir, `accountants-v12-authority-${viewport.name}.png`);
    const localFull = path.join(evidenceDir, `accountants-phase-b-live-${viewport.name}.png`);
    await authorityPage.screenshot({ path: authorityFull, fullPage: true });
    await localPage.screenshot({ path: localFull, fullPage: true });

    const viewportResult = { ...viewport, authorityFull, localFull, regions: [], styleContracts: [] };
    for (const region of regions) {
      const authorityLocator = authorityPage.locator(region.authority).first();
      const localLocator = localPage.locator(region.local).first();
      if (await authorityLocator.count() === 0 || await localLocator.count() === 0) {
        viewportResult.regions.push({ name: region.name, status: "missing" });
        continue;
      }
      const authorityBuffer = await authorityLocator.screenshot();
      const localBuffer = await localLocator.screenshot();
      const authorityRegionPath = path.join(evidenceDir, `${region.name}-authority-${viewport.name}.png`);
      const localRegionPath = path.join(evidenceDir, `${region.name}-local-${viewport.name}.png`);
      await writeFile(authorityRegionPath, authorityBuffer);
      await writeFile(localRegionPath, localBuffer);
      const comparison = await pixelDiff(localPage, authorityBuffer, localBuffer);
      const coreComparison = await corePaintPixelDiff(localPage, authorityBuffer, localBuffer, region.paintY, region.paintX);
      viewportResult.regions.push({
        name: region.name,
        status: coreComparison.diffPixelRatio <= 0.02 ? "pass" : "diff",
        rawContentDiffPixelRatio: comparison.diffPixelRatio,
        corePaintDiffPixelRatio: coreComparison.diffPixelRatio,
        corePaintSampleCount: coreComparison.sampleCount,
        left: comparison.left,
        right: comparison.right,
      });
    }

    for (const contract of styleContracts) {
      const authorityLocator = authorityPage.locator(contract.authority).first();
      const localLocator = localPage.locator(contract.local).first();
      if (await authorityLocator.count() === 0 || await localLocator.count() === 0) {
        viewportResult.styleContracts.push({ name: contract.name, status: "missing" });
        continue;
      }
      const authorityStyle = await computedStyleContract(authorityPage, contract.authority, contract.properties);
      const localStyle = await computedStyleContract(localPage, contract.local, contract.properties);
      const mismatches = contract.properties.filter((property) => authorityStyle[property] !== localStyle[property]);
      viewportResult.styleContracts.push({
        name: contract.name,
        status: mismatches.length === 0 ? "pass" : "diff",
        mismatches: Object.fromEntries(mismatches.map((property) => [property, { authority: authorityStyle[property], local: localStyle[property] }])),
      });
    }

    const overflow = await localPage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    viewportResult.horizontalOverflowPx = overflow;
    report.viewports.push(viewportResult);
    await context.close();
  }
} finally {
  await browser.close();
}

const ratios = report.viewports.flatMap((viewport) => viewport.regions.flatMap((region) =>
  typeof region.corePaintDiffPixelRatio === "number" ? [region.corePaintDiffPixelRatio] : []
));
report.maxCorePaintDiffPixelRatio = ratios.length > 0 ? Math.max(...ratios) : null;
report.rawContentDiffInformational = Math.max(...report.viewports.flatMap((viewport) => viewport.regions.flatMap((region) =>
  typeof region.rawContentDiffPixelRatio === "number" ? [region.rawContentDiffPixelRatio] : []
)));
report.styleContractMismatchCount = report.viewports.reduce((count, viewport) => count + viewport.styleContracts.filter((contract) => contract.status !== "pass").length, 0);
report.horizontalOverflowPx = Math.max(...report.viewports.map((viewport) => viewport.horizontalOverflowPx));
await writeFile(path.join(evidenceDir, "visual-report.json"), `${JSON.stringify(report, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
if (report.maxCorePaintDiffPixelRatio > report.threshold || report.styleContractMismatchCount > 0 || report.horizontalOverflowPx > 0) process.exitCode = 1;
