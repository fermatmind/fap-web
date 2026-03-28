import { expect, test, type Page } from "@playwright/test";
import reportReadyMbtiFreeFixture from "../fixtures/report_ready.mbti.free.json";

function createReadyMbtiReportFixture() {
  return structuredClone(reportReadyMbtiFreeFixture) as Record<string, unknown>;
}

function createAccessSummary(attemptId: string, overrides: Partial<Record<string, unknown>> = {}) {
  return {
    access_state: "ready",
    report_state: "ready",
    pdf_state: "ready",
    reason_code: "report_ready",
    access_level: "full",
    variant: "full",
    modules_allowed: ["core_full", "career", "relationships"],
    modules_preview: [],
    actions: {
      page_href: `/result/${attemptId}`,
      pdf_href: `/api/v0.3/attempts/${attemptId}/report.pdf`,
      wait_href: null,
      history_href: "/history/mbti",
      lookup_href: "/orders/lookup",
    },
    ...overrides,
  };
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
    await expect(page.getByRole("heading", { level: 1, name: "MBTI Workspace Lite" })).toBeVisible();

    await page.goto("/zh");
    await page.getByRole("link", { name: "我的结果", exact: true }).click();
    await expect(page).toHaveURL("/zh/history/mbti");
    await expect(page.getByRole("heading", { level: 1, name: "MBTI Workspace Lite" })).toBeVisible();
  });

  test("history hero keeps recovery while the latest full row exposes workspace-lite re-entry and PDF", async ({ page }) => {
    await mockCommonApis(page);
    await mockHistory(page, [
      {
        attempt_id: "attempt-history-hero-1",
        scale_code: "MBTI",
        submitted_at: "2026-03-12T09:30:00Z",
        type_code: "ENFP-T",
        access_summary: createAccessSummary("attempt-history-hero-1"),
      },
    ]);

    await page.goto("/en/history/mbti");
    await expect(page.getByTestId("mbti-history-recovery-cta")).toBeVisible();
    await expect(page.getByTestId("mbti-history-continue-cta")).toHaveText("Continue latest full result");
    await expect(page.getByTestId("mbti-history-continue-cta")).toHaveAttribute("href", "/en/result/attempt-history-hero-1");
    await expect(page.getByTestId("mbti-history-latest-status")).toContainText("Full report unlocked");
    await expect(page.getByTestId("mbti-history-latest-status")).toContainText("PDF ready");
    await expect(page.getByTestId("mbti-history-open-attempt-history-hero-1")).toHaveText("Open full result");
    await expect(page.getByTestId("mbti-history-pdf-attempt-history-hero-1")).toHaveAttribute(
      "href",
      "/api/v0.3/attempts/attempt-history-hero-1/report.pdf"
    );
    await page.getByTestId("mbti-history-recovery-cta").click();

    await expect(page).toHaveURL("/en/orders/lookup");
  });

  test("full unlocked rows without a ready PDF stay unlocked but keep PDF state honest", async ({ page }) => {
    await mockCommonApis(page);
    await mockHistory(page, [
      {
        attempt_id: "attempt-history-full-no-pdf-1",
        scale_code: "MBTI",
        submitted_at: "2026-03-12T09:30:00Z",
        type_code: "INTJ-A",
        access_summary: createAccessSummary("attempt-history-full-no-pdf-1", {
          pdf_state: "pending",
          actions: {
            page_href: "/result/attempt-history-full-no-pdf-1",
            pdf_href: null,
            wait_href: null,
            history_href: "/history/mbti",
            lookup_href: "/orders/lookup",
          },
        }),
      },
    ]);

    await page.goto("/en/history/mbti");

    await expect(page.getByTestId("mbti-history-latest-status")).toContainText("Full report unlocked");
    await expect(page.getByTestId("mbti-history-latest-status")).toContainText("PDF not ready");
    await expect(page.getByTestId("mbti-history-open-attempt-history-full-no-pdf-1")).toHaveText("Open full result");
    await expect(page.locator('[data-testid="mbti-history-pdf-attempt-history-full-no-pdf-1"]')).toHaveCount(0);
  });

  test("history rows expose free preview state without pretending the entry is fully unlocked", async ({ page }) => {
    await mockCommonApis(page);
    await mockHistory(page, [
      {
        attempt_id: "attempt-history-preview-1",
        scale_code: "MBTI",
        submitted_at: "2026-03-12T09:30:00Z",
        type_code: "INFJ-A",
        access_summary: createAccessSummary("attempt-history-preview-1", {
          access_state: "locked",
          report_state: "ready",
          pdf_state: "unavailable",
          reason_code: "preview_visible_report_ready",
          access_level: "free",
          variant: "free",
          modules_allowed: ["core_free"],
          modules_preview: ["core_full", "career"],
          actions: {
            page_href: "/result/attempt-history-preview-1",
            pdf_href: null,
            wait_href: null,
            history_href: "/history/mbti",
            lookup_href: "/orders/lookup",
          },
        }),
      },
    ]);

    await page.goto("/en/history/mbti");

    await expect(page.getByTestId("mbti-history-latest-status")).toContainText("Free preview");
    await expect(page.getByTestId("mbti-history-status-attempt-history-preview-1")).toContainText(
      "Preview scope: Full personality reading, Career mapping"
    );
    await expect(page.getByTestId("mbti-history-open-attempt-history-preview-1")).toHaveText("Continue free preview");
    await expect(page.locator('[data-testid="mbti-history-pdf-attempt-history-preview-1"]')).toHaveCount(0);
  });

  test("locked full rows stay honest and do not present themselves as unlocked workspaces", async ({ page }) => {
    await mockCommonApis(page);
    await mockHistory(page, [
      {
        attempt_id: "attempt-history-locked-full-1",
        scale_code: "MBTI",
        submitted_at: "2026-03-12T09:30:00Z",
        type_code: "ISTJ-A",
        access_summary: createAccessSummary("attempt-history-locked-full-1", {
          access_state: "locked",
          report_state: "ready",
          pdf_state: "unavailable",
          reason_code: "recovery_available",
          access_level: "full",
          variant: "full",
          modules_allowed: ["core_full", "career", "relationships"],
          modules_preview: [],
          actions: {
            page_href: "/result/attempt-history-locked-full-1",
            pdf_href: null,
            wait_href: null,
            history_href: "/history/mbti",
            lookup_href: "/orders/lookup",
          },
        }),
      },
    ]);

    await page.goto("/en/history/mbti");

    await expect(page.getByTestId("mbti-history-latest-status")).not.toContainText("Full report unlocked");
    await expect(page.getByTestId("mbti-history-open-attempt-history-locked-full-1")).toHaveText("Continue locked entry");
    await expect(page.getByTestId("mbti-history-status-attempt-history-locked-full-1")).toContainText(
      "This workspace entry is still locked. Re-open the result page to check the current state or use order lookup if you need recovery."
    );
    await expect(page.locator('[data-testid="mbti-history-pdf-attempt-history-locked-full-1"]')).toHaveCount(0);
  });

  test("processing and restoring rows use wait-entry truth for both latest and row CTAs", async ({ page }) => {
    await mockCommonApis(page);
    await mockHistory(page, [
      {
        attempt_id: "attempt-history-processing-1",
        scale_code: "MBTI",
        submitted_at: "2026-03-12T09:30:00Z",
        type_code: "ENTP-A",
        access_summary: createAccessSummary("attempt-history-processing-1", {
          access_state: "locked",
          report_state: "pending",
          pdf_state: "unavailable",
          reason_code: "projection_pending",
          access_level: "free",
          variant: "free",
          actions: {
            page_href: "/result/attempt-history-processing-1",
            pdf_href: null,
            wait_href: "/result/attempt-history-processing-1",
            history_href: "/history/mbti",
            lookup_href: "/orders/lookup",
          },
        }),
      },
      {
        attempt_id: "attempt-history-restoring-1",
        scale_code: "MBTI",
        submitted_at: "2026-03-11T09:30:00Z",
        type_code: "ENTJ-A",
        access_summary: createAccessSummary("attempt-history-restoring-1", {
          access_state: "locked",
          report_state: "restoring",
          pdf_state: "unavailable",
          reason_code: "projection_restoring",
          access_level: "free",
          variant: "free",
          actions: {
            page_href: "/result/attempt-history-restoring-1",
            pdf_href: null,
            wait_href: "/result/attempt-history-restoring-1",
            history_href: "/history/mbti",
            lookup_href: "/orders/lookup",
          },
        }),
      },
    ]);

    await page.goto("/en/history/mbti");

    await expect(page.getByTestId("mbti-history-latest-status")).toContainText("Preparing result");
    await expect(page.getByTestId("mbti-history-continue-cta")).toHaveText("Continue latest processing entry");
    await expect(page.getByTestId("mbti-history-continue-cta")).toHaveAttribute(
      "href",
      "/en/result/attempt-history-processing-1"
    );
    await expect(page.getByTestId("mbti-history-open-attempt-history-processing-1")).toHaveText("Continue processing entry");
    await expect(page.getByTestId("mbti-history-open-attempt-history-processing-1")).toHaveAttribute(
      "href",
      "/en/result/attempt-history-processing-1"
    );
    await expect(page.getByTestId("mbti-history-open-attempt-history-restoring-1")).toHaveText("Continue restoring entry");
    await expect(page.getByTestId("mbti-history-status-attempt-history-restoring-1")).toContainText(
      "This workspace entry is being restored. Use the waiting entry to continue from the current result page."
    );
  });

  test("rows without access summary stay in syncing state instead of pretending to be unavailable", async ({ page }) => {
    await mockCommonApis(page);
    await mockHistory(page, [
      {
        attempt_id: "attempt-history-syncing-1",
        scale_code: "MBTI",
        submitted_at: "2026-03-12T09:30:00Z",
        type_code: "ISFJ-T",
        access_summary: null,
      },
    ]);

    await page.goto("/en/history/mbti");

    await expect(page.getByTestId("mbti-history-latest-status")).toContainText("Status syncing");
    await expect(page.getByTestId("mbti-history-latest-status")).toContainText("Delivery syncing");
    await expect(page.getByTestId("mbti-history-status-attempt-history-syncing-1")).toContainText(
      "This workspace entry has not synced its current access state yet."
    );
    await expect(page.getByTestId("mbti-history-open-attempt-history-syncing-1")).toHaveText("Status syncing");
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
    const journeyQuery =
      "journey_contract_version=action_journey.v1&journey_fingerprint=journey-fixture-1&journey_scope=result_revisit&journey_state=refine_after_feedback&progress_state=repeatable&journey_action_focus_key=weekly_action.theme.name_decision_rule&recommended_next_pulse_keys=growth.watchouts%7Cread-explain&revisit_reorder_reason=reorder_after_feedback&pulse_state=recalibrate&pulse_prompt_keys=pulse.review_feedback_signal%7Cpulse.refine_focus";

    await mockCommonApis(page);
    await mockHistory(page, [
      {
        attempt_id: attemptId,
        scale_code: "MBTI",
        submitted_at: "2026-03-12T09:30:00Z",
        type_code: "INFJ-A",
        access_summary: createAccessSummary(attemptId),
      },
    ]);
    await page.route(`**/api/v0.3/attempts/${attemptId}/report-access*`, async (route) => {
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
          projection_version: 1,
          actions: {
            page_href: `/en/result/${attemptId}`,
            pdf_href: `/api/v0.3/attempts/${attemptId}/report.pdf`,
            wait_href: null,
            history_href: "/history/mbti",
            lookup_href: "/orders/lookup",
          },
          meta: {
            produced_at: "2026-03-27T00:00:00.000Z",
            refreshed_at: "2026-03-27T00:00:00.000Z",
          },
        }),
      });
    });
    await page.route(`**/api/v0.3/attempts/${attemptId}/report`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(createReadyMbtiReportFixture()),
      });
    });

    await page.goto(`/en/history/mbti?${journeyQuery}`);
    await expect(page.getByTestId(`mbti-history-open-${attemptId}`)).toBeVisible();
    await expect(page.getByText("This is now your MBTI Workspace Lite entry: continue from saved results here, or recover a purchased report through order lookup.")).toBeVisible();
    await expect(page.getByTestId("mbti-history-open-attempt-history-open-1")).toHaveText("Open full result");
    await expect(page.getByTestId("mbti-history-journey-context")).toContainText(
      "Refine the current focus after feedback"
    );
    await expect(page.getByTestId("mbti-history-continue-cta")).toHaveAttribute(
      "href",
      /journey_state=refine_after_feedback/
    );

    await page.getByTestId(`mbti-history-open-${attemptId}`).click();

    await expect(page).toHaveURL(new RegExp(`/en/result/${attemptId}\\?.*journey_state=refine_after_feedback.*pulse_state=recalibrate`));
    await expect(page.getByRole("heading", { level: 1, name: "Your assessment result" })).toBeVisible();
  });
});
