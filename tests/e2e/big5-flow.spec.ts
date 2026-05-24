import { expect, test } from "@playwright/test";
import { clickLastOptionAndWaitForSubmitAndUrl } from "./helpers/quiz-flow";

test("BIG5 flow: answer -> submit -> foundation result", async ({ page }) => {
  const attemptId = "11111111-1111-1111-1111-111111111111";
  const reportAccessPattern = new RegExp(`/api/v0\\.3/attempts/${attemptId}/report-access(?:\\?.*)?$`);
  const reportPattern = new RegExp(`/api/v0\\.3/attempts/${attemptId}/report(?:\\?.*)?$`);
  let reportAccessRequestCount = 0;
  let reportRequestCount = 0;
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
  const big5Projection = {
    schema_version: "big5.public_projection.v1",
    dominant_traits: [
      { key: "O", label: "Openness", percentile: 81, band: "high", rank: 1 },
      { key: "A", label: "Agreeableness", percentile: 76, band: "high", rank: 2 },
    ],
    scene_fingerprint: {
      novelty: "exploratory",
      structure: "balanced",
      social_energy: "reserved",
      cooperation: "harmonizing",
    },
    explainability_summary: {
      headline: "This profile is primarily driven by Openness.",
    },
    action_plan_summary: {
      headline: "The best near-term growth lever is Extraversion.",
    },
    comparative_v1: {
      version: "comparative.norming.v1",
      comparative_contract_version: "comparative.norming.v1",
      enabled: true,
      percentile: {
        metric_key: "O",
        metric_label: "Openness",
        value: 81,
      },
      cohort_relative_position: {
        key: "cohort.upper_quartile",
        label: "Above most peers in this cohort",
        summary: "This trait cluster sits in the upper quartile of the current norming cohort.",
      },
      same_type_contrast: {
        key: "same_type.lead_trait_high",
        label: "Higher-openness version of this profile",
        summary: "Compared with nearby profiles, Openness is the clearest separating signal.",
      },
      norming_version: "2026Q1",
      norming_scope: "US.en-US.big5_population",
      norming_source: "scale_norms",
      comparative_fingerprint: "big5-comparative-fixture",
    },
    trait_vector: [
      { key: "O", label: "Openness", percentile: 81, band_label: "exploratory" },
      { key: "C", label: "Conscientiousness", percentile: 58, band_label: "balanced" },
      { key: "E", label: "Extraversion", percentile: 44, band_label: "balanced" },
      { key: "A", label: "Agreeableness", percentile: 71, band_label: "harmonizing" },
      { key: "N", label: "Neuroticism", percentile: 33, band_label: "steady" },
    ],
    variant_keys: ["profile:explorer", "band:o.high"],
  };

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
        meta: {
          produced_at: "2026-03-27T00:00:00.000Z",
          refreshed_at: "2026-03-27T00:00:00.000Z",
        },
      }),
    });
  });

  await page.route(reportPattern, async (route) => {
    reportRequestCount += 1;
    const payload = {
      ok: true,
      locked: true,
      variant: "free",
      big5_public_projection_v1: big5Projection,
      norms: { status: "CALIBRATED", norms_version: "2026Q1" },
      quality: { level: "B", tone: "cautious" },
      offers: [
        {
          sku: "BIG5_FULL",
          label: "BIG5 Full",
          formatted_price: "$9.99",
          currency: "USD",
          amount_cents: 999,
          modules_included: ["core_full", "big5_action_plan"],
        },
      ],
      modules_allowed: ["big5_core"],
      modules_offered: ["big5_full", "big5_action_plan"],
      report: {
        sections: [
          {
            key: "traits.overview",
            title: "Traits Overview",
            access_level: "free",
            blocks: [{ kind: "paragraph", title: "Traits Overview", body: "This read is shaped by Openness and Agreeableness." }],
          },
          {
            key: "summary",
            title: "Summary",
            access_level: "free",
            blocks: [{ kind: "paragraph", title: "Summary", body: "Preview summary" }],
          },
          {
            key: "domains_overview",
            title: "Domains",
            access_level: "free",
            blocks: [
              { kind: "chart", metric_code: "O", title: "Openness", body: "Openness percentile 62" },
              { kind: "chart", metric_code: "C", title: "Conscientiousness", body: "Conscientiousness percentile 58" },
            ],
          },
          {
            key: "facet_table",
            title: "Facet Table",
            access_level: "paid",
            blocks: [{ kind: "table_row", metric_code: "O1", title: "O1", body: "O1 percentile 60" }],
          },
        ],
      },
      meta: {
        scale_code: "BIG5_OCEAN",
        pack_id: "BIG5_OCEAN",
        dir_version: "v1",
        content_package_version: "v1",
      },
    };

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(payload),
    });
  });

  await page.goto("/en/tests/big-five-personality-test-ocean-model/take");

  const firstQuestion = page.getByText("Question 1 / 120");
  const startButton = page.getByRole("button", { name: "Agree and start" });
  await expect
    .poll(
      async () => {
        if (await firstQuestion.isVisible().catch(() => false)) return "question";
        if (await startButton.isVisible().catch(() => false)) return "consent";
        return "pending";
      },
      { timeout: 20000 }
    )
    .not.toBe("pending");

  if (await startButton.isVisible().catch(() => false)) {
    await page.getByLabel("I have read and agree to the disclaimer.").check();
    await startButton.click();
  }

  await expect(firstQuestion).toBeVisible({ timeout: 15000 });

  const firstRadio = page.getByRole("radio").first();
  for (let i = 0; i < 119; i += 1) {
    await firstRadio.focus();
    await firstRadio.press("Space");
    await expect(page.getByText(`Question ${i + 2} / 120`)).toBeVisible();
  }

  const submitResponse = await clickLastOptionAndWaitForSubmitAndUrl({
    page,
    option: page.getByRole("radio").first(),
    targetUrl: new RegExp(`/en/result/${attemptId}`),
    timeoutMs: 30000,
  });
  expect(submitResponse.status()).toBe(200);

  const foundationSummary = page.getByTestId("big5-foundation-summary");
  await expect(page.getByRole("heading", { name: "BIG5 · Openness" })).toBeVisible();
  await expect(foundationSummary).toBeVisible();
  await expect(foundationSummary.getByText("This profile is primarily driven by Openness.")).toBeVisible();
  await expect(page.getByTestId("big5-comparative")).toBeVisible();
  await expect(page.getByTestId("big5-comparative")).toContainText("81th percentile");
  await expect(page.getByTestId("big5-scene-fingerprint")).toBeVisible();
  await expect(foundationSummary.getByText("Openness · 81")).toBeVisible();
  await expect(foundationSummary.getByText("Agreeableness · 76")).toBeVisible();
  await expect(page.getByTestId("big5-action-plan-summary")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Traits Overview" })).toBeVisible();
  await expect(page.getByTestId("big5-locked-sections")).toBeVisible();
  await expect(page.getByTestId("big5-offer-surface")).toBeVisible();

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
