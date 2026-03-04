import { expect, test, type Page } from "@playwright/test";
import { clickLastOptionAndWaitForSubmitAndUrl } from "./helpers/quiz-flow";

async function mockTrack(page: Page) {
  await page.route("**/api/track", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });
}

async function mockScaleLookup(page: Page) {
  await page.route("**/api/v0.3/scales/lookup?*", async (route) => {
    const url = new URL(route.request().url());
    const slug = url.searchParams.get("slug") ?? "unknown-scale";

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        slug,
        is_indexable: true,
        capabilities: {
          enabled_in_prod: true,
          commerce_enabled: true,
          paywall_mode: "full",
        },
      }),
    });
  });
}

test("EQ uses option anchors when question options are empty", async ({ page }) => {
  const attemptId = "eq-anchor-flow-001";
  await mockTrack(page);
  await mockScaleLookup(page);

  for (const scaleCode of ["EQ_60", "EQ_EMOTIONAL_INTELLIGENCE"]) {
    await page.route(`**/api/v0.3/scales/${scaleCode}/questions*`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          scale_code: "EQ_60",
          questions: {
            items: [
              {
                question_id: "1",
                order: 1,
                text: "I can identify my emotions clearly.",
                options: [],
              },
            ],
          },
          meta: {
            option_anchors: [
              { code: "A", label: "Strongly Disagree" },
              { code: "B", label: "Disagree" },
              { code: "C", label: "Neutral" },
              { code: "D", label: "Agree" },
              { code: "E", label: "Strongly Agree" },
            ],
          },
        }),
      });
    });
  }

  await page.route("**/api/v0.3/attempts/start", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        attempt_id: attemptId,
        scale_code: "EQ_60",
      }),
    });
  });

  await page.route("**/api/v0.3/attempts/submit", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        attempt_id: attemptId,
      }),
    });
  });

  await page.route(`**/api/v0.3/attempts/${attemptId}/report*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        locked: false,
        variant: "full",
        summary: "EQ report summary",
        report: {
          scale_code: "EQ_60",
          sections: [],
        },
      }),
    });
  });

  await page.goto("/en/tests/eq-test-emotional-intelligence-assessment/take");
  await expect(page.getByRole("radio", { name: "Strongly Disagree" })).toBeVisible();

  const submitResponse = await clickLastOptionAndWaitForSubmitAndUrl({
    page,
    option: page.getByRole("radio", { name: "Strongly Disagree" }),
    targetUrl: new RegExp(`/en/result/${attemptId}`),
    timeoutMs: 30000,
  });
  expect(submitResponse.status()).toBe(200);
  await expect(page.getByText("EQ report summary")).toBeVisible();
});

test("IQ renders stem prompt/svg and submits with visual options", async ({ page }) => {
  const attemptId = "iq-stem-flow-001";
  let submitCalls = 0;
  await mockTrack(page);
  await mockScaleLookup(page);

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
                    paths: [{ d: "M 5 5 L 115 5 L 115 75 L 5 75 Z", fill: "#f8fafc" }],
                  },
                },
                options: [
                  {
                    code: "A",
                    svg: {
                      view_box: "0 0 20 20",
                      paths: [{ d: "M 2 2 L 18 2 L 18 18 L 2 18 Z", fill: "#0f172a" }],
                    },
                  },
                  {
                    code: "B",
                    svg: {
                      view_box: "0 0 20 20",
                      paths: [{ d: "M 2 10 L 18 10", stroke: "#0f172a", stroke_width: 2 }],
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

  await page.route("**/api/v0.3/attempts/start", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        attempt_id: attemptId,
        scale_code: "IQ_RAVEN",
      }),
    });
  });

  await page.route("**/api/v0.3/attempts/submit", async (route) => {
    submitCalls += 1;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        attempt_id: attemptId,
      }),
    });
  });

  await page.route(`**/api/v0.3/attempts/${attemptId}/report*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        locked: false,
        variant: "full",
        summary: "IQ report summary",
        report: {
          scale_code: "IQ_RAVEN",
          sections: [],
        },
      }),
    });
  });

  await page.goto("/en/tests/iq-test-intelligence-quotient-assessment/take");
  await expect(page.getByRole("heading", { name: "Which option fits?" })).toBeVisible();
  await expect(page.getByTestId("iq-stem-svg").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Submit answers" })).toBeDisabled();

  await page.getByRole("radio", { name: "Option A" }).first().click();
  await expect(page.getByRole("button", { name: "Submit answers" })).toBeEnabled();
  await page.waitForTimeout(400);
  expect(submitCalls).toBe(0);
  await expect(page).toHaveURL(/\/en\/tests\/iq-test-intelligence-quotient-assessment\/take/);

  const submitResponsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      response.url().includes("/api/v0.3/attempts/submit"),
    { timeout: 30000 }
  );

  await page.getByRole("button", { name: "Submit answers" }).click();
  const submitResponse = await submitResponsePromise;
  await expect(page).toHaveURL(new RegExp(`/en/result/${attemptId}`), { timeout: 30000 });
  expect(submitCalls).toBe(1);
  expect(submitResponse.status()).toBe(200);
  await expect(page.getByText("IQ report summary")).toBeVisible();
});

