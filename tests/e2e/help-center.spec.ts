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

test("help home keeps order lookup first and exposes email preference discoverability", async ({ page }) => {
  await page.goto("/en/help");

  await expect(page.getByRole("button", { name: "Order lookup" })).toBeVisible();
  await expect(
    page.getByText(
      "Start with Order lookup for report recovery. Use your order number and purchase email there first. Email preferences and unsubscribe should use the dedicated link in your email."
    )
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Manage email preferences" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Refund policy" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Privacy policy" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Email me the report link" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Recover with purchase email" })).toHaveCount(0);
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

test("faq detail page exposes answer-first copy, crawlable faq html, and faq schema", async ({ request, page }) => {
  await page.goto("/en/help/faq");
  await expect(page.getByRole("heading", { level: 1, name: "Frequently Asked Questions" })).toBeVisible();
  await expect(page.getByText("This page starts with the shortest practical answer", { exact: false })).toBeVisible();
  await expect(page.locator("section#faq dl dt").first()).toBeVisible();

  const response = await request.get("/en/help/faq");
  const html = await response.text();
  expect(html).toContain('"@type":"FAQPage"');
  expect(html).toContain('id="answer-first"');
});

test("faq recovery copy explains email links, order lookup, purchase email, and order detail delivery status", async ({ page }) => {
  await page.goto("/en/help/faq");

  await expect(page.getByText("Go to Order lookup with your order number and purchase email first.")).toBeVisible();
  await expect(page.getByText("Use the dedicated link in your email to manage preferences or unsubscribe.")).toBeVisible();
  await expect(
    page.getByText(
      "From the order detail page, you can review delivery status, resend the delivery email, and return to Order lookup for purchase-email recovery."
    )
  ).toBeVisible();
  await expect(
    page.getByText(
      "Open Order lookup with your order number and purchase email. If the report is ready, the order detail page will show delivery status, report access, PDF download, resend delivery email, and a path back to Order lookup for purchase-email recovery."
    )
  ).toBeVisible();
  await expect(
    page.getByText(
      "Use the dedicated link inside your email to manage preferences or unsubscribe. If you need a new report email instead, go to Order lookup with your order number and purchase email."
    )
  ).toBeVisible();
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
