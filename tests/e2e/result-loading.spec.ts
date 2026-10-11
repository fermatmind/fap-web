import { immutableBig5Authority } from "./helpers/big5-public-api-fixture";
import { expect, test } from "@playwright/test";

test("result page shows anticipation skeleton while loading", async ({ page }) => {
  const attemptId = "result-loading-001";
  const reportAccessPattern = new RegExp(`/api/v0\\.3/attempts/${attemptId}/report-access(?:\\?.*)?$`);
  const reportPattern = new RegExp(`/api/v0\\.3/attempts/${attemptId}/report(?:\\?.*)?$`);
  let reportAccessRequestCount = 0;
  let reportRequestCount = 0;

  await page.route("**/api/v0.3/auth/guest*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        fm_token: "fm_e2e_result_loading_guest_token",
      }),
    });
  });

  await page.route(reportAccessPattern, async (route) => {
    reportAccessRequestCount += 1;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        attempt_id: attemptId,
        access_state: "ready",
        report_state: "ready",
        pdf_state: "ready",
        reason_code: "report_ready",
        payload: { scale_code: "BIG5_OCEAN" },
        projection_version: 1,
        actions: {
          page_href: `/en/result/${attemptId}`,
          pdf_href: `/api/v0.3/attempts/${attemptId}/report.pdf`,
        },
        meta: {
          produced_at: "2026-03-27T00:00:00.000Z",
          refreshed_at: "2026-03-27T00:00:00.000Z",
        },
      }),
    });
  });

  await page.route(reportPattern, async (route) => {
    reportRequestCount += 1;
    await new Promise((resolve) => setTimeout(resolve, 1200));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        locked: false,
        big5_private_result_authority: immutableBig5Authority(),
        variant: "full",
        quality: { level: "A" },
        offers: [],
        report: {
          scale_code: "BIG5_OCEAN",
          sections: [
            {
              key: "summary",
              title: "Summary",
              access_level: "free",
              blocks: [{ kind: "paragraph", title: "Summary", body: "done" }],
            },
          ],
        },
      }),
    });
  });

  await page.route("**/api/v0.3/scales/lookup?*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        slug: "big-five-personality-test-ocean-model",
        capabilities: {
          enabled_in_prod: true,
          paywall_mode: "full",
        },
      }),
    });
  });

  await page.goto(`/en/result/${attemptId}`);

  const processing = page.getByTestId("result-processing-wait");
  await expect(processing.getByRole("status")).toContainText("Generating your assessment result...");
  await expect(processing.getByRole("progressbar")).toBeVisible();
  await expect(page.getByText("done", { exact: true })).toHaveCount(0);
  await expect(page.getByText("done", { exact: true })).toBeVisible({ timeout: 20000 });
  await expect(processing).toHaveCount(0);
  expect(reportAccessRequestCount).toBeGreaterThan(0);
  expect(reportRequestCount).toBeGreaterThan(0);
});
