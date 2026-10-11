import reportReadyMbtiProjectionFixture from "../fixtures/report_ready.mbti.projection.json";
import { expect, test, type Page } from "@playwright/test";

async function mockCommonApis(page: Page) {
  await page.route("**/api/track", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.route("**/api/v0.3/auth/guest*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        fm_token: "fm_payment_wait_flow_guest_token",
      }),
    });
  });
}

test("provider return fallback restores the tokenized wait flow", async ({ page }) => {
  const orderNo = "ord_return_wait_1";
  const paymentRecoveryToken = "recovery_return_wait_1";

  await mockCommonApis(page);
  await page.addInitScript(({ nextOrderNo, nextToken }) => {
    window.sessionStorage.setItem(
      "fm_pending_order_v1",
      JSON.stringify({
        orderNo: nextOrderNo,
        attemptId: "attempt-return-1",
        sku: "MBTI_REPORT_FULL_199",
        provider: "stripe",
        waitUrl: `/en/pay/wait?order_no=${nextOrderNo}&payment_recovery_token=${nextToken}`,
        paymentRecoveryToken: nextToken,
        updatedAt: new Date().toISOString(),
      })
    );
  }, { nextOrderNo: orderNo, nextToken: paymentRecoveryToken });

  await page.route(`**/api/v0.3/orders/${orderNo}*`, async (route) => {
    expect(route.request().url()).toContain(`payment_recovery_token=${paymentRecoveryToken}`);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        order_no: orderNo,
        status: "pending",
        provider: "stripe",
        pay: {
          type: "html",
          value: `/mock-pay/session/${orderNo}`,
          provider: "stripe",
        },
      }),
    });
  });

  await page.goto("/en/payment/stripe/success");

  await expect(page).toHaveURL(
    `/en/pay/wait?order_no=${orderNo}&payment_recovery_token=${paymentRecoveryToken}`
  );
  await expect(page.getByText(orderNo)).toBeVisible();
  await expect(page.getByRole("button", { name: "Open payment page" })).toBeVisible();
});

test("provider return query params restore the tokenized wait flow without session storage", async ({ page }) => {
  const orderNo = "ord_return_wait_query_1";
  const paymentRecoveryToken = "recovery_return_wait_query_1";

  await mockCommonApis(page);
  await page.route(`**/api/v0.3/orders/${orderNo}*`, async (route) => {
    expect(route.request().url()).toContain(`payment_recovery_token=${paymentRecoveryToken}`);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        order_no: orderNo,
        status: "pending",
        provider: "stripe",
        pay: {
          type: "html",
          value: `/mock-pay/session/${orderNo}`,
          provider: "stripe",
        },
      }),
    });
  });

  await page.goto(
    `/en/payment/stripe/success?order_no=${orderNo}&payment_recovery_token=${paymentRecoveryToken}`
  );

  await expect(page).toHaveURL(
    `/en/pay/wait?order_no=${orderNo}&payment_recovery_token=${paymentRecoveryToken}`
  );
  await expect(page.getByText(orderNo)).toBeVisible();
  await expect(page.getByRole("button", { name: "Open payment page" })).toBeVisible();
});

test("paid wait flow enters the exact result only after report access is ready", async ({ page }) => {
  const orderNo = "ord_paid_wait_1";
  const paymentRecoveryToken = "recovery_paid_wait_1";
  const resultUrl = "/en/result/attempt-paid-wait-1?from=payment";
  let reportReady = false;
  let accessReads = 0;

  await mockCommonApis(page);
  await page.route(`**/api/v0.3/orders/${orderNo}*`, async (route) => {
    expect(route.request().url()).toContain(`payment_recovery_token=${paymentRecoveryToken}`);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        order_no: orderNo,
        status: "paid",
        attempt_id: "attempt-paid-wait-1",
        result_url: resultUrl,
        delivery: {
          can_view_report: true,
          report_url: resultUrl,
        },
      }),
    });
  });

  await page.route("**/api/v0.3/attempts/attempt-paid-wait-1/report-access*", async (route) => {
    accessReads += 1;
    await route.fulfill({
      json: {
        ok: true,
        attempt_id: "attempt-paid-wait-1",
        access_state: reportReady ? "ready" : "locked",
        report_state: "ready",
        pdf_state: "ready",
        projection_version: 1,
        actions: reportReady ? { page_href: resultUrl } : {},
      },
    });
  });

  await page.route(/\/api\/v0\.3\/attempts\/attempt-paid-wait-1\/report(?:\?.*)?$/, async (route) => {
    expect(reportReady).toBe(true);
    await route.fulfill({ json: {
      ...structuredClone(reportReadyMbtiProjectionFixture),
      locked: false, variant: "full", access_level: "paid",
    }});
  });

  await page.goto(`/en/pay/wait?order_no=${orderNo}&payment_recovery_token=${paymentRecoveryToken}`);

  await expect.poll(() => accessReads).toBeGreaterThan(0);
  await expect(page).toHaveURL(`/en/pay/wait?order_no=${orderNo}&payment_recovery_token=${paymentRecoveryToken}`);
  reportReady = true;
  await expect(page).toHaveURL(resultUrl, { timeout: 15000 });
  expect(accessReads).toBeGreaterThanOrEqual(2);
  await expect(page.getByTestId("mbti-result-shell")).toBeVisible({ timeout: 20000 });
});
