import { expect, test, type Page } from "@playwright/test";

async function expectHeroAndValuePropsSeparated(page: Page) {
  const hero = page.getByTestId("home-hero-section");
  const valueProps = page.getByTestId("home-value-props-section");
  await expect(hero).toBeVisible();
  await expect(valueProps).toBeVisible();

  const [heroBox, valuePropsBox] = await Promise.all([hero.boundingBox(), valueProps.boundingBox()]);
  expect(heroBox).not.toBeNull();
  expect(valuePropsBox).not.toBeNull();

  const heroBottom = (heroBox?.y ?? 0) + (heroBox?.height ?? 0);
  const valueTop = valuePropsBox?.y ?? 0;
  expect(valueTop).toBeGreaterThanOrEqual(heroBottom - 1);
}

test("home page renders hero, value props, and highlighted tests", async ({ page }) => {
  await page.goto("/en");
  await expectHeroAndValuePropsSeparated(page);
  await expect(page.getByText("We use cookies and analytics to improve service quality.")).toHaveCount(0);

  await expect(page.getByRole("heading", { name: "Highlighted tests" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Find your test" })).toBeVisible();
  await expect(page.getByText("Why people trust FermatMind")).toBeVisible();
  await expect(page.getByText("Trust signals")).toBeVisible();

  const highlightedSection = page.locator("section").filter({ hasText: "Highlighted tests" });
  const highlightCards = highlightedSection.locator("article");
  await expect(highlightCards.first()).toBeVisible();
  await expect(highlightCards).toHaveCount(6);
  await expect(highlightedSection.locator('article[data-disabled="1"]')).toHaveCount(0);
  await expect(highlightedSection.locator('a[href*="/take"]')).toHaveCount(6);
  await expect(page.getByText("Clinical Grade")).toHaveCount(2);
  await expect(page.getByText("Type axis synthesis")).toHaveCount(0);
  await expect(page.getByText("Trait distribution profile")).toHaveCount(0);
  await expect(page.getByText("Multidomain screening")).toHaveCount(0);

  const clinicalCardLink = highlightedSection.locator(
    'article a[href="/en/tests/clinical-depression-anxiety-assessment-professional-edition"]'
  );
  await expect(clinicalCardLink).toContainText("Clinical Depression & Anxiety Assessment");
  await expect(clinicalCardLink).toContainText("【Professional Edition】");

  const topRowRatings = highlightedSection.getByTestId("highlighted-card-rating");
  const firstRow = [0, 1, 2];
  const boxes = await Promise.all(firstRow.map(async (idx) => topRowRatings.nth(idx).boundingBox()));
  expect(boxes.every((box) => box !== null)).toBeTruthy();
  const yValues = boxes.map((box) => box?.y ?? 0);
  const maxY = Math.max(...yValues);
  const minY = Math.min(...yValues);
  expect(maxY - minY).toBeLessThanOrEqual(1);

  const firstStartButton = page.getByRole("link", { name: "Find your test" });
  const box = await firstStartButton.boundingBox();
  expect(box).not.toBeNull();
  expect((box?.height ?? 0) >= 44).toBeTruthy();
});

test("zh home MBTI highlighted card title shows 16型人格", async ({ page }) => {
  await page.goto("/zh");
  await expectHeroAndValuePropsSeparated(page);
  await expect(page.getByText("我们使用 Cookie 和分析工具来提升服务质量。")).toHaveCount(0);

  const highlightedSection = page.getByTestId("home-highlighted-tests-section");
  await expect(highlightedSection).toBeVisible();
  await expect(highlightedSection.getByRole("link", { name: "MBTI 性格测试【16型人格】", exact: true })).toBeVisible();
  await expect(highlightedSection.getByRole("link", { name: "大五人格测试【OCEAN 模型】", exact: true })).toBeVisible();
  await expect(highlightedSection.getByRole("link", { name: "抑郁焦虑综合检测【学术专业版】", exact: true })).toBeVisible();
  await expect(highlightedSection.getByText("MBTI 性格测试【16型人格测试】")).toHaveCount(0);
  await expect(page.getByText("类型轴线综合")).toHaveCount(0);
  await expect(page.getByText("特质分布画像")).toHaveCount(0);
  await expect(page.getByText("多维筛查")).toHaveCount(0);
});

test("home hero and value props stay separated on mobile for en and zh", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const localePath of ["/en", "/zh"] as const) {
    await page.goto(localePath);
    await expectHeroAndValuePropsSeparated(page);
  }
});
