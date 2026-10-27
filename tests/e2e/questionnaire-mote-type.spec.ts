import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import type { Questionnaire } from "../../lib/questionnaires/types";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/mote-type.json", "utf8")) as Questionnaire;
const poles = ["EXPRESSIVE_ENERGY", "DIRECT_CLARITY", "IMMEDIATE_RESPONSE", "OPEN_SHARING"];
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
async function finish(page: Page, locale: "en" | "zh", counts: number[]) {
  for (let i = 0; i < 24; i++) {
    const group = Math.floor(i / 6), q = quiz.questions[i], left = i % 6 < counts[group];
    const value = q.options.find(o => (o.directionId === poles[group]) === left)!.id;
    const radio = page.locator(`input[name="${q.id}"][value="${value}"]`);
    if (i === 0) { await radio.focus(); await radio.press("Space"); } else await radio.check();
    if (i === 1) await headingBelowHeader(page);
    await page.getByRole("button", { name: i === 23 ? (locale === "zh" ? "查看完整结果" : "See full result") : (locale === "zh" ? "下一题" : "Next"), exact: true }).click();
  }
  await expect(page.locator("[data-interaction-pairs-result]")).toBeVisible(); await expect(page.locator("[data-interaction-pair]")).toHaveCount(4);
  for (let i = 0; i < 4; i++) {
    const part = page.locator("[data-interaction-pair]").nth(i);
    await expect(part.locator("[data-interaction-count]").nth(0)).toHaveText(`${counts[i]} / 6`);
    await expect(part.locator("[data-interaction-count]").nth(1)).toHaveText(`${6 - counts[i]} / 6`);
    await expect(part.locator("[data-interaction-tie]")).toHaveAttribute("data-interaction-tie", counts[i] === 3 ? "true" : "false");
  }
  for (const profile of quiz.profiles) for (const section of profile.sections) for (const text of section.paragraphs) await expect(page.locator("[data-interaction-pairs-result]")).toContainText(text[locale]);
  expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:mote-type"))).toBeNull();
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/mote-type`;
  test(`@release interaction pairs ${locale}: hub, both sides, ties, keyboard and all four complete readings`, async ({ page }) => {
    const sensitivePosts: string[] = []; page.on("request", request => { if (request.method() === "POST" && /ATTRACTION_PC_[0-9]{3}|answers|interactionPairs/.test(request.postData() ?? "")) sensitivePosts.push(request.url()); });
    await page.goto(`/${locale}/tests`); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]); await expect(page.locator('[aria-labelledby="questionnaire-method"] p')).toHaveCount(3); for (const section of quiz.guide.filter(s => ["original", "counting", "complete"].includes(s.id))) for (const paragraph of section.paragraphs) await expect(page.locator('[aria-labelledby="questionnaire-method"]').getByText(paragraph[locale], { exact: true })).toBeVisible(); await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await headingBelowHeader(page);
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    for (const [index, counts] of [[6, 6, 6, 6], [0, 0, 0, 0], [1, 3, 4, 6]].entries()) {
      if (index !== 0) { await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click(); await expect(page.locator("[data-interaction-pairs-result]")).toHaveCount(0); await expect(page.getByRole("radio").first()).not.toBeChecked(); }
      await finish(page, locale, counts);
    }
    expect(sensitivePosts).toEqual([]); expect(new URL(page.url()).search).toBe("");
  });
  test(`@release interaction pairs ${locale}: opt-in draft, language switch, editing, reset and no unrequested storage`, async ({ page }) => {
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await page.locator('input[name="ATTRACTION_PC_001"][value="A"]').check(); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:mote-type"))).toBeNull(); await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await page.reload(); await page.getByRole("button", { name: zh ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click(); await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[name="ATTRACTION_PC_001"][value="A"]')).toBeChecked(); await page.locator('input[name="ATTRACTION_PC_001"][value="B"]').check();
    const other = zh ? "en" : "zh"; await page.goto(`/${other}/tests/explore/mote-type`); await page.getByRole("button", { name: other === "zh" ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click(); await page.getByRole("button", { name: other === "zh" ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[name="ATTRACTION_PC_001"][value="B"]')).toBeChecked();
    await page.getByRole("button", { name: other === "zh" ? "退出并清除本次进度" : "Exit and clear this attempt", exact: true }).click(); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:mote-type"))).toBeNull();
  });
  test(`@release interaction pairs ${locale}: mobile, all ties and public-only sharing`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); await page.addInitScript(() => { Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } }); });
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await finish(page, locale, [3, 3, 3, 3]);
    await expect(page.locator('[data-interaction-tie="true"]')).toHaveCount(4);
    await page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click(); const text = await page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue(); expect(text).toContain(quiz.title[locale]); expect(text).not.toMatch(/ATTRACTION_PC_[0-9]{3}|answers|form_code|submission|3\s*\/\s*6|[?&]score/); const url = new URL(text.split("\n").at(-1)!); expect(url.pathname).toBe(entry); expect(url.search).toBe(""); expect(url.hash).toBe("");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
test("@release interaction pairs all ten native pages and images, independent metadata, public-only queries and closed IDs", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) {
    const entry = await request.get(`/og/fun/mote-type?locale=${locale}`); expect(entry.status()).toBe(200); expect(entry.headers()["content-type"]).toContain("image/png");
    for (const p of quiz.profiles) {
      const path = `/${locale}/tests/explore/mote-type/results/${p.id}`; expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(p.title[locale]); await expect(page).toHaveTitle(`${p.seo!.title[locale]} | FermatMind`); await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", p.seo!.description[locale]); await expect(page.locator("[data-interaction-count]")).toHaveCount(0);
      for (const s of p.sections) { const own = page.locator(`#report-${s.id}`); await expect(own.getByRole("heading", { level: 2 })).toHaveText(s.title[locale]); for (const text of s.paragraphs) await expect(own).toContainText(text[locale]); }
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${path}`); await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/mote-type/results/${p.id}`);
      const image = await request.get(`/og/fun/mote-type?locale=${locale}&portrait=${p.id}`); expect(image.status()).toBe(200); expect(image.headers()["content-type"]).toContain("image/png");
      const privateQuery = await request.get(`/og/fun/mote-type?locale=${locale}&portrait=${p.id}&score=6&answers=SYNTHETIC_PRIVATE_ANSWER`); expect(privateQuery.status()).toBe(200); expect(await privateQuery.body()).toEqual(await image.body());
    }
  }
  expect((await request.get("/en/tests/explore/mote-type/results/healing")).status()).toBe(404); expect((await request.get("/og/fun/mote-type?portrait=regal")).status()).toBe(404);
});
