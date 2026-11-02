import { expect, test } from "@playwright/test";
import { startPublicContentApiFixture } from "./helpers/public-content-api-fixture";

let stopFixture: (() => Promise<void>) | undefined;
test.beforeAll(async () => { stopFixture = await startPublicContentApiFixture(); });
test.afterAll(async () => { await stopFixture?.(); });

test("existing MBTI examples remain the fragment destination after direct load and refresh", async ({ page }) => {
  await page.goto("/en/tests/mbti-personality-test-16-personality-types#result-examples");
  const examples = page.getByTestId("mbti-result-examples");
  const top = () => examples.evaluate((node) => node.getBoundingClientRect().top);
  const waitForExampleLayout = async () => {
    await expect(examples).toBeVisible();
    await page.evaluate(async () => {
      await document.fonts.ready;
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    });
  };
  await waitForExampleLayout();
  await expect(examples).toContainText("two synthetic examples");
  await expect.poll(top).toBeGreaterThanOrEqual(70);
  await expect.poll(top).toBeLessThan(120);
  await page.reload();
  await waitForExampleLayout();
  await expect.poll(top).toBeGreaterThanOrEqual(70);
  await expect.poll(top).toBeLessThan(120);
  await expect(examples.getByRole("article")).toHaveCount(2);
  await expect(examples).toContainText("not scored attempts, real user reports, or your result");
});
