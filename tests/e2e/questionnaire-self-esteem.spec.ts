import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import type { Questionnaire } from "../../lib/questionnaires/types";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/self-esteem.json", "utf8")) as Questionnaire;
const scores = JSON.parse(readFileSync("tests/fixtures/questionnaires/rses-scoring-reference.json", "utf8")) as { literal_per_item_response_scores: number[][] };
const anchors = ["sa", "a", "d", "sd"];
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
async function finish(page: Page, locale: "en" | "zh", mode: "maximum" | "zero" | "one-skip") {
  for (let i = 0; i < 10; i++) {
    const id = mode === "one-skip" && i === 2 ? "na" : mode === "one-skip" ? "sa" : anchors[scores.literal_per_item_response_scores[i].indexOf(mode === "maximum" ? 3 : 0)];
    const radio = page.locator(`input[name="${quiz.questions[i].id}"][value="${id}"]`);
    if (i === 0) { await radio.focus(); await radio.press("Space"); } else await radio.check();
    if (i === 1) await headingBelowHeader(page);
    await page.getByRole("button", { name: i === 9 ? (locale === "zh" ? "查看完整结果" : "See full result") : (locale === "zh" ? "下一题" : "Next"), exact: true }).click();
  }
  await expect(page.locator("[data-rosenberg-result]")).toBeVisible();
  const expected = mode === "one-skip" ? (locale === "zh" ? "资料不足：9/10" : "Insufficient information: 9/10") : mode === "maximum" ? "30 / 30" : "0 / 30";
  await expect(page.locator("[data-rosenberg-score]")).toContainText(expected);
  for (const section of quiz.profiles[0].sections) for (const text of section.paragraphs) await expect(page.locator("[data-rosenberg-result]")).toContainText(text[locale]);
  expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:self-esteem"))).toBeNull();
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/self-esteem`;
  test(`@release RSES ${locale}: hub, exact maximum and zero, keyboard, full guide and retake`, async ({ page }) => {
    const sensitivePosts: string[] = []; page.on("request", request => { if (request.method() === "POST" && /RSES_[0-9]{2}|answers|rosenberg.*total/.test(request.postData() ?? "")) sensitivePosts.push(request.url()); });
    await page.goto(`/${locale}/tests`); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]); await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await headingBelowHeader(page);
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    await finish(page, locale, "maximum"); await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click(); await expect(page.locator("[data-rosenberg-result]")).toHaveCount(0); await expect(page.getByRole("radio").first()).not.toBeChecked(); await finish(page, locale, "zero");
    expect(sensitivePosts).toEqual([]); expect(new URL(page.url()).search).toBe("");
  });
  test(`@release RSES ${locale}: opt-in draft, language switch, editing, clear and no unrequested storage`, async ({ page }) => {
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await page.locator('input[name="RSES_01"][value="a"]').check(); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:self-esteem"))).toBeNull(); await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await page.reload(); await page.getByRole("button", { name: zh ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click(); await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[name="RSES_01"][value="a"]')).toBeChecked(); await page.locator('input[name="RSES_01"][value="d"]').check();
    const other = zh ? "en" : "zh"; await page.goto(`/${other}/tests/explore/self-esteem`); await page.getByRole("button", { name: other === "zh" ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click(); await page.getByRole("button", { name: other === "zh" ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[name="RSES_01"][value="d"]')).toBeChecked();
    await page.getByRole("button", { name: other === "zh" ? "退出并清除本次进度" : "Exit and clear this attempt", exact: true }).click(); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:self-esteem"))).toBeNull();
  });
  test(`@release RSES ${locale}: skip withholds the total, full guide remains and sharing contains only public identity`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); await page.addInitScript(() => { Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } }); });
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await finish(page, locale, "one-skip"); await expect(page.locator("[data-rosenberg-score]")).not.toContainText(" / 30");
    await page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click(); const text = await page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue(); expect(text).toContain(quiz.title[locale]); expect(text).not.toMatch(/RSES_[0-9]{2}|answers|form_code|submission|9\s*\/\s*10|[?&]score/); const url = new URL(text.split("\n").at(-1)!); expect(url.pathname).toBe(entry); expect(url.search).toBe(""); expect(url.hash).toBe("");
  });
}
test("@release RSES all four native pages, four bilingual images and closed result identifiers", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) {
    const entry = await request.get(`/og/fun/self-esteem?locale=${locale}`); expect(entry.status()).toBe(200); expect(entry.headers()["content-type"]).toContain("image/png");
    const p = quiz.profiles[0], path = `/${locale}/tests/explore/self-esteem/results/${p.id}`; expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(p.title[locale]); await expect(page.locator("[data-rosenberg-score]")).toHaveCount(0);
    for (const section of p.sections) { const own = page.locator(`#report-${section.id}`); await expect(own.getByRole("heading", { level: 2 })).toHaveText(section.title[locale]); for (const text of section.paragraphs) await expect(own).toContainText(text[locale]); }
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/self-esteem/results/${p.id}`); const image = await request.get(`/og/fun/self-esteem?locale=${locale}&portrait=${p.id}`); expect(image.status()).toBe(200); expect(image.headers()["content-type"]).toContain("image/png");
  }
  expect((await request.get("/en/tests/explore/self-esteem/results/high")).status()).toBe(404); expect((await request.get("/og/fun/self-esteem?portrait=normal")).status()).toBe(404);
});
