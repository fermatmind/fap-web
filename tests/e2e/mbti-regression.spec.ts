import { expect, test } from "@playwright/test";
import { clickLastOptionAndWaitForSubmitAndUrl } from "./helpers/quiz-flow";
import reportReadyMbtiFreeFixture from "../fixtures/report_ready.mbti.free.json";

function createMbtiReportFixture(
  mutate?: (fixture: Record<string, unknown>) => void
) {
  const fixture = structuredClone(reportReadyMbtiFreeFixture) as Record<string, unknown>;
  mutate?.(fixture);
  return fixture;
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

  await page.addInitScript(() => {
    window.localStorage.setItem(
      "fm_consent_v1",
      JSON.stringify({
        analytics: "granted",
        updatedAt: "2026-03-11T00:00:00.000Z",
      })
    );
  });

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
      body: JSON.stringify(
        createMbtiReportFixture((fixture) => {
          const report = fixture.report as Record<string, unknown>;
          const layers = report.layers as Record<string, unknown>;
          const identity = layers.identity as Record<string, unknown>;
          const cta = fixture.cta as Record<string, unknown>;
          cta.title = "Unified MBTI unlock plan";
          cta.subtitle = "Use one primary commerce surface and keep the rest as mirrors.";
          cta.primary_label = "Unlock the authored MBTI report";
          cta.benefit_bullets = ["Get the authored identity bridge", "Open the curated read list"];
          cta.badge = "Primary";
          identity.title = "Authored overview title";
          identity.subtitle = "Authored overview subtitle";
          identity.one_liner = "Authored overview one-liner";
          identity.bullets = [
            "Judgment cue: you quickly test whether a connection is worth continued effort.",
            "Social style: you energize the room first, then review the emotional detail later.",
          ];
          report.recommended_reads = [
            {
              id: "read-1",
              type: "article",
              title: "Career environment alignment",
              desc: "Read the work-environment cues that match this profile.",
              url: "https://example.com/read-1",
              cta: "Read the career note",
              priority: 10,
              tags: ["career"],
              estimated_minutes: 7,
              status: "published",
              published_at: "2026-03-01T00:00:00Z",
              updated_at: "2026-03-02T00:00:00Z",
              canonical_id: "career-read-1",
              canonical_url: "https://example.com/read-1",
            },
            {
              id: "read-2",
              type: "article",
              title: "Relationship boundary reading",
              desc: "Read the interaction patterns and boundaries next.",
              url: "https://example.com/read-2",
              cta: "Read the relationship note",
              priority: 20,
              tags: ["relationships"],
              estimated_minutes: 5,
              status: "published",
              published_at: "2026-03-03T00:00:00Z",
              updated_at: "2026-03-04T00:00:00Z",
              canonical_id: "relationship-read-1",
              canonical_url: "https://example.com/read-2",
            },
          ];
        })
      ),
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
  await expect(page.getByTestId("mbti-overview-authored-intro")).toContainText("Authored overview title");
  await expect(page.getByTestId("mbti-overview-authored-intro")).toContainText("Authored overview one-liner");
  await expect(page.getByTestId("mbti-recommended-reads")).toBeVisible();
  await expect(page.getByTestId("mbti-offers-primary-cta")).toHaveText("Unlock the authored MBTI report");
  await expect(page.getByTestId("mbti-sticky-rail").getByRole("link", { name: "Unlock the authored MBTI report" })).toBeVisible();

  const heroBounds = await page.getByTestId("mbti-hero").boundingBox();
  expect(heroBounds?.width ?? 0).toBeGreaterThan(700);
  const sectionsAreOrdered = await page.evaluate(() => {
    const relationships = document.querySelector('[data-testid="mbti-chapter-relationships"]');
    const reads = document.querySelector('[data-testid="mbti-recommended-reads"]');
    const offers = document.querySelector('[data-testid="mbti-offer-comparison"]');

    if (!relationships || !reads || !offers) {
      return false;
    }

    return Boolean(
      (relationships.compareDocumentPosition(reads) & Node.DOCUMENT_POSITION_FOLLOWING) &&
        (reads.compareDocumentPosition(offers) & Node.DOCUMENT_POSITION_FOLLOWING)
    );
  });
  expect(sectionsAreOrdered).toBe(true);
  await expect(page.getByRole("link", { name: "Read the career note" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Read the relationship note" })).toBeVisible();

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
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "fm_consent_v1",
      JSON.stringify({
        analytics: "granted",
        updatedAt: "2026-03-11T00:00:00.000Z",
      })
    );
  });

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
      body: JSON.stringify(
        createMbtiReportFixture((fixture) => {
          const cta = fixture.cta as Record<string, unknown>;
          const report = fixture.report as Record<string, unknown>;
          cta.primary_label = "解锁作者化完整版";
          report.recommended_reads = [
            {
              id: "read-mobile",
              type: "article",
              title: "移动端推荐阅读",
              desc: "用于验证推荐阅读 section 与底部 action bar 共存。",
              url: "https://example.com/mobile-read",
              cta: "继续阅读",
              priority: 1,
              tags: ["移动端"],
              estimated_minutes: 4,
              status: "published",
              published_at: "2026-03-01T00:00:00Z",
              updated_at: "2026-03-02T00:00:00Z",
              canonical_id: "mobile-read",
              canonical_url: "https://example.com/mobile-read",
            },
          ];
        })
      ),
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
  await expect(mobileChrome.getByRole("link", { name: "解锁作者化完整版" })).toBeVisible();
  await expect(mobileChrome.getByRole("link", { name: "职业" })).toBeVisible();
  await expect(page.getByTestId("mbti-offers-primary-cta")).toHaveText("解锁作者化完整版");
  await expect(page.getByTestId("mbti-recommended-reads")).toBeVisible();
  await expect(page.getByRole("button", { name: "分享结果" })).toBeVisible();
  await expect(page.getByRole("link", { name: "重新测试" })).toBeVisible();

  await mobileChrome.getByRole("link", { name: "关系" }).click();
  await expect(page).toHaveURL(new RegExp(`#relationships$`));
  await expect(page.getByTestId("mbti-chapter-relationships")).toBeVisible();
  await mobileChrome.getByRole("link", { name: "解锁作者化完整版" }).click();
  await expect(page).toHaveURL(new RegExp(`#offers$`));
});
