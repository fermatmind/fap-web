import { expect, test } from "@playwright/test";
import { clickLastOptionAndWaitForSubmitAndUrl } from "./helpers/quiz-flow";
import reportReadyMbtiFreeFixture from "../fixtures/report_ready.mbti.free.json";

function createMbtiReportFixture() {
  return structuredClone(reportReadyMbtiFreeFixture) as Record<string, unknown>;
}

test("MBTI smoke: questions -> submit -> result remains stable", async ({ page }) => {
  const attemptId = "mbti-attempt-0001";
  const questions = Array.from({ length: 8 }, (_, idx) => ({
    question_id: String(idx + 1),
    order: idx + 1,
    text: `MBTI question ${idx + 1}`,
    options: [
      { code: "A", text: "Strongly prefer A" },
      { code: "B", text: "Prefer A" },
      { code: "C", text: "Prefer B" },
      { code: "D", text: "Strongly prefer B" },
    ],
  }));

  await page.route("**/api/track", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.route("**/api/v0.3/auth/guest", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        fm_token: "fm_e2e_mbti_guest_token_0001",
      }),
    });
  });

  await page.route("**/api/v0.3/scales/MBTI/questions*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        scale_code: "MBTI",
        questions: {
          items: questions,
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

  await page.route("**/api/v0.3/attempts/submit", async (route) => {
    const body = route.request().postDataJSON() as {
      answers?: Array<{ question_id?: string; code?: string }>;
    };
    expect(Array.isArray(body.answers)).toBeTruthy();
    expect(body.answers?.length).toBe(8);

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
      body: JSON.stringify(createMbtiReportFixture()),
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

  await page.goto("/en/tests/mbti-personality-test-16-personality-types/take");
  await expect(page.getByRole("heading", { name: "MBTI question 1" })).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(/Estimated time:\s*15 min/)).toBeVisible();
  await expect(page.getByText("No right or wrong answers. Choose the option that fits you best.")).toBeVisible();
  await expect(page.getByRole("radio")).toHaveCount(4);

  for (let i = 0; i < 7; i += 1) {
    await page.getByRole("radio").first().click();
    await expect(page.getByText(`Question ${i + 2} / 8`)).toBeVisible();
  }

  const submitResponse = await clickLastOptionAndWaitForSubmitAndUrl({
    page,
    option: page.getByRole("radio").first(),
    targetUrl: new RegExp(`/result/${attemptId}(\\?.*)?$`),
    timeoutMs: 30000,
  });
  expect(submitResponse.status()).toBe(200);
  await expect(page.getByTestId("mbti-result-shell")).toBeVisible();
  await expect(page.getByTestId("mbti-hero")).toBeVisible();
  await expect(page.getByTestId("mbti-sticky-rail")).toBeVisible();
  await expect(page.getByTestId("mbti-offer-comparison")).toBeVisible();
  await expect(page.getByTestId("mbti-hero").getByRole("heading", { name: /ENFP-T/ })).toBeVisible();

  const heroBounds = await page.getByTestId("mbti-hero").boundingBox();
  expect(heroBounds?.width ?? 0).toBeGreaterThan(700);

  await page.getByTestId("mbti-sticky-rail").getByRole("link", { name: "Career" }).click();
  await expect(page).toHaveURL(new RegExp(`#career$`));
  await expect(page.getByTestId("mbti-chapter-career")).toBeVisible();
});

test("MBTI mobile immersive mode keeps touch targets and auto submits", async ({ page }) => {
  const attemptId = "mbti-mobile-sticky-0001";
  const options = Array.from({ length: 12 }, (_, idx) => ({
    code: `O${idx + 1}`,
    text: `Option ${idx + 1}`,
  }));

  await page.route("**/api/track", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.route("**/api/v0.3/auth/guest", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        fm_token: "fm_e2e_mbti_guest_token_0002",
      }),
    });
  });

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
              text: "MBTI sticky question",
              options,
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
        report: {
          scale_code: "MBTI",
          sections: [
            {
              key: "summary",
              title: "Summary",
              access_level: "free",
              blocks: [{ kind: "paragraph", title: "Summary", body: "mobile summary" }],
            },
          ],
        },
      }),
    });
  });

  const viewports = [
    { width: 375, height: 812 },
    { width: 320, height: 568 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto("/en/tests/mbti-personality-test-16-personality-types/take");

    await expect(page.getByRole("heading", { name: "MBTI sticky question" })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Estimated time:\s*15 min/)).toBeVisible();
    await expect(page.getByText("No right or wrong answers. Choose the option that fits you best.")).toBeVisible();
    const firstOption = page.getByRole("radio").first();
    const bounds = await firstOption.boundingBox();
    expect(bounds?.height ?? 0).toBeGreaterThanOrEqual(44);

    const submitResponse = await clickLastOptionAndWaitForSubmitAndUrl({
      page,
      option: firstOption,
      targetUrl: new RegExp(`/result/${attemptId}(\\?.*)?$`),
      timeoutMs: 30000,
    });
    expect(submitResponse.status()).toBe(200);
  }
});

test("MBTI result shell v2 exposes mobile chapter pills and bottom action bar", async ({ page }) => {
  const attemptId = "mbti-result-shell-mobile-0001";

  await page.setViewportSize({ width: 375, height: 812 });

  await page.route("**/api/track", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.route("**/api/v0.3/auth/guest", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        fm_token: "fm_e2e_mbti_guest_token_shell_mobile_0001",
      }),
    });
  });

  await page.route(`**/api/v0.3/attempts/${attemptId}/report*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(createMbtiReportFixture()),
    });
  });

  await page.route("**/api/v0.3/scales/lookup?*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        slug: "mbti-personality-test-16-personality-types",
        capabilities: {
          enabled_in_prod: true,
          paywall_mode: "full",
        },
      }),
    });
  });

  await page.goto(`/zh/result/${attemptId}`);

  const mobileChrome = page.getByTestId("mbti-mobile-chrome");

  await expect(page.getByTestId("mbti-result-shell")).toBeVisible();
  await expect(mobileChrome).toBeVisible();
  await expect(mobileChrome.getByRole("button", { name: "分享" })).toBeVisible();
  await expect(mobileChrome.getByRole("link", { name: "重测" })).toBeVisible();
  await expect(mobileChrome.getByRole("link", { name: "解锁方案" })).toBeVisible();
  await expect(mobileChrome.getByRole("link", { name: "职业" })).toBeVisible();

  await mobileChrome.getByRole("link", { name: "关系" }).click();
  await expect(page).toHaveURL(new RegExp(`#relationships$`));
  await expect(page.getByTestId("mbti-chapter-relationships")).toBeVisible();
});
