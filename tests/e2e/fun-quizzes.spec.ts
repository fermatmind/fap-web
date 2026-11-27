import { seedAnalyticsConsent } from "./helpers/consent";
import { archiveTopic } from "../../lib/entertainment/archive90";
import { test, expect, type Page } from "@playwright/test";
import nativeCatalog from "../../lib/questionnaires/catalog.json";
import catalog from "../../lib/entertainment/catalog.json";
import { wave3aStoryVariant } from "../../lib/entertainment/wave3aStory";
import { archetypeCorePath } from "../../lib/questionnaires/archetypeResultCard";

// Complete native replacements are exercised by their source-specific questionnaire suites.
const samples = ["date-plan-detour", "desert-oasis", "desk-reset", "dinner-host", "dragon-housemate", "creative-spark", "cozy-object", "compliment-style", "community-fair", "coffee-break", "cloud-drift", "city-wanderer", "celebration-planner", "celebrating-a-friend", "campfire-storyteller", "camera-roll", "browser-tabs", "borrowed-book", "birdwatching-companion", "beachcomber", "woodland-animal", "group-chat-role", "fantasy-party-role", "festival-companion", "lost-letter-adventure", "portal-choice", "spell-school-elective", "island-day", "snow-day", "response-color", "dream-train", "enchanted-library", "board-game-table", "escape-room-role", "photo-group-role", "game-night-reset", "garden-season", "gift-note", "comfort-offer", "relationship-values", "choosing-together", "note-taking-doodles", "fictional-cafe", "firefly-evening", "floating-house", "festival-mask", "forest-soundtrack", "friendship-invitation", "house-of-doors", "harbor-light", "pocket-map", "story-ending"].filter(slug => !nativeCatalog.some(native => native.slug === slug));
async function finish(page: Page) {
  const engine = page.locator("#play");
  for (let step = 0; step < 30; step++) {
    const option = engine.getByRole("radio").first();
    const question = await option.getAttribute("name");
    await option.click();
    await expect(engine.locator(`input[name="${question}"]`)).toHaveCount(0);
    if (await engine.getAttribute("data-stage") === "result") return;
  }
  throw new Error("Quiz did not terminate");
}

for (const locale of ["en", "zh"] as const) for (const slug of samples) {
  test(`@release fun quiz ${locale}/${slug}: entry, all answers, complete result, retake`, async ({ page }) => {
    await seedAnalyticsConsent(page);
    await page.setViewportSize({ width: 390, height: 844 });
    const card = catalog.find(item => item.slug === slug)!;
    const zh = locale === "zh";
    await page.goto(`/${locale}/tests/explore/${slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(card.title[locale]);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com/${locale}/tests/explore/${slug}`);
    if (archiveTopic(slug)) {
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /^noindex, follow(?:,|$)/);
      await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
    } else {
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/${slug}`);
      await expect(page.locator('link[rel="alternate"][hreflang="zh-CN"]')).toHaveAttribute("href", `https://fermatmind.com/zh/tests/explore/${slug}`);
    }
    await expect(page.locator("html")).toHaveAttribute("lang", locale === "zh" ? /zh/ : "en");
    await expect(page.getByRole("link", { name: zh ? "了解 MBTI 与题本选择" : "Explore MBTI and its versions" })).toHaveCount(0);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start quiz", exact: true }).click();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await expect(page.getByRole("status").filter({ hasText: zh ? "请先选择" : "Choose an option" })).toBeVisible();
    await finish(page);
    const result = page.locator('#play[data-stage="result"]');
    const reading = result.locator("[data-story-result-readings] > article").first();
    await expect(reading).toBeVisible();
    await expect(reading.locator("h3, h4").filter({ hasText: zh ? "也可以留意" : "Something to keep in mind" })).toBeVisible();
    const honor = wave3aStoryVariant(slug);
    if (!honor) throw new Error(`Missing result card for ${slug}`);
    await expect(result.locator("[data-archetype-honor-card]")).toBeVisible();
    const recommendation = result.locator(`[data-archetype-core-assessment="${honor.target}"] a`);
    await expect(recommendation).toHaveAttribute("href", archetypeCorePath(locale, honor.target));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const url = new URL(page.url()); expect(url.search).toBe(""); expect(url.hash).toBe("");
    expect(await page.evaluate(key => sessionStorage.getItem(key), `fm_fun_draft:${slug}`)).toBeNull();
    if (slug === "woodland-animal" && locale === "en") {
      await page.screenshot({ path: process.env.FUN_QA_OUTPUT ? `${process.env.FUN_QA_OUTPUT}/woodland-result-mobile.png` : test.info().outputPath("result-mobile.png"), fullPage: true });
      await recommendation.click();
      await expect(page).toHaveURL(/\/en\/tests\/big-five-personality-test-ocean-model$/);
      return;
    }
    const retake = zh ? "再测一次" : "Retake";
    await page.getByRole("button", { name: retake, exact: true }).click();
    await expect(page.getByRole("radio").first()).not.toBeChecked();
    await expect(page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true })).toBeDisabled();
  });
}

