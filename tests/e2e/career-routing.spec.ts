import { expect, test } from "@playwright/test";
import reportReadyMbtiProjectionFixture from "../fixtures/report_ready.mbti.projection.json";

function createCareerContinuityFixture() {
  const fixture = structuredClone(reportReadyMbtiProjectionFixture) as Record<string, unknown>;
  const projection = (fixture.mbti_public_projection_v1 ?? {}) as Record<string, unknown>;
  const projectionMeta = ((projection._meta ?? {}) as Record<string, unknown>);
  const projectionPersonalization = ((projectionMeta.personalization ?? {}) as Record<string, unknown>);
  projectionPersonalization.continuity = {
    carryover_focus_key: "growth.next_actions",
    carryover_reason: "unlock_to_continue_focus",
    recommended_resume_keys: ["growth.next_actions", "career.next_step"],
    carryover_scene_keys: ["growth", "work"],
    carryover_action_keys: ["weekly_action.theme.name_decision_rule"],
  };
  projectionPersonalization.schema_version = "mbti.personalization.phase8a.v1";
  projectionPersonalization.dynamic_sections_version = "phase8a.v1";
  projectionMeta.personalization = projectionPersonalization;
  projection._meta = projectionMeta;
  fixture.mbti_public_projection_v1 = projection;

  const report = (fixture.report ?? {}) as Record<string, unknown>;
  const reportMeta = ((report._meta ?? {}) as Record<string, unknown>);
  reportMeta.personalization = structuredClone(projectionPersonalization);
  report._meta = reportMeta;
  fixture.report = report;

  return fixture;
}

for (const prefix of ["articles", "career", "topics", "personality"] as const) {
  test(`${prefix} root redirects by accept-language and preserves query`, async ({ request }) => {
    const response = await request.get(`/${prefix}?utm=a`, {
      maxRedirects: 0,
      headers: {
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
      },
    });

    expect(response.status()).toBe(308);
    expect(response.headers().location).toContain(`/zh/${prefix}?utm=a`);
  });
}

test("legacy professions stay gone while types routes funnel into personality", async ({ request }) => {
  const gonePaths = ["/en/professions", "/zh/professions", "/professions"];

  for (const pathname of gonePaths) {
    const response = await request.get(pathname, { maxRedirects: 0 });
    expect(response.status(), pathname).toBe(410);
    expect(response.headers()["x-robots-tag"], pathname).toContain("noindex");
  }

  const typesIndex = await request.get("/en/types", { maxRedirects: 0 });
  expect(typesIndex.status()).toBe(308);
  expect(typesIndex.headers().location).toBe("http://localhost:3000/en/personality");

  const typesDetail = await request.get("/en/types/intj", { maxRedirects: 0 });
  expect(typesDetail.status()).toBe(308);
  expect(typesDetail.headers().location).toBe("http://localhost:3000/en/personality/intj-a");
});

test("mbti career recommendation route exposes answer-first, table, faq, and public backlinks", async ({ request }) => {
  const response = await request.get("/en/career/recommendations/mbti/intj-a");
  expect(response.status()).toBe(200);
  const html = await response.text();

  expect(html).toContain('id="answer-first"');
  expect(html).toContain('id="recommended-roles"');
  expect(html).toContain('"@type":"ItemList"');
  expect(html).toContain('"@type":"FAQPage"');
  expect(html).toContain("/en/personality/intj-a");
  expect(html).toContain("/en/topics/mbti");
  expect(html).toContain("/en/help/faq");
});

test("INTP personality pages render three scenario sections and keep source entry anchors", async ({ request }) => {
  const response = await request.get("/en/personality/intp-a");
  expect(response.status()).toBe(200);
  const html = await response.text();

  expect(html).toContain('id="answer-first"');
  expect(html).toContain('INTP hub: career / collaboration / growth');
  expect(html).toContain('id="intp-personality-scene-career"');
  expect(html).toContain('id="intp-personality-scene-team"');
  expect(html).toContain('id="intp-personality-scene-growth"');
});

test("INTP recommendation pages render interpretation block instead of list-only view", async ({ request }) => {
  const response = await request.get("/en/career/recommendations/mbti/intp-a");
  expect(response.status()).toBe(200);
  const html = await response.text();

  expect(html).toContain('id="career-recommendation-intp-interpretation"');
  expect(html).toContain("Why these roles attract INTP");
  expect(html).toContain("Why some jobs drain INTP");
  expect(html).toContain("Career recommendation");
});

test("MBTI topic page exposes INTP continuation entry links", async ({ request }) => {
  const response = await request.get("/en/topics/mbti");
  expect(response.status()).toBe(200);
  const html = await response.text();

  expect(html).toContain('data-testid="mbti-topic-intp-entry"');
  expect(html).toContain("/en/personality/intp-a");
  expect(html).toContain("/en/personality/intp-t");
  expect(html).toContain("/en/career/recommendations/mbti/intp-a");
  expect(html).toContain("/en/career/recommendations/mbti/intp-t");
});

