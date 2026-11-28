import { entertainmentGuideProfile, entertainmentGuideStartLabel } from "../../lib/questionnaires/entertainmentGuideSeo";
import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { philosopherPresentations } from "../../lib/questionnaires/philosopherPresentation";
import type { Questionnaire } from "../../lib/questionnaires/types";
import { archetypeResultCopy } from "../../lib/questionnaires/archetypeResultShare";
import { seedAnalyticsConsent } from "./helpers/consent";

test.beforeEach(async ({ page }) => { await seedAnalyticsConsent(page); });

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/philosopher-personality-test.json", "utf8")) as Questionnaire;
async function finish(page: Page, locale: "en" | "zh", mode: "single" | "two" | "tie") {
  const runner = page.locator('#take-test[data-stage]');
  for (const [index, question] of quiz.questions.entries()) {
    const option = mode === "two" ? question.options.find(o => o.id === "BCBBDBBADDCCABCCBA"[index])! : mode === "tie" ? question.options[0] : question.options.find(o => o.directionId === "socrates") ?? question.options[0];
    const radio = runner.getByRole("radio", { name: option.label[locale], exact: true });
    if (index === 0) { await radio.focus(); await page.keyboard.press("Space"); await expect(radio).toBeChecked(); }
    else await radio.check();
    await expect(runner.locator("[data-archetype-count]")).toHaveCount(0);
    await runner.locator("[data-questionnaire-next]").click();
  }
  await expect(runner.getByRole("heading", { level: 2, name: quiz.resultHeading![locale], exact: true })).toBeFocused();
  await expect(runner.locator("[data-archetype-count]")).toHaveCount(9);
  const matches = mode === "tie" ? quiz.profiles : quiz.profiles.slice(0, mode === "two" ? 2 : 1);
  await expect(runner.locator("[data-archetype-match]")).toHaveCount(matches.length);
  for (const profile of matches) {
    await expect(runner.locator(`[data-archetype-count="${profile.id}"]`)).toContainText(mode === "tie" ? "2 / 8" : mode === "two" ? "4 / 8" : "8 / 8");
    const match = runner.locator(`[data-archetype-match="${profile.id}"]`);
    for (const section of profile.sections) await expect(match.locator(`#report-${profile.id}-${section.id} h4`)).toHaveText(section.title[locale]);
    const reveal = runner.locator(`[data-philosopher-reveal="${profile.id}"]`);
    await expect(reveal.getByRole("heading", { level: 3 })).toHaveText(philosopherPresentations[profile.id].name[locale]);
    await expect(reveal).toContainText(philosopherPresentations[profile.id].reason[locale]);
    await expect(reveal.locator("[data-philosopher-portrait]")).toHaveAttribute("src", `/images/quiz-portraits/philosopher-personality-test/${profile.id}.svg`);
  }
  const ids = await runner.locator("[id]").evaluateAll(nodes => nodes.map(node => node.id));
  expect(new Set(ids).size).toBe(ids.length);
}
for (const locale of ["en", "zh"] as const) for (const device of ["mobile", "desktop"] as const) for (const mode of ["single", "two", "tie"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/philosopher-personality-test`;
  test(`@release Philosopher ${locale} ${device} ${mode}: reveal, actual PNG, every tie, guide and retake`, async ({ page }, testInfo) => {
    await page.setViewportSize(device === "mobile" ? { width: 390, height: 844 } : { width: 1280, height: 900 });
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "canShare", { configurable: true, value: () => false });
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } });
    });
    const posts: string[] = [];
    page.on("request", request => { if (request.method() === "POST" && /PHIL_[0-9]{2}/.test(request.postData() ?? "")) posts.push(request.url()); });
    await page.goto(entry);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await expect(page.locator('link[hreflang="zh-CN"]')).toHaveAttribute("href", `https://fermatmind.com/zh/tests/explore/${quiz.slug}`);
    await page.getByRole("link", { name: zh ? "先看阅读结果示例" : "See sample reading results" }).click();
    for (const [index, count] of [1, 2, 9].entries()) await expect(page.locator(`[data-philosopher-example="${index}"]`).getByRole("link")).toHaveCount(count);
    await page.locator('[data-philosopher-example="1"] summary').click();
    await expect(page.locator('[data-philosopher-example="1"]')).toContainText("BCBBDBBADDCCABCCBA");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await expect(page).toHaveURL(/\/take(?:\?start=1)?$/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    const runner = page.locator('#take-test[data-stage]');
    await runner.locator("[data-questionnaire-next]").click();
    await expect(runner.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    await finish(page, locale, mode);
    await page.screenshot({ path: testInfo.outputPath("philosopher-reveal.png") });
    const sharing = runner.locator("[data-archetype-honor-group]");
    const copy = archetypeResultCopy[locale];
    await sharing.getByRole("button", { name: copy.share, exact: true }).click();
    const shared = await sharing.getByRole("textbox", { name: copy.manual }).inputValue();
    expect(shared.split("\n").at(-1)).toBe(`https://fermatmind.com${entry}`);
    const expectedProfiles = mode === "single" ? quiz.profiles.slice(0, 1) : mode === "two" ? quiz.profiles.slice(0, 2) : quiz.profiles;
    for (const profile of expectedProfiles) expect(shared).toContain(philosopherPresentations[profile.id].name[locale]);
    expect(shared).not.toMatch(/PHIL_[0-9]{2}|answers|form_code|submission|[?&]score/);

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      sharing.getByRole("button", { name: copy.save, exact: true }).click(),
    ]);
    const file = testInfo.outputPath("philosopher-card.png");
    await download.saveAs(file);
    const png = readFileSync(file);
    expect(png.readUInt32BE(16)).toBe(1080);
    expect(png.readUInt32BE(20)).toBe(1440);
    expect(download.suggestedFilename()).not.toMatch(/answers|PHIL_|counts|score/);
    await testInfo.attach("philosopher-card", { path: file, contentType: "image/png" });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:philosopher-personality-test"))).toBeNull();
    const publicGuide = runner.locator(`[data-archetype-match="socrates"] a[href="${entry}/results/socrates"]`);
    await expect(publicGuide).toHaveAttribute("href", `${entry}/results/socrates`);
    await sharing.getByRole("button", { name: copy.retake, exact: true }).click();
    await expect(runner.locator("[data-archetype-count]")).toHaveCount(0);
    await expect(runner.getByRole("radio").first()).not.toBeChecked();
    await page.getByRole("link", { name: zh ? "返回测评介绍" : "Back to assessment" }).click();
    await expect(page).toHaveURL(new RegExp(`${entry}$`));
    expect(posts).toEqual([]);
  });
}

