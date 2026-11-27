import { expectStandaloneObservationPrivacy } from "./helpers/standalone-observation-flow";
import { test, expect, type Page } from "@playwright/test";
import { isArchivedEntertainmentPath } from "../../lib/seo/discoverabilityExposurePolicy";
import quiz from "../../lib/questionnaires/data/cultural-dimensions.json";
type Locale = "en" | "zh";
const path = (l: Locale) => `/${l}/tests/explore/cultural-dimensions`;
const label = (l: Locale, en: string, zh: string) => l === "zh" ? zh : en;
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied", updatedAt: new Date().toISOString() })));
});
async function button(page: Page, l: Locale, en: string, zh: string) { if (en === "Start test") { await page.locator("[data-explore-start]:visible").first().click(); await expect(page.locator("#take-test").getByRole("radio").first()).toBeVisible({ timeout: 30000 }); return; } await page.getByRole("button", { name: label(l, en, zh), exact: true }).click(); }
async function finish(page: Page, l: Locale, values: string[]) {
  for (let i = 0; i < 36; i++) {
    const radio = page.locator(`input[name="${quiz.questions[i].id}"][value="${values[i]}"]`);
    await expect(page.locator("[data-cultural-dimensions-report]")).toHaveCount(0);
    if (i === 1) {
      await expect(radio).toBeVisible();
      await button(page, l, "Back", "上一题");
      await expect(page.locator(`input[name="CD_AUTHORITY_01"][value="${values[0]}"]`)).toBeChecked();
      await button(page, l, "Next", "下一题");
    }
    if (i === 0) await radio.press("Space");
    else await radio.click();
    await expect(radio).toHaveCount(0);
  }
  await expect(page.locator("#take-test h2")).toBeFocused(); const report = page.locator("[data-cultural-dimensions-report]"); await expect(report).toHaveCount(1); await expect(report.locator("[data-cultural-full]")).toHaveCount(6);
  for (const [i, d] of quiz.directions.entries()) {
    const numeric = values.slice(i * 6, i * 6 + 6).map((v, j) => v === "na" ? null : j >= 3 ? 6 - Number(v) : Number(v)).filter((v): v is number => v !== null), sum = numeric.reduce((a, b) => a + b, 0), n = numeric.length;
    await expect(report.locator(`[data-cultural-coverage="${d.id}"]`)).toHaveText(`${n} / 6`); await expect(report.locator(`[data-cultural-sum="${d.id}"]`)).toHaveText(n ? String(sum) : "—"); await expect(report.locator(`[data-cultural-mean="${d.id}"]`)).toHaveText(n < 4 ? label(l, "Not calculated", "不计算") : `${(Math.round(sum / n * 10) / 10).toFixed(1)} / 5`);
  }
  for (const profile of quiz.profiles) {
    await expect(report.locator(`a[href="${path(l)}/results/${profile.id}"]`)).toBeVisible();
  }
  await report.locator(":scope > details > summary").click(); for (const [i, q] of quiz.questions.entries()) await expect(report.locator(`[data-cultural-answer="${q.id}"]`)).toContainText(q.options.find(o => o.id === values[i])!.label[l]); await report.locator(":scope > details > summary").click();
  await expect(page.getByRole("heading", { name: label(l, "Check one statement against its context, or finish here", "选一条题文核对情境，或在这里结束"), exact: true })).toBeVisible();
  expect(new URL(page.url()).search).toBe(""); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); const ids = await page.locator("#take-test [id]").evaluateAll(ns => ns.map(n => n.id)); expect(ids.length).toBe(new Set(ids).size);
}
for (const l of ["en", "zh"] as const) {
  test(`@release cultural-dimensions ${l}: native hub, keyboard, separate means, missing data and allNA full guides`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); const leaked: string[] = []; page.on("request", r => { if (r.method() === "POST" && /CD_[A-Z]+_|"facets"|"answers"|"mean"/.test(r.postData() ?? "")) leaked.push(r.url()); });
    await page.goto(`/${l}/tests`); await page.locator("#more-tests").getByRole("link", { name: quiz.title[l], exact: true }).click(); await expect(page.locator("h1")).toHaveText(quiz.title[l]); await expect(page).toHaveTitle(`${quiz.seoTitle[l]} | FermatMind`); await button(page, l, "Start test", "开始测试");
    await button(page, l, "Next", "下一题"); await expect(page.getByRole("status")).toContainText(label(l, "Choose an option", "请选择"));
    const patterns = [Array<string>(36).fill("5"), ["4", "5", "3", "1", "na", "na", "5", "4", "3", "na", "na", "na", ...Array<string>(6).fill("na"), ...Array<string>(18).fill("3")], Array<string>(36).fill("na")];
    for (const [i, values] of patterns.entries()) { if (i) await button(page, l, "Retake test", "重新测试"); await finish(page, l, values); }
    expect(leaked).toEqual([]); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:cultural-dimensions"))).toBeNull(); await page.locator("[data-cultural-full='authority']").scrollIntoViewIfNeeded(); await page.screenshot({ path: test.info().outputPath(`${l}-result.png`) }); await button(page, l, "Retake test", "重新测试"); await expect(page.locator("[data-cultural-dimensions-report]")).toHaveCount(0); await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0);
  });
  test(`@release cultural-dimensions ${l}: back and edit, reload, language change and exit clear private answers`, async ({ page }) => {
    await expectStandaloneObservationPrivacy(page, path(l), quiz);
    const other = l === "en" ? "zh" : "en";
    await page.goto(`/${other}/tests/explore/${quiz.slug}/take`);
    const first = page.locator(`#take-test input[name="${quiz.questions[0].id}"]`);
    await expect(first.first()).toBeVisible({ timeout: 30000 });
    await expect(first.and(page.getByRole("radio", { checked: true }))).toHaveCount(0);
    expect(await page.evaluate(slug => sessionStorage.getItem(`fm_questionnaire_draft:${slug}`), quiz.slug)).toBeNull();
  });
  test(`@release cultural-dimensions ${l}: sharing excludes personal means and all six full guides stay public`, async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]); await page.goto(path(l)); await button(page, l, "Start test", "开始测试"); await finish(page, l, Array<string>(36).fill("4")); await button(page, l, "Copy public entry", "复制公开入口"); expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(`${quiz.title[l]}\nhttps://fermatmind.com${path(l)}`);
    for (const profile of quiz.profiles) { await page.goto(`${path(l)}/results/${profile.id}`); await expect(page.locator("h1")).toHaveText(profile.title[l]); await expect(page.locator("[data-cultural-mean]")).toHaveCount(0); const text = await page.locator("main").last().innerText(); for (const s of profile.sections) for (const t of s.paragraphs) expect(text).toContain(t[l]); }
  });
}
test("@release cultural-dimensions all14publicpages, canonical/hreflang/schema,14local-fontOGs and unknown identities", async ({ page, request }) => {
  for (const l of ["en", "zh"] as const) for (const p of [null, ...quiz.profiles]) {
    const url = p ? `${path(l)}/results/${p.id}` : path(l); await page.goto(url); await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${url}`);
    if (isArchivedEntertainmentPath(url)) {
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /^noindex, follow(?:,|$)/u);
      await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
    } else for (const [lang, other] of [["en", "en"], ["zh-CN", "zh"], ["x-default", "en"]] as const) await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveAttribute("href", `https://fermatmind.com${p ? `${path(other)}/results/${p.id}` : path(other)}`);
    const schema = await page.locator('script[type="application/ld+json"]').allTextContents(); expect(schema.length).toBeGreaterThan(0); expect(schema.join(" ")).not.toMatch(/CD_AUTHORITY_01|"answers"|"mean"|AggregateRating/);
    const image = `/og/fun/cultural-dimensions?locale=${l}${p ? `&portrait=${p.id}` : ""}`, r = await request.get(image); expect(r.status()).toBe(200); const bytes = await r.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630); const sentinel = await request.get(image + "&mean=4.3&answers=SYNTHETIC_PRIVATE&country=PRIVATE"); expect(sentinel.status()).toBe(200); expect(await sentinel.body()).toEqual(bytes);
  }
  expect((await request.get("/en/tests/explore/cultural-dimensions/results/china")).status()).toBe(404); expect((await request.get("/og/fun/cultural-dimensions?portrait=china")).status()).toBe(404); expect((await request.get("/og/fun/cultural-dimensions?locale=fr")).status()).toBe(404);
});
