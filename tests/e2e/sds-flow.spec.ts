import { expect, test } from "@playwright/test";

test("SDS flow: consent gate, submit, crisis banner, paywall hidden, locale content", async ({ page }) => {
  const attemptId = "sds-attempt-0001";
  let startPayload: Record<string, unknown> | null = null;

  const questions = Array.from({ length: 20 }, (_, idx) => ({
    question_id: String(idx + 1),
    order: idx + 1,
    direction: idx % 2 === 0 ? 1 : -1,
    text: `SDS question ${idx + 1}`,
  }));

  await page.route("**/api/track", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.route("**/api/v0.3/scales/SDS_20/questions*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        scale_code: "SDS_20",
        locale: "en",
        questions: {
          items: questions,
        },
        options: {
          format: ["Rarely", "Sometimes", "Often", "Almost always"],
        },
        meta: {
          consent: {
            required: true,
            version: "SDS20_CONSENT_v1",
            text: "Read and accept this consent before starting.",
          },
          disclaimer: {
            version: "SDS20_DISC_v1",
            text: "Not a diagnosis",
          },
          source: {
            items: [{ title: "SDS" }],
          },
        },
      }),
    });
  });

  await page.route("**/api/v0.3/attempts/start", async (route) => {
    startPayload = route.request().postDataJSON() as Record<string, unknown>;

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
    const body = route.request().postDataJSON() as {
      answers?: Array<{ question_id?: string; code?: string }>;
      duration_ms?: number;
    };

    expect(Array.isArray(body.answers)).toBeTruthy();
    expect(body.answers?.length).toBe(20);
    expect(body.answers?.every((item) => typeof item.code === "string" && item.code.length > 0)).toBeTruthy();
    expect(typeof body.duration_ms).toBe("number");

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        attempt_id: attemptId,
        report: {
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
              modules_included: ["paid_deep_dive"],
            },
          ],
          report: {
            scale_code: "SDS_20",
            sections: [
              {
                key: "disclaimer_top",
                title: "Important Disclaimer",
                access_level: "free",
                blocks: [
                  {
                    id: "d1",
                    type: "markdown",
                    title: "Disclaimer",
                    content: "Self-discovery only.",
                  },
                ],
              },
              {
                key: "crisis_banner",
                title: "Crisis Support",
                access_level: "free",
                blocks: [
                  {
                    id: "c1",
                    type: "markdown",
                    title: "Support",
                    content: "Please seek immediate support.",
                  },
                ],
                resources: [{ title: "988 Lifeline", phone: "988" }],
                reasons: ["high risk signal"],
              },
              {
                key: "result_summary_free",
                title: "Summary",
                access_level: "free",
                blocks: [
                  {
                    id: "s1",
                    type: "markdown",
                    title: "Result",
                    content: "Summary content.",
                  },
                ],
              },
              {
                key: "paid_deep_dive",
                title: "Paid Deep Dive",
                access_level: "paid",
                blocks: [
                  {
                    id: "p1",
                    type: "markdown",
                    content: "Paid details",
                  },
                ],
              },
            ],
          },
        },
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
          locale: "en",
          sections: [
            {
              key: "disclaimer_top",
              title: "Important Disclaimer",
              access_level: "free",
              blocks: [{ id: "d1", type: "markdown", content: "Self-discovery only." }],
            },
            {
              key: "crisis_banner",
              title: "Crisis Support",
              access_level: "free",
              blocks: [{ id: "c1", type: "markdown", content: "Seek support now." }],
              resources: [{ title: "988 Lifeline", phone: "988" }],
            },
            {
              key: "result_summary_free",
              title: "Summary",
              access_level: "free",
              blocks: [{ id: "s1", type: "markdown", content: "Summary content." }],
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

  const startButton = page.getByRole("button", { name: "Agree and start" });
  await expect(startButton).toBeDisabled();

  await page.getByLabel("I have read and agree to the statement above").check();
  await startButton.click();

  for (let index = 0; index < 20; index += 1) {
    await expect(page.getByText(`Question ${index + 1} / 20`)).toBeVisible();
    await page.getByRole("radio").first().click();
    if (index < 19) {
      await page.getByRole("button", { name: "Next", exact: true }).click();
    }
  }

  await page.getByRole("button", { name: "Submit" }).click();

  await expect(page).toHaveURL(new RegExp(`/en/attempts/${attemptId}/report`));
  await expect(page.getByRole("heading", { name: "Important Disclaimer" })).toBeVisible();
  await expect(page.getByText("Important: prioritize immediate safety and support")).toBeVisible();
  await expect(page.getByRole("button", { name: "Unlock now" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Paid Deep Dive" })).toHaveCount(0);

  expect(startPayload).not.toBeNull();
  const payload = (startPayload ?? {}) as Record<string, unknown>;
  expect(payload.scale_code).toBe("SDS_20");
  expect(payload.consent).toMatchObject({
    accepted: true,
    version: "SDS20_CONSENT_v1",
  });
});
