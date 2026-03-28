import { expect, test } from "@playwright/test";
import reportReadyMbtiFreeFixture from "../fixtures/report_ready.mbti.free.json";
import reportReadyMbtiProjectionFixture from "../fixtures/report_ready.mbti.projection.json";
import { applyMbtiPhase2Fixture } from "@/tests/helpers/mbtiPhase2Fixture";
import type { ReportResponse } from "@/lib/api/v0_3";

function createMbtiLockedReportFixture() {
  return applyMbtiPhase2Fixture(structuredClone(reportReadyMbtiProjectionFixture) as ReportResponse) as Record<string, unknown>;
}

function createMbtiLockedPreviewReportFixture() {
  const reportData = applyMbtiPhase2Fixture(structuredClone(reportReadyMbtiProjectionFixture) as ReportResponse) as ReportResponse;
  const freeFixture = structuredClone(reportReadyMbtiFreeFixture) as ReportResponse;
  const projectionSections = reportData.report?.sections as Record<string, unknown> | undefined;
  const freeSections = freeFixture.report?.sections as Record<string, unknown> | undefined;

  if (!projectionSections || !freeSections) {
    throw new Error("Expected MBTI sections in preview fixture");
  }

  projectionSections.growth = structuredClone(freeSections.growth);
  reportData.locked = true;
  reportData.variant = "free";
  reportData.access_level = "free";
  reportData.modules_allowed = ["core_free"];
  reportData.modules_preview = ["career", "relationships", "core_full"];

  return reportData as Record<string, unknown>;
}

test("MBTI locked access report still shows unlock offer block on /zh/result/<attemptId>#offer-full", async ({ page }) => {
  const attemptId = "827adbb2-f7d1-40de-9190-578ca788c348";
  const orderNo = "ord_mbti_lock_offer_199";
  const paymentRecoveryToken = "token_mbti_lock_offer";

  await page.addInitScript(() => {
    window.localStorage.setItem(
      "fm_consent_v1",
      JSON.stringify({
        analytics: "granted",
        updatedAt: "2026-03-24T00:00:00.000Z",
      })
    );
    window.localStorage.setItem("fap_anonymous_id_v1", "anon_e2e_mbti_lock_offer_199");
  });

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
        fm_token: "fm_e2e_mbti_lock_offer_199",
      }),
    });
  });

  const pagePath = `/zh/result/${attemptId}#offer-full`;

  await page.route(`**/api/v0.3/attempts/${attemptId}/report-access*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        attempt_id: attemptId,
        access_state: "locked",
        report_state: "ready",
        pdf_state: "ready",
        reason_code: "projection_missing_result_ready",
        projection_version: 1,
        actions: {
          page_href: `/zh/result/${attemptId}`,
          pdf_href: `/api/v0.3/attempts/${attemptId}/report.pdf`,
          wait_href: `/pay/wait?order_no=${orderNo}`,
          history_href: "/history/mbti",
          lookup_href: "/orders/lookup",
        },
        payload: {},
        meta: {
          produced_at: "2026-03-24T00:00:00.000Z",
          refreshed_at: "2026-03-24T00:00:00.000Z",
        },
      }),
    });
  });

  await page.route(`**/api/v0.3/attempts/${attemptId}/report`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(
        createMbtiLockedReportFixture()
      ),
    });
  });

  await page.route(`**/api/v0.3/attempts/${attemptId}/result*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        attempt_id: attemptId,
        scale_code: "MBTI",
        result: {
          type_code: "ENFP-T",
          summary: "Projection fallback summary remains available.",
        },
      }),
    });
  });

  await page.route(`**/api/v0.3/attempts/${attemptId}/report.pdf*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/pdf",
      body: "%PDF-1.4 MBTI report",
    });
  });

  await page.route("**/api/v0.3/orders/checkout", async (route) => {
    const requestBody = route.request().postDataJSON() as { attempt_id?: string; sku?: string };
    expect(requestBody.attempt_id).toBe(attemptId);
    expect(typeof requestBody.sku).toBe("string");

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
        pay: {
          type: "qr",
          value: "weixin://wxpay/bizpayurl?pr=mbti-lock-offer",
          provider: "wechatpay",
        },
      }),
    });
  });

  await page.goto(pagePath);

  await expect(page.getByTestId("mbti-result-shell")).toBeVisible();
  await expect(page.getByTestId("mbti-offer-comparison")).toBeVisible();
  await expect(page.getByTestId("mbti-post-purchase-section")).toHaveCount(0);
  await expect(page.locator("#offer-full")).toBeVisible();
  await expect(page.getByRole("button", { name: "解锁完整报告" })).toBeVisible();
  await expect(page.getByTestId("mbti-offers-primary-cta")).toHaveText("解锁完整报告");

  await page.getByTestId("mbti-offers-primary-cta").click();

  await expect(page).toHaveURL(new RegExp(`/zh/pay/wait\\?order_no=${orderNo}.*`));
});

test("MBTI result page keeps the unlock offer block on the current access-first report path", async ({ page }) => {
  const attemptId = "827adbb2-f7d1-40de-9190-578ca788c348";
  const orderNo = "ord_mbti_access_payload_199";
  const paymentRecoveryToken = "token_mbti_access_payload";

  await page.addInitScript(() => {
    window.localStorage.setItem(
      "fm_consent_v1",
      JSON.stringify({
        analytics: "granted",
        updatedAt: "2026-03-24T00:00:00.000Z",
      })
    );
    window.localStorage.setItem("fap_anonymous_id_v1", "anon_e2e_mbti_access_payload_199");
  });

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
        fm_token: "fm_e2e_mbti_access_payload_199",
      }),
    });
  });

  const pagePath = `/zh/result/${attemptId}#offer-full`;
  await page.route(`**/api/v0.3/attempts/${attemptId}/report-access*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        attempt_id: attemptId,
        access_state: "locked",
        report_state: "ready",
        pdf_state: "ready",
        reason_code: "projection_missing_result_ready",
        projection_version: 1,
        actions: {
          page_href: `/zh/result/${attemptId}`,
          pdf_href: `/api/v0.3/attempts/${attemptId}/report.pdf`,
          wait_href: `/pay/wait?order_no=${orderNo}`,
          history_href: "/history/mbti",
          lookup_href: "/orders/lookup",
        },
        payload: {},
        meta: {
          produced_at: "2026-03-24T00:00:00.000Z",
          refreshed_at: "2026-03-24T00:00:00.000Z",
        },
      }),
    });
  });

  await page.route(`**/api/v0.3/attempts/${attemptId}/result*`, async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ ok: false, message: "result fallback should not be needed for this case." }),
    });
  });

  await page.route(`**/api/v0.3/attempts/${attemptId}/report.pdf*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/pdf",
      body: "%PDF-1.4 MBTI report",
    });
  });

  await page.route(`**/api/v0.3/orders/checkout`, async (route) => {
    const requestBody = route.request().postDataJSON() as { attempt_id?: string; sku?: string };
    expect(requestBody.attempt_id).toBe(attemptId);
    expect(typeof requestBody.sku).toBe("string");

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
        pay: {
          type: "qr",
          value: "weixin://wxpay/bizpayurl?pr=mbti-access-payload-offer",
          provider: "wechatpay",
        },
      }),
    });
  });

  await page.route(`**/api/v0.3/attempts/${attemptId}/report`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(createMbtiLockedReportFixture()),
    });
  });

  await page.goto(pagePath);

  await expect(page.getByTestId("mbti-result-shell")).toBeVisible();
  await expect(page.getByTestId("mbti-offer-comparison")).toBeVisible();
  await expect(page.getByTestId("mbti-post-purchase-section")).toHaveCount(0);
  await expect(page.locator("#offer-full")).toBeVisible();
  await expect(page.getByRole("button", { name: "解锁完整报告" })).toBeVisible();
  await expect(page.getByTestId("mbti-offers-primary-cta")).toHaveText("解锁完整报告");

  await page.getByTestId("mbti-offers-primary-cta").click();

  await expect(page).toHaveURL(new RegExp(`/zh/pay/wait\\?order_no=${orderNo}.*`));
});

