import { test, expect } from "@playwright/test";

const scripts = "**/_next/static/chunks/*.js";
const background = new Set<string>();

test.beforeAll(async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL });
  try {
    const page = await context.newPage();
    const reads: Promise<void>[] = [];
    page.on("response", response => {
      if (response.request().resourceType() !== "script") return;
      reads.push(response.text().then(body => {
        if (/data-site-header|data-cookie-banner|switchToEnglish/.test(body)) background.add(new URL(response.url()).pathname);
      }).catch(() => {}));
    });
    await page.goto("/en/tests/explore/disc");
    await page.waitForLoadState("networkidle");
    await Promise.all(reads);
    expect(background.size).toBeGreaterThan(0);
  } finally { await context.close(); }
});

for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh";
  for (const method of ["disc"] as const) {
    test(`@release ${locale} ${method}: delayed navigation and consent scripts do not block answering`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      let release!: () => void;
      const gate = new Promise<void>(resolve => { release = resolve; });
      let held = 0;
      await page.route(scripts, async route => {
        if (background.has(new URL(route.request().url()).pathname)) { held++; await gate; }
        await route.continue();
      });
      try {
        await page.goto(`/${locale}/tests/explore/disc`, { waitUntil: "domcontentloaded" });
        const start = page.locator("#take-test [data-explore-start]");
        await expect(start).toBeEnabled();
        await start.click();
        const first = page.locator('#take-test input[type="radio"]').first();
        await first.check();
        expect(held).toBeGreaterThan(0);
        release();
        await expect(page.getByRole("link", { name: zh ? "返回测评介绍" : "Back to assessment", exact: true })).toBeVisible();
        await expect(page.locator("[data-site-header]")).toHaveCount(0);
        await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);
        await expect(page.locator("#take-test")).toContainText(zh ? "第 2 题" : "Question 2");
      } finally { release(); }
    });
  }
}
