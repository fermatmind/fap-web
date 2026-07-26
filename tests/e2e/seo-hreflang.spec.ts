import { expect, test } from "@playwright/test";

function linkHrefPath(html: string, rel: string, hrefLang?: string): string | null {
  const tag = (html.match(/<link\b[^>]*>/g) ?? []).find(
    (candidate) =>
      candidate.includes(`rel="${rel}"`) &&
      (!hrefLang || candidate.includes(`hrefLang="${hrefLang}"`))
  );
  const href = tag?.match(/\bhref="([^"]+)"/)?.[1];

  return href ? new URL(href).pathname : null;
}

test("english base personality path renders its backend-authoritative owner and hreflang cluster", async ({ request }) => {
  const response = await request.get("/en/personality/intj", { maxRedirects: 0 });
  expect(response.status()).toBe(200);
  const html = await response.text();

  expect(linkHrefPath(html, "canonical")).toBe("/en/personality/intj");
  expect(linkHrefPath(html, "alternate", "zh-CN")).toBe("/zh/personality/intj");
  expect(html).toContain('hrefLang="x-default"');
  expect(html).toContain('data-authority-source="mbti_public_projection_v1"');
  expect(html).toContain('data-public-route-type="16-type"');
  expect(html).toContain('"@type":"WebPage"');
  expect(html).toContain('"@type":"BreadcrumbList"');
  expect(html).not.toContain("INTJ-A meaning: promoted quick answer from the CMS revision.");
  expect(html).not.toContain("What does INTJ-A mean?");
  expect(html).not.toContain('href="/en/career/recommendations/mbti/intj"');
});

test("chinese base personality path renders its backend-authoritative owner and hreflang cluster", async ({ request }) => {
  const response = await request.get("/zh/personality/intj", { maxRedirects: 0 });
  expect(response.status()).toBe(200);
  const html = await response.text();

  expect(linkHrefPath(html, "canonical")).toBe("/zh/personality/intj");
  expect(linkHrefPath(html, "alternate", "en")).toBe("/en/personality/intj");
  expect(html).toContain('hrefLang="x-default"');
  expect(html).toContain('data-authority-source="mbti_public_projection_v1"');
  expect(html).toContain('data-public-route-type="16-type"');
  expect(html).toContain('"@type":"WebPage"');
  expect(html).toContain('"@type":"BreadcrumbList"');
  expect(html).not.toContain('href="/zh/career/recommendations/mbti/intj"');
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
