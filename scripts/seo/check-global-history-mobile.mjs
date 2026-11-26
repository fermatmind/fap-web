import { readFileSync } from "node:fs";
import { chromium } from "@playwright/test";

const origin = new URL(process.argv[2] ?? "http://127.0.0.1:3138");
if (!["127.0.0.1", "localhost", "[::1]"].includes(origin.hostname)) {
  throw new Error("Mobile preview requires a loopback origin");
}
const all = process.argv.includes("--all");
const entry = "/tests/explore/global-history-quiz";
const people = JSON.parse(readFileSync(new URL("../../lib/entertainment/global-history/people.json", import.meta.url), "utf8"));
const portraits = all ? people.map(({ id }) => id) : ["alan-turing"];
const paths = ["zh", "zh-TW", "en"].flatMap(locale =>
  ["", "/personality-atlas", "/cox-1926", "/take", ...portraits.map(id => `/results/${id}`)]
    .map(suffix => `/${locale}${entry}${suffix}`),
);
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});
if (all) {
  // Check local layout at scale while preserving CSS and fixed image geometry.
  await context.route("**/*", route => {
    const request = route.request();
    if (new URL(request.url()).origin !== origin.origin || request.resourceType() === "image") {
      return route.abort();
    }
    return route.continue();
  });
}

async function check(page, path) {
  try {
    const response = await page.goto(new URL(path, origin).href, { waitUntil: all ? "domcontentloaded" : "load" });
    if (path.endsWith("/take")) await page.locator("main [data-questionnaire-take]").waitFor({ state: "visible" });
    const result = await page.evaluate(() => {
      const selectors = ["main img[src*='/images/global-history/']", "main h1", "main #core-facts table", "main [data-stage='intro'] h2"];
      const visible = element => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return style.visibility !== "hidden" && rect.width > 20 && rect.height > 20;
      };
      const content = [...document.querySelectorAll(selectors.join(","))]
        .filter(visible).map(element => element.getBoundingClientRect()).filter(rect => rect.top < innerHeight);
      const ads = [...document.querySelectorAll("ins.adsbygoogle, iframe[id^='google_ads_iframe'], [data-ad-slot]")]
        .filter(visible);
      const filled = ads.filter(element => element.tagName === "IFRAME" || element.dataset.adStatus === "filled");
      const overlap = filled.some(element => {
        const ad = element.getBoundingClientRect();
        return content.some(rect =>
          ad.left < rect.right && ad.right > rect.left && ad.top < rect.bottom && ad.bottom > rect.top,
        );
      });
      return {
        viewport: innerWidth,
        landmarks: document.querySelectorAll("main").length,
        firstScreenContent: content.length,
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        filledAds: filled.length,
        overlap,
      };
    });
    return { path, status: response?.status(), ...result };
  } catch (error) {
    return { path, error: String(error) };
  }
}

const checks = new Array(paths.length);
let next = 0;
try {
  await Promise.all(Array.from({ length: all ? 4 : 1 }, async () => {
    const page = await context.newPage();
    while (next < paths.length) {
      const index = next++;
      checks[index] = await check(page, paths[index]);
    }
    await page.close();
  }));
} finally {
  await browser.close();
}
console.log(JSON.stringify(checks, null, 2));
if (checks.some(row => row.error || row.status !== 200 || row.viewport !== 390 || row.landmarks !== 1 || row.firstScreenContent === 0 || row.overflow || row.overlap)) {
  process.exitCode = 1;
}
