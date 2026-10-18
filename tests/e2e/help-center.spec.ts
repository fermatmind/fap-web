import { expect, test } from "@playwright/test";
import { startPublicContentApiFixture } from "./helpers/public-content-api-fixture";

let stopPublicApi: (() => Promise<void>) | null = null;

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
  { label: "Look up an order and recover a report", href: "/en/orders/lookup" },
  { label: "Manage email preferences", href: "/en/email/preferences" },
  { label: "Unsubscribe from notification emails", href: "/en/email/unsubscribe" },
  { label: "Privacy and data information", href: "/en/privacy" },
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

test.beforeAll(async () => { stopPublicApi = await startPublicContentApiFixture(); });
test.afterAll(async () => { await stopPublicApi?.(); stopPublicApi = null; });

test("help root redirects to the independent support center", async ({ request }) => {
  const response = await request.get("/en/help", { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe("/en/support");
});

test("method boundaries help aliases redirect to canonical trust pages", async ({ request }) => {
  for (const locale of ["en", "zh"] as const) {
    const response = await request.get(`/${locale}/help/method-boundaries`, { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers().location).toBe(`/${locale}/method-boundaries`);
  }
});

test("results roots redirect to lookup utilities", async ({ request }) => {
  for (const locale of ["en", "zh"] as const) {
    const response = await request.get(`/${locale}/results`, { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers().location).toBe(`/${locale}/results/lookup`);
  }
});

test("method boundaries pages render the public trust boundary copy", async ({ page }) => {
  await page.goto("/en/method-boundaries");
  await expect(page.getByRole("heading", { level: 1, name: "Assessment Method and Boundaries" })).toBeVisible();
  await expect(page.locator("main")).toContainText(/(?:FermatMind|Results) (?:is|are) not a medical.*diagnosis/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/en\/method-boundaries$/);

  await page.goto("/zh/method-boundaries");
  await expect(page.getByRole("heading", { level: 1, name: "测评方法与使用边界" })).toBeVisible();
  await expect(page.locator("main")).toContainText(/不是.*(?:医学|心理).*诊断/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/zh\/method-boundaries$/);
});

test("support center surfaces the self-serve entry points and they navigate to formal paths", async ({ page }) => {
  await page.goto("/en/support");
  await expect(page.getByRole("heading", { level: 1, name: "Support & Trust Center" })).toBeVisible();

  const quickActions = page.getByTestId("support-quick-tools").locator("a");
  await expect(quickActions).toHaveCount(5);
  await expect(quickActions.nth(0)).toContainText("Find saved results");
  await expect(quickActions.nth(0)).toHaveAttribute("href", "/en/results/lookup");
  await expect(quickActions.nth(1)).toContainText(/(?:Order lookup|Look up an order)/);
  await expect(quickActions.nth(2)).toContainText(/(?:Email preferences|Manage email preferences)/);
  await expect(quickActions.nth(3)).toContainText("Unsubscribe");
  await expect(quickActions.nth(4)).toContainText("Privacy and data information");
  await expect(page.getByTestId("support-quick-tools")).not.toContainText("Search");
  await expect(page.getByTestId("support-topic-groups")).toContainText("Frequently Asked Questions");
  await expect(page.getByTestId("support-topic-groups")).toContainText("About FermatMind");
  await expect(page.getByTestId("support-topic-groups")).toContainText("Team information");
  await expect(page.getByTestId("support-topic-groups")).toContainText("Contact support");
  await expect(page.getByTestId("support-topic-groups").locator('a[href="/en/method-boundaries"]')).toBeVisible();

  for (const action of lifecycleQuickActionsEn) {
    await page.goto("/en/support");
    const link = page.getByTestId("support-quick-tools").locator(`a[href="${action.href}"]`);
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(action.href);
  }
});

test("support center exposes the Chinese support and trust IA", async ({ page }) => {
  await page.goto("/zh/support");
  await expect(page.getByRole("heading", { level: 1, name: "支持与信任中心" })).toBeVisible();
  await expect(page.getByTestId("support-quick-tools")).toContainText("订单查询");
  await expect(page.getByTestId("support-quick-tools")).toContainText("邮件偏好");
  await expect(page.getByTestId("support-quick-tools")).toContainText("退订邮件");
  await expect(page.getByTestId("support-quick-tools")).toContainText("隐私与数据说明");
  await expect(page.getByTestId("support-topic-groups")).toContainText("常见问题");
  await expect(page.getByTestId("support-topic-groups")).toContainText("关于费马测试");
  await expect(page.getByTestId("support-topic-groups")).toContainText("团队信息");
  await expect(page.getByTestId("support-topic-groups")).toContainText("联系支持");
  await expect(page.getByTestId("support-topic-groups").locator('a[href="/zh/method-boundaries"]')).toBeVisible();
});

test("all help detail pages render English content", async ({ page }) => {
  for (const item of helpPages) {
    await page.goto(`/en/help/${item.slug}`);
    await expect(page.getByRole("heading", { level: 1, name: item.headingEn })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: "Help Center" })).toHaveAttribute("href", "/en/support");
  }
});

test("all help detail pages render Chinese content", async ({ page }) => {
  for (const item of helpPages) {
    await page.goto(`/zh/help/${item.slug}`);
    await expect(page.getByRole("heading", { level: 1, name: item.headingZh })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: "帮助中心" })).toHaveAttribute("href", "/zh/support");
  }
});

test("faq detail page exposes crawlable recovery copy and respects its schema hold", async ({ request, page }) => {
  await page.goto("/en/help/faq");
  await expect(page.getByRole("heading", { level: 1, name: "Frequently Asked Questions" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Before you contact support" })).toBeVisible();
  await expect(page.getByText("Use the formal recovery and email-control paths before you contact support.")).toBeVisible();

  const response = await request.get("/en/help/faq");
  const html = await response.text();
  // This published page has schema_enabled=false and no approved FAQ items.
  expect(html).not.toContain('"@type":"FAQPage"');
  expect(html).toContain("Before you contact support");
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
    const relatedLinks = page.locator("main");
    if (slug === "contact") await expect(relatedLinks).toContainText("Use these official options before contacting support");

    for (const href of lifecycleRelatedLinks.en) {
      await expect(relatedLinks.locator(`a[href="${href}"]`).first()).toBeVisible();
    }
  }
});

test("faq and contact help detail pages surface the lifecycle related links in Chinese", async ({ page }) => {
  for (const slug of ["faq", "contact"] as const) {
    await page.goto(`/zh/help/${slug}`);
    const relatedLinks = page.locator("main");
    await expect(relatedLinks).toContainText(/订单查询|订单/);

    for (const href of lifecycleRelatedLinks.zh) {
      await expect(relatedLinks.locator(`a[href="${href}"]`).first()).toBeVisible();
    }
  }
});

test("desktop header dropdown opens and closes by click and Escape", async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto("/en");

  const testsTrigger = page.getByRole("navigation").getByRole("button", { name: "Tests menu", exact: true });
  await testsTrigger.click();
  await expect(page.getByRole("menuitem", { name: "Tests hub", exact: true })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("menuitem", { name: "Tests hub", exact: true })).toHaveCount(0);

  await testsTrigger.click();
  await expect(page.getByRole("menuitem", { name: "Tests hub", exact: true })).toBeVisible();
  await page.mouse.click(20, 20);
  await expect(page.getByRole("menuitem", { name: "Tests hub", exact: true })).toHaveCount(0);
});
