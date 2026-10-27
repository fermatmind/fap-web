import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import type { Questionnaire } from "../../lib/questionnaires/types";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/executive-function.json", "utf8")) as Questionnaire;
const memory = new Set([1, 2, 5, 7, 8, 9, 11, 12, 13]);
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied", updatedAt: new Date().toISOString() })); });
});
async function headingBelowHeader(page: Page) {
  await page.locator("#take-test h2").waitFor({ state: "visible" });
  await expect.poll(() => page.evaluate(() => {
    const h = document.querySelector("#take-test h2"), p = document.querySelector("#take-test progress"), c = p?.previousElementSibling, header = document.querySelector("header"), bottom = header?.getBoundingClientRect().bottom ?? 0;
    return !!h && !!p && !!c && h.getBoundingClientRect().top >= bottom && p.getBoundingClientRect().top >= bottom && c.getBoundingClientRect().top >= bottom && document.documentElement.scrollWidth <= innerWidth;
  })).toBe(true);
}
async function finish(page: Page, locale: "en" | "zh", mode: "minimum" | "maximum" | "mixed" | "one-skip" | "all-skip") {
  for (let i = 0; i < 14; i++) {
    const value = mode === "all-skip" || mode === "one-skip" && i === 0 ? "na" : mode === "mixed" ? (memory.has(i + 1) ? "2" : "4") : mode === "maximum" ? "5" : "1";
    if (i === 1) await headingBelowHeader(page);
    const radio = page.locator(`input[name="${quiz.questions[i].id}"][value="${value}"]`);
    if (i === 0) { await radio.focus(); await radio.press("Space"); } else await radio.check();
    await page.getByRole("button", { name: i === 13 ? (locale === "zh" ? "查看完整结果" : "See full result") : (locale === "zh" ? "下一题" : "Next"), exact: true }).click();
  }
  await expect(page.locator("[data-adexi14-result]")).toBeVisible(); await expect(page.locator("[data-adexi14-part]")).toHaveCount(2);
  const sum = mode === "minimum" ? 14 : mode === "maximum" ? 70 : 38;
  await expect(page.locator("[data-adexi14-overall]")).toContainText(mode === "one-skip" || mode === "all-skip" ? (locale === "zh" ? "资料不足" : "Insufficient information") : locale === "zh" ? `${sum}（14到70；` : `${sum} (14 to 70;`);
  if (mode === "one-skip") {
    await expect(page.locator('[data-adexi14-part="working-memory"]')).toContainText(locale === "zh" ? "资料不足：8/9" : "Insufficient information: 8/9");
    await expect(page.locator('[data-adexi14-part="inhibition"]')).toContainText(locale === "zh" ? "原始合计：5（5到25）" : "Raw sum: 5 (5 to 25)");
  }
  if (mode === "mixed") {
    await expect(page.locator('[data-adexi14-part="working-memory"]')).toContainText(locale === "zh" ? "原始合计：18" : "Raw sum: 18");
    await expect(page.locator('[data-adexi14-part="working-memory"]')).toContainText(locale === "zh" ? "分项均分：2.00" : "Part mean: 2.00");
    await expect(page.locator('[data-adexi14-part="inhibition"]')).toContainText(locale === "zh" ? "原始合计：20" : "Raw sum: 20");
    await expect(page.locator('[data-adexi14-part="inhibition"]')).toContainText(locale === "zh" ? "分项均分：4.00" : "Part mean: 4.00");
  }
  for (const profile of quiz.profiles) for (const section of profile.sections) for (const text of section.paragraphs) await expect(page.locator("[data-adexi14-result]")).toContainText(text[locale]);
  expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:executive-function"))).toBeNull();
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/executive-function`;
  test(`@release ADEXI14 ${locale}: hub, minimum, maximum, raw total and separate part means, keyboard and complete results`, async ({ page }) => {
    const sensitivePosts: string[] = []; page.on("request", request => { if (request.method() === "POST" && /ADEXI_[0-9]{2}|answers|adexi14.*overall/.test(request.postData() ?? "")) sensitivePosts.push(request.url()); });
    await page.goto(`/${locale}/tests`); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]); const method = page.locator("#questionnaire-method").locator(".."); await expect(method.locator(":scope > h3")).toHaveCount(5); for (const section of quiz.guide) { await expect(method.getByRole("heading", { name: section.title[locale], exact: true })).toBeVisible(); for (const text of section.paragraphs) await expect(method).toContainText(text[locale]); } await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await headingBelowHeader(page);
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    for (const mode of ["minimum", "maximum", "mixed"] as const) {
      if (mode !== "minimum") { await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click(); await expect(page.locator("[data-adexi14-result]")).toHaveCount(0); await expect(page.getByRole("radio").first()).not.toBeChecked(); }
      await finish(page, locale, mode);
    }
    expect(sensitivePosts).toEqual([]); expect(new URL(page.url()).search).toBe("");
  });
  test(`@release ADEXI14 ${locale}: opt-in draft, language switch, editing, reset and no unrequested storage`, async ({ page }) => {
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await page.locator('input[name="ADEXI_01"][value="4"]').check(); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:executive-function"))).toBeNull(); await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await page.reload(); await page.getByRole("button", { name: zh ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click(); await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[name="ADEXI_01"][value="4"]')).toBeChecked(); await page.locator('input[name="ADEXI_01"][value="2"]').check();
    const other = zh ? "en" : "zh"; await page.goto(`/${other}/tests/explore/executive-function`); await page.getByRole("button", { name: other === "zh" ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click(); await page.getByRole("button", { name: other === "zh" ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[name="ADEXI_01"][value="2"]')).toBeChecked();
    await page.getByRole("button", { name: other === "zh" ? "退出并清除本次进度" : "Exit and clear this attempt", exact: true }).click(); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:executive-function"))).toBeNull();
  });
  test(`@release ADEXI14 ${locale}: one skip, all skipped, complete guides and public-only sharing on mobile`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); await page.addInitScript(() => { Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } }); });
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await finish(page, locale, "one-skip");
    await page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click(); const text = await page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue(); expect(text).toContain(quiz.title[locale]); expect(text).not.toMatch(/ADEXI_[0-9]{2}|answers|form_code|submission|13\s*\/\s*14|[?&]score/); const url = new URL(text.split("\n").at(-1)!); expect(url.pathname).toBe(entry); expect(url.search).toBe(""); expect(url.hash).toBe("");
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click(); await finish(page, locale, "all-skip");
    await expect(page.locator("[data-adexi14-overall]")).toContainText("0/14");
  });
}
test("@release ADEXI14 all eight native pages and images, independent metadata, no private query projection and closed IDs", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) {
    const entry = await request.get(`/og/fun/executive-function?locale=${locale}`); expect(entry.status()).toBe(200); expect(entry.headers()["content-type"]).toContain("image/png");
    for (const p of quiz.profiles) {
      const path = `/${locale}/tests/explore/executive-function/results/${p.id}`; expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(p.title[locale]); await expect(page).toHaveTitle(`${p.seo!.title[locale]} | FermatMind`); await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", p.seo!.description[locale]); await expect(page.locator("[data-adexi14-overall]")).toHaveCount(0);
      for (const s of p.sections) { const own = page.locator(`#report-${s.id}`); await expect(own.getByRole("heading", { level: 2 })).toHaveText(s.title[locale]); for (const text of s.paragraphs) await expect(own).toContainText(text[locale]); }
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${path}`); await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/executive-function/results/${p.id}`);
      const image = await request.get(`/og/fun/executive-function?locale=${locale}&portrait=${p.id}`); expect(image.status()).toBe(200); expect(image.headers()["content-type"]).toContain("image/png");
      const privateQuery = await request.get(`/og/fun/executive-function?locale=${locale}&portrait=${p.id}&score=70&answers=SYNTHETIC_PRIVATE_ANSWER`); expect(privateQuery.status()).toBe(200); expect(await privateQuery.body()).toEqual(await image.body());
    }
  }
  expect((await request.get("/en/tests/explore/executive-function/results/high")).status()).toBe(404); expect((await request.get("/og/fun/executive-function?portrait=normal")).status()).toBe(404);
});
