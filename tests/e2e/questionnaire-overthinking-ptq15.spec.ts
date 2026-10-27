import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import type { Questionnaire } from "../../lib/questionnaires/types";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/overthinking-screener.json", "utf8")) as Questionnaire;
const worked = [2, 1, 3, 2, 1, 2, 3, 1, 2, 1, 3, 2, 1, 2, 3];
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
  for (let i = 0; i < 15; i++) {
    const value = mode === "all-skip" || mode === "one-skip" && i === 0 ? "na" : mode === "mixed" ? String(worked[i]) : mode === "maximum" ? "4" : "0";
    const radio = page.locator(`input[name="${quiz.questions[i].id}"][value="${value}"]`);
    if (i === 1) await headingBelowHeader(page);
    if (i === 0) { await radio.focus(); await radio.press("Space"); } else await radio.check();
    await page.getByRole("button", { name: i === 14 ? (locale === "zh" ? "查看完整结果" : "See full result") : (locale === "zh" ? "下一题" : "Next"), exact: true }).click();
  }
  const result = page.locator("[data-ptq15-result]");
  await expect(result).toBeVisible(); await expect(result.locator("[data-ptq15-part]")).toHaveCount(4);
  const sum = mode === "minimum" ? 0 : mode === "maximum" ? 60 : 29;
  await expect(result.locator('[data-ptq15-score="total-reading"]')).toContainText(mode === "one-skip" || mode === "all-skip" ? (locale === "zh" ? "资料不足" : "Insufficient information") : locale === "zh" ? `原始和：${sum}（可取范围0—60；` : `Raw sum: ${sum} (possible range 0–60;`);
  if (mode === "one-skip") {
    await expect(result.locator('[data-ptq15-score="core-reading"]')).toContainText(locale === "zh" ? "资料不足：8/9" : "Insufficient information: 8/9");
    for (const part of ["unproductive", "mental-capacity"]) await expect(result.locator(`[data-ptq15-score="${part}-reading"]`)).toContainText(locale === "zh" ? "原始和：0（可取范围0—12；3/3" : "Raw sum: 0 (possible range 0–12; 3/3");
  }
  if (mode === "mixed") for (const [part, sum] of [["core", 18], ["unproductive", 6], ["mental-capacity", 5]] as const) await expect(result.locator(`[data-ptq15-score="${part}-reading"]`)).toContainText(locale === "zh" ? `原始和：${sum}` : `Raw sum: ${sum}`);
  for (const p of quiz.profiles) for (const s of p.sections) for (const text of s.paragraphs) await expect(result).toContainText(text[locale]);
  await expect(page.locator("[data-ptq15-next-steps]")).toBeVisible();
  await expect(page.locator('[data-ptq15-next-steps] a[href*="/tests/"]')).toHaveCount(0);
  expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:overthinking-screener"))).toBeNull();
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/overthinking-screener`;
  test(`@release PTQ15 ${locale}: hub, original source paragraphs, zero, maximum, worked sums, keyboard and all full readings`, async ({ page }) => {
    const sensitivePosts: string[] = []; page.on("request", request => { if (request.method() === "POST" && /PTQ_[0-9]{2}|answers|ptq15.*overall/.test(request.postData() ?? "")) sensitivePosts.push(request.url()); });
    await page.goto(`/${locale}/tests`); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]); await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    const method = page.locator('section[aria-labelledby="questionnaire-method"]');
    await expect(method.locator(":scope > p")).toHaveCount(7);
    await expect(method.locator(":scope > h3")).toHaveCount(6);
    for (const s of quiz.guide) await expect(method.getByRole("heading", { level: 3, name: s.title[locale], exact: true })).toBeVisible();
    for (const s of quiz.guide) for (const p of s.paragraphs) await expect(method).toContainText(p[locale]);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await headingBelowHeader(page);
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    for (const mode of ["minimum", "maximum", "mixed"] as const) {
      if (mode !== "minimum") { await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click(); await expect(page.locator("[data-ptq15-result]")).toHaveCount(0); await expect(page.getByRole("radio").first()).not.toBeChecked(); }
      await finish(page, locale, mode);
    }
    expect(sensitivePosts).toEqual([]); expect(new URL(page.url()).search).toBe("");
  });
  test(`@release PTQ15 ${locale}: opt-in draft, language switch, editing zero and reset`, async ({ page }) => {
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await page.locator('input[name="PTQ_01"][value="4"]').check();
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:overthinking-screener"))).toBeNull(); await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await page.reload(); await page.getByRole("button", { name: zh ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click(); await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[name="PTQ_01"][value="4"]')).toBeChecked(); await page.locator('input[name="PTQ_01"][value="0"]').check();
    const other = zh ? "en" : "zh"; await page.goto(`/${other}/tests/explore/overthinking-screener`); await page.getByRole("button", { name: other === "zh" ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click(); await page.getByRole("button", { name: other === "zh" ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[name="PTQ_01"][value="0"]')).toBeChecked();
    await page.getByRole("button", { name: other === "zh" ? "退出并清除本次进度" : "Exit and clear this attempt", exact: true }).click(); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:overthinking-screener"))).toBeNull();
  });
  test(`@release PTQ15 ${locale}: one unscored, all unscored, all full guides and public-only sharing on mobile`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); await page.addInitScript(() => { Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } }); });
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await finish(page, locale, "one-skip");
    await page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click(); const text = await page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue(); expect(text).toContain(quiz.title[locale]); expect(text).not.toMatch(/PTQ_[0-9]{2}|answers|form_code|submission|14\s*\/\s*15|[?&]score/);
    const url = new URL(text.split("\n").at(-1)!); expect(url.pathname).toBe(entry); expect(url.search).toBe(""); expect(url.hash).toBe("");
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click(); await finish(page, locale, "all-skip");
    await expect(page.locator('[data-ptq15-score="total-reading"]')).toContainText("0/15");
  });
}
test("@release PTQ15 all10 native pages and images, independent metadata, no private query projection and closed IDs", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) {
    const entry = await request.get(`/og/fun/overthinking-screener?locale=${locale}`); expect(entry.status()).toBe(200); expect(entry.headers()["content-type"]).toContain("image/png");
    for (const p of quiz.profiles) {
      const path = `/${locale}/tests/explore/overthinking-screener/results/${p.id}`; expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(p.title[locale]); await expect(page).toHaveTitle(`${p.seo!.title[locale]} | FermatMind`); await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", p.seo!.description[locale]); await expect(page.locator("[data-ptq15-result]")).toHaveCount(0);
      for (const s of p.sections) { const own = page.locator(`#report-${s.id}`); await expect(own.getByRole("heading", { level: 2 })).toHaveText(s.title[locale]); for (const text of s.paragraphs) await expect(own).toContainText(text[locale]); }
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${path}`); await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/overthinking-screener/results/${p.id}`);
      const credit = page.locator("[data-ptq15-source]"); for (const text of quiz.guide.find(s => s.id === "source")!.paragraphs) await expect(credit).toContainText(text[locale]);
      const image = await request.get(`/og/fun/overthinking-screener?locale=${locale}&portrait=${p.id}`); expect(image.status()).toBe(200); expect(image.headers()["content-type"]).toContain("image/png");
      const privateQuery = await request.get(`/og/fun/overthinking-screener?locale=${locale}&portrait=${p.id}&score=60&answers=SYNTHETIC_PRIVATE_ANSWER`); expect(privateQuery.status()).toBe(200); expect(await privateQuery.body()).toEqual(await image.body());
    }
  }
  expect((await request.get("/en/tests/explore/overthinking-screener/results/high")).status()).toBe(404); expect((await request.get("/og/fun/overthinking-screener?portrait=normal")).status()).toBe(404);
});
