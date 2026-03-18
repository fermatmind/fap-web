import { expect, test } from "@playwright/test";
import reportReadyMbtiProjectionFixture from "../fixtures/report_ready.mbti.projection.json";

function createMbtiReportFixture(mutate?: (fixture: Record<string, unknown>) => void) {
  const fixture = structuredClone(reportReadyMbtiProjectionFixture) as Record<string, unknown>;
  mutate?.(fixture);
  return fixture;
}

test("checkout prefers backend wait_url over a bare order page", async ({ page }) => {
  const attemptId = "checkout-wait-flow-0001";
  const orderNo = "ord_checkout_wait_0001";
  const paymentRecoveryToken = "recovery_checkout_wait_0001";

  await page.addInitScript(() => {
    window.localStorage.setItem(
      "fm_consent_v1",
      JSON.stringify({
        analytics: "granted",
        updatedAt: "2026-03-11T00:00:00.000Z",
      })
    );
  });

  await page.route("**/api/track", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.route("**/api/v0.3/auth/guest", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        fm_token: "fm_checkout_wait_flow_guest_token",
      }),
    });
  });

  await page.route(`**/api/v0.3/attempts/${attemptId}/report*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(
        createMbtiReportFixture((fixture) => {
          const cta = fixture.cta as Record<string, unknown>;
          cta.primary_label = "Unlock full report";
        })
      ),
    });
  });

  await page.route("**/api/v0.3/orders/checkout", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        order_no: orderNo,
        attempt_id: attemptId,
        provider: "wechatpay",
        payment_recovery_token: paymentRecoveryToken,
        wait_url: `/pay/wait?order_no=${orderNo}&payment_recovery_token=${paymentRecoveryToken}`,
      }),
    });
  });

  await page.route(`**/api/v0.3/orders/${orderNo}*`, async (route) => {
    expect(route.request().url()).toContain(`payment_recovery_token=${paymentRecoveryToken}`);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        order_no: orderNo,
        status: "pending",
        message: "Waiting for payment confirmation.",
      }),
    });
  });

  await page.goto(`/en/result/${attemptId}`);
  await page.getByTestId("mbti-offers-primary-cta").click();

  await expect(page).toHaveURL(`/en/pay/wait?order_no=${orderNo}&payment_recovery_token=${paymentRecoveryToken}`);
  expect(page.url()).not.toContain(`/en/orders/${orderNo}`);
});