test("@release standalone story supports keyboard and back/edit, then starts fresh on reload", async ({ page }) => {
  await page.goto("/en/tests/explore/woodland-animal");
  await page.getByRole("button", { name: "Start quiz", exact: true }).click();
  const engine = page.locator("#play");
  const first = engine.locator('input[name="q1"]').first();
  const second = engine.locator('input[name="q2"]').first();
  await expect(first).toBeVisible();
  await expect(engine.getByRole("checkbox")).toHaveCount(0);
  await first.focus();
  await page.keyboard.press("Space");
  await expect(second).toBeVisible();
  await expect(engine.getByRole("heading", { level: 2 })).toBeFocused();
  await engine.getByRole("button", { name: "Back", exact: true }).click();
  await expect(first).toBeChecked();
  await engine.locator('input[name="q1"]').nth(1).click();
  await expect(second).toBeVisible();
  await page.reload();
  await expect(first).toBeVisible();
  await expect(engine.getByRole("radio", { checked: true })).toHaveCount(0);
  expect(await page.evaluate(() => sessionStorage.getItem("fm_fun_draft:woodland-animal"))).toBeNull();
});

test("@release branch editing clears the abandoned route and can change the ending", async ({ page }) => {
  await page.goto("/en/tests/explore/lost-letter-adventure");
  await page.getByRole("button", { name: "Start quiz", exact: true }).click();
  const engine = page.locator("#play");
  await engine.locator('input[name="q1"]').first().check();
  await engine.locator('input[name="q2"]').first().check();
  const back = engine.getByRole("button", { name: "Back", exact: true });
  const abandoned = engine.locator('input[name="q4"]').nth(2);
  await expect(abandoned).toBeVisible();
  await abandoned.evaluate((choice: HTMLInputElement, previous) => {
    choice.click();
    (previous as HTMLButtonElement).click();
  }, await back.elementHandle());
  await back.click();
  await engine.locator('input[name="q1"]').nth(1).click();
  const alternative = engine.locator('input[name="q3"]').first();
  await expect(alternative).not.toBeChecked();
  await alternative.check();
  await expect(engine.getByRole("heading", { level: 2 })).toHaveText("A Place on the Patient Shelf");
});

test("@release public hub initial HTML links, failure state and invalid identity", async ({ request, page }) => {
  for (const locale of ["en", "zh"] as const) {
    const response = await request.get(`/${locale}/tests`);
    expect(response.status()).toBe(200);
    const html = await response.text();
    for (const card of catalog) {
      const link = `href="/${locale}/tests/explore/${card.slug}"`;
      expect(html.includes(link), link).toBe(true);
    }
  }
  const legacy = await request.get("/en/tests/play/woodland-animal?ref=legacy", { maxRedirects: 0 });
  expect(legacy.status()).toBe(308);
  const location = new URL(legacy.headers().location!, "https://fermatmind.com");
  expect(location.pathname + location.search).toBe("/en/tests/explore/woodland-animal?ref=legacy");
  expect((await request.get(location.pathname + location.search, { maxRedirects: 0 })).status()).toBe(200);

  const response = await page.goto("/en/tests/explore/not-a-real-quiz");
  expect(response?.status()).toBe(404);
});

test("@release denied tab storage preserves standalone answering and results", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "sessionStorage", { get: () => { throw new Error("Storage disabled"); } });
  });
  await page.goto("/en/tests/explore/group-chat-role");
  await page.getByRole("button", { name: "Start quiz", exact: true }).click();
  await expect(page.locator("#play").getByRole("checkbox")).toHaveCount(0);
  await finish(page);
  await expect(page.locator('#play[data-stage="result"] [data-story-result-readings]')).toBeVisible();
});

test("@release denied clipboard offers a clean public result summary", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
    Object.defineProperty(navigator, "clipboard", { value: { writeText: () => Promise.reject(new Error("Denied")) } });
  });
  await page.goto("/en/tests/explore/woodland-animal");
  await page.getByRole("button", { name: "Start quiz", exact: true }).click();
  await finish(page);
  await page.getByRole("button", { name: "Share Result", exact: true }).click();
  const fallback = page.locator("[data-archetype-honor-group] textarea");
  await expect(fallback).toBeVisible();
  const text = await fallback.inputValue();
  expect(text).toContain("https://fermatmind.com/en/tests/explore/woodland-animal");
  expect(text).toContain("tie");
  expect(text).toContain("Jay");
  expect(text).toContain("Beaver");
  expect(text).toContain("Hedgehog");
  expect(text).not.toMatch(/\bq[1-9]\b|\bo[1-9]\b|answers?|\/results\//);
  const sharedUrl = new URL(text.split("\n").at(-1)!);
  expect(sharedUrl.search).toBe(""); expect(sharedUrl.hash).toBe("");
});

test("@release enlarged bilingual quiz text stays usable at narrow width", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  for (const locale of ["en", "zh"] as const) {
    const zh = locale === "zh";
    await page.goto(`/${locale}/tests/explore/woodland-animal`);
    const decline = page.getByTestId("cookie-banner-decline");
    if (locale === "en") await decline.click();
    await expect(decline).toHaveCount(0);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start quiz", exact: true }).click();
    await expect(page.locator('#play[data-stage="answer"]')).toBeVisible();
    await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
    await finish(page);
    const overflow = await page.locator("#play").evaluate(node => ({ scroll: node.scrollWidth, client: node.clientWidth }));
    expect(overflow.scroll).toBeLessThanOrEqual(overflow.client);
    await expect(page.getByRole("button", { name: zh ? "一键分享给朋友" : "Share Result" })).toBeVisible();
    await page.getByRole("button", { name: zh ? "再测一次" : "Retake", exact: true }).click();
    await expect(page.locator("#play h2")).toBeFocused();
  }
});
