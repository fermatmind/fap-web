import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import type { Questionnaire, QuestionnaireAnswers } from "../../lib/questionnaires/types";

const quiz = JSON.parse(readFileSync(path.join(process.cwd(), "lib/questionnaires/data/disc.json"), "utf8")) as Questionnaire;
const reference = JSON.parse(readFileSync(path.join(process.cwd(), "tests/fixtures/questionnaires/disc-reference.json"), "utf8"));
const oracleModule = createRequire(path.join(process.cwd(), "package.json"))("./tests/fixtures/questionnaires/multidirection-scorer.cjs") as { create: (configuration: object) => { scoreSubmission: (submission: object, bank: object, spec: object) => { ranking: { top_direction_codes: string[] }; directions: Record<string, { wins: number }> } } };
const oracle = oracleModule.create({ testId: "DISC_BEHAVIOR", directionCodes: quiz.directions.map(d => d.id), questionCount: 24, pairOccurrences: 4, scheduledComparisons: 12, status: reference.scoringSpec.status });

async function complete(page: Page, locale: "en" | "zh", mode: "D" | "all-A") {
  const answers: QuestionnaireAnswers = {};
  for (const [index, question] of quiz.questions.entries()) {
    const choice = mode === "D" ? question.options.find(o => o.directionId === "DOMINANCE") ?? question.options[0] : question.options[0];
    const radio = page.locator(`input[name="${question.id}"][value="${choice.id}"]`);
    await expect(radio).toBeAttached();
    if (index === 0) { await radio.focus(); await page.keyboard.press("Space"); await expect(radio).toBeChecked(); }
    else await radio.check();
    answers[question.id] = choice.id;
    const label = index === quiz.questions.length - 1 ? (locale === "zh" ? "查看完整结果" : "See full result") : (locale === "zh" ? "下一题" : "Next");
    await page.getByRole("button", { name: label, exact: true }).click();
  }
  const expected = oracle.scoreSubmission({ submission_id: "browser-reference", test_id: "DISC_BEHAVIOR", form_code: quiz.source.formCode, item_bank_version: quiz.source.itemBankVersion, scoring_version: quiz.source.scoringVersion, answers }, reference.itemBank, reference.scoringSpec);
  const profile = quiz.profiles.find(p => [...p.directionIds].sort().join("|") === [...expected.ranking.top_direction_codes].sort().join("|"))!;
  await expect(page.getByRole("heading", { level: 2, name: profile.title[locale], exact: true })).toBeFocused();
  const counts = page.getByRole("region", { name: locale === "zh" ? "本次原始选择次数" : "Raw choice counts for this attempt", exact: true });
  for (const direction of quiz.directions) await expect(counts.locator("dl > div").filter({ hasText: direction.title[locale] }).locator("dd")).toHaveText(`${expected.directions[direction.id].wins} / ${direction.comparisons}`);
  for (const section of profile.sections) await expect(page.locator(`#report-${section.id}`)).toBeAttached();
  for (const text of profile.sections.find(s => s.id === "thai-four-animals-labels")!.paragraphs) await expect(page.locator("#report-thai-four-animals-labels")).toContainText(text[locale]);
  return profile;
}

