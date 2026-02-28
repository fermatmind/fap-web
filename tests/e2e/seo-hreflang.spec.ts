import { expect, test } from "@playwright/test";

const TEST_SLUG = "big-five-personality-test-ocean-model";
const ARTICLE_SLUG = "mbti-basics";

test("localized test page outputs canonical and hreflang cluster", async ({ request }) => {
  const response = await request.get(`/en/tests/${TEST_SLUG}`);
  expect(response.status()).toBe(200);
  const html = await response.text();

  expect(html).toContain('rel="canonical"');
  expect(html).toContain(`/en/tests/${TEST_SLUG}`);
  expect(html).toContain('hrefLang="zh-CN"');
  expect(html).toContain(`/zh/tests/${TEST_SLUG}`);
  expect(html).toContain('hrefLang="x-default"');
  expect(html).toContain('"@type":"WebPage"');
  expect(html).toContain('"@type":"FAQPage"');
  expect(html).toContain('"@type":"BreadcrumbList"');
});

test("localized article page outputs canonical and article JSON-LD", async ({ request }) => {
  const response = await request.get(`/zh/articles/${ARTICLE_SLUG}`);
  expect(response.status()).toBe(200);
  const html = await response.text();

  expect(html).toContain('rel="canonical"');
  expect(html).toContain(`/zh/articles/${ARTICLE_SLUG}`);
  expect(html).toContain('hrefLang="en"');
  expect(html).toContain(`/en/articles/${ARTICLE_SLUG}`);
  expect(html).toContain('hrefLang="x-default"');
  expect(html).toContain('"@type":"Article"');
  expect(html).toContain('"datePublished"');
  expect(html).toContain('"dateModified"');
});

test("private workflow pages emit noindex robot headers", async ({ request }) => {
  const response = await request.get("/en/orders/lookup");
  expect(response.status()).toBe(200);
  const robotsTag = (response.headers()["x-robots-tag"] || "").toLowerCase();
  expect(robotsTag).toContain("noindex");
  expect(robotsTag).toContain("nofollow");
});
