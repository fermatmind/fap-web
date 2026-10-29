import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/work-activity-interests.json", "utf8")) as Questionnaire;
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied", updatedAt: new Date().toISOString() })));
});
async function finish(page: Page, zh: boolean, missing: boolean) {
  for (const [i, q] of quiz.questions.entries()) {
    const round = Math.floor(i / 6), value = missing || round >= 8 ? "na" : String([1, 2, 3, 3, 4, 4, 5, 5][round]);
    await page.locator(`input[name="${q.id}"][value="${value}"]`).check();
    if (i < 59) await expect(page.locator("[data-work-activity-part]")).toHaveCount(0);
    await page.getByRole("button", { name: i === 59 ? (zh ? "查看完整结果" : "See full result") : (zh ? "下一题" : "Next"), exact: true }).click();
  }
  await expect(page.locator("[data-work-activity-part]")).toHaveCount(6);
  await expect(page.locator("[data-work-activity-report] h4")).toHaveCount(42);
  for (const p of quiz.profiles) {
    const part = page.locator(`[data-work-activity-part="${p.directionIds[0]}"]`);
    await expect(part.locator("[data-work-activity-mean]")).toContainText(missing ? (zh ? "资料不足" : "Insufficient information") : "3.4 / 5");
    for (const s of p.sections) for (const text of s.paragraphs) await expect(part).toContainText(text[zh ? "zh" : "en"]);
  }
  expect(new URL(page.url()).search).toBe("");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:work-activity-interests"))).toBeNull();
}

for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/${quiz.slug}`;
  test(`@release work-activity-interests ${locale}: mobile actual ratings, six full readings, retake, unscored and public-only share`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const leaks: string[] = [];
    page.on("request", r => { if (/WAI_\d|answers.*work-activity-interests|work-activity-interests.*facets/.test((r.postData() ?? "") + new URL(r.url()).search)) leaks.push(r.url()); });
    await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw Error("synthetic clipboard denial"); } } }));
    await page.goto(`/${locale}/tests`);
    await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.locator("[data-work-activity-context] a")).toHaveAttribute("href", `/${locale}/tests/holland-career-interest-test-riasec`);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    await finish(page, zh, false);
    await expect(page.locator("[data-work-activity-report] [data-work-activity-context] a")).toHaveAttribute("href", `/${locale}/tests/holland-career-interest-test-riasec`);
    await page.getByRole("button", { name: zh ? "复制公开入口" : "Copy public entry", exact: true }).click();
    const share = await page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue();
    expect(share).toContain(`https://fermatmind.com${entry}`);
    expect(share).not.toMatch(/WAI_|3\.4|answers|[?&]score|facets/);
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click();
    await finish(page, zh, true);
    expect(leaks).toEqual([]);
  });
  test(`@release work-activity-interests ${locale}: opt-in draft reload, back edit and exit clearing`, async ({ page }) => {
    await page.goto(entry);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.locator('input[name="WAI_01"][value="2"]').check();
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await page.reload();
    await page.getByRole("button", { name: zh ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click();
    await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click();
    await expect(page.locator('input[value="2"]')).toBeChecked();
    await page.locator('input[value="na"]').check();
    await page.getByRole("button", { name: zh ? "退出并清除本次进度" : "Exit and clear this attempt", exact: true }).click();
    await expect(page.locator("[data-work-activity-part]")).toHaveCount(0);
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:work-activity-interests"))).toBeNull();
  });
}

test("@release work-activity-interests: all14 native pages, full bodies, canonical pairs, private-free OG and invalid identities", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) for (const profile of [null, ...quiz.profiles]) {
    const path = `/${locale}/tests/explore/${quiz.slug}${profile ? `/results/${profile.id}` : ""}`;
    expect((await page.goto(path))?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText((profile?.title ?? quiz.title)[locale]);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${path}`);
    for (const [lang, l] of [["en", "en"], ["zh-CN", "zh"], ["x-default", "en"]]) await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveAttribute("href", `https://fermatmind.com/${l}/tests/explore/${quiz.slug}${profile ? `/results/${profile.id}` : ""}`);
    if (profile) for (const s of profile.sections) for (const paragraph of s.paragraphs) await expect(page.locator(`#report-${s.id}`)).toContainText(paragraph[locale]);
    await expect(page.locator("[data-work-activity-mean]")).toHaveCount(0);
    await expect(page.locator("[data-work-activity-context] a")).toHaveAttribute("href", `/${locale}/tests/holland-career-interest-test-riasec`);
    const og = `/og/fun/${quiz.slug}?locale=${locale}${profile ? `&portrait=${profile.id}` : ""}`;
    const response = await request.get(og); expect(response.status()).toBe(200);
    const bytes = await response.body(); expect(response.headers()["content-type"]).toContain("image/png"); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
    expect(await (await request.get(og + "&answers=SYNTHETIC_PRIVATE&score=5")).body()).toEqual(bytes);
  }
  for (const path of [`/en/tests/explore/${quiz.slug}/results/official-score`, `/zh/tests/explore/${quiz.slug}/results/overall`, `/og/fun/${quiz.slug}?locale=fr`, `/og/fun/${quiz.slug}?portrait=compatibility`]) expect((await request.get(path)).status()).toBe(404);
});