test("MBTI preview cards stay visible while the page remains on the locked offer path", async ({ page }) => {
  const attemptId = "mbti-preview-pay-block-0001";

  await page.addInitScript(() => {
    window.localStorage.setItem(
      "fm_consent_v1",
      JSON.stringify({
        analytics: "granted",
        updatedAt: "2026-03-24T00:00:00.000Z",
      })
    );
    window.localStorage.setItem("fap_anonymous_id_v1", "anon_e2e_mbti_preview_pay_block");
  });

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
        fm_token: "fm_e2e_mbti_preview_pay_block",
      }),
    });
  });

  await page.route(`**/api/v0.3/attempts/${attemptId}/report-access*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        attempt_id: attemptId,
        access_state: "locked",
        report_state: "ready",
        pdf_state: "missing",
        reason_code: "preview_visible_report_ready",
        projection_version: 1,
        actions: {
          page_href: `/zh/result/${attemptId}`,
          pdf_href: null,
          wait_href: `/zh/result/${attemptId}`,
          history_href: "/history/mbti",
          lookup_href: "/orders/lookup",
        },
        payload: {},
        meta: {
          produced_at: "2026-03-24T00:00:00.000Z",
          refreshed_at: "2026-03-24T00:00:00.000Z",
        },
      }),
    });
  });

  await page.route(`**/api/v0.3/attempts/${attemptId}/report`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(createMbtiLockedPreviewReportFixture()),
    });
  });

  await page.route(`**/api/v0.3/attempts/${attemptId}/result*`, async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ ok: false, message: "preview flow should remain on /report." }),
    });
  });

  await page.goto(`/zh/result/${attemptId}`);

  await expect(page.getByTestId("mbti-result-shell")).toBeVisible();
  await expect(page.getByTestId("mbti-offer-comparison")).toBeVisible();
  await expect(page.getByTestId("mbti-chapter-preview-growth")).toBeVisible();
  await expect(page.getByTestId("mbti-chapter-growth")).toContainText("你的成长主线：把强项做成可复用资产");
  await expect(page.getByTestId("mbti-chapter-growth").getByTestId("mbti-chapter-unlock-card")).toHaveCount(0);
});