for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/disc`;
  test(`@release DISC ${locale}: hub, keyboard, all24choices, complete source report, retake and public guide`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const answerRequests: string[] = [];
    page.on("request", request => { if (request.method() === "POST" && /DISC_FC_/.test(request.postData() ?? "")) answerRequests.push(request.url()); });
    await page.goto(`/${locale}/tests`);
    await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await expect(page.getByRole("link", { name: zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions" })).toHaveCount(0);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    const profile = await complete(page, locale, "D");
    expect(profile.directionIds).toEqual(["DOMINANCE"]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole("link", { name: zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions" })).toHaveAttribute("href", /target_action=questionnaire_result_mbti/);
    await page.getByRole("link", { name: zh ? "阅读这项结果的公开说明" : "Read the public explanation of this result", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
    await expect(page.locator('link[rel="alternate"][hreflang="zh-CN"]')).toHaveAttribute("href", `https://fermatmind.com/zh/tests/explore/disc/results/${profile.id}`);
    await page.getByRole("link", { name: zh ? "免费开始完整测试" : "Start the full test for free", exact: true }).click();
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    const tied = await complete(page, locale, "all-A"); expect(tied.directionIds).toHaveLength(4);
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click();
    await expect(page.locator(`input[name="${quiz.questions[0].id}"]`).first()).not.toBeChecked();
    expect(answerRequests).toEqual([]);
  });

  test(`@release DISC ${locale}: opt-in draft survives refresh and language change, back/edit and clear`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); await page.goto(entry);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.getByRole("radio").nth(1).check(); await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await page.reload(); await page.getByRole("button", { name: zh ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click();
    await expect(page.locator(`input[name="${quiz.questions[1].id}"]`).first()).toBeAttached();
    await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click();
    await expect(page.getByRole("radio").nth(1)).toBeChecked();
    await page.getByRole("radio").first().check();
    const other = zh ? "en" : "zh";
    await page.goto(`/${other}/tests/explore/disc`);
    await page.getByRole("button", { name: other === "zh" ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click();
    await page.getByRole("button", { name: other === "zh" ? "上一题" : "Back", exact: true }).click();
    await expect(page.getByRole("radio").first()).toBeChecked();
    await page.getByRole("button", { name: other === "zh" ? "退出并清除本次进度" : "Exit and clear this attempt", exact: true }).click();
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:disc"))).toBeNull();
  });

  test(`@release DISC ${locale}: denied draft storage and clipboard retain complete result and safe manual sharing`, async ({ page }) => {
    await page.addInitScript(() => {
      const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
      Storage.prototype.getItem = function(key) { if (key.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return get.call(this, key); };
      Storage.prototype.setItem = function(key, value) { if (key.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return set.call(this, key, value); };
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } });
    });
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.getByRole("checkbox").check();
    await expect(page.getByRole("status")).toContainText(zh ? "无法保存" : "could not save");
    const profile = await complete(page, locale, "all-A");
    await page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click();
    const text = await page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue();
    expect(text).toContain(profile.title[locale]); expect(text).not.toMatch(/DISC_FC_|submission|answers|form_code|[?&]score/);
    const url = new URL(text.split("\n").at(-1)!); expect(url.pathname).toBe(`${entry}/results/${profile.id}`); expect(url.search).toBe(""); expect(url.hash).toBe("");
  });
}

test("@release DISC public images and closed identities", async ({ request }, testInfo) => {
  for (const path of ["/en/tests/explore/unknown", "/zh/tests/explore/disc/results/SINGLE_D", "/en/tests/explore/disc/results/unknown"]) expect((await request.get(path)).status()).toBe(404);
  for (const locale of ["en", "zh"]) for (const profile of ["", "single-d", "tied-d-i-s-c"]) {
    const response = await request.get(`/og/fun/disc?locale=${locale}&v=1.0.0${profile ? `&portrait=${profile}` : ""}`);
    expect(response.status()).toBe(200); expect(response.headers()["content-type"]).toContain("image/png");
    const bytes = await response.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
    if (locale === "zh" && profile === "single-d") await testInfo.attach("DISC-Chinese-result-image", { body: bytes, contentType: "image/png" });
  }
});

for (const locale of ["en", "zh"] as const) test(`@release T066 ${locale}: named animal versions and all fifteen canonical DISC guides`, async ({ page }) => {
  await page.goto(`/${locale}/tests/explore/disc`); await expect(page).toHaveTitle(`${quiz.seoTitle[locale]} | FermatMind`);
  for (const ref of quiz.references!) await expect(page.locator(`#questionnaire-references + ul a[href="${ref.url}"]`)).toHaveCount(1);
  for (const profile of quiz.profiles) {
    const path = `/${locale}/tests/explore/disc/results/${profile.id}`; await page.goto(path);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${path}`);
    for (const text of profile.sections.find(s => s.id === "thai-four-animals-labels")!.paragraphs) await expect(page.locator("#report-thai-four-animals-labels")).toContainText(text[locale]);
    if (profile.id === "tied-d-i-s-c") { await page.setViewportSize({ width: 390, height: 844 }); await page.locator("#report-thai-four-animals-labels").scrollIntoViewIfNeeded(); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); await page.screenshot({ path: test.info().outputPath(`${locale}-animals.png`) }); }
  }
});
