import { test, expect, type Page } from "@playwright/test";
import data from "../../lib/questionnaires/data/stress-response-patterns-test.json";

const values = [2, 3, 4, 3, 1, 2, 3, 4, 5, 4, 5, 4, 1, 1, 2, 1, 3, 3, 3, 3];
const means = ["3.0000", "2.5000", "4.5000", "1.2500", "3.0000"];
const sums = [12, 10, 18, 5, 12];
async function finish(page: Page, locale: "en" | "zh", mode: "worked" | "middle" | "all-high") {
  for (const [i, q] of data.questions.entries()) {
    const value = mode === "middle" ? "3" : mode === "all-high" ? "5" : String(values[i]);
    const radio = page.locator(`input[name="${q.id}"][value="${value}"]`);
    if (i === 0) { await radio.focus(); await page.keyboard.press("Space"); await expect(radio).toBeChecked(); } else await radio.check();
    await expect(page.locator("[data-shadow-result]")).toHaveCount(0);
    await page.getByRole("button", { name: locale === "zh" ? (i === 19 ? "查看五组记录" : "下一题") : (i === 19 ? "See five records" : "Next"), exact: true }).click();
  }
  await expect(page.locator("[data-shadow-part]")).toHaveCount(5);
  let paragraphs = 0;
  for (const [i, profile] of data.profiles.entries()) {
    const part = page.locator(`[data-shadow-part="${profile.directionIds[0]}"]`);
    await expect(part.locator("h3")).toHaveText(data.directions[i].title[locale]);
    const mean = mode === "middle" ? "3.0000" : mode === "all-high" ? "5.0000" : means[i], sum = mode === "middle" ? 12 : mode === "all-high" ? 20 : sums[i];
    await expect(part.locator("[data-shadow-mean]")).toContainText(mean + " / 5");
    await expect(part.locator("[data-shadow-sum]")).toContainText((locale === "zh" ? "原始和：" : "Raw sum: ") + sum);
    for (const section of profile.sections) {
      const body = part.locator(`[id="shadow-report-${profile.id}-${section.id}"]`);
      await expect(body.locator("h4")).toHaveText(section.title[locale]);
      for (const paragraph of section.paragraphs) { await expect(body.getByText(paragraph[locale], { exact: true })).toBeVisible(); paragraphs++; }
    }
  }
  expect(paragraphs).toBe(80);
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(n => n.id)); expect(new Set(ids).size).toBe(ids.length);
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/stress-response-patterns-test`;
  test(`@release shadow ${locale}: real20 answers, five means, all80 paragraphs and empty retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const leaks: string[] = [];
    page.on("request", r => { if (r.method() === "POST" && /SHADOW_LK_|stepping-back-and-delaying|speaking-less-and-holding-back/.test(r.postData() ?? "")) leaks.push(r.url()); });
    await page.goto(`/${locale}/tests`);
    await page.locator("#more-tests").getByRole("link", { name: data.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(data.title[locale]);
    await expect(page).toHaveTitle(`${data.seoTitle[locale]} | FermatMind`);
    const method = page.locator('section[aria-labelledby="questionnaire-method"]');
    for (const s of data.guide) for (const p of s.paragraphs) await expect(method.getByText(p[locale], { exact: true })).toBeVisible();
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    const header = await page.getByRole("banner").boundingBox(), progress = await page.locator("[data-shadow-progress]").boundingBox();
    expect(header).not.toBeNull(); expect(progress).not.toBeNull();
    expect(progress!.y).toBeGreaterThanOrEqual(header!.y + header!.height);
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await expect(page.locator("#take-test [role=status]")).toContainText(zh ? "请选择" : "Choose how well the statement fits");
    await finish(page, locale, "worked");
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:stress-response-patterns-test"))).toBeNull();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: zh ? "重新测试（清除本次回答）" : "Retake with empty answers", exact: true }).click();
    await expect(page.locator("[data-shadow-result]")).toHaveCount(0);
    await expect(page.getByRole("radio").first()).not.toBeChecked(); expect(leaks).toEqual([]);
  });
  test(`@release shadow ${locale}: edit, reload, language, actual leave and clear discard responses`, async ({ page }) => {
    const start = () => page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.goto(entry); await start();
    await page.locator('input[value="2"]').check(); await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click();
    await expect(page.locator('input[value="2"]')).toBeChecked(); await page.locator('input[value="4"]').check();
    await page.reload(); await start(); await expect(page.locator('input[value="4"]')).not.toBeChecked();
    await page.locator('input[value="5"]').check();
    const other = zh ? "en" : "zh"; await page.goto(`/${other}/tests/explore/stress-response-patterns-test`);
    await page.getByRole("button", { name: other === "zh" ? "开始测试" : "Start test", exact: true }).click();
    await expect(page.locator('input[value="5"]')).not.toBeChecked();
    await page.goto(entry); await start(); await page.locator('input[value="3"]').check();
    await page.getByRole("button", { name: zh ? "退出并清除本次回答" : "Exit and clear these responses", exact: true }).click(); await start();
    await expect(page.locator('input[value="3"]')).not.toBeChecked();
    await page.locator('input[value="1"]').check(); await page.goto(`/${locale}/tests`); await page.goBack(); await start();
    await expect(page.locator('input[value="1"]')).not.toBeChecked();
  });
  test(`@release shadow ${locale}: middle and all-high valid responses, storage denial and public-only clipboard fallback`, async ({ page }) => {
    await page.addInitScript(() => {
      const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
      Storage.prototype.getItem = function(k) { if (k.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return get.call(this, k); };
      Storage.prototype.setItem = function(k, v) { if (k.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return set.call(this, k, v); };
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } });
    });
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await finish(page, locale, "middle");
    await expect(page.locator("[data-shadow-sum]")).toHaveCount(5);
    await page.getByRole("button", { name: zh ? "重新测试（清除本次回答）" : "Retake with empty answers", exact: true }).click(); await finish(page, locale, "all-high");
    await expect(page.locator("[data-shadow-sum]")).toHaveCount(5);
    await page.getByRole("button", { name: zh ? "复制公开解释链接" : "Copy public explanation links", exact: true }).click();
    const text = await page.getByRole("textbox", { name: zh ? "手动复制公开链接" : "Public links for manual copying" }).inputValue();
    expect(text).toBe(data.profiles.map(p => `${p.title[locale]}\nhttps://fermatmind.com${entry}/results/${p.id}`).join("\n\n"));
    expect(text).not.toMatch(/SHADOW_LK_|5\.0000|3\.0000/);
  });
}
test("@release shadow: all ten complete public guides, twelve OGs and closed identities", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) {
    for (const profile of data.profiles) {
      const path = `/${locale}/tests/explore/stress-response-patterns-test/results/${profile.id}`;
      expect((await page.goto(path))?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
      await expect(page).toHaveTitle(`${profile.seo.title[locale]} | FermatMind`);
      await expect(page.locator("[data-shadow-mean]")).toHaveCount(0);
      for (const s of profile.sections) {
        const body = page.locator(`#report-${s.id}`);
        await expect(body.locator("h2")).toHaveText(s.title[locale]);
        for (const p of s.paragraphs) await expect(body.getByText(p[locale], { exact: true })).toBeVisible();
      }
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${path}`);
    }
    for (const profile of [null, ...data.profiles]) {
      const r = await request.get(`/og/fun/stress-response-patterns-test?locale=${locale}${profile ? `&portrait=${profile.id}` : ""}`);
      expect(r.status()).toBe(200); const b = await r.body(); expect(b.readUInt32BE(16)).toBe(1200); expect(b.readUInt32BE(20)).toBe(630);
    }
  }
  for (const path of ["/en/tests/explore/stress-response-patterns-test/results/unknown", "/zh/tests/explore/stress-response-patterns-test/results/SHADOW_LK_001", "/en/tests/play/stress-response-patterns-test"])
    expect((await request.get(path)).status()).toBe(404);
});