test("@release Philosopher all18public guides, bilingual share images and closed identities", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) for (const profile of quiz.profiles) {
    const path = `/${locale}/tests/explore/${quiz.slug}/results/${profile.id}`;
    expect((await page.goto(path))?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(entertainmentGuideProfile(quiz.slug, locale, profile).title[locale]);
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
    for (const section of profile.sections) await expect(page.locator(`#report-${section.id} h2`)).toHaveText(section.title[locale]);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${path}`);
    await expect(page.locator('link[hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/${quiz.slug}/results/${profile.id}`);
    await expect(page.getByRole("link", { name: entertainmentGuideStartLabel(quiz.slug, locale), exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/${quiz.slug}#take-test`);
    await expect(page.locator("[data-philosopher-portrait]")).toHaveAttribute("data-philosopher-portrait", profile.id);
    const imageUrl = new URL((await page.locator('meta[property="og:image"]').getAttribute("content"))!);
    expect(imageUrl.searchParams.get("v")).toBe("1.1.0-portraits2");
    const image = await request.get(imageUrl.pathname + imageUrl.search); expect(image.status()).toBe(200);
    const bytes = await image.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
  }
  for (const path of ["/en/tests/explore/philosopher-personality-test/results/unknown", "/zh/tests/explore/philosopher-personality-test/results/PHIL_01", "/en/tests/play/philosopher-personality-test"]) expect((await request.get(path)).status()).toBe(404);
});

for (const locale of ["en", "zh"] as const) test(`@release Philosopher ${locale}: native share cancellation, denial, success and canvas fallback`, async ({ page }) => {
  const entry = `/${locale}/tests/explore/${quiz.slug}`;
  const copy = archetypeResultCopy[locale];
  await page.goto(`${entry}/take`);
  await finish(page, locale, "two");
  const sharing = page.locator("[data-archetype-honor-group]");
  const share = sharing.getByRole("button", { name: copy.share, exact: true });
  for (const outcome of ["AbortError", "NotAllowedError", "success"]) {
    await page.evaluate(({ outcome, entry }) => {
      const state = window as Window & { shareAttempt?: boolean; copiedShare?: string };
      const runMatch = window.matchMedia.bind(window);
      state.shareAttempt = undefined;
      state.copiedShare = undefined;
      Object.defineProperty(window, "matchMedia", { configurable: true, value: (query: string) =>
        query === "(pointer: coarse)" ? { matches: true } : runMatch(query) });
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: {
        writeText: async (text: string) => { state.copiedShare = text; },
      } });
      Object.defineProperty(navigator, "share", { configurable: true, value: async (data: ShareData) => {
        state.shareAttempt = data.url === `https://fermatmind.com${entry}`
          && !data.files && !/PHIL_[0-9]{2}|answers|form_code|submission|[?&]score/.test(data.text ?? "");
        if (outcome !== "success") throw new DOMException("Synthetic share outcome", outcome);
      } });
    }, { outcome, entry });
    await share.click();
    await expect.poll(() => page.evaluate(() => (window as Window & { shareAttempt?: boolean }).shareAttempt)).toBe(true);
    const status = sharing.getByRole("status");
    if (outcome === "AbortError") {
      await expect(status).toHaveCount(0);
      expect(await page.evaluate(() => (window as Window & { copiedShare?: string }).copiedShare)).toBeUndefined();
    } else if (outcome === "NotAllowedError") {
      await expect(status).toHaveText(copy.copied);
      const copied = await page.evaluate(() => (window as Window & { copiedShare?: string }).copiedShare);
      expect(copied?.split("\n").at(-1)).toBe(`https://fermatmind.com${entry}`);
    } else {
      await expect(status).toHaveText(copy.sent);
    }
  }
  await page.evaluate(() => { HTMLCanvasElement.prototype.getContext = () => null; });
  const save = sharing.getByRole("button", { name: copy.save, exact: true });
  await save.click();
  await expect(sharing.getByRole("status")).toHaveText(copy.error);
  await expect(save).toBeEnabled();
});

