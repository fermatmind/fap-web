import { entertainmentGuideProfile, entertainmentGuideStartLabel } from "../../lib/questionnaires/entertainmentGuideSeo";
import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { philosopherPresentations } from "../../lib/questionnaires/philosopherPresentation";
import type { Questionnaire } from "../../lib/questionnaires/types";

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
      localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied" }));
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
    await runner.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click();
    const shared = await runner.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue();
    expect(shared.split("\n").at(-1)).toBe(`https://fermatmind.com${mode === "single" ? `${entry}/results/socrates` : entry}`);
    for (const profile of mode === "single" ? quiz.profiles.slice(0, 1) : mode === "two" ? quiz.profiles.slice(0, 2) : quiz.profiles) expect(shared).toContain(profile.title[locale]);
    expect(shared).not.toMatch(/PHIL_[0-9]{2}|answers|form_code|submission|[?&]score/);
    const sharing = runner.locator("[data-philosopher-sharing]");
    await sharing.getByRole("combobox").selectOption(device === "mobile" ? "portrait" : "landscape");
    const [download] = await Promise.all([page.waitForEvent("download"), sharing.getByRole("button", { name: zh ? "保存哲学家卡片" : "Save philosopher card", exact: true }).click()]);
    const file = testInfo.outputPath("philosopher-card.png"); await download.saveAs(file);
    const png = readFileSync(file); expect(png.readUInt32BE(16)).toBe(device === "mobile" ? 1080 : 1200); expect(png.readUInt32BE(20)).toBe(device === "mobile" ? 1920 : 630);
    await expect.poll(() => sharing.getByRole("img").evaluate(img => (img as HTMLImageElement).naturalWidth)).toBe(device === "mobile" ? 1080 : 1200);
    expect(download.suggestedFilename()).not.toMatch(/answers|PHIL_|counts|score/);
    await testInfo.attach("philosopher-card", { path: file, contentType: "image/png" });
    await sharing.getByRole("button", { name: zh ? "分享哲学家图片" : "Share philosopher image", exact: true }).click();
    await expect(sharing.getByRole("status")).toContainText(zh ? "不支持直接分享" : "cannot share images directly");
    await sharing.getByRole("button", { name: zh ? "复制公开指南链接" : "Copy public guide link", exact: true }).click();
    await expect(sharing.getByRole("textbox")).toHaveValue(`https://fermatmind.com${mode === "single" ? `${entry}/results/socrates` : entry}`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:philosopher-personality-test"))).toBeNull();
    const publicGuide = runner.locator(`[data-archetype-match="socrates"]`).getByRole("link", { name: zh ? "单独阅读这项结果的完整指南" : "Read this result’s full guide separately" });
    await expect(publicGuide).toHaveAttribute("href", `${entry}/results/socrates`);
    await runner.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click();
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
  const zh = locale === "zh", entry = `/${locale}/tests/explore/${quiz.slug}`;
  await page.addInitScript(() => { localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied" })); });
  await page.goto(`${entry}/take?start=1`); await finish(page, locale, "two");
  const sharing = page.locator("[data-philosopher-sharing]");
  for (const name of ["AbortError", "NotAllowedError", "success"]) {
    await page.evaluate(name => {
      Object.defineProperty(navigator, "canShare", { configurable: true, value: () => true });
      Object.defineProperty(navigator, "share", { configurable: true, value: async (data: ShareData) => {
        if (name !== "success") throw new DOMException("Synthetic share outcome", name);
        if (!data.files || data.files.length !== 1 || data.files[0].type !== "image/png" || !data.url?.endsWith("/tests/explore/philosopher-personality-test")) throw new Error("Unsafe share payload");
      } });
    }, name);
    await sharing.getByRole("button", { name: zh ? "分享哲学家图片" : "Share philosopher image", exact: true }).click();
    await expect(sharing.getByRole("status")).toContainText(name === "AbortError" ? (zh ? "已取消" : "canceled") : name === "NotAllowedError" ? (zh ? "未能打开" : "Could not open") : (zh ? "已完成分享" : "Shared."));
    await expect(sharing.getByRole("img")).toHaveAttribute("src", /^blob:/);
  }
  await page.evaluate(() => {
    Object.defineProperty(window, "__philosopherCanvas", { configurable: true, value: HTMLCanvasElement.prototype.getContext });
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", { configurable: true, value: () => null });
  });
  await sharing.getByRole("button", { name: zh ? "保存哲学家卡片" : "Save philosopher card", exact: true }).click();
  await expect(sharing.getByRole("status")).toContainText(zh ? "暂时无法生成" : "Could not create");
  await expect(sharing.getByRole("button", { name: zh ? "保存哲学家卡片" : "Save philosopher card", exact: true })).toBeEnabled();
  await page.evaluate(() => { HTMLCanvasElement.prototype.getContext = Reflect.get(window, "__philosopherCanvas"); });
});

for (const locale of ["en", "zh"] as const) test(`@release Philosopher ${locale}: result to public guide, guide PNG, and a fresh retake`, async ({ page }, testInfo) => {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/${quiz.slug}`;
  await page.addInitScript(() => { localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied" })); });
  await page.goto(`${entry}/take?start=1`); await finish(page, locale, "single");
  await page.locator('[data-archetype-match="socrates"]').getByRole("link", { name: zh ? "单独阅读这项结果的完整指南" : "Read this result’s full guide separately" }).click();
  await expect(page).toHaveURL(new RegExp(`${entry}/results/socrates$`));
  await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
  const sharing = page.locator("[data-philosopher-sharing]");
  await expect(sharing).toContainText(zh ? "不表示你已获得这一结果" : "without assigning it to you as a result");
  const [download] = await Promise.all([page.waitForEvent("download"), sharing.getByRole("button", { name: zh ? "保存哲学家卡片" : "Save philosopher card", exact: true }).click()]);
  const file = testInfo.outputPath("public-philosopher-guide.png"); await download.saveAs(file);
  const png = readFileSync(file); expect(png.readUInt32BE(16)).toBe(1200); expect(png.readUInt32BE(20)).toBe(630);
  await page.getByRole("link", { name: entertainmentGuideStartLabel(quiz.slug, locale), exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`${entry}#take-test$`));
  await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
  await expect(page.locator('#take-test[data-stage]').getByRole("radio").first()).not.toBeChecked();
  await expect(page.locator("[data-philosopher-reveal]")).toHaveCount(0);
});
