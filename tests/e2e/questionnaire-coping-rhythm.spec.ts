import { seedAnalyticsConsent } from "./helpers/consent";
import { test, expect, type Page } from "@playwright/test";
import { expectStandaloneObservationPrivacy } from "./helpers/standalone-observation-flow";
import data from "../../lib/questionnaires/data/coping-rhythm-test.json";

test.beforeEach(async ({ page }) => { await seedAnalyticsConsent(page); });

async function finish(page: Page, locale: "en" | "zh", mode: "worked" | "tied" | "one-sided") {
  for (const [i, q] of data.questions.entries()) {
    const value = mode === "one-sided" ? q.options.find(o => o.directionId === data.profiles[Math.floor(i / 6)].directionIds[0])!.id : mode === "worked" && i === 0 ? "B" : "A";
    const radio = page.locator(`input[name="${q.id}"][value="${value}"]`);
    await expect(page.locator("[data-coping-result]")).toHaveCount(0);
    if (i === 0) await radio.press("Space");
    else await radio.click();
    await expect(radio).toHaveCount(0);
  }
  await expect(page.locator("[data-coping-pair]")).toHaveCount(4);
  const counts = mode === "one-sided" ? [6, 0, 6, 0, 6, 0, 6, 0] : mode === "worked" ? [2, 4, 3, 3, 3, 3, 3, 3] : [3, 3, 3, 3, 3, 3, 3, 3];
  await expect(page.locator("[data-coping-count]")).toHaveText(counts.map(n => `${n} / 6`));
  await expect(page.locator('[data-coping-tie="true"]')).toHaveCount(mode === "one-sided" ? 0 : mode === "worked" ? 3 : 4);
  for (const profile of data.profiles) {
    const guide = page.locator(`#take-test a[href="/${locale}/tests/explore/${data.slug}/results/${profile.id}"]`);
    await expect(guide).toBeVisible();
  }
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(n => n.id)); expect(new Set(ids).size).toBe(ids.length);
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/coping-rhythm-test`;
  test(`@release coping ${locale}: 24 answers, four paired counts, guide links and empty retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const leaks: string[] = [];
    page.on("request", r => { if (r.method() === "POST" && /AGE_RHYTHM_PC_|trying-and-assessing|present-needs-and-future-plans/.test(r.postData() ?? "")) leaks.push(r.url()); });
    await page.goto(`/${locale}/tests`);
    await page.locator("#more-tests").getByRole("link", { name: data.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(data.title[locale]);
    await expect(page).toHaveTitle(`${data.seoTitle[locale]} | FermatMind`);
    const method = page.locator('section[aria-labelledby="questionnaire-method"]');
    for (const s of data.guide) for (const p of s.paragraphs) await expect(method.getByText(p[locale], { exact: true })).toBeVisible();
    await page.locator("[data-explore-start]:visible").first().click();
    await expect(page.locator("#take-test").getByRole("radio").first()).toBeVisible({ timeout: 30000 });
    const header = await page.getByRole("banner").boundingBox(), progress = await page.locator("[data-coping-progress]").boundingBox();
    expect(header).not.toBeNull(); expect(progress).not.toBeNull();
    expect(progress!.y).toBeGreaterThanOrEqual(header!.y + header!.height);
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await expect(page.locator("#take-test [role=status]")).toContainText(zh ? "请选择" : "Choose the closer approach");
    await finish(page, locale, "worked");
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:coping-rhythm-test"))).toBeNull();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: zh ? "重新测试（清除本次回答）" : "Retake with empty answers", exact: true }).click();
    await expect(page.locator("[data-coping-result]")).toHaveCount(0);
    await expect(page.getByRole("radio").first()).not.toBeChecked(); expect(leaks).toEqual([]);
  });
  test(`@release coping ${locale}: edit, reload, language, actual leave and clear discard responses`, async ({ page }) => {
    await expectStandaloneObservationPrivacy(page, entry, data);
    const other = zh ? "en" : "zh";
    await page.goto(`/${other}/tests/explore/${data.slug}/take`);
    const first = page.locator(`#take-test input[name="${data.questions[0].id}"]`);
    await expect(first.first()).toBeVisible();
    await expect(first.and(page.getByRole("radio", { checked: true }))).toHaveCount(0);
  });
  test(`@release coping ${locale}: ties and one-sided counts, storage denial and public-only clipboard fallback`, async ({ page }) => {
    await page.addInitScript(() => {
      const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
      Storage.prototype.getItem = function(k) { if (k.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return get.call(this, k); };
      Storage.prototype.setItem = function(k, v) { if (k.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return set.call(this, k, v); };
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } });
    });
    await page.goto(entry); await page.locator("[data-explore-start]:visible").first().click();
    await expect(page.locator("#take-test").getByRole("radio").first()).toBeVisible({ timeout: 30000 });
    await finish(page, locale, "tied");
    await expect(page.locator('[data-coping-tie="true"]')).toHaveCount(4);
    await page.getByRole("button", { name: zh ? "重新测试（清除本次回答）" : "Retake with empty answers", exact: true }).click(); await finish(page, locale, "one-sided");
    await expect(page.locator('[data-coping-tie="false"]')).toHaveCount(4);
    await page.getByRole("button", { name: zh ? "复制公开解释链接" : "Copy public explanation links", exact: true }).click();
    const text = await page.getByRole("textbox", { name: zh ? "手动复制公开链接" : "Public links for manual copying" }).inputValue();
    expect(text).toBe(data.profiles.map(p => `${p.title[locale]}\nhttps://fermatmind.com${entry}/results/${p.id}`).join("\n\n"));
    expect(text).not.toMatch(/AGE_RHYTHM_PC_|6 \/ 6|0 \/ 6/);
  });
}
test("@release coping: all eight complete public guides, ten OGs and closed identities", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) {
    for (const profile of data.profiles) {
      const path = `/${locale}/tests/explore/coping-rhythm-test/results/${profile.id}`;
      expect((await page.goto(path))?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
      await expect(page).toHaveTitle(`${profile.seo.title[locale]} | FermatMind`);
      await expect(page.locator("[data-coping-count]")).toHaveCount(0);
      for (const s of profile.sections) {
        const body = page.locator(`#report-${s.id}`);
        await expect(body.locator("h2")).toHaveText(s.title[locale]);
        for (const p of s.paragraphs) await expect(body.getByText(p[locale], { exact: true })).toBeVisible();
      }
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${path}`);
    }
    for (const profile of [null, ...data.profiles]) {
      const r = await request.get(`/og/fun/coping-rhythm-test?locale=${locale}${profile ? `&portrait=${profile.id}` : ""}`);
      expect(r.status()).toBe(200); const b = await r.body(); expect(b.readUInt32BE(16)).toBe(1200); expect(b.readUInt32BE(20)).toBe(630);
    }
  }
  for (const path of ["/en/tests/explore/coping-rhythm-test/results/unknown", "/zh/tests/explore/coping-rhythm-test/results/AGE_RHYTHM_PC_001", "/en/tests/play/coping-rhythm-test"])
    expect((await request.get(path)).status()).toBe(404);
});
