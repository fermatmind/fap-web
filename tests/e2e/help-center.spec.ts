import { expect, test } from "@playwright/test";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

let mockApiServer: ReturnType<typeof createServer> | null = null;

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

function sendJson(res: ServerResponse, status: number, body: Record<string, unknown>) {
  res.writeHead(status, {
    "content-type": "application/json",
    "cache-control": "no-store",
  });
  res.end(JSON.stringify(body));
}

function localeFrom(url: URL): "en" | "zh-CN" {
  return url.searchParams.get("locale") === "zh-CN" ? "zh-CN" : "en";
}

function localized(locale: "en" | "zh-CN", en: string, zh: string): string {
  return locale === "zh-CN" ? zh : en;
}

function helpGateway(locale: "en" | "zh-CN") {
  const isZh = locale === "zh-CN";
  return {
    ok: true,
    landing_surface_v1: {
      version: "landing.surface.v1",
      entry_surface: "support",
      entry_type: "hub",
      summary_blocks: [
        {
          key: "hero",
          title: localized(locale, "Support & Trust Center", "支持与信任中心"),
          body: localized(
            locale,
            "From report recovery, to understanding results, to method boundaries and data controls, the most common questions live behind formal entry points.",
            "从找回报告，到读懂结果，再到方法边界与数据控制，把最常见的问题放在正式入口里。"
          ),
        },
      ],
      cta_bundle: [
        {
          key: "orders",
          label: localized(locale, "Look up an order and recover a report", "查询订单与找回报告"),
          href: isZh ? "/zh/orders/lookup" : "/en/orders/lookup",
          kind: "tool",
        },
        {
          key: "preferences",
          label: localized(locale, "Manage email preferences", "邮件偏好管理"),
          href: isZh ? "/zh/email/preferences" : "/en/email/preferences",
          kind: "tool",
        },
        {
          key: "unsubscribe",
          label: localized(locale, "Unsubscribe from notification emails", "退订通知邮件"),
          href: isZh ? "/zh/email/unsubscribe" : "/en/email/unsubscribe",
          kind: "tool",
        },
        {
          key: "privacy",
          label: localized(locale, "Privacy and data information", "隐私与数据说明"),
          href: isZh ? "/zh/privacy" : "/en/privacy",
          kind: "policy",
        },
      ],
      discoverability_items: helpPages.map((item) => ({
        key: item.slug,
        title: localized(locale, item.headingEn, item.headingZh),
        summary: localized(locale, "Help topic", "帮助主题"),
        href: isZh ? `/zh/help/${item.slug}` : `/en/help/${item.slug}`,
        badge_label: localized(locale, "Help", "帮助"),
      })),
    },
    answer_surface_v1: {
      version: "answer.surface.v1",
      surface_type: "support",
      summary_blocks: [
        {
          key: "formal-paths",
          title: localized(locale, "Formal entry points", "正式入口"),
          body: localized(
            locale,
            "These entries already connect to formal product paths for report recovery, email preferences, and unsubscribe flows.",
            "这些入口已经连接到报告找回、邮件偏好和退订流程的正式产品路径。"
          ),
        },
      ],
    },
  };
}

