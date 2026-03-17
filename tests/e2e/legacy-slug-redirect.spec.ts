import { expect, test } from "@playwright/test";

const LEGACY_MODE = process.env.FAP_LEGACY_PATH_MODE === "gone" ? "gone" : "redirect";

async function expectLegacyBehavior(
  requestPath: string,
  canonicalPath: string,
  request: import("@playwright/test").APIRequestContext,
  page: import("@playwright/test").Page
) {
  const response = await request.get(requestPath, { maxRedirects: 0 });

  if (LEGACY_MODE === "gone") {
    expect(response.status()).toBe(410);
    const pageResponse = await page.goto(requestPath);
    expect(pageResponse?.status()).toBe(410);
    return;
  }

  expect(response.status()).toBe(308);
  expect(response.headers().location).toContain(canonicalPath);

  await page.goto(requestPath);
  await expect(page).toHaveURL(new RegExp(canonicalPath.replaceAll("/", "\\/") + "$"));
}

test("legacy slug redirect: /tests alias detail is single-hop 308", async ({ page, request }) => {
  const response = await request.get("/en/tests/personality-mbti-test", { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toContain("/en/tests/mbti-personality-test-16-personality-types");

  await page.goto("/en/tests/personality-mbti-test");
  await expect(page).toHaveURL(/\/en\/tests\/mbti-personality-test-16-personality-types$/);
});

test("legacy slug redirect: 4-letter personality detail is a single-hop 308 to the default public variant", async ({ page, request }) => {
  const response = await request.get("/en/personality/intj", { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toContain("/en/personality/intj-a");

  await page.goto("/en/personality/intj");
  await expect(page).toHaveURL(/\/en\/personality\/intj-a$/);
});

test("legacy slug redirect: /types/[code] points straight to the default public variant", async ({ page, request }) => {
  const response = await request.get("/en/types/intj", { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toContain("/en/personality/intj-a");

  await page.goto("/en/types/intj");
  await expect(page).toHaveURL(/\/en\/personality\/intj-a$/);
});

test("legacy slug redirect: /tests alias take is single-hop 308", async ({ page, request }) => {
  const response = await request.get("/en/tests/sds-20/take", { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toContain("/en/tests/depression-screening-test-standard-edition/take");

  await page.goto("/en/tests/sds-20/take");
  await expect(page).toHaveURL(/\/en\/tests\/depression-screening-test-standard-edition\/take$/);
});

test("legacy slug redirect: /test alias detail respects mode", async ({ page, request }) => {
  await expectLegacyBehavior(
    "/en/test/mbti-test",
    "/en/tests/mbti-personality-test-16-personality-types",
    request,
    page
  );
});

test("legacy slug redirect: /test alias take respects mode", async ({ page, request }) => {
  await expectLegacyBehavior(
    "/en/test/mbti-test/take",
    "/en/tests/mbti-personality-test-16-personality-types/take",
    request,
    page
  );
});

test("legacy slug redirect: /test alias take query params are preserved", async ({ page, request }) => {
  const path = "/en/test/mbti-test/take?utm=a";
  const canonical = "/en/tests/mbti-personality-test-16-personality-types/take?utm=a";

  if (LEGACY_MODE === "gone") {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status()).toBe(410);
    const pageResponse = await page.goto(path);
    expect(pageResponse?.status()).toBe(410);
    return;
  }

  const response = await request.get(path, { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toContain(canonical);

  await page.goto(path);
  await expect(page).toHaveURL(/\/en\/tests\/mbti-personality-test-16-personality-types\/take\?utm=a$/);
});

test("legacy slug redirect: /test index query params are preserved", async ({ page, request }) => {
  const path = "/en/test?utm=a";

  if (LEGACY_MODE === "gone") {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status()).toBe(410);
    const pageResponse = await page.goto(path);
    expect(pageResponse?.status()).toBe(410);
    return;
  }

  const response = await request.get(path, { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toContain("/en/tests?utm=a");

  await page.goto(path);
  await expect(page).toHaveURL(/\/en\/tests\?utm=a$/);
});

test("legacy slug redirect: root /quiz index is explicit by mode", async ({ page, request }) => {
  const path = "/quiz?utm=a";

  if (LEGACY_MODE === "gone") {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status()).toBe(404);
    const pageResponse = await page.goto(path);
    expect(pageResponse?.status()).toBe(404);
    return;
  }

  const response = await request.get(path, { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toContain("/en/tests?utm=a");

  await page.goto(path);
  await expect(page).toHaveURL(/\/en\/tests\?utm=a$/);
});

test("legacy slug redirect: root /quiz slug preserves query before locale redirect", async ({ page, request }) => {
  const path = "/quiz/mbti-test?utm=a";

  if (LEGACY_MODE === "gone") {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status()).toBe(410);
    const pageResponse = await page.goto(path);
    expect(pageResponse?.status()).toBe(410);
    return;
  }

  const response = await request.get(path, { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toContain("/en/quiz/mbti-test?utm=a");

  await page.goto(path);
  await expect(page).toHaveURL(/\/en\/tests\/mbti-personality-test-16-personality-types\/take\?utm=a$/);
});

test("legacy slug redirect: /quiz alias take respects mode and preserves query", async ({ page, request }) => {
  const path = "/en/quiz/mbti-test?utm=a";

  if (LEGACY_MODE === "gone") {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status()).toBe(410);
    const pageResponse = await page.goto(path);
    expect(pageResponse?.status()).toBe(410);
    return;
  }

  const response = await request.get(path, { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toContain(
    "/en/tests/mbti-personality-test-16-personality-types/take?utm=a"
  );

  await page.goto(path);
  await expect(page).toHaveURL(/\/en\/tests\/mbti-personality-test-16-personality-types\/take\?utm=a$/);
});
