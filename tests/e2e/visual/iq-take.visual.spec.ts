import { expect, test, type Page } from "@playwright/test";
import { getStableMasks, prepareVisualPage, waitForVisualStability } from "./visual-helpers";

function mockIqSvgImage(label: string) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="840" height="552" viewBox="0 0 840 552">
      <rect width="840" height="552" fill="#fff"/>
      <rect x="40" y="40" width="760" height="472" fill="#f8fafc" stroke="#111827" stroke-width="6"/>
      <text x="420" y="292" text-anchor="middle" font-family="Arial, sans-serif" font-size="64" fill="#111827">${label}</text>
    </svg>
  `.trim();
}

async function mockIqTake(page: Page) {
  await page.route("**/mock-assets/iq/*.svg", async (route) => {
    const url = new URL(route.request().url());
    const filename = url.pathname.split("/").pop()?.replace(".svg", "") ?? "asset";

    await route.fulfill({
      status: 200,
      contentType: "image/svg+xml",
      body: mockIqSvgImage(filename.toUpperCase()),
    });
  });

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
                  type: "image",
                  media_type: "image/svg+xml",
                  assets: {
                    image: "/mock-assets/iq/q1-question.svg",
                  },
                  width: 840,
                  height: 552,
                  accessibility_label: "Owner original prompt 01",
                },
                options: [
                  {
                    code: "A",
                    type: "image",
                    assets: {
                      image: "/mock-assets/iq/q1-option-a.svg",
                    },
                    width: 296,
                    height: 168,
                    accessibility_label: "Option A for owner-original IQ item 01.",
                  },
                  {
                    code: "B",
                    type: "image",
                    assets: {
                      image: "/mock-assets/iq/q1-option-b.svg",
                    },
                    width: 296,
                    height: 168,
                    accessibility_label: "Option B for owner-original IQ item 01.",
                  },
                  {
                    code: "C",
                    type: "image",
                    assets: {
                      image: "/mock-assets/iq/q1-option-c.svg",
                    },
                    width: 296,
                    height: 168,
                    accessibility_label: "Option C for owner-original IQ item 01.",
                  },
                  {
                    code: "D",
                    type: "image",
                    assets: {
                      image: "/mock-assets/iq/q1-option-d.svg",
                    },
                    width: 296,
                    height: 168,
                    accessibility_label: "Option D for owner-original IQ item 01.",
                  },
                  {
                    code: "E",
                    type: "image",
                    assets: {
                      image: "/mock-assets/iq/q1-option-e.svg",
                    },
                    width: 296,
                    height: 168,
                    accessibility_label: "Option E for owner-original IQ item 01.",
                  },
                  {
                    code: "F",
                    type: "image",
                    assets: {
                      image: "/mock-assets/iq/q1-option-f.svg",
                    },
                    width: 296,
                    height: 168,
                    accessibility_label: "Option F for owner-original IQ item 01.",
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
        scale_code: "IQ_INTELLIGENCE_QUOTIENT",
        form_code: "IQ_OWNER_ORIGINAL_30",
        question_count: 30,
      }),
    });
  });

  await page.route("**/api/v0.3/attempts/iq-visual-attempt-001/questions?*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        schema_version: "fm.iq.question_delivery.v1",
        attempt_id: "iq-visual-attempt-001",
        scale_code: "IQ_INTELLIGENCE_QUOTIENT",
        scale_code_legacy: "IQ_RAVEN",
        bank_id: "IQ_OWNER_ORIGINAL_30",
        form_code: "IQ_OWNER_ORIGINAL_30",
        question_count: 30,
        delivery: {
          mode: "current_question",
          index: 0,
          window_size: 1,
          has_previous: false,
          has_next: true,
        },
        questions: {
          schema_version: "fm.iq.owner_image_bank.items.public.v1",
          items: [
            {
              question_id: "MATRIX_Q01",
              order: 1,
              title: "Which option fits?",
              stem: {
                prompt_en: "Which option fits?",
                prompt_zh: "哪个选项适合？",
                type: "image",
                media_type: "image/svg+xml",
                assets: {
                  image: "/mock-assets/iq/q1-question.svg",
                },
                width: 840,
                height: 552,
                accessibility_label: "Owner original prompt 01",
              },
              options: ["A", "B", "C", "D", "E", "F"].map((code) => ({
                code,
                label: code,
                type: "image",
                assets: {
                  image: `/mock-assets/iq/q1-option-${code.toLowerCase()}.svg`,
                },
                width: 296,
                height: 168,
                accessibility_label: `Option ${code} for owner-original IQ item 01.`,
              })),
            },
          ],
        },
        meta: {
          source: "attempt_bound_owner_bank",
          public_payload: true,
        },
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

test("IQ take desktop full page visual baseline", async ({ page }) => {
  await mockIqTake(page);
  await prepareVisualPage(page);
  await page.goto("/en/tests/iq-test-intelligence-quotient-assessment/take?form=IQ_OWNER_ORIGINAL_30");
  await page.waitForLoadState("networkidle");
  await waitForVisualStability(page);

  const card = page.getByTestId("iq-take-question-panel").first();
  await expect(card).toBeVisible({ timeout: 30000 });
  await waitForVisualStability(page);

  await expect(page).toHaveScreenshot("iq-take-desktop-full-page-en.png", {
    fullPage: true,
    mask: getStableMasks(page),
    maxDiffPixelRatio: 0.02,
  });
});

test("IQ take mobile full page visual baseline", async ({ page }) => {
  await mockIqTake(page);
  await prepareVisualPage(page);
  await page.setViewportSize({ width: 390, height: 1100 });
  await page.goto("/en/tests/iq-test-intelligence-quotient-assessment/take?form=IQ_OWNER_ORIGINAL_30");
  await page.waitForLoadState("networkidle");
  await waitForVisualStability(page);

  const card = page.getByTestId("iq-take-question-panel").first();
  await expect(card).toBeVisible({ timeout: 30000 });
  await waitForVisualStability(page);

  await expect(page).toHaveScreenshot("iq-take-mobile-full-page-en.png", {
    fullPage: true,
    mask: getStableMasks(page),
    maxDiffPixelRatio: 0.02,
  });
});
