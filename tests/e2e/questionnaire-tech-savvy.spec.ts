import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/tech-savvy.json", "utf8")) as Questionnaire;
test.beforeEach(async ({ page }) => { await page.addInitScript(() => localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied", updatedAt: new Date().toISOString() }))); });
async function visibleQuestion(page: Page) {
  await expect.poll(() => page.evaluate(() => {
    const h = document.querySelector("#take-test h2"), p = document.querySelector("#take-test progress"), count = p?.previousElementSibling;
    const header = document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
    return !!h && !!p && !!count && [h, p, count].every(e => e.getBoundingClientRect().top >= header) && document.documentElement.scrollWidth <= innerWidth;
  })).toBe(true);
}
async function finish(page: Page, locale: "en" | "zh", values: string[]) {
  for (const [i, q] of quiz.questions.entries()) {
    if (i === 1) await visibleQuestion(page);
    const radio = page.locator(`input[name="${q.id}"][value="${values[i]}"]`);
    if (i === 0) { await radio.focus(); await radio.press("Space"); await expect(radio).toBeChecked(); } else await radio.check();
    await expect(page.locator("[data-tech-confidence-report]")).toHaveCount(0);
    await page.getByRole("button", { name: i === 5 ? (locale === "zh" ? "查看完整结果" : "See full result") : (locale === "zh" ? "下一题" : "Next"), exact: true }).click();
  }
  const numeric = values.filter(v => v !== "na").map(Number), sum = numeric.reduce((a, b) => a + b, 0), count = numeric.length;
  await expect(page.locator("[data-tech-confidence-report]")).toHaveCount(1); await expect(page.locator("[data-tech-confidence-sum]")).toHaveText(count ? String(sum) : "—");
  await expect(page.locator("[data-tech-confidence-count]")).toHaveText(`${count} / 6`); await expect(page.locator("[data-tech-confidence-mean]")).toHaveText(count < 4 ? (locale === "zh" ? "不计算" : "Not calculated") : `${(Math.round(sum / count * 10) / 10).toFixed(1)} / 5`);
  await expect(page.locator("[data-tech-confidence-insufficient]")).toHaveCount(count < 4 ? 1 : 0);
  const report = page.locator("[data-tech-confidence-report]"); await expect(report.locator("h4")).toHaveCount(6);
  for (const s of quiz.profiles[0].sections) for (const p of s.paragraphs) await expect(report).toContainText(p[locale]);
  await report.locator("summary").click();
  for (const [i, q] of quiz.questions.entries()) await expect(report.locator(`[data-tech-confidence-answer="${q.id}"]`)).toContainText(q.options.find(o => o.id === values[i])!.label[locale]);
  await report.locator("summary").click(); await expect(page.getByRole("heading", { name: locale === "zh" ? "本次自评已结束，下一步由你选择" : "This self-rating is finished. Choose what comes next.", exact: true })).toBeVisible();
  expect(new URL(page.url()).search).toBe(""); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(n => n.id)); expect(new Set(ids).size).toBe(ids.length);
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/tech-savvy`;
  test(`@release tech-savvy ${locale}: directory, six ratings, threshold4, unscored responses and continuous FULL`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); const leaked: string[] = [];
    page.on("request", r => { if (r.method() === "POST" && /TSC_\d\d|answers.*tech-savvy|tech-savvy.*mean/.test(r.postData() ?? "")) leaked.push(r.url()); });
    await page.goto(`/${locale}/tests`); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]); await expect(page).toHaveTitle(`${quiz.seoTitle[locale]} | FermatMind`);
    await expect(page.locator("#take-test").getByText(quiz.instructions![locale], { exact: true })).toBeVisible();
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await visibleQuestion(page);
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    const patterns = [Array(6).fill("1"), Array(6).fill("3"), Array(6).fill("5"), ["2", "3", "4", "4", "5", "na"], ["4", "4", "4", "4", "na", "na"], ["4", "4", "4", "na", "na", "na"], Array(6).fill("na")];
    for (const [i, values] of patterns.entries()) { if (i) { await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click(); await expect(page.locator("[data-tech-confidence-report]")).toHaveCount(0); } await finish(page, locale, values); }
    expect(leaked).toEqual([]); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:tech-savvy"))).toBeNull();
  });
  test(`@release tech-savvy ${locale}: optional draft reload/language/edit/clear and public guide`, async ({ page }) => {
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await expect(page.getByRole("radio")).toHaveCount(6); await page.locator('input[name="TSC_01"][value="na"]').check(); await page.getByRole("checkbox").check(); await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await page.reload(); await page.getByRole("button", { name: zh ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click(); await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[value="na"]')).toBeChecked(); await page.locator('input[value="2"]').check();
    const other = zh ? "en" : "zh"; await page.goto(`/${other}/tests/explore/tech-savvy`); await page.getByRole("button", { name: other === "zh" ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click(); await page.getByRole("button", { name: other === "zh" ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[value="2"]')).toBeChecked();
    await page.getByRole("button", { name: other === "zh" ? "退出并清除本次进度" : "Exit and clear this attempt", exact: true }).click(); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:tech-savvy"))).toBeNull();
    await expect(page.locator("[data-tech-confidence-report]")).toHaveCount(0); await expect(page.locator("#questionnaire-results").locator("..").getByRole("link")).toHaveCount(1);
  });
  test(`@release tech-savvy ${locale}: storage/clipboard denial, full result and public-only copy`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); await page.addInitScript(() => {
      const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
      Storage.prototype.getItem = function(k) { if (k.startsWith("fm_questionnaire_draft:")) throw Error("synthetic denial"); return get.call(this, k); };
      Storage.prototype.setItem = function(k, v) { if (k.startsWith("fm_questionnaire_draft:")) throw Error("synthetic denial"); return set.call(this, k, v); };
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw Error("synthetic clipboard denial"); } } });
    });
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await page.getByRole("checkbox").check(); await expect(page.getByRole("status")).toContainText(zh ? "无法保存" : "could not save"); await finish(page, locale, ["2", "3", "4", "4", "5", "na"]);
    await page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click(); const copy = await page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue();
    expect(copy.split("\n")).toEqual([quiz.title[locale], zh ? "完整自我观察" : "Complete self-reflection", `https://fermatmind.com${entry}`]); expect(copy).not.toMatch(/TSC_|answers|3\.6|18|[?&]score|mean|percentile/);
  });
}
test("@release tech-savvy all4 native pages/FULL/SEO/OG and no ability-type URLs", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) {
    const profile = quiz.profiles[0], path = `/${locale}/tests/explore/tech-savvy/results/${profile.id}`; expect((await page.goto(path))?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]); await expect(page).toHaveTitle(`${profile.seo!.title[locale]} | FermatMind`); await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", profile.seo!.description[locale]);
    for (const s of profile.sections) { const own = page.locator(`#report-${s.id}`); await expect(own.getByRole("heading", { level: 2 })).toHaveText(s.title[locale]); for (const text of s.paragraphs) await expect(own).toContainText(text[locale]); }
    await expect(page.locator("[data-tech-confidence-mean], [data-tech-confidence-answer]")).toHaveCount(0); await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${path}`);
    for (const [lang, l] of [["en", "en"], ["zh-CN", "zh"], ["x-default", "en"]]) await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveAttribute("href", `https://fermatmind.com/${l}/tests/explore/tech-savvy/results/${profile.id}`);
    await expect(page.getByRole("link", { name: locale === "zh" ? "免费开始完整测试" : "Start the full test for free", exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/tech-savvy#take-test`);
    for (const p of [null, profile]) {
      const image = `/og/fun/tech-savvy?locale=${locale}${p ? `&portrait=${p.id}` : ""}`; const r = await request.get(image); expect(r.status()).toBe(200); expect(r.headers()["content-type"]).toContain("image/png"); const bytes = await r.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
      const privateQuery = await request.get(image + "&mean=3.6&answers=SYNTHETIC_PRIVATE"); expect(privateQuery.status()).toBe(200); expect(await privateQuery.body()).toEqual(bytes);
    }
  }
  for (const profile of ["low", "medium", "high"]) { expect((await request.get(`/en/tests/explore/tech-savvy/results/${profile}`)).status()).toBe(404); expect((await request.get(`/og/fun/tech-savvy?portrait=${profile}`)).status()).toBe(404); }
  expect((await request.get("/og/fun/tech-savvy?locale=fr")).status()).toBe(404); expect((await request.get("/en/tests/play/tech-savvy")).status()).toBe(404);
});
