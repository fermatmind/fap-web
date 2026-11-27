import { expectQuestionnaireSessionPrivacy } from "./helpers/questionnaire-session-privacy";
import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/work-role-reflection.json", "utf8")) as Questionnaire;
const states = ["guided", "owned", "supported", "na"] as const;
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied", updatedAt: new Date().toISOString() })));
});
async function finish(page: Page, locale: "en" | "zh", unassessed = false) {
  for (const [index, question] of quiz.questions.entries()) {
    const radio = page.locator(`input[name="${question.id}"][value="${unassessed ? "na" : states[index % 4]}"]`);
    if (index < 11) await expect(page.locator("[data-work-role-result]")).toHaveCount(0);
    if (index === 0) await radio.press("Space");
    else await radio.click();
    await expect(radio).toHaveCount(0);
  }
  await expect(page.locator("[data-work-role-part]")).toHaveCount(3);
  await expect(page.locator("[data-work-role-row]")).toHaveCount(12);
  await expect(page.locator("[data-work-role-result] h4")).toHaveCount(21);
  for (const part of quiz.directions) for (const state of states) await expect(page.locator(`[data-work-role-count="${part.id}-${state}"]`)).toHaveText(String(unassessed ? (state === "na" ? 4 : 0) : 1));
  for (const profile of quiz.profiles) for (const section of profile.sections) for (const paragraph of section.paragraphs) await expect(page.locator("[data-work-role-result]")).toContainText(paragraph[locale]);
  expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:work-role-reflection"))).toBeNull();
  expect(new URL(page.url()).search).toBe("");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/${quiz.slug}`;
  test(`@release work-role-reflection ${locale}: mobile mixed records, all guides, retake and unassessed without private share`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const leaks: string[] = [], errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("request", request => { if (/WRC_\d|"answers"\s*:|[?&](?:score|counts)=/.test((request.postData() ?? "") + new URL(request.url()).search)) leaks.push(request.url()); });
    await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw Error("synthetic clipboard denial"); } } }));
    await page.goto(`/${locale}/tests`);
    await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.locator('[aria-labelledby="questionnaire-method"]')).toContainText(quiz.instructions![locale]);
    for (const profile of quiz.profiles) await expect(page.locator('[aria-labelledby="questionnaire-results"]').getByRole("link", { name: profile.title[locale], exact: true })).toHaveAttribute("href", `${entry}/results/${profile.id}`);
    await page.locator("[data-explore-start]:visible").first().click();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    await finish(page, locale);
    await page.getByRole("button", { name: zh ? "复制公开入口" : "Copy public entry", exact: true }).click();
    const share = await page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue();
    expect(share).toContain(`https://fermatmind.com${entry}`);
    expect(share).not.toMatch(/WRC_|answers|counts|[?&]score|stateId/);
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click();
    await finish(page, locale, true);
    expect(leaks).toEqual([]); expect(errors).toEqual([]);
  });

  test(`@release work-role-reflection ${locale}: edit in memory, then clear answers on reload, language change or exit`, async ({ page }) => {
    await expectQuestionnaireSessionPrivacy(page, locale, quiz);
  });
}

test("@release work-role-reflection: eight public pages, full text, canonical pairs and answer-free OG", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) for (const profile of [null, ...quiz.profiles]) {
    const path = `/${locale}/tests/explore/${quiz.slug}${profile ? `/results/${profile.id}` : ""}`;
    expect((await page.goto(path))?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText((profile?.title ?? quiz.title)[locale]);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${path}`);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
    if (profile) for (const section of profile.sections) for (const paragraph of section.paragraphs) await expect(page.locator(`#report-${section.id}`)).toContainText(paragraph[locale]);
    await expect(page.locator("[data-work-role-row]")).toHaveCount(0);
    const og = `/og/fun/${quiz.slug}?locale=${locale}${profile ? `&portrait=${profile.id}` : ""}`;
    const response = await request.get(og); expect(response.status()).toBe(200);
    const bytes = await response.body(); expect(response.headers()["content-type"]).toContain("image/png");
    expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
    expect(await (await request.get(og + "&answers=SYNTHETIC_PRIVATE&counts=4")).body()).toEqual(bytes);
  }
  for (const path of [`/en/tests/explore/${quiz.slug}/results/expert`, `/zh/tests/explore/${quiz.slug}/results/overall`, `/og/fun/${quiz.slug}?locale=fr`, `/og/fun/${quiz.slug}?portrait=beginner`]) expect((await request.get(path)).status()).toBe(404);
});
