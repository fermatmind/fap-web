import { expect, test, type Page } from "@playwright/test";
import { clickLastOptionAndWaitForSubmitAndUrl } from "./helpers/quiz-flow";
import highEmpathyEqFixture from "../fixtures/eq/v5/eq60_v5_high_empathy_low_recovery_en.json";

type EqV5Fixture = {
  report_access: {
    payload?: Record<string, unknown>;
  };
  report: Record<string, unknown>;
};

async function mockTrack(page: Page) {
  await page.route("**/api/track", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });
}

async function mockGuestToken(page: Page, token = "fm_e2e_guest_token_123456") {
  await page.route("**/api/v0.3/auth/guest", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        fm_token: token,
      }),
    });
  });
}

async function mockAttemptLinkAnon(page: Page) {
  await page.route("**/api/v0.3/me/attempts/link-anon", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        linked_attempt_ids: [],
        skipped_attempt_ids: [],
      }),
    });
  });
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function reportRoutePattern(attemptId: string): RegExp {
  return new RegExp(`/api/v0\\.3/attempts/${escapeRegExp(attemptId)}/report(?:\\?.*)?$`);
}

function reportAccessRoutePattern(attemptId: string): RegExp {
  return new RegExp(`/api/v0\\.3/attempts/${escapeRegExp(attemptId)}/report-access(?:\\?.*)?$`);
}

async function mockReadyReportAccess(page: Page, attemptId: string) {
  await page.route(reportAccessRoutePattern(attemptId), async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        attempt_id: attemptId,
        access_state: "ready",
        report_state: "ready",
        pdf_state: "unavailable",
        locked: false,
        variant: "full",
        access_level: "full",
        upgrade_sku: null,
        offers: [],
        modules_allowed: ["eq_core", "eq_full", "eq_cross_insights", "eq_growth_plan"],
        modules_preview: [],
        actions: {
          page_href: `/en/result/${attemptId}`,
          pdf_href: null,
          wait_href: null,
          history_href: null,
          lookup_href: null,
        },
      }),
    });
  });
}

async function mockEqV5ReportAccess(page: Page, attemptId: string, fixture: EqV5Fixture) {
  const payload = fixture.report_access.payload ?? {};

  await page.route(reportAccessRoutePattern(attemptId), async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        attempt_id: attemptId,
        access_state: "ready",
        report_state: "ready",
        pdf_state: "unavailable",
        ...payload,
        actions: {
          page_href: `/en/result/${attemptId}`,
          pdf_href: null,
          wait_href: null,
          history_href: null,
          lookup_href: null,
        },
      }),
    });
  });
}

function eqV5ReportResponse(fixture: EqV5Fixture) {
  const payload = fixture.report_access.payload ?? {};

  return {
    ok: true,
    locked: false,
    variant: payload.variant ?? "full",
    access_level: payload.access_level ?? "full",
    upgrade_sku: null,
    upgrade_sku_effective: null,
    offers: [],
    modules_allowed: payload.modules_allowed ?? ["eq_core", "eq_full", "eq_cross_insights", "eq_growth_plan"],
    modules_preview: payload.modules_preview ?? [],
    view_policy: payload.view_policy,
    report: fixture.report,
    scale_code: "EQ_60",
  };
}

async function mockInviteUnlockProgress(page: Page, attemptId: string) {
  await page.route(new RegExp(`/api/v0\\.3/attempts/${escapeRegExp(attemptId)}/invite-unlocks(?:\\?.*)?$`), async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        unlock_stage: null,
        unlock_source: null,
        completed_invitees: 0,
        required_invitees: 2,
        progress_percent: null,
      }),
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
  await mockGuestToken(page, "fm_eq_anchor_token_123456");
  await mockAttemptLinkAnon(page);
  await mockScaleLookup(page);
  await mockEqV5ReportAccess(page, attemptId, highEmpathyEqFixture as EqV5Fixture);

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

  await page.route(reportRoutePattern(attemptId), async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(eqV5ReportResponse(highEmpathyEqFixture as EqV5Fixture)),
    });
  });

  await page.goto("/en/tests/eq-test-emotional-intelligence-assessment/take?force_new_attempt=1");
  await expect(page.getByRole("radio", { name: "Strongly Disagree" })).toBeVisible();
  await page.waitForTimeout(250);

  await page.getByRole("radio", { name: "Strongly Agree" }).click();
  await expect(page.getByRole("radio", { name: "Strongly Agree" })).toHaveAttribute("aria-checked", "true");
  await page.goto(`/en/result/${attemptId}`);
  await expect(page.getByTestId("eq-result-v5")).toBeVisible();
  await expect(page.getByRole("heading", { name: "High Empathy, Low Recovery" })).toBeVisible();
  await expect(page.getByText("Evidence Snapshot")).toBeVisible();
  await expect(page.getByText("Selected by backend route matrix")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Interpretation Confidence" })).toBeVisible();
  await expect(page.getByText("Emotional Matrix")).toBeVisible();
  await expect(page.getByText("Empathy Boundary")).toBeVisible();
  await expect(page.getByText("A 16-item scenario module is planned")).toBeVisible();
  await expect(page.getByText("Planned, not available yet")).toBeVisible();
  await expect(page.getByText("Scientific Boundary")).toBeVisible();
  await expect(page.getByText(/Unlock|Purchase|SKU_EQ_60_FULL_299|EQ_60_FULL|locked|blur_others|paywall/i)).toHaveCount(0);
  await expect(page.getByText(/profile:|quality_level:|focus:|bucket:/i)).toHaveCount(0);
  await expect(page.getByText(/high_empathy_low_recovery|EM_ER_high_low|emotional_labor_high|eq60\.signal_signature\.v1/i)).toHaveCount(0);
});

