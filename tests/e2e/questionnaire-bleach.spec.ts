import { archetypeCorePath, archetypeResultName } from "../../lib/questionnaires/archetypeResultCard";
import { expectArchetypeGuideAlternates } from "./helpers/archetype-standalone-cases";
import { downloadResultPoster, expectResultPosterFailure } from "./helpers/result-poster";
import { entertainmentGuideProfile, entertainmentGuideStartLabel } from "../../lib/questionnaires/entertainmentGuideSeo";
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
async function finish(page: Page, locale: "en" | "zh", mode: string) {
  for (const [index, question] of quiz.questions.entries()) {
    const two = ["C","C","B","B","A","B","B","A","D","D","A","C","C","B","C","C","D","C","C","D","D"];
    const option = mode === "two" ? question.options.find(o => o.id === two[index])! : mode === "tie" ? question.options[0] : question.options.find(o => o.directionId === mode) ?? question.options[0];
    const radio = page.locator(`input[name="${question.id}"][value="${option.id}"]`);
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
    if (index === 0) await radio.press("Space");
    else await radio.click();
    await expect(radio).toHaveCount(0);
  }
  await expect(page.getByRole("heading", { level: 2, name: quiz.resultHeading![locale], exact: true })).toBeFocused();
  await expect(page.locator("[data-archetype-count]")).toHaveCount(7);
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(node => node.id));
  expect(new Set(ids).size).toBe(ids.length);
  if (mode !== "tie" && mode !== "two") {
    await expect(page.locator(`[data-archetype-count="${mode}"]`)).toContainText("12 / 12");
    await expect(page.locator("[data-archetype-match]")).toHaveCount(1);
    const matched = quiz.profiles.find(p => p.id === mode)!;
    await expect(page.locator(`[data-archetype-match="${mode}"] h4`)).toHaveCount(matched.sections.length + additions[matched.id].length);
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
    await expect(page.getByText(zh ? "21 题 · 约 7 分钟 · 免费免注册" : "21 questions · about 7 minutes · free, no sign-up", { exact: true })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await expect(page.getByRole("link", { name: zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions" })).toHaveCount(0);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    await finish(page, locale, "ichigo-kurosaki");
    await expect(page.locator("[data-bleach-reveal]")).toBeVisible();
    await expect(page.locator("[data-bleach-choice-reasons] li:visible")).toHaveCount(2);
    await expect(page.locator("[data-bleach-choice-reasons] li")).toHaveCount(12);
    await expect(page.locator("[data-bleach-question-number=\"1\"]")).toContainText(quiz.questions[0].prompt[locale]);
    await expect(page.locator("[data-bleach-character-directory] li")).toHaveCount(7);
    const file = await downloadResultPoster(page, locale, "bleach");
    if (process.env.BLEACH_QA_ARTIFACTS) {
      mkdirSync(process.env.BLEACH_QA_ARTIFACTS, { recursive: true });
      await file.saveAs(join(process.env.BLEACH_QA_ARTIFACTS, `single-${locale}-${width}-personal.png`));
      await page.locator("[data-bleach-reveal]").screenshot({ path: join(process.env.BLEACH_QA_ARTIFACTS, `reveal-${locale}-${width}.png`) });
    }
    await expect(page.locator('[data-archetype-core-assessment="MBTI"] a')).toHaveAttribute("href", archetypeCorePath(locale, "MBTI"));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: zh ? "再测一次" : "Retake", exact: true }).click();
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
      Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } });
    });
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await expect(page.getByRole("checkbox")).toHaveCount(0);
    await finish(page, locale, "tie");
    await expect(page.locator("[data-bleach-reveal] > ul > li")).toHaveCount(7);
    const file = await downloadResultPoster(page, locale, "bleach");
    if (process.env.BLEACH_QA_ARTIFACTS) await file.saveAs(join(process.env.BLEACH_QA_ARTIFACTS, `tie-${locale}-${width}-personal.png`));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

    await page.getByRole("button", { name: zh ? "一键分享给朋友" : "Share Result", exact: true }).click();
    const text = await page.locator("[data-archetype-honor-group] textarea").inputValue();
    for (const profile of quiz.profiles) expect(text).toContain(archetypeResultName(profile, locale, value => value));
    expect(text).not.toMatch(/BLEACH_[0-9]{2}|answers|form_code|submission|3\s*\/\s*12|[?&]score/);
    const url = new URL(text.split("\n").at(-1)!); expect(url.pathname).toBe(entry); expect(url.search).toBe(""); expect(url.hash).toBe("");
  });
  test(`@release BLEACH ${locale}: two-way reveal, guide return and failed PNG fallback`, async ({page}) => {
    await page.goto(`${entry}/take`); await finish(page, locale, "two");
    const reveal = page.locator("[data-bleach-reveal]");
    await expect(reveal.locator(":scope > ul > li")).toHaveCount(2);
    const [guidePage] = await Promise.all([
      page.waitForEvent("popup"),
      reveal.getByRole("link", {name: zh ? "阅读公开人物指南（新标签页）" : "Read public character guide (new tab)", exact: true}).first().click(),
    ]);
    await expect(guidePage).toHaveURL(new RegExp(`${entry}/results/ichigo-kurosaki$`));
    await expect(guidePage.locator("[data-bleach-public-portrait]")).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${entry}/take$`));
    await expect(reveal.locator(":scope > ul > li")).toHaveCount(2);
    await guidePage.close();
    await expectResultPosterFailure(page, locale);
    await expect(page.getByRole("button", {name: zh ? "一键分享给朋友" : "Share Result", exact: true})).toBeEnabled();
    await page.getByRole("button", {name: zh ? "再测一次" : "Retake", exact: true}).click();
    await expect(page.locator("[data-bleach-reveal]")).toHaveCount(0);
  });
}

test("@release BLEACH ordinary fan choices all14public full guides, bilingual images and closed identities", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) for (const profile of quiz.profiles) {
    const path = `/${locale}/tests/explore/bleach/results/${profile.id}`;
    expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(entertainmentGuideProfile(quiz.slug, locale, profile).title[locale]);
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
    for (const section of profile.sections) await expect(page.locator(`#report-${section.id} h2`)).toHaveText(section.title[locale]);
    await expectArchetypeGuideAlternates(page, quiz.slug, profile.id);
    await expect(page.getByRole("link", { name: entertainmentGuideStartLabel(quiz.slug, locale), exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/bleach#take-test`);
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

for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/bleach`;
  test(`@release BLEACH R2 ${locale}: all seven original portraits in personal cards, mobile results and guides`, async ({page}) => {
    await page.setViewportSize({width:390,height:844});
    if (process.env.BLEACH_QA_ARTIFACTS) mkdirSync(process.env.BLEACH_QA_ARTIFACTS,{recursive:true});
    for (const profile of quiz.profiles) {
      await page.goto(`${entry}/take`);await finish(page,locale,profile.id);
      const reveal=page.locator("[data-bleach-reveal]");
      const portrait=reveal.locator(":scope > ul > li img");
      await expect.poll(()=>portrait.evaluate((img:HTMLImageElement)=>[img.naturalWidth,img.naturalHeight])).toEqual([260,300]);
      await expect(portrait).toHaveAttribute("src",`/images/quiz-portraits/bleach/${profile.id}.svg`);
      await expect(reveal.locator("[data-bleach-choice-reasons] li:visible")).toHaveCount(2);
      const download = await downloadResultPoster(page, locale, "bleach");
      if (process.env.BLEACH_QA_ARTIFACTS) await download.saveAs(join(process.env.BLEACH_QA_ARTIFACTS, `${locale}-${profile.id}-personal.png`));
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      if (process.env.BLEACH_QA_ARTIFACTS) await reveal.locator(":scope > ul > li").screenshot({path:join(process.env.BLEACH_QA_ARTIFACTS,`${locale}-${profile.id}-mobile-result.png`)});
      const directory=page.locator("[data-bleach-character-directory]");
      await expect(directory.locator("li")).toHaveCount(7);
      const [guidePage] = await Promise.all([
        page.waitForEvent("popup"),
        directory.locator(`[data-bleach-directory-character="${profile.id}"] a`).click(),
      ]);
      await expect(guidePage).toHaveURL(new RegExp(`${entry}/results/${profile.id}$`));
      await expect(guidePage.getByRole("heading",{level:1})).toHaveText(entertainmentGuideProfile(quiz.slug, locale, profile).title[locale]);
      const guide=guidePage.locator("[data-bleach-public-portrait]");
      await expect.poll(()=>guide.locator(":scope > img").evaluate((img:HTMLImageElement)=>[img.naturalWidth,img.naturalHeight])).toEqual([260,300]);
      await expect(guidePage.locator("[data-bleach-character-directory] li")).toHaveCount(7);
      expect(await guidePage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      if (process.env.BLEACH_QA_ARTIFACTS) await guide.locator(":scope > img").screenshot({path:join(process.env.BLEACH_QA_ARTIFACTS,`${locale}-${profile.id}-mobile-guide.png`)});
      await expect(page).toHaveURL(new RegExp(`${entry}/take$`));
      await expect(reveal.locator(":scope > ul > li")).toHaveCount(1);
      await guidePage.close();
    }
  });
  test(`@release BLEACH R2 ${locale}: contextual ties and native share cancel/failure retain the result`, async ({page}) => {
    await page.addInitScript(()=>{
      Object.defineProperty(navigator,"canShare",{configurable:true,value:()=>true});
      Object.defineProperty(navigator,"share",{configurable:true,value:async()=>{throw new DOMException("Synthetic cancellation","AbortError");}});
    });
    await page.goto(`${entry}/take`);await finish(page,locale,"two");
    const reveal=page.locator("[data-bleach-reveal]");
    const details=reveal.locator("[data-bleach-choice-context] > details");
    await expect(details).toHaveCount(2);
    await expect(reveal.locator("[data-bleach-choice-reasons] li:visible")).toHaveCount(0);
    await details.first().locator("summary").click();
    await expect(reveal.locator("[data-bleach-choice-reasons] li:visible")).toHaveCount(4);
    const chosen=quiz.questions[0].options.find(o=>o.id==="C")!;
    // First displayed direction is Ichigo, so it must not invent evidence from the Aizen answer in question1.
    await expect(details.first().locator('[data-bleach-question-number="1"]')).toHaveCount(0);
    expect(chosen.directionId).toBe("sosuke-aizen");
    const sharing = page.locator("[data-archetype-honor-group]");
    const action = sharing.getByRole("button", { name: zh ? "一键分享给朋友" : "Share Result", exact: true });
    await page.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("Synthetic clipboard denial"); } } });
      const matchMedia = window.matchMedia.bind(window);
      window.matchMedia = query => query === "(pointer: coarse)"
        ? new Proxy(matchMedia(query), { get: (target, key) => key === "matches" ? true : Reflect.get(target, key, target) })
        : matchMedia(query);
      window.addEventListener("share-attempt", () => document.documentElement.dataset.resultShareAttempt = "1");
      Object.defineProperty(navigator, "share", { configurable: true, value: async () => {
        window.dispatchEvent(new Event("share-attempt"));
        throw new DOMException("Synthetic cancellation", "AbortError");
      } });
    });
    await action.click();
    await expect(page.locator("html")).toHaveAttribute("data-result-share-attempt", "1");
    await expect(sharing.locator("textarea")).toHaveCount(0);
    await page.evaluate(() => Object.defineProperty(navigator, "share", { configurable: true, value: async () => { throw new Error("Synthetic native share failure"); } }));
    await action.click();
    await expect(sharing.locator("textarea")).toHaveValue(new RegExp(`https://fermatmind.com${entry}$`));
    await downloadResultPoster(page, locale, "bleach");
    await expect(page.locator("[data-archetype-match]")).toHaveCount(2);
  });
}
