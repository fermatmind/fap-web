import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";
import { seedAnalyticsConsent } from "./helpers/consent";
import { expectQuestionContext } from "./helpers/question-context";
import { expectQuestionnaireSessionPrivacy } from "./helpers/questionnaire-session-privacy";

test.beforeEach(async ({ page }) => { await seedAnalyticsConsent(page); });

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/music-taste-test.json", "utf8")) as Questionnaire;
async function finish(page: Page, locale: "en" | "zh", mode: "patterns" | "na" | "missing-part") {
  const scores: Record<string, string> = { pop: "5", rock: "4", "hip-hop": "3", electronic: "2", jazz: "1", "western-classical": "4", "acoustic-folk": "3", country: "2" };
  for (const [index, question] of quiz.questions.entries()) {
    const pattern = question.options[0].directionId;
    const value = mode === "na" || (mode === "missing-part" && pattern === "country") ? "na" : mode === "missing-part" ? "4" : scores[pattern];
    const radio = page.locator(`input[name="${question.id}"][value="${value}"]`);
    if (index < 23) await expect(page.locator("[data-music-facet]")).toHaveCount(0);
    await radio.press("Space");
    const next = quiz.questions[index + 1];
    if (next) await expect(page.locator('input[name="' + next.id + '"]').first()).toBeVisible();
  }
  await expect(page.getByRole("heading", { level: 2, name: quiz.resultHeading![locale], exact: true })).toBeFocused();
  await expect(page.locator("[data-music-facet]")).toHaveCount(8); await expect(page.locator("[data-music-profile]")).toHaveCount(8);
  await expect(page.locator("#take-test h4")).toHaveCount(96);
  for (const direction of quiz.directions) {
    const mean = page.locator(`[data-music-facet="${direction.id}"] [data-music-mean]`);
    const unscored = mode === "na" || (mode === "missing-part" && direction.id === "country");
    await expect(mean).toHaveText(unscored ? (locale === "zh" ? "资料不足" : "Insufficient information") : mode === "missing-part" ? "4.0 / 5" : `${scores[direction.id]}.0 / 5`);
  }
  await expect(page.locator("[data-music-insufficient]")).toHaveCount(mode === "na" ? 1 : 0);
  await expect(page.locator("[data-facet-score], [data-humor-facet], [data-communication-facet], [data-attachment-axis]")).toHaveCount(0);
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(n => n.id)); expect(new Set(ids).size).toBe(ids.length);
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/music-taste-test`;
  test(`@release Music preferences ${locale}: hub, keyboard,24actualratings, eight liking means,96 full sections and retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); const leaks: string[] = [];
    page.on("request", r => { if (r.method() === "POST" && /MUSIC_/.test(r.postData() ?? "")) leaks.push(r.url()); });
    await page.goto(`/${locale}/tests`);
    await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.getByText(zh ? "原创音乐喜好回顾 · 完整结果免费" : "Original music preference reflection · Full results free", { exact: true })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await expect(page.getByRole("link", { name: zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions" })).toHaveCount(0);
    await page.locator("#take-test [data-explore-start]").click();
    await expect(page).toHaveURL(url => url.pathname === `${entry}/take`);
    await expectQuestionContext(page);
    await finish(page, locale, "patterns");
    for (const profile of quiz.profiles) {
      await expect(page.locator(`[data-music-profile="${profile.id}"] a[href="${entry}/results/${profile.id}"]`)).toBeVisible();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: zh ? "再测一次" : "Retake", exact: true }).click();
    await expect(page.locator("[data-music-facet]")).toHaveCount(0); await expect(page.getByRole("radio").first()).not.toBeChecked(); expect(leaks).toEqual([]);
  });
  test(`@release Music preferences ${locale}: refresh and language change start with blank answers`, async ({ page }) => {
    await page.goto(entry);
    const disclosureLabel = zh ? "展开来源、隐私与解读边界" : "Sources, privacy and interpretation limits";
    const disclosure = page.locator("details").filter({ has: page.getByText(disclosureLabel, { exact: true }) });
    await disclosure.getByText(disclosureLabel, { exact: true }).click();
    await expect(disclosure.getByText(zh ? "这份测试不保存答题进度" : "This quiz does not save your progress")).toBeVisible();
    await expectQuestionnaireSessionPrivacy(page, locale, quiz);
  });
  test(`@release Music preferences ${locale}: denied storage/clipboard, unscored and one missing pattern retain all full guides with safe share`, async ({ page }) => {
    await page.addInitScript(() => {
      const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
      Storage.prototype.getItem = function(k) { if (k.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return get.call(this, k); };
      Storage.prototype.setItem = function(k, v) { if (k.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return set.call(this, k, v); };
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } });
    });
    await page.goto(entry);
    await page.locator("#take-test [data-explore-start]").click();
    await expect(page.getByRole("checkbox")).toHaveCount(0); await finish(page, locale, "na");
    await expect(page.locator("[data-archetype-honor-group]").getByRole("heading", { level: 3, name: zh ? "资料不足" : "Insufficient information", exact: true })).toBeVisible();
    await page.getByRole("button", { name: zh ? "再测一次" : "Retake", exact: true }).click(); await finish(page, locale, "missing-part");
    await page.getByRole("button", { name: zh ? "一键分享给朋友" : "Share Result", exact: true }).click();
    const text = await page.locator("[data-archetype-honor-group] textarea").inputValue(); expect(text).toContain(quiz.title[locale]);
    expect(text).not.toMatch(/MUSIC_|answers|form_code|5\.0|4\.0|3\.0|2\.0|1\.0|[?&]score/);
    const url = new URL(text.split("\n").at(-1)!); expect(url.pathname).toBe(entry); expect(url.search).toBe(""); expect(url.hash).toBe("");
  });
}
test("@release Music preferences all16public full guides, bilingual images and closed identities", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) for (const profile of quiz.profiles) {
    const path = `/${locale}/tests/explore/music-taste-test/results/${profile.id}`;
    expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
    await expect(page.locator("[data-music-facet]")).toHaveCount(0);
    for (const section of profile.sections) await expect(page.locator(`#report-${section.id} h2`)).toHaveText(section.title[locale]);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/music-taste-test/results/${profile.id}`);
    await expect(page.getByRole("link", { name: locale === "zh" ? "免费开始完整测试" : "Start the full test for free", exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/music-taste-test#take-test`);
    const image = await request.get(`/og/fun/music-taste-test?locale=${locale}&portrait=${profile.id}&v=1.0.0`); expect(image.status()).toBe(200); const b = await image.body(); expect(b.readUInt32BE(16)).toBe(1200); expect(b.readUInt32BE(20)).toBe(630);
  }
  for (const path of ["/en/tests/explore/music-taste-test/results/unknown", "/zh/tests/explore/music-taste-test/results/MUSIC_ASSERTIVE_01", "/en/tests/play/music-taste-test"]) expect((await request.get(path)).status()).toBe(404);
});
