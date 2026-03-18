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

test("root path lands on a localized home page with site chrome", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/(en|zh)$/);
  await expectSiteChromeVisible(page);
});

test("english desktop header stays on a single row", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1200 });
  await page.goto("/en");

  const controls = [
    page.getByRole("button", { name: "Tests", exact: true }),
    page.getByRole("button", { name: "Articles", exact: true }),
    page.getByRole("button", { name: "Personality", exact: true }),
    page.getByRole("button", { name: "Career", exact: true }),
    page.getByRole("button", { name: "Help", exact: true }),
    page.getByRole("button", { name: "Business", exact: true }),
    page.getByRole("link", { name: "My Results", exact: true }),
    page.getByRole("link", { name: "中文", exact: true }),
    page.getByRole("link", { name: "Start", exact: true }),
  ];

  await Promise.all(controls.map((control) => expect(control).toBeVisible()));
  const boxes = await Promise.all(controls.map((control) => control.boundingBox()));
  expect(boxes.every((box) => box !== null)).toBeTruthy();

  const yPositions = boxes.map((box) => box?.y ?? 0);
  expect(Math.max(...yPositions) - Math.min(...yPositions)).toBeLessThanOrEqual(2);
});
