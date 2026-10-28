import { test, expect, type Page } from "@playwright/test";
import quiz from "../../lib/questionnaires/data/mental-age.json";
type Locale = "en" | "zh";
const path = (l: Locale) => `/${l}/tests/explore/mental-age`;
const label = (l: Locale, en: string, zh: string) => l === "zh" ? zh : en;
async function consent(page: Page, l: Locale) { const b = page.getByRole("button", { name: label(l, "Decline", "拒绝"), exact: true }); if (await b.isVisible()) await b.click(); }
async function button(page: Page, l: Locale, en: string, zh: string) { await page.getByRole("button", { name: label(l, en, zh), exact: true }).click(); }
async function finish(page: Page, l: Locale, points: number[]) {
  for (let i = 0; i < 12; i++) {
    const q = quiz.questions[i], o = q.options.find(o => o.score === points[i])!, radio = page.getByRole("radio", { name: o.label[l], exact: true });
    if (!i) { await radio.focus(); await radio.press("Space"); } else await radio.check();
    await expect(radio).toBeChecked(); await expect(page.locator("[data-mental-age-report]")).toHaveCount(0);
    if (i === 1) { await button(page, l, "Back", "上一题"); await expect(page.getByRole("radio", { name: quiz.questions[0].options.find(o => o.score === points[0])!.label[l], exact: true })).toBeChecked(); await button(page, l, "Next", "下一题"); }
    await button(page, l, i === 11 ? "See full result" : "Next", i === 11 ? "查看完整结果" : "下一题");
  }
  await expect(page.locator("#take-test h2")).toBeFocused();
  const sum = points.reduce((a, b) => a + b, 0);
  await expect(page.locator("[data-mental-age-value]")).toHaveText(`${18 + 2 * sum}${l === "zh" ? "岁" : " years"}`); await expect(page.locator("[data-mental-age-sum]")).toHaveText(`${sum} / 36`);
  const report = page.locator("[data-mental-age-report]"); await expect(report.locator("h4")).toHaveCount(8);
  for (const s of quiz.profiles[0].sections) for (const p of s.paragraphs) await expect(report).toContainText(p[l]);
  await report.locator("summary").click(); for (const [i, q] of quiz.questions.entries()) await expect(report.locator(`[data-mental-age-answer="${q.id}"]`)).toContainText(q.options.find(o => o.score === points[i])!.label[l]); await report.locator("summary").click();
  expect(new URL(page.url()).search).toBe(""); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const ids = await page.locator("#take-test [id]").evaluateAll(ns => ns.map(n => n.id)); expect(ids.length).toBe(new Set(ids).size);
}
for (const l of ["en", "zh"] as const) {
  test(`@release mental-age ${l}: native hub, keyboard, complete reports for18/54/90 and retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); const leaked: string[] = []; page.on("request", r => { if (r.method() === "POST" && /MAGE_\d|playfulAge|"answers"|"points"/.test(r.postData() ?? "")) leaked.push(r.url()); });
    await page.goto(`/${l}/tests`); await consent(page, l); await page.locator("#more-tests").getByRole("link", { name: quiz.title[l], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[l]); await expect(page).toHaveTitle(`${quiz.seoTitle[l]} | FermatMind`); await button(page, l, "Start test", "开始测试");
    await button(page, l, "Next", "下一题"); await expect(page.getByRole("status")).toContainText(label(l, "Choose an option", "请选择"));
    const patterns = [Array(12).fill(0), Array.from({ length: 12 }, (_, i) => i % 4), Array(12).fill(3)];
    for (const [i, points] of patterns.entries()) { if (i) await button(page, l, "Retake test", "重新测试"); await finish(page, l, points); }
    expect(leaked).toEqual([]); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:mental-age"))).toBeNull(); await page.screenshot({ path: test.info().outputPath(`${l}-result.png`) });
    await button(page, l, "Retake test", "重新测试"); await expect(page.locator("[data-mental-age-report]")).toHaveCount(0); await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0);
  });
  test(`@release mental-age ${l}: opt-in draft, reload, locale, changed response and clearing`, async ({ page }) => {
    await page.goto(path(l)); await consent(page, l); await button(page, l, "Start test", "开始测试"); await page.locator('input[name="MAGE_01"][value="a"]').check();
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:mental-age"))).toBeNull(); await page.getByRole("checkbox").check(); await button(page, l, "Next", "下一题");
    await page.reload(); await button(page, l, "Resume this tab's progress", "恢复本标签页进度"); await expect(page.locator('input[name="MAGE_02"]')).toHaveCount(4); await button(page, l, "Back", "上一题");
    await expect(page.locator('input[name="MAGE_01"][value="a"]')).toBeChecked(); await page.locator('input[name="MAGE_01"][value="d"]').check();
    const other = l === "en" ? "zh" : "en"; await page.goto(path(other)); await consent(page, other); await button(page, other, "Resume this tab's progress", "恢复本标签页进度"); await button(page, other, "Back", "上一题"); await expect(page.locator('input[name="MAGE_01"][value="d"]')).toBeChecked();
    await button(page, other, "Exit and clear this attempt", "退出并清除本次进度"); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:mental-age"))).toBeNull(); await expect(page.getByRole("button", { name: label(other, "Resume this tab's progress", "恢复本标签页进度"), exact: true })).toHaveCount(0);
  });
  test(`@release mental-age ${l}: optional public sharing excludes private number and choices`, async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]); await page.goto(path(l)); await consent(page, l); await button(page, l, "Start test", "开始测试"); await finish(page, l, Array(12).fill(1));
    await button(page, l, "Copy public entry", "复制公开入口"); const copied = await page.evaluate(() => navigator.clipboard.readText()); expect(copied).toBe(`${quiz.title[l]}\nhttps://fermatmind.com${path(l)}`); expect(copied).not.toMatch(/MAGE|42|sum|answer|\?/);
    const link = page.getByRole("link", { name: label(l, "Read the complete public guide without your personal age", "阅读不含个人年龄的公开完整指南"), exact: true }); await link.click(); await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.profiles[0].title[l]); await expect(page.locator("[data-mental-age-value]")).toHaveCount(0);
  });
}
test("@release mental-age public bilingual pages, schema, all OGs and privacy query immunity", async ({ page, request }) => {
  for (const l of ["en", "zh"] as const) {
    for (const p of [null, quiz.profiles[0]]) {
      const url = p ? `${path(l)}/results/${p.id}` : path(l); await page.goto(url);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${url}`);
      for (const [lang, other] of [["en", "en"], ["zh-CN", "zh"], ["x-default", "en"]] as const) await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveAttribute("href", `https://fermatmind.com${p ? `${path(other)}/results/${p.id}` : path(other)}`);
      const expected = p ? p.sections : quiz.guide; for (const s of expected) for (const t of s.paragraphs) await expect(page.locator("main").last()).toContainText(t[l]);
      const schema = await page.locator('script[type="application/ld+json"]').allTextContents(); expect(schema.length).toBeGreaterThan(0); expect(schema.join(" ")).not.toMatch(/MAGE_01|playfulAge|AggregateRating/);
      const image = `/og/fun/mental-age?locale=${l}${p ? `&portrait=${p.id}` : ""}`, response = await request.get(image); expect(response.status()).toBe(200); const bytes = await response.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
      const privateQuery = await request.get(image + "&age=42&answers=SYNTHETIC_PRIVATE"); expect(privateQuery.status()).toBe(200); expect(await privateQuery.body()).toEqual(bytes);
    }
  }
  expect((await request.get("/en/tests/explore/mental-age/results/young")).status()).toBe(404); expect((await request.get("/og/fun/mental-age?portrait=young")).status()).toBe(404); expect((await request.get("/og/fun/mental-age?locale=fr")).status()).toBe(404);
});
