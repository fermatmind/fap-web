import { expect, test } from "@playwright/test";

test("OG route returns an image response", async ({ request }) => {
  const response = await request.get("/og/big-five-personality-test");
  expect(response.ok()).toBeTruthy();
  const contentType = response.headers()["content-type"] || "";
  expect(contentType.includes("image/")).toBeTruthy();
});

test("OG route keeps stable 404 behavior for invalid slug", async ({ request }) => {
  const response = await request.get("/og/not-a-real-test-slug");
  expect(response.status()).toBe(404);
});

test("OG route handles malformed score params without crashing", async ({ request }) => {
  const malformed = await request.get("/og/big-five-personality-test?score=__bad_value__");
  expect(malformed.ok()).toBeTruthy();

  const overflow = await request.get("/og/big-five-personality-test?score=999999");
  expect(overflow.ok()).toBeTruthy();

  const contentType = overflow.headers()["content-type"] || "";
  expect(contentType.includes("image/")).toBeTruthy();
});
