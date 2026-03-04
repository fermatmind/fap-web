import { expect, test } from "@playwright/test";

const helpPages = [
  {
    slug: "faq",
    headingEn: "Frequently Asked Questions",
    headingZh: "常见问题解答",
  },
  {
    slug: "about",
    headingEn: "About FermatMind",
    headingZh: "关于 FermatMind",
  },
  {
    slug: "team",
    headingEn: "Our Team",
    headingZh: "团队介绍",
  },
  {
    slug: "used-and-mentioned",
    headingEn: "Used and Mentioned",
    headingZh: "使用和提及",
  },
  {
    slug: "for-business-and-research",
    headingEn: "Using FermatMind for Business and Research",
    headingZh: "将 FermatMind 用于企业与研究",
  },
  {
    slug: "contact",
    headingEn: "Contact Support",
    headingZh: "联系支持",
  },
] as const;

test("support route remains redirected to help", async ({ request }) => {
  const response = await request.get("/en/support", { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe("/en/help");
});

test("help home exposes all topic links in English", async ({ page }) => {
  await page.goto("/en/help");
  await expect(page.getByRole("heading", { level: 1, name: "Help Center" })).toBeVisible();

  for (const item of helpPages) {
    await expect(page.getByRole("link", { name: item.headingEn })).toBeVisible();
  }
});

test("help home exposes all topic links in Chinese", async ({ page }) => {
  await page.goto("/zh/help");
  await expect(page.getByRole("heading", { level: 1, name: "帮助中心" })).toBeVisible();

  for (const item of helpPages) {
    await expect(page.getByRole("link", { name: item.headingZh })).toBeVisible();
  }
});

test("all help detail pages render English content", async ({ page }) => {
  for (const item of helpPages) {
    await page.goto(`/en/help/${item.slug}`);
    await expect(page.getByRole("heading", { level: 1, name: item.headingEn })).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to Help Center", exact: true })).toBeVisible();
  }
});

test("all help detail pages render Chinese content", async ({ page }) => {
  for (const item of helpPages) {
    await page.goto(`/zh/help/${item.slug}`);
    await expect(page.getByRole("heading", { level: 1, name: item.headingZh })).toBeVisible();
    await expect(page.getByRole("link", { name: "返回帮助中心", exact: true })).toBeVisible();
  }
});

test("desktop header dropdown opens and closes by click and Escape", async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto("/en");

  const testsTrigger = page.getByRole("navigation").getByRole("button", { name: "Tests", exact: true });
  await testsTrigger.click();
  await expect(page.getByRole("menuitem", { name: "All tests", exact: true })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("menuitem", { name: "All tests", exact: true })).toHaveCount(0);

  await testsTrigger.click();
  await expect(page.getByRole("menuitem", { name: "All tests", exact: true })).toBeVisible();
  await page.mouse.click(20, 20);
  await expect(page.getByRole("menuitem", { name: "All tests", exact: true })).toHaveCount(0);
});
