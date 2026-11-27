import { expectStandaloneObservationPrivacy } from "./helpers/standalone-observation-flow";
import { test, expect, type Page } from "@playwright/test";
import data from "../../lib/questionnaires/data/intimacy-preference-test.json";

const values = [4, 3, 5, 2, 4, 3, 5, 5, 5, 5, 5, 4, 3, 3, 3, 3, 3, 3, 1, 2, 3, 4, 5, 1];
const means = ["3.5000", "4.8333", "3.0000", "2.6667"];
async function finish(page: Page, locale: "en" | "zh", mode: "worked" | "all-na" | "one-na") {
  for (const [i, q] of data.questions.entries()) {
    const value = mode === "all-na" || (mode === "one-na" && i === 0) ? "na" : String(values[i]);
    const radio = page.locator(`input[name="${q.id}"][value="${value}"]`);
    await expect(page.locator("[data-intimacy-result]")).toHaveCount(0);
    if (i === 0) await radio.press("Space");
    else await radio.click();
    await expect(radio).toHaveCount(0);
  }
  await expect(page.locator("[data-intimacy-part]")).toHaveCount(4);
  let paragraphs = 0;
  for (const [i, profile] of data.profiles.entries()) {
    const part = page.locator(`[data-intimacy-part="${profile.directionIds[0]}"]`);
    await expect(part.locator("h3")).toHaveText(data.directions[i].title[locale]);
    await expect(part.locator("[data-intimacy-mean]")).toContainText(mode === "all-na" || (mode === "one-na" && i === 0)
      ? (locale === "zh" ? "资料不足" : "Insufficient information") : means[i] + " / 5");
    for (const section of profile.sections) {
      const body = part.locator(`[id="intimacy-report-${profile.id}-${section.id}"]`);
      await expect(body.locator("h4")).toHaveText(section.title[locale]);
      for (const paragraph of section.paragraphs) { await expect(body).toContainText(paragraph[locale]); paragraphs++; }
    }
  }
  expect(paragraphs).toBe(64);
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(n => n.id));
  expect(new Set(ids).size).toBe(ids.length);
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/intimacy-preference-test`;
  test(`@release intimacy ${locale}: real24 answers, four means, all64 paragraphs and empty retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const leaks: string[] = [];
    page.on("request", r => { if (r.method() === "POST" && /INTIMACY_LK_|physical-closeness-boundaries|relationship-visibility-privacy/.test(r.postData() ?? "")) leaks.push(r.url()); });
    await page.goto(`/${locale}/tests`);
    await page.locator("#more-tests").getByRole("link", { name: data.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(data.title[locale]);
    await expect(page).toHaveTitle(`${data.seoTitle[locale]} | FermatMind`);
    const method = page.locator('section[aria-labelledby="questionnaire-method"]');
    for (const s of data.guide) for (const p of s.paragraphs) await expect(method.getByText(p[locale], { exact: true })).toBeVisible();
    await page.locator("[data-explore-start]:visible").first().click();
    const progress = page.locator("[data-intimacy-progress]");
    await progress.scrollIntoViewIfNeeded();
    await expect(progress).toBeInViewport();
    await expect(page.locator("#take-test h2")).toBeFocused();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await expect(page.locator("#take-test [role=status]")).toContainText(zh ? "请选择" : "Choose a number");
    await finish(page, locale, "worked");
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:intimacy-preference-test"))).toBeNull();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: zh ? "重新测试（清除本次回答）" : "Retake with empty answers", exact: true }).click();
    await expect(page.locator("[data-intimacy-result]")).toHaveCount(0);
    await expect(page.getByRole("radio").first()).not.toBeChecked(); expect(leaks).toEqual([]);
  });
  test(`@release intimacy ${locale}: edit locally, then reset after refresh, language change or exit`, async ({ page }) => {
    await expectStandaloneObservationPrivacy(page, entry, data);
    const other = zh ? "en" : "zh";
    await page.goto(`/${other}/tests/explore/intimacy-preference-test/take`);
    await expect(page.locator("#take-test").getByRole("radio").first()).toBeVisible({ timeout: 30_000 });
    await expect(page.locator("#take-test").getByRole("radio", { checked: true })).toHaveCount(0);
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:intimacy-preference-test"))).toBeNull();
  });
  test(`@release intimacy ${locale}: allNA/oneNA, storage denial and public-only clipboard fallback`, async ({ page }) => {
    await page.addInitScript(() => {
      const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
      Storage.prototype.getItem = function(k) { if (k.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return get.call(this, k); };
      Storage.prototype.setItem = function(k, v) { if (k.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return set.call(this, k, v); };
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } });
    });
    await page.goto(entry); await page.locator("[data-explore-start]:visible").first().click();
    await finish(page, locale, "all-na");
    await expect(page.locator("[data-intimacy-sum]")).toHaveCount(0);
    await page.getByRole("button", { name: zh ? "重新测试（清除本次回答）" : "Retake with empty answers", exact: true }).click(); await finish(page, locale, "one-na");
    await expect(page.locator("[data-intimacy-sum]")).toHaveCount(3);
    await page.getByRole("button", { name: zh ? "复制公开解释链接" : "Copy public explanation links", exact: true }).click();
    const text = await page.getByRole("textbox", { name: zh ? "手动复制公开链接" : "Public links for manual copying" }).inputValue();
    expect(text).toBe(data.profiles.map(p => `${p.title[locale]}\nhttps://fermatmind.com${entry}/results/${p.id}`).join("\n\n"));
    expect(text).not.toMatch(/INTIMACY_LK_|3\.5000|4\.8333/);
  });
}
test("@release intimacy: all eight complete public guides, ten OGs and closed identities", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) {
    for (const profile of data.profiles) {
      const path = `/${locale}/tests/explore/intimacy-preference-test/results/${profile.id}`;
      expect((await page.goto(path))?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
      await expect(page).toHaveTitle(`${profile.seo.title[locale]} | FermatMind`);
      await expect(page.locator("[data-intimacy-mean]")).toHaveCount(0);
      for (const s of profile.sections) {
        const body = page.locator(`#report-${s.id}`);
        await expect(body.locator("h2")).toHaveText(s.title[locale]);
        for (const p of s.paragraphs) await expect(body).toContainText(p[locale]);
      }
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${path}`);
    }
    for (const profile of [null, ...data.profiles]) {
      const r = await request.get(`/og/fun/intimacy-preference-test?locale=${locale}${profile ? `&portrait=${profile.id}` : ""}`);
      expect(r.status()).toBe(200); const b = await r.body(); expect(b.readUInt32BE(16)).toBe(1200); expect(b.readUInt32BE(20)).toBe(630);
    }
  }
  for (const path of ["/en/tests/explore/intimacy-preference-test/results/unknown", "/zh/tests/explore/intimacy-preference-test/results/INTIMACY_LK_001", "/en/tests/play/intimacy-preference-test"])
    expect((await request.get(path)).status()).toBe(404);
});
