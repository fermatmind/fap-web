import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Fscrs22Questionnaire } from "@/lib/questionnaires/fscrs22";

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/inner-critic-voice-test.json", "utf8")) as Fscrs22Questionnaire;
const ref = JSON.parse(readFileSync("tests/fixtures/questionnaires/fscrs22-source-reference.json", "utf8"));
const sample: Record<string, string> = {};
for (const [part, values] of Object.entries({ inadequate: [1, 2, 3, 4, 5, 1, 2, 3, 4], hated: [1, 2, 3, 4, 5], reassured: [5, 4, 3, 2, 1, 5, 4, 3] })) {
  ref.method.key[part].forEach((number: number, index: number) => { sample[`fscrs-${String(number).padStart(2, "0")}`] = String(values[index]); });
}
const client = (page: Page) => page.locator("[data-fscrs22-client]");
async function expectFresh(page: Page) {
  await expect(client(page).getByRole("radio").first()).toBeVisible({ timeout: 30_000 });
  await expect(client(page).getByRole("radio", { checked: true })).toHaveCount(0);
}
async function start(page: Page) {
  await page.locator("[data-explore-start]:visible").first().click();
  await expectFresh(page);
}
async function finish(page: Page, locale: "en" | "zh", answers: Record<string, string>) {
  const box = client(page);
  for (const [index, question] of quiz.questions.entries()) {
    await expect(box.getByRole("heading", { level: 2, name: question.prompt[locale], exact: true })).toBeVisible();
    await expect(box.getByRole("radio")).toHaveCount(6);
    await expect(box.locator("[data-fscrs22-support]")).toContainText(quiz.fscrs22.support.urgent[locale]);
    if (index === 8) await expect(box.locator("[data-fscrs22-sensitive-notice]")).toContainText(quiz.fscrs22.sensitiveNotice[locale]);
    const radio = box.locator(`input[name="${question.id}"][value="${answers[question.id]}"]`);
    await radio.click();
    await expect(radio).toHaveCount(0);
  }
  await expect(box.locator("[data-fscrs22-result]")).toBeVisible();
}
async function expectFull(page: Page, locale: "en" | "zh") {
  const result = client(page).locator("[data-fscrs22-result]");
  for (const profile of quiz.profiles) for (const section of profile.sections) for (const paragraph of section.paragraphs) await expect(result).toContainText(paragraph[locale]);
}

