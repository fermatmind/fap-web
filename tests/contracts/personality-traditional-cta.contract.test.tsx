import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import PersonalityPage from "@/app/(localized)/[locale]/personality/page";
import { TraditionalMbtiCurrentReader } from "@/components/personality/TraditionalMbtiCurrentReader";
import { getTraditionalPublicAssetRoute, isTraditionalMbtiDetailPath } from "@/lib/personality/traditionalPublicAssetRoutes";

vi.mock("@/lib/cms/personality", async (original) => ({
  ...await original<typeof import("@/lib/cms/personality")>(),
  listPersonalityProfiles: async () => ({
    seoMeta: { title: "人格總覽", description: "驗收樣本" },
    landingSurface: { summaryBlocks: [] },
    items: [{
      typeCode: "INFJ", baseTypeCode: "INFJ", runtimeTypeCode: "INFJ", publicRouteSlug: "infj",
      publicRouteType: "16-type", slug: "infj", baseSlug: "infj", title: "INFJ",
      isPublic: true, isIndexable: true, status: "published",
    }],
    sections: [],
  }),
  listPersonalityComparisons: async () => ({ groups: [{ key: "fixture", title: "對照", items: [] }] }),
}));

const destination = "/zh-TW/tests/mbti-personality-test-16-personality-types";
function expectTraditionalCta(markup: string) {
  const doc = new DOMParser().parseFromString(markup, "text/html");
  const buttons = [...doc.querySelectorAll("a")].filter((link) => link.textContent?.includes("開始免費 MBTI 測驗"));
  expect(buttons).toHaveLength(1);
  expect(buttons[0].textContent?.trim()).toBe("開始免費 MBTI 測驗");
  expect(buttons[0].getAttribute("href")).toBe(destination);
  expect(buttons[0].getAttribute("lang")).toBe("zh-TW");
}

describe("Traditional MBTI personality reading CTA", () => {
  it.each([
    ["base profile", "infj", "mbti_public_projection_v1"],
    ["A/T variant", "infj-a", "mbti_public_projection_v1"],
    ["A/T comparison", "infj-a-vs-infj-t", "comparison_public_projection_v1"],
    ["cross-type comparison", "infj-vs-infp", "comparison_public_projection_v1"],
  ] as const)("links the %s to its same-language test", (_kind, slug, authority) => {
    const canonical = "/zh-TW/personality/" + slug;
    expect(isTraditionalMbtiDetailPath(canonical)).toBe(true);
    const reader: Parameters<typeof TraditionalMbtiCurrentReader>[0]["reader"] = {
      canonical, authority, title: "人格結果", summary: "", image: null, indexEligible: false,
      traditionalLanguageAlternates: undefined,
      metadata: {
        title: "人格結果", description: "固定摘要",
        openGraph: { title: "人格結果", description: "固定摘要", locale: "zh_TW" },
      },
      sections: [],
    };
    expectTraditionalCta(renderToStaticMarkup(<TraditionalMbtiCurrentReader reader={reader} />));
  });

  it("links the Traditional personality hub to the same canonical test", async () => {
    const tree = await PersonalityPage({ params: Promise.resolve({ locale: "zh-TW" }) });
    expectTraditionalCta(renderToStaticMarkup(tree));
  });

  it.each([
    "/zh-TW/personality/big-five/openness-mid",
    "/zh-TW/personality/enneagram/wings/9w8",
  ])("keeps %s on its independent renderer", (path) => {
    expect(isTraditionalMbtiDetailPath(path)).toBe(false);
    expect(getTraditionalPublicAssetRoute(path)).toBeDefined();
  });
});
