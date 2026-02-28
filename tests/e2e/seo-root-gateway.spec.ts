import { expect, test } from "@playwright/test";

test("root gateway responds 200 and exposes /en /zh entry links", async ({ request }) => {
  const response = await request.get("/");
  expect(response.status()).toBe(200);
  expect(response.headers().location).toBeUndefined();

  const html = await response.text();
  expect(html).toContain('href="/en"');
  expect(html).toContain('href="/zh"');
  expect(html).toContain("x-default");
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

  const fullRes = await request.get("/llms-full.txt");
  expect(fullRes.status()).toBe(200);
  const fullBody = await fullRes.text();
  expect(fullBody).toContain("Citation Policy");
  expect(fullBody).toContain("## Tests");
});
