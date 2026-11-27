import { expectQuestionContext } from "./helpers/question-context";
import { expectQuestionnaireSessionPrivacy } from "./helpers/questionnaire-session-privacy";
import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import type { Questionnaire } from "../../lib/questionnaires/types";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/sensory-processing-test.json", "utf8")) as Questionnaire;
const source = JSON.parse(readFileSync("tests/fixtures/questionnaires/spq92-source-reference.json", "utf8")) as { reverse92: number[] };
const reverse = new Set(source.reverse92);
test.beforeEach(async ({ page }) => { await page.addInitScript(() => { localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied", updatedAt: new Date().toISOString() })); }); });
async function finish(page: Page, locale: "en" | "zh", mode: "zero" | "maximum" | "agree" | "one-na" | "all-na") {
  for (let i = 0; i < 92; i++) {
    const value = mode === "all-na" || mode === "one-na" && i === 0 ? "na" : mode === "agree" ? "1" : mode === "maximum" ? (reverse.has(i + 1) ? "0" : "3") : (reverse.has(i + 1) ? "3" : "0");
    if (i === 1) await expectQuestionContext(page);
    const radio = page.locator(`input[name="${quiz.questions[i].id}"][value="${value}"]`);
    if (i === 0) await radio.press("Space");
    else await radio.click();
    await expect(radio).toHaveCount(0);
  }
  const result = page.locator("[data-spq92-result]"); await expect(result).toBeVisible();
  const total = mode === "zero" ? 0 : mode === "maximum" ? 276 : 136;
  await expect(page.locator("[data-spq92-total]")).toContainText(mode === "one-na" || mode === "all-na" ? (locale === "zh" ? "资料不足" : "Insufficient information") : locale === "zh" ? `${total}（0到276；` : `${total} (0 to 276;`);
  if (mode === "one-na") await expect(page.locator("[data-spq92-total]")).toContainText("91/92");
  if (mode === "all-na") await expect(page.locator("[data-spq92-total]")).toContainText("0/92");
  for (const p of quiz.profiles) for (const s of p.sections) for (const text of s.paragraphs) await expect(result).toContainText(text[locale]);
  await expect(page.locator('[data-spq92-next-steps]')).toBeVisible(); await expect(page.locator('[data-spq92-next-steps] a[href*="mbti"]')).toHaveCount(0); await expect(page.locator('[data-spq92-next-steps]').getByRole("link", { name: locale === "zh" ? "返回全部测试" : "Back to all tests", exact: true })).toHaveAttribute("href", `/${locale}/tests#more-tests`);
  expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:sensory-processing-test"))).toBeNull(); expect(new URL(page.url()).search).toBe("");
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/sensory-processing-test`;
  test(`@release SPQ92 ${locale}: directory and keyboard, all 92 answers, totals of 0 and 276 after retake`, async ({ page }) => {
    const leaked: string[] = []; page.on("request", r => { if (r.method() === "POST" && /SPQ92_[0-9]{2}|answers|spq92.*total/.test(r.postData() ?? "")) leaked.push(r.url()); });
    await page.goto(`/${locale}/tests`); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click(); await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]); await expect(page.getByText(quiz.instructions![locale], { exact: true })).toBeVisible();
    const method = page.locator("#questionnaire-method").locator(".."); await expect(method.locator(":scope > h3")).toHaveCount(5); for (const s of quiz.guide) { await expect(method.getByRole("heading", { name: s.title[locale], exact: true })).toBeVisible(); for (const text of s.paragraphs) await expect(method).toContainText(text[locale]); }
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`); await page.locator("[data-explore-start]:visible").first().click(); await expectQuestionContext(page); await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    for (const mode of ["zero", "maximum"] as const) { if (mode !== "zero") { await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click(); await expect(page.locator('[data-spq92-result]')).toHaveCount(0); await expect(page.getByRole("radio").first()).not.toBeChecked(); } await finish(page, locale, mode); }
    expect(leaked).toEqual([]);
  });
  test(`@release SPQ92 ${locale}: choosing Agree for all 92 items totals 136`, async ({ page }) => {
    await page.goto(entry);
    await page.locator("[data-explore-start]:visible").first().click();
    await finish(page, locale, "agree");
  });
  test(`@release SPQ92 ${locale}: edit in memory, then clear answers on reload, language change or exit`, async ({ page }) => {
    await expectQuestionnaireSessionPrivacy(page, locale, quiz);
  });
  test(`@release SPQ92 ${locale}: mobile oneNAandallNA finish, six complete sections and public-only copy`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); await page.addInitScript(() => { Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } }); }); await page.goto(entry); await page.locator("[data-explore-start]:visible").first().click(); await finish(page, locale, "one-na");
    await page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click(); const text = await page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue(); expect(text.split("\n")).toEqual([quiz.title[locale], `https://fermatmind.com${entry}`]); expect(text).not.toMatch(/SPQ92_[0-9]{2}|answers|form_code|submission|91\s*\/\s*92|[?&]score/);
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click(); await finish(page, locale, "all-na"); await expect(page.locator('[data-spq92-total]')).toContainText("0/92");
  });
}
test("@release SPQ92 all4nativepages and PNGs, fullbody/source, alternates, closed IDs and no private image projection", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) {
    const entry = await request.get(`/og/fun/sensory-processing-test?locale=${locale}`); expect(entry.status()).toBe(200); expect(entry.headers()["content-type"]).toContain("image/png");
    for (const p of quiz.profiles) {
      const path = `/${locale}/tests/explore/sensory-processing-test/results/${p.id}`; expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(p.title[locale]); await expect(page).toHaveTitle(`${p.seo!.title[locale]} | FermatMind`); await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", p.seo!.description[locale]); await expect(page.locator('[data-spq92-total]')).toHaveCount(0);
      for (const s of p.sections) { const own = page.locator(`#report-${s.id}`); await expect(own.getByRole("heading", { level: 2 })).toHaveText(s.title[locale]); for (const text of s.paragraphs) await expect(own).toContainText(text[locale]); }
      await expect(page.locator('[data-spq92-source]')).toContainText("CC BY 2.0"); await expect(page.locator('#other-questionnaire-results')).toHaveCount(0); await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${path}`); for (const [language, l] of [["en", "en"], ["zh-CN", "zh"], ["x-default", "en"]]) await expect(page.locator(`link[rel="alternate"][hreflang="${language}"]`)).toHaveAttribute("href", `https://fermatmind.com/${l}/tests/explore/sensory-processing-test/results/${p.id}`);
      const image = await request.get(`/og/fun/sensory-processing-test?locale=${locale}&portrait=${p.id}`); expect(image.status()).toBe(200); expect(image.headers()["content-type"]).toContain("image/png"); const privateQuery = await request.get(`/og/fun/sensory-processing-test?locale=${locale}&portrait=${p.id}&score=276&answers=SYNTHETIC_PRIVATE_ANSWER`); expect(privateQuery.status()).toBe(200); expect(await privateQuery.body()).toEqual(await image.body());
    }
  }
  expect((await request.get("/en/tests/explore/sensory-processing-test/results/high")).status()).toBe(404); expect((await request.get("/og/fun/sensory-processing-test?portrait=dunn-quadrant")).status()).toBe(404); expect((await request.get("/og/fun/sensory-processing-test?locale=fr")).status()).toBe(404); expect((await request.get("/en/tests/play/sensory-processing-test")).status()).toBe(404);
});