function helpPageContent(slug: string, locale: "en" | "zh-CN") {
  const item = helpPages.find((page) => page.slug === slug);
  if (!item) {
    return null;
  }

  const title = localized(locale, item.headingEn, item.headingZh);
  const backLabel = localized(locale, "Back to Help Center", "返回帮助中心");
  const relatedText = localized(locale, "Start with Order lookup for report recovery", "先用订单查询处理报告找回");
  const relatedLinks =
    locale === "zh-CN"
      ? ["/zh/orders/lookup", "/zh/email/preferences", "/zh/email/unsubscribe"]
      : ["/en/orders/lookup", "/en/email/preferences", "/en/email/unsubscribe"];
  const relatedHtml = ["faq", "contact"].includes(slug)
    ? `<div data-testid="help-detail-related-links-${slug}"><p>${relatedText}</p>${relatedLinks
        .map((href) => `<a href="${href}">${href}</a>`)
        .join("")}</div>`
    : "";

  const faqHtml =
    slug === "faq" && locale === "en"
      ? `
        <section id="answer-first"><p>This page starts with the shortest practical answer for report recovery.</p></section>
        <h2>Frequently Asked Questions</h2>
        <h3>How do I recover a report?</h3>
        <p>Use Order lookup.</p>
        <section id="faq"><dl><dt>How do I recover a report?</dt><dd>Use Order lookup.</dd></dl></section>
        <p>Go to Order lookup with your order number and purchase email first.</p>
        <p>Use Order lookup for report recovery, order lookup, delivery status, and resend delivery email.</p>
        <p>Use Manage email preferences for email settings. This is separate from report recovery.</p>
        <p>Use Unsubscribe from emails to stop messages, or use the dedicated unsubscribe link inside any email you already received.</p>
        <p>From the order detail page, you can review delivery status, resend the delivery email, and return to Order lookup for purchase-email recovery.</p>
        <p>Open Order lookup with your order number and purchase email. If the report is ready, the order detail page will show delivery status, report access, PDF download, resend delivery email, and a path back to Order lookup for purchase-email recovery.</p>
        <p>Report recovery and email settings are separate. Use Manage email preferences to update email settings. Use Unsubscribe from emails or the dedicated unsubscribe link inside any email to stop messages. If you need a new report email instead, go to Order lookup with your order number and purchase email.</p>
      `
      : `<h2>${title}</h2><p>${localized(locale, "Help content.", "帮助内容。")}</p>`;

  return {
    slug: `help-${slug}`,
    path: locale === "zh-CN" ? `/zh/help/${slug}` : `/en/help/${slug}`,
    kind: "help",
    title,
    kicker: localized(locale, "Help Center", "帮助中心"),
    summary: localized(locale, "Help content for FermatMind users.", "面向 FermatMind 用户的帮助内容。"),
    template: "help",
    animation_profile: "none",
    locale,
    is_public: true,
    is_indexable: true,
    content_md: "",
    content_html: `<p><a href="${locale === "zh-CN" ? "/zh/support" : "/en/support"}">${backLabel}</a></p>${faqHtml}${relatedHtml}`,
    seo_title: title,
    meta_description: localized(locale, "Help content for FermatMind users.", "面向 FermatMind 用户的帮助内容。"),
  };
}

function methodBoundariesContent(locale: "en" | "zh-CN") {
  return {
    slug: "method-boundaries",
    path: locale === "zh-CN" ? "/zh/method-boundaries" : "/en/method-boundaries",
    kind: "help",
    title: localized(locale, "Assessment Science & Boundaries", "测评科学与边界"),
    kicker: localized(locale, "Trust Center", "信任中心"),
    summary: localized(
      locale,
      "A guide to what FermatMind assessments can support and what they cannot replace.",
      "说明 FermatMind 测评能提供什么参考、不能替代什么判断。"
    ),
    template: "help",
    animation_profile: "none",
    locale,
    is_public: true,
    is_indexable: true,
    content_md: localized(
      locale,
      "## What results cannot do\nResults are not a medical, psychiatric, or psychological diagnosis.",
      "## 测评结果不能做什么\n结果不是医学、精神科或心理临床诊断。"
    ),
    content_html: "",
    seo_title: localized(locale, "Assessment Science & Boundaries", "测评科学与边界"),
    meta_description: localized(
      locale,
      "Understand assessment boundaries and responsible interpretation.",
      "了解测评边界与负责任的结果解释。"
    ),
  };
}

