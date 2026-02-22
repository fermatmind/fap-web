import { expect, test } from "@playwright/test";

test("BIG5 flow: answer -> submit -> free -> unlock -> pdf", async ({ page }) => {
  const attemptId = "11111111-1111-1111-1111-111111111111";
  const orderNo = "ord_mock_big5_1";
  let unlocked = false;

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
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });

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
          items: questions,
        },
        meta: {
          disclaimer_version: "BIG5_OCEAN_v1",
          disclaimer_hash: "hash_v1",
          disclaimer_text: "This test is for self-discovery only.",
        },
      }),
    });
  });

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

  await page.route(`**/api/v0.3/attempts/${attemptId}/report`, async (route) => {
    const payload = unlocked
      ? {
          ok: true,
          locked: false,
          variant: "full",
          norms: { status: "CALIBRATED", norms_version: "2026Q1" },
          quality: { level: "A", tone: "confident" },
          offers: [],
          modules_allowed: ["big5_core", "big5_full", "big5_action_plan"],
          report: {
            sections: [
              {
                key: "summary",
                title: "Summary",
                access_level: "free",
                blocks: [{ kind: "paragraph", title: "Summary", body: "Your profile summary." }],
              },
              {
                key: "domains_overview",
                title: "Domains",
                access_level: "free",
                blocks: [
                  { kind: "chart", metric_code: "O", title: "Openness", body: "Openness percentile 62" },
                  { kind: "chart", metric_code: "C", title: "Conscientiousness", body: "Conscientiousness percentile 58" },
                  { kind: "chart", metric_code: "E", title: "Extraversion", body: "Extraversion percentile 44" },
                  { kind: "chart", metric_code: "A", title: "Agreeableness", body: "Agreeableness percentile 71" },
                  { kind: "chart", metric_code: "N", title: "Neuroticism", body: "Neuroticism percentile 33" },
                ],
              },
              {
                key: "facet_table",
                title: "Facet Table",
                access_level: "paid",
                blocks: [
                  { kind: "table_row", metric_code: "O1", title: "O1", body: "O1 percentile 60" },
                  { kind: "table_row", metric_code: "C1", title: "C1", body: "C1 percentile 55" },
                ],
              },
              {
                key: "top_facets",
                title: "Top Facets",
                access_level: "paid",
                blocks: [{ kind: "metric_card", metric_code: "A1", title: "A1", body: "A1 percentile 78" }],
              },
            ],
          },
          meta: {
            pack_id: "BIG5_OCEAN",
            dir_version: "v1",
            content_package_version: "v1",
          },
        }
      : {
          ok: true,
          locked: true,
          variant: "free",
          norms: { status: "CALIBRATED", norms_version: "2026Q1" },
          quality: { level: "B", tone: "cautious" },
          offers: [
            {
              sku: "BIG5_FULL",
              label: "BIG5 Full",
              formatted_price: "$9.99",
              currency: "USD",
              amount_cents: 999,
              order_no: orderNo,
              modules_included: ["big5_full", "big5_action_plan"],
            },
          ],
          modules_allowed: ["big5_core"],
          modules_offered: ["big5_full", "big5_action_plan"],
          report: {
            sections: [
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

  await page.route(`**/api/v0.3/attempts/${attemptId}/report.pdf`, async (route) => {
    await route.fulfill({
      status: 200,
      headers: {
        "content-type": "application/pdf",
      },
      body: "mock pdf binary",
    });
  });

  await page.goto("/en/tests/big-five-personality-test/take");

  await expect(page.getByText("Before you start")).toBeVisible();
  await page.getByLabel("I have read and agree to the disclaimer.").check();
  await page.getByRole("button", { name: "Agree and start" }).click();

  await expect(page.getByText("Question 1 / 120")).toBeVisible();

  for (let i = 0; i < 120; i += 1) {
    await page.getByRole("radio").first().click();
    if (i < 119) {
      await page.getByRole("button", { name: "Next", exact: true }).click();
    }
  }

  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page).toHaveURL(new RegExp(`/en/result/${attemptId}`));

  await expect(page.getByRole("heading", { name: "Unlock full report" })).toBeVisible();
  await page.getByRole("button", { name: "Unlock now" }).click();

  await page.waitForURL(new RegExp(`/en/(orders/${orderNo}|result/${attemptId})`));
  if (page.url().includes(`/en/orders/${orderNo}`)) {
    await page.waitForURL(new RegExp(`/en/result/${attemptId}`));
  }

  const downloadButton = page.getByRole("button", { name: "Download PDF" });
  await expect(downloadButton).toBeEnabled();
  await downloadButton.click();
});
