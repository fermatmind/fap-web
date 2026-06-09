import { expect, test, type Page } from "@playwright/test";

const primaryNavTargets = {
  en: [
    ["tests", "/en/tests"],
    ["articles", "/en/articles"],
    ["personality", "/en/personality"],
    ["career", "/en/career"],
    ["help", "/en/support"],
    ["business", "/en/business"],
  ],
  zh: [
    ["tests", "/zh/tests"],
    ["articles", "/zh/articles"],
    ["personality", "/zh/personality"],
    ["career", "/zh/career"],
    ["help", "/zh/support"],
    ["business", "/zh/business"],
  ],
} as const;

const primaryNavLabels = {
  en: {
    tests: "Tests",
    articles: "Articles",
    personality: "Personality",
    career: "Career",
    help: "Help",
    business: "Business",
  },
  zh: {
    tests: "测试",
    articles: "文章",
    personality: "人格",
    career: "职业",
    help: "帮助",
    business: "企业版",
  },
} as const;

async function expectSiteChromeVisible(page: Page) {
  await expect(page.getByRole("link", { name: /^(FermatMind|费马测试)$/ })).toBeVisible();
}

test("site chrome is consistent across help and articles pages", async ({ page }) => {
  await page.goto("/en/help");
  await expectSiteChromeVisible(page);

  await page.goto("/en/articles");
  await expect(page.getByRole("link", { name: "FermatMind", exact: true })).toBeVisible();
  const helpMenuTrigger = page.getByRole("navigation").getByRole("button", { name: "Help menu", exact: true });
  await expect(helpMenuTrigger).toBeVisible();
  await helpMenuTrigger.click();
  await expect(page.getByRole("menuitem", { name: "Full help center", exact: true })).toBeVisible();
});

test("site chrome is visible on immersive take page", async ({ page }) => {
  await page.goto("/en/tests/mbti-personality-test-16-personality-types/take");
  await expectSiteChromeVisible(page);
});

test("site chrome is visible on order lookup page", async ({ page }) => {
  await page.goto("/en/orders/lookup");
  await expectSiteChromeVisible(page);
});

test("site chrome is visible on result page", async ({ page }) => {
  await page.goto("/en/result/site-chrome-smoke");
  await expectSiteChromeVisible(page);
});

test("site chrome is visible on share page", async ({ page }) => {
  await page.goto("/en/share/site-chrome-smoke");
  await expectSiteChromeVisible(page);
});

test("root path lands on a localized home page with site chrome", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/(en|zh)?$/);
  await expectSiteChromeVisible(page);
});

test("english desktop header stays on a single row", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1200 });
  await page.goto("/en");

  const controls = [
    page.getByTestId("desktop-primary-nav-link-tests"),
    page.getByTestId("desktop-primary-nav-link-articles"),
    page.getByTestId("desktop-primary-nav-link-personality"),
    page.getByTestId("desktop-primary-nav-link-career"),
    page.getByTestId("desktop-primary-nav-link-help"),
    page.getByTestId("desktop-primary-nav-link-business"),
    page.getByRole("link", { name: "My Results", exact: true }),
    page.getByRole("button", { name: "Language menu", exact: true }),
    page.getByRole("link", { name: "Start", exact: true }),
  ];

  await Promise.all(controls.map((control) => expect(control).toBeVisible()));
  const boxes = await Promise.all(controls.map((control) => control.boundingBox()));
  expect(boxes.every((box) => box !== null)).toBeTruthy();

  const yPositions = boxes.map((box) => box?.y ?? 0);
  expect(Math.max(...yPositions) - Math.min(...yPositions)).toBeLessThanOrEqual(6);
});

for (const locale of ["en", "zh"] as const) {
  test(`${locale} desktop primary header nav links have stable hrefs and navigate`, async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 1000 });
    const homePath = locale === "zh" ? "/" : "/en";

    for (const [key, expectedHref] of primaryNavTargets[locale]) {
      await page.goto(homePath);
      const link = page.getByTestId(`desktop-primary-nav-link-${key}`);
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute("href", expectedHref);
      const href = await link.getAttribute("href");
      expect(href).toBeTruthy();
      expect(href).not.toBe("#");
      await link.click();
      await expect(page).toHaveURL(new RegExp(`${expectedHref.replaceAll("/", "\\/")}(?:[?#].*)?$`));
    }
  });

  test(`${locale} desktop dropdown buttons expose accessible menus`, async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 1000 });
    await page.goto(locale === "zh" ? "/" : "/en");

    for (const [key] of primaryNavTargets[locale]) {
      const trigger = page.getByRole("navigation").getByRole("button", {
        name: `${primaryNavLabels[locale][key]} menu`,
        exact: true,
      });
      await trigger.click();
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      await expect(page.getByRole("menu")).toBeVisible();
      await expect(page.getByRole("menuitem").first()).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(trigger).toHaveAttribute("aria-expanded", "false");
    }
  });

  test(`${locale} mobile primary header nav links have stable hrefs and navigate`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const homePath = locale === "zh" ? "/" : "/en";

    for (const [key, expectedHref] of primaryNavTargets[locale]) {
      await page.goto(homePath);
      await page.getByRole("button", { name: locale === "zh" ? "菜单" : "Menu", exact: true }).click();
      const link = page.getByTestId(`mobile-primary-nav-link-${key}`);
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute("href", expectedHref);
      const href = await link.getAttribute("href");
      expect(href).toBeTruthy();
      expect(href).not.toBe("#");
      await link.click();
      await expect(page).toHaveURL(new RegExp(`${expectedHref.replaceAll("/", "\\/")}(?:[?#].*)?$`));
    }
  });
}