function handleMockApiRequest(req: IncomingMessage, res: ServerResponse) {
  const requestUrl = new URL(req.url ?? "/", "http://127.0.0.1:8000");
  const locale = localeFrom(requestUrl);

  if (requestUrl.pathname === "/api/v0.3/public-gateways/help") {
    sendJson(res, 200, helpGateway(locale));
    return;
  }

  if (requestUrl.pathname === "/api/v0.5/support/articles" || requestUrl.pathname === "/api/v0.5/support/guides") {
    sendJson(res, 200, { ok: true, items: [] });
    return;
  }

  const contentPageMatch = requestUrl.pathname.match(/^\/api\/v0\.5\/content-pages\/([^/]+)$/);
  if (contentPageMatch) {
    const slug = decodeURIComponent(contentPageMatch[1] ?? "");
    const helpSlug = slug.startsWith("help-") ? slug.slice(5) : "";
    const page = slug === "method-boundaries" ? methodBoundariesContent(locale) : helpPageContent(helpSlug, locale);
    sendJson(res, page ? 200 : 404, page ? { ok: true, page } : { ok: false, error_code: "NOT_FOUND" });
    return;
  }

  sendJson(res, 404, { ok: false, error_code: "NOT_FOUND" });
}

test.beforeAll(async () => {
  mockApiServer = createServer(handleMockApiRequest);
  await new Promise<void>((resolve) => {
    mockApiServer?.listen(8000, "127.0.0.1", resolve);
  });
});

test.afterAll(async () => {
  if (!mockApiServer) {
    return;
  }
  await new Promise<void>((resolve) => {
    mockApiServer?.close(() => resolve());
  });
  mockApiServer = null;
});

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
  await expect(page.getByRole("heading", { level: 1, name: "Assessment Science & Boundaries" })).toBeVisible();
  await expect(page.getByText("Results are not a medical, psychiatric, or psychological diagnosis.")).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/en\/method-boundaries$/);

  await page.goto("/zh/method-boundaries");
  await expect(page.getByRole("heading", { level: 1, name: "测评科学与边界" })).toBeVisible();
  await expect(page.getByText("结果不是医学、精神科或心理临床诊断。")).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/zh\/method-boundaries$/);
});

test("support center surfaces the self-serve entry points and they navigate to formal paths", async ({ page }) => {
  await page.goto("/en/support");
  await expect(page.getByRole("heading", { level: 1, name: "Support & Trust Center" })).toBeVisible();

  const quickActions = page.getByTestId("support-quick-tools").locator("a");
  await expect(quickActions).toHaveCount(4);
  await expect(quickActions.nth(0)).toContainText("Look up an order and recover a report");
  await expect(quickActions.nth(1)).toContainText("Manage email preferences");
  await expect(quickActions.nth(2)).toContainText("Unsubscribe from notification emails");
  await expect(
    page.getByText(
      "These entries already connect to formal product paths for report recovery, email preferences, and unsubscribe flows."
    )
  ).toBeVisible();
  await expect(page.getByTestId("support-quick-tools")).not.toContainText("Search");
  await expect(page.getByTestId("support-topic-groups")).toContainText("Frequently Asked Questions");
  await expect(page.getByTestId("support-topic-groups")).toContainText("About FermatMind");
  await expect(page.getByTestId("support-topic-groups")).toContainText("Our Team");
  await expect(page.getByTestId("support-topic-groups")).toContainText("Contact Support");
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
  await expect(page.getByTestId("support-quick-tools")).toContainText("查询订单与找回报告");
  await expect(page.getByTestId("support-quick-tools")).toContainText("邮件偏好管理");
  await expect(page.getByTestId("support-quick-tools")).toContainText("退订通知邮件");
  await expect(page.getByTestId("support-quick-tools")).toContainText("隐私与数据说明");
  await expect(page.getByTestId("support-topic-groups")).toContainText("常见问题解答");
  await expect(page.getByTestId("support-topic-groups")).toContainText("关于 FermatMind");
  await expect(page.getByTestId("support-topic-groups")).toContainText("团队介绍");
  await expect(page.getByTestId("support-topic-groups")).toContainText("联系支持");
  await expect(page.getByTestId("support-topic-groups").locator('a[href="/zh/method-boundaries"]')).toBeVisible();
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
    if (["about", "team", "used-and-mentioned"].includes(item.slug)) {
      continue;
    }
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
