import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const stimuli = JSON.parse(readFileSync("tests/fixtures/questionnaires/inkblot-personality-quiz-reference.json", "utf8")).stimuli as { src: string; sha256: string }[];
import type { Questionnaire } from "../../lib/questionnaires/types";

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/inkblot-personality-quiz.json", "utf8")) as Questionnaire;
async function finish(page: Page, locale: "en" | "zh", mode: "whole-form" | "tie") {
  for (const [index, question] of quiz.questions.entries()) {
    const option = mode === "tie" ? question.options[0] : question.options.find(o => o.directionId === "whole-form") ?? question.options[0];
    const image = page.locator(`[data-inkblot-stimulus="${question.id}"] img`);
    await expect(image).toBeVisible();
    await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    const source = await image.getAttribute("src");
    if (!source) throw new Error("Visible original image has no source");
    const imageUrl = new URL(source, page.url());
    expect(imageUrl.origin).toBe(new URL(page.url()).origin);
    expect(imageUrl.pathname).toBe(`/images/questionnaires/inkblot-original/fm-inkblot-${String(index + 1).padStart(2, "0")}.svg`);
    await expect(page.locator(`[data-inkblot-stimulus="${question.id}"] figcaption p`)).not.toBeEmpty();
    const radio = page.locator(`input[name="${question.id}"][value="${option.id}"]`);
    if (index === 0) { await radio.focus(); await page.keyboard.press("Space"); await expect(radio).toBeChecked(); }
    else await radio.check();
    if (index < 9) await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
    await page.getByRole("button", { name: index === 9 ? (locale === "zh" ? "查看完整结果" : "See full result") : (locale === "zh" ? "下一题" : "Next"), exact: true }).click();
  }
  await expect(page.getByRole("heading", { level: 2, name: quiz.resultHeading![locale], exact: true })).toBeFocused();
  await expect(page.locator("[data-archetype-count]")).toHaveCount(5);
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(node => node.id));
  expect(new Set(ids).size).toBe(ids.length);
  if (mode === "whole-form") {
    await expect(page.locator('[data-archetype-count="whole-form"]')).toContainText("8 / 8");
    await expect(page.locator("[data-archetype-match]")).toHaveCount(1);
    await expect(page.locator('[data-archetype-match="whole-form"] h4')).toHaveCount(9);
  } else {
    for (const theme of quiz.directions) {
      await expect(page.locator(`[data-archetype-count="${theme.id}"]`)).toContainText("2 / 8");
      await expect(page.locator(`[data-archetype-match="${theme.id}"] h4`)).toHaveCount(9);
    }
    await expect(page.locator("[data-archetype-match]")).toHaveCount(5);
    await expect(page.locator("#take-test h4")).toHaveCount(45);
  }
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/inkblot-personality-quiz`;
  test(`@release Original inkblot reading ${locale}: hub, keyboard,10realvisualchoices, full unique match and retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const posts: string[] = [];
    page.on("request", request => { if (request.method() === "POST" && /INK_[0-9]{2}/.test(request.postData() ?? "")) posts.push(request.url()); });
    await page.goto(`/${locale}/tests`); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.getByText(zh ? "原创墨迹视觉趣味 · 完整结果免费" : "Original inkblot visual quiz · Full results free", { exact: true })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await expect(page.getByRole("link", { name: zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions" })).toHaveCount(0);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await expect.poll(() => page.locator("#take-test img").evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    await finish(page, locale, "whole-form");
    await expect(page.getByRole("link", { name: zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions" })).toHaveAttribute("href", /target_action=questionnaire_result_mbti/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click();
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0); await expect(page.getByRole("radio").first()).not.toBeChecked();
    expect(posts).toEqual([]);
  });
  test(`@release Original inkblot reading ${locale}: opted-in tab draft survives reload, language change, edit and clear`, async ({ page }) => {
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.locator('input[value="B"]').check(); await page.getByRole("checkbox").check();
    await expect(page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true })).toBeEnabled();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await page.reload();
    await page.getByRole("button", { name: zh ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click();
    await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[value="B"]')).toBeChecked();
    await page.locator('input[value="C"]').check();
    const other = zh ? "en" : "zh";
    await page.goto(`/${other}/tests/explore/inkblot-personality-quiz`);
    await page.getByRole("button", { name: other === "zh" ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click();
    await page.getByRole("button", { name: other === "zh" ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[value="C"]')).toBeChecked();
    await page.getByRole("button", { name: other === "zh" ? "退出并清除本次进度" : "Exit and clear this attempt", exact: true }).click();
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:inkblot-personality-quiz"))).toBeNull();
  });
  test(`@release Original inkblot reading ${locale}: denied storage, five-way tie shows45sections and private-safe clipboard fallback`, async ({ page }) => {
    await page.addInitScript(() => {
      const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
      Storage.prototype.getItem = function(key) { if (key.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return get.call(this, key); };
      Storage.prototype.setItem = function(key, value) { if (key.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return set.call(this, key, value); };
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } });
    });
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.getByRole("checkbox").check(); await expect(page.getByRole("status")).toContainText(zh ? "无法保存" : "could not save");
    await finish(page, locale, "tie");
    await page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click();
    const text = await page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue();
    for (const profile of quiz.profiles) expect(text).toContain(profile.title[locale]);
    expect(text).not.toMatch(/INK_[0-9]{2}|answers|form_code|submission|6\s*\/\s*24|[?&]score/);
    const url = new URL(text.split("\n").at(-1)!); expect(url.pathname).toBe(entry); expect(url.search).toBe(""); expect(url.hash).toBe("");
  });
}

test("@release Original inkblot reading all10public full guides, bilingual images and closed identities", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) for (const profile of quiz.profiles) {
    const path = `/${locale}/tests/explore/inkblot-personality-quiz/results/${profile.id}`;
    expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
    for (const section of profile.sections) await expect(page.locator(`#report-${section.id} h2`)).toHaveText(section.title[locale]);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/inkblot-personality-quiz/results/${profile.id}`);
    await expect(page.getByRole("link", { name: locale === "zh" ? "免费开始完整测试" : "Start the full test for free", exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/inkblot-personality-quiz#take-test`);
    const image = await request.get(`/og/fun/inkblot-personality-quiz?locale=${locale}&portrait=${profile.id}&v=1.0.0`); expect(image.status()).toBe(200);
    const bytes = await image.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
  }
  for (const stimulus of stimuli) {
    const response = await request.get(stimulus.src); expect(response.status()).toBe(200);
    expect(createHash("sha256").update(await response.body()).digest("hex")).toBe(stimulus.sha256);
  }
  for (const locale of ["en", "zh"] as const) {
    const blocked = "**/images/questionnaires/inkblot-original/fm-inkblot-01.svg";
    await page.route(blocked, route => route.abort("failed"));
    await page.goto(`/${locale}/tests/explore/inkblot-personality-quiz`);
    await page.getByRole("button", { name: locale === "zh" ? "开始测试" : "Start test", exact: true }).click();
    await expect(page.locator("#take-test").getByRole("alert")).toContainText(locale === "zh" ? "图像暂不可用" : "image is unavailable");
    await page.getByRole("radio").first().check();
    await expect(page.getByRole("button", { name: locale === "zh" ? "下一题" : "Next", exact: true })).toBeDisabled();
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
    await page.unroute(blocked);
    await page.getByRole("button", { name: locale === "zh" ? "退出并清除本次进度" : "Exit and clear this attempt", exact: true }).click();
    await page.getByRole("button", { name: locale === "zh" ? "开始测试" : "Start test", exact: true }).click();
    await expect(page.getByRole("button", { name: locale === "zh" ? "下一题" : "Next", exact: true })).toBeEnabled();
    await expect.poll(() => page.locator("#take-test img").evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(720);
  }
  for (const path of ["/en/tests/explore/inkblot-personality-quiz/results/unknown", "/zh/tests/explore/inkblot-personality-quiz/results/INK_01", "/en/tests/play/inkblot-personality-quiz"]) expect((await request.get(path)).status()).toBe(404);
});
