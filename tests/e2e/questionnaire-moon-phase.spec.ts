import { entertainmentGuideProfile, entertainmentGuideStartLabel } from "../../lib/questionnaires/entertainmentGuideSeo";
import { test, expect, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { readFileSync } from "node:fs";
import { moonPhasePresentations } from "../../lib/questionnaires/moonPhasePresentation";
import type { Questionnaire } from "../../lib/questionnaires/types";

test.beforeEach(async ({page}) => {
  await page.addInitScript(() => { localStorage.setItem("fm_consent_v1", JSON.stringify({analytics: "denied", updatedAt: new Date().toISOString()}));
    const draw = CanvasRenderingContext2D.prototype.fillText;
    (window as unknown as {__moonCardText: string[]}).__moonCardText = [];
    CanvasRenderingContext2D.prototype.fillText = function(text, x, y, maxWidth) {
      (window as unknown as {__moonCardText: string[]}).__moonCardText.push(text);
      if (maxWidth === undefined) draw.call(this, text, x, y); else draw.call(this, text, x, y, maxWidth);
    }; });
});
const additions = JSON.parse(readFileSync("lib/questionnaires/result-content/moon-phase.json", "utf8")) as Record<string, unknown[]>;
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/moon-phase.json", "utf8")) as Questionnaire;
async function finish(page: Page, locale: "en" | "zh", mode: "new-moon" | "waxing-crescent" | "tie" | "two") {
  for (const [index, question] of quiz.questions.entries()) {
    const two = ["D","A","C","B","B","B","B","C","C","C","D","D","A","B","A","A","A","C","A","B","D","B","B","A"];
    const option = mode === "two" ? question.options.find(o => o.id === two[index])! : mode === "tie" ? question.options[0] : question.options.find(o => o.directionId === mode) ?? question.options[0];
    const radio = page.locator(`input[name="${question.id}"][value="${option.id}"]`);
    if (index === 0) { await radio.focus(); await page.keyboard.press("Space"); await expect(radio).toBeChecked(); }
    else await radio.check();
    if (index < 23) await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
    await page.getByRole("button", { name: index === 23 ? (locale === "zh" ? "查看完整结果" : "See full result") : (locale === "zh" ? "下一题" : "Next"), exact: true }).click();
  }
  await expect(page.getByRole("heading", { level: 2, name: quiz.resultHeading![locale], exact: true })).toBeFocused();
  await expect(page.locator("[data-archetype-count]")).toHaveCount(8);
  const comparison = page.locator("[data-moon-phase-comparison]");
  await expect(comparison.locator("[data-moon-phase-comparison-id]")).toHaveCount(8);
  expect(await comparison.locator("[data-moon-phase-comparison-id]").evaluateAll(nodes => nodes.map(node => node.getAttribute("data-moon-phase-comparison-id")))).toEqual(quiz.profiles.map(p => p.id));
  const fullReadings = page.locator("[data-moon-phase-full-reading]");
  await expect(page.locator("[data-moon-phase-full-reading][open]")).toHaveCount(mode === "tie" || mode === "two" ? 0 : 1);
  if (mode === "tie" || mode === "two") {
    for (const reading of await fullReadings.all()) {
      await reading.locator(":scope > summary").click();
      await expect(reading.locator("h4").first()).toBeVisible();
      await reading.locator(":scope > summary").click();
    }
    await expect(page.locator("[data-moon-phase-reasons] details[open]")).toHaveCount(0);
  }
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(node => node.id));
  expect(new Set(ids).size).toBe(ids.length);
  if (mode === "new-moon" || mode === "waxing-crescent") {
    await expect(page.locator(`[data-archetype-count="${mode}"]`)).toContainText("12 / 12");
    await expect(page.locator("[data-archetype-match]")).toHaveCount(1);
    await expect(page.locator(`[data-archetype-match="${mode}"] h4`)).toHaveCount(quiz.profiles[0].sections.length + additions[quiz.profiles[0].id].length);
  } else if (mode === "two") {
    await expect(page.locator("[data-archetype-match]")).toHaveCount(2);
    await expect(page.locator('[data-archetype-count="full-moon"]')).toContainText("5 / 12");
    await expect(page.locator('[data-archetype-count="waning-crescent"]')).toContainText("5 / 12");
  } else {
    for (const theme of quiz.directions) {
      await expect(page.locator(`[data-archetype-count="${theme.id}"]`)).toContainText("3 / 12");
      await expect(page.locator(`[data-archetype-match="${theme.id}"] h4`)).toHaveCount(quiz.profiles.find(p => p.id === theme.id)!.sections.length + additions[theme.id].length);
    }
    await expect(page.locator("[data-archetype-match]")).toHaveCount(8);
    await expect(page.locator("#take-test h4")).toHaveCount(quiz.profiles.reduce((sum,p) => sum + p.sections.length + additions[p.id].length, 0));
  }
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/moon-phase`;
  for (const width of [390, 1440]) test(`@release MOON_PHASE activity-pace images ${locale} ${width}: hub, keyboard,24realchoices, full unique match and retake`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    const posts: string[] = [];
    page.on("request", request => { if (request.method() === "POST" && /MOON_PHASE_[0-9]{2}/.test(request.postData() ?? "")) posts.push(request.url()); });
    await page.goto(`/${locale}/tests`); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.getByText(zh ? "原创象征测验 · 完整结果免费" : "Original symbolic quiz · Full results free", { exact: true })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await expect(page.getByRole("link", { name: zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions" })).toHaveCount(0);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    await finish(page, locale, width === 1440 ? "waxing-crescent" : "new-moon");
    await expect(page.locator("[data-moon-phase-reveal]")).toBeVisible();
    await expect(page.locator("[data-moon-phase-choice-reasons] li")).toHaveCount(2);
    const sharing = page.locator("[data-moon-phase-sharing]");
    const download = page.waitForEvent("download");
    await sharing.getByRole("button", {name: zh ? "保存月相卡片" : "Save Moon Phase card", exact: true}).click();
    const file = await download;
    const drawn = await page.evaluate(() => (window as unknown as {__moonCardText: string[]}).__moonCardText.join(" "));
    expect(drawn).toContain(zh ? "费马测试 · 月相测试" : "FermatMind · Moon Phase Personality Test");
    expect(drawn).toContain(zh ? "我的结果 · 娱乐问卷" : "My result · Entertainment quiz");
    expect(drawn).toContain(moonPhasePresentations[width === 1440 ? "waxing-crescent" : "new-moon"].name[locale]);
    expect(drawn).toContain(zh ? "不是出生月相计算" : "Not a birth moon calculation");
    expect(file.suggestedFilename()).toBe(`fermatmind-moon-phase-${locale}-landscape.png`);
    const image = sharing.locator("img"); await expect(image).toBeVisible();
    await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(1200);
    if (process.env.MOON_QA_ARTIFACTS) {
      mkdirSync(process.env.MOON_QA_ARTIFACTS, {recursive: true});
      await file.saveAs(join(process.env.MOON_QA_ARTIFACTS, `single-${locale}-${width}.png`));
      await page.locator("[data-moon-phase-reveal]").screenshot({path: join(process.env.MOON_QA_ARTIFACTS, `reveal-${locale}-${width}.png`)});
    }
    await sharing.getByRole("combobox").selectOption("portrait");
    const tall = page.waitForEvent("download");
    await sharing.getByRole("button", {name: zh ? "保存月相卡片" : "Save Moon Phase card", exact: true}).click();
    await tall;
    await expect.poll(() => sharing.locator("img").evaluate((img: HTMLImageElement) => [img.naturalWidth, img.naturalHeight])).toEqual([1080,1920]);

    await expect(page.getByRole("link", { name: zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions" })).toHaveAttribute("href", /target_action=questionnaire_result_mbti/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click();
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0); await expect(page.getByRole("radio").first()).not.toBeChecked();
    expect(posts).toEqual([]);
  });
  test(`@release MOON_PHASE ${locale}: standalone reload and language change keep answers private`, async ({ page }) => {
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.locator('input[value="B"]').check();
    await expect(page.getByRole("checkbox")).toHaveCount(0);
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await page.reload();
    await expect(page.locator(`input[name="${quiz.questions[0].id}"]`).first()).toBeVisible();
    await expect(page.getByRole("radio").first()).not.toBeChecked();
    const other = zh ? "en" : "zh";
    await page.goto(`/${other}/tests/explore/moon-phase/take`);
    await expect(page.locator(`input[name="${quiz.questions[0].id}"]`).first()).toBeVisible();
    await expect(page.getByRole("radio").first()).not.toBeChecked();
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:moon-phase"))).toBeNull();
  });
  for (const width of [390, 1440]) test(`@release MOON_PHASE activity-pace images ${locale} ${width}: denied storage, eight-way tie keeps all full readings and private-safe clipboard fallback`, async ({ page }) => {
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
    await expect(page.locator("[data-moon-phase-reveal] > ul > li")).toHaveCount(8);
    const sharing = page.locator("[data-moon-phase-sharing]");
    const download = page.waitForEvent("download");
    await sharing.getByRole("button", {name: zh ? "保存月相卡片" : "Save Moon Phase card", exact: true}).click();
    const file = await download;
    const drawn = await page.evaluate(() => (window as unknown as {__moonCardText: string[]}).__moonCardText.join(" "));
    expect(drawn).toContain(zh ? "费马测试 · 月相测试" : "FermatMind · Moon Phase Personality Test");
    expect(drawn).toContain(zh ? "我的结果 · 娱乐问卷" : "My result · Entertainment quiz");
    expect(drawn).toContain(moonPhasePresentations[width === 1440 ? "waxing-crescent" : "new-moon"].name[locale]);
    expect(drawn).toContain(zh ? "不是出生月相计算" : "Not a birth moon calculation");
    if (process.env.MOON_QA_ARTIFACTS) {
      await file.saveAs(join(process.env.MOON_QA_ARTIFACTS, `tie-${locale}-${width}-landscape.png`));
    }
    for (const phase of Object.values(moonPhasePresentations)) expect(drawn).toContain(phase.name[locale]);
    for (const profile of quiz.profiles) await expect(sharing.locator("img")).toHaveAttribute("alt", new RegExp(profile.title[locale].split(/[:：]/)[0].replace(/ Image$/, "").replace(/意象$/, "")));
    await sharing.getByRole("combobox").selectOption("portrait");
    const tall = page.waitForEvent("download");
    await sharing.getByRole("button", {name: zh ? "保存月相卡片" : "Save Moon Phase card", exact: true}).click();
    const tallFile = await tall;
    if (process.env.MOON_QA_ARTIFACTS) await tallFile.saveAs(join(process.env.MOON_QA_ARTIFACTS, `tie-${locale}-${width}-portrait.png`));
    await expect.poll(() => sharing.locator("img").evaluate((img: HTMLImageElement) => [img.naturalWidth,img.naturalHeight])).toEqual([1080,1920]);
    await sharing.getByRole("button", {name: zh ? "分享月相图片" : "Share Moon Phase image", exact: true}).click();
    await expect(sharing.getByRole("status")).toContainText(zh ? "不支持直接分享" : "cannot share images directly");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

    await page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click();
    const text = await page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue();
    for (const profile of quiz.profiles) expect(text).toContain(profile.title[locale]);
    expect(text).not.toMatch(/MOON_PHASE_[0-9]{2}|answers|form_code|submission|3\s*\/\s*12|[?&]score/);
    const url = new URL(text.split("\n").at(-1)!); expect(url.pathname).toBe(entry); expect(url.search).toBe(""); expect(url.hash).toBe("");
  });
  for (const width of [390, 1440]) test(`@release MOON_PHASE ${locale} ${width}: two-way reveal, guide return and failed PNG fallback`, async ({page}) => {
    await page.setViewportSize({width, height:844});
    await page.goto(`${entry}/take`); await finish(page, locale, "two");
    const reveal = page.locator("[data-moon-phase-reveal]");
    await expect(reveal.locator(":scope > ul > li")).toHaveCount(2);
    const [guidePage] = await Promise.all([
      page.waitForEvent("popup"),
      reveal.getByRole("link", {name: zh ? "满月 · 指南（新标签页）" : "Full Moon · Guide (new tab)", exact: true}).first().click(),
    ]);
    await expect(guidePage).toHaveURL(new RegExp(`${entry}/results/full-moon$`));
    await expect(guidePage.locator("[data-moon-phase-public-diagram]")).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${entry}/take$`));
    await expect(reveal.locator(":scope > ul > li")).toHaveCount(2);
    await guidePage.close();
    const twoSharing = page.locator("[data-moon-phase-sharing]");
    for (const format of ["landscape", "portrait"]) {
      await twoSharing.getByRole("combobox").selectOption(format);
      const pending = page.waitForEvent("download");
      await twoSharing.getByRole("button", {name: zh ? "保存月相卡片" : "Save Moon Phase card", exact:true}).click();
      const imageFile = await pending;
      if (process.env.MOON_QA_ARTIFACTS) await imageFile.saveAs(join(process.env.MOON_QA_ARTIFACTS, `two-${locale}-${width}-${format}.png`));
      await expect.poll(() => twoSharing.locator("img").evaluate((img:HTMLImageElement)=>[img.naturalWidth,img.naturalHeight])).toEqual(format === "portrait" ? [1080,1920] : [1200,630]);
    }
    await page.evaluate(() => {
      Object.defineProperty(navigator, "canShare", { configurable: true, value: () => true });
      Object.defineProperty(navigator, "share", { configurable: true, value: async () => { throw new DOMException("Synthetic user cancellation", "AbortError"); } });
    });
    const cancelSharing = page.locator("[data-moon-phase-sharing]");
    await cancelSharing.getByRole("button", {name: zh ? "分享月相图片" : "Share Moon Phase image", exact: true}).click();
    await expect(cancelSharing.getByRole("status")).toContainText(zh ? "已取消分享" : "Sharing canceled");
    await expect(cancelSharing.locator("img")).toBeVisible();
    await page.route("**/images/moon-phases/*.svg", route => route.fulfill({status: 503, body: "synthetic failure"}));
    const sharing = page.locator("[data-moon-phase-sharing]");
    await sharing.getByRole("button", {name: zh ? "保存月相卡片" : "Save Moon Phase card", exact: true}).click();
    await expect(sharing.getByRole("status")).toContainText(zh ? "暂时无法生成图片" : "Could not create the image");
    await expect(page.getByRole("button", {name: zh ? "复制结果与链接" : "Copy result and link", exact: true})).toBeEnabled();
    await page.getByRole("button", {name: zh ? "重新测试" : "Retake test", exact: true}).click();
    await expect(page.locator("[data-moon-phase-reveal]")).toHaveCount(0);
  });
}

