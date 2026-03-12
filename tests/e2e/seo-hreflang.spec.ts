import { expect, test } from "@playwright/test";

test("english personality page outputs canonical and hreflang cluster", async ({ request }) => {
  const response = await request.get("/en/personality/intj");
  expect(response.status()).toBe(200);
  const html = await response.text();

  expect(html).toContain('rel="canonical"');
  expect(html).toContain("/en/personality/intj");
  expect(html).toContain('hrefLang="zh-CN"');
  expect(html).toContain("/zh/personality/intj");
  expect(html).toContain('hrefLang="x-default"');
  expect(html).toContain('"@type":"WebPage"');
  expect(html).toContain('"@type":"BreadcrumbList"');
});

test("chinese personality page outputs canonical and hreflang cluster", async ({ request }) => {
  const response = await request.get("/zh/personality/intj");
  expect(response.status()).toBe(200);
  const html = await response.text();

  expect(html).toContain('rel="canonical"');
  expect(html).toContain("/zh/personality/intj");
  expect(html).toContain('hrefLang="en"');
  expect(html).toContain("/en/personality/intj");
  expect(html).toContain('hrefLang="x-default"');
  expect(html).toContain('"@type":"WebPage"');
  expect(html).toContain('"@type":"BreadcrumbList"');
});

test("private workflow pages still emit noindex robot headers", async ({ request }) => {
  const response = await request.get("/en/orders/lookup");
  expect(response.status()).toBe(200);
  const robotsTag = (response.headers()["x-robots-tag"] || "").toLowerCase();
  expect(robotsTag).toContain("noindex");
  expect(robotsTag).toContain("nofollow");
});
