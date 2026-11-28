import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";
import { seedAnalyticsConsent } from "./helpers/consent";
import { expectQuestionContext } from "./helpers/question-context";
import { expectQuestionnaireSessionPrivacy } from "./helpers/questionnaire-session-privacy";

test.beforeEach(async ({ page }) => { await seedAnalyticsConsent(page); });

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/hogwarts-house-quiz.json", "utf8")) as Questionnaire;
async function finish(page: Page, locale: "en" | "zh", mode: "gryffindor" | "tie") {
  for (const [index, question] of quiz.questions.entries()) {
    const option = mode === "tie" ? question.options[0] : question.options.find(o => o.directionId === "gryffindor") ?? question.options[0];
    const radio = page.locator(`input[name="${question.id}"][value="${option.id}"]`);
    if (index < 23) await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
    await radio.press("Space");
    const next = quiz.questions[index + 1];
    if (next) await expect(page.locator('input[name="' + next.id + '"]').first()).toBeVisible();
  }
  await expect(page.getByRole("heading", { level: 2, name: quiz.resultHeading![locale], exact: true })).toBeFocused();
  await expect(page.locator("[data-archetype-count]")).toHaveCount(4);
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(node => node.id));
  expect(new Set(ids).size).toBe(ids.length);
  if (mode === "gryffindor") {
    await expect(page.locator('[data-archetype-count="gryffindor"]')).toContainText("24 / 24");
    await expect(page.locator("[data-archetype-match]")).toHaveCount(1);
    await expect(page.locator('[data-archetype-match="gryffindor"] h4')).toHaveCount(12);
  } else {
    for (const theme of quiz.directions) {
      await expect(page.locator(`[data-archetype-count="${theme.id}"]`)).toContainText("6 / 24");
      await expect(page.locator(`[data-archetype-match="${theme.id}"] h4`)).toHaveCount(12);
    }
    await expect(page.locator("[data-archetype-match]")).toHaveCount(4);
    await expect(page.locator("#take-test h4")).toHaveCount(48);
  }
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/hogwarts-house-quiz`;
  test(`@release Hogwarts fan house themes ${locale}: hub, keyboard,24realchoices, full unique match and retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const posts: string[] = [];
    page.on("request", request => { if (request.method() === "POST" && /HOUSE_[0-9]{2}/.test(request.postData() ?? "")) posts.push(request.url()); });
    await page.goto(`/${locale}/tests`); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.getByText(zh ? "原创象征测验 · 非官方同人版" : "Original symbolic quiz · Independent fan edition", { exact: true })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await expect(page.getByRole("link", { name: zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions" })).toHaveCount(0);
    await page.locator("#take-test [data-explore-start]").click();
    await expectQuestionContext(page);
    await finish(page, locale, "gryffindor");
    await expect(page.locator(`#take-test a[href="${entry}/results/gryffindor"]`).first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: zh ? "再测一次" : "Retake", exact: true }).click();
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0); await expect(page.getByRole("radio").first()).not.toBeChecked();
    expect(posts).toEqual([]);
  });
  test(`@release Hogwarts fan house themes ${locale}: refresh and language change start with blank answers`, async ({ page }) => {
    await page.goto(entry);
    const disclosure = page.locator("details[data-ent-boundary]");
    await disclosure.locator("summary").click();
    await expect(disclosure.getByText(zh ? "这份测试不保存答题进度" : "This quiz does not save your progress")).toBeVisible();
    await expectQuestionnaireSessionPrivacy(page, locale, quiz);
  });
  test(`@release Hogwarts fan house themes ${locale}: denied storage, four-way tie shows48 sections and private-safe clipboard fallback`, async ({ page }) => {
    await page.addInitScript(() => {
      const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
      Storage.prototype.getItem = function(key) { if (key.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return get.call(this, key); };
      Storage.prototype.setItem = function(key, value) { if (key.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return set.call(this, key, value); };
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } });
    });
    await page.goto(entry); await page.locator("#take-test [data-explore-start]").click();
    await expect(page.getByRole("checkbox")).toHaveCount(0);
    await finish(page, locale, "tie");
    await page.getByRole("button", { name: zh ? "一键分享给朋友" : "Share Result", exact: true }).click();
    const text = await page.locator("[data-archetype-honor-group] textarea").inputValue();
    const houseNames = zh ? ["格兰芬多", "赫奇帕奇", "拉文克劳", "斯莱特林"] : ["Gryffindor", "Hufflepuff", "Ravenclaw", "Slytherin"];
    for (const name of houseNames) expect(text).toContain(name);
    expect(text).not.toMatch(/HOUSE_[0-9]{2}|answers|form_code|submission|6\s*\/\s*24|[?&]score/);
    const url = new URL(text.match(/https:\/\/[^\s]+$/u)![0]); expect(url.pathname).toBe(entry); expect(url.search).toBe(""); expect(url.hash).toBe("");
  });
}

test("@release Hogwarts fan house themes all8public full guides, bilingual images and closed identities", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) for (const profile of quiz.profiles) {
    const path = `/${locale}/tests/explore/hogwarts-house-quiz/results/${profile.id}`;
    expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
    for (const section of profile.sections) await expect(page.locator(`#report-${section.id} h2`)).toHaveText(section.title[locale]);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/hogwarts-house-quiz/results/${profile.id}`);
    await expect(page.getByRole("link", { name: locale === "zh" ? "免费开始完整测试" : "Start the full test for free", exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/hogwarts-house-quiz#take-test`);
    const image = await request.get(`/og/fun/hogwarts-house-quiz?locale=${locale}&portrait=${profile.id}&v=1.0.0`); expect(image.status()).toBe(200);
    const bytes = await image.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
  }
  for (const path of ["/en/tests/explore/hogwarts-house-quiz/results/unknown", "/zh/tests/explore/hogwarts-house-quiz/results/HOUSE_01", "/en/tests/play/hogwarts-house-quiz"]) expect((await request.get(path)).status()).toBe(404);
});
