import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { resolveAssessmentLandingSocialImage } from "@/lib/tests/assessmentLandingUi";

const mocks = vi.hoisted(() => ({ asset: vi.fn(), images: vi.fn() }));
vi.mock("@/lib/cms/personalityPublicAssetLoader", () => ({ getBigFivePublicContentAsset: mocks.asset }));
vi.mock("next/og", () => ({
  ImageResponse: class {
    constructor(element: ReactNode, options: unknown) { mocks.images(renderToStaticMarkup(element), options); }
  },
}));
import { GET } from "@/app/og/page/[page]/route";
import { generateMetadata } from "@/app/(localized)/[locale]/personality/big-five/[...slug]/page";

describe("public page social image selection", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.asset.mockResolvedValue({
    isPublic: true, title: "尽责性：组织与实际完成",
    seo: { title: "尽责性", description: "理解倾向" },
    robots: "index,follow", indexEligible: true,
    canonicalPath: "/zh/personality/big-five/conscientiousness",
    hreflang: {},
  }); });
  it.each(["zh", "en"] as const)("replaces only Holland's legacy MBTI image (%s)", (locale) => {
    const expected = `/og/page/holland-career-interest-test-riasec?locale=${locale}`;
    expect(resolveAssessmentLandingSocialImage("holland-career-interest-test-riasec", locale, "")).toBe(expected);
    expect(resolveAssessmentLandingSocialImage("holland-career-interest-test-riasec", locale, "https://api.fermatmind.com/static/share/mbti_square_600x600.png")).toBe(expected);
    expect(resolveAssessmentLandingSocialImage("holland-career-interest-test-riasec", locale, "https://assets.fermatmind.com/reviewed.jpg")).toBe("https://assets.fermatmind.com/reviewed.jpg");
    expect(resolveAssessmentLandingSocialImage("another-test", locale, "")).toBe("");
  });
  it("keeps the personality page text-only with a summary card and preserves canonical and robots", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://fermatmind.com";
    const metadata = await generateMetadata({ params: Promise.resolve({locale: "zh", slug: ["conscientiousness"]}) });
    expect(metadata.openGraph?.images).toBeUndefined();
    expect(metadata.twitter).toMatchObject({card: "summary"});
    expect(metadata.twitter?.images).toEqual(metadata.openGraph?.images);
    expect(metadata.alternates?.canonical).toBe("https://fermatmind.com/zh/personality/big-five/conscientiousness");
    expect(metadata.robots).toMatchObject({index: true, follow: true});
  });
  it.each(["holland-career-interest-test-riasec"])("renders a 1200×630 title card without score or MBTI claims (%s)", async (page) => {
    await GET(new Request("https://fermatmind.com/og/page/" + page + "?locale=zh&score=99"), {params: Promise.resolve({page})});
    const [html, options] = mocks.images.mock.calls[0];
    expect(options).toMatchObject({width: 1200, height: 630});
    expect(html).not.toMatch(/Score|99\/100|MBTI|官方|24题|93题|144题/);
    expect(html).toContain("霍兰德");
  });
  it("fails closed for unknown pages and does not enable personality media", async () => {
    expect((await GET(new Request("https://fermatmind.com"), {params: Promise.resolve({page: "unknown"})})).status).toBe(404);
    mocks.asset.mockResolvedValue(null);
    expect((await GET(new Request("https://fermatmind.com"), {params: Promise.resolve({page: "big-five-conscientiousness"})})).status).toBe(404);
    expect(mocks.images).not.toHaveBeenCalled();
  });
});
