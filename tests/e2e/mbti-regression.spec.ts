import { expect, test } from "@playwright/test";

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
      body: JSON.stringify({
        ok: true,
        locked: false,
        variant: "full",
        quality: { level: "A" },
        report: {
          scale_code: "MBTI",
          sections: [
            {
              key: "summary",
              title: "Summary",
              access_level: "free",
              blocks: [{ kind: "paragraph", title: "Summary", body: "MBTI baseline summary." }],
            },
          ],
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
        capabilities: {
          enabled_in_prod: true,
          paywall_mode: "full",
        },
      }),
    });
  });

  await page.goto("/en/tests/personality-mbti-test/take");
  await expect(page.getByText("Current focus")).toBeVisible();

  for (let i = 0; i < 8; i += 1) {
    await page.getByRole("radio").first().click();
    if (i < 7) {
      await page.getByRole("button", { name: "Next", exact: true }).click();
    }
  }

  await page.getByRole("button", { name: "Submit" }).click();

  await expect(page).toHaveURL(new RegExp(`/result/${attemptId}(\\?.*)?$`), { timeout: 15000 });
  await expect(page.getByRole("heading", { name: "Your assessment result", level: 1 })).toBeVisible();
  await expect(page.getByText("MBTI baseline summary.")).toBeVisible();
});
