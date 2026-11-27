import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import type { Questionnaire, QuestionnaireAnswers } from "../../lib/questionnaires/types";

const quiz = JSON.parse(readFileSync(path.join(process.cwd(), "lib/questionnaires/data/response-color.json"), "utf8")) as Questionnaire;
const reference = JSON.parse(readFileSync(path.join(process.cwd(), "tests/fixtures/questionnaires/color-reference.json"), "utf8"));
const oracleModule = createRequire(path.join(process.cwd(), "package.json"))("./tests/fixtures/questionnaires/multidirection-scorer.cjs") as { create: (configuration: object) => { scoreSubmission: (submission: object, bank: object, spec: object) => { ranking: { top_direction_codes: string[] }; directions: Record<string, { wins: number }> } } };
const oracle = oracleModule.create({ testId: "PERSONALITY_COLOR", directionCodes: quiz.directions.map(d => d.id), questionCount: 24, pairOccurrences: 4, scheduledComparisons: 12, status: reference.scoringSpec.status });

async function complete(page: Page, locale: "en" | "zh", mode: "RED" | "all-A") {
  const answers: QuestionnaireAnswers = {};
  for (const [index, question] of quiz.questions.entries()) {
    const choice = mode === "RED" ? question.options.find(o => o.directionId === "RED") ?? question.options[0] : question.options[0];
    const radio = page.locator(`input[name="${question.id}"][value="${choice.id}"]`);
    await expect(radio).toBeAttached();
    if (index === 0) { await radio.focus(); await page.keyboard.press("Space"); }
    else await radio.click();
    answers[question.id] = choice.id;
    await expect(radio).toHaveCount(0);
  }
  const expected = oracle.scoreSubmission({ submission_id: "browser-reference", test_id: "PERSONALITY_COLOR", form_code: quiz.source.formCode, item_bank_version: quiz.source.itemBankVersion, scoring_version: quiz.source.scoringVersion, answers }, reference.itemBank, reference.scoringSpec);
  const profile = quiz.profiles.find(p => [...p.directionIds].sort().join("|") === [...expected.ranking.top_direction_codes].sort().join("|"))!;
  await expect(page.getByRole("heading", { level: 2, name: profile.title[locale], exact: true })).toBeFocused();
  const counts = page.getByRole("region", { name: locale === "zh" ? "本次原始选择次数" : "Raw choice counts for this attempt", exact: true });
  await expect(counts.locator("dt")).toHaveText(quiz.directions.map(direction => direction.title[locale]));
  await expect(counts.locator("dd")).toHaveText(quiz.directions.map(direction => `${expected.directions[direction.id].wins} / ${direction.comparisons}`));
  const reading = page.locator('#take-test article[data-reading-mode="result"]');
  for (const section of ["editorial-scene", "editorial-conversation"]) await expect(reading.locator(`#report-${section}`)).toBeVisible();
  return profile;
}

