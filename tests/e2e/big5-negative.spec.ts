import { expect, test, type Page } from "@playwright/test";

function buildQuestions(count: number) {
  return Array.from({ length: count }, (_, idx) => ({
    question_id: String(idx + 1),
    order: idx + 1,
    text: `Question ${idx + 1}`,
    options: [
      { code: "1", text: "Strongly disagree" },
      { code: "2", text: "Disagree" },
      { code: "3", text: "Neutral" },
      { code: "4", text: "Agree" },
      { code: "5", text: "Strongly agree" },
    ],
  }));
}

async function mockTrack(page: Page) {
  await page.route("**/api/track", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });
}

async function mockLookup(
  page: Page,
  payload: {
    enabledInProd?: boolean;
    paywallMode?: "off" | "free_only" | "full";
  } = {}
) {
  const enabledInProd = payload.enabledInProd ?? true;
  const paywallMode = payload.paywallMode ?? "full";

  await page.route("**/api/v0.3/scales/lookup?*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        slug: "big-five-personality-test",
        scale_code: "BIG5_OCEAN",
        capabilities: {
          enabled_in_prod: enabledInProd,
          paywall_mode: paywallMode,
        },
      }),
    });
  });
}

async function mockQuestions(page: Page, count: number) {
  await page.route("**/api/v0.3/scales/BIG5_OCEAN/questions*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        scale_code: "BIG5_OCEAN",
        pack_id: "BIG5_OCEAN",
        dir_version: "v1",
        content_package_version: "v1",
        questions: {
          schema: "fap.questions.v1",
          items: buildQuestions(count),
        },
        meta: {
          disclaimer_version: "BIG5_OCEAN_v1",
          disclaimer_hash: "hash_v1",
          disclaimer_text: "This test is for self-discovery only.",
          manifest_hash: "manifest_v1",
          norms_version: "2026Q1",
          quality_level: "A",
        },
      }),
    });
  });
}

test("BIG5 /take redirects to landing maintenance when rollout is off", async ({ page }) => {
  await mockTrack(page);
  await mockLookup(page, { enabledInProd: false, paywallMode: "off" });
  await mockQuestions(page, 5);

  await page.goto("/en/tests/big-five-personality-test/take");

  await page.waitForURL(/\/en\/tests\/big-five-personality-test\?maintenance=1/);
  await expect(page.getByText("Maintenance mode")).toBeVisible();
});

test("BIG5 free_only hides unlock CTA in locked result", async ({ page }) => {
  const attemptId = "22222222-2222-2222-2222-222222222222";

  await mockTrack(page);
  await mockLookup(page, { paywallMode: "free_only" });

  await page.route(`**/api/v0.3/attempts/${attemptId}/report`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        locked: true,
        variant: "free",
        norms: { status: "CALIBRATED", norms_version: "2026Q1" },
        quality: { level: "B" },
        offers: [
          {
            sku: "BIG5_FULL",
            formatted_price: "$9.99",
            currency: "USD",
            amount_cents: 999,
            order_no: "ord_free_only",
          },
        ],
        report: {
          sections: [
            {
              key: "summary",
              title: "Summary",
              access_level: "free",
              blocks: [{ kind: "paragraph", title: "Summary", body: "Preview summary" }],
            },
          ],
        },
      }),
    });
  });

  await page.goto(`/en/result/${attemptId}`);

  await expect(page.getByText("Only free report is available right now.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Unlock now" })).toHaveCount(0);
});

test("BIG5 submit with missing answers jumps to first unanswered question", async ({ page }) => {
  const attemptId = "33333333-3333-3333-3333-333333333333";
  let submitCalls = 0;

  await mockTrack(page);
  await mockLookup(page, { paywallMode: "full" });
  await mockQuestions(page, 5);

  await page.route("**/api/v0.3/attempts/start", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        attempt_id: attemptId,
        resume_token: "resume_token",
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

  await page.goto("/en/tests/big-five-personality-test/take");
  await page.getByLabel("I have read and agree to the disclaimer.").check();
  await page.getByRole("button", { name: "Agree and start" }).click();

  await expect(page.getByText("Question 1 / 5")).toBeVisible();
  await page.getByRole("radio").first().click();
  await page.getByRole("button", { name: "Submit" }).click();

  await expect(page.getByText("Please answer question 2 before submitting.")).toBeVisible();
  await expect(page.getByText("Question 2 / 5")).toBeVisible();
  expect(submitCalls).toBe(0);
});

test("BIG5 429 start error shows countdown and disables actions", async ({ page }) => {
  await mockTrack(page);
  await mockLookup(page, { paywallMode: "full" });
  await mockQuestions(page, 5);

  await page.route("**/api/v0.3/attempts/start", async (route) => {
    await route.fulfill({
      status: 429,
      contentType: "application/json",
      body: JSON.stringify({
        error_code: "RATE_LIMITED",
        message: "Please wait before retrying.",
        details: {
          retry_after_seconds: 3,
        },
      }),
    });
  });

  await page.goto("/en/tests/big-five-personality-test/take");
  await page.getByLabel("I have read and agree to the disclaimer.").check();
  await page.getByRole("button", { name: "Agree and start" }).click();

  await expect(page.getByText("Please wait 3 seconds before retrying.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Agree and start" })).toBeDisabled();

  await page.waitForTimeout(1200);
  await expect(page.getByText(/Please wait [12] seconds before retrying\./)).toBeVisible();
});

