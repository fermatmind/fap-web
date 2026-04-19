import { beforeEach, describe, expect, it, vi } from "vitest";

describe("tests hub empty catalog contract", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("keeps the tests hub renderable when the API catalog has no test rows", async () => {
    vi.doMock("@/lib/cms/landing-surfaces", async () => {
      const fixture = await import("./fixtures/cmsLandingSurfaceMock");

      return {
        getCmsLandingSurface: vi.fn(fixture.getMockCmsLandingSurface),
      };
    });

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ items: [] }), { status: 200 }))
    );

    const { getTestsHubContent, listAllContentTestsHubCards, listVisibleTestsHubCards } = await import(
      "@/lib/marketing/testsHubContent"
    );

    await expect(getTestsHubContent("zh")).resolves.toMatchObject({
      seo: {
        title: "测评入口中心",
      },
    });
    await expect(listVisibleTestsHubCards("zh")).resolves.toEqual([
      expect.objectContaining({
        key: "mbti-personality-test-16-personality-types",
      }),
      expect.objectContaining({
        key: "big-five-personality-test-ocean-model",
      }),
      expect.objectContaining({
        key: "enneagram-personality-test",
      }),
      expect.objectContaining({
        key: "eq-test-emotional-intelligence-assessment",
      }),
      expect.objectContaining({
        key: "iq-test-intelligence-quotient-assessment",
      }),
      expect.objectContaining({
        key: "career-riasec",
      }),
    ]);

    const allCards = await listAllContentTestsHubCards("zh");
    expect(allCards.map((card) => card.key)).toEqual([
      "mbti-personality-test-16-personality-types",
      "big-five-personality-test-ocean-model",
      "enneagram-personality-test",
      "eq-test-emotional-intelligence-assessment",
      "iq-test-intelligence-quotient-assessment",
      "career-riasec",
    ]);
  });
});
