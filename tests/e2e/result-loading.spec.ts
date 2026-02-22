import { expect, test } from "@playwright/test";

test("result page shows anticipation skeleton while loading", async ({ page }) => {
  const attemptId = "result-loading-001";

  await page.route(`**/api/v0.3/attempts/${attemptId}/report*`, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        locked: false,
        variant: "full",
        quality: { level: "A" },
        offers: [],
        report: {
          scale_code: "BIG5_OCEAN",
          sections: [
            {
              key: "summary",
              title: "Summary",
              access_level: "free",
              blocks: [{ kind: "paragraph", title: "Summary", body: "done" }],
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

  await page.goto(`/en/result/${attemptId}`);

  await expect(page.getByText("Matching evidence profile models...")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your assessment result" })).toBeVisible();
});
