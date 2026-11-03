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
    await page.goto("/en/tests/explore/cognitive-functions-test");
    await page.waitForLoadState("networkidle");
    await Promise.all(reads);
    expect(background.size).toBeGreaterThan(0);
  } finally { await context.close(); }
});

for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh";
  for (const method of ["disc", "ratings32", "paired56"] as const) {
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
        await page.goto(`/${locale}/tests/explore/${method === "disc" ? "disc" : "cognitive-functions-test"}`, { waitUntil: "domcontentloaded" });
        const start = page.locator(method === "disc" ? "#take-test [data-explore-start]" : `[data-cognitive-method="${method}"]`);
        await expect(start).toBeEnabled();
        await start.click();
        const first = page.locator('#take-test input[type="radio"]').first();
        await first.check();
        expect(held).toBeGreaterThan(0);
        release();
        await page.getByRole("button", { name: zh ? "菜单" : "Menu", exact: true }).click();
        await expect(page.getByTestId("mobile-primary-nav-link-tests")).toBeVisible();
        await expect(first).toBeChecked();
      } finally { release(); }
    });
  }
  test(`@release ${locale}: failed navigation scripts retry without clearing a response`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.route(scripts, route => background.has(new URL(route.request().url()).pathname) ? route.abort("failed") : route.continue());
    await page.goto(`/${locale}/tests/explore/cognitive-functions-test`);
    await page.locator('[data-cognitive-method="ratings32"]').click();
    const first = page.locator('input[name="CF_NI_01"][value="4"]');
    await first.check();
    const alerts = page.getByRole("alert").filter({ hasText: zh ? "本次内容加载失败" : "This content could not load" });
    await expect(alerts.first()).toBeVisible();
    await page.unroute(scripts);
    const retry = page.getByRole("button", { name: zh ? "重试加载" : "Retry loading", exact: true });
    while (await retry.count()) await retry.first().click();
    await page.getByRole("button", { name: zh ? "菜单" : "Menu", exact: true }).click();
    await expect(page.getByTestId("mobile-primary-nav-link-tests")).toBeVisible();
    await expect(first).toBeChecked();
  });
}
