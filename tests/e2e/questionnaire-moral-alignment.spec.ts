import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/moral-alignment.json", "utf8")) as Questionnaire;
async function finish(page: Page, locale: "en" | "zh", mode: "lawful-good" | "neutral" | "boundary") {
  const used: Record<string, number> = { lawful: 0, good: 0 };
  for (const [index, question] of quiz.questions.entries()) {
    const high = question.options.some(o => o.directionId === "lawful") ? "lawful" : "good";
    const low = high === "lawful" ? "chaotic" : "evil";
    const endpoint = mode === "boundary" && used[high]++ >= 4 ? low : high;
    const option = mode === "neutral" ? question.options[0] : question.options.find(o => o.directionId === endpoint)!;
    const radio = page.locator(`input[name="${question.id}"][value="${option.id}"]`);
    if (index === 0) { await radio.focus(); await page.keyboard.press("Space"); await expect(radio).toBeChecked(); }
    else await radio.check();
    await expect(page.locator("[data-alignment-count]")).toHaveCount(0);
    await page.getByRole("button", { name: index === 23 ? (locale === "zh" ? "查看完整结果" : "See full result") : (locale === "zh" ? "下一题" : "Next"), exact: true }).click();
  }
  await expect(page.getByRole("heading", { level: 2, name: quiz.resultHeading![locale], exact: true })).toBeFocused();
  await expect(page.locator("[data-alignment-count]")).toHaveCount(4);
  await expect(page.locator("[data-alignment-cell]")).toHaveCount(9);
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(node => node.id));
  expect(new Set(ids).size).toBe(ids.length);
  const expected = mode === "lawful-good" ? ["lawful-good"] : mode === "neutral" ? ["true-neutral"] : ["chaotic-evil", "chaotic-neutral", "neutral-evil", "true-neutral"];
  await expect(page.locator("[data-alignment-match]")).toHaveCount(expected.length);
  for (const id of expected) await expect(page.locator(`[data-alignment-match="${id}"] h4`)).toHaveCount(9);
  for (const high of ["lawful", "good"]) await expect(page.locator(`[data-alignment-count="${high}"]`)).toContainText(`${mode === "lawful-good" ? 12 : mode === "neutral" ? 6 : 4} / 12`);
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/moral-alignment`;
  test(`@release Moral Alignment ${locale}: hub, keyboard,24choices, complete single result, neutral retake and clear`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } }));
    const posts: string[] = [];
    page.on("request", request => { if (request.method() === "POST" && /ALIGN_[0-9]{2}/.test(request.postData() ?? "")) posts.push(request.url()); });
    await page.goto(`/${locale}/tests`); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await expect(page.getByRole("link", { name: zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions" })).toHaveCount(0);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    await finish(page, locale, "lawful-good");
    await page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click();
    const shared = await page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue();
    expect(shared.split("\n").at(-1)).toBe(`https://fermatmind.com${entry}/results/lawful-good`);
    expect(shared).not.toMatch(/ALIGN_|12\s*\/\s*12|answers|[?&]score/);
    await expect(page.getByRole("link", { name: zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions" })).toHaveAttribute("href", /target_action=questionnaire_result_mbti/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click();
    await finish(page, locale, "neutral");
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click();
    await expect(page.locator("[data-alignment-count]")).toHaveCount(0); await expect(page.getByRole("radio").first()).not.toBeChecked();
    expect(posts).toEqual([]);
  });
  test(`@release Moral Alignment ${locale}: opt-in draft survives reload, language change, edit and clear`, async ({ page }) => {
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.locator('input[value="B"]').check(); await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await page.reload();
    await page.getByRole("button", { name: zh ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click();
    await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[value="B"]')).toBeChecked();
    await page.locator('input[value="A"]').check();
    const other = zh ? "en" : "zh";
    await page.goto(`/${other}/tests/explore/moral-alignment`);
    await page.getByRole("button", { name: other === "zh" ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click();
    await page.getByRole("button", { name: other === "zh" ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[value="A"]')).toBeChecked();
    await page.getByRole("button", { name: other === "zh" ? "退出并清除本次进度" : "Exit and clear this attempt", exact: true }).click();
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:moral-alignment"))).toBeNull();
  });
  test(`@release Moral Alignment ${locale}: denied storage, four boundary matches show36sections and private-safe sharing`, async ({ page }) => {
    await page.addInitScript(() => {
      const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
      Storage.prototype.getItem = function(key) { if (key.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return get.call(this, key); };
      Storage.prototype.setItem = function(key, value) { if (key.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return set.call(this, key, value); };
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } });
    });
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.getByRole("checkbox").check(); await expect(page.getByRole("status")).toContainText(zh ? "无法保存" : "could not save");
    await finish(page, locale, "boundary");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click();
    const text = await page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue();
    for (const id of ["chaotic-evil", "chaotic-neutral", "neutral-evil", "true-neutral"]) expect(text).toContain(quiz.profiles.find(p => p.id === id)!.title[locale]);
    expect(text).not.toMatch(/ALIGN_[0-9]{2}|answers|form_code|submission|4\s*\/\s*12|[?&]score/);
    const url = new URL(text.split("\n").at(-1)!); expect(url.pathname).toBe(entry); expect(url.search).toBe(""); expect(url.hash).toBe("");
  });
}

test("@release Moral Alignment all18full public guides, bilingual images and closed identities", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) for (const profile of quiz.profiles) {
    const path = `/${locale}/tests/explore/moral-alignment/results/${profile.id}`;
    expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
    await expect(page.locator("[data-alignment-count]")).toHaveCount(0);
    for (const section of profile.sections) await expect(page.locator(`#report-${section.id} h2`)).toHaveText(section.title[locale]);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/moral-alignment/results/${profile.id}`);
    await expect(page.getByRole("link", { name: locale === "zh" ? "免费开始完整测试" : "Start the full test for free", exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/moral-alignment#take-test`);
    const image = await request.get(`/og/fun/moral-alignment?locale=${locale}&portrait=${profile.id}&v=1.0.0`); expect(image.status()).toBe(200);
    const bytes = await image.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
  }
  for (const path of ["/en/tests/explore/moral-alignment/results/unknown", "/zh/tests/explore/moral-alignment/results/ALIGN_01", "/en/tests/play/moral-alignment"]) expect((await request.get(path)).status()).toBe(404);
});
