import { expect, test } from "@playwright/test";

for (const locale of ["zh", "en"]) {
  for (const [legacy, current, profile] of [
    ["jungian-archetype", "jung-archetypes", "hero"],
  ]) {
    test(`@release ${locale} retires ${legacy} and forwards entry to ${current}`, async ({ request }) => {
      for (const suffix of ["", "/take"]) {
        const oldPath = `/${locale}/tests/explore/${legacy}${suffix}`;
        const response = await request.get(oldPath, { maxRedirects: 0 });
        expect(response.status()).toBe(308);
        expect(response.headers().location).toBe(suffix ? `/${locale}/tests/${current}${suffix}` : `/${locale}/tests/jung-test`);
      }
      expect((await request.get(`/${locale}/tests/explore/${legacy}/results/${profile}`)).status()).toBe(404);
      expect((await request.get(`/zh-TW/tests/explore/${legacy}/results/${profile}`)).status()).toBe(404);
    });
  }
}

for (const locale of ["zh", "en", "zh-TW"]) {
  test(`${locale} retires cognitive function entry and questionnaire`, async ({ request }) => {
    expect((await request.get(`/${locale}/reports/samples/cognitive`)).status()).toBe(404);
    for (const path of ["jung-cognitive-functions", "explore/cognitive-functions-test"]) {
      for (const suffix of ["", "/take"]) {
        expect((await request.get(`/${locale}/tests/${path}${suffix}`)).status()).toBe(404);
      }
    }
  });
}


test("Jung Chinese sample stays fixed across public entrypoints and query parameters", async ({ page }) => {
  await page.goto("/zh/reports/samples/archetypes");
  await expect(page.locator("[data-report-mode=sample]")).toBeVisible();
  await expect(page.locator("#profile h2")).toHaveText("智者");
  await expect(page.locator("meta[name=robots]")).toHaveAttribute("content", /noindex/);
  await expect(page.locator("select")).toHaveCount(0);
  const original = await page.locator("#profile").innerText();
  await page.goto("/zh/tests/jung-archetypes/sample?archetype=hero&pattern=flat");
  await expect(page.locator("[data-report-mode=sample]")).toBeVisible();
  expect(await page.locator("#profile").innerText()).toBe(original);
  await expect(page.locator("#ai")).toContainText("不能当作我的真实测评结果");
});
