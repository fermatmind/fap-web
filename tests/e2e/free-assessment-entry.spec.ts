import { expect, test } from "@playwright/test";
import { startPublicContentApiFixture } from "./helpers/public-content-api-fixture";

let stopPublicApiFixture: (() => Promise<void>) | undefined;
test.beforeAll(async () => { stopPublicApiFixture = await startPublicContentApiFixture(); });
test.afterAll(async () => { await stopPublicApiFixture?.(); });

test("@release public fixture rejects unmapped reads and commerce writes", async ({ request }) => {
  const missing = await request.get("http://127.0.0.1:8000/api/v0.3/unmapped-e2e-contract");
  expect(missing.status()).toBe(404);
  expect(await missing.json()).toMatchObject({ error_code: "UNMOCKED_PUBLIC_REQUEST" });
  const order = await request.post("http://127.0.0.1:8000/api/v0.3/orders", { data: {} });
  expect(order.status()).toBe(404);
  expect(await order.json()).toMatchObject({ error_code: "UNMOCKED_PUBLIC_REQUEST" });
});

const slugs = [
  "mbti-personality-test-16-personality-types",
  "big-five-personality-test-ocean-model",
  "enneagram-personality-test-nine-types",
  "holland-career-interest-test-riasec",
  "iq-test-intelligence-quotient-assessment",
  "eq-test-emotional-intelligence-assessment",
];

for (const locale of ["en", "zh"] as const) {
  for (const slug of slugs) {
    test(`@release @free ${locale} ${slug} exposes free assessment entry without checkout`, async ({ page, request }) => {
      const lookupResponse = await request.get(
        `http://127.0.0.1:8000/api/v0.3/scales/lookup?slug=${slug}&locale=${locale}`
      );
      expect(lookupResponse.status()).toBe(200);
      const lookup = await lookupResponse.json();
      expect(lookup.capabilities.paywall_mode).toBe("free_only");
      expect(lookup.commercial).toMatchObject({
        price_tier: "FREE",
        report_unlock_sku: null,
        upgrade_sku: null,
        offers: [],
      });

      const commerceRequests: string[] = [];
      page.on("request", (req) => {
        if (/\/(?:orders|payments|checkout)(?:[/?]|$)/.test(new URL(req.url()).pathname)) {
          commerceRequests.push(req.url());
        }
      });
      const response = await page.goto(`/${locale}/tests/${slug}`);
      expect(response?.status()).toBe(200);
      await expect(page.locator("main h1")).toBeVisible();
      // A preceding backend-off scenario must not poison this published entry.
      await expect(page.locator("main").getByRole("status").filter({
        hasText: /temporarily unavailable|暂不可用|暂停开放/i,
      })).toHaveCount(0);
      const entry = page.locator(`main a[href^="/${locale}/tests/${slug}/take"]`).first();
      await expect(entry).toBeVisible();
      await expect(page.getByRole("button", { name: /unlock (?:full |the )?report|buy now|checkout|解锁报告|立即购买|支付解锁/i })).toHaveCount(0);
      await expect(page.locator('main a[href*="/checkout"], main a[href*="/orders/new"]')).toHaveCount(0);
      expect(commerceRequests).toEqual([]);
    });
  }
}
