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

const lifecycleQuickActionsEn = [
  { label: "Order lookup", href: "/en/orders/lookup" },
  { label: "Manage email preferences", href: "/en/email/preferences" },
  { label: "Unsubscribe from emails", href: "/en/email/unsubscribe" },
] as const;

const lifecycleRelatedLinks = {
  en: [
    "/en/orders/lookup",
    "/en/email/preferences",
    "/en/email/unsubscribe",
  ],
  zh: [
    "/zh/orders/lookup",
    "/zh/email/preferences",
    "/zh/email/unsubscribe",
  ],
} as const;

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

test("help home surfaces the three lifecycle entry points and they navigate to the formal paths", async ({ page }) => {
  await page.goto("/en/help");

  const quickActions = page.getByTestId("help-home-quick-actions").locator("a");
  await expect(quickActions).toHaveCount(3);
  await expect(quickActions.nth(0)).toContainText("Order lookup");
  await expect(quickActions.nth(1)).toContainText("Manage email preferences");
  await expect(quickActions.nth(2)).toContainText("Unsubscribe from emails");
  await expect(
    page.getByText(
      "Use Order lookup to recover a report with your order number and purchase email. Manage email preferences is separate from report recovery. Unsubscribe from emails stops messages here, and the dedicated unsubscribe link inside any email still works."
    )
  ).toBeVisible();
  await expect(page.getByTestId("help-home-quick-actions")).not.toContainText("Refund policy");
  await expect(page.getByTestId("help-home-quick-actions")).not.toContainText("Privacy policy");

  for (const action of lifecycleQuickActionsEn) {
    await page.goto("/en/help");
    const link = page.getByTestId("help-home-quick-actions").locator(`a[href="${action.href}"]`);
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(action.href);
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

test("faq recovery copy explains report recovery, delivery resend, email preferences, and unsubscribe separation", async ({ page }) => {
  await page.goto("/en/help/faq");

  await expect(page.getByText("Go to Order lookup with your order number and purchase email first.")).toBeVisible();
  await expect(
    page.getByText("Use Order lookup for report recovery, order lookup, delivery status, and resend delivery email.")
  ).toBeVisible();
  await expect(
    page.getByText("Use Manage email preferences for email settings. This is separate from report recovery.")
  ).toBeVisible();
  await expect(
    page.getByText(
      "Use Unsubscribe from emails to stop messages, or use the dedicated unsubscribe link inside any email you already received."
    )
  ).toBeVisible();
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
      "Report recovery and email settings are separate. Use Manage email preferences to update email settings. Use Unsubscribe from emails or the dedicated unsubscribe link inside any email to stop messages. If you need a new report email instead, go to Order lookup with your order number and purchase email."
    )
  ).toBeVisible();
});

test("faq and contact help detail pages surface the lifecycle related links in English", async ({ page }) => {
  for (const slug of ["faq", "contact"] as const) {
    await page.goto(`/en/help/${slug}`);
    const relatedLinks = page.getByTestId(`help-detail-related-links-${slug}`);
    await expect(relatedLinks).toContainText("Start with Order lookup for report recovery");

    for (const href of lifecycleRelatedLinks.en) {
      await expect(relatedLinks.locator(`a[href="${href}"]`)).toBeVisible();
    }
  }
});

test("faq and contact help detail pages surface the lifecycle related links in Chinese", async ({ page }) => {
  for (const slug of ["faq", "contact"] as const) {
    await page.goto(`/zh/help/${slug}`);
    const relatedLinks = page.getByTestId(`help-detail-related-links-${slug}`);
    await expect(relatedLinks).toContainText("先用订单查询处理报告找回");

    for (const href of lifecycleRelatedLinks.zh) {
      await expect(relatedLinks.locator(`a[href="${href}"]`)).toBeVisible();
    }
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
