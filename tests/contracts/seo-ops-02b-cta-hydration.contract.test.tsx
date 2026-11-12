import { trackEvent } from "@/lib/analytics";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SeoTrackedCtaLink } from "@/components/cta/SeoTrackedCtaLink";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

const hoisted = vi.hoisted(() => ({
  pathname: "/zh/articles/holland-career-interest-test-can-and-cannot-tell-you",
  search: "",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => hoisted.pathname,
  useSearchParams: () => new URLSearchParams(hoisted.search),
}));

describe("SEO-OPS-02B CTA hydration attribution contract", () => {
  beforeEach(() => {
    vi.mocked(trackEvent).mockClear();
    window.localStorage.clear();
    hoisted.search = "";
    hoisted.pathname = "/zh/articles/holland-career-interest-test-can-and-cannot-tell-you";
  });

  it("tracks article CTA attribution from stored safe UTM when App Router search params are empty", () => {
    window.localStorage.setItem(
      "fm_attribution_v1",
      JSON.stringify({
        first_touch: {
          utm_source: "codex_qa",
          utm_medium: "controlled_pilot",
          utm_campaign: "postdeploy_verify",
          utm_content: "holland-career-interest-test-can-and-cannot-tell-you",
          landing_path:
            "/zh/articles/holland-career-interest-test-can-and-cannot-tell-you?utm_source=codex_qa&utm_medium=controlled_pilot&utm_campaign=postdeploy_verify&utm_content=holland-career-interest-test-can-and-cannot-tell-you",
          current_path:
            "/zh/articles/holland-career-interest-test-can-and-cannot-tell-you?utm_source=codex_qa&utm_medium=controlled_pilot&utm_campaign=postdeploy_verify&utm_content=holland-career-interest-test-can-and-cannot-tell-you",
          captured_at: "2026-05-16T00:00:00.000Z",
        },
        last_touch: {
          utm_source: "codex_qa",
          utm_medium: "controlled_pilot",
          utm_campaign: "postdeploy_verify",
          utm_content: "holland-career-interest-test-can-and-cannot-tell-you",
          landing_path:
            "/zh/articles/holland-career-interest-test-can-and-cannot-tell-you?utm_source=codex_qa&utm_medium=controlled_pilot&utm_campaign=postdeploy_verify&utm_content=holland-career-interest-test-can-and-cannot-tell-you",
          current_path:
            "/zh/articles/holland-career-interest-test-can-and-cannot-tell-you?utm_source=codex_qa&utm_medium=controlled_pilot&utm_campaign=postdeploy_verify&utm_content=holland-career-interest-test-can-and-cannot-tell-you",
          captured_at: "2026-05-16T00:00:00.000Z",
        },
        updated_at: "2026-05-16T00:00:00.000Z",
      })
    );

    render(
      <SeoTrackedCtaLink
        href="/zh/tests/holland-career-interest-test-riasec"
        sourceRouteFamily="article_detail"
        sourceSlug="holland-career-interest-test-can-and-cannot-tell-you"
        sourcePath="/zh/articles/holland-career-interest-test-can-and-cannot-tell-you"
        contentId={88}
        ctaId="riasec_article_primary"
        targetTestSlug="holland-career-interest-test-riasec"
        locale="zh"
      >
        FermatMind 霍兰德职业兴趣测试
      </SeoTrackedCtaLink>
    );

    const link = screen.getByRole("link", { name: "FermatMind 霍兰德职业兴趣测试" });
    expect(link.getAttribute("href")).toBe("/zh/tests/holland-career-interest-test-riasec");
    link.addEventListener("click", event => event.preventDefault(), { once: true });
    fireEvent.click(link);
    expect(trackEvent).toHaveBeenCalledExactlyOnceWith("article_to_test_click", expect.objectContaining({
      utm_source: "codex_qa",
      utm_medium: "controlled_pilot",
      utm_campaign: "postdeploy_verify",
      utm_content: "holland-career-interest-test-can-and-cannot-tell-you",
      source_page_type: "article_detail",
      target_test_slug: "holland-career-interest-test-riasec",
    }));
    expect(vi.mocked(trackEvent).mock.calls[0]?.[1]).not.toHaveProperty("email");
  });
});