test("result page falls back to attempts/{id}/result when report is unavailable", async ({ page }) => {
  const attemptId = "result-fallback-001";
  await mockTrack(page);
  await mockScaleLookup(page);
  await page.route("**/api/v0.3/auth/guest", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        fm_token: "fm_result_fallback_token_123456",
      }),
    });
  });

  let reportCalls = 0;
  await page.route(`**/api/v0.3/attempts/${attemptId}/report*`, async (route) => {
    reportCalls += 1;
    await route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({
        ok: false,
        error_code: "RESOURCE_NOT_FOUND",
        message: "Report snapshot missing",
      }),
    });
  });

  let resultCalls = 0;
  await page.route(`**/api/v0.3/attempts/${attemptId}/result*`, async (route) => {
    resultCalls += 1;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        result: {
          type_code: "EQ_HIGH",
          summary: "Fallback summary available.",
          dimensions: [{ code: "self_awareness", score: 0.82 }],
        },
        meta: {
          scale_code: "EQ_60",
        },
      }),
    });
  });

  await page.goto(`/en/result/${attemptId}`);
  await expect.poll(() => reportCalls).toBeGreaterThan(0);
  await expect.poll(() => resultCalls).toBeGreaterThan(0);
  await expect(page.getByText("Fallback summary available.")).toBeVisible();
});

test("quiz submit retries once after 401 with bootstrap token precheck", async ({ page }) => {
  const attemptId = "quiz-auth-retry-001";
  await mockTrack(page);
  await mockScaleLookup(page);

  await page.route("**/api/v0.3/scales/MBTI/questions*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        scale_code: "MBTI",
        questions: {
          items: [
            {
              question_id: "1",
              order: 1,
              text: "MBTI retry question",
              options: [
                { code: "A", text: "Strongly disagree" },
                { code: "B", text: "Disagree" },
                { code: "C", text: "Neutral" },
                { code: "D", text: "Agree" },
                { code: "E", text: "Strongly agree" },
              ],
            },
          ],
        },
      }),
    });
  });

  await page.route("**/api/v0.3/attempts/start", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        attempt_id: attemptId,
        scale_code: "MBTI",
      }),
    });
  });

  let submitCalls = 0;
  await page.route("**/api/v0.3/attempts/submit", async (route) => {
    submitCalls += 1;
    if (submitCalls === 1) {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          ok: false,
          error_code: "UNAUTHENTICATED",
          message: "Missing or invalid fm_token.",
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        attempt_id: attemptId,
      }),
    });
  });

  let guestTokenCalls = 0;
  await page.route("**/api/v0.3/auth/guest", async (route) => {
    guestTokenCalls += 1;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        fm_token: "fm_guest_retry_token_123456",
      }),
    });
  });

  await page.route(`**/api/v0.3/attempts/${attemptId}/report*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        locked: false,
        variant: "full",
        summary: "Retry submit report ready.",
        report: {
          scale_code: "MBTI",
          sections: [],
        },
      }),
    });
  });

  await page.goto("/en/tests/mbti-personality-test-16-personality-types/take");
  await page.getByRole("radio", { name: "Strongly disagree" }).click();
  await expect(page).toHaveURL(new RegExp(`/en/result/${attemptId}`), { timeout: 30000 });
  await expect(page.getByText("Retry submit report ready.")).toBeVisible();
  expect(submitCalls).toBe(2);
  expect(guestTokenCalls).toBe(2);
});

test("clinical questions request retries once after 401 with bootstrap token precheck", async ({ page }) => {
  await mockTrack(page);
  await mockScaleLookup(page);

  let questionCalls = 0;
  await page.route("**/api/v0.3/scales/SDS_20/questions*", async (route) => {
    questionCalls += 1;
    if (questionCalls === 1) {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          ok: false,
          error_code: "UNAUTHENTICATED",
          message: "Missing or invalid fm_token.",
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        scale_code: "SDS_20",
        questions: {
          items: [
            {
              question_id: "1",
              order: 1,
              text: "I feel down-hearted and blue.",
              direction: 1,
            },
          ],
        },
        options: {
          format: ["Rarely", "Sometimes", "Often", "Always"],
        },
        meta: {
          consent: {
            required: true,
            version: "SDS20_CONSENT_v1",
            text: "Please review and accept informed consent.",
          },
        },
      }),
    });
  });

  let guestTokenCalls = 0;
  await page.route("**/api/v0.3/auth/guest", async (route) => {
    guestTokenCalls += 1;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        fm_token: "fm_clinical_retry_token_123456",
      }),
    });
  });

  await page.goto("/en/tests/depression-screening-test-standard-edition/take");
  await expect(page.getByText("Please review and accept informed consent.")).toBeVisible();
  expect(questionCalls).toBe(2);
  expect(guestTokenCalls).toBe(2);
});
