import { expect, test, type Page } from "@playwright/test";
import { clickLastOptionAndWaitForSubmitAndUrl } from "./helpers/quiz-flow";

const isLiveMode = process.env.UAT_MODE === "live";

function buildBig5Questions(count: number) {
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

async function mockBig5Lookup(page: Page, paywallMode: "off" | "free_only" | "full" = "full") {
  await page.route("**/api/v0.3/scales/lookup?*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        slug: "big-five-personality-test",
        scale_code: "BIG5_OCEAN",
        capabilities: {
          enabled_in_prod: true,
          paywall_mode: paywallMode,
        },
      }),
    });
  });
}

async function mockBig5BaseFlow({
  page,
  attemptId,
  questionCount,
  onSubmitPayload,
}: {
  page: Page;
  attemptId: string;
  questionCount: number;
  onSubmitPayload?: (payload: Record<string, unknown>) => void;
}) {
  await mockTrack(page);
  await mockBig5Lookup(page, "full");

  await page.route("**/api/v0.3/scales/BIG5_OCEAN/questions*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        scale_code: "BIG5_OCEAN",
        questions: {
          items: buildBig5Questions(questionCount),
        },
        meta: {
          disclaimer_version: "BIG5_OCEAN_v1",
          disclaimer_hash: "hash_v1",
          disclaimer_text: "This test is for self-discovery only.",
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
        scale_code: "BIG5_OCEAN",
      }),
    });
  });

  await page.route("**/api/v0.3/attempts/submit", async (route) => {
    const payload = route.request().postDataJSON() as Record<string, unknown>;
    onSubmitPayload?.(payload);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        attempt_id: attemptId,
      }),
    });
  });
}

async function completeBig5Take({
  page,
  questionCount,
  optionIndex,
  targetUrl,
}: {
  page: Page;
  questionCount: number;
  optionIndex: number;
  targetUrl: RegExp;
}) {
  await page.goto("/en/tests/big-five-personality-test/take");
  await page.getByLabel("I have read and agree to the disclaimer.").check();
  await page.getByRole("button", { name: "Agree and start" }).click();

  for (let i = 0; i < questionCount - 1; i += 1) {
    await expect(page.getByText(`Question ${i + 1} / ${questionCount}`)).toBeVisible();
    await page.getByRole("radio").nth(optionIndex).click();
    await expect(page.getByText(`Question ${i + 2} / ${questionCount}`)).toBeVisible();
  }

  const submitResponse = await clickLastOptionAndWaitForSubmitAndUrl({
    page,
    option: page.getByRole("radio").nth(optionIndex),
    targetUrl,
    timeoutMs: 30000,
  });
  expect(submitResponse.status()).toBe(200);
}

