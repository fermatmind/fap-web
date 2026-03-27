import { expect, test } from "@playwright/test";

test("BIG5 history result-center keeps row summaries and actions without extra report fetches", async ({ page }) => {
  let reportRequestCount = 0;
  let reportAccessRequestCount = 0;

  await page.addInitScript(() => {
    window.localStorage.setItem("fap_anonymous_id_v1", "anon_e2e_big5_history_result_center_001");
    Object.defineProperty(window.navigator, "share", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          (window as typeof window & { __copiedBig5HistoryUrl?: string }).__copiedBig5HistoryUrl = value;
        },
      },
    });
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
        fm_token: "fm_e2e_big5_history_result_center_guest",
      }),
    });
  });

  await page.route(/\/api\/v0\.3\/attempts\/[^/]+\/report-access(?:\?.*)?$/, async (route) => {
    reportAccessRequestCount += 1;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: false,
        message: "history should not fetch row-level report access",
      }),
    });
  });

  await page.route(/\/api\/v0\.3\/attempts\/[^/]+\/report(?:\?.*)?$/, async (route) => {
    reportRequestCount += 1;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: false,
        message: "history should not fetch row-level reports",
      }),
    });
  });

  await page.route("**/api/v0.3/me/attempts*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        scale_code: "BIG5_OCEAN",
        items: [
          {
            attempt_id: "attempt-latest",
            submitted_at: "2026-03-25T00:00:00Z",
            result_summary: {
              domains_mean: {
                O: 88,
                A: 74,
                C: 69,
                E: 52,
                N: 41,
              },
            },
            top_facets_summary_v1: {
              items: [
                { key: "O5", label: "O5 Intellect", domain: "O", percentile: 88, bucket: "high", kind: "strength" },
                { key: "A3", label: "A3 Altruism", domain: "A", percentile: 74, bucket: "high", kind: "strength" },
              ],
            },
            quality_summary: {
              level: "A",
              grade: "A",
            },
            norms_summary: {
              status: "CALIBRATED",
              norms_version: "2026Q1",
            },
            offer_summary: {
              primary_offer: null,
            },
            share_summary: {
              enabled: true,
              share_kind: "big5_result",
            },
            access_summary: {
              access_state: "ready",
              report_state: "ready",
              pdf_state: "ready",
              access_level: "full",
              variant: "full",
              actions: {
                page_href: "/en/result/attempt-latest",
                pdf_href: "/api/v0.3/attempts/attempt-latest/report.pdf",
              },
            },
          },
          {
            attempt_id: "attempt-previous",
            submitted_at: "2026-03-18T00:00:00Z",
            result_summary: {
              domains_mean: {
                O: 72,
                C: 65,
                A: 61,
              },
            },
            top_facets_summary_v1: {
              items: [
                { key: "N1", label: "N1 Anxiety", domain: "N", percentile: 79, bucket: "high", kind: "strength" },
              ],
            },
            quality_summary: {
              level: "B",
              grade: "B",
            },
            norms_summary: {
              status: "CALIBRATED",
              norms_version: "2025Q4",
            },
            offer_summary: {
              primary_offer: {
                sku: "SKU_BIG5_FULL_REPORT_299",
                title: "BIG5 Full Report",
                formatted_price: "¥2.99",
                price_cents: 299,
                currency: "CNY",
                benefit_code: "BIG5_FULL_REPORT",
                modules_included: ["big5_full", "big5_action_plan"],
              },
            },
            share_summary: {
              enabled: true,
              share_kind: "big5_result",
            },
            access_summary: {
              access_state: "locked",
              report_state: "ready",
              pdf_state: "missing",
              access_level: "preview",
              variant: "free",
              actions: {
                page_href: "/en/result/attempt-previous",
                pdf_href: null,
              },
            },
          },
        ],
        history_compare: {
          current_attempt_id: "attempt-latest",
          previous_attempt_id: "attempt-previous",
          domains_delta: {
            O: { delta: 16, direction: "up" },
          },
        },
        meta: {
          current_page: 1,
          last_page: 1,
        },
      }),
    });
  });

  await page.route("**/api/v0.3/attempts/attempt-latest/share*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        share_id: "share-big5-history-001",
        share_url: "http://127.0.0.1:3000/en/share/share-big5-history-001",
      }),
    });
  });

  await page.goto("/en/history/big5");

  const latestRow = page.getByTestId("big5-history-row-attempt-latest");
  await expect(latestRow).toBeVisible();
  await expect(latestRow).toContainText("Lead domains: Openness, Agreeableness, Conscientiousness");
  await expect(page.getByTestId("big5-history-row-quality-attempt-latest")).toContainText("Quality · A");
  await expect(page.getByTestId("big5-history-row-norms-attempt-latest")).toContainText("Norms · CALIBRATED · 2026Q1");
  await expect(page.getByTestId("big5-history-row-facet-attempt-latest-O5")).toContainText("O5 Intellect · P88");
  await expect(latestRow.getByRole("link", { name: "Open formal result" })).toHaveAttribute("href", "/en/result/attempt-latest");
  await expect(latestRow.getByRole("link", { name: "Compare latest two" })).toHaveAttribute(
    "href",
    "/en/history/big5/compare?current=attempt-latest&previous=attempt-previous"
  );
  await expect(page.getByTestId("big5-history-row-pdf-attempt-latest").getByRole("button", { name: "Download PDF" })).toBeVisible();

  const lockedRow = page.getByTestId("big5-history-row-attempt-previous");
  await expect(lockedRow).toContainText("Preview access only");
  await expect(lockedRow.getByRole("link", { name: "Open result preview" })).toHaveAttribute("href", "/en/result/attempt-previous");
  await expect(page.getByTestId("big5-history-row-offer-attempt-previous")).toContainText("BIG5 Full Report");
  await expect(page.getByTestId("big5-history-row-offer-attempt-previous")).toContainText("¥2.99");

  await latestRow.getByRole("button", { name: "Share result" }).click();

  await expect
    .poll(async () =>
      page.evaluate(() => (window as typeof window & { __copiedBig5HistoryUrl?: string }).__copiedBig5HistoryUrl ?? "")
    )
    .toBe("http://127.0.0.1:3000/en/share/share-big5-history-001");
  await expect(latestRow.getByRole("button", { name: "Link copied" })).toBeVisible();

  expect(reportRequestCount).toBe(0);
  expect(reportAccessRequestCount).toBe(0);
});
