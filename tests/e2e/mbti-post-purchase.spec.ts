import { expect, test } from "@playwright/test";
import reportReadyMbtiFreeFixture from "../fixtures/report_ready.mbti.free.json";

function createUnlockedMbtiReportFixture() {
  const fixture = structuredClone(reportReadyMbtiFreeFixture) as Record<string, unknown>;
  fixture.locked = false;
  fixture.variant = "full";
  fixture.access_level = "paid";
  fixture.modules_allowed = ["core_full", "career", "relationships"];
  return fixture;
}

test("MBTI post-purchase retention keeps a formal re-entry path after payment", async ({ page }) => {
  const attemptId = "mbti-post-purchase-0001";
  const orderNo = "ord_mbti_post_purchase_0001";
  let reportRequestCount = 0;

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
        fm_token: "fm_e2e_mbti_post_purchase_guest_token",
      }),
    });
  });

  await page.route(`**/api/v0.3/orders/${orderNo}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        order_no: orderNo,
        status: "paid",
        attempt_id: attemptId,
        message: "Your full report is ready.",
        delivery: {
          can_view_report: true,
          report_url: `/result/${attemptId}`,
          can_download_pdf: true,
          report_pdf_url: `/api/v0.3/attempts/${attemptId}/report.pdf`,
          can_resend: true,
        },
      }),
    });
  });

  await page.route(`**/api/v0.3/attempts/${attemptId}/report*`, async (route) => {
    reportRequestCount += 1;
    if (reportRequestCount === 1) {
      await new Promise((resolve) => setTimeout(resolve, 1200));
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(createUnlockedMbtiReportFixture()),
    });
  });

  await page.route("**/api/v0.3/me/attempts*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        scale_code: "MBTI",
        items: [
          {
            attempt_id: attemptId,
            scale_code: "MBTI",
            submitted_at: "2026-03-11T12:00:00Z",
            type_code: "ENFP-T",
          },
        ],
        meta: {
          current_page: 1,
          last_page: 1,
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

  await page.route(`**/api/v0.3/orders/${orderNo}/resend`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        message: "Delivery email sent again.",
      }),
    });
  });

  await page.goto(`/en/orders/${orderNo}`);

  await expect(page.getByTestId("order-delivery-actions")).toBeVisible();
  await expect(page.getByTestId("order-view-report")).toBeVisible();
  await expect(page.getByTestId("order-download-pdf")).toBeVisible();
  await expect(page.getByTestId("order-resend-delivery")).toBeVisible();

  await expect(page).toHaveURL(new RegExp(`/en/result/${attemptId}(\\?.*)?$`));
  await expect(page.getByTestId("mbti-post-purchase-section")).toBeVisible();
  await expect(page.getByTestId("mbti-post-purchase-section").getByRole("button", { name: "Download PDF" })).toBeVisible();
  await expect(page.getByTestId("mbti-post-purchase-section").getByRole("link", { name: "My MBTI reports" })).toBeVisible();
  await expect(page.getByTestId("mbti-post-purchase-section").getByRole("link", { name: "Order lookup" })).toBeVisible();

  await page.getByTestId("mbti-post-purchase-history").click();

  await expect(page).toHaveURL("/en/history/mbti");
  await expect(page.getByTestId("mbti-history-client")).toBeVisible();
  await expect(page.getByTestId("mbti-history-card")).toContainText("ENFP-T");

  await page.getByTestId(`mbti-history-open-${attemptId}`).click();

  await expect(page).toHaveURL(new RegExp(`/en/result/${attemptId}(\\?.*)?$`));
  await expect(page.getByTestId("mbti-post-purchase-section")).toBeVisible();
});