test.describe("UAT matrix (mock)", () => {
  test.skip(isLiveMode, "Mock matrix is skipped in live mode.");

  test("role-1 middle option (C) completes", async ({ page }) => {
    const attemptId = "uat-role-c-option";
    await mockBig5BaseFlow({
      page,
      attemptId,
      questionCount: 5,
    });

    await page.route(`**/api/v0.3/attempts/${attemptId}/report*`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          locked: false,
          variant: "full",
          quality: { level: "A" },
          report: {
            scale_code: "BIG5_OCEAN",
            sections: [
              {
                key: "summary",
                title: "Summary",
                access_level: "free",
                blocks: [{ kind: "paragraph", title: "Summary", body: "UAT C-option summary." }],
              },
            ],
          },
        }),
      });
    });

    await completeBig5Take({
      page,
      questionCount: 5,
      optionIndex: 2,
      targetUrl: new RegExp(`/en/result/${attemptId}`),
    });
    await expect(page.getByText("UAT C-option summary.")).toBeVisible();
  });

  test("role-2 speeding payload under 30s", async ({ page }) => {
    const attemptId = "uat-role-speeding";
    let submitDuration = 0;

    await mockBig5BaseFlow({
      page,
      attemptId,
      questionCount: 5,
      onSubmitPayload: (payload) => {
        submitDuration = Number(payload.duration_ms ?? 0);
      },
    });

    await page.route(`**/api/v0.3/attempts/${attemptId}/report*`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          locked: false,
          variant: "full",
          report: {
            scale_code: "BIG5_OCEAN",
            sections: [],
          },
        }),
      });
    });

    await completeBig5Take({
      page,
      questionCount: 5,
      optionIndex: 1,
      targetUrl: new RegExp(`/en/result/${attemptId}`),
    });
    expect(submitDuration).toBeGreaterThan(0);
    expect(submitDuration).toBeLessThan(30000);
  });

  test("role-3 crisis trigger keeps upsell hidden", async ({ page }) => {
    const attemptId = "uat-role-crisis";
    const questions = Array.from({ length: 20 }, (_, idx) => ({
      question_id: String(idx + 1),
      order: idx + 1,
      direction: idx % 2 === 0 ? 1 : -1,
      text: `SDS question ${idx + 1}`,
    }));

    await mockTrack(page);

    await page.route("**/api/v0.3/scales/SDS_20/questions*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          scale_code: "SDS_20",
          questions: { items: questions },
          options: { format: ["Rarely", "Sometimes", "Often", "Always"] },
          meta: {
            consent: {
              required: true,
              version: "SDS20_CONSENT_v1",
              text: "Read and accept this consent before starting.",
            },
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
          scale_code: "SDS_20",
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
          locked: true,
          variant: "free",
          quality: {
            level: "C",
            crisis_alert: true,
          },
          offers: [
            {
              sku: "SDS20_FULL",
              title: "SDS Full",
              price_cents: 999,
              currency: "USD",
            },
          ],
          report: {
            scale_code: "SDS_20",
            sections: [
              {
                key: "crisis_banner",
                title: "Crisis Support",
                access_level: "free",
                blocks: [{ id: "c1", type: "markdown", content: "Seek support now." }],
                resources: [{ title: "988 Lifeline", phone: "988" }],
              },
              {
                key: "paid_deep_dive",
                title: "Paid Deep Dive",
                access_level: "paid",
                blocks: [{ id: "p1", type: "markdown", content: "Paid details" }],
              },
            ],
          },
        }),
      });
    });

    await page.goto("/en/tests/sds-20/take");
    await page.getByLabel("I have read and agree to the statement above").check();
    await page.getByRole("button", { name: "Agree and start" }).click();
    for (let i = 0; i < 19; i += 1) {
      await page.getByRole("radio").first().click();
      await expect(page.getByText(`Question ${i + 2} / 20`)).toBeVisible();
    }

    const submitResponse = await clickLastOptionAndWaitForSubmitAndUrl({
      page,
      option: page.getByRole("radio").first(),
      targetUrl: new RegExp(`/en/attempts/${attemptId}/report`),
      timeoutMs: 30000,
    });
    expect(submitResponse.status()).toBe(200);
    await expect(page.getByRole("button", { name: "Unlock now" })).toHaveCount(0);
    await expect(page.getByTestId("crisis-care-inline")).toBeVisible();
    await expect(page.getByTestId("crisis-care-notice")).toBeVisible();
  });

  test("role-4 paid unlock normal user", async ({ page }) => {
    const attemptId = "uat-role-paid";
    const orderNo = "ord_uat_paid_1";
    let unlocked = false;

    await mockBig5BaseFlow({
      page,
      attemptId,
      questionCount: 5,
    });

    await page.route(`**/api/v0.3/attempts/${attemptId}/report*`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          unlocked
            ? {
                ok: true,
                locked: false,
                variant: "full",
                offers: [],
                report: {
                  scale_code: "BIG5_OCEAN",
                  sections: [
                    {
                      key: "summary",
                      title: "Summary",
                      access_level: "free",
                      blocks: [{ kind: "paragraph", body: "Unlocked summary." }],
                    },
                  ],
                },
              }
            : {
                ok: true,
                locked: true,
                variant: "free",
                offers: [
                  {
                    sku: "BIG5_FULL",
                    formatted_price: "$9.99",
                    amount_cents: 999,
                    currency: "USD",
                    order_no: orderNo,
                  },
                ],
                report: {
                  scale_code: "BIG5_OCEAN",
                  sections: [
                    {
                      key: "summary",
                      title: "Summary",
                      access_level: "free",
                      blocks: [{ kind: "paragraph", body: "Locked summary." }],
                    },
                  ],
                },
              }
        ),
      });
    });

    await page.route("**/api/v0.3/orders/checkout", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          order_no: orderNo,
          attempt_id: attemptId,
          status: "pending",
        }),
      });
    });

    await page.route(`**/api/v0.3/orders/${orderNo}`, async (route) => {
      unlocked = true;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          order_no: orderNo,
          attempt_id: attemptId,
          status: "paid",
          ownership_verified: true,
        }),
      });
    });

    await completeBig5Take({
      page,
      questionCount: 5,
      optionIndex: 2,
      targetUrl: new RegExp(`/en/result/${attemptId}`),
    });
    await page.getByRole("button", { name: "Unlock now" }).click();
    await page.waitForURL(new RegExp(`/en/(orders/${orderNo}|result/${attemptId})`));
    if (page.url().includes(`/en/orders/${orderNo}`)) {
      await page.waitForURL(new RegExp(`/en/result/${attemptId}`));
    }
    await expect(page.getByText("Unlocked summary.")).toBeVisible();
  });

  test("role-5 webhook replay observation follows locked=false only", async ({ page }) => {
    const attemptId = "uat-role-webhook-replay";
    const pendingUnlockStorageKey = `fm_clinical_pending_unlock_v1_${attemptId}`;
    let reportCalls = 0;

    await mockTrack(page);

    await page.addInitScript((storageKey) => {
      window.localStorage.setItem(storageKey, "ord_uat_replay_1");
    }, pendingUnlockStorageKey);

    await page.route(`**/api/v0.3/attempts/${attemptId}/report*`, async (route) => {
      reportCalls += 1;
      const unlocked = reportCalls >= 3;

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          locked: !unlocked,
          variant: unlocked ? "full" : "free",
          quality: {
            level: "B",
            crisis_alert: false,
          },
          offers: [
            {
              sku: "CC68_FULL",
              title: "CC68 Full",
              price_cents: 1299,
              currency: "USD",
            },
          ],
          report: {
            scale_code: "CLINICAL_COMBO_68",
            sections: [
              {
                key: "disclaimer_top",
                title: "Important Disclaimer",
                access_level: "free",
                blocks: [{ id: "d1", type: "markdown", content: "Disclaimer" }],
              },
              {
                key: "paid_deep_dive",
                title: "Paid Deep Dive",
                access_level: "paid",
                blocks: [{ id: "p1", type: "markdown", content: "Deep paid content" }],
              },
            ],
          },
        }),
      });
    });

    await page.goto(`/en/attempts/${attemptId}/report`);

    await expect(page.getByRole("button", { name: "Unlock now" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Unlock now" })).toHaveCount(0, {
      timeout: 20000,
    });
    await expect(page.getByText("Deep paid content")).toBeVisible();

    await page.getByRole("button", { name: "Refresh report" }).click();
    await expect(page.getByRole("button", { name: "Unlock now" })).toHaveCount(0);
    expect(reportCalls).toBeGreaterThanOrEqual(3);
  });
});

test.describe("UAT matrix (live placeholder)", () => {
  test.skip(!isLiveMode, "Live mode only.");

  test("preprod connectivity check", async ({ page }) => {
    await page.goto("/en/tests");
    await expect(page.getByRole("heading", { name: "Tests" })).toBeVisible();
  });
});
