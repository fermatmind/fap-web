import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AssessmentSiteFrame } from "@/components/quiz/AssessmentSiteFrame";

const route = vi.hoisted(() => ({ pathname: "/zh" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));

describe("Assessment take chrome", () => {
  const slugs = ["mbti-personality-test-16-personality-types", "big-five-personality-test-ocean-model", "enneagram-personality-test-nine-types", "holland-career-interest-test-riasec", "eq-test-emotional-intelligence-assessment"];
  it.each(slugs.flatMap((slug) => (["zh", "en"] as const).map((locale) => ({ slug, locale }))))("keeps localized exit and trust links for $locale/$slug", ({ locale, slug }) => {
    route.pathname = `/${locale}/tests/${slug}/take`;
    render(
      <AssessmentSiteFrame locale={locale} header={<nav>Full navigation</nav>} footer={<footer>Full footer</footer>}>
        <main>Assessment content</main>
      </AssessmentSiteFrame>
    );
    expect(screen.getByRole("main")).toHaveTextContent("Assessment content");
    expect(screen.getByText("Full navigation")).toBeInTheDocument();
    expect(screen.queryByText("Full footer")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: locale === "zh" ? "返回测评介绍" : "Back to assessment" })).toHaveAttribute("href", `/${locale}/tests/${slug}`);
    expect(screen.getByRole("link", { name: locale === "zh" ? "测评科学" : "Assessment science" })).toHaveAttribute("href", `/${locale}/science`);
    expect(screen.getByRole("link", { name: locale === "zh" ? "隐私保护" : "Privacy" })).toHaveAttribute("href", `/${locale}/privacy`);
  });

  it.each(["tests/mbti-personality-test-16-personality-types", "tests/explore/chiikawa", "tests/play/friendship-quiz"])("uses shared navigation and a Taiwan return link for %s", (path) => {
    route.pathname = `/zh-TW/${path}/take`;
    render(<AssessmentSiteFrame locale="zh-TW" header={<nav>Full navigation</nav>} footer={<footer>Full footer</footer>}><main>題目</main></AssessmentSiteFrame>);
    expect(screen.getByText("Full navigation")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "返回測驗介紹" })).toHaveAttribute("href", `/zh-TW/${path}`);
    expect(screen.getByRole("link", { name: "隱私保護" })).toHaveAttribute("href", "/zh-TW/privacy");
  });

  it.each(["jung-archetypes", "jung-cognitive-functions"])("uses the shared Jung landing for %s", (slug) => {
    route.pathname = `/zh/tests/${slug}/take`;
    render(<AssessmentSiteFrame locale="zh" header={null} footer={<footer>Full footer</footer>}><main>题目</main></AssessmentSiteFrame>);
    expect(screen.getByRole("link", { name: "返回测评介绍" })).toHaveAttribute("href", "/zh/tests/jung-test");
    expect(screen.queryByText("Full footer")).not.toBeInTheDocument();
  });

  it("gives the 94-question career test the focused frame without an exit row", () => {
    route.pathname = "/zh/career/assessment/take";
    render(<AssessmentSiteFrame locale="zh" header={null} footer={<footer>Full footer</footer>}><main>题目</main></AssessmentSiteFrame>);
    expect(screen.getByRole("link", { name: "测评科学" })).toHaveAttribute("href", "/zh/science");
    expect(screen.queryByRole("link", { name: "返回测评介绍" })).not.toBeInTheDocument();
    expect(screen.queryByText("Full footer")).not.toBeInTheDocument();
  });

  it.each([
    "/zh/tests/mbti-personality-test-16-personality-types",
    "/zh/tests/iq-test-intelligence-quotient-assessment/take",
    "/en/tests/eq-sjt-scenario-emotional-judgment-test/take",
    "/zh/articles",
  ])("preserves the regular site chrome at %s", (pathname) => {
    route.pathname = pathname;
    render(
      <AssessmentSiteFrame locale="zh" header={<nav>Full navigation</nav>} footer={<footer>Full footer</footer>}>
        <main>Page content</main>
      </AssessmentSiteFrame>
    );
    expect(screen.getByText("Full navigation")).toBeInTheDocument();
    expect(screen.getByText("Full footer")).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("Page content");
  });
});
