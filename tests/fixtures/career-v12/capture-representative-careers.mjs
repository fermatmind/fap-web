import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const localUrl = process.env.CAREER_V12_LOCAL_URL ?? "http://127.0.0.1:3100";
const evidenceDir = process.env.CAREER_V12_EVIDENCE_DIR ??
  "/Users/rainie/Desktop/1046个职业/c3.3m-v2-phase-b-evidence";
const screenshotDir = path.join(evidenceDir, "representative-careers");

const careers = [
  "accountants-and-auditors",
  "actuaries",
  "financial-analysts",
  "high-school-teachers",
  "market-research-analysts",
  "architectural-and-engineering-managers",
  "dentists",
  "pharmacists",
  "actors",
  "data-scientists",
  "air-traffic-controllers",
  "airline-and-commercial-pilots",
  "clinical-laboratory-technologists-and-technicians",
  "career-and-technical-education-teachers",
  "advertising-and-promotions-managers",
];

const viewports = [
  { name: "desktop", width: 1440, height: 1600 },
  { name: "tablet", width: 834, height: 1194 },
  { name: "mobile", width: 390, height: 844 },
];

await mkdir(screenshotDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    for (const slug of careers) {
      const page = await context.newPage();
      await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
      const response = await page.goto(`${localUrl}/?slug=${encodeURIComponent(slug)}`, { waitUntil: "networkidle" });
      await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important}html{scroll-behavior:auto!important}" });
      if (await page.evaluate(() => document.fonts ? document.fonts.ready.then(() => true) : true) !== true) {
        throw new Error(`${slug}/${viewport.name}: fonts did not stabilize`);
      }
      const screenshot = path.join(screenshotDir, `${slug}-${viewport.name}.png`);
      await page.screenshot({ path: screenshot, fullPage: true });
      const audit = await page.evaluate(() => {
        const componentMarkers = [...document.querySelectorAll("[data-career-component-id]")]
          .map((element) => element.getAttribute("data-career-component-id"));
        const visualGroups = [...document.querySelectorAll("[data-career-visual-group]")]
          .map((element) => element.getAttribute("data-career-visual-group"));
        const emptyCards = [...document.querySelectorAll("section[data-career-api-component]")]
          .filter((element) => (element.textContent ?? "").trim().length === 0)
          .map((element) => element.getAttribute("data-career-api-component"));
        const toc = document.querySelector('aside[aria-label="页面目录"]');
        return {
          componentMarkers: componentMarkers.length,
          uniqueComponentMarkers: new Set(componentMarkers).size,
          visualGroups: visualGroups.length,
          uniqueVisualGroups: new Set(visualGroups).size,
          emptyCards,
          horizontalOverflowPx: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
          tocPosition: toc ? getComputedStyle(toc).position : "missing",
          hasHero: Boolean(document.querySelector('[data-testid="career-display-hero"]')),
          hasStats: Boolean(document.querySelector('[data-testid="career-production-hero-stats"]')),
          hasGauge: Boolean(document.querySelector('[data-testid="career-production-ai-gauge"]')),
          hasCta: Boolean(document.querySelector('[data-testid="career-display-hero"] [data-career-api-component="primary_cta"]')),
          tableCount: document.querySelectorAll("table").length,
        };
      });
      results.push({
        slug,
        viewport: viewport.name,
        httpStatus: response?.status() ?? 0,
        screenshot,
        ...audit,
      });
      await page.close();
    }
    await context.close();
  }
} finally {
  await browser.close();
}

const failures = results.filter((result) =>
  result.httpStatus !== 200 ||
  result.componentMarkers !== 26 ||
  result.uniqueComponentMarkers !== 26 ||
  result.visualGroups !== 12 ||
  result.uniqueVisualGroups !== 12 ||
  result.emptyCards.length > 0 ||
  result.horizontalOverflowPx !== 0 ||
  !result.hasHero ||
  !result.hasStats ||
  !result.hasGauge ||
  !result.hasCta ||
  result.tableCount === 0 ||
  (result.viewport === "desktop" ? result.tocPosition !== "sticky" : result.tocPosition === "missing")
);

const report = {
  schemaVersion: "career.v12.phase-b.representative-visual.v1",
  localUrl,
  careers: careers.length,
  screenshots: results.length,
  viewports,
  maxHorizontalOverflowPx: Math.max(...results.map((result) => result.horizontalOverflowPx)),
  emptyCards: results.reduce((total, result) => total + result.emptyCards.length, 0),
  failureCount: failures.length,
  failures,
  results,
};

await writeFile(path.join(evidenceDir, "representative-visual-report.json"), `${JSON.stringify(report, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({
  schemaVersion: report.schemaVersion,
  careers: report.careers,
  screenshots: report.screenshots,
  maxHorizontalOverflowPx: report.maxHorizontalOverflowPx,
  emptyCards: report.emptyCards,
  failureCount: report.failureCount,
  failures: report.failures,
}, null, 2)}\n`);
if (failures.length > 0) process.exitCode = 1;