test("BIG5 submit 5xx keeps draft after refresh", async ({ page }) => {
  const attemptId = "44444444-4444-4444-4444-444444444444";

  await mockTrack(page);
  await mockLookup(page, { paywallMode: "full" });
  await mockQuestions(page, 3);

  await page.route("**/api/v0.3/attempts/start", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        attempt_id: attemptId,
        resume_token: "resume_token",
      }),
    });
  });

  await page.route("**/api/v0.3/attempts/submit", async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({
        error_code: "INTERNAL_ERROR",
        message: "server down",
      }),
    });
  });

  await page.goto("/en/tests/big-five-personality-test/take");
  await page.getByLabel("I have read and agree to the disclaimer.").check();
  await page.getByRole("button", { name: "Agree and start" }).click();

  await expect(page.getByText("Question 1 / 3")).toBeVisible();

  for (let i = 0; i < 3; i += 1) {
    await page.getByRole("radio").first().click();
    if (i < 2) {
      await page.getByRole("button", { name: "Next", exact: true }).click();
    }
  }

  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByText("Service is temporarily unavailable. Your draft is saved. Please retry later.")).toBeVisible();

  await page.reload();

  await expect(page.getByText("Question 3 / 3")).toBeVisible();
  await expect(page.locator('[role="radio"][aria-checked="true"]')).toHaveCount(1);
});

test("BIG5 report handles norms missing and unknown block safely", async ({ page }) => {
  const attemptId = "55555555-5555-5555-5555-555555555555";

  await mockTrack(page);
  await mockLookup(page, { paywallMode: "full" });

  await page.route(`**/api/v0.3/attempts/${attemptId}/report`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        locked: false,
        variant: "full",
        norms: { status: "MISSING", norms_version: "2026Q1" },
        quality: { level: "C" },
        report: {
          sections: [
            {
              key: "domains_overview",
              title: "Domains",
              access_level: "free",
              blocks: [{ kind: "chart", metric_code: "O", title: "Openness", body: "Openness percentile 62" }],
            },
            {
              key: "future_block",
              title: "Future",
              access_level: "free",
              blocks: [{ kind: "future_widget", title: "Future block", body: "new payload" }],
            },
          ],
        },
      }),
    });
  });

  await page.goto(`/en/result/${attemptId}`);

  await expect(
    page.getByText("Percentile views are temporarily unavailable because current norms status is MISSING.")
  ).toBeVisible();
  await expect(page.getByText("Unsupported block")).toBeVisible();
  await expect(page.locator("text=NaN")).toHaveCount(0);
});

test("BIG5 compare shows N/A and not comparable when one side is missing", async ({ page }) => {
  const currentAttemptId = "compare_current";
  const previousAttemptId = "compare_previous";

  await mockTrack(page);

  await page.route(`**/api/v0.3/attempts/${currentAttemptId}/report`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        report: {
          sections: [
            {
              key: "domains_overview",
              blocks: [{ kind: "chart", metric_code: "O", title: "Openness", body: "Openness percentile 62" }],
            },
            {
              key: "facet_table",
              blocks: [{ kind: "table_row", metric_code: "O1", title: "O1", body: "O1 percentile 60" }],
            },
          ],
        },
      }),
    });
  });

  await page.route(`**/api/v0.3/attempts/${previousAttemptId}/report`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        report: {
          sections: [
            {
              key: "domains_overview",
              blocks: [{ kind: "chart", metric_code: "C", title: "Conscientiousness", body: "Conscientiousness percentile 55" }],
            },
            {
              key: "facet_table",
              blocks: [{ kind: "table_row", metric_code: "C1", title: "C1", body: "C1 percentile 52" }],
            },
          ],
        },
      }),
    });
  });

  await page.goto(`/en/history/big5/compare?current=${currentAttemptId}&previous=${previousAttemptId}`);

  await expect(page.getByText("Not comparable").first()).toBeVisible();
  await expect(page.getByText("Now N/A").first()).toBeVisible();
  await expect(page.getByText("Prev 0")).toHaveCount(0);
});
