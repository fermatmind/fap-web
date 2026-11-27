import { seedAnalyticsConsent } from "./helpers/consent";
import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import type { Questionnaire, QuestionnaireAnswers } from "../../lib/questionnaires/types";

test.beforeEach(async ({ page }) => { await seedAnalyticsConsent(page); });

const quiz = JSON.parse(readFileSync(path.join(process.cwd(), "lib/questionnaires/data/disc.json"), "utf8")) as Questionnaire;
const reference = JSON.parse(readFileSync(path.join(process.cwd(), "tests/fixtures/questionnaires/disc-reference.json"), "utf8"));
const oracleModule = createRequire(path.join(process.cwd(), "package.json"))("./tests/fixtures/questionnaires/multidirection-scorer.cjs") as { create: (configuration: object) => { scoreSubmission: (submission: object, bank: object, spec: object) => { ranking: { top_direction_codes: string[] }; directions: Record<string, { wins: number }> } } };
const oracle = oracleModule.create({ testId: "DISC_BEHAVIOR", directionCodes: quiz.directions.map(d => d.id), questionCount: 24, pairOccurrences: 4, scheduledComparisons: 12, status: reference.scoringSpec.status });

type Submission = { answers: QuestionnaireAnswers; locale: string; client_ref: string };
const codes = ["D", "I", "S", "C"] as const;

function resultFixture(attemptId: string, answers: QuestionnaireAnswers) {
  const score = oracle.scoreSubmission({ submission_id: attemptId, test_id: "DISC_BEHAVIOR", form_code: quiz.source.formCode, item_bank_version: quiz.source.itemBankVersion, scoring_version: quiz.source.scoringVersion, answers }, reference.itemBank, reference.scoringSpec);
  const profile = quiz.profiles.find(profile => [...profile.directionIds].sort().join("|") === [...score.ranking.top_direction_codes].sort().join("|"));
  expect(profile).toBeDefined();
  const scores = Object.fromEntries(quiz.directions.map((direction, index) => [codes[index], score.directions[direction.id].wins]));
  return {
    ok: true, attempt_id: attemptId, scale_code: "DISC_BEHAVIOR",
    meta: { scale_code: "DISC_BEHAVIOR", form_code: quiz.source.formCode },
    result: { type_code: profile!.id, scores_pct: scores, scale_code: "DISC_BEHAVIOR" },
    report_purchase: { attempt_id: attemptId, unlocked: false, offers: [] },
    locked: true, access_level: "free", variant: "free",
  };
}

async function mockDiscResults(page: Page, failFirstSave: boolean) {
  const submissions: Submission[] = [];
  const attempts = new Map<string, ReturnType<typeof resultFixture>>();
  await page.route("**/api/v0.3/auth/guest", route => route.fulfill({ json: { ok: true, fm_token: "fm_e2e_disc_guest_token" } }));
  await page.route("**/api/v0.3/me/attempts/link-anon", route => route.fulfill({ json: { ok: true, linked_attempt_ids: [], skipped_attempt_ids: [] } }));
  await page.route("**/api/v0.3/disc-assessment/results", async route => {
    const submission = route.request().postDataJSON() as Submission;
    submissions.push(submission);
    if (failFirstSave && submissions.length === 1) {
      await route.fulfill({ status: 503, json: { ok: false, message: "Synthetic save failure" } });
      return;
    }
    const attemptId = `00000000-0000-4000-8000-${String(attempts.size + 1).padStart(12, "0")}`;
    const fixture = resultFixture(attemptId, submission.answers);
    attempts.set(attemptId, fixture);
    await route.fulfill({ json: fixture });
  });
  await page.route(/\/api\/v0\.3\/attempts\/[^/]+\/(?:report(?:-access)?|result)(?:\?.*)?$/, async route => {
    const segments = new URL(route.request().url()).pathname.split("/");
    const fixture = attempts.get(segments.at(-2)!);
    if (!fixture) {
      await route.fulfill({ status: 404, json: { ok: false } });
      return;
    }
    await route.fulfill({ json: segments.at(-1) === "report-access"
      ? { ...fixture, access_state: "locked", report_state: "ready", pdf_state: "missing", projection_version: 1, payload: { locked: true } }
      : fixture });
  });
  return { attempts, submissions };
}

async function answerDisc(page: Page, mode: "D" | "all-A") {
  const answers: QuestionnaireAnswers = {};
  for (const [index, question] of quiz.questions.entries()) {
    const choice = mode === "D" ? question.options.find(option => option.directionId === "DOMINANCE") ?? question.options[0] : question.options[0];
    const radio = page.locator(`input[name="${question.id}"][value="${choice.id}"]`);
    if (index === 0) {
      await radio.focus();
      await page.keyboard.press("Space");
    } else {
      await radio.click();
    }
    answers[question.id] = choice.id;
    if (index < quiz.questions.length - 1) await expect(radio).toHaveCount(0);
  }
  return answers;
}

