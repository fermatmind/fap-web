import { expect, test } from "@playwright/test";

test("tests list keeps card titles visible and aligned in EN", async ({ page }) => {
  await page.goto("/en/tests");

  await expect(page.getByRole("heading", { name: "Tests" })).toBeVisible();
  const grid = page.getByTestId("tests-list-grid-section");
  const cards = grid.locator('[role="img"][aria-label]');
  await expect(cards.first()).toBeVisible();

  const cardCount = await cards.count();
  expect(cardCount).toBeGreaterThan(2);

  await expect(page.getByText("Type axis synthesis")).toHaveCount(0);
  await expect(page.getByText("Trait distribution profile")).toHaveCount(0);
  await expect(page.getByText("Multidomain screening")).toHaveCount(0);

  const clinicalHeading = grid.locator(
    'h3[title="Clinical Depression & Anxiety Assessment 【Professional Edition】"]'
  );
  await expect(clinicalHeading).toHaveCount(0);

  const topRowRatings = grid.getByTestId("tests-grid-card-rating");
  const firstRow = [0, 1, 2];
  const boxes = await Promise.all(firstRow.map(async (idx) => topRowRatings.nth(idx).boundingBox()));
  expect(boxes.every((box) => box !== null)).toBeTruthy();
  const yValues = boxes.map((box) => box?.y ?? 0);
  const maxY = Math.max(...yValues);
  const minY = Math.min(...yValues);
  expect(maxY - minY).toBeLessThanOrEqual(1);
});

test("tests list keeps zh core titles on one line without truncation", async ({ page }) => {
  await page.goto("/zh/tests");

  const grid = page.getByTestId("tests-list-grid-section");
  await expect(grid).toBeVisible();

  await expect(grid.locator('h3[title="MBTI 性格测试【16型人格】"]')).toBeVisible();
  await expect(grid.locator('h3[title="大五人格测试【OCEAN 模型】"]')).toBeVisible();
  await expect(grid.locator('h3[title="抑郁焦虑综合检测【学术专业版】"]')).toHaveCount(0);

  const headingTexts = await grid.locator("h3").allTextContents();
  expect(headingTexts.some((text) => text.includes("...") || text.includes("…"))).toBe(false);

  await expect(page.getByText("类型轴线综合")).toHaveCount(0);
  await expect(page.getByText("特质分布画像")).toHaveCount(0);
  await expect(page.getByText("多维筛查")).toHaveCount(0);
});
