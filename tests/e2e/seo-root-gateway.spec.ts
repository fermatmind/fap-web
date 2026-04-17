import { expect, test } from "@playwright/test";

test("root path serves the chinese home without a locale redirect", async ({ request }) => {
  const zhResponse = await request.get("/", {
    headers: {
      "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
    },
    maxRedirects: 0,
  });
  expect(zhResponse.status()).toBe(200);
  expect(zhResponse.headers().location).toBeFalsy();
  expect(await zhResponse.text()).toContain("先了解自己，再决定下一步。");

  const enResponse = await request.get("/", {
    headers: {
      cookie: "fm_locale=en",
    },
    maxRedirects: 0,
  });
  expect(enResponse.status()).toBe(200);
  expect(enResponse.headers().location).toBeFalsy();
  expect(await enResponse.text()).toContain("先了解自己，再决定下一步。");
});

test("root canonical and hreflang keep chinese home on the bare domain", async ({ request }) => {
  const response = await request.get("/", {
    headers: {
      cookie: "fm_locale=en",
      "accept-language": "en-US,en;q=0.9",
      "cf-ipcountry": "CN",
    },
    maxRedirects: 0,
  });

  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain('rel="canonical"');
  expect(html).toContain('href="https://fermatmind.com"');
  expect(html).toContain('hrefLang="zh-CN"');
  expect(html).not.toContain('href="https://fermatmind.com/zh"');
});

test("legacy zh home redirects to the bare chinese home", async ({ request }) => {
  const response = await request.get("/zh", { maxRedirects: 0 });

  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe("http://localhost:3000/");
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
  expect(shortBody).toContain("/en/help/faq");
  expect(shortBody).not.toContain("/compare/");

  const fullRes = await request.get("/llms-full.txt");
  expect(fullRes.status()).toBe(200);
  const fullBody = await fullRes.text();
  expect(fullBody).toContain("Citation Policy");
  expect(fullBody).toContain("## Personality");
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