for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/disc`;
  test(`@release DISC ${locale}: canonical landing, keyboard, all 24 answers, private result and public guide`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const { attempts, submissions } = await mockDiscResults(page, false);
    await page.goto(entry);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(zh ? "DISC测试看见你通常怎样推进和协作" : "Free DISC Assessment");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com/${locale}/tests/disc-behavioral-style-test`);
    await page.locator("#take-test [data-explore-start]").click();
    await expect(page).toHaveURL(new RegExp(`${entry}/take(?:[?]start=1)?$`));
    await page.locator("#take-test [data-questionnaire-next]").click();
    await expect(page.locator("#take-test").getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");

    const answers = await answerDisc(page, "D");
    await page.waitForURL(url => /\/result\/[0-9a-f-]+$/.test(url.pathname));
    expect(submissions).toEqual([{ answers, locale: zh ? "zh-CN" : "en", client_ref: expect.stringMatching(/^[0-9a-f-]{36}$/) }]);
    const result = [...attempts.values()][0];
    expect(result.result.type_code).toBe("single-d");
    await expect(page.getByTestId("mainstream-paid-result")).toBeVisible({ timeout: 30000 });
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

    const guide = `${entry}/results/${result.result.type_code}`;
    await page.goto(guide);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.profiles.find(profile => profile.id === "single-d")!.title[locale]);
    await expect(page.locator('link[rel="alternate"][hreflang="zh-CN"]')).toHaveAttribute("href", "https://fermatmind.com/zh/tests/explore/disc/results/single-d");
  });

  test(`@release DISC ${locale}: back/edit stays local; reload and language change start fresh`, async ({ page }) => {
    const { submissions } = await mockDiscResults(page, false);
    await page.goto(`${entry}/take`);
    const first = page.locator(`input[name="${quiz.questions[0].id}"]`);
    const second = page.locator(`input[name="${quiz.questions[1].id}"]`).first();
    await first.nth(1).click();
    await expect(second).toBeVisible();
    await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click();
    await expect(first.nth(1)).toBeChecked();
    await first.first().click();
    await expect(second).toBeVisible();
    await page.reload();
    await expect(first.first()).toBeVisible();
    await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);
    await page.goto(`/${zh ? "en" : "zh"}/tests/explore/disc/take`);
    await expect(first.first()).toBeVisible();
    await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:disc"))).toBeNull();
    expect(submissions).toEqual([]);
  });

  test(`@release DISC ${locale}: retry a failed tie save without changing the answers or reference`, async ({ page }) => {
    const { submissions, attempts } = await mockDiscResults(page, true);
    await page.goto(`${entry}/take`);
    const answers = await answerDisc(page, "all-A");
    await expect(page.locator("#take-test").getByRole("status")).toContainText(zh ? "暂时无法保存" : "Saving failed");
    expect(submissions).toHaveLength(1);
    await page.getByRole("button", { name: zh ? "查看基础结果" : "See basic result", exact: true }).click();
    await page.waitForURL(url => /\/result\/[0-9a-f-]+$/.test(url.pathname));
    expect(submissions).toHaveLength(2);
    expect(submissions[1]).toEqual(submissions[0]);
    expect(submissions[1].answers).toEqual(answers);
    expect([...attempts.values()][0].result.scores_pct).toEqual({ D: 6, I: 6, S: 6, C: 6 });
    await expect(page.getByTestId("mainstream-paid-result")).toBeVisible({ timeout: 30000 });
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
  await page.goto(`/${locale}/tests/explore/disc`); await expect(page).toHaveTitle(locale === "en" ? "Free DISC Assessment: 24 Questions & Four Style Scores | FermatMind" : `${quiz.seoTitle[locale]} | FermatMind`);
  for (const ref of quiz.references!.filter(ref => !["jobcannon.io", "idrlabs.com"].includes(new URL(ref.url).hostname.replace(/^www\./, "")))) await expect(page.locator(`main a[href="${ref.url}"]`)).toHaveCount(1);
  for (const profile of quiz.profiles) {
    const path = `/${locale}/tests/explore/disc/results/${profile.id}`; await page.goto(path);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${path}`);
    for (const text of profile.sections.find(s => s.id === "thai-four-animals-labels")!.paragraphs) await expect(page.locator("#report-thai-four-animals-labels")).toContainText(text[locale]);
    if (profile.id === "tied-d-i-s-c") { await page.setViewportSize({ width: 390, height: 844 }); await page.locator("#report-thai-four-animals-labels").scrollIntoViewIfNeeded(); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); await page.screenshot({ path: test.info().outputPath(`${locale}-animals.png`) }); }
  }
});
