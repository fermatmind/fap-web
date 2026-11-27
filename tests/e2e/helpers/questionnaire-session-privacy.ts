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
