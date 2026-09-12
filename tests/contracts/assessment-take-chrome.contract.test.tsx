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
    expect(screen.queryByText("Full navigation")).not.toBeInTheDocument();
    expect(screen.queryByText("Full footer")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: locale === "zh" ? "返回测评介绍" : "Back to assessment" })).toHaveAttribute("href", `/${locale}/tests/${slug}`);
    expect(screen.getByRole("link", { name: locale === "zh" ? "测评科学" : "Assessment science" })).toHaveAttribute("href", `/${locale}/science`);
    expect(screen.getByRole("link", { name: locale === "zh" ? "隐私保护" : "Privacy" })).toHaveAttribute("href", `/${locale}/privacy`);
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
