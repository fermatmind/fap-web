import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/number-series.json", "utf8")) as Questionnaire;
async function headingBelowHeader(page: Page) {
  await expect.poll(async () => page.locator("#take-test h2").evaluate(heading => {
    const header = document.querySelector("header");
    const bottom = header?.getBoundingClientRect().bottom ?? 0;
    const progress = document.querySelector("#take-test progress");
    const counter = progress?.previousElementSibling;
    return heading.getBoundingClientRect().top >= bottom && (!progress || progress.getBoundingClientRect().top >= bottom)
      && (!counter || counter.getBoundingClientRect().top >= bottom);
  })).toBe(true);
}

async function finish(page: Page, locale: "en" | "zh", correct: boolean) {
  for (const [index, question] of quiz.questions.entries()) {
    const id = correct ? question.correctOptionId! : question.options.find(o => o.id !== question.correctOptionId)!.id;
    if (index > 0) await headingBelowHeader(page);
    const radio = page.locator(`input[name="${question.id}"][value="${id}"]`);
    if (index === 0) { await radio.focus(); await page.keyboard.press("Space"); await expect(radio).toBeChecked(); } else await radio.check();
    await expect(page.locator("[data-practice-correct]")).toHaveCount(0);
    await page.getByRole("button", { name: index === 29 ? (locale === "zh" ? "查看完整结果" : "See full result") : (locale === "zh" ? "下一题" : "Next"), exact: true }).click();
  }
  await expect(page.getByRole("heading", { level: 2, name: quiz.resultHeading![locale], exact: true })).toBeFocused();
  await headingBelowHeader(page);
  await expect(page.locator("[data-practice-correct]")).toContainText(correct ? "30 / 30" : "0 / 30");
  await expect(page.locator("[data-practice-question]")).toHaveCount(30); await expect(page.locator("[data-practice-explanation]")).toHaveCount(30); await expect(page.locator("[data-practice-guide]")).toHaveCount(5);
  for (const question of quiz.questions) await expect(page.locator(`[data-practice-question="${question.id}"] [data-practice-explanation]`)).toHaveText(question.explanation![locale]);
  for (const profile of quiz.profiles) {
    const guide = page.locator(`[data-practice-guide="${profile.id}"]`); await expect(guide.locator("h4")).toHaveCount(7);
    for (const section of profile.sections) for (const text of section.paragraphs) await expect(guide).toContainText(text[locale]);
  }
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(node => node.id)); expect(new Set(ids).size).toBe(ids.length);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/number-series`;
  test(`@release Bounded number-series practice ${locale}: hub,keyboard,30validchoices,all explanations,5fullguides and retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); const posts: string[] = [];
    page.on("request", request => { if (request.method() === "POST" && /SER_[0-9]{2}/.test(request.postData() ?? "")) posts.push(request.url()); });
    await page.goto(`/${locale}/tests`); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await expect(page.locator("#take-test a[href*='mbti']")).toHaveCount(0);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await headingBelowHeader(page);
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    await finish(page, locale, true);
    await expect(page.locator("#take-test a[href*='mbti']")).toHaveCount(0); await expect(page.locator("#take-test a[href*='holland-career-interest-test-riasec']")).toHaveCount(1);
    expect(new URL(page.url()).search).toBe(""); expect(posts).toEqual([]);
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click(); await expect(page.locator("[data-practice-result]")).toHaveCount(0); await expect(page.getByRole("radio").first()).not.toBeChecked();
  });
  test(`@release Bounded number-series practice ${locale}: opted-in draft,language switch,edit and clear`, async ({ page }) => {
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.locator('input[name="SER_01"][value="B"]').check(); await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await page.reload();
    await page.getByRole("button", { name: zh ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click();
    await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[name="SER_01"][value="B"]')).toBeChecked(); await page.locator('input[name="SER_01"][value="C"]').check();
    const other = zh ? "en" : "zh"; await page.goto(`/${other}/tests/explore/number-series`);
    await page.getByRole("button", { name: other === "zh" ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click();
    await page.getByRole("button", { name: other === "zh" ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[name="SER_01"][value="C"]')).toBeChecked();
    await page.getByRole("button", { name: other === "zh" ? "退出并清除本次进度" : "Exit and clear this attempt", exact: true }).click(); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:number-series"))).toBeNull();
  });
  test(`@release Bounded number-series practice ${locale}: zero correct retains all answers and guides; public-link-only sharing`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => { Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } }); });
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await finish(page, locale, false);
    await page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click();
    const text = await page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue();
    expect(text).toContain(quiz.title[locale]); expect(text).not.toMatch(/SER_[0-9]{2}|answers|form_code|submission|0\s*\/\s*30|[?&]score/);
    const url = new URL(text.split("\n").at(-1)!); expect(url.pathname).toBe(entry); expect(url.search).toBe(""); expect(url.hash).toBe("");
  });
}
test("@release Bounded number-series practice all10native full guides,12bilingual images and closed identifiers", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) {
    const entry = await request.get(`/og/fun/number-series?locale=${locale}`); expect(entry.status()).toBe(200); expect(entry.headers()["content-type"]).toContain("image/png");
    for (const p of quiz.profiles) {
      const path = `/${locale}/tests/explore/number-series/results/${p.id}`;
      expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(p.title[locale]); await expect(page.locator("[data-practice-correct]")).toHaveCount(0);
      for (const section of p.sections) { const own = page.locator(`#report-${section.id}`); await expect(own.getByRole("heading", { level: 2 })).toHaveText(section.title[locale]); for (const text of section.paragraphs) await expect(own).toContainText(text[locale]); }
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/number-series/results/${p.id}`);
      const image = await request.get(`/og/fun/number-series?locale=${locale}&portrait=${p.id}`); expect(image.status()).toBe(200); expect(image.headers()["content-type"]).toContain("image/png");
    }
  }
  expect((await request.get("/en/tests/explore/number-series/results/expert")).status()).toBe(404);
  expect((await request.get("/og/fun/number-series?portrait=expert")).status()).toBe(404);
});