test("IQ renders stem prompt/svg and submits with visual options", async ({ page }) => {
  const attemptId = "iq-stem-flow-001";
  let submitCalls = 0;
  await mockTrack(page);
  await mockGuestToken(page, "fm_iq_stem_token_123456");
  await mockAttemptLinkAnon(page);
  await mockScaleLookup(page);
  await mockReadyReportAccess(page, attemptId);

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

  await page.route(reportRoutePattern(attemptId), async (route) => {
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
  await expect(page.getByRole("heading", { name: /Which option fits\?|哪个选项适合？/ })).toBeVisible();
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
  await mockAttemptLinkAnon(page);
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
  await mockReadyReportAccess(page, attemptId);

  await page.route(reportRoutePattern(attemptId), async (route) => {
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

test("result page keeps generating state isolated even when offers are already available", async ({ page }) => {
  const attemptId = "result-generating-offer-001";
  await mockTrack(page);
  await mockScaleLookup(page);
  await mockAttemptLinkAnon(page);
  await page.route("**/api/v0.3/auth/guest", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        fm_token: "fm_generating_offer_token_123456",
      }),
    });
  });

  await page.route(reportAccessRoutePattern(attemptId), async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        attempt_id: attemptId,
        access_state: "ready",
        report_state: "pending",
        pdf_state: "unavailable",
        locked: true,
        generating: true,
        retry_after: 30,
        variant: "free",
        quality: { level: "B" },
        offers: [
          {
            sku: "IQ_FULL",
            title: "IQ Full",
            amount_cents: 1299,
            currency: "USD",
            formatted_price: "$12.99",
            order_no: "ord_iq_001",
          },
        ],
        report: {
          scale_code: "IQ_RAVEN",
          sections: [
            {
              key: "summary",
              title: "Summary",
              access_level: "free",
              blocks: [{ kind: "paragraph", body: "Generating..." }],
            },
          ],
        },
      }),
    });
  });

  await page.goto(`/en/result/${attemptId}`);
  await expect(page.getByText("Report is still generating. Refresh in a few seconds.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Unlock now" })).toHaveCount(0);
});

test("quiz submit retries once after 401 with bootstrap token precheck", async ({ page }) => {
  const attemptId = "quiz-auth-retry-001";
  await mockTrack(page);
  await mockScaleLookup(page);
  await mockAttemptLinkAnon(page);
  await mockReadyReportAccess(page, attemptId);
  await mockInviteUnlockProgress(page, attemptId);

  await page.route("**/api/v0.3/scales/MBTI/questions*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        scale_code: "MBTI",
        questions: {
          items: Array.from({ length: 11 }, (_, index) => ({
            question_id: String(index + 1),
            order: index + 1,
            text: `MBTI retry question ${index + 1}`,
            options: [
              { code: "A", text: "Strongly disagree" },
              { code: "B", text: "Disagree" },
              { code: "C", text: "Neutral" },
              { code: "D", text: "Agree" },
              { code: "E", text: "Strongly agree" },
            ],
          })),
        },
      }),
    });
  });

  let startCalls = 0;
  await page.route("**/api/v0.3/attempts/start", async (route) => {
    startCalls += 1;
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

  await page.route(reportRoutePattern(attemptId), async (route) => {
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

  await page.goto("/en/tests/mbti-personality-test-16-personality-types/take?force_new_attempt=1");
  await expect(page.getByRole("radio", { name: "Strongly agree" })).toBeVisible();
  await page.waitForTimeout(250);

  for (let index = 1; index <= 10; index += 1) {
    await expect(page.getByRole("heading", { name: `MBTI retry question ${index}` })).toBeVisible();
    await page.getByRole("radio", { name: "Strongly agree" }).click();
    if (index === 1) {
      await expect.poll(() => startCalls).toBeGreaterThan(0);
    }
    await page.waitForTimeout(320);
  }

  await expect(page.getByRole("heading", { name: "MBTI retry question 11" })).toBeVisible();
  await clickLastOptionAndWaitForSubmitAndUrl({
    page,
    option: page.getByRole("radio", { name: "Strongly agree" }),
    targetUrl: new RegExp(`/en/result/${attemptId}`),
    timeoutMs: 30000,
  });
  await expect(page).toHaveURL(new RegExp(`/en/result/${attemptId}`), { timeout: 30000 });
  await expect(page.getByRole("heading", { name: "Full report unlocked" })).toBeVisible();
  expect(submitCalls).toBe(2);
  expect(guestTokenCalls).toBeGreaterThanOrEqual(2);
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
