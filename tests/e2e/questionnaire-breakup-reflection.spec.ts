import { test, expect, type Page } from "@playwright/test";
import data from "../../lib/questionnaires/data/breakup-reflection-test.json";

const values = [4, 2, 3, 5, 2, 4, 3, 4, 2, 3, 5, 1, 5, 4, 3, 2, 1, 2, 1, 2, 3, 4, 5, 1];
const means = ["3.3333", "3.0000", "2.8333", "2.6667"];
async function finish(page: Page, locale: "en" | "zh", mode: "worked" | "all-na" | "one-na") {
  for (const [i, q] of data.questions.entries()) {
    const value = mode === "all-na" || (mode === "one-na" && i === 0) ? "na" : String(values[i]);
    const radio = page.locator(`input[name="${q.id}"][value="${value}"]`);
    if (i === 0) { await radio.focus(); await page.keyboard.press("Space"); await expect(radio).toBeChecked(); }
    else await radio.check();
    await expect(page.locator("[data-breakup-review-result]")).toHaveCount(0);
    await page.getByRole("button", { name: locale === "zh" ? (i === 23 ? "查看完整结果" : "下一题") : (i === 23 ? "See full result" : "Next"), exact: true }).click();
  }
  await expect(page.locator("[data-breakup-review-part]")).toHaveCount(4);
  let paragraphs = 0;
  for (const [i, profile] of data.profiles.entries()) {
    const part = page.locator(`[data-breakup-review-part="${profile.directionIds[0]}"]`);
    await expect(part.locator("h3")).toHaveText(data.directions[i].title[locale]);
    await expect(part.locator("[data-breakup-review-mean]")).toContainText(mode === "all-na" || (mode === "one-na" && i === 0)
      ? (locale === "zh" ? "资料不足" : "Insufficient information") : means[i] + " / 5");
    for (const section of profile.sections) {
      const body = part.locator(`[id="breakup-review-report-${profile.id}-${section.id}"]`);
      await expect(body.locator("h4")).toHaveText(section.title[locale]);
      for (const paragraph of section.paragraphs) { await expect(body.getByText(paragraph[locale], { exact: true })).toBeVisible(); paragraphs++; }
    }
  }
  expect(paragraphs).toBe(64);
  await expect(page.locator("[data-facet-score]")).toHaveCount(0);
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(n => n.id));
  expect(new Set(ids).size).toBe(ids.length);
}

for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/breakup-reflection-test`;
  test(`@release breakup ${locale}: 24 actual answers, four source means, 64 paragraphs and retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const leaks: string[] = [];
    page.on("request", r => { if (r.method() === "POST" && /BREAKUP_LK_|communication-review|external-pressure-review/.test(r.postData() ?? "")) leaks.push(r.url()); });
    await page.goto(`/${locale}/tests`);
    await page.locator("#more-tests").getByRole("link", { name: data.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(data.title[locale]);
    await expect(page).toHaveTitle(`${data.seoTitle[locale]} | FermatMind`);
    const method = page.locator('section[aria-labelledby="questionnaire-method"]');
    await expect(method.locator("p")).toHaveCount(23);
    for (const s of data.guide) for (const p of s.paragraphs) await expect(method.getByText(p[locale], { exact: true })).toBeVisible();
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    const heading = await page.getByRole("heading", { level: 2, name: data.questions[0].prompt[locale], exact: true }).boundingBox();
    expect(heading).not.toBeNull(); expect(heading!.y).toBeGreaterThanOrEqual(0); expect(heading!.y).toBeLessThan(420);
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    await finish(page, locale, "worked");
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:breakup-reflection-test"))).toBeNull();
    await expect(page.getByRole("link", { name: zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions" })).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click();
    await expect(page.locator("[data-breakup-review-result]")).toHaveCount(0);
    await expect(page.getByRole("radio").first()).not.toBeChecked(); expect(leaks).toEqual([]);
  });
  test(`@release breakup ${locale}: optional tab draft, reload, edit, locale and explicit clear`, async ({ page }) => {
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.locator('input[value="2"]').check(); await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await page.reload();
    await page.getByRole("button", { name: zh ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click();
    await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click();
    await expect(page.locator('input[value="2"]')).toBeChecked(); await page.locator('input[value="4"]').check();
    const other = zh ? "en" : "zh";
    await page.goto(`/${other}/tests/explore/breakup-reflection-test`);
    await page.getByRole("button", { name: other === "zh" ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click();
    await page.getByRole("button", { name: other === "zh" ? "上一题" : "Back", exact: true }).click();
    await expect(page.locator('input[value="4"]')).toBeChecked();
    await page.getByRole("button", { name: other === "zh" ? "退出并清除本次进度" : "Exit and clear this attempt", exact: true }).click();
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:breakup-reflection-test"))).toBeNull();
  });
  test(`@release breakup ${locale}: all NA and partial NA, denied persistence and private-safe copy`, async ({ page }) => {
    await page.addInitScript(() => {
      const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
      Storage.prototype.getItem = function(k) { if (k.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return get.call(this, k); };
      Storage.prototype.setItem = function(k, v) { if (k.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return set.call(this, k, v); };
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } });
    });
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.getByRole("checkbox").check(); await expect(page.getByRole("status")).toContainText(zh ? "无法保存" : "could not save");
    await finish(page, locale, "all-na");
    await expect(page.locator("[data-breakup-review-next-steps] h2")).toContainText(zh ? "本次作答已结束" : "This attempt is finished");
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click(); await finish(page, locale, "one-na");
    await page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click();
    const text = await page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue();
    expect(text).toBe(`${data.title[locale]}\nhttps://fermatmind.com${entry}`);
  });
}

test("@release breakup: all eight public full guides, ten OG images and closed identities", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) {
    for (const profile of data.profiles) {
      const path = `/${locale}/tests/explore/breakup-reflection-test/results/${profile.id}`;
      expect((await page.goto(path))?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
      await expect(page).toHaveTitle(`${profile.seo.title[locale]} | FermatMind`);
      await expect(page.locator("[data-breakup-review-mean]")).toHaveCount(0);
      for (const s of profile.sections) {
        const body = page.locator(`#report-${s.id}`);
        await expect(body.locator("h2")).toHaveText(s.title[locale]);
        for (const p of s.paragraphs) await expect(body.getByText(p[locale], { exact: true })).toBeVisible();
      }
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${path}`);
      await expect(page.getByRole("link", { name: locale === "zh" ? "免费开始完整测试" : "Start the full test for free", exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/breakup-reflection-test#take-test`);
    }
    for (const profile of [null, ...data.profiles]) {
      const r = await request.get(`/og/fun/breakup-reflection-test?locale=${locale}${profile ? `&portrait=${profile.id}` : ""}`);
      expect(r.status()).toBe(200); const b = await r.body(); expect(b.readUInt32BE(16)).toBe(1200); expect(b.readUInt32BE(20)).toBe(630);
    }
  }
  for (const path of ["/en/tests/explore/breakup-reflection-test/results/unknown", "/zh/tests/explore/breakup-reflection-test/results/BREAKUP_LK_001", "/en/tests/play/breakup-reflection-test"])
    expect((await request.get(path)).status()).toBe(404);
});
