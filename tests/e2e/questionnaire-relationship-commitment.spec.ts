import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire, QuestionnaireAnswers } from "../../lib/questionnaires/types";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/relationship-commitment.json", "utf8")) as Questionnaire;
const reference = JSON.parse(readFileSync("tests/fixtures/questionnaires/relationship-commitment-reference.json", "utf8")) as { worked_examples: { id: string; responses: number[]; expected_sum: number; expected_mean_one_decimal: string }[] };
const reverseIds = new Set(["RC_06", "RC_09", "RC_11", "RC_12", "RC_17", "RC_18", "RC_19", "RC_20"]);
const groups: Record<string, string[]> = { "continuing-intention": ["RC_01", "RC_05", "RC_09", "RC_13", "RC_17", "RC_21"], "current-satisfaction": ["RC_02", "RC_06", "RC_10", "RC_14", "RC_18", "RC_22"], "outside-options": ["RC_03", "RC_07", "RC_11", "RC_15", "RC_19", "RC_23"], "relationship-linked-investment": ["RC_04", "RC_08", "RC_12", "RC_16", "RC_20", "RC_24"] };
const answersFor = (value: "neutral" | "minimum" | "maximum" | "na"): QuestionnaireAnswers => Object.fromEntries(Object.values(groups).flat().map(id => [id, value === "na" ? "na" : value === "neutral" ? "3" : String(value === "minimum" ? (reverseIds.has(id) ? 5 : 1) : (reverseIds.has(id) ? 1 : 5))]));
test.beforeEach(async ({ page }) => { const cdp = await page.context().newCDPSession(page); await cdp.send("Network.enable"); await cdp.send("Network.setBlockedURLs", { urls: ["*/api/v0.5/seo/attribution/events*", "*/api/track*", "*googletagmanager.com/*", "*google-analytics.com/*", "*hm.baidu.com/*"] }); });
async function contextVisible(page: Page) {
  await expect.poll(() => page.locator("#take-test h2").evaluate(el => { const header = document.querySelector("header")?.getBoundingClientRect().bottom ?? 0, progress = el.previousElementSibling?.tagName === "PROGRESS" ? el.previousElementSibling : null, label = progress?.previousElementSibling; return el.getBoundingClientRect().top >= header && (!progress || (progress.getBoundingClientRect().top >= header && !!label && label.getBoundingClientRect().top >= header)); })).toBe(true);
}
async function start(page: Page, locale: "en" | "zh") { await page.getByRole("button", { name: locale === "zh" ? "开始测试" : "Start test", exact: true }).click(); await contextVisible(page); }
async function full(page: Page, locale: "en" | "zh", answers: QuestionnaireAnswers) {
  const zh = locale === "zh";
  for (const [i, q] of quiz.questions.entries()) {
    if (i > 0) await contextVisible(page);
    const option = page.locator(`input[name="${q.id}"][value="${answers[q.id]}"]`);
    if (i === 0) { await option.focus(); await page.keyboard.press("Space"); await expect(option).toBeChecked(); } else await option.check();
    await expect(page.locator("[data-commitment-overview]")).toHaveCount(0);
    await page.getByRole("button", { name: i === 23 ? (zh ? "查看完整结果" : "See full result") : (zh ? "下一题" : "Next"), exact: true }).click();
  }
  await expect(page.getByRole("heading", { level: 2, name: quiz.resultHeading![locale], exact: true })).toBeFocused(); await contextVisible(page);
  await expect(page.getByRole("region", { name: zh ? "四部分分别读数" : "Four separate relationship readings", exact: true })).toBeVisible();
  for (const [direction, ids] of Object.entries(groups)) {
    const values = ids.filter(id => answers[id] !== "na").map(id => reverseIds.has(id) ? 6 - Number(answers[id]) : Number(answers[id])); const sum = values.reduce((a, b) => a + b, 0), complete = values.length === 6;
    const card = page.locator(`[data-commitment-summary='${direction}']`); await expect(card.locator("[data-commitment-mean]")).toHaveText(complete ? `${(sum / 6).toFixed(1)} / 5` : (zh ? "资料不足" : "Insufficient information"));
    await expect(card.locator("[data-commitment-sum]")).toHaveText(`${zh ? "键向调整后总数（6—30）" : "Key-adjusted sum (6–30)"}: ${complete ? sum : (zh ? "资料不足" : "Insufficient information")}`); await expect(card.locator("[data-commitment-rated]")).toContainText(`${values.length} / 6`);
  }
  for (const profile of quiz.profiles) { const guide = page.locator(`[data-commitment-guide='${profile.id}']`); await expect(guide.locator("h3")).toHaveText(profile.title[locale]); for (const section of profile.sections) for (const text of section.paragraphs) await expect(guide.locator(`#report-${profile.id}-${section.id}`)).toContainText(text[locale]); }
  const ids = await page.locator("#take-test [id]").evaluateAll(ns => ns.map(n => n.id)); expect(new Set(ids).size).toBe(ids.length); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/relationship-commitment`;
  test(`@release Commitment ${locale}: hub, keyboard,24neutral/24minimum,4fullguides,retake/publicreturn`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); const privatePosts: string[] = []; page.on("request", r => { if (r.method() === "POST" && /RC_\d{2}/.test(r.postData() ?? "")) privatePosts.push(r.url()); });
    await page.goto(`/${locale}/tests`); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click(); await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]); await expect(page.locator("#take-test a[href*='mbti']")).toHaveCount(0); await start(page, locale);
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option"); await full(page, locale, answersFor("neutral"));
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click(); await full(page, locale, answersFor("minimum"));
    await page.locator("[data-commitment-guide='continuing-intention']").getByRole("link").click(); await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.profiles[0].title[locale]); await expect(page.locator("[data-commitment-overview]")).toHaveCount(0);
    await page.getByRole("link", { name: zh ? "免费开始完整测试" : "Start the full test for free", exact: true }).click(); await expect(page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true })).toBeEnabled(); expect(privatePosts).toEqual([]); expect(new URL(page.url()).search).toBe("");
  });
  test(`@release Commitment ${locale}: optin24h draft,refresh,language/back/edit/exitclear`, async ({ page }) => {
    await page.goto(entry); await start(page, locale); await page.locator('input[name="RC_01"][value="4"]').check(); await page.getByRole("checkbox").check(); await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await page.reload(); await page.getByRole("button", { name: zh ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click(); await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[name="RC_01"][value="4"]')).toBeChecked(); await page.locator('input[name="RC_01"][value="1"]').check();
    const other = zh ? "en" : "zh"; await page.goto(`/${other}/tests/explore/relationship-commitment`); await page.getByRole("button", { name: other === "zh" ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click(); await page.getByRole("button", { name: other === "zh" ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[name="RC_01"][value="1"]')).toBeChecked(); await page.getByRole("button", { name: other === "zh" ? "退出并清除本次进度" : "Exit and clear this attempt", exact: true }).click(); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:relationship-commitment"))).toBeNull();
  });
  test(`@release Commitment ${locale}: deniedstorage/clipboard,24maximum/allNA,all4fulltexts andprivate-safe sharing`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); await page.addInitScript(() => { const get = Storage.prototype.getItem, set = Storage.prototype.setItem; Storage.prototype.getItem = function(k) { if (k.startsWith("fm_questionnaire_draft:")) throw Error("synthetic storage denial"); return get.call(this, k); }; Storage.prototype.setItem = function(k, v) { if (k.startsWith("fm_questionnaire_draft:")) throw Error("synthetic storage denial"); return set.call(this, k, v); }; Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw Error("synthetic clipboard denial"); } } }); });
    await page.goto(entry); await start(page, locale); await page.getByRole("checkbox").check(); await expect(page.getByRole("status")).toContainText(zh ? "无法保存" : "could not save"); await full(page, locale, answersFor("maximum")); await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click(); await full(page, locale, answersFor("na"));
    await expect(page.getByRole("heading", { name: zh ? "本次作答已结束，下一步由你选择" : "This attempt is finished. Choose what comes next.", exact: true })).toBeVisible();
    await page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click(); const text = await page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue(); expect(text).not.toMatch(/RC_\d{2}|answers|submission|form_code|[?&]score|\d\s*\/\s*5/); const url = new URL(text.split("\n").at(-1)!); expect(url.pathname).toBe(entry); expect(url.search).toBe(""); expect(url.hash).toBe("");
  });
  test(`@release Commitment ${locale}: all4writtenexamples coexist and oneNA withholds only itsownpart`, async ({ page }) => {
    const answers = answersFor("neutral"); for (const row of reference.worked_examples) groups[row.id].forEach((id, i) => { answers[id] = String(row.responses[i]); });
    await page.goto(entry); await start(page, locale); await full(page, locale, answers); for (const row of reference.worked_examples) await expect(page.locator(`[data-commitment-summary='${row.id}'] [data-commitment-mean]`)).toHaveText(`${row.expected_mean_one_decimal} / 5`);
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click(); const mixed = answersFor("neutral"); mixed.RC_01 = "na"; await full(page, locale, mixed); await expect(page.locator("[data-commitment-insufficient]")).toHaveCount(1);
  });
}
test("@release Commitment all10native fulltexts, specificENZHmetadata/OG andclosedIDs", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) for (const profile of [null, ...quiz.profiles]) {
    const path = `/${locale}/tests/explore/relationship-commitment${profile ? "/results/" + profile.id : ""}`; expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText((profile?.title ?? quiz.title)[locale]); await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://fermatmind.com" + path);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", (profile?.seo?.description ?? quiz.description)[locale]); await expect(page.locator('link[rel="alternate"][hreflang="zh-CN"]')).toHaveAttribute("href", `https://fermatmind.com/zh${path.slice(3)}`);
    if (profile) for (const section of profile.sections) for (const text of section.paragraphs) await expect(page.locator(`#report-${section.id}`)).toContainText(text[locale]);
    const image = await request.get(`/og/fun/relationship-commitment?locale=${locale}&v=${quiz.version}${profile ? "&portrait=" + profile.id : ""}`); expect(image.status()).toBe(200); expect(image.headers()["content-type"]).toContain("image/png"); const data = await image.body(); expect(data.readUInt32BE(16)).toBe(1200); expect(data.readUInt32BE(20)).toBe(630);
  }
  for (const path of ["/en/tests/explore/relationship-commitment/results/fragile", "/zh/tests/explore/relationship-commitment/results/all-in", "/og/fun/relationship-commitment?portrait=RC_01"]) expect((await request.get(path)).status()).toBe(404);
});
