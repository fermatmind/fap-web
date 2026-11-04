import { test, expect, type Page, type Locator } from "@playwright/test";
import disc from "../../lib/questionnaires/data/disc.json";
import healthWorry from "../../lib/questionnaires/data/health-worries-reflection.json";
import ptq from "../../lib/questionnaires/data/overthinking-screener.json";
import sql from "../../lib/questionnaires/data/sql-test.json";
import hogwarts from "../../lib/questionnaires/data/hogwarts-house-quiz.json";
import beach from "../../lib/entertainment/data/beachcomber.json";
import { CATEGORIES } from "../../lib/friendship/core";
import story from "../../lib/entertainment/data/story-ending.json";

async function inspectLayout(page: Page, result: Locator, name: string) {
  await expect(result).toBeVisible();
  await expect(result.locator("h2").first()).toBeVisible();
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name} at ${width}px`).toBe(true);
    const crampedLabels = await result.locator('dt, ul[class*="overviewItems"] > li > span:first-child').evaluateAll(elements => elements.filter(element => (element.textContent?.length ?? 0) > 30 && element.getBoundingClientRect().width < 120).map(element => element.textContent));
    expect(crampedLabels, `${name}: long labels need room to read at ${width}px`).toEqual([]);
    await page.evaluate(() => window.scrollTo(0, 0));
    if (width !== 320) await page.screenshot({ path: test.info().outputPath(`${name}-${width}.png`), fullPage: false });
  }
  expect(await result.locator("[id]").evaluateAll(elements => new Set(elements.map(element => element.id)).size === elements.length)).toBe(true);
}

function tiedDiscAnswers() {
  const counts = Object.fromEntries(disc.directions.map(direction => [direction.id, 0]));
  const answers: string[] = [];
  function visit(index: number): boolean {
    if (index === disc.questions.length) return Object.values(counts).every(value => value === 6);
    for (const option of disc.questions[index].options) {
      if (counts[option.directionId] >= 6) continue;
      counts[option.directionId]++; answers[index] = option.id;
      if (visit(index + 1)) return true;
      counts[option.directionId]--;
    }
    return false;
  }
  if (!visit(0)) throw new Error("The fixed DISC fixture must allow the independently expected 6/6/6/6 tie");
  return answers;
}

for (const locale of ["en", "zh"] as const) {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => {
      localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied", updatedAt: new Date().toISOString() }));
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("Synthetic clipboard denial"); } } });
    });
  });

  test(`entertainment result ${locale}: all four highest ties retain raw counts and readable navigation`, async ({ page }) => {
    await page.goto(`/${locale}/tests/explore/disc/take`);
    const answers = tiedDiscAnswers();
    for (const [index, question] of disc.questions.entries()) await page.locator(`input[name="${question.id}"][value="${answers[index]}"]`).check();
    const result = page.locator('#take-test[data-stage="result"]');
    await expect(result).toContainText(disc.profiles.find(profile => profile.directionIds.length === 4)!.title[locale]);
    const countsSummary = result.getByText(locale === "zh" ? "查看各方向的原始选择次数" : "View the raw counts for every direction", { exact: true });
    await expect(countsSummary).toBeVisible();
    await countsSummary.click();
    const counts = result.getByRole("region", { name: locale === "zh" ? "本次原始选择次数" : "Raw choice counts for this attempt", exact: true });
    await expect(counts).toBeVisible();
    await expect(counts.locator("strong")).toHaveText(["6 / 12", "6 / 12", "6 / 12", "6 / 12"]);
    await inspectLayout(page, result, `disc-tie-${locale}`);
    await page.getByRole("button", { name: locale === "zh" ? "重新测试" : "Retake test", exact: true }).click();
    await expect(page.locator('#take-test[data-stage="answer"] input:checked')).toHaveCount(0);
  });

  test(`entertainment result ${locale}: unscored reflection never becomes zero and shares only its public entry`, async ({ page }) => {
    const sensitivePosts: string[] = [];
    page.on("request", request => { if (request.method() === "POST" && /PTQ_\d+|overallSum|"answers"/.test(request.postData() ?? "")) sensitivePosts.push(request.url()); });
    await page.goto(`/${locale}/tests/explore/${ptq.slug}/take`);
    for (const question of ptq.questions) await page.locator(`input[name="${question.id}"][value="na"]`).check();
    const result = page.locator('#take-test[data-stage="result"]');
    const score = result.locator('[data-ptq15-score="total-reading"]');
    await expect(score).toContainText(locale === "zh" ? "资料不足" : "Insufficient information");
    await expect(score).toContainText("0/15");
    await inspectLayout(page, result, `reflection-unscored-${locale}`);
    await page.getByRole("button", { name: locale === "zh" ? "复制公开入口" : "Copy public entry", exact: true }).click();
    const copied = await page.getByRole("textbox", { name: locale === "zh" ? "手动复制结果" : "Result text for manual copying" }).inputValue();
    expect(copied).toBe(`${ptq.title[locale]}\nhttps://fermatmind.com/${locale}/tests/explore/${ptq.slug}`);
    expect(sensitivePosts).toEqual([]);
    expect(await page.evaluate(() => Object.keys(sessionStorage).filter(key => key.startsWith("fm_questionnaire_draft:")))).toEqual([]);
  });

  test(`entertainment result ${locale}: practice keeps correct totals and question explanations`, async ({ page }) => {
    await page.goto(`/${locale}/tests/explore/${sql.slug}/take`);
    for (const question of sql.questions) await page.locator(`input[name="${question.id}"][value="${question.correctOptionId}"]`).check();
    const result = page.locator('#take-test[data-stage="result"]');
    await expect(result.locator("[data-practice-correct]")).toContainText("24 / 24");
    await expect(result.locator("[data-practice-explanation]")).toHaveCount(24);
    await expect(result.locator("[data-practice-focus]")).toBeVisible();
    expect(await result.locator("[data-practice-focus]").evaluate(element => element.closest("details") === null)).toBe(true);
    await expect(result.locator("[data-practice-focus-explanation]")).toHaveText(sql.questions[0].explanation[locale]);
    const answerDirectory = result.getByText(locale === "zh" ? "答案与复习" : "Answers and revision", { exact: true });
    await answerDirectory.click();
    await result.getByRole("navigation", { name: locale === "zh" ? "答案与复习" : "Answers and revision", exact: true }).getByRole("link", { name: locale === "zh" ? "逐题答案与解析" : "Every answer and explanation", exact: true }).click();
    const answers = result.locator("#practice-answer-review");
    await expect(answers.locator(":scope > summary")).toBeInViewport();
    await answers.locator(":scope > summary").click();
    await expect(answers.locator("[data-practice-question]").first()).toBeVisible();
    await expect(answers.locator("[data-practice-question] h4").first()).toBeInViewport();
    await inspectLayout(page, result, `practice-${locale}`);
  });

  test(`entertainment result ${locale}: character portrait keeps authored identity and full interpretation`, async ({ page }) => {
    await page.goto(`/${locale}/tests/explore/${hogwarts.slug}/take`);
    for (const question of hogwarts.questions) await page.locator(`input[name="${question.id}"]`).first().check();
    const result = page.locator('#take-test[data-stage="result"]');
    await expect(result.locator("[data-hogwarts-house-result-reading]")).toHaveCount(4);
    for (const profile of hogwarts.profiles) {
      const reading = result.locator(`[data-hogwarts-house-result-reading="${profile.id}"]`);
      for (const section of profile.sections) for (const paragraph of section.paragraphs) await expect(reading).toContainText(paragraph[locale]);
    }
    await inspectLayout(page, result, `character-${locale}`);
    await result.locator('[data-archetype-match="gryffindor"]').getByRole("link", { name: locale === "zh" ? "单独阅读这项结果的完整指南" : "Read this result’s full guide separately", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(hogwarts.profiles[0].title[locale]);
    await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
  });

  test(`entertainment result ${locale}: tally keeps every tied portrait; branching ending keeps narrative fields`, async ({ page }) => {
    await page.goto(`/${locale}/tests/play/${beach.slug}/take`);
    for (const question of beach.questions) await page.locator(`input[name="${question.id}"][value="o1"]`).check();
    let result = page.locator('#play[data-stage="result"]');
    for (const portrait of beach.results) {
      await expect(result).toContainText(portrait.title[locale]);
      await expect(result).toContainText(portrait.experiment[locale]);
    }
    await expect(result).toContainText(locale === "zh" ? "并列" : "tie");
    const tallyRules = result.locator(`#${beach.slug}-result-rules`);
    await tallyRules.locator(":scope > summary").click();
    await expect(tallyRules.locator("dd")).toHaveText(["2", "2", "2"]);
    await inspectLayout(page, result, `story-tally-${locale}`);
    await page.goto(`/${locale}/tests/play/${story.slug}/take`);
    for (const [id, option] of [["q1", "o1"], ["q2", "o1"], ["q4", "o1"]]) await page.locator(`input[name="${id}"][value="${option}"]`).check();
    result = page.locator('#play[data-stage="result"]');
    const ending = story.results.find(portrait => portrait.id === "return")!;
    for (const field of ["summary", "example", "strength", "tradeoff", "experiment"] as const) await expect(result).toContainText(ending[field][locale]);
    await expect(result).not.toContainText(/Choice point totals|累计分/);
    await expect(result.getByRole("heading", { name: locale === "zh" ? "这个结局留下了什么" : "What this ending offers", exact: true })).toBeVisible();
    await expect(result).not.toContainText(/你带来的好处|What you bring/);
    await inspectLayout(page, result, `story-branch-${locale}`);
    await result.getByRole("link", { name: locale === "zh" ? `阅读「${ending.title.zh}」公开指南` : `Read the public guide to ${ending.title.en}`, exact: true }).click();
    for (const [quiz, portrait] of [[story, ending], [beach, beach.results[0]]] as const) {
      if (quiz.slug !== story.slug) await page.goto(`/${locale}/tests/play/${quiz.slug}/results/${portrait.id}`);
      const guide = page.locator("[data-story-guide]");
      for (const field of ["summary", "example", "strength", "tradeoff", "experiment"] as const) await expect(guide).toContainText(portrait[field][locale]);
      if (quiz.mechanism === "branch") await expect(guide.getByRole("heading", { name: locale === "zh" ? "这段结尾的作用" : "What this ending does", exact: true })).toBeVisible();
      await guide.getByRole("navigation", { name: locale === "zh" ? "本页内容" : "On this page", exact: true }).getByRole("link", { name: locale === "zh" ? "小行动" : "Try it", exact: true }).click();
      await expect(guide.locator("#experiment h2")).toBeInViewport();
      await inspectLayout(page, guide, `public-${quiz.mechanism}-${locale}`);
    }
  });
  for (const mode of ["all-unscored", "categorical"] as const) {
    test(`entertainment result ${locale}: health-worry ${mode} completed topics reach real readings`, async ({ page }) => {
      const privatePosts: string[] = [];
      page.on("request", request => { if (request.method() === "POST" && /HLW_\d+|"answers"|"observations"/.test(request.postData() ?? "")) privatePosts.push(request.url()); });
      await page.goto(`/${locale}/tests/explore/${healthWorry.slug}/take`);
      const categories = ["0", "1", "2", "3", "4", "na"];
      for (const [index, question] of healthWorry.questions.entries()) {
        await expect(page.locator("#health-worry-active-question")).toHaveText(question.prompt[locale]);
        await expect(page.locator("[data-health-worry-result]")).toHaveCount(0);
        await page.locator(`input[name="${question.id}"][value="${mode === "all-unscored" ? "na" : categories[index % 6]}"]`).check();
      }
      const result = page.locator("[data-health-worry-result]");
      await expect(result).toBeVisible();
      await expect(result.locator("[data-health-worry-unscored]")).toHaveCount(mode === "all-unscored" ? 3 : 0);
      await expect(result.locator("[data-health-worry-support]").first()).toBeVisible();
      const topics = result.getByRole("navigation", { name: locale === "zh" ? "本次主题记录" : "Topics in this record", exact: true, includeHidden: true });
      const disclosure = topics.locator("xpath=ancestor::details[1]");
      await disclosure.locator(":scope > summary").click();
      await expect(topics.locator("a")).toHaveCount(3);
      const expectedCounts = [[2, 1, 1, 1, 1, 1], [1, 2, 1, 1, 1, 1], [1, 1, 2, 1, 1, 1]];
      for (const [index, direction] of healthWorry.directions.entries()) {
        const link = topics.locator(`a[href="#health-worry-record-${direction.id}"]`);
        await link.click();
        const theme = result.locator(`[data-health-worry-theme="${direction.id}"]`);
        const heading = theme.getByRole("heading", { level: 3 });
        await expect(heading).toBeInViewport({ ratio: 1 });
        expect((await heading.boundingBox())!.y).toBeGreaterThanOrEqual(60);
        await expect(theme.locator("[data-health-worry-topic-summary]")).toContainText(healthWorry.profiles[index].summary[locale]);
        const example = theme.locator('[data-reading-mode="result"] > section');
        await expect(example).toHaveCount(1);
        expect(await example.evaluate(element => element.closest("details") === null)).toBe(true);
        for (const [categoryIndex, category] of categories.entries()) {
          const count = mode === "all-unscored" ? (category === "na" ? 7 : 0) : expectedCounts[index][categoryIndex];
          await expect(theme.locator(`[data-health-worry-count="${direction.id}-${category}"]`)).toHaveText(`${count} / 7`);
        }
        const full = theme.locator('[data-reading-mode="result"] > details');
        await full.locator(":scope > summary").click();
        await expect(full).toHaveAttribute("open", "");
        for (const section of healthWorry.profiles[index].sections) for (const paragraph of section.paragraphs) await expect(theme).toContainText(paragraph[locale]);
      }
      await inspectLayout(page, result, `health-worry-${mode}-${locale}`);
      expect(privatePosts).toEqual([]);
      expect(await page.evaluate(() => Object.keys(sessionStorage).filter(key => /HLW_|health-worries/.test(key)))).toEqual([]);
    });
  }

  test(`entertainment result ${locale}: friendship keeps game scoring, tied highlights and unavailable comparisons`, async ({ page }) => {
    const id = "11111111-1111-4111-8111-111111111111";
    const questions = Object.keys(CATEGORIES).flatMap(category => Array.from({ length: 5 }, (_, index) => ({ id: `${category}-${index}`, category, en: { prompt: "Which would I pick?", options: ["First", "Second"] }, zh: { prompt: "我会怎样选？", options: ["第一项", "第二项"] } })));
    const categories = Object.fromEntries(Object.keys(CATEGORIES).map(category => [category, { correct: 3, total: 5 }]));
    const challenge = { id, nickname: "Creator", locale, version: "synthetic", questions, entries: [], closed: false, expires_at: "2027-01-01 00:00:00" };
    const result = { id: "own", nickname: "Friend", correct: 18, total: 30, percent: 60, categories, answers: Array(30).fill(0), guesses: Array.from({ length: 30 }, (_, index) => index % 5 < 3 ? 0 : 1), preview: false, entries: [] };
    await page.addInitScript(challengeId => localStorage.setItem(`fm:friendship:player:${challengeId}`, JSON.stringify({ key: "a".repeat(64), answers: [], index: 0, nickname: "Friend" })), id);
    await page.route("**/v0.3/friendship/**", async route => {
      const path = new URL(route.request().url()).pathname;
      const body = path.endsWith("/catalog") ? { version: "synthetic", categories: CATEGORIES, questions } : path.endsWith("/result") ? result : challenge;
      await route.fulfill({ json: body });
    });
    await page.goto(`/${locale}/share/friendship/${id}`);
    const view = page.locator(".fq-result");
    await expect(view.getByRole("img", { name: /18\/30.*60%/ })).toBeVisible();
    await expect(view).toContainText(locale === "zh" ? "（并列）" : "(tied)");
    await expect(view.getByText(locale === "zh" ? "尚无其他参与记录，暂无平均参照。" : "No other entries yet; no average to compare with.", { exact: true })).toHaveCount(6);
    await expect(view.locator(".fq-answer-list")).not.toBeVisible();
    await expect(view).not.toContainText("a".repeat(64));
    await inspectLayout(page, view, `friendship-${locale}`);
    await view.getByText(locale === "zh" ? "查看逐题对照" : "See every answer", { exact: true }).click();
    const firstAnswer = view.locator("#fq-conversation .fq-answer-list > li").first();
    await firstAnswer.scrollIntoViewIfNeeded();
    await expect(firstAnswer).toBeInViewport();
    await expect(firstAnswer).toContainText(locale === "zh" ? "第一项" : "First");
  });

}
