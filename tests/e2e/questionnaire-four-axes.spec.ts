import { test, expect, type Page } from "@playwright/test";
import data from "../../lib/questionnaires/data/four-axes-test.json";

async function finish(page: Page, locale: "en" | "zh", mode: "worked" | "middle" | "all-high") {
  for (const [i, q] of data.questions.entries()) {
    const value = mode === "middle" ? "2" : mode === "all-high" ? "4" : String(i % 5);
    const radio = page.locator(`input[name="${q.id}"][value="${value}"]`);
    if (i === 0) { await radio.focus(); await page.keyboard.press("Space"); await expect(radio).toBeChecked(); } else await radio.check();
    await expect(page.locator("[data-four-axes-result]")).toHaveCount(0);
    await page.getByRole("button", { name: locale === "zh" ? (i === 59 ? "查看四轴位置" : "下一题") : (i === 59 ? "See four positions" : "Next"), exact: true }).click();
  }
  await expect(page.locator("[data-four-axes-part]")).toHaveCount(4);
  let paragraphs = 0;
  for (const [i, profile] of data.profiles.entries()) {
    const part = page.locator(`[data-four-axes-part="${profile.directionIds[0]}"]`);
    await expect(part.locator("h3")).toHaveText(data.directions[i].title[locale]);
    const inputs = data.questions.map((q, j) => ({ q, v: mode === "middle" ? 2 : mode === "all-high" ? 4 : j % 5 })).filter(({ q }) => q.options[0].directionId === profile.id);
    const sum = inputs.reduce((n, { q, v }) => n + (q.reverse ? 4 - v : v), 0);
    await expect(part.locator("[data-four-axes-sum]")).toContainText((locale === "zh" ? "原始和：" : "Raw sum: ") + sum);
    await expect(part.getByRole("img")).toHaveAttribute("aria-label", `${data.fourAxes.axes[i].low[locale]} ${(100 - sum / 60 * 100).toFixed(1)}%; ${data.fourAxes.axes[i].high[locale]} ${(sum / 60 * 100).toFixed(1)}%`);
    for (const section of profile.sections) {
      const body = part.locator(`[id="four-axes-report-${profile.id}-${section.id}"]`);
      await expect(body.locator("h4")).toHaveText(section.title[locale]);
      for (const paragraph of section.paragraphs) { await expect(body.getByText(paragraph[locale], { exact: true })).toBeVisible(); paragraphs++; }
    }
  }
  expect(paragraphs).toBe(48);
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(n => n.id)); expect(new Set(ids).size).toBe(ids.length);
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/four-axes-test`;
  test(`@release four-axes ${locale}: real60 answers, four bars, all48 paragraphs and empty retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const leaks: string[] = [];
    page.on("request", r => { if (r.method() === "POST" && /four-axes-\d\d|highPercent|lowPercent/.test(r.postData() ?? "")) leaks.push(r.url()); });
    await page.goto(`/${locale}/tests`);
    await page.locator("#more-tests").getByRole("link", { name: data.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(data.title[locale]);
    await expect(page).toHaveTitle(`${data.seoTitle[locale]} | FermatMind`);
    await page.screenshot({ path: test.info().outputPath(`four-axes-${locale}-entry.png`) });
    const method = page.locator('section[aria-labelledby="questionnaire-method"]');
    for (const s of data.guide) for (const p of s.paragraphs) await expect(method.getByText(p[locale], { exact: true })).toBeVisible();
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    const header = await page.getByRole("banner").boundingBox(), progress = await page.locator("[data-four-axes-progress]").boundingBox();
    expect(header).not.toBeNull(); expect(progress).not.toBeNull();
    expect(progress!.y).toBeGreaterThanOrEqual(header!.y + header!.height);
    await page.screenshot({ path: test.info().outputPath(`four-axes-${locale}-question.png`) });
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await expect(page.locator("#take-test [role=status]")).toContainText(zh ? "请选择" : "Choose how well the statement fits");
    await finish(page, locale, "worked");
    await page.screenshot({ path: test.info().outputPath(`four-axes-${locale}-result.png`) });
    await page.getByRole("button", { name: zh ? "修改回答（清除当前结果）" : "Edit answers and clear this result", exact: true }).click();
    await expect(page.locator("[data-four-axes-result]")).toHaveCount(0);
    await finish(page, locale, "worked");
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:four-axes-test"))).toBeNull();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: zh ? "重新测试（清除本次回答）" : "Retake with empty answers", exact: true }).click();
    await expect(page.locator("[data-four-axes-result]")).toHaveCount(0);
    await expect(page.getByRole("radio").first()).not.toBeChecked(); expect(leaks).toEqual([]);
  });
  test(`@release four-axes ${locale}: edit, reload, language, actual leave and clear discard responses`, async ({ page }) => {
    const start = () => page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.goto(entry); await start();
    await page.locator('input[value="2"]').check(); await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click();
    await expect(page.locator('input[value="2"]')).toBeChecked(); await page.locator('input[value="4"]').check();
    await page.reload(); await start(); await expect(page.locator('input[value="4"]')).not.toBeChecked();
    await page.locator('input[value="4"]').check();
    const other = zh ? "en" : "zh"; await page.goto(`/${other}/tests/explore/four-axes-test`);
    await page.getByRole("button", { name: other === "zh" ? "开始测试" : "Start test", exact: true }).click();
    await expect(page.locator('input[value="4"]')).not.toBeChecked();
    await page.goto(entry); await start(); await page.locator('input[value="3"]').check();
    await page.getByRole("button", { name: zh ? "退出并清除本次回答" : "Exit and clear these responses", exact: true }).click(); await start();
    await expect(page.locator('input[value="3"]')).not.toBeChecked();
    await page.locator('input[value="1"]').check(); await page.goto(`/${locale}/tests`); await page.goBack(); await start();
    await expect(page.locator('input[value="1"]')).not.toBeChecked();
  });
  test(`@release four-axes ${locale}: middle and all-high valid responses, storage denial and public-only clipboard fallback`, async ({ page }) => {
    await page.addInitScript(() => {
      const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
      Storage.prototype.getItem = function(k) { if (k.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return get.call(this, k); };
      Storage.prototype.setItem = function(k, v) { if (k.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return set.call(this, k, v); };
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } });
    });
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await finish(page, locale, "middle");
    await expect(page.locator("[data-four-axes-sum]")).toHaveCount(4);
    await page.getByRole("button", { name: zh ? "重新测试（清除本次回答）" : "Retake with empty answers", exact: true }).click(); await finish(page, locale, "all-high");
    await expect(page.locator("[data-four-axes-sum]")).toHaveCount(4);
    await page.getByRole("button", { name: zh ? "复制公开解释链接" : "Copy public explanation links", exact: true }).click();
    const text = await page.getByRole("textbox", { name: zh ? "手动复制公开链接" : "Public links for manual copying" }).inputValue();
    expect(text).toBe(data.profiles.map(p => `${p.title[locale]}\nhttps://fermatmind.com${entry}/results/${p.id}`).join("\n\n"));
    expect(text).not.toMatch(/four-axes-\d\d|highPercent|lowPercent/);
  });
}
test("@release four-axes: all eight complete public guides, ten OGs and closed identities", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) {
    for (const profile of data.profiles) {
      const path = `/${locale}/tests/explore/four-axes-test/results/${profile.id}`;
      expect((await page.goto(path))?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
      await expect(page).toHaveTitle(`${profile.seo.title[locale]} | FermatMind`);
      await expect(page.locator("[data-four-axes-sum]")).toHaveCount(0);
      for (const s of profile.sections) {
        const body = page.locator(`#report-${s.id}`);
        await expect(body.locator("h2")).toHaveText(s.title[locale]);
        for (const p of s.paragraphs) await expect(body.getByText(p[locale], { exact: true })).toBeVisible();
      }
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${path}`);
    }
    for (const profile of [null, ...data.profiles]) {
      const r = await request.get(`/og/fun/four-axes-test?locale=${locale}${profile ? `&portrait=${profile.id}` : ""}`);
      expect(r.status()).toBe(200); const b = await r.body(); expect(b.readUInt32BE(16)).toBe(1200); expect(b.readUInt32BE(20)).toBe(630);
    }
  }
  for (const path of ["/en/tests/explore/four-axes-test/results/unknown", "/zh/tests/explore/four-axes-test/results/four-axes-01", "/en/tests/play/four-axes-test"])
    expect((await request.get(path)).status()).toBe(404);
});
