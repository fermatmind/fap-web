import { test, expect, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";

test.beforeEach(async ({page}) => {
  await page.addInitScript(() => { localStorage.setItem("fm_consent_v1", JSON.stringify({analytics: "denied", updatedAt: new Date().toISOString()})); });
});
const additions = JSON.parse(readFileSync("lib/questionnaires/result-content/bleach.json", "utf8")) as Record<string, unknown[]>;
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/bleach.json", "utf8")) as Questionnaire;
async function finish(page: Page, locale: "en" | "zh", mode: "ichigo-kurosaki" | "tie" | "two") {
  for (const [index, question] of quiz.questions.entries()) {
    const two = ["C","C","B","B","A","B","B","A","D","D","A","C","C","B","C","C","D","C","C","D","D"];
    const option = mode === "two" ? question.options.find(o => o.id === two[index])! : mode === "tie" ? question.options[0] : question.options.find(o => o.directionId === "ichigo-kurosaki") ?? question.options[0];
    const radio = page.locator(`input[name="${question.id}"][value="${option.id}"]`);
    if (index === 0) { await radio.focus(); await page.keyboard.press("Space"); await expect(radio).toBeChecked(); }
    else await radio.check();
    if (index < 20) await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
    await page.getByRole("button", { name: index === 20 ? (locale === "zh" ? "查看完整结果" : "See full result") : (locale === "zh" ? "下一题" : "Next"), exact: true }).click();
  }
  await expect(page.getByRole("heading", { level: 2, name: quiz.resultHeading![locale], exact: true })).toBeFocused();
  await expect(page.locator("[data-archetype-count]")).toHaveCount(7);
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(node => node.id));
  expect(new Set(ids).size).toBe(ids.length);
  if (mode === "ichigo-kurosaki") {
    await expect(page.locator('[data-archetype-count="ichigo-kurosaki"]')).toContainText("12 / 12");
    await expect(page.locator("[data-archetype-match]")).toHaveCount(1);
    await expect(page.locator('[data-archetype-match="ichigo-kurosaki"] h4')).toHaveCount(quiz.profiles[0].sections.length + additions[quiz.profiles[0].id].length);
  } else if (mode === "two") {
    await expect(page.locator("[data-archetype-match]")).toHaveCount(2);
    await expect(page.locator('[data-archetype-count="ichigo-kurosaki"]')).toContainText("4 / 12");
    await expect(page.locator('[data-archetype-count="byakuya-kuchiki"]')).toContainText("4 / 12");
  } else {
    for (const theme of quiz.directions) {
      await expect(page.locator(`[data-archetype-count="${theme.id}"]`)).toContainText("3 / 12");
      await expect(page.locator(`[data-archetype-match="${theme.id}"] h4`)).toHaveCount(quiz.profiles.find(p => p.id === theme.id)!.sections.length + additions[theme.id].length);
    }
    await expect(page.locator("[data-archetype-match]")).toHaveCount(7);
    await expect(page.locator("#take-test h4")).toHaveCount(quiz.profiles.reduce((sum,p) => sum + p.sections.length + additions[p.id].length, 0));
  }
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/bleach`;
  for (const width of [390, 1440]) test(`@release BLEACH ordinary fan choices ${locale} ${width}: hub, keyboard,21realchoices, full unique match and retake`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    const posts: string[] = [];
    page.on("request", request => { if (request.method() === "POST" && /BLEACH_[0-9]{2}/.test(request.postData() ?? "")) posts.push(request.url()); });
    await page.goto(`/${locale}/tests`); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.getByText(zh ? "原创象征测验 · 完整结果免费" : "Original symbolic quiz · Full results free", { exact: true })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await expect(page.getByRole("link", { name: zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions" })).toHaveCount(0);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    await finish(page, locale, "ichigo-kurosaki");
    await expect(page.locator("[data-bleach-reveal]")).toBeVisible();
    await expect(page.locator("[data-bleach-choice-reasons] li")).toHaveCount(2);
    const sharing = page.locator("[data-bleach-sharing]");
    const download = page.waitForEvent("download");
    await sharing.getByRole("button", {name: zh ? "保存BLEACH角色卡片" : "Save BLEACH card", exact: true}).click();
    const file = await download;
    expect(file.suggestedFilename()).toBe(`fermatmind-bleach-${locale}-landscape.png`);
    const image = sharing.locator("img"); await expect(image).toBeVisible();
    await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(1200);
    if (process.env.BLEACH_QA_ARTIFACTS) {
      mkdirSync(process.env.BLEACH_QA_ARTIFACTS, {recursive: true});
      await file.saveAs(join(process.env.BLEACH_QA_ARTIFACTS, `single-${locale}-${width}.png`));
      await page.locator("[data-bleach-reveal]").screenshot({path: join(process.env.BLEACH_QA_ARTIFACTS, `reveal-${locale}-${width}.png`)});
    }
    await sharing.getByRole("combobox").selectOption("portrait");
    const tall = page.waitForEvent("download");
    await sharing.getByRole("button", {name: zh ? "保存BLEACH角色卡片" : "Save BLEACH card", exact: true}).click();
    await tall;
    await expect.poll(() => sharing.locator("img").evaluate((img: HTMLImageElement) => [img.naturalWidth, img.naturalHeight])).toEqual([1080,1920]);

    await expect(page.getByRole("link", { name: zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions" })).toHaveAttribute("href", /target_action=questionnaire_result_mbti/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click();
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0); await expect(page.getByRole("radio").first()).not.toBeChecked();
    expect(posts).toEqual([]);
  });
  test(`@release BLEACH ${locale}: standalone reload and language change keep answers private`, async ({ page }) => {
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.locator('input[value="B"]').check();
    await expect(page.getByRole("checkbox")).toHaveCount(0);
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await page.reload();
    await expect(page.locator(`input[name="${quiz.questions[0].id}"]`).first()).toBeVisible();
    await expect(page.getByRole("radio").first()).not.toBeChecked();
    const other = zh ? "en" : "zh";
    await page.goto(`/${other}/tests/explore/bleach/take`);
    await expect(page.locator(`input[name="${quiz.questions[0].id}"]`).first()).toBeVisible();
    await expect(page.getByRole("radio").first()).not.toBeChecked();
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:bleach"))).toBeNull();
  });
  for (const width of [390, 1440]) test(`@release BLEACH ordinary fan choices ${locale} ${width}: denied storage, seven-way tie keeps all full readings and private-safe clipboard fallback`, async ({ page }) => {
    await page.setViewportSize({width, height: 844});
    await page.addInitScript(() => {
      const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
      Storage.prototype.getItem = function(key) { if (key.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return get.call(this, key); };
      Storage.prototype.setItem = function(key, value) { if (key.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return set.call(this, key, value); };
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } });
    });
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await expect(page.getByRole("checkbox")).toHaveCount(0);
    await finish(page, locale, "tie");
    await expect(page.locator("[data-bleach-reveal] > ul > li")).toHaveCount(7);
    const sharing = page.locator("[data-bleach-sharing]");
    const download = page.waitForEvent("download");
    await sharing.getByRole("button", {name: zh ? "保存BLEACH角色卡片" : "Save BLEACH card", exact: true}).click();
    const file = await download;
    if (process.env.BLEACH_QA_ARTIFACTS) {
      await file.saveAs(join(process.env.BLEACH_QA_ARTIFACTS, `tie-${locale}-${width}-landscape.png`));
    }
    for (const profile of quiz.profiles) await expect(sharing.locator("img")).toHaveAttribute("alt", new RegExp(profile.title[locale].split(/[:：]/)[0]));
    await sharing.getByRole("combobox").selectOption("portrait");
    const tall = page.waitForEvent("download");
    await sharing.getByRole("button", {name: zh ? "保存BLEACH角色卡片" : "Save BLEACH card", exact: true}).click();
    const tallFile = await tall;
    if (process.env.BLEACH_QA_ARTIFACTS) await tallFile.saveAs(join(process.env.BLEACH_QA_ARTIFACTS, `tie-${locale}-${width}-portrait.png`));
    await expect.poll(() => sharing.locator("img").evaluate((img: HTMLImageElement) => [img.naturalWidth,img.naturalHeight])).toEqual([1080,1920]);
    await sharing.getByRole("button", {name: zh ? "分享BLEACH角色图片" : "Share BLEACH image", exact: true}).click();
    await expect(sharing.getByRole("status")).toContainText(zh ? "不支持直接分享" : "cannot share images directly");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

    await page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click();
    const text = await page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue();
    for (const profile of quiz.profiles) expect(text).toContain(profile.title[locale]);
    expect(text).not.toMatch(/BLEACH_[0-9]{2}|answers|form_code|submission|3\s*\/\s*12|[?&]score/);
    const url = new URL(text.split("\n").at(-1)!); expect(url.pathname).toBe(entry); expect(url.search).toBe(""); expect(url.hash).toBe("");
  });
  test(`@release BLEACH ${locale}: two-way reveal, guide return and failed PNG fallback`, async ({page}) => {
    await page.goto(`${entry}/take`); await finish(page, locale, "two");
    const reveal = page.locator("[data-bleach-reveal]");
    await expect(reveal.locator(":scope > ul > li")).toHaveCount(2);
    await reveal.getByRole("link", {name: zh ? "阅读公开人物指南" : "Read public character guide", exact: true}).first().click();
    await expect(page).toHaveURL(new RegExp(`${entry}/results/ichigo-kurosaki$`));
    await expect(page.locator("[data-bleach-public-portrait]")).toBeVisible();
    await page.getByRole("link", {name: zh ? "免费开始完整测试" : "Start the full test for free", exact: true}).click();
    await page.getByRole("button", {name: zh ? "开始测试" : "Start test", exact: true}).click();
    await finish(page, locale, "two");
    await page.route("**/images/quiz-portraits/bleach/*.svg", route => route.fulfill({status: 503, body: "synthetic failure"}));
    const sharing = page.locator("[data-bleach-sharing]");
    await sharing.getByRole("button", {name: zh ? "保存BLEACH角色卡片" : "Save BLEACH card", exact: true}).click();
    await expect(sharing.getByRole("status")).toContainText(zh ? "暂时无法生成图片" : "Could not create the image");
    await expect(page.getByRole("button", {name: zh ? "复制结果与链接" : "Copy result and link", exact: true})).toBeEnabled();
    await page.getByRole("button", {name: zh ? "重新测试" : "Retake test", exact: true}).click();
    await expect(page.locator("[data-bleach-reveal]")).toHaveCount(0);
  });
}

test("@release BLEACH ordinary fan choices all14public full guides, bilingual images and closed identities", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) for (const profile of quiz.profiles) {
    const path = `/${locale}/tests/explore/bleach/results/${profile.id}`;
    expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
    for (const section of profile.sections) await expect(page.locator(`#report-${section.id} h2`)).toHaveText(section.title[locale]);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/bleach/results/${profile.id}`);
    await expect(page.getByRole("link", { name: locale === "zh" ? "免费开始完整测试" : "Start the full test for free", exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/bleach#take-test`);
    if (profile.id === "ichigo-kurosaki") {
      const sharing = page.locator("[data-bleach-sharing]");
      for (const format of ["landscape", "portrait"]) {
        await sharing.getByRole("combobox").selectOption(format);
        const download = page.waitForEvent("download");
        await sharing.getByRole("button", {name: locale === "zh" ? "保存BLEACH角色卡片" : "Save BLEACH card", exact: true}).click();
        const file = await download;
        if (process.env.BLEACH_QA_ARTIFACTS) await file.saveAs(join(process.env.BLEACH_QA_ARTIFACTS, `public-guide-${locale}-${format}.png`));
      }
    }
    const image = await request.get(`/og/fun/bleach?locale=${locale}&portrait=${profile.id}&v=1.0.0`); expect(image.status()).toBe(200);
    const bytes = await image.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
  }
  for (const path of ["/en/tests/explore/bleach/results/unknown", "/zh/tests/explore/bleach/results/BLEACH_01", "/en/tests/play/bleach"]) expect((await request.get(path)).status()).toBe(404);
});
