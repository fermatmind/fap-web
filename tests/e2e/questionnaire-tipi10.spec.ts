import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/tipi-10.json", "utf8")) as Questionnaire;
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied", updatedAt: new Date().toISOString() })));
});
async function finish(page: Page, zh: boolean, keyed: 4 | 7) {
  for (const [i, q] of quiz.questions.entries()) {
    const value = String(q.reverse ? 8 - keyed : keyed);
    if (i === 0) { const first = page.getByRole("radio").first(); await first.focus(); await first.press("Space"); await first.press("ArrowDown"); await expect(page.getByRole("radio").nth(1)).toBeChecked(); }
    await page.locator(`input[name="${q.id}"][value="${value}"]`).check();
    await expect(page.locator("[data-tipi10-result]")).toHaveCount(0);
    await page.getByRole("button", { name: i === 9 ? (zh ? "查看完整结果" : "See full result") : (zh ? "下一题" : "Next"), exact: true }).click();
  }
  await expect(page.locator("[data-tipi10-mean]")).toHaveCount(5);
  await expect(page.locator("[data-tipi10-item]")).toHaveCount(10);
  await expect(page.locator("[data-tipi10-result] h4")).toHaveCount(40);
  for (const mean of await page.locator("[data-tipi10-mean]").all()) await expect(mean).toContainText(`${keyed}.00 / 7`);
  for (const p of quiz.profiles) for (const s of p.sections) for (const text of s.paragraphs) await expect(page.locator("[data-tipi10-result]")).toContainText(text[zh ? "zh" : "en"]);
  expect(new URL(page.url()).search).toBe("");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:tipi-10"))).toBeNull();
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/${quiz.slug}`;
  test(`@release tipi-10 ${locale}: mobile source answers, five full guides, original values, retake and public share`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const leaks: string[] = [];
    page.on("request", r => { if (/tipi-0[1-9]|answers|tipi10.*mean/.test((r.postData() ?? "") + new URL(r.url()).search)) leaks.push(r.url()); });
    await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw Error("synthetic clipboard denial"); } } }));
    await page.goto(`/${locale}/tests`);
    await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await expect(page.getByText(zh ? "总体上，我认为自己：请评价这对特质整体符合的程度，即使其中一项更符合。" : "I see myself as: rate the pair overall, even if one trait applies more strongly than the other.", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    await finish(page, zh, 7);
    await page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click();
    const share = await page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue();
    expect(share).toBe(`${quiz.title[locale]}\nhttps://fermatmind.com${entry}`);
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click();
    await finish(page, zh, 4);
    await expect(page.locator("[data-tipi10-next-steps] a").first()).toHaveAttribute("href", `/${locale}/tests/big-five-personality-test-ocean-model`);
    expect(leaks).toEqual([]);
  });
  test(`@release tipi-10 ${locale}: opt-in draft reload, back edit and exit clearing`, async ({ page }) => {
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.locator('input[name="tipi-01"][value="2"]').check(); await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await page.reload();
    await page.getByRole("button", { name: zh ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click();
    await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click();
    await expect(page.locator('input[value="2"]')).toBeChecked(); await page.locator('input[value="6"]').check();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click();
    await expect(page.locator('input[value="6"]')).toBeChecked();
    await page.getByRole("button", { name: zh ? "退出并清除本次进度" : "Exit and clear this attempt", exact: true }).click();
    await expect(page.locator("[data-tipi10-result]")).toHaveCount(0); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:tipi-10"))).toBeNull();
  });
}
test("@release tipi-10: all12 native pages, full bodies, canonical pairs, private-free OG and invalid identities", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) for (const profile of [null, ...quiz.profiles]) {
    const path = `/${locale}/tests/explore/${quiz.slug}${profile ? `/results/${profile.id}` : ""}`;
    expect((await page.goto(path))?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText((profile?.title ?? quiz.title)[locale]);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${path}`);
    for (const [lang, l] of [["en", "en"], ["zh-CN", "zh"], ["x-default", "en"]]) await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveAttribute("href", `https://fermatmind.com/${l}/tests/explore/${quiz.slug}${profile ? `/results/${profile.id}` : ""}`);
    if (profile) for (const s of profile.sections) for (const paragraph of s.paragraphs) await expect(page.locator(`#report-${s.id}`)).toContainText(paragraph[locale]);
    await expect(page.locator("[data-tipi10-mean]")).toHaveCount(0);
    const og = `/og/fun/${quiz.slug}?locale=${locale}${profile ? `&portrait=${profile.id}` : ""}`;
    const response = await request.get(og); expect(response.status()).toBe(200);
    const bytes = await response.body(); expect(response.headers()["content-type"]).toContain("image/png"); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
    expect(await (await request.get(og + "&answers=SYNTHETIC_PRIVATE&score=5")).body()).toEqual(bytes);
  }
  for (const path of [`/en/tests/explore/${quiz.slug}/results/neuroticism`, `/zh/tests/explore/${quiz.slug}/results/overall`, `/og/fun/${quiz.slug}?locale=fr`, `/og/fun/${quiz.slug}?portrait=compatibility`]) expect((await request.get(path)).status()).toBe(404);
});
