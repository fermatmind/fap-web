import { seedAnalyticsConsent } from "./helpers/consent";
import { archiveTopic } from "../../lib/entertainment/archive90";
import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { Questionnaire } from "../../lib/questionnaires/types";
import type { FunQuiz } from "../../lib/entertainment/types";
import { resultSlug } from "../../lib/entertainment/guides";

test.beforeEach(async ({ page }) => { await seedAnalyticsConsent(page); });

for (const locale of ["en", "zh"] as const) for (const slug of ["date-plan-detour", "desert-oasis", "desk-reset", "dinner-host", "dragon-housemate", "dream-train", "enchanted-library", "escape-room-role", "fantasy-party-role", "festival-companion", "fictional-cafe", "firefly-evening", "floating-house", "festival-mask", "forest-soundtrack", "friendship-invitation", "game-night-reset", "garden-season", "gift-note", "group-chat-role", "harbor-light", "creative-spark", "cozy-object", "compliment-style", "community-fair", "comfort-offer", "coffee-break", "cloud-drift", "city-wanderer", "choosing-together", "celebration-planner", "celebrating-a-friend", "campfire-storyteller", "camera-roll", "browser-tabs", "borrowed-book", "board-game-table", "birdwatching-companion", "beachcomber", "woodland-animal", "house-of-doors", "relationship-values"]) {
  test(`@release public guide ${locale}/${slug}: full asset, rules, peer, quiz and result return`, async ({ page }) => {
    // This identity now uses the native 24-item paired questionnaire at its
    // canonical explore URL.
    if (slug === "relationship-values") {
      const native = JSON.parse(readFileSync("lib/questionnaires/data/relationship-values.json", "utf8")) as Questionnaire;
      const profile = native.profiles[0], peer = native.profiles[1];
      const entry = `/${locale}/tests/explore/${slug}`, route = `${entry}/results/${profile.id}`;
      await page.setViewportSize({ width: 390, height: 844 });
      expect((await page.goto(route))?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${route}`);
      await expect(page.locator('link[rel="alternate"][hreflang="zh-CN"]')).toHaveAttribute("href", `https://fermatmind.com/zh/tests/explore/${slug}/results/${profile.id}`);
      await expect(page.getByRole("main")).toHaveCount(1);
      for (const section of profile.sections) for (const paragraph of section.paragraphs)
        await expect(page.locator(`#report-${section.id}`)).toContainText(paragraph[locale]);
      await page.locator(`a[href="${entry}/results/${peer.id}"]`).click();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(peer.title[locale]);
      await page.locator(`a[href="${entry}#take-test"]`).last().click();
      await page.locator("#take-test [data-explore-start]").click();
      await expect(page.locator('[data-questionnaire-take] #take-test')).toHaveAttribute("data-stage", "answer", { timeout: 15000 });
      for (const q of native.questions) {
        const option = q.options.find(o => o.directionId === profile.directionIds[0]) ?? q.options[0];
        await page.locator(`#take-test input[name="${q.id}"][value="${option.id}"]`).click();
      }
      await expect(page.getByRole("heading",{level:2,name:profile.title[locale],exact:true})).toBeVisible();
      await page.getByRole("link",{name:locale === "zh" ? "阅读这项结果的公开说明" : "Read the public explanation of this result",exact:true}).click();
      await expect(page).toHaveURL(new RegExp(`/results/${profile.id}$`));
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      return;
    }
    const quiz = JSON.parse(readFileSync(path.join(process.cwd(), "lib/entertainment/data", `${slug}.json`), "utf8")) as FunQuiz;
    const result = quiz.results[0], zh = locale === "zh";
    await page.setViewportSize({ width: 390, height: 844 });
    const route = `/${locale}/tests/explore/${slug}/results/${resultSlug(result.id)}`;
    const response = await page.goto(route); expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(result.title[locale]);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${route}`);
    if (archiveTopic(slug)) {
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /^noindex, follow(?:,|$)/);
      await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
    } else {
      await expect(page.locator('link[rel="alternate"][hreflang="zh-CN"]')).toHaveAttribute("href", `https://fermatmind.com/zh/tests/explore/${slug}/results/${resultSlug(result.id)}`);
    }
    await expect(page.getByRole("main")).toHaveCount(1);
    for (const id of ["meaning", "example", "strength", "tradeoff", "experiment", "comparison", "rules", "faq"]) await expect(page.locator(`#${id}`)).toBeAttached();
    await page.getByText(zh ? "查看公开规则示例" : "Read a public rule example", { exact: true }).click();
    await expect(page.locator("#rules details")).toHaveAttribute("open", "");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const peer = quiz.results[1];
    await page.locator("#all-portraits").locator("..").getByRole("link", { name: peer.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(peer.title[locale]);
    const landing = `/${locale}/tests/explore/${slug}`;
    const tryQuiz = page.getByRole("link", { name: zh ? "免费体验本测试" : "Try this quiz for free", exact: true });
    await expect(tryQuiz).toHaveAttribute("href", `${landing}#play`);
    await Promise.all([
      page.waitForURL(url => url.pathname === landing),
      tryQuiz.click(),
    ]);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start quiz", exact: true }).click();
    for (let step = 0; step < 30; step++) {
      const options = quiz.questions[step].options;
      const option = quiz.mechanism === "tally"
        ? options.findIndex(item => (item.points?.[result.id] ?? 0) > 0)
        : 0;
      const radio = page.locator("#play").getByRole("radio").nth(Math.max(option, 0));
      const question = await radio.getAttribute("name");
      await radio.click();
      await expect(page.locator(`#play input[name="${question}"]`)).toHaveCount(0);
      if (await page.locator("#play").getAttribute("data-stage") === "result") break;
    }
    await expect(page.locator('#play[data-stage="result"] [data-story-result-readings]')).toBeVisible();
    await page.getByRole("link", { name: zh ? `阅读「${result.title.zh}」公开指南` : `Read the public guide to ${result.title.en}`, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/results/${resultSlug(result.id)}$`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(result.title[locale]);
  });
}

test("@release public guide unknown identity is a real404 and has no private answer route", async ({ request }) => {
  for (const path of ["/en/tests/explore/woodland-animal/results/not-a-portrait", "/zh/tests/explore/no-such-quiz/results/jay", "/en/tests/explore/relationship-values/results/romantic_expression"]) expect((await request.get(path)).status()).toBe(404);
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
