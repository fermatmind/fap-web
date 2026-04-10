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

async function expectHighlightedBeforeValueProps(page: Page) {
  const highlighted = page.getByTestId("home-highlighted-tests-section");
  const valueProps = page.getByTestId("home-value-props-section");

  const [highlightedBox, valuePropsBox] = await Promise.all([highlighted.boundingBox(), valueProps.boundingBox()]);
  expect(highlightedBox).not.toBeNull();
  expect(valuePropsBox).not.toBeNull();

  const highlightedBottom = (highlightedBox?.y ?? 0) + (highlightedBox?.height ?? 0);
  const valueTop = valuePropsBox?.y ?? 0;
  expect(valueTop).toBeGreaterThanOrEqual(highlightedBottom - 1);
}

async function expectNoHorizontalOverflow(page: Page) {
  const metrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
}

test("home page renders hero, value props, and highlighted tests", async ({ page }) => {
  await page.goto("/en");
  await expectNoHorizontalOverflow(page);
  await expectHeroAndValuePropsSeparated(page);
  await expectHighlightedBeforeValueProps(page);
  await expect(page.getByText("We use cookies and analytics to improve service quality.")).toHaveCount(0);

  await expect(page.getByRole("heading", { name: "Decision Entry Matrix" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Start calibration" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "The Architect Protocols" })).toBeVisible();
  await expect(page.getByText("Precision. Sovereignty. Evidence.")).toBeVisible();
  await expect(page.getByText("Scenario Validation")).toHaveCount(2);

  const highlightedSection = page.getByTestId("home-highlighted-tests-section");
  const highlightCards = highlightedSection.locator("article");
  await expect(highlightCards.first()).toBeVisible();
  await expect(highlightCards).toHaveCount(5);
  await expect(highlightedSection.locator('article[data-disabled="1"]')).toHaveCount(0);
  await expect(highlightedSection.locator('a[href*="/take"]')).toHaveCount(6);
  await expect(page.getByText("BIG5_OCEAN")).toHaveCount(0);
  await expect(page.getByText("SDS_20")).toHaveCount(0);
  await expect(page.getByText("IQ_RAVEN")).toHaveCount(0);
  await expect(page.getByText("EQ_60")).toHaveCount(0);
  await expect(page.getByText("CLINICAL_COMBO_68")).toHaveCount(0);

  await expect(
    highlightedSection.getByRole("link", { name: "Depression & Anxiety Assessment", exact: true })
  ).toBeVisible();
  await expect(
    highlightedSection.getByRole("link", { name: "Depression Screening (Standard)", exact: true })
  ).toHaveCount(0);

  await expect(highlightedSection.getByRole("link", { name: "MBTI Personality Test", exact: true })).toBeVisible();
  await expect(highlightedSection.getByRole("link", { name: "Big Five Personality Test", exact: true })).toBeVisible();
  await expect(highlightedSection.getByRole("link", { name: "IQ Test", exact: true })).toBeVisible();
});

test("zh home MBTI highlighted card title shows 16型人格", async ({ page }) => {
  await page.goto("/zh");
  await expectNoHorizontalOverflow(page);
  await expectHeroAndValuePropsSeparated(page);
  await expectHighlightedBeforeValueProps(page);
  await expect(page.getByText("我们使用 Cookie 和分析工具来提升服务质量。")).toHaveCount(0);

  const highlightedSection = page.getByTestId("home-highlighted-tests-section");
  await expect(highlightedSection).toBeVisible();
  await expect(highlightedSection.getByRole("link", { name: "MBTI 性格测试", exact: true })).toBeVisible();
  await expect(highlightedSection.getByRole("link", { name: "大五人格测试", exact: true })).toBeVisible();
  await expect(highlightedSection.getByRole("link", { name: "抑郁焦虑综合检测", exact: true })).toBeVisible();
  await expect(highlightedSection.getByRole("link", { name: "抑郁测评（标准版）", exact: true })).toHaveCount(0);
  await expect(page.getByText("BIG5_OCEAN")).toHaveCount(0);
  await expect(page.getByText("SDS_20")).toHaveCount(0);
  await expect(page.getByText("IQ_RAVEN")).toHaveCount(0);
  await expect(page.getByText("EQ_60")).toHaveCount(0);
  await expect(page.getByText("CLINICAL_COMBO_68")).toHaveCount(0);
});

test("home hero and value props stay separated on mobile for en and zh", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const localePath of ["/en", "/zh"] as const) {
    await page.goto(localePath);
    await expectNoHorizontalOverflow(page);
    await expectHeroAndValuePropsSeparated(page);
    await expectHighlightedBeforeValueProps(page);
  }
});

test("home layout stays within viewport across representative widths", async ({ page }) => {
  const viewports = [
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1024, height: 900 },
    { width: 1100, height: 900 },
    { width: 1180, height: 900 },
    { width: 1440, height: 960 },
  ] as const;

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);

    for (const localePath of ["/en", "/zh"] as const) {
      await page.goto(localePath);
      await expectNoHorizontalOverflow(page);
    }
  }
});

test("home hero keeps the full F01-F30 matrix visible across desktop widths", async ({ page }) => {
  const viewports = [
    { width: 1024, height: 900 },
    { width: 1100, height: 900 },
    { width: 1180, height: 900 },
    { width: 1440, height: 960 },
  ] as const;

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);

    for (const localePath of ["/en", "/zh"] as const) {
      await page.goto(localePath);
      await expectNoHorizontalOverflow(page);
      await expect(page.getByTestId("home-engine-node-F30")).toBeVisible();
    }
  }
});
