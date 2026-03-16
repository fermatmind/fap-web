import { expect, test } from "@playwright/test";

test("public seo pages keep canonical and og metadata without private noindex pollution", async ({ request }) => {
  for (const pathname of [
    "/en/topics",
    "/en/help/faq",
    "/en/career/recommendations/mbti/INTJ",
  ]) {
    const response = await request.get(pathname);
    expect(response.ok(), pathname).toBeTruthy();
    const html = await response.text();
    const robotsTag = (response.headers()["x-robots-tag"] || "").toLowerCase();

    expect(html, pathname).toContain('rel="canonical"');
    expect(html, pathname).toContain('property="og:title"');
    expect(html, pathname).toContain('name="twitter:card"');
    expect(robotsTag, pathname).not.toContain("noindex");
  }
});

test("OG route returns an image response", async ({ request }) => {
  const response = await request.get("/og/big-five-personality-test-ocean-model");
  expect(response.ok()).toBeTruthy();
  const contentType = response.headers()["content-type"] || "";
  expect(contentType.includes("image/")).toBeTruthy();
});

test("OG route keeps stable 404 behavior for invalid slug", async ({ request }) => {
  const response = await request.get("/og/not-a-real-test-slug");
  expect(response.status()).toBe(404);
});

test("OG route handles malformed score params without crashing", async ({ request }) => {
  const malformed = await request.get("/og/big-five-personality-test-ocean-model?score=__bad_value__");
  expect(malformed.ok()).toBeTruthy();

  const overflow = await request.get("/og/big-five-personality-test-ocean-model?score=999999");
  expect(overflow.ok()).toBeTruthy();

  const contentType = overflow.headers()["content-type"] || "";
  expect(contentType.includes("image/")).toBeTruthy();
});

test("share and compare OG routes return images", async ({ request }) => {
  const shareResponse = await request.get("/og/share/seo-share-001");
  expect(shareResponse.ok()).toBeTruthy();
  expect((shareResponse.headers()["content-type"] || "").includes("image/")).toBeTruthy();

  const compareResponse = await request.get("/og/compare/mbti/seo-invite-001");
  expect(compareResponse.ok()).toBeTruthy();
  expect((compareResponse.headers()["content-type"] || "").includes("image/")).toBeTruthy();
});

test("share and compare pages stay noindex while exposing route-specific og:image tags", async ({ request }) => {
  const shareId = "seo-share-001";
  const inviteId = "seo-invite-001";

  const sharePage = await request.get(`/en/share/${shareId}`);
  expect(sharePage.ok()).toBeTruthy();
  const shareHtml = await sharePage.text();
  expect(shareHtml.toLowerCase()).toContain("noindex");
  expect(shareHtml).toContain('property="og:image"');
  expect(shareHtml).toContain('name="twitter:image"');
  expect(shareHtml).toContain(`/og/share/${shareId}`);

  const comparePage = await request.get(`/en/compare/mbti/${inviteId}`);
  expect(comparePage.ok()).toBeTruthy();
  const compareHtml = await comparePage.text();
  expect(compareHtml.toLowerCase()).toContain("noindex");
  expect(compareHtml).toContain('property="og:image"');
  expect(compareHtml).toContain('name="twitter:image"');
  expect(compareHtml).toContain(`/og/compare/mbti/${inviteId}`);
});
