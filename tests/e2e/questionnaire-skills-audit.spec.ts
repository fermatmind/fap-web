import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import type { Questionnaire } from "../../lib/questionnaires/types";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/skills-audit.json", "utf8")) as Questionnaire;
const states = ["recent", "older", "explore", "na"], parts = ["methods", "tools", "communication", "domain"];
const mixed = ["recent", "recent", "older", "explore", "na", "recent", "older", "older", "na", "na", "recent", "recent", "recent", "explore", "na", "older", "explore", "explore", "na", "recent"];
const mixedCounts = [[2, 1, 1, 1], [1, 2, 0, 2], [3, 0, 1, 1], [1, 1, 2, 1]];
test.beforeEach(async ({ page }) => { await page.addInitScript(() => { localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied", updatedAt: new Date().toISOString() })); }); });
async function headingBelowHeader(page: Page) {
  await page.locator("#take-test h2").waitFor({ state: "visible" });
  await expect.poll(() => page.evaluate(() => {
    const h = document.querySelector("#take-test h2"), p = document.querySelector("#take-test progress"), c = p?.previousElementSibling, header = document.querySelector("header"), bottom = header?.getBoundingClientRect().bottom ?? 0;
    return !!h && !!p && !!c && h.getBoundingClientRect().top >= bottom && p.getBoundingClientRect().top >= bottom && c.getBoundingClientRect().top >= bottom && document.documentElement.scrollWidth <= innerWidth;
  })).toBe(true);
}
async function finish(page: Page, locale: "en" | "zh", mode: "recent" | "older" | "mixed" | "na") {
  for (let i = 0; i < 20; i++) {
    const state = mode === "mixed" ? mixed[i] : mode, radio = page.locator(`input[name="${quiz.questions[i].id}"][value="${state}"]`);
    if (i === 0) { await radio.focus(); await radio.press("Space"); } else await radio.check();
    if (i === 1) await headingBelowHeader(page);
    await page.getByRole("button", { name: i === 19 ? (locale === "zh" ? "查看完整结果" : "See full result") : (locale === "zh" ? "下一题" : "Next"), exact: true }).click();
  }
  await expect(page.locator("[data-skills-evidence-result]")).toBeVisible();
  await expect(page.locator("[data-skills-evidence-row]")).toHaveCount(20); await expect(page.locator("[data-skills-evidence-count]")).toHaveCount(16);
  for (let p = 0; p < 4; p++) for (let s = 0; s < 4; s++) {
    const n = mode === "mixed" ? mixedCounts[p][s] : states[s] === mode ? 5 : 0;
    await expect(page.locator(`[data-skills-evidence-count="${parts[p]}-${states[s]}"]`)).toHaveText(String(n));
  }
  const stateLabels = locale === "zh" ? ["近12个月实例", "更早实例", "想探索", "暂不记录"] : ["Example within 12 months", "Older example", "Would like to explore", "Not recorded"];
  for (let i = 0; i < 20; i++) { await expect(page.locator(`[data-skills-evidence-row="${quiz.questions[i].id}"]`)).toContainText(quiz.questions[i].prompt[locale]); await expect(page.locator(`[data-skills-evidence-state="${quiz.questions[i].id}"]`)).toHaveText(stateLabels[states.indexOf(mode === "mixed" ? mixed[i] : mode)]); }
  for (const profile of quiz.profiles) for (const section of profile.sections) for (const text of section.paragraphs) await expect(page.locator("[data-skills-evidence-result]")).toContainText(text[locale]);
  await expect(page.getByRole("heading", { name: locale === "zh" ? "盘点已记录，下一步由你选择" : "Your inventory is recorded. Choose what comes next.", exact: true })).toBeVisible();
  expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:skills-audit"))).toBeNull();
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/skills-audit`;
  test(`@release Skills audit ${locale}: hub, keyboard, missing choice and exact recent versus older inventory counts`, async ({ page }) => {
    const sensitivePosts: string[] = []; page.on("request", request => { if (request.method() === "POST" && /SKI_[0-9]{2}|answers|skillsEvidence/.test(request.postData() ?? "")) sensitivePosts.push(request.url()); });
    await page.goto(`/${locale}/tests`); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click(); await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]); await expect(page.locator('[aria-labelledby="questionnaire-method"] p')).toHaveCount(3); for (const section of quiz.guide.filter(s => ["scope", "states", "counts"].includes(s.id))) for (const paragraph of section.paragraphs) await expect(page.locator('[aria-labelledby="questionnaire-method"]').getByText(paragraph[locale], { exact: true })).toBeVisible(); await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await headingBelowHeader(page); await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    await finish(page, locale, "recent"); await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click(); await expect(page.getByRole("radio").first()).not.toBeChecked(); await finish(page, locale, "older"); expect(sensitivePosts).toEqual([]); expect(new URL(page.url()).search).toBe("");
  });
  test(`@release Skills audit ${locale}: opt-in draft, language switch, edit and clear`, async ({ page }) => {
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await page.locator('input[name="SKI_01"][value="recent"]').check(); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:skills-audit"))).toBeNull(); await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await page.reload(); await page.getByRole("button", { name: zh ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click(); await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[name="SKI_01"][value="recent"]')).toBeChecked(); await page.locator('input[name="SKI_01"][value="older"]').check();
    const other = zh ? "en" : "zh"; await page.goto(`/${other}/tests/explore/skills-audit`); await page.getByRole("button", { name: other === "zh" ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click(); await page.getByRole("button", { name: other === "zh" ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[name="SKI_01"][value="older"]')).toBeChecked(); await page.getByRole("button", { name: other === "zh" ? "退出并清除本次进度" : "Exit and clear this attempt", exact: true }).click(); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:skills-audit"))).toBeNull();
  });
  test(`@release Skills audit ${locale}: mixed and all-not-recorded inventories retain twenty rows, all guides and public-only copy`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); await page.addInitScript(() => { Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } }); }); await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await finish(page, locale, "mixed");
    await page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click(); const text = await page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue(); expect(text).toContain(quiz.title[locale]); expect(text).not.toMatch(/SKI_[0-9]{2}|skillsEvidence|answers|counts|submission|form_code|[?&]state/); const url = new URL(text.split("\n").at(-1)!); expect(url.pathname).toBe(entry); expect(url.search).toBe(""); expect(url.hash).toBe("");
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click(); await finish(page, locale, "na"); await expect(page.locator("[data-skills-evidence-result]")).not.toContainText(zh ? "你的技能等级是" : "Your skill level is");
  });
}
test("@release Skills audit: ten bilingual native pages and images, closed identities and no private image personalization", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) {
    const entry = await request.get(`/og/fun/skills-audit?locale=${locale}`); expect(entry.status()).toBe(200); expect(entry.headers()["content-type"]).toContain("image/png");
    for (const profile of quiz.profiles) {
      const path = `/${locale}/tests/explore/skills-audit/results/${profile.id}`; expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]); await expect(page.locator("[data-skills-evidence-row]")).toHaveCount(0);
      for (const section of profile.sections) { const own = page.locator(`#report-${section.id}`); await expect(own.getByRole("heading", { level: 2 })).toHaveText(section.title[locale]); for (const paragraph of section.paragraphs) await expect(own).toContainText(paragraph[locale]); }
      await expect(page).toHaveTitle(`${profile.seo!.title[locale]} | FermatMind`); await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", profile.seo!.description[locale]); await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${path}`); await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/skills-audit/results/${profile.id}`); const image = await request.get(`/og/fun/skills-audit?locale=${locale}&portrait=${profile.id}`); expect(image.status()).toBe(200); expect(image.headers()["content-type"]).toContain("image/png");
      if (profile === quiz.profiles[0]) { const privateQuery = await request.get(`/og/fun/skills-audit?locale=${locale}&portrait=${profile.id}&state=recent&answers=SYNTHETIC_PRIVATE_ANSWER`); expect(privateQuery.status()).toBe(200); expect(await privateQuery.body()).toEqual(await image.body()); }
    }
  }
  expect((await request.get("/en/tests/explore/skills-audit/results/expert")).status()).toBe(404); expect((await request.get("/og/fun/skills-audit?portrait=beginner")).status()).toBe(404);
});