test("@release MOON_PHASE activity-pace images all16public full guides, bilingual images and closed identities", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) for (const profile of quiz.profiles) {
    const path = `/${locale}/tests/explore/moon-phase/results/${profile.id}`;
    expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(entertainmentGuideProfile(quiz.slug, locale, profile).title[locale]);
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
    for (const section of profile.sections) await expect(page.locator(`#report-${section.id} h2`)).toHaveText(section.title[locale]);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/moon-phase/results/${profile.id}`);
    await expect(page.getByRole("link", { name: entertainmentGuideStartLabel(quiz.slug, locale), exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/moon-phase#take-test`);
    if (profile.id === "new-moon") {
      const sharing = page.locator("[data-moon-phase-sharing]");
      for (const format of ["landscape", "portrait"]) {
        await sharing.getByRole("combobox").selectOption(format);
        const download = page.waitForEvent("download");
        await sharing.getByRole("button", {name: locale === "zh" ? "保存月相卡片" : "Save Moon Phase card", exact: true}).click();
        const file = await download;
        if (process.env.MOON_QA_ARTIFACTS) await file.saveAs(join(process.env.MOON_QA_ARTIFACTS, `public-guide-${locale}-${format}.png`));
      }
    }
    const image = await request.get(`/og/fun/moon-phase?locale=${locale}&portrait=${profile.id}&v=1.0.0`); expect(image.status()).toBe(200);
    const bytes = await image.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
  }
  for (const path of ["/en/tests/explore/moon-phase/results/unknown", "/zh/tests/explore/moon-phase/results/MOON_PHASE_01", "/en/tests/play/moon-phase"]) expect((await request.get(path)).status()).toBe(404);
});
