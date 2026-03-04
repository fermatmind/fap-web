import { expect, test, type Page } from "@playwright/test";
import { getStableMasks, prepareVisualPage, waitForVisualStability } from "./visual-helpers";

async function mockIqTake(page: Page) {
  for (const scaleCode of ["IQ_RAVEN", "IQ_INTELLIGENCE_QUOTIENT"]) {
    await page.route(`**/api/v0.3/scales/${scaleCode}/questions*`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          scale_code: "IQ_RAVEN",
          questions: {
            items: [
              {
                question_id: "MATRIX_Q01",
                order: 1,
                text: null,
                stem: {
                  prompt_en: "Which option fits?",
                  prompt_zh: "哪个选项适合？",
                  svg: {
                    view_box: "0 0 120 80",
                    paths: [
                      { d: "M 5 5 L 115 5 L 115 75 L 5 75 Z", fill: "#f8fafc" },
                      { d: "M 15 15 L 45 15 L 45 45 L 15 45 Z", fill: "#cbd5e1" },
                      { d: "M 75 15 L 105 15 L 105 45 L 75 45 Z", fill: "#94a3b8" },
                    ],
                  },
                },
                options: [
                  {
                    code: "A",
                    svg: {
                      view_box: "0 0 20 20",
                      paths: [{ d: "M 2 2 L 18 2 L 18 18 L 2 18 Z", stroke: "#0f172a", stroke_width: 2 }],
                    },
                  },
                  {
                    code: "B",
                    svg: {
                      view_box: "0 0 20 20",
                      paths: [{ d: "M 3 3 L 17 17", stroke: "#0f172a", stroke_width: 2 }],
                    },
                  },
                  {
                    code: "C",
                    svg: {
                      view_box: "0 0 20 20",
                      paths: [{ d: "M 3 17 L 17 3", stroke: "#0f172a", stroke_width: 2 }],
                    },
                  },
                  {
                    code: "D",
                    svg: {
                      view_box: "0 0 20 20",
                      paths: [{ d: "M 10 2 L 10 18", stroke: "#0f172a", stroke_width: 2 }],
                    },
                  },
                  {
                    code: "E",
                    svg: {
                      view_box: "0 0 20 20",
                      paths: [{ d: "M 2 10 L 18 10", stroke: "#0f172a", stroke_width: 2 }],
                    },
                  },
                  {
                    code: "F",
                    svg: {
                      view_box: "0 0 20 20",
                      paths: [{ d: "M 3 3 L 17 3 L 10 17 Z", stroke: "#0f172a", stroke_width: 2 }],
                    },
                  },
                ],
              },
            ],
          },
        }),
      });
    });
  }

  await page.route("**/api/v0.3/scales/lookup?*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        slug: "iq-test-intelligence-quotient-assessment",
        is_indexable: true,
        capabilities: {
          enabled_in_prod: true,
          commerce_enabled: true,
          paywall_mode: "full",
        },
      }),
    });
  });

  await page.route("**/api/v0.3/auth/guest*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        fm_token: "fm_visual_iq_token_123456789",
      }),
    });
  });

  await page.route("**/api/v0.3/attempts/start", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        attempt_id: "iq-visual-attempt-001",
        scale_code: "IQ_RAVEN",
      }),
    });
  });

  await page.route("**/api/track", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });
}

test("IQ take desktop visual baseline", async ({ page }) => {
  await mockIqTake(page);
  await prepareVisualPage(page);
  await page.goto("/en/tests/iq-test-intelligence-quotient-assessment/take");
  await page.waitForLoadState("networkidle");
  await waitForVisualStability(page);

  const card = page.getByTestId("iq-option-board-desktop").first();
  await expect(card).toBeVisible({ timeout: 30000 });
  await card.scrollIntoViewIfNeeded();
  await waitForVisualStability(page);

  await expect(card).toHaveScreenshot("iq-take-desktop-options-en.png", {
    mask: getStableMasks(page),
    maxDiffPixelRatio: 0.02,
  });
});

test("IQ take mobile visual baseline", async ({ page }) => {
  await mockIqTake(page);
  await prepareVisualPage(page);
  await page.setViewportSize({ width: 390, height: 1100 });
  await page.goto("/en/tests/iq-test-intelligence-quotient-assessment/take");
  await page.waitForLoadState("networkidle");
  await waitForVisualStability(page);

  const card = page.getByTestId("iq-option-board-mobile").first();
  await expect(card).toBeVisible({ timeout: 30000 });
  await card.scrollIntoViewIfNeeded();
  await waitForVisualStability(page);

  await expect(card).toHaveScreenshot("iq-take-mobile-options-en.png", {
    mask: getStableMasks(page),
    maxDiffPixelRatio: 0.02,
  });
});
