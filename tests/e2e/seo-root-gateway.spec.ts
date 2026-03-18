import { expect, test } from "@playwright/test";

test("root path redirects to the preferred localized home", async ({ request }) => {
  const zhResponse = await request.get("/", {
    headers: {
      "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
    },
    maxRedirects: 0,
  });
  expect(zhResponse.status()).toBe(307);
  expect(zhResponse.headers().location).toContain("/zh");

  const enResponse = await request.get("/", {
    headers: {
      cookie: "fm_locale=en",
    },
    maxRedirects: 0,
  });
  expect(enResponse.status()).toBe(307);
  expect(enResponse.headers().location).toContain("/en");
});

test("localized public gateway keeps personality/topics/help reachable and does not revive /types", async ({ request }) => {
  for (const pathname of ["/en/personality", "/en/topics", "/en/help"]) {
    const response = await request.get(pathname);
    expect(response.status(), pathname).toBe(200);
  }

  const legacyResponse = await request.get("/en/types", { maxRedirects: 0 });
  expect(legacyResponse.status()).toBe(308);
  expect(legacyResponse.headers().location).toBe("http://localhost:3000/en/personality");
});

test("unknown path returns a hard 404 or 410", async ({ request }) => {
  const response = await request.get("/this-path-should-not-exist-2026");
  expect([404, 410]).toContain(response.status());
});

test("llms endpoints are reachable", async ({ request }) => {
  const shortRes = await request.get("/llms.txt");
  expect(shortRes.status()).toBe(200);
  const shortBody = await shortRes.text();
  expect(shortBody).toContain("FermatMind");
  expect(shortBody).toContain("Sitemap:");
  expect(shortBody).toContain("/en/personality");
  expect(shortBody).toContain("/en/personality/intj-a");
  expect(shortBody).toContain("/en/personality/intj-t");
  expect(shortBody).toContain("/en/help/faq");
  expect(shortBody).not.toContain("/compare/");

  const fullRes = await request.get("/llms-full.txt");
  expect(fullRes.status()).toBe(200);
  const fullBody = await fullRes.text();
  expect(fullBody).toContain("Citation Policy");
  expect(fullBody).toContain("## Personality");
  expect(fullBody).toContain("/en/personality/intj-a");
  expect(fullBody).toContain("/zh/personality/intj-t");
  expect(fullBody).toContain("## Help");
});

test("matcher exclusions bypass proxy side effects for static seo endpoints", async ({ request }) => {
  for (const pathname of ["/robots.txt", "/sitemap.xml", "/llms.txt", "/llms-full.txt"]) {
    const response = await request.get(pathname, { maxRedirects: 0 });
    expect(response.status(), pathname).toBe(200);
    expect(response.headers()["set-cookie"], pathname).toBeFalsy();
  }
});

test("sitemap locale aliases still redirect without proxy cookie side effects", async ({ request }) => {
  for (const pathname of ["/sitemap-en.xml", "/sitemap-zh.xml"]) {
    const response = await request.get(pathname, { maxRedirects: 0 });
    expect(response.status(), pathname).toBe(308);
    expect(response.headers().location, pathname).toContain("/sitemap.xml");
    expect(response.headers()["set-cookie"], pathname).toBeFalsy();
  }
});