test("mbti career recommendation route treats 32-type as authority and 4-letter as a redirecting compatibility entry", async ({ request }) => {
  const legacyResponse = await request.get("/en/career/recommendations/mbti/intj", { maxRedirects: 0 });
  expect(legacyResponse.status()).toBe(308);
  expect(legacyResponse.headers().location).toBe("/en/career/recommendations/mbti/intj-a");

  const variantResponse = await request.get("/en/career/recommendations/mbti/intj-a");
  expect(variantResponse.status()).toBe(200);
  const variantHtml = await variantResponse.text();
  expect(variantHtml).toContain("/en/personality/intj-a");
});

test("mbti result career CTA points to the 32-type recommendation authority route", async ({ page }) => {
  const attemptId = "mbti-career-join-0001";
  const reportAccessPattern = new RegExp(`/api/v0\\.3/attempts/${attemptId}/report-access(?:\\?.*)?$`);
  const reportPattern = new RegExp(`/api/v0\\.3/attempts/${attemptId}/report(?:\\?.*)?$`);

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
        fm_token: "fm_e2e_mbti_career_join_guest_token",
      }),
    });
  });

  await page.route(reportAccessPattern, async (route) => {
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
        },
        meta: {
          produced_at: "2026-03-27T00:00:00.000Z",
          refreshed_at: "2026-03-27T00:00:00.000Z",
        },
      }),
    });
  });

  await page.route(`**/api/v0.3/attempts/${attemptId}/report*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(createCareerContinuityFixture()),
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

  await page.goto(`/en/result/${attemptId}`);

  const careerCta = page.getByTestId("mbti-career-next-step-cta");
  await expect(careerCta).toHaveAttribute(
    "href",
    /\/en\/career\/recommendations\/mbti\/enfp-t\?.*carryover_focus_key=growth.next_actions/
  );
});

test("career recommendation route renders continuity carryover when query is present", async ({ request }) => {
  const response = await request.get(
    "/en/career/recommendations/mbti/intj-a?carryover_focus_key=career.next_step&carryover_reason=continue_career_bridge"
  );
  expect(response.status()).toBe(200);
  const html = await response.text();

  expect(html).toContain('data-testid="mbti-career-continuity-entry"');
  expect(html).toContain("Career next step");
});

test("riasec flow produces result and recommendation list", async ({ page }) => {
  await page.route("**/api/v0.3/me/attempts**", async (route) => {
    const url = new URL(route.request().url());
    const scale = String(url.searchParams.get("scale") ?? "").toUpperCase();

    if (scale.includes("MBTI")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          items: [{ attempt_id: "mbti1", type_code: "INTP" }],
          meta: { current_page: 1, last_page: 1 },
        }),
      });
      return;
    }

    if (scale.includes("BIG5")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          items: [
            {
              attempt_id: "big51",
              result_summary: {
                domains_mean: {
                  openness: 78,
                  conscientiousness: 72,
                  extraversion: 52,
                  agreeableness: 60,
                  neuroticism: 28,
                },
              },
            },
          ],
          meta: { current_page: 1, last_page: 1 },
        }),
      });
      return;
    }

    if (scale.includes("IQ")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          items: [{ attempt_id: "iq1" }],
          meta: { current_page: 1, last_page: 1 },
        }),
      });
      return;
    }

    if (scale.includes("EQ")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          items: [{ attempt_id: "eq1" }],
          meta: { current_page: 1, last_page: 1 },
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, items: [], meta: { current_page: 1, last_page: 1 } }),
    });
  });

  await page.route("**/api/v0.3/attempts/*/report**", async (route) => {
    const requestUrl = route.request().url();

    if (requestUrl.includes("/iq1/report")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, report: { scores: { overall: 82 } } }),
      });
      return;
    }

    if (requestUrl.includes("/eq1/report")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, report: { scores: { overall: 74 } } }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, report: { scores: { overall: 70 } } }),
    });
  });

  await page.goto("/en/career/tests/riasec");

  const completeAllQuestions = async () => {
    await page.evaluate(() => {
      const names = Array.from(
        new Set(
          Array.from(document.querySelectorAll<HTMLInputElement>('input[type="radio"]')).map(
            (node) => node.name
          )
        )
      );

      for (const name of names) {
        const checked = document.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`);
        if (checked) continue;
        const input = document.querySelector<HTMLInputElement>(`input[name="${name}"][value="5"]`);
        input?.click();
      }
    });
  };

  await completeAllQuestions();
  await completeAllQuestions();

  await expect(page.getByText("Progress: 100%")).toBeVisible();
  await page.getByRole("button", { name: "Generate career interest result" }).click();
  await expect(page).toHaveURL(/\/en\/career\/tests\/riasec\/result$/);

  await page.getByRole("link", { name: "View career recommendations" }).click();
  await expect(page).toHaveURL(/\/en\/career\/recommendations$/);
  await expect(page.getByText("Your profile inputs")).toBeVisible();
  await expect(page.getByRole("link", { name: "View job profile" }).first()).toBeVisible();
});
