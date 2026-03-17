import { expect, test, type Page } from "@playwright/test";
import reportReadyMbtiFreeFixture from "../fixtures/report_ready.mbti.free.json";

function createReadyMbtiReportFixture() {
  return structuredClone(reportReadyMbtiFreeFixture) as Record<string, unknown>;
}

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
        fm_token: "fm_mbti_history_account_center_guest_token",
      }),
    });
  });
}

async function mockHistory(page: Page, items: Array<Record<string, unknown>>) {
  await page.route("**/api/v0.3/me/attempts*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        scale_code: "MBTI",
        items,
        meta: {
          current_page: 1,
          last_page: 1,
        },
      }),
    });
  });
}

test.describe("MBTI history account-center entry", () => {
  test("header My Results entry routes into MBTI history for both locales", async ({ page }) => {
    await mockCommonApis(page);
    await mockHistory(page, []);

    await page.goto("/en");
    await page.getByRole("link", { name: "My Results", exact: true }).click();
    await expect(page).toHaveURL("/en/history/mbti");
    await expect(page.getByRole("heading", { level: 1, name: "My MBTI Results" })).toBeVisible();

    await page.goto("/zh");
    await page.getByRole("link", { name: "我的结果", exact: true }).click();
    await expect(page).toHaveURL("/zh/history/mbti");
    await expect(page.getByRole("heading", { level: 1, name: "我的 MBTI 结果" })).toBeVisible();
  });

  test("history hero keeps a recovery CTA that routes into order lookup", async ({ page }) => {
    await mockCommonApis(page);
    await mockHistory(page, [
      {
        attempt_id: "attempt-history-hero-1",
        scale_code: "MBTI",
        submitted_at: "2026-03-12T09:30:00Z",
        type_code: "ENFP-T",
      },
    ]);

    await page.goto("/en/history/mbti");
    await expect(page.getByTestId("mbti-history-recovery-cta")).toBeVisible();
    await expect(page.getByTestId("mbti-history-continue-cta")).toHaveAttribute("href", "/en/result/attempt-history-hero-1");
    await page.getByTestId("mbti-history-recovery-cta").click();

    await expect(page).toHaveURL("/en/orders/lookup");
  });

  test("history empty state shows both take-test and purchased-report recovery actions", async ({ page }) => {
    await mockCommonApis(page);
    await mockHistory(page, []);

    await page.goto("/en/history/mbti");

    await expect(page.getByTestId("mbti-history-empty")).toBeVisible();
    await expect(page.getByTestId("mbti-history-empty-start")).toHaveText("Take the MBTI test");
    await expect(page.getByTestId("mbti-history-empty-start")).toHaveAttribute(
      "href",
      "/en/tests/mbti-personality-test-16-personality-types/take"
    );
    await expect(page.getByTestId("mbti-history-empty-recovery")).toHaveText("Recover a purchased report");
    await expect(page.getByTestId("mbti-history-empty-recovery")).toHaveAttribute("href", "/en/orders/lookup");
  });

  test("history list items still route into the existing result page", async ({ page }) => {
    const attemptId = "attempt-history-open-1";

    await mockCommonApis(page);
    await mockHistory(page, [
      {
        attempt_id: attemptId,
        scale_code: "MBTI",
        submitted_at: "2026-03-12T09:30:00Z",
        type_code: "INFJ-A",
      },
    ]);
    await page.route(`**/api/v0.3/attempts/${attemptId}/report*`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(createReadyMbtiReportFixture()),
      });
    });

    await page.goto("/en/history/mbti");
    await expect(page.getByTestId(`mbti-history-open-${attemptId}`)).toBeVisible();
    await expect(page.getByText("This is now your MBTI Workspace Lite entry: continue from saved results here, or recover a purchased report through order lookup.")).toBeVisible();

    await page.getByTestId(`mbti-history-open-${attemptId}`).click();

    await expect(page).toHaveURL(new RegExp(`/en/result/${attemptId}(\\?.*)?$`));
    await expect(page.getByRole("heading", { level: 1, name: "Your assessment result" })).toBeVisible();
  });
});
