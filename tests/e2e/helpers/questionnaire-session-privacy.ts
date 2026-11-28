import { expect, type Page } from "@playwright/test";
import { expectStandaloneObservationPrivacy } from "./standalone-observation-flow";

export async function expectQuestionnaireSessionPrivacy(
  page: Page,
  locale: "en" | "zh",
  quiz: { slug: string; questions: readonly { id: string }[] },
) {
  const otherLocale = locale === "zh" ? "en" : "zh";
  const quizPath = `/tests/explore/${quiz.slug}`;

  await expectStandaloneObservationPrivacy(page, `/${locale}${quizPath}`, quiz);

  await page.goto(`/${otherLocale}${quizPath}/take`);
  const firstQuestion = page.locator(`#take-test input[name="${quiz.questions[0].id}"]`);
  await expect(firstQuestion.first()).toBeVisible({ timeout: 30_000 });
  await expect(firstQuestion.and(page.getByRole("radio", { checked: true }))).toHaveCount(0);
  expect(await page.evaluate(slug => sessionStorage.getItem(`fm_questionnaire_draft:${slug}`), quiz.slug)).toBeNull();
}

export async function expectManualQuestionnaireSessionPrivacy(
  page: Page,
  locale: "en" | "zh",
  quiz: { slug: string; questions: readonly { id: string }[] },
) {
  const landing = `/${locale}/tests/explore/${quiz.slug}`;
  const first = page.locator(`#take-test input[name="${quiz.questions[0].id}"]`);
  const second = page.locator(`#take-test input[name="${quiz.questions[1].id}"]`);
  const advance = page.getByRole("button", { name: locale === "zh" ? "下一题" : "Next", exact: true });
  const back = page.getByRole("button", { name: locale === "zh" ? "上一题" : "Back", exact: true });

  await page.goto(landing);
  await page.locator("#take-test [data-explore-start]").click();
  await first.nth(1).check();
  await advance.click();
  await expect(second.first()).toBeVisible();
  await back.click();
  await expect(first.nth(1)).toBeChecked();
  await first.first().check();
  await advance.click();
  await expect(second.first()).toBeVisible();

  await page.reload();
  await expect(first.first()).toBeVisible();
  await expect(first.and(page.getByRole("radio", { checked: true }))).toHaveCount(0);
  await expect(page.locator("#take-test").getByRole("checkbox")).toHaveCount(0);
  await first.nth(1).check();
  await advance.click();
  await expect(second.first()).toBeVisible();

  const other = locale === "zh" ? "en" : "zh";
  await page.goto(`/${other}/tests/explore/${quiz.slug}/take`);
  await expect(first.first()).toBeVisible();
  await expect(first.and(page.getByRole("radio", { checked: true }))).toHaveCount(0);
  expect(await page.evaluate(slug => sessionStorage.getItem(`fm_questionnaire_draft:${slug}`), quiz.slug)).toBeNull();
}
