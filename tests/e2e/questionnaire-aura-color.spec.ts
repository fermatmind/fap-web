import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import readings from "../../lib/questionnaires/result-content/aura-color.json";
import type { Questionnaire } from "../../lib/questionnaires/types";

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/aura-color.json", "utf8")) as Questionnaire;
const fullSections = (id: string) => quiz.profiles.find(profile => profile.id === id)!.sections.length + readings[id as keyof typeof readings].length;
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("fm_consent_v1", JSON.stringify({
    analytics: "denied", updatedAt: new Date().toISOString(),
  })));
});
async function finish(page: Page, locale: "en" | "zh", mode: "red" | "tie") {
  for (const [index, question] of quiz.questions.entries()) {
    const option = mode === "tie" ? question.options[0] : question.options.find(o => o.directionId === "red") ?? question.options[0];
    const radio = page.locator(`input[name="${question.id}"][value="${option.id}"]`);
    if (index === 1) {
      await page.getByRole("button", { name: locale === "zh" ? "上一题" : "Back", exact: true }).click();
      await expect(page.locator('input[name="AURA_01"]:checked')).toHaveCount(1);
      await page.getByRole("button", { name: locale === "zh" ? "下一题" : "Next", exact: true }).click();
    }
    if (index === 0) { await radio.focus(); await page.keyboard.press("Space"); }
    else await radio.check();
  }
  await expect(page.getByRole("heading", { level: 2, name: quiz.resultHeading![locale], exact: true })).toBeFocused();
  await expect(page.locator("[data-archetype-count]")).toHaveCount(7);
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(node => node.id));
  expect(new Set(ids).size).toBe(ids.length);
  if (mode === "red") {
    await expect(page.locator('[data-archetype-count="red"]')).toContainText("12 / 12");
    await expect(page.locator("[data-archetype-match]")).toHaveCount(1);
    await expect(page.locator('[data-archetype-match="red"] h4')).toHaveCount(fullSections("red"));
  } else {
    for (const theme of quiz.directions) {
      await expect(page.locator(`[data-archetype-count="${theme.id}"]`)).toContainText("3 / 12");
      await expect(page.locator(`[data-archetype-match="${theme.id}"] h4`)).toHaveCount(fullSections(theme.id));
    }
    await expect(page.locator("[data-archetype-match]")).toHaveCount(7);
  }
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/aura-color`;
  for (const device of ["mobile", "desktop"] as const) test(`@release Aura color symbolic expression ${locale} ${device}: hub, keyboard,21realchoices, full unique match and retake`, async ({ page, context }) => {
    await page.setViewportSize(device === "mobile" ? { width: 390, height: 844 } : { width: 1440, height: 900 });
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const posts: string[] = [];
    page.on("request", request => { if (request.method() === "POST" && (new URL(request.url()).pathname === "/api/track" || /AURA_[0-9]{2}/.test(request.postData() ?? ""))) posts.push(request.url()); });
    await page.goto(`/${locale}/tests`); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page).toHaveTitle(`${quiz.seoTitle[locale]} | FermatMind`);
    await page.getByRole("link", { name: zh ? "浏览七种光环颜色的含义" : "Browse all seven aura color meanings" }).click();
    await expect(page.getByRole("link", { name: zh ? "蓝色光环在这份测试里代表什么？" : "What does a blue aura mean in this quiz?" })).toHaveAttribute("href", `${entry}/results/blue`);
    await page.getByRole("link", { name: zh ? "先看结果示例" : "See sample results" }).click();
    const samples = page.locator("#aura-examples article");
    await expect(samples).toHaveCount(2);
    await expect(samples.nth(0).locator("a")).toHaveAttribute("href", `${entry}/results/blue`);
    await expect(samples.nth(1).locator("a").nth(0)).toHaveAttribute("href", `${entry}/results/yellow`);
    await expect(samples.nth(1).locator("a").nth(1)).toHaveAttribute("href", `${entry}/results/green`);
    await samples.nth(1).locator("summary").click();
    await expect(samples.nth(1).locator("dd")).toHaveText(["4 / 12", "2 / 12", "5 / 12", "5 / 12", "1 / 12", "2 / 12", "2 / 12"]);
    await samples.nth(0).getByRole("link").click();
    await expect(page.locator('[data-quiz-artwork="blue"]')).toBeVisible();
    await page.getByRole("navigation", { name: zh ? "面包屑" : "Breadcrumb" }).getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${entry}$`));
    await expect(page.getByText(zh ? "原创象征测验 · 完整结果免费" : "Original symbolic quiz · Full results free", { exact: true })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await expect(page.getByRole("link", { name: zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions" })).toHaveCount(0);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    await finish(page, locale, "red");
    const preview = page.getByRole("link", { name: zh ? "预览该颜色的公开分享图（新标签页）" : "Preview this color’s public share card (new tab)" });
    await expect(preview).toHaveAttribute("href", `/og/fun/aura-color?locale=${locale}&portrait=red&v=1.0.0-art`);
    await expect(preview).toHaveAttribute("target", "_blank");
    await page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      `${quiz.title[locale]}\n${quiz.profiles[0].title[locale]}\nhttps://fermatmind.com${entry}/results/red`,
    );
    await expect(page.getByRole("link", { name: zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions" })).toHaveAttribute("href", /target_action=questionnaire_result_mbti/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click();
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0); await expect(page.getByRole("radio").first()).not.toBeChecked();
    expect(posts).toEqual([]);
  });
  test(`@release Aura color symbolic expression ${locale}: reload starts a new private attempt`, async ({ page }) => {
    await page.goto(entry);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.locator('input[name="AURA_01"][value="B"]').check();
    await expect(page.locator('input[name="AURA_02"]')).toHaveCount(4);
    await expect(page.getByRole("checkbox")).toHaveCount(0);
    await page.reload();
    await expect(page.locator('input[name="AURA_01"]')).toHaveCount(4);
    await expect(page.locator('input[name="AURA_01"]:checked')).toHaveCount(0);
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:aura-color"))).toBeNull();
  });
  for (const device of ["mobile", "desktop"] as const) test(`@release Aura color symbolic expression ${locale} ${device}: seven-way tie and private-safe clipboard fallback`, async ({ page }) => {
    await page.setViewportSize(device === "mobile" ? { width: 390, height: 844 } : { width: 1440, height: 900 });
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } });
    });
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await finish(page, locale, "tie");
    await page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click();
    const text = await page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue();
    for (const profile of quiz.profiles) expect(text).toContain(profile.title[locale]);
    expect(text).not.toMatch(/AURA_[0-9]{2}|answers|form_code|submission|3\s*\/\s*12|[?&]score/);
    const url = new URL(text.split("\n").at(-1)!); expect(url.pathname).toBe(entry); expect(url.search).toBe(""); expect(url.hash).toBe("");
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click();
    await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0);
  });
}

test("@release Aura color symbolic expression all14public full guides, bilingual images and closed identities", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) for (const profile of quiz.profiles) {
    const path = `/${locale}/tests/explore/aura-color/results/${profile.id}`;
    expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
    for (const section of profile.sections) await expect(page.locator(`#report-${section.id} h2`)).toHaveText(section.title[locale]);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/aura-color/results/${profile.id}`);
    await expect(page.getByRole("link", { name: locale === "zh" ? "免费开始完整测试" : "Start the full test for free", exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/aura-color#take-test`);
    await expect(page.locator(`[data-quiz-artwork="${profile.id}"]`)).toBeVisible();
    const shareImage = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect(shareImage).toContain(`portrait=${profile.id}&v=1.0.0-art`);
    const image = await request.get(new URL(shareImage!).pathname + new URL(shareImage!).search); expect(image.status()).toBe(200);
    const bytes = await image.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
  }
  for (const path of ["/en/tests/explore/aura-color/results/unknown", "/zh/tests/explore/aura-color/results/AURA_01", "/en/tests/play/aura-color"]) expect((await request.get(path)).status()).toBe(404);
});
