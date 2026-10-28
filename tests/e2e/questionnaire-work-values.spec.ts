import { test, expect, type Page } from "@playwright/test";
import quiz from "../../lib/questionnaires/data/values-assessment.json";
type Locale = "en" | "zh";
const path = (l: Locale) => `/${l}/tests/explore/values-assessment`;
const label = (l: Locale, en: string, zh: string) => l === "zh" ? zh : en;
const witnesses = Object.fromEntries(["sole", "all-ten"].map(kind => {
  const values = quiz.questions.map(q => (kind === "sole" ? q.options.find(o => o.directionId === "achievement") ?? q.options.find(o => o.directionId !== "achievement")! : q.options[0]).id);
  const counts = Object.fromEntries(quiz.directions.map(d => [d.id, 0]));
  for (const [i, q] of quiz.questions.entries()) counts[q.options.find(o => o.id === values[i])!.directionId]++;
  const highest = Math.max(...Object.values(counts)), profiles = quiz.profiles.filter(p => counts[p.id] === highest);
  return [kind, { values, counts, profiles }];
}));
async function consent(page: Page, l: Locale) { const b = page.getByRole("button", { name: label(l, "Decline", "拒绝"), exact: true }); if (await b.isVisible()) await b.click(); }
async function button(page: Page, l: Locale, en: string, zh: string) { await page.getByRole("button", { name: label(l, en, zh), exact: true }).click(); }
async function finish(page: Page, l: Locale, kind: "sole" | "all-ten") {
  const sample = witnesses[kind];
  for (let i = 0; i < 30; i++) {
    const radio = page.locator(`input[name="${quiz.questions[i].id}"][value="${sample.values[i]}"]`);
    if (!i) { await radio.focus(); await radio.press("Space"); } else await radio.check();
    await expect(radio).toBeChecked(); await expect(page.locator("[data-work-value]")).toHaveCount(0);
    if (i === 1) { await button(page, l, "Back", "上一题"); await expect(page.locator(`input[name="WV_01"][value="${sample.values[0]}"]`)).toBeChecked(); await button(page, l, "Next", "下一题"); }
    await button(page, l, i === 29 ? "See full result" : "Next", i === 29 ? "查看完整结果" : "下一题");
  }
  await expect(page.locator("#take-test h2")).toHaveText(quiz.resultHeading[l]); await expect(page.locator("#take-test h2")).toBeFocused();
  await expect(page.locator("[data-work-value]")).toHaveCount(10);
  for (const d of quiz.directions) {
    const row = page.locator(`[data-work-value="${d.id}"]`);
    await expect(row.locator("td").nth(0)).toHaveText(`${sample.counts[d.id]} / 12`);
    await expect(row.locator("td").nth(1)).toHaveText(String(1 + Object.values(sample.counts).filter(c => c > sample.counts[d.id]).length));
  }
  await expect(page.locator("[data-work-value-reading]")).toHaveCount(sample.profiles.length);
  const text = await page.locator("#take-test").innerText();
  for (const p of sample.profiles) for (const s of p.sections) for (const t of s.paragraphs) expect(text).toContain(t[l]);
  await page.locator("[data-work-value-review] summary").click();
  await expect(page.locator('[data-work-value-review] [data-selected="true"]')).toHaveCount(30);
  await expect(page.locator('[data-work-value-review] [data-selected="false"]')).toHaveCount(90);
  for (const [i, q] of quiz.questions.entries()) await expect(page.locator("[data-work-value-review] ol > li").nth(i).locator('[data-selected="true"]')).toContainText(q.options.find(o => o.id === sample.values[i])!.label[l]);
  await page.locator("[data-work-value-review] summary").click();
  expect(new URL(page.url()).search).toBe(""); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const ids = await page.locator("#take-test [id]").evaluateAll(ns => ns.map(n => n.id)); expect(ids.length).toBe(new Set(ids).size);
}
for (const l of ["en", "zh"] as const) {
  test(`@release work-values ${l}: native entry, keyboard, sole lead, all-ten tie with ten full readings and retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); const leaked: string[] = [];
    page.on("request", r => { if (r.method() === "POST" && /WV_\d\d|"answers"|"counts"|"ranks"/.test(r.postData() ?? "")) leaked.push(r.url()); });
    await page.goto(`/${l}/tests`); await consent(page, l); await page.locator("#more-tests").getByRole("link", { name: quiz.title[l], exact: true }).click();
    await expect(page.locator("h1")).toHaveText(quiz.title[l]); await expect(page).toHaveTitle(`${quiz.seoTitle[l]} | FermatMind`);
    await button(page, l, "Start test", "开始测试"); await button(page, l, "Next", "下一题"); await expect(page.getByRole("status")).toContainText(label(l, "Choose an option", "请选择"));
    await finish(page, l, "sole"); await page.locator("#take-test h2").scrollIntoViewIfNeeded(); await page.screenshot({ path: test.info().outputPath(`${l}-result.png`) });
    await button(page, l, "Retake test", "重新测试"); await expect(page.locator('[data-work-value]')).toHaveCount(0); await finish(page, l, "all-ten");
    expect(leaked).toEqual([]); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:values-assessment"))).toBeNull();
    await button(page, l, "Retake test", "重新测试"); await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0);
  });
  test(`@release work-values ${l}: opt-in draft, reload, locale switch, changed answer and clear`, async ({ page }) => {
    await page.goto(path(l)); await consent(page, l); await button(page, l, "Start test", "开始测试"); await page.locator('input[name="WV_01"][value="a"]').check();
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:values-assessment"))).toBeNull(); await page.getByRole("checkbox").check(); await button(page, l, "Next", "下一题"); await page.reload(); await button(page, l, "Resume this tab's progress", "恢复本标签页进度");
    await expect(page.locator('input[name="WV_02"]')).toHaveCount(4); await button(page, l, "Back", "上一题"); await expect(page.locator('input[name="WV_01"][value="a"]')).toBeChecked(); await page.locator('input[name="WV_01"][value="b"]').check();
    const other = l === "en" ? "zh" : "en"; await page.goto(path(other)); await consent(page, other); await button(page, other, "Resume this tab's progress", "恢复本标签页进度"); await button(page, other, "Back", "上一题"); await expect(page.locator('input[name="WV_01"][value="b"]')).toBeChecked();
    await button(page, other, "Exit and clear this attempt", "退出并清除本次进度"); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:values-assessment"))).toBeNull();
  });
  test(`@release work-values ${l}: entry-only sharing and all ten full public readings`, async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]); await page.goto(path(l)); await consent(page, l); await button(page, l, "Start test", "开始测试"); await finish(page, l, "sole");
    await button(page, l, "Copy public entry", "复制公开入口"); expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(`${quiz.title[l]}\nhttps://fermatmind.com${path(l)}`);
    for (const p of quiz.profiles) {
      await page.goto(`${path(l)}/results/${p.id}`); await expect(page.locator("h1")).toHaveText(p.title[l]); await expect(page.locator("[data-work-value-review]")).toHaveCount(0);
      const text = await page.locator("main").last().innerText(); for (const s of p.sections) for (const t of s.paragraphs) expect(text).toContain(t[l]);
    }
  });
}
test("@release work-values all22publicpages, schema, canonical,22fontOGs and unknown fit identity", async ({ page, request }) => {
  for (const l of ["en", "zh"] as const) for (const p of [null, ...quiz.profiles]) {
    const url = p ? `${path(l)}/results/${p.id}` : path(l); await page.goto(url); await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${url}`);
    for (const [lang, other] of [["en", "en"], ["zh-CN", "zh"], ["x-default", "en"]] as const) await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveAttribute("href", `https://fermatmind.com${p ? `${path(other)}/results/${p.id}` : path(other)}`);
    const schema = await page.locator('script[type="application/ld+json"]').allTextContents(); expect(schema.length).toBeGreaterThan(0); expect(schema.join(" ")).not.toMatch(/WV_01|"answers"|"counts"|AggregateRating/);
    const image = `/og/fun/values-assessment?locale=${l}${p ? `&portrait=${p.id}` : ""}`, r = await request.get(image); expect(r.status()).toBe(200); const bytes = await r.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
    const sentinel = await request.get(image + "&employer=PRIVATE_EMPLOYER&answers=SYNTHETIC_PRIVATE&ranks=1,1,3"); expect(sentinel.status()).toBe(200); expect(await sentinel.body()).toEqual(bytes);
  }
  expect((await request.get("/en/tests/explore/values-assessment/results/career-fit")).status()).toBe(404); expect((await request.get("/og/fun/values-assessment?portrait=career-fit")).status()).toBe(404); expect((await request.get("/og/fun/values-assessment?locale=fr")).status()).toBe(404);
});
