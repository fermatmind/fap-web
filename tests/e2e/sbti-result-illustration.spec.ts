import { expect, test } from "@playwright/test";

test("SBTI result page renders the mapped MUM illustration without a broken image", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "fm_sbti_fun_v1",
      JSON.stringify({
        version: 1,
        locale: "zh",
        updatedAt: "2026-04-09T00:00:00.000Z",
        answers: {},
        completedResult: {
          version: 1,
          updatedAt: "2026-04-09T00:00:00.000Z",
          locale: "zh",
          answers: {},
          scores: {
            social_drive: 64,
            expression_directness: 66,
            novelty_seeking: 62,
            boundary_awareness: 76,
            emotional_openness: 88,
            playfulness: 72,
            stability: 62,
            initiative: 54,
            signal_sensitivity: 58,
            group_energy: 52,
            reflection: 48,
            aesthetic_showcase: 62,
            ambiguity_tolerance: 58,
            warmth: 70,
            rhythm_control: 56,
          },
          primaryTypeCode: "MUM",
          matchPercent: 97,
          similarity: 0.97,
        },
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

  await page.goto("/zh/fun/sbti/result");

  const image = page.getByRole("img", { name: "妈妈 人格插画" });
  await expect(page.getByRole("heading", { level: 1, name: "妈妈" })).toBeVisible();
  await expect(image).toBeVisible();
  await expect(image).toHaveAttribute("src", /\/_next\/static\/media\/mum\..+\.png$/);

  const imageMetrics = await image.evaluate((element) => ({
    complete: element.complete,
    naturalWidth: element.naturalWidth,
  }));

  expect(imageMetrics.complete).toBe(true);
  expect(imageMetrics.naturalWidth).toBeGreaterThan(0);
});
