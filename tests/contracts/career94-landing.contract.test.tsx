import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FreeAssessmentLanding, freeAssessmentMetadata } from "@/components/tests/FreeAssessmentLanding";
import { trackEvent } from "@/lib/analytics";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

describe("Career94 landing page", () => {
  it.each(["zh", "en", "zh-TW"] as const)("keeps %s entry routes, click attribution and visible FAQ consistent with structured data", locale => {
    const { container } = render(<FreeAssessmentLanding assessment="career" locale={locale} />);
    const takeLocale = locale === "zh-TW" ? "zh" : locale;
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    const start = screen.getByTestId("free-assessment-start");
    const closing = screen.getByTestId("free-assessment-start-closing");
    for (const entry of [start, closing]) {
      expect(entry).toHaveAttribute("href", `/${takeLocale}/career/assessment/take`);
      entry.addEventListener("click", event => event.preventDefault());
      fireEvent.click(entry);
      expect(trackEvent).toHaveBeenLastCalledWith("start_click", {});
    }
    const sampleLinks = Array.from(container.querySelectorAll<HTMLAnchorElement>(`main a[href="/${takeLocale}/career/assessment/sample"]`));
    expect(sampleLinks).toHaveLength(2);
    expect(container.querySelector("#career94-free-report")).toBeNull();
    const structuredFaq = JSON.parse(container.querySelector<HTMLScriptElement>("#free-assessment-faq")!.textContent!);
    const visibleFaq = Array.from(container.querySelectorAll("#assessment-faq details"));
    expect(visibleFaq).toHaveLength(structuredFaq.mainEntity.length);
    structuredFaq.mainEntity.forEach((entry: { name: string; acceptedAnswer: { text: string } }, index: number) => {
      expect(visibleFaq[index].querySelector("summary")).toHaveTextContent(entry.name);
      expect(visibleFaq[index].querySelector("p")).toHaveTextContent(entry.acceptedAnswer.text);
    });
    const expectedQuestions = locale === "en" ? ["How can this career test help me?", "Is the career test free?", "How does this differ from the Holland Code test?"]
      : locale === "zh-TW" ? ["完成這份職涯測驗，能幫助我什麼？", "測驗與分數免費嗎？", "職涯測驗與霍蘭德測驗有何不同？"]
        : ["做完这份职业测试，能帮我什么？", "测试和分数免费吗？", "职业测试和霍兰德测试有什么区别？"];
    expect(visibleFaq.slice(0, 3).map(item => item.querySelector("summary")?.textContent)).toEqual(expectedQuestions);
    const mainText = container.querySelector("main")!.textContent!;
    expect(mainText.indexOf(locale === "en" ? "Where are you getting stuck" : locale === "zh-TW" ? "你現在，卡在哪一步" : "你现在，卡在哪一步")).toBeLessThan(mainText.indexOf(locale === "en" ? "WHAT IS BEHIND THE QUESTIONS" : locale === "zh-TW" ? "方法與依據" : "方法与依据"));
    if (locale === "en") {
      expect(mainText).not.toMatch(/work[ -]values?/i);
      expect(screen.getByText("Working conditions · 24 items")).toBeVisible();
      expect(mainText).toContain("not a test of cognitive ability or technical skills");
    }
    if (locale === "zh-TW") {
      expect(screen.getByText("目前作答使用簡體中文題本。")).toBeVisible();
      sampleLinks.forEach(link => expect(link).toHaveTextContent("簡體中文"));
      for (const path of ["/career", "/career/tests", "/tests/holland-career-interest-test-riasec", "/method-boundaries", "/item-design-notes"]) {
        expect(container.querySelector(`main a[href="/zh-TW${path}"]`)).not.toBeNull();
      }
    }
  });

  it("preserves canonical and cross-language metadata", () => {
    for (const locale of ["zh", "en", "zh-TW"] as const) {
      const metadata = freeAssessmentMetadata("career", locale);
      expect(metadata.alternates?.canonical).toContain(`/${locale}/career/assessment`);
      expect(metadata.alternates?.languages).toMatchObject({ en: expect.stringContaining("/en/career/assessment"), "zh-CN": expect.stringContaining("/zh/career/assessment") });
    }
  });

  it("offers only the twelve-archetype questionnaire on the Jung landing", () => {
    render(<FreeAssessmentLanding assessment="jung" locale="en" />);
    expect(screen.getByTestId("free-assessment-start-archetypes")).toHaveAttribute("href", "/en/tests/jung-archetypes/take");
    expect(screen.queryByTestId("free-assessment-start-functions")).not.toBeInTheDocument();
    expect(screen.queryByText(/8 Cognitive Functions/)).not.toBeInTheDocument();
    expect(screen.queryByTestId("free-assessment-start-closing")).not.toBeInTheDocument();
  });
});
