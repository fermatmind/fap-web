import { test, expect, type Page } from "@playwright/test";
import quiz from "../../lib/questionnaires/data/eq-dashboard.json";
type Locale = "en" | "zh";
type Mode = "mixed" | "unscored" | "high";
const path = (l: Locale) => `/${l}/tests/explore/eq-dashboard`;
const label = (l: Locale, en: string, zh: string) => l === "zh" ? zh : en;
const patterns: Record<string, string[]> = {
  joy: ["1", "2", "3", "na", "na"], trust: ["1", "2", "na", "na", "na"], fear: ["1", "1", "1", "1", "1"], surprise: ["5", "5", "5", "5", "5"],
  sadness: ["2", "4", "3", "na", "na"], disgust: ["4", "3", "4", "na", "2"], anger: ["3", "4", "2", "3", "5"], anticipation: ["1", "3", "5", "na", "na"],
};
const samples = Object.fromEntries((["mixed", "unscored", "high"] as const).map(mode => {
  const seen: Record<string, number> = {}, values = quiz.questions.map(q => {
    const id = q.options[0].directionId, item = seen[id] ?? 0; seen[id] = item + 1;
    return mode === "unscored" ? "na" : mode === "high" ? "5" : patterns[id][item];
  });
  const scores = Object.fromEntries(quiz.directions.map(d => {
    const ratings = quiz.questions.flatMap((q, i) => q.options[0].directionId === d.id && values[i] !== "na" ? [Number(values[i])] : []);
    return [d.id, { rated: ratings.length, mean: ratings.length < 3 ? null : Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length * 10) / 10 }];
  }));
  return [mode, { values, scores }];
}));
async function consent(page: Page, l: Locale) { const b = page.getByRole("button", { name: label(l, "Decline", "拒绝"), exact: true }); if (await b.isVisible()) await b.click(); }
async function button(page: Page, l: Locale, en: string, zh: string) { await page.getByRole("button", { name: label(l, en, zh), exact: true }).click(); }
async function finish(page: Page, l: Locale, mode: Mode) {
  const sample = samples[mode];
  for (let i = 0; i < 40; i++) {
    const radio = page.locator(`input[name="${quiz.questions[i].id}"][value="${sample.values[i]}"]`);
    if (!i) { await radio.focus(); await radio.press("Space"); } else await radio.check();
    await expect(radio).toBeChecked(); await expect(page.locator("[data-emotion-mean]")).toHaveCount(0);
    if (i === 1) { await button(page, l, "Back", "上一题"); await expect(page.locator(`input[name="ED_JOY_01"][value="${sample.values[0]}"]`)).toBeChecked(); await button(page, l, "Next", "下一题"); }
    await button(page, l, i === 39 ? "See full result" : "Next", i === 39 ? "查看完整结果" : "下一题");
  }
  await expect(page.locator("#take-test h2")).toHaveText(quiz.resultHeading[l]); await expect(page.locator("#take-test h2")).toBeFocused();
  await expect(page.locator("[data-emotion-part]")).toHaveCount(8);
  expect(await page.locator("[data-emotion-overview-row]").evaluateAll(rows => rows.map(row => row.getAttribute("data-emotion-overview-row")))).toEqual(quiz.directions.map(d => d.id));
  for (const d of quiz.directions) {
    const score = sample.scores[d.id], el = page.locator(`[data-emotion-mean="${d.id}"]`);
    await expect(el).toContainText(`${score.rated}/5`);
    await expect(el).toContainText(score.mean === null ? label(l, "Insufficient observations", "观察不足") : `${score.mean.toFixed(1)} / 5`);
    const row = page.locator(`[data-emotion-overview-row="${d.id}"]`);
    await expect(row).toContainText(`${score.rated}/5`);
    await expect(row).toContainText(score.mean === null ? label(l, "Insufficient", "观察不足") : `${score.mean.toFixed(1)} / 5`);
    await expect(row.getByRole("link")).toHaveAttribute("href", `#emotion-title-${d.id}`);
  }
  const text = await page.locator("#take-test").innerText();
  for (const p of quiz.profiles) for (const s of p.sections) for (const t of s.paragraphs) expect(text).toContain(t[l]);
  await page.locator("[data-emotion-review] summary").click(); await expect(page.locator("[data-emotion-answer]")).toHaveCount(40);
  for (const [i, q] of quiz.questions.entries()) await expect(page.locator(`[data-emotion-answer="${q.id}"]`)).toContainText(q.options.find(o => o.id === sample.values[i])!.label[l]);
  await page.locator("[data-emotion-review] summary").click();
  expect(new URL(page.url()).search).toBe(""); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const ids = await page.locator("#take-test [id]").evaluateAll(ns => ns.map(n => n.id)); expect(ids.length).toBe(new Set(ids).size);
}
for (const l of ["en", "zh"] as const) {
  test(`@release emotion-dashboard ${l}: native entry, keyboard, all8 means/full readings, low/high/missing and retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); const leaked: string[] = [];
    page.on("request", r => { if (r.method() === "POST" && /ED_[A-Z]+_\d\d|"answers"|"facets"|"means"/.test(r.postData() ?? "")) leaked.push(r.url()); });
    await page.goto(`/${l}/tests`); await consent(page, l); await page.locator("#more-tests").getByRole("link", { name: quiz.title[l], exact: true }).click();
    await expect(page.locator("h1")).toHaveText(quiz.title[l]); await expect(page).toHaveTitle(`${quiz.seoTitle[l]} | FermatMind`);
    await button(page, l, "Start test", "开始测试"); await button(page, l, "Next", "下一题"); await expect(page.getByRole("status")).toContainText(label(l, "Choose an option", "请选择"));
    await finish(page, l, "mixed"); await page.locator("[data-emotion-overview]").scrollIntoViewIfNeeded(); await page.screenshot({ path: test.info().outputPath(`${l}-result.png`) });
    await page.locator('[data-emotion-overview-row="anticipation"] a').click(); await expect(page.locator("#emotion-title-anticipation")).toBeInViewport();
    await page.evaluate(() => history.replaceState(null, "", location.pathname));
    await button(page, l, "Retake test", "重新测试"); await finish(page, l, "unscored");
    await button(page, l, "Retake test", "重新测试"); await finish(page, l, "high");
    expect(leaked).toEqual([]); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:eq-dashboard"))).toBeNull();
    await button(page, l, "Retake test", "重新测试"); await expect(page.locator("[data-emotion-mean]")).toHaveCount(0); await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0);
  });
  test(`@release emotion-dashboard ${l}: opt-in draft, reload, locale switch, changed answer and clear`, async ({ page }) => {
    await page.goto(path(l)); await consent(page, l); await button(page, l, "Start test", "开始测试"); await page.locator('input[name="ED_JOY_01"][value="na"]').check();
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:eq-dashboard"))).toBeNull(); await page.getByRole("checkbox").check(); await button(page, l, "Next", "下一题"); await page.reload(); await button(page, l, "Resume this tab's progress", "恢复本标签页进度");
    await expect(page.locator('input[name="ED_TRUST_01"]')).toHaveCount(6); await button(page, l, "Back", "上一题"); await expect(page.locator('input[name="ED_JOY_01"][value="na"]')).toBeChecked(); await page.locator('input[name="ED_JOY_01"][value="4"]').check();
    const other = l === "en" ? "zh" : "en"; await page.goto(path(other)); await consent(page, other); await button(page, other, "Resume this tab's progress", "恢复本标签页进度"); await button(page, other, "Back", "上一题"); await expect(page.locator('input[name="ED_JOY_01"][value="4"]')).toBeChecked();
    await button(page, other, "Exit and clear this attempt", "退出并清除本次进度"); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:eq-dashboard"))).toBeNull();
  });
  test(`@release emotion-dashboard ${l}: entry-only sharing and all eight full public readings`, async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]); await page.goto(path(l)); await consent(page, l); await button(page, l, "Start test", "开始测试"); await finish(page, l, "mixed");
    await button(page, l, "Copy public entry", "复制公开入口"); expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(`${quiz.title[l]}\nhttps://fermatmind.com${path(l)}`);
    for (const p of quiz.profiles) {
      await page.goto(`${path(l)}/results/${p.id}`); await expect(page.locator("h1")).toHaveText(p.title[l]); await expect(page.locator("[data-emotion-answer]")).toHaveCount(0);
      const text = await page.locator("main").last().innerText(); for (const s of p.sections) for (const t of s.paragraphs) expect(text).toContain(t[l]);
    }
  });
}
test("@release emotion-dashboard all18publicpages, schema, canonical,18fontOGs and unknown high-EQ identity", async ({ page, request }) => {
  for (const l of ["en", "zh"] as const) for (const p of [null, ...quiz.profiles]) {
    const url = p ? `${path(l)}/results/${p.id}` : path(l); await page.goto(url); await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${url}`);
    for (const [lang, other] of [["en", "en"], ["zh-CN", "zh"], ["x-default", "en"]] as const) await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveAttribute("href", `https://fermatmind.com${p ? `${path(other)}/results/${p.id}` : path(other)}`);
    const schema = await page.locator('script[type="application/ld+json"]').allTextContents(); expect(schema.length).toBeGreaterThan(0); expect(schema.join(" ")).not.toMatch(/ED_JOY_01|"answers"|"facets"|AggregateRating/);
    const image = `/og/fun/eq-dashboard?locale=${l}${p ? `&portrait=${p.id}` : ""}`, r = await request.get(image); expect(r.status()).toBe(200); const bytes = await r.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
    const sentinel = await request.get(image + "&mean=3.4&answers=SYNTHETIC_PRIVATE&emotion=PRIVATE_EMOTION"); expect(sentinel.status()).toBe(200); expect(await sentinel.body()).toEqual(bytes);
  }
  expect((await request.get("/en/tests/explore/eq-dashboard/results/high-eq")).status()).toBe(404); expect((await request.get("/og/fun/eq-dashboard?portrait=high-eq")).status()).toBe(404); expect((await request.get("/og/fun/eq-dashboard?locale=fr")).status()).toBe(404);
});
