import canonicalEngine from "../fixtures/big5/canonical-engine-en-120.json";
import { expect, test } from "@playwright/test";
import { startBig5PublicApiFixture } from "./helpers/big5-public-api-fixture";
import { clickLastOptionAndWaitForSubmitAndUrl } from "./helpers/quiz-flow";

let stopPublicApiFixture: (() => Promise<void>) | null = null;

test.beforeAll(async () => {
  stopPublicApiFixture = await startBig5PublicApiFixture();
});

test.afterAll(async () => {
  await stopPublicApiFixture?.();
  stopPublicApiFixture = null;
});

test("@release BIG5 flow: answer -> submit -> canonical result", async ({ page }) => {
  test.skip(process.env.PLAYWRIGHT_SERVER_MODE !== "production", "Release flow runs against the production server build.");
  const attemptId = "11111111-1111-1111-1111-111111111111";
  const reportAccessPattern = new RegExp(`/api/v0\\.3/attempts/${attemptId}/report-access(?:\\?.*)?$`);
  const reportPattern = new RegExp(`/api/v0\\.3/attempts/${attemptId}/report(?:\\?.*)?$`);
  let reportAccessRequestCount = 0;
  let reportRequestCount = 0;
  const fallbackRequests: string[] = [];
  await page.route(new RegExp(`/api/v0\\.3/attempts/${attemptId}/(?:result|submission)(?:\\?.*)?$`), async (route) => {
    fallbackRequests.push(route.request().url());
    await route.fulfill({ status: 500, json: { ok: false } });
  });
  const trackedEvents: Array<{ eventName: string; payload: Record<string, unknown> }> = [];

  const questions = Array.from({ length: 120 }, (_, idx) => ({
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

  await page.route("**/api/track", async (route) => {
    const body = route.request().postDataJSON() as {
      eventName?: unknown;
      payload?: unknown;
    };
    const payload =
      body.payload && typeof body.payload === "object" && !Array.isArray(body.payload)
        ? (body.payload as Record<string, unknown>)
        : {};
    trackedEvents.push({
      eventName: typeof body.eventName === "string" ? body.eventName : "",
      payload,
    });

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
        fm_token: "fm_e2e_big5_flow_guest_token",
      }),
    });
  });

  const big5QuestionsPayload = {
    ok: true,
    scale_code: "BIG5_OCEAN",
    pack_id: "BIG5_OCEAN",
    dir_version: "v1",
    content_package_version: "v1",
    questions: {
      schema: "fap.questions.v1",
      items: questions,
    },
    meta: {
      disclaimer_version: "BIG5_OCEAN_v1",
      disclaimer_hash: "hash_v1",
      disclaimer_text: "This test is for self-discovery only.",
    },
  };
  for (const scaleCode of ["BIG5_OCEAN", "BIG_FIVE_OCEAN_MODEL"]) {
    await page.route(`**/api/v0.3/scales/${scaleCode}/questions*`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(big5QuestionsPayload),
      });
    });
  }

  await page.route("**/api/v0.3/scales/lookup?*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        slug: "big-five-personality-test-ocean-model",
        scale_code: "BIG5_OCEAN",
        capabilities: {
          enabled_in_prod: true,
          paywall_mode: "full",
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
        resume_token: "resume_token",
      }),
    });
  });

  await page.route("**/api/v0.3/attempts/submit", async (route) => {
    const body = route.request().postDataJSON() as {
      answers?: Array<{ question_id?: string; code?: string }>;
    };

    expect(Array.isArray(body.answers)).toBeTruthy();
    expect(body.answers?.length).toBe(120);
    expect(body.answers?.every((item) => typeof item.code === "string" && item.code.length > 0)).toBeTruthy();

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        attempt_id: attemptId,
      }),
    });
  });

  await page.route(reportAccessPattern, async (route) => {
    reportAccessRequestCount += 1;
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
        payload: { scale_code: "BIG5_OCEAN" },
        meta: {
          produced_at: "2026-03-27T00:00:00.000Z",
          refreshed_at: "2026-03-27T00:00:00.000Z",
        },
      }),
    });
  });

  await page.route(reportPattern, async (route) => {
    reportRequestCount += 1;
    // Generated by backend BigFiveReportEngine at 5f5ea6236 from the canonical
    // context fixture with locale=en and form_code=big5_120. Copy is not translated here.
    const engine = structuredClone(canonicalEngine);
    // BigFiveReportComposer::applyAccessVariant defines these free sections.
    for (const section of engine.sections) {
      if (!["hero_summary", "domains_overview", "methodology_and_access"].includes(section.section_key)) {
        section.status = "locked";
        section.blocks = [];
      }
    }
    const payload = {
      ok: true,
      locked: true,
      variant: "free",
      big5_private_result_authority: engine._meta.big5_private_result_authority,
      big5_report_engine_v2: engine,
      modules_allowed: ["big5_core"],
      modules_offered: ["big5_full"],
      report: { scale_code: "BIG5_OCEAN", sections: [] },
    };

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(payload),
    });
  });

  await page.goto("/en/tests/big-five-personality-test-ocean-model/take");

  const firstQuestion = page.getByText("Question 1 / 120");
  await expect(firstQuestion).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole("button", { name: "Agree and start" })).toHaveCount(0);

  const firstRadio = page.getByRole("radio").first();
  for (let i = 0; i < 119; i += 1) {
    await firstRadio.focus();
    await firstRadio.press("Space");
    await expect(page.getByText(`Question ${i + 2} / 120`)).toBeVisible();
  }

  const submitResponse = await clickLastOptionAndWaitForSubmitAndUrl({
    page,
    option: page.getByRole("radio").nth(1),
    targetUrl: new RegExp(`/en/result/${attemptId}`),
    timeoutMs: 30000,
  });
  expect(submitResponse.status()).toBe(200);

  await expect(page.getByTestId("big5-section-hero_summary")).toBeVisible();
  const sections = page.locator('[data-testid^="big5-section-"]');
  expect(await sections.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-testid"))))
    .toEqual([
      "hero_summary", "domains_overview", "methodology_and_access",
      "domain_deep_dive", "facet_details", "core_portrait", "norms_comparison", "action_plan",
    ].map((key) => `big5-section-${key}`));
  await expect(page.getByTestId("big5-quality-notice")).toContainText("Low-confidence result");
  await expect(page.getByTestId("big5-section-domain_deep_dive")).toContainText("Unlock");
  await expect(page.getByTestId("big5-section-methodology_and_access")).toBeVisible();
  expect(fallbackRequests).toEqual([]);

  const startEvent = trackedEvents.find((event) => event.eventName === "start_click");
  if (startEvent) {
    expect(startEvent.payload.manifest_hash).toBeTruthy();
    expect(startEvent.payload.manifest_hash).not.toBe("unknown");
    expect(startEvent.payload.manifest_hash).not.toBe("pending");
    expect(startEvent.payload.pack_version).toBeTruthy();
    expect(startEvent.payload.norms_version).toBeTruthy();
    expect(startEvent.payload.quality_level).toBeTruthy();
    expect(startEvent.payload.variant).toBeTruthy();
  }

  const reportFreeEvents = trackedEvents.filter((event) => event.eventName === "report_view_free");
  expect(reportFreeEvents.length).toBe(0);
  expect(reportAccessRequestCount).toBeGreaterThan(0);
  expect(reportRequestCount).toBeGreaterThan(0);
});
