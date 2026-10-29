import { test, expect, type Page } from "@playwright/test";
import quiz from "../../lib/questionnaires/data/cognitive-functions-test.json";
type Locale = "en" | "zh";
const path = (l: Locale) => `/${l}/tests/explore/cognitive-functions-test`;
const label = (l: Locale, en: string, zh: string) => l === "zh" ? zh : en;
async function consent(page: Page, l: Locale) { const b = page.getByRole("button", { name: label(l, "Decline", "拒绝"), exact: true }); if (await b.isVisible()) await b.click(); }
async function button(page: Page, l: Locale, en: string, zh: string) { if (["Start test", "Resume this tab's progress"].includes(en)) { const choice = page.locator('[data-cognitive-method="ratings32"]'); await choice.click(); } await page.getByRole("button", { name: label(l, en, zh), exact: true }).click(); }
async function finish(page: Page, l: Locale, values: string[]) {
  for (let i = 0; i < 32; i++) {
    const q = quiz.questions[i], radio = page.locator(`input[name="${q.id}"][value="${values[i]}"]`);
    if (!i) { await radio.focus(); await radio.press("Space"); } else await radio.check(); await expect(radio).toBeChecked(); await expect(page.locator("[data-cognitive-functions-report]")).toHaveCount(0);
    if (i === 1) { await button(page, l, "Back", "上一题"); await expect(page.locator(`input[name="CF_NI_01"][value="${values[0]}"]`)).toBeChecked(); await button(page, l, "Next", "下一题"); }
    await button(page, l, i === 31 ? "See full result" : "Next", i === 31 ? "查看完整结果" : "下一题");
  }
  await expect(page.locator("#take-test h2")).toBeFocused(); const report = page.locator("[data-cognitive-functions-report]"); await expect(report).toHaveCount(1); await expect(report.locator("h4")).toHaveCount(56); await expect(report.locator("[data-cognitive-full]")).toHaveCount(8);
  for (const [i, d] of quiz.directions.entries()) {
    const numeric = values.slice(i * 4, i * 4 + 4).map((v, j) => v === "na" ? null : j === 3 ? 6 - Number(v) : Number(v)).filter((v): v is number => v !== null), sum = numeric.reduce((a, b) => a + b, 0), n = numeric.length;
    await expect(report.locator(`[data-cognitive-count="${d.id}"]`)).toHaveText(`${n} / 4`); await expect(report.locator(`[data-cognitive-sum="${d.id}"]`)).toHaveText(n ? String(sum) : "—"); await expect(report.locator(`[data-cognitive-mean="${d.id}"]`)).toHaveText(n < 3 ? label(l, "Not calculated", "不计算") : `${(Math.round(sum / n * 10) / 10).toFixed(1)} / 5`);
  }
  for (const p of quiz.profiles) for (const s of p.sections) for (const text of s.paragraphs) await expect(report).toContainText(text[l]);
  await report.locator("summary").click(); for (const [i, q] of quiz.questions.entries()) await expect(report.locator(`[data-cognitive-answer="${q.id}"]`)).toContainText(q.options.find(o => o.id === values[i])!.label[l]); await report.locator("summary").click();
  if (values.every(v => v === "na")) await expect(page.getByRole("heading", { name: label(l, "This attempt is finished. Choose what comes next.", "本次作答已结束，下一步由你选择"), exact: true })).toBeVisible();
  expect(new URL(page.url()).search).toBe(""); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); const ids = await page.locator("#take-test [id]").evaluateAll(ns => ns.map(n => n.id)); expect(ids.length).toBe(new Set(ids).size);
}
for (const l of ["en", "zh"] as const) {
  test(`@release cognitive-functions-test ${l}: native hub, keyboard, eight separate means, partial data and allNA full guides`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); const leaked: string[] = []; page.on("request", r => { if (r.method() === "POST" && /CF_[A-Z]+_|"facets"|"answers"|"mean"/.test(r.postData() ?? "")) leaked.push(r.url()); });
    await page.goto(`/${l}/tests`); await consent(page, l); await page.locator("#more-tests").getByRole("link", { name: quiz.title[l], exact: true }).click(); await expect(page.locator("h1")).toHaveText(quiz.title[l]); await expect(page).toHaveTitle(`${quiz.seoTitle[l]} | FermatMind`); await button(page, l, "Start test", "开始测试");
    await button(page, l, "Next", "下一题"); await expect(page.locator("#take-test").getByRole("status")).toContainText(label(l, "Choose an option", "请选择"));
    const patterns = [Array(32).fill("5"), ["4", "3", "5", "2", "4", "na", "5", "2", "5", "5", "na", "na", "1", "2", "3", "4", ...Array(16).fill("3")], Array(32).fill("na")];
    for (const [i, values] of patterns.entries()) { if (i) await button(page, l, "Retake test", "重新测试"); await finish(page, l, values); }
    expect(leaked).toEqual([]); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:cognitive-functions-test"))).toBeNull(); await page.screenshot({ path: test.info().outputPath(`${l}-result.png`) }); await button(page, l, "Retake test", "重新测试"); await expect(page.locator("[data-cognitive-functions-report]")).toHaveCount(0); await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0);
  });
  test(`@release cognitive-functions-test ${l}: opt-in draft reload, locale switch, changed response and clear`, async ({ page }) => {
    await page.goto(path(l)); await consent(page, l); await button(page, l, "Start test", "开始测试"); await page.locator('input[name="CF_NI_01"][value="na"]').check(); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:cognitive-functions-test"))).toBeNull(); await page.getByRole("checkbox").check(); await button(page, l, "Next", "下一题"); await page.reload(); await button(page, l, "Resume this tab's progress", "恢复本标签页进度"); await expect(page.locator('input[name="CF_NI_02"]')).toHaveCount(6); await button(page, l, "Back", "上一题"); await expect(page.locator('input[name="CF_NI_01"][value="na"]')).toBeChecked(); await page.locator('input[name="CF_NI_01"][value="4"]').check();
    const other = l === "en" ? "zh" : "en"; await page.goto(path(other)); await consent(page, other); await button(page, other, "Resume this tab's progress", "恢复本标签页进度"); await button(page, other, "Back", "上一题"); await expect(page.locator('input[name="CF_NI_01"][value="4"]')).toBeChecked(); await button(page, other, "Exit and clear this attempt", "退出并清除本次进度"); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:cognitive-functions-test"))).toBeNull();
  });
  test(`@release cognitive-functions-test ${l}: public sharing contains no means or answers and all eight full guides remain available`, async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]); await page.goto(path(l)); await consent(page, l); await button(page, l, "Start test", "开始测试"); await finish(page, l, Array(32).fill("4")); await button(page, l, "Copy public entry", "复制公开入口"); expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(`${quiz.title[l]}\nhttps://fermatmind.com${path(l)}`);
    for (const profile of quiz.profiles) { await page.goto(`${path(l)}/results/${profile.id}`); await expect(page.locator("h1")).toHaveText(profile.title[l]); await expect(page.locator("[data-cognitive-mean]")).toHaveCount(0); for (const s of profile.sections) for (const t of s.paragraphs) await expect(page.locator("main").last()).toContainText(t[l]); }
  });
}
test("@release cognitive-functions-test all18 public pages, canonical/hreflang/schema and18local-font OGs", async ({ page, request }) => {
  for (const l of ["en", "zh"] as const) for (const p of [null, ...quiz.profiles]) {
    const url = p ? `${path(l)}/results/${p.id}` : path(l); await page.goto(url); await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${url}`);
    for (const [lang, other] of [["en", "en"], ["zh-CN", "zh"], ["x-default", "en"]] as const) await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveAttribute("href", `https://fermatmind.com${p ? `${path(other)}/results/${p.id}` : path(other)}`);
    for (const s of p ? p.sections : quiz.guide) for (const t of s.paragraphs) await expect(page.locator("main").last()).toContainText(t[l]); const schema = await page.locator('script[type="application/ld+json"]').allTextContents(); expect(schema.length).toBeGreaterThan(0); expect(schema.join(" ")).not.toMatch(/CF_NI_01|"answers"|"mean"|AggregateRating/);
    const image = `/og/fun/cognitive-functions-test?locale=${l}${p ? `&portrait=${p.id}` : ""}`, r = await request.get(image); expect(r.status()).toBe(200); const bytes = await r.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630); const sentinel = await request.get(image + "&mean=4.3&answers=SYNTHETIC_PRIVATE"); expect(sentinel.status()).toBe(200); expect(await sentinel.body()).toEqual(bytes);
  }
  expect((await request.get("/en/tests/explore/cognitive-functions-test/results/night-owl")).status()).toBe(404); expect((await request.get("/og/fun/cognitive-functions-test?portrait=night-owl")).status()).toBe(404); expect((await request.get("/og/fun/cognitive-functions-test?locale=fr")).status()).toBe(404);
});