for (const locale of ["en", "zh"] as const) test(`@release Philosopher ${locale}: result to public guide, guide PNG, and a fresh retake`, async ({ page }, testInfo) => {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/${quiz.slug}`;
  await page.goto(`${entry}/take?start=1`); await finish(page, locale, "single");
  const [guidePage] = await Promise.all([
    page.waitForEvent("popup"),
    page.locator('[data-archetype-match="socrates"]').getByRole("link", { name: zh ? "单独阅读这项结果的完整指南（新标签页）" : "Read this result’s full guide separately (new tab)", exact: true }).click(),
  ]);
  await expect(guidePage).toHaveURL(new RegExp(`${entry}/results/socrates$`));
  await expect(guidePage.locator("[data-archetype-count]")).toHaveCount(0);
  const sharing = guidePage.locator("[data-philosopher-sharing]");
  await expect(sharing).toContainText(zh ? "不表示你已获得这一结果" : "without assigning it to you as a result");
  const [download] = await Promise.all([guidePage.waitForEvent("download"), sharing.getByRole("button", { name: zh ? "保存哲学家卡片" : "Save philosopher card", exact: true }).click()]);
  const file = testInfo.outputPath("public-philosopher-guide.png"); await download.saveAs(file);
  const png = readFileSync(file); expect(png.readUInt32BE(16)).toBe(1200); expect(png.readUInt32BE(20)).toBe(630);
  await guidePage.getByRole("link", { name: entertainmentGuideStartLabel(quiz.slug, locale), exact: true }).click();
  await expect(guidePage).toHaveURL(new RegExp(`${entry}#take-test$`));
  await guidePage.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
  await expect(guidePage.locator('#take-test[data-stage]').getByRole("radio").first()).not.toBeChecked();
  await expect(guidePage.locator("[data-philosopher-reveal]")).toHaveCount(0);
  await expect(page).toHaveURL(new RegExp(`${entry}/take$`));
  await expect(page.locator('[data-archetype-match="socrates"]')).toBeVisible();
  await guidePage.close();
});
