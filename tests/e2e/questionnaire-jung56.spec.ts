import { test, expect, type Page } from "@playwright/test";
import bank from "../../lib/questionnaires/jung56Bank.json";
import content from "../../lib/questionnaires/jung56Content.json";
type Locale = "en" | "zh";
const path = (l: Locale) => `/${l}/tests/explore/cognitive-functions-test`;
const label = (l: Locale, en: string, zh: string) => l === "zh" ? zh : en;
async function button(page: Page, l: Locale, en: string, zh: string) { await page.getByRole("button", { name: label(l, en, zh), exact: true }).click(); }
async function choose56(page: Page) { const decline = page.getByRole("button", { name: /^(Decline|拒绝)$/ }); if (await decline.isVisible()) await decline.click(); const choose = page.locator('[data-cognitive-method="paired56"]'); await choose.click(); await expect(page.locator("[data-jung56-client]")).toBeVisible(); }
async function enter(page: Page, l: Locale) { await page.goto(path(l)); const decline = page.getByRole("button", { name: label(l, "Decline", "拒绝"), exact: true }); if (await decline.isVisible()) await decline.click(); await choose56(page); }
async function finish(page: Page, l: Locale, codes: string, edit = false) {
  await button(page, l, "Start the 56 choices", "开始56题二选一"); await expect(page.locator("#jung56-question")).toBeFocused();
  await button(page, l, "Next", "下一题"); await expect(page.locator("[data-jung56-client]").getByRole("status")).toContainText(label(l, "Choose A or B", "请选择A或B"));
  for (const [i, question] of bank.questions.entries()) {
    await expect(page.locator("#jung56-question")).toHaveText(question.instruction[l]);
    for (const option of question.options) await expect(page.locator(`[data-jung56-client] label`).filter({ has: page.locator(`input[name="${question.id}"][value="${option.id}"]`) })).toContainText(option.label[l]);
    const choice = page.locator(`input[name="${question.id}"][value="${codes[i]}"]`);
    if (!i) { await choice.focus(); await choice.press("Space"); } else await choice.check();
    if (edit && i === 1) { await button(page, l, "Back", "上一题"); const first = bank.questions[0]; await expect(page.locator(`input[name="${first.id}"][value="${codes[0]}"]`)).toBeChecked(); await page.locator(`input[name="${first.id}"][value="B"]`).check(); await page.locator(`input[name="${first.id}"][value="${codes[0]}"]`).check(); await button(page, l, "Next", "下一题"); }
    await expect(page.locator("[data-jung56-counts]")).toHaveCount(0);
    await button(page, l, i === 55 ? "Finish and view all eight directions" : "Next", i === 55 ? "完成并查看八方向" : "下一题");
  }
  await expect(page.locator("#take-test h2")).toBeFocused(); await expect(page.locator("[data-jung56-counts] > div")).toHaveCount(8);
}
for (const l of ["en", "zh"] as const) {
  test(`@release Jung56 ${l}: all56 source choices, keyboard/back, full eight-way tie, all8 explanations and public sharing`, async ({ page, context }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    if (l === "en") await context.grantPermissions(["clipboard-read", "clipboard-write"]); else await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw Error("Synthetic clipboard unavailable"); } } }));
    const leaks: string[] = [], errors: string[] = []; page.on("pageerror", e => errors.push(e.message)); page.on("request", r => { if (r.method() === "POST" && /JUNG_FC_|"answers"|"wins"|"topDirectionIds"/.test(r.postData() ?? "")) leaks.push(r.url()); });
    await enter(page, l); await finish(page, l, "A".repeat(56), true);
    await expect(page.locator("[data-jung56-tie]")).toContainText(label(l, "All eight directions", "八个方向均为7次"));
    for (const card of content.cards) {
      await expect(page.locator(`[data-jung56-count="${card.id}"]`)).toHaveText("7 / 14");
      const full = page.locator(`[data-jung56-full="${card.id}"]`); await full.locator("..").locator("summary").click(); await expect(full).toBeVisible(); await expect(full.locator("h4")).toHaveCount(10);
      for (const key of ["construct_definition", "attention_focus", "processing_pattern", "interpretation_boundary"] as const) await expect(full).toContainText(card[key][l]);
      for (const key of ["observable_tendencies", "possible_contributions", "possible_blind_spots", "balance_practices", "reflection_questions", "does_not_mean"] as const) for (const paragraph of card[key]) await expect(full).toContainText(paragraph[l]);
    }
    await page.locator("#take-test h2").evaluate(el => el.scrollIntoView({ block: "start" })); await page.screenshot({ path: test.info().outputPath(`${l}-jung56-tie.png`) });
    await button(page, l, "Copy public entry", "复制公开入口"); const copied = `${label(l, "Cognitive Functions Test · 56-choice edition", "认知功能测试 · 56题二选一版")}\nhttps://fermatmind.com${path(l)}`;
    if (l === "en") expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(copied); else await expect(page.locator("#take-test textarea")).toHaveValue(copied);
    expect(new URL(page.url()).search).toBe(""); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:cognitive-functions-test"))).toBeNull(); expect(errors).toEqual([]); expect(leaks).toEqual([]);
    await button(page, l, "Clear and retake the 56 choices", "清空并重新作答56题"); await button(page, l, "Start the 56 choices", "开始56题二选一"); await expect(page.locator('#take-test input[type="radio"]:checked')).toHaveCount(0); await button(page, l, "Exit and clear the 56-choice responses", "退出并清除56题回答");
  });
  test(`@release Jung56 ${l}: actual-source single-top witness, fourteen appearances and separate next step`, async ({ page }) => {
    await enter(page, l); await finish(page, l, "AB".repeat(7) + "A".repeat(42));
    await expect(page.locator('[data-jung56-count="se"]')).toHaveText("14 / 14"); for (const id of ["si", "ne", "ni", "te", "ti", "fe", "fi"]) await expect(page.locator(`[data-jung56-count="${id}"]`)).toHaveText("6 / 14");
    await expect(page.locator("[data-jung56-tie]")).toContainText(content.cards[0].display_name[l]);
    await page.locator('[data-jung56-full="se"]').locator("..").locator("summary").click(); await page.locator('[data-jung56-full="se"] h4').first().evaluate(el => el.scrollIntoView({ block: "start" })); await page.screenshot({ path: test.info().outputPath(`${l}-jung56-guide.png`) });
    await page.getByRole("link", { name: label(l, "View the separate MBTI assessment entry", "查看独立MBTI测评入口"), exact: true }).click(); await expect(page).toHaveURL(u => u.pathname === `/${l}/tests/mbti-personality-test-16-personality-types`); await expect(page.locator("h1")).toBeVisible();
  });
  test(`@release Jung56 ${l}: incomplete refresh/language/version clearing and public explanations ignore private query`, async ({ page }) => {
    const response = await page.goto(path(l)); expect(await response!.text()).not.toContain(bank.questions[0].options[0].label.en); await choose56(page); await button(page, l, "Start the 56 choices", "开始56题二选一"); await page.locator('input[name="JUNG_FC_001"][value="A"]').check(); await page.reload(); await choose56(page); await button(page, l, "Start the 56 choices", "开始56题二选一"); await expect(page.locator('#take-test input[type="radio"]:checked')).toHaveCount(0); await expect(page.locator("[data-jung56-counts]")).toHaveCount(0);
    await page.locator('input[name="JUNG_FC_001"][value="B"]').check(); const other = l === "en" ? "zh" : "en"; await page.goto(path(other)); await choose56(page); await button(page, other, "Start the 56 choices", "开始56题二选一"); await expect(page.locator('#take-test input[type="radio"]:checked')).toHaveCount(0);
    await button(page, other, "Switch method and clear responses", "切换方法并清除回答"); await page.locator('[data-cognitive-method="ratings32"]').click(); await button(page, other, "Start test", "开始测试"); await page.locator('input[name="CF_NI_01"][value="4"]').check(); await page.getByRole("checkbox").check(); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:cognitive-functions-test"))).not.toBeNull();
    await button(page, other, "Switch method and clear responses", "切换方法并清除回答"); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:cognitive-functions-test"))).toBeNull(); await choose56(page); await button(page, other, "Start the 56 choices", "开始56题二选一"); await expect(page.locator('#take-test input[type="radio"]:checked')).toHaveCount(0);
    await page.goto(`${path(l)}/results/se?answers=SYNTHETIC_PRIVATE&wins=14`); await expect(page.locator("[data-jung56-counts]")).toHaveCount(0); const guide = page.locator('[data-jung56-full="se"]'); await expect(guide).toBeVisible(); await expect(guide).toContainText(content.cards[0].interpretation_boundary[l]); await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${path(l)}/results/se`);
  });
}