for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/response-color`;
  test(`@release Color ${locale}: hub, keyboard, all24choices, complete source report, retake and public guide`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const answerRequests: string[] = [];
    page.on("request", request => { if (request.method() === "POST" && /COLOR_FC_/.test(request.postData() ?? "")) answerRequests.push(request.url()); });
    await page.goto(`/${locale}/tests`);
    await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await expect(page.getByRole("link", { name: zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions" })).toHaveCount(0);
    await page.locator("#take-test [data-explore-start]").click();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    const profile = await complete(page, locale, "RED");
    expect(profile.directionIds).toEqual(["RED"]);
    await expect(page.locator('[data-archetype-core-assessment="BIG5_OCEAN"] a')).toHaveAttribute("href", `/${locale}/tests/big-five-personality-test-ocean-model`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const guidePromise = page.waitForEvent("popup");
    await page.locator(`#take-test a[href="${entry}/results/${profile.id}"]`).click();
    const guide = await guidePromise;
    await expect(guide.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
    await expect(guide.locator('link[rel="alternate"][hreflang="zh-CN"]')).toHaveAttribute("href", `https://fermatmind.com/zh/tests/explore/response-color/results/${profile.id}`);
    await guide.close();
    await page.getByRole("button", { name: zh ? "再测一次" : "Retake", exact: true }).click();
    const tied = await complete(page, locale, "all-A"); expect(tied.directionIds).toHaveLength(4);
    await page.getByRole("button", { name: zh ? "再测一次" : "Retake", exact: true }).click();
    await expect(page.locator(`input[name="${quiz.questions[0].id}"]`).first()).not.toBeChecked();
    expect(answerRequests).toEqual([]);
  });

  test(`@release Color ${locale}: back/edit stays local and reload clears the standalone session`, async ({ page }) => {
    await page.goto(`${entry}/take`);
    const first = page.locator(`#take-test input[name="${quiz.questions[0].id}"]`);
    const second = page.locator(`#take-test input[name="${quiz.questions[1].id}"]`);
    await expect(first.first()).toBeVisible();
    await expect(page.locator("#take-test").getByRole("checkbox")).toHaveCount(0);
    await first.nth(1).click();
    await expect(second.first()).toBeVisible();
    await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click();
    await expect(first.nth(1)).toBeChecked();
    await first.first().click();
    await expect(second.first()).toBeVisible();
    await page.reload();
    await expect(first.first()).toBeVisible();
    await expect(page.locator("#take-test").getByRole("radio", { checked: true })).toHaveCount(0);
    const other = zh ? "en" : "zh";
    await page.goto(`/${other}/tests/explore/response-color/take`);
    await expect(first.first()).toBeVisible();
    await expect(page.locator("#take-test").getByRole("radio", { checked: true })).toHaveCount(0);
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:response-color"))).toBeNull();
  });

  test(`@release Color ${locale}: denied draft storage and clipboard retain complete result and safe manual sharing`, async ({ page }) => {
    await page.addInitScript(() => {
      const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
      Storage.prototype.getItem = function(key) { if (key.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return get.call(this, key); };
      Storage.prototype.setItem = function(key, value) { if (key.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return set.call(this, key, value); };
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } });
    });
    await page.goto(`${entry}/take`);
    await expect(page.locator("#take-test").getByRole("checkbox")).toHaveCount(0);
    const profile = await complete(page, locale, "all-A");
    expect(profile.directionIds).toHaveLength(4);
    await page.getByRole("button", { name: zh ? "一键分享给朋友" : "Share Result", exact: true }).click();
    const text = await page.locator("[data-archetype-honor-group] textarea").inputValue();
    for (const direction of quiz.directions) expect(text).toContain(direction.title[locale]);
    expect(text).not.toMatch(/COLOR_FC_|submission|answers|form_code|[?&]score/);
    const url = new URL(text.split("\n").at(-1)!); expect(url.pathname).toBe(entry); expect(url.search).toBe(""); expect(url.hash).toBe("");
  });
}

test("@release Color public images and closed identities", async ({ request }, testInfo) => {
  for (const path of ["/en/tests/explore/unknown", "/zh/tests/explore/response-color/results/SINGLE_RED", "/en/tests/explore/response-color/results/unknown"]) expect((await request.get(path)).status()).toBe(404);
  for (const locale of ["en", "zh"]) for (const profile of ["", "red", "tied-red-yellow-blue-green"]) {
    const response = await request.get(`/og/fun/response-color?locale=${locale}&v=2.0.0${profile ? `&portrait=${profile}` : ""}`);
    expect(response.status()).toBe(200); expect(response.headers()["content-type"]).toContain("image/png");
    const bytes = await response.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
    if (locale === "zh" && profile === "red") await testInfo.attach("Color-Chinese-result-image", { body: bytes, contentType: "image/png" });
  }
});

for (const locale of ["en", "zh"] as const) {
  test(`@release Color ${locale}: pre-hydration hub navigation replaces the document and has one canonical`, async ({ page }) => {
    const session = await page.context().newCDPSession(page);
    await session.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await page.goto(`/${locale}/tests`, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => { document.documentElement.dataset.qaPreviousDocument = "hub"; });
    await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/tests/explore/response-color$`));
    await expect(page.locator("html")).not.toHaveAttribute("data-qa-previous-document", "hub");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com/${locale}/tests/explore/response-color`);
    await expect(page.locator(`link[rel="canonical"][href="https://fermatmind.com/${locale}/tests"]`)).toHaveCount(0);
  });
}

for (const locale of ["en", "zh"] as const) {
  test(`@release Color ${locale}: the server-rendered start form works before scripts load`, async ({ page }) => {
    let releaseScripts!: () => void;
    const scriptsReady = new Promise<void>(resolve => { releaseScripts = resolve; });
    await page.route("**/_next/static/chunks/*.js", async route => { await scriptsReady; await route.continue(); });
    try {
      await page.goto(`/${locale}/tests/explore/response-color`, { waitUntil: "commit" });
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
      const start = page.locator("#take-test [data-explore-start]");
      await expect(start).toBeEnabled();
      await start.click();
      await expect(page).toHaveURL(new RegExp(`/${locale}/tests/explore/response-color/take(?:[?]start=1)?$`));
      await expect(page.getByRole("radio")).toHaveCount(0);
      releaseScripts();
      await page.locator(`input[name="${quiz.questions[0].id}"]`).first().click();
      await expect(page.locator(`input[name="${quiz.questions[1].id}"]`).first()).toBeAttached();
    } finally { releaseScripts(); }
  });
}
