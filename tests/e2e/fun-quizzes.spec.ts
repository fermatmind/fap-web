import { test, expect, type Page } from "@playwright/test";
import catalog from "../../lib/entertainment/catalog.json";

const samples = ["woodland-animal", "group-chat-role", "fantasy-party-role", "lost-letter-adventure", "portal-choice", "spell-school-elective", "island-day", "snow-day", "response-color", "dream-train", "board-game-table", "escape-room-role", "photo-group-role", "game-night-reset", "gift-note", "comfort-offer", "relationship-values", "choosing-together", "note-taking-doodles", "fictional-cafe", "house-of-doors", "harbor-light", "pocket-map", "story-ending"];
async function finish(page: Page, zh: boolean) {
  for (let step = 0; step < 30; step++) {
    await page.getByRole("radio").first().check();
    const submit = page.getByRole("button", { name: zh ? "查看完整结果" : "See full result", exact: true });
    if (await submit.count()) {
      const progress = page.getByRole("progressbar");
      expect(await progress.evaluate(node => { const bar = node as HTMLProgressElement; return bar.value === bar.max; })).toBe(true);
      await submit.dblclick(); return;
    }
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
  }
  throw new Error("Quiz did not terminate");
}

for (const locale of ["en", "zh"] as const) for (const slug of samples) {
  test(`@release fun quiz ${locale}/${slug}: entry, all answers, complete result, retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const card = catalog.find(item => item.slug === slug)!;
    const zh = locale === "zh";
    await page.goto(`/${locale}/tests/play/${slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(card.title[locale]);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com/${locale}/tests/play/${slug}`);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/play/${slug}`);
    await expect(page.locator('link[rel="alternate"][hreflang="zh-CN"]')).toHaveAttribute("href", `https://fermatmind.com/zh/tests/play/${slug}`);
    await expect(page.locator("html")).toHaveAttribute("lang", locale === "zh" ? /zh/ : "en");
    await expect(page.getByRole("link", { name: zh ? "了解 MBTI 与题本选择" : "Explore MBTI and its versions" })).toHaveCount(0);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start quiz", exact: true }).click();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await expect(page.getByRole("status").filter({ hasText: zh ? "请先选择" : "Choose an option" })).toBeVisible();
    await finish(page, zh);
    await expect(page.getByRole("heading", { name: zh ? "完整结果已呈现，下一步由你选择" : "That is your complete result. What next?" })).toBeVisible();
    await expect(page.getByRole("heading", { name: zh ? "生活里的一个例子" : "A small everyday example" }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: zh ? "也有这样的取舍" : "The tradeoff" }).first()).toBeVisible();
    const recommendation = page.getByRole("link", { name: zh ? "了解 MBTI 与题本选择" : "Explore MBTI and its versions" });
    await expect(recommendation).toHaveAttribute("href", /landing_path=.*tests.*play/);
    await expect(recommendation).toHaveAttribute("href", /target_action=entertainment_result_mbti/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const url = new URL(page.url()); expect(url.search).toBe(""); expect(url.hash).toBe("");
    expect(await page.evaluate(key => sessionStorage.getItem(key), `fm_fun_draft:${slug}`)).toBeNull();
    if (slug === "woodland-animal" && locale === "en") {
      await page.screenshot({ path: process.env.FUN_QA_OUTPUT ? `${process.env.FUN_QA_OUTPUT}/woodland-result-mobile.png` : test.info().outputPath("result-mobile.png"), fullPage: true });
      await page.getByRole("button", { name: "Copy result and link" }).click();
      await expect(page.getByRole("status").filter({ hasText: /Copied|Automatic copying/ })).toBeVisible();
      await recommendation.click();
      await expect(page).toHaveURL(/\/en\/tests\/mbti-personality-test-16-personality-types/);
      return;
    }
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake quiz", exact: true }).click();
    await expect(page.getByRole("radio").first()).not.toBeChecked();
    await expect(page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true })).toBeDisabled();
  });
}

