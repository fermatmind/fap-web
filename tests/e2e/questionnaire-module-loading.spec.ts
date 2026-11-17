import { test, expect } from "@playwright/test";
import disc from "../../lib/questionnaires/data/disc.json";

const selectedChunks = { disc: new Set<string>() };
function englishProbe(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const object = value as Record<string, unknown>;
  if (typeof object.en === "string") {
    const match = object.en.match(/[A-Za-z][A-Za-z ,]{25,}/);
    if (match) return match[0];
  }
  for (const child of Object.values(object)) { const found = englishProbe(child); if (found) return found; }
  return null;
}

// Find the current build's real edition assets; never abort the new document's bootstrap.
test.beforeAll(async ({ browser, baseURL }) => {
  for (const method of ["disc"] as const) {
    const probe = englishProbe(disc.questions[0]);
    expect(probe).not.toBeNull();
    const context = await browser.newContext({ baseURL });
    try {
      const page = await context.newPage(), reads: Promise<void>[] = [];
      await page.addInitScript(() => localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied", updatedAt: new Date().toISOString() })));
      page.on("response", response => {
        if (response.request().resourceType() !== "script") return;
        reads.push(response.text().then(body => { if (body.includes(probe!)) selectedChunks[method].add(new URL(response.url()).pathname); }).catch(() => {}));
      });
      await page.goto("/en/tests/explore/disc/take?start=1");
      await expect(page.getByRole("radio").first()).toBeVisible();
      await page.waitForLoadState("networkidle");
      await Promise.all(reads);
      expect(selectedChunks[method].size).toBeGreaterThan(0);
    } finally { await context.close(); }
  }
});

for (const locale of ["en", "zh"] as const) {
  test(`@release DISC ${locale}: retry interrupted engine, discard old drafts and reload safely`, async ({ page }) => {
    const zh = locale === "zh", chunks = "**/_next/static/chunks/*.js";
    const failure = page.locator("[data-disc-prepare-return]").locator("..").getByRole("alert");
    await page.goto(`/${locale}/tests/explore/disc`);
    await expect(page.locator("[data-explore-start]")).toBeEnabled();
    let interrupted = 0;
    await page.route(chunks, route => { if (selectedChunks.disc.has(new URL(route.request().url()).pathname)) { interrupted++; return route.abort("failed"); } return route.continue(); });
    const injectedFailure = page.waitForEvent("requestfailed", { predicate: request => selectedChunks.disc.has(new URL(request.url()).pathname) });
    await page.locator("[data-explore-start]").click();
    await injectedFailure;
    await expect(failure).toContainText(zh ? "加载失败" : "could not load");
    expect(interrupted).toBeGreaterThan(0);
    await expect(page.locator("[data-disc-prepare-return]")).toBeVisible();
    await page.unroute(chunks);
    await page.getByRole("button", { name: zh ? "重试加载" : "Retry loading", exact: true }).click();
    await expect(page.getByRole("checkbox")).toHaveCount(0);
    await page.getByRole("radio").first().check();
    await expect(page.locator("#take-test h2")).toHaveText(disc.questions[1].prompt[locale]);
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:disc"))).toBeNull();
    await page.reload();
    await expect(page.locator("#take-test h2")).toHaveText(disc.questions[0].prompt[locale]);
    await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);
    await expect(page.locator("[data-questionnaire-resume]")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Exit and clear|退出并清除/ })).toHaveCount(0);
  });
}
