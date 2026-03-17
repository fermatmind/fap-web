import { expect, test } from "@playwright/test";

test("english legacy personality path redirects to the canonical variant and the variant page outputs a hreflang cluster", async ({ request }) => {
  const redirectResponse = await request.get("/en/personality/intj", { maxRedirects: 0 });
  expect(redirectResponse.status()).toBe(308);
  expect(redirectResponse.headers().location).toContain("/en/personality/intj-a");

  const response = await request.get("/en/personality/intj-a");
  expect(response.status()).toBe(200);
  const html = await response.text();

  expect(html).toContain('rel="canonical"');
  expect(html).toContain("/en/personality/intj-a");
  expect(html).toContain('hrefLang="zh-CN"');
  expect(html).toContain("/zh/personality/intj-a");
  expect(html).toContain('hrefLang="x-default"');
  expect(html).toContain('"@type":"WebPage"');
  expect(html).toContain('"@type":"BreadcrumbList"');
});

test("chinese legacy personality path redirects to the canonical variant and the variant page outputs a hreflang cluster", async ({ request }) => {
  const redirectResponse = await request.get("/zh/personality/intj", { maxRedirects: 0 });
  expect(redirectResponse.status()).toBe(308);
  expect(redirectResponse.headers().location).toContain("/zh/personality/intj-a");

  const response = await request.get("/zh/personality/intj-a");
  expect(response.status()).toBe(200);
  const html = await response.text();

  expect(html).toContain('rel="canonical"');
  expect(html).toContain("/zh/personality/intj-a");
  expect(html).toContain('hrefLang="en"');
  expect(html).toContain("/en/personality/intj-a");
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

test("career recommendation detail redirects the legacy 4-letter path and emits a 32-type hreflang cluster", async ({ request }) => {
  const redirectResponse = await request.get("/en/career/recommendations/mbti/intj", { maxRedirects: 0 });
  expect(redirectResponse.status()).toBe(308);
  expect(redirectResponse.headers().location).toContain("/en/career/recommendations/mbti/intj-a");

  const response = await request.get("/en/career/recommendations/mbti/intj-a");
  expect(response.status()).toBe(200);
  const html = await response.text();

  expect(html).toContain('rel="canonical"');
  expect(html).toContain("/en/career/recommendations/mbti/intj-a");
  expect(html).toContain('hrefLang="zh-CN"');
  expect(html).toContain("/zh/career/recommendations/mbti/intj-a");
  expect(html).toContain('hrefLang="x-default"');
});