test("@release tab draft opt-in, refresh resume, back/edit, clear, and keyboard", async ({ page }) => {
  await page.goto("/en/tests/play/woodland-animal");
  await page.getByRole("button", { name: "Start quiz", exact: true }).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("radio").first().focus();
  await page.keyboard.press("Space");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.locator("#play h2")).toBeFocused();
  await page.reload();
  await page.getByRole("button", { name: "Resume this tab’s progress" }).click();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page.getByRole("radio").first()).toBeChecked();
  await page.getByRole("radio").nth(1).check();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await finish(page, false);
  expect(await page.evaluate(() => sessionStorage.getItem("fm_fun_draft:woodland-animal"))).toBeNull();
  await page.getByRole("button", { name: "Retake quiz" }).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("radio").first().check();
  await page.getByRole("button", { name: "Exit and clear this attempt" }).click();
  expect(await page.evaluate(() => sessionStorage.getItem("fm_fun_draft:woodland-animal"))).toBeNull();
});

test("@release branch editing clears the abandoned route and can change the ending", async ({ page }) => {
  await page.goto("/en/tests/play/lost-letter-adventure");
  await page.getByRole("button", { name: "Start quiz", exact: true }).click();
  await page.getByRole("radio").first().check();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("radio").first().check();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("radio").nth(2).check();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.getByRole("radio").nth(1).check();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByRole("radio").first()).not.toBeChecked();
  await page.getByRole("radio").first().check();
  await page.getByRole("button", { name: "See full result", exact: true }).click();
  await expect(page.locator("#play h2")).toHaveText("A Place on the Patient Shelf");
});

test("@release public hub initial HTML links, failure state and invalid identity", async ({ request, page }) => {
  for (const locale of ["en", "zh"] as const) {
    const response = await request.get(`/${locale}/tests`);
    expect(response.status()).toBe(200);
    const html = await response.text();
    for (const card of catalog) expect(html).toContain(`href="/${locale}/tests/play/${card.slug}"`);
  }
  const response = await page.goto("/en/tests/play/not-a-real-quiz");
  expect(response?.status()).toBe(404);
});

test("@release denied tab storage preserves answering and explains refresh limits", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "sessionStorage", { get: () => { throw new Error("Storage disabled"); } });
  });
  await page.goto("/en/tests/play/group-chat-role");
  await page.getByRole("button", { name: "Start quiz", exact: true }).click();
  await page.getByRole("checkbox").check();
  await expect(page.getByRole("status").filter({ hasText: "could not save progress" })).toBeVisible();
  await finish(page, false);
  await expect(page.getByRole("heading", { name: "That is your complete result. What next?" })).toBeVisible();
});

test("@release denied clipboard offers a clean public result summary", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { value: { writeText: () => Promise.reject(new Error("Denied")) } });
  });
  await page.goto("/en/tests/play/woodland-animal");
  await page.getByRole("button", { name: "Start quiz", exact: true }).click();
  await finish(page, false);
  await page.getByRole("button", { name: "Copy result and link" }).click();
  const fallback = page.getByRole("textbox", { name: "Result text for manual copying" });
  await expect(fallback).toBeVisible();
  const text = await fallback.inputValue();
  expect(text).toContain("https://fermatmind.com/en/tests/play/woodland-animal");
  expect(text).toContain("Tied portraits:");
  expect(text).toContain("/woodland-animal/results/jay");
  expect(text).toContain("/woodland-animal/results/beaver");
  expect(text).toContain("/woodland-animal/results/hedgehog");
  expect(text).toContain("Jay"); expect(text).toContain("Beaver"); expect(text).toContain("Hedgehog");
  expect(text).not.toMatch(/\bq[1-9]\b|\bo[1-9]\b|answers?/);
  const sharedUrl = new URL(text.split("\n").at(-1)!);
  expect(sharedUrl.search).toBe(""); expect(sharedUrl.hash).toBe("");
});

test("@release enlarged bilingual quiz text stays usable at narrow width", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  for (const locale of ["en", "zh"] as const) {
    const zh = locale === "zh";
    await page.goto(`/${locale}/tests/play/woodland-animal`);
    const decline = page.getByTestId("cookie-banner-decline");
    if (locale === "en") await decline.click();
    await expect(decline).toHaveCount(0);
    await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
    await page.getByRole("button", { name: zh ? "开始测试" : "Start quiz", exact: true }).click();
    await finish(page, zh);
    const overflow = await page.locator("#play").evaluate(node => ({ scroll: node.scrollWidth, client: node.clientWidth }));
    expect(overflow.scroll).toBeLessThanOrEqual(overflow.client);
    await expect(page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link" })).toBeVisible();
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake quiz", exact: true }).click();
    await expect(page.locator("#play h2")).toBeFocused();
  }
});
