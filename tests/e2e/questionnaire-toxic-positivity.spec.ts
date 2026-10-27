import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import type { Questionnaire } from "../../lib/questionnaires/types";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/toxic-positivity-test.json", "utf8")) as Questionnaire;
const maximum = ["5", "5", "1", "5", "5", "1"], minimum = ["1", "1", "5", "1", "1", "5"];
test.beforeEach(async ({ page }) => { await page.addInitScript(() => { localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied", updatedAt: new Date().toISOString() })); }); });
async function headingBelowHeader(page: Page) {
  await page.locator("#take-test h2").waitFor({ state: "visible" });
  await expect.poll(() => page.evaluate(() => {
    const h = document.querySelector("#take-test h2"), p = document.querySelector("#take-test progress"), c = p?.previousElementSibling, header = document.querySelector("header"), bottom = header?.getBoundingClientRect().bottom ?? 0;
    return !!h && !!p && !!c && h.getBoundingClientRect().top >= bottom && p.getBoundingClientRect().top >= bottom && c.getBoundingClientRect().top >= bottom && document.documentElement.scrollWidth <= innerWidth;
  })).toBe(true);
}
async function finish(page: Page, locale: "en" | "zh", mode: "maximum" | "minimum" | "one-skip" | "all-skip") {
  for (let i = 0; i < 18; i++) {
    const id = mode === "all-skip" || (mode === "one-skip" && i === 0) ? "na" : mode === "one-skip" ? "3" : mode === "maximum" ? maximum[i % 6] : minimum[i % 6];
    const radio = page.locator(`input[name="${quiz.questions[i].id}"][value="${id}"]`);
    if (i === 0) { await radio.focus(); await radio.press("Space"); } else await radio.check(); if (i === 1) await headingBelowHeader(page);
    await page.getByRole("button", { name: i === 17 ? (locale === "zh" ? "查看完整结果" : "See full result") : (locale === "zh" ? "下一题" : "Next"), exact: true }).click();
  }
  await expect(page.locator("[data-positive-pressure-result]")).toBeVisible();
  for (let i = 0; i < 3; i++) {
    const insufficient = mode === "all-skip" || (mode === "one-skip" && i === 0);
    await expect(page.locator(`[data-positive-pressure-score="${quiz.directions[i].id}"]`)).toContainText(insufficient ? (locale === "zh" ? "资料不足" : "Insufficient information") : mode === "maximum" ? "5.0 / 5" : mode === "minimum" ? "1.0 / 5" : "3.0 / 5");
  }
  for (const profile of quiz.profiles) for (const section of profile.sections) for (const text of section.paragraphs) await expect(page.locator("[data-positive-pressure-result]")).toContainText(text[locale]);
  expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:toxic-positivity-test"))).toBeNull();
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/toxic-positivity-test`;
  test(`@release Positive pressure ${locale}: hub, keyboard, missing answer, exact extremes and all full readings`, async ({ page }) => {
    const sensitivePosts: string[] = []; page.on("request", request => { if (request.method() === "POST" && /TPOS_[0-9]{2}|answers|facets.*mean/.test(request.postData() ?? "")) sensitivePosts.push(request.url()); });
    await page.goto(`/${locale}/tests`); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click(); await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]); await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await headingBelowHeader(page); await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    await finish(page, locale, "maximum"); await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click(); await expect(page.getByRole("radio").first()).not.toBeChecked(); await finish(page, locale, "minimum"); expect(sensitivePosts).toEqual([]); expect(new URL(page.url()).search).toBe("");
  });
  test(`@release Positive pressure ${locale}: opt-in draft, language switch, edit and clear`, async ({ page }) => {
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await page.locator('input[name="TPOS_01"][value="4"]').check(); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:toxic-positivity-test"))).toBeNull(); await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await page.reload(); await page.getByRole("button", { name: zh ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click(); await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[name="TPOS_01"][value="4"]')).toBeChecked(); await page.locator('input[name="TPOS_01"][value="2"]').check();
    const other = zh ? "en" : "zh"; await page.goto(`/${other}/tests/explore/toxic-positivity-test`); await page.getByRole("button", { name: other === "zh" ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click(); await page.getByRole("button", { name: other === "zh" ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[name="TPOS_01"][value="2"]')).toBeChecked(); await page.getByRole("button", { name: other === "zh" ? "退出并清除本次进度" : "Exit and clear this attempt", exact: true }).click(); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:toxic-positivity-test"))).toBeNull();
  });
  test(`@release Positive pressure ${locale}: partial and all insufficient parts retain full guides and public-only copy`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); await page.addInitScript(() => { Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } }); }); await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await finish(page, locale, "one-skip"); await expect(page.locator('[data-positive-pressure-score="self-pressure"]')).toContainText("5/6");
    await page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click(); const text = await page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue(); expect(text).toContain(quiz.title[locale]); expect(text).not.toMatch(/TPOS_[0-9]{2}|answers|form_code|submission|5\s*\/\s*6|[?&]score/); const url = new URL(text.split("\n").at(-1)!); expect(url.pathname).toBe(entry); expect(url.search).toBe(""); expect(url.hash).toBe("");
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click(); await finish(page, locale, "all-skip"); await expect(page.locator("[data-positive-pressure-result]")).not.toContainText(" / 5 (");
  });
}
test("@release Positive pressure: eight bilingual native pages and images, closed identities and no private image personalization", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) {
    const entry = await request.get(`/og/fun/toxic-positivity-test?locale=${locale}`); expect(entry.status()).toBe(200); expect(entry.headers()["content-type"]).toContain("image/png");
    for (const profile of quiz.profiles) {
      const path = `/${locale}/tests/explore/toxic-positivity-test/results/${profile.id}`; expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]); await expect(page.locator("[data-positive-pressure-score]")).toHaveCount(0);
      for (const section of profile.sections) { const own = page.locator(`#report-${section.id}`); await expect(own.getByRole("heading", { level: 2 })).toHaveText(section.title[locale]); for (const paragraph of section.paragraphs) await expect(own).toContainText(paragraph[locale]); }
      await expect(page).toHaveTitle(`${profile.seo!.title[locale]} | FermatMind`); await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", profile.seo!.description[locale]); await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${path}`); await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/toxic-positivity-test/results/${profile.id}`); const image = await request.get(`/og/fun/toxic-positivity-test?locale=${locale}&portrait=${profile.id}`); expect(image.status()).toBe(200); expect(image.headers()["content-type"]).toContain("image/png");
      if (profile === quiz.profiles[0]) { const privateQuery = await request.get(`/og/fun/toxic-positivity-test?locale=${locale}&portrait=${profile.id}&score=5&answers=SYNTHETIC_PRIVATE_ANSWER`); expect(privateQuery.status()).toBe(200); expect(await privateQuery.body()).toEqual(await image.body()); }
    }
  }
  expect((await request.get("/en/tests/explore/toxic-positivity-test/results/master")).status()).toBe(404); expect((await request.get("/og/fun/toxic-positivity-test?portrait=high")).status()).toBe(404);
});
