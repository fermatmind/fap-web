import { expect, type Page } from "@playwright/test";

export async function expectStandaloneObservationPrivacy(
  page: Page,
  landing: string,
  quiz: { questions: readonly { id: string }[] },
) {
  const take = `${landing}/take`;
  const first = page.locator(`#take-test input[name="${quiz.questions[0].id}"]`);
  const second = page.locator(`#take-test input[name="${quiz.questions[1].id}"]`).first();
  const expectFreshAttempt = async () => {
    await expect(first.first()).toBeVisible({ timeout: 30000 });
    await expect(first.and(page.getByRole("radio", { checked: true }))).toHaveCount(0);
  };

  await page.goto(take);
  await expectFreshAttempt();
  await first.nth(1).click();
  await expect(second).toBeVisible();
  await page.getByRole("button", { name: /^(Back|上一条|上一题)$/u }).click();
  await expect(first.nth(1)).toBeChecked();
  await first.first().click();
  await expect(second).toBeVisible();

  await page.reload();
  await expectFreshAttempt();
  await first.nth(1).click();
  await expect(second).toBeVisible();
  await page.goto(landing);
  await page.goBack();
  await expectFreshAttempt();

  await first.nth(1).click();
  await expect(second).toBeVisible();
  await page.getByRole("link", { name: /^(Back to assessment|返回测评介绍)$/u }).first().click();
  await page.waitForURL(url => url.pathname === landing);
  await page.locator("[data-explore-start]:visible").first().click();
  await expectFreshAttempt();
}
