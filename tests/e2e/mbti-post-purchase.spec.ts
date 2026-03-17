import { expect, test, type Page } from "@playwright/test";
import reportReadyMbtiProjectionFixture from "../fixtures/report_ready.mbti.projection.json";

function createUnlockedMbtiReportFixture(attemptId: string) {
  const fixture = structuredClone(reportReadyMbtiProjectionFixture) as Record<string, unknown>;
  fixture.locked = false;
  fixture.variant = "full";
  fixture.access_level = "paid";
  fixture.modules_allowed = ["core_full", "career", "relationships"];
  fixture.mbti_access_hub_v1 = createMbtiAccessHubRaw(attemptId, "ord_mbti_post_purchase_0001");
  return fixture;
}

function createMbtiAccessHubRaw(attemptId: string, orderNo: string) {
  return {
    access_state: "ready",
    report_access: {
      can_view_report: true,
      attempt_id: attemptId,
      order_no: orderNo,
      report_url: `/api/v0.3/attempts/${attemptId}/report`,
      source: "report_gate",
    },
    pdf_access: {
      can_download_pdf: true,
      report_pdf_url: `/api/v0.3/attempts/${attemptId}/report.pdf`,
      source: "attempt_pdf",
    },
    recovery: {
      can_lookup_order: true,
      can_request_claim_email: true,
      can_resend: true,
      attempt_id: attemptId,
      share_id: null,
      compare_invite_id: null,
    },
    workspace_lite: {
      has_entry: true,
      entry_kind: "mbti_history",
      attempt_id: attemptId,
    },
  };
}

async function installCommonMocks(page: Page) {
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
}

async function installUnlockedResultMocks(
  page: Page,
  attemptId: string
) {
  let reportRequestCount = 0;

  await page.route(`**/api/v0.3/attempts/${attemptId}/report*`, async (route) => {
    reportRequestCount += 1;
    if (reportRequestCount === 1) {
      await new Promise((resolve) => setTimeout(resolve, 1200));
    }

      await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(createUnlockedMbtiReportFixture(attemptId)),
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
}

test("MBTI paid orders auto-redirect to the unlocked result page", async ({ page }) => {
  const attemptId = "mbti-post-purchase-0001";
  const orderNo = "ord_mbti_post_purchase_0001";

  await installCommonMocks(page);
  await installUnlockedResultMocks(page, attemptId);

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

  await page.goto(`/en/orders/${orderNo}`);

  await expect(page).toHaveURL(new RegExp(`/en/result/${attemptId}(\\?.*)?$`));
  const terminalSurface = page.getByTestId("mbti-post-purchase-section");
  await expect(terminalSurface).toBeVisible();
  await expect(page.getByTestId("mbti-hero")).toContainText("Projection Campaigner");
  await expect(page.getByTestId("mbti-hero")).toContainText("Projection-first summary that should replace the legacy hero copy on result pages.");
  await expect(page.getByTestId("mbti-career-next-step-cta")).toHaveAttribute(
    "href",
    "/en/career/recommendations/mbti/enfp"
  );
  await expect(terminalSurface.getByRole("button", { name: "Download PDF" })).toBeVisible();
  await expect(terminalSurface.getByRole("link", { name: "My MBTI reports" })).toHaveAttribute("href", "/en/history/mbti");
  await expect(terminalSurface.getByRole("link", { name: "Order details" })).toHaveAttribute("href", `/en/orders/${orderNo}`);
  await expect(terminalSurface.getByRole("link", { name: "Order lookup" })).toHaveAttribute("href", "/en/orders/lookup");
});

test("MBTI result pages keep post-purchase retention and history re-entry", async ({ page }) => {
  const attemptId = "mbti-post-purchase-0001";

  await installCommonMocks(page);
  await installUnlockedResultMocks(page, attemptId);

  await page.goto(`/en/result/${attemptId}`);

  const terminalSurface = page.getByTestId("mbti-post-purchase-section");
  await expect(page).toHaveURL(new RegExp(`/en/result/${attemptId}(\\?.*)?$`));
  await expect(terminalSurface).toBeVisible();
  await expect(page.getByTestId("mbti-career-next-step-cta")).toHaveAttribute(
    "href",
    "/en/career/recommendations/mbti/enfp"
  );
  await expect(terminalSurface.getByRole("button", { name: "Download PDF" })).toBeVisible();
  await expect(terminalSurface.getByRole("link", { name: "My MBTI reports" })).toHaveAttribute("href", "/en/history/mbti");
  await expect(terminalSurface.getByRole("link", { name: "Order details" })).toHaveAttribute("href", "/en/orders/ord_mbti_post_purchase_0001");
  await expect(terminalSurface.getByRole("link", { name: "Order lookup" })).toHaveAttribute("href", "/en/orders/lookup");

  await page.getByTestId("mbti-post-purchase-history").click();

  await expect(page).toHaveURL("/en/history/mbti");
  await expect(page.getByTestId("mbti-history-client")).toBeVisible();
  await expect(page.getByTestId("mbti-history-card")).toContainText("ENFP-T");

  await page.getByTestId(`mbti-history-open-${attemptId}`).click();

  await expect(page).toHaveURL(new RegExp(`/en/result/${attemptId}(\\?.*)?$`));
  await expect(page.getByTestId("mbti-post-purchase-section")).toBeVisible();
});