for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/inner-critic-voice-test`;
  test(`@release FSCRS22 ${locale}: complete source responses, separate 9/5/8 readouts and whole guides`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const leaks: string[] = [], errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("request", request => { if (/fscrs-\d{2}|[?&](?:answers|score|mean|sum)=/.test(`${request.url()} ${request.postData() ?? ""}`)) leaks.push(request.url()); });
    await page.goto(entry); await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    const decline = page.getByRole("button", { name: zh ? "拒绝" : "Decline", exact: true });
    if (await decline.isVisible()) await decline.click();
    await expect(page.locator('[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await expect(page.locator("[data-fscrs22-attribution]")).toContainText("CC BY 4.0");
    for (const profile of quiz.profiles) await expect(page.getByRole("link", { name: profile.title[locale], exact: true })).toBeVisible();
    await start(page); await client(page).getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await expect(client(page).getByRole("status")).toContainText(zh ? "明确选择跳过" : "explicitly skip");
    await client(page).getByRole("radio", { name: "2", exact: true }).focus(); await page.keyboard.press("Space");
    await expect(client(page).locator('input[name="fscrs-02"]').first()).toBeVisible();
    await client(page).getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click();
    await expect(client(page).getByRole("radio", { name: "2", exact: true })).toBeChecked();
    await finish(page, locale, sample);
    for (const [part, sum, mean] of [["inadequate", 25, "2.78"], ["hated", 15, "3.00"], ["reassured", 27, "3.38"]] as const) {
      const section = client(page).locator(`[data-fscrs22-part="${part}"]`);
      await expect(section.locator("[data-fscrs22-sum]")).toContainText(String(sum)); await expect(section.locator("[data-fscrs22-mean]")).toContainText(mean);
    }
    await expectFull(page, locale); expect(leaks).toEqual([]); expect(errors).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await client(page).locator("[data-fscrs22-result]").scrollIntoViewIfNeeded();
    await testInfo.attach(`FSCRS22-${locale}-mobile-readout-consent-declined`, { body: await page.screenshot(), contentType: "image/png" });
    await client(page).getByRole("link", { name: zh ? "阅读这一部分的完整公开解释" : "Read this part’s complete public explanation", exact: true }).first().click();
    await page.waitForLoadState("load"); await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.profiles[0].title[locale]);
    for (const section of quiz.profiles[0].sections) for (const paragraph of section.paragraphs) await expect(page.locator("main")).toContainText(paragraph[locale]);
    await expect(page.locator("[data-fscrs22-support]")).toContainText(quiz.fscrs22.support.urgent[locale]);
  });

  test(`@release FSCRS22 ${locale}: a sensitive-item skip withholds only its own part; all skips retain every full explanation`, async ({ page }) => {
    await page.goto(entry); await start(page); await finish(page, locale, { ...sample, "fscrs-09": "na" });
    const result = client(page).locator("[data-fscrs22-result]");
    await expect(result.locator("[data-fscrs22-unscored]")).toHaveCount(1);
    await expect(result.locator('[data-fscrs22-part="hated"] [data-fscrs22-count]')).toContainText("4/5");
    await expect(result.locator('[data-fscrs22-part="inadequate"] [data-fscrs22-mean]')).toContainText("2.78");
    await expect(result.locator('[data-fscrs22-part="reassured"] [data-fscrs22-mean]')).toContainText("3.38");
    await page.goto(entry);
    await start(page); await expect(client(page).getByRole("radio").first()).not.toBeChecked();
    await finish(page, locale, Object.fromEntries(quiz.questions.map(question => [question.id, "na"])));
    await expect(result.locator("[data-fscrs22-unscored]")).toHaveCount(3);
    await expect(result.locator("[data-fscrs22-mean], [data-fscrs22-sum]")).toHaveCount(0);
    await expectFull(page, locale);
  });

  test(`@release FSCRS22 ${locale}: storage and clipboard refusal, clear, reload, language and persisted-page reset`, async ({ page }) => {
    await page.addInitScript(() => {
      const get = Storage.prototype.getItem, set = Storage.prototype.setItem, remove = Storage.prototype.removeItem;
      const reject = (key: string) => key.startsWith("fm_questionnaire_draft:");
      Storage.prototype.getItem = function(key) { if (reject(key)) throw new Error("Synthetic storage refusal"); return get.call(this, key); };
      Storage.prototype.setItem = function(key, value) { if (reject(key)) throw new Error("Synthetic storage refusal"); return set.call(this, key, value); };
      Storage.prototype.removeItem = function(key) { if (reject(key)) throw new Error("Synthetic storage refusal"); return remove.call(this, key); };
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("Synthetic clipboard refusal"); } } });
    });
    await page.goto(entry); await start(page);
    await expect(client(page).locator("fieldset").getByRole("checkbox")).toHaveCount(0);
    await finish(page, locale, sample);
    await client(page).getByRole("button", { name: zh ? "复制公开解释链接" : "Copy public explanation links", exact: true }).click();
    const text = await client(page).getByRole("textbox", { name: zh ? "手动复制公开链接" : "Public links for manual copying", exact: true }).inputValue();
    expect(text).not.toMatch(/fscrs-\d|answers|mean|sum|[?&]|2\.78|3\.38/);
    expect(text.split("\n").filter(line => line.startsWith("https://"))).toEqual(quiz.profiles.map(profile => `https://fermatmind.com${entry}/results/${profile.id}`));
    await page.goto(entry);
    await start(page);
    async function advanceOne() {
      await client(page).locator('input[name="fscrs-01"][value="2"]').click();
      await expect(client(page).locator('input[name="fscrs-02"]').first()).toBeVisible();
    }
    await advanceOne();
    await page.reload();
    await expectFresh(page);
    await advanceOne();
    const other = zh ? "en" : "zh";
    await page.goto(`/${other}/tests/explore/${quiz.slug}/take`);
    await expectFresh(page);
    await advanceOne();
    await page.goBack();
    await expectFresh(page);
    await advanceOne();
    await page.getByRole("link", { name: /^(Back to assessment|返回测评介绍)$/u }).first().click();
    await expect(page).toHaveURL(url => url.pathname === entry);
    await start(page);
  });
}

test("@release FSCRS22 public guide identities and all eight local images", async ({ request }) => {
  expect((await request.get("/en/tests/explore/inner-critic-voice-test/results/unknown")).status()).toBe(404);
  for (const locale of ["en", "zh"]) for (const profile of [null, ...quiz.profiles]) {
    const response = await request.get(`/og/fun/inner-critic-voice-test?locale=${locale}${profile ? `&portrait=${profile.id}` : ""}`);
    expect(response.status()).toBe(200); const png = await response.body();
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630]);
  }
});
