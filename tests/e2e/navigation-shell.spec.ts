import { expect, test, type Page } from "@playwright/test";

async function expectSiteChromeVisible(page: Page) {
  await expect(page.getByRole("link", { name: "FermatMind", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Privacy", exact: true })).toBeVisible();
}

test("site chrome is consistent across help and articles pages", async ({ page }) => {
  await page.goto("/en/help");
  await expectSiteChromeVisible(page);

  await page.goto("/en/articles");
  await expect(page.getByRole("link", { name: "FermatMind", exact: true })).toBeVisible();
  const helpMenuTrigger = page.getByRole("navigation").getByRole("button", { name: "Help", exact: true });
  await expect(helpMenuTrigger).toBeVisible();
  await helpMenuTrigger.click();
  await expect(page.getByRole("menuitem", { name: "Help Center", exact: true })).toBeVisible();
});

test("site chrome is visible on immersive take page", async ({ page }) => {
  await page.goto("/en/tests/mbti-personality-test-16-personality-types/take");
  await expectSiteChromeVisible(page);
});

test("site chrome is visible on order lookup page", async ({ page }) => {
  await page.goto("/en/orders/lookup");
  await expectSiteChromeVisible(page);
});

test("site chrome is visible on result page", async ({ page }) => {
  await page.goto("/en/result/site-chrome-smoke");
  await expectSiteChromeVisible(page);
});

test("site chrome is visible on share page", async ({ page }) => {
  await page.goto("/en/share/site-chrome-smoke");
  await expectSiteChromeVisible(page);
});

test("root language gateway remains without localized site chrome", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: "FermatMind", exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "FermatMind · 费马测试", exact: true })).toBeVisible();
});
