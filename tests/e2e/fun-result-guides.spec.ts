import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { FunQuiz } from "../../lib/entertainment/types";
import { resultSlug } from "../../lib/entertainment/guides";

for (const locale of ["en", "zh"] as const) for (const slug of ["woodland-animal", "house-of-doors", "relationship-values"]) {
  test(`@release public guide ${locale}/${slug}: full asset, rules, peer, quiz and result return`, async ({ page }) => {
    const quiz = JSON.parse(readFileSync(path.join(process.cwd(), "lib/entertainment/data", `${slug}.json`), "utf8")) as FunQuiz;
    const result = quiz.results[0], zh = locale === "zh";
    await page.setViewportSize({ width: 390, height: 844 });
    const route = `/${locale}/tests/play/${slug}/results/${resultSlug(result.id)}`;
    const response = await page.goto(route); expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(result.title[locale]);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${route}`);
    await expect(page.locator('link[rel="alternate"][hreflang="zh-CN"]')).toHaveAttribute("href", `https://fermatmind.com/zh/tests/play/${slug}/results/${resultSlug(result.id)}`);
    await expect(page.getByRole("main")).toHaveCount(1);
    for (const id of ["meaning", "example", "strength", "tradeoff", "experiment", "comparison", "rules", "faq"]) await expect(page.locator(`#${id}`)).toBeAttached();
    await page.getByText(zh ? "查看公开规则示例" : "Read a public rule example", { exact: true }).click();
    await expect(page.locator("#rules details")).toHaveAttribute("open", "");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const peer = quiz.results[1];
    await page.locator("#all-portraits").locator("..").getByRole("link", { name: peer.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(peer.title[locale]);
    await page.getByRole("link", { name: zh ? "免费体验本测试" : "Try this quiz for free", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start quiz", exact: true }).click();
    for (let step = 0; step < 30; step++) {
      await page.getByRole("radio").first().check();
      const end = page.getByRole("button", { name: zh ? "查看完整结果" : "See full result", exact: true });
      if (await end.count()) { await end.click(); break; }
      await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    }
    await expect(page.getByRole("heading", { name: zh ? "完整结果已呈现，下一步由你选择" : "That is your complete result. What next?" })).toBeVisible();
    await page.getByRole("link", { name: zh ? `阅读「${result.title.zh}」公开指南` : `Read the public guide to ${result.title.en}`, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/results/${resultSlug(result.id)}$`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(result.title[locale]);
  });
}

test("@release public guide unknown identity is a real404 and has no private answer route", async ({ request }) => {
  for (const path of ["/en/tests/play/woodland-animal/results/not-a-portrait", "/zh/tests/play/no-such-quiz/results/jay", "/en/tests/play/relationship-values/results/romantic_expression"]) expect((await request.get(path)).status()).toBe(404);
  for (const query of ["locale=xx", "portrait=not-a-portrait"]) expect((await request.get(`/og/fun/woodland-animal?${query}`)).status()).toBe(404);
});

test("@release content sharing images render bilingual quiz and portrait PNGs with local fonts", async ({ request }, testInfo) => {
  for (const locale of ["en", "zh"]) for (const [slug, portrait] of [["woodland-animal", ""], ["relationship-values", "romantic-expression"], ["house-of-doors", "workshop"]]) {
    const response = await request.get(`/og/fun/${slug}?locale=${locale}${portrait ? `&portrait=${portrait}` : ""}`);
    expect(response.status()).toBe(200); expect(response.headers()["content-type"]).toContain("image/png");
    const png = await response.body(); expect(png.readUInt32BE(16)).toBe(1200); expect(png.readUInt32BE(20)).toBe(630);
    if (locale === "zh" && portrait) await testInfo.attach(`${slug}-${locale}`, { body: png, contentType: "image/png" });
  }
});
