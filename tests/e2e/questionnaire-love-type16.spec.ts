import { test, expect, type Page } from "@playwright/test";
import quiz from "../../lib/questionnaires/data/love-type-16.json";
type Locale = "en" | "zh";
const path = (l: Locale) => `/${l}/tests/explore/love-type-16`;
const label = (l: Locale, en: string, zh: string) => l === "zh" ? zh : en;
const sides = ["LF", "CA", "RP", "OE"];
const valuesFor = (counts: number[]) => quiz.questions.map((_, i) => sides[Math.floor(i / 8)][i % 8 < counts[Math.floor(i / 8)] ? 0 : 1]);
async function consent(page: Page, l: Locale) { const b = page.getByRole("button", { name: label(l, "Decline", "拒绝"), exact: true }); if (await b.isVisible()) await b.click(); }
async function button(page: Page, l: Locale, en: string, zh: string) { await page.getByRole("button", { name: label(l, en, zh), exact: true }).click(); }
async function finish(page: Page, l: Locale, counts: number[]) {
  const values = valuesFor(counts);
  for (let i = 0; i < 32; i++) {
    const radio = page.locator(`input[name="${quiz.questions[i].id}"][value="${values[i]}"]`);
    if (!i) { await radio.focus(); await radio.press("Space"); } else await radio.check(); await expect(radio).toBeChecked(); await expect(page.locator("[data-love-type16-result]")).toHaveCount(0);
    if (i === 1) { await button(page, l, "Back", "上一题"); await expect(page.locator(`input[name="LT_PACE_01"][value="${values[0]}"]`)).toBeChecked(); await button(page, l, "Next", "下一题"); }
    await button(page, l, i === 31 ? "See full result" : "Next", i === 31 ? "查看完整结果" : "下一题");
  }
  await expect(page.locator("#take-test h2")).toBeFocused(); const report = page.locator("[data-love-type16-result]"); await expect(report).toHaveCount(1);
  const expected = quiz.profiles.filter(p => counts.every((n, i) => n === 4 || p.id[i].toUpperCase() === sides[i][n > 4 ? 0 : 1]));
  await expect(report.locator("[data-love-profile]")).toHaveCount(expected.length); await expect(report.locator("[data-love-axis]")).toHaveCount(4);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) await expect(report.locator(`[data-love-side="${sides[i][j].toLowerCase()}"] dd`)).toHaveText(`${j ? 8 - counts[i] : counts[i]} / 8`);
  const text = await report.innerText(); for (const p of expected) for (const s of p.sections) for (const t of s.paragraphs) expect(text).toContain(t[l]);
  expect(new URL(page.url()).search).toBe(""); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const ids = await page.locator("#take-test [id]").evaluateAll(ns => ns.map(n => n.id)); expect(ids.length).toBe(new Set(ids).size);
}
for (const l of ["en", "zh"] as const) {
  test(`@release love-type-16 ${l}: native hub, keyboard, four counts, every tied full guide and retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); const leaked: string[] = []; page.on("request", r => { if (r.method() === "POST" && /LT_[A-Z]+_|"answers"|"compatibleProfileIds"|"loveType16"/.test(r.postData() ?? "")) leaked.push(r.url()); });
    await page.goto(`/${l}/tests`); await consent(page, l); await page.locator("#more-tests").getByRole("link", { name: quiz.title[l], exact: true }).click(); await expect(page.locator("h1")).toHaveText(quiz.title[l]); await expect(page).toHaveTitle(`${quiz.seoTitle[l]} | FermatMind`); await button(page, l, "Start test", "开始测试");
    await button(page, l, "Next", "下一题"); await expect(page.getByRole("status")).toContainText(label(l, "Choose an option", "请选择"));
    for (const [i, counts] of [[8, 8, 8, 8], [4, 0, 5, 4], [4, 4, 4, 4]].entries()) { if (i) await button(page, l, "Retake test", "重新测试"); await finish(page, l, counts); }
    expect(leaked).toEqual([]); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:love-type-16"))).toBeNull(); await page.locator("[data-love-axis='pace']").scrollIntoViewIfNeeded(); await page.screenshot({ path: test.info().outputPath(`${l}-result.png`) }); await button(page, l, "Retake test", "重新测试"); await expect(page.locator("[data-love-type16-result]")).toHaveCount(0); await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0);
  });
  test(`@release love-type-16 ${l}: opt-in draft reload, locale switch, changed response and clear`, async ({ page }) => {
    await page.goto(path(l)); await consent(page, l); await button(page, l, "Start test", "开始测试"); await page.locator('input[name="LT_PACE_01"][value="L"]').check(); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:love-type-16"))).toBeNull(); await page.getByRole("checkbox").check(); await button(page, l, "Next", "下一题"); await page.reload(); await button(page, l, "Resume this tab's progress", "恢复本标签页进度"); await expect(page.locator('input[name="LT_PACE_02"]')).toHaveCount(2); await button(page, l, "Back", "上一题"); await expect(page.locator('input[name="LT_PACE_01"][value="L"]')).toBeChecked(); await page.locator('input[name="LT_PACE_01"][value="F"]').check();
    const other = l === "en" ? "zh" : "en"; await page.goto(path(other)); await consent(page, other); await button(page, other, "Resume this tab's progress", "恢复本标签页进度"); await button(page, other, "Back", "上一题"); await expect(page.locator('input[name="LT_PACE_01"][value="F"]')).toBeChecked(); await button(page, other, "Exit and clear this attempt", "退出并清除本次进度"); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:love-type-16"))).toBeNull();
  });
  test(`@release love-type-16 ${l}: public sharing excludes answers/counts/codes and all16 guides remain public`, async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]); await page.goto(path(l)); await consent(page, l); await button(page, l, "Start test", "开始测试"); await finish(page, l, [0, 0, 0, 0]); await button(page, l, "Copy public entry", "复制公开入口"); expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(`${quiz.title[l]}\nhttps://fermatmind.com${path(l)}`);
    for (const profile of quiz.profiles) { await page.goto(`${path(l)}/results/${profile.id}`); await expect(page.locator("h1")).toHaveText(profile.title[l]); await expect(page.locator("[data-love-axis]")).toHaveCount(0); const text = await page.locator("main").last().innerText(); for (const s of profile.sections) for (const t of s.paragraphs) expect(text).toContain(t[l]); }
  });
}
test("@release love-type-16 public canonicals/hreflang/schema, private-query ignored OG and unknown identities", async ({ page, request }) => {
  for (const l of ["en", "zh"] as const) for (const p of [null, quiz.profiles[0], quiz.profiles[15]]) {
    const url = p ? `${path(l)}/results/${p.id}` : path(l); await page.goto(url); await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${url}`);
    for (const [lang, other] of [["en", "en"], ["zh-CN", "zh"], ["x-default", "en"]] as const) await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveAttribute("href", `https://fermatmind.com${p ? `${path(other)}/results/${p.id}` : path(other)}`);
    const schema = await page.locator('script[type="application/ld+json"]').allTextContents(); expect(schema.length).toBeGreaterThan(0); expect(schema.join(" ")).not.toMatch(/LT_PACE_01|"answers"|"counts"|AggregateRating/);
    const image = `/og/fun/love-type-16?locale=${l}${p ? `&portrait=${p.id}` : ""}`, r = await request.get(image); expect(r.status()).toBe(200); const bytes = await r.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630); const sentinel = await request.get(image + "&counts=PRIVATE&answers=SYNTHETIC_PRIVATE&compatible=LCRO"); expect(sentinel.status()).toBe(200); expect(await sentinel.body()).toEqual(bytes);
  }
  expect((await request.get("/en/tests/explore/love-type-16/results/perfect-match")).status()).toBe(404); expect((await request.get("/og/fun/love-type-16?portrait=perfect-match")).status()).toBe(404); expect((await request.get("/og/fun/love-type-16?locale=fr")).status()).toBe(404);
});
