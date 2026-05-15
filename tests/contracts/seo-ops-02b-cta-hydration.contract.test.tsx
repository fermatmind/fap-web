import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SeoTrackedCtaLink } from "@/components/cta/SeoTrackedCtaLink";

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
    window.localStorage.clear();
    hoisted.search = "";
    hoisted.pathname = "/zh/articles/holland-career-interest-test-can-and-cannot-tell-you";
  });

  it("hydrates article CTA href from stored safe UTM when App Router search params are empty", async () => {
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
    await waitFor(() => {
      expect(link.getAttribute("href")).toContain("utm_source=codex_qa");
    });

    const href = link.getAttribute("href") ?? "";
    expect(href).toContain("utm_medium=controlled_pilot");
    expect(href).toContain("utm_campaign=postdeploy_verify");
    expect(href).toContain("utm_content=holland-career-interest-test-can-and-cannot-tell-you");
    expect(href).toContain("source_page_type=article_detail");
    expect(href).toContain("target_test_slug=holland-career-interest-test-riasec");
    expect(href).not.toContain("email=");
  });
});
