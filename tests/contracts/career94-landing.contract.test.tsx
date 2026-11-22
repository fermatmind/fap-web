import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FreeAssessmentLanding, freeAssessmentMetadata } from "@/components/tests/FreeAssessmentLanding";
import { isValidElement, type ReactElement } from "react";
import type { Entry } from "@/components/tests/trio/TrioLandingInteractions";
import { trackEvent } from "@/lib/analytics";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

describe("Career94 landing page", () => {
  it("keeps the mainland entry routes, click attribution and visible FAQ consistent with structured data", () => {
    const locale = "zh";
    const { container } = render(<FreeAssessmentLanding assessment="career" locale={locale} />);
    const takeLocale = locale;
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
    expect(sampleLinks).toHaveLength(1);
    const structuredFaq = JSON.parse(container.querySelector<HTMLScriptElement>("#free-assessment-faq")!.textContent!);
    const visibleFaq = Array.from(container.querySelectorAll("#assessment-faq details"));
    expect(visibleFaq).toHaveLength(7);
    expect(container.querySelectorAll("#assessment-faq details[open]")).toHaveLength(7);
    expect(structuredFaq.mainEntity).toHaveLength(visibleFaq.length);
    structuredFaq.mainEntity.forEach((entry: { name: string; acceptedAnswer: { text: string } }, index: number) => {
      expect(visibleFaq[index].querySelector("summary")).toHaveTextContent(entry.name);
      expect(visibleFaq[index].querySelector("p")).toHaveTextContent(entry.acceptedAnswer.text);
    });
    const hero = container.querySelector("[data-career-hero]")!;
    expect(hero.textContent).not.toMatch(/付费|付費|解锁|解鎖|paid|unlock/i);
    expect(hero.querySelectorAll("[data-career-radar]")).toHaveLength(1);
    expect([...hero.querySelectorAll("li[data-code]")].map(row => row.getAttribute("data-code"))).toEqual(["R", "I", "A", "S", "E", "C"]);
    expect([...hero.querySelectorAll("li[data-code] b")].map(row => Number(row.textContent))).toEqual([75, 100, 50, 25, 25, 50]);
    expect(container.querySelectorAll("#career-directions article a[href*='/career/jobs/']")).toHaveLength(9);
    expect(container.querySelector("main")).toHaveTextContent("P = round(25 × (S/n − 1), 4)");
    for (const question of [
      "免费职业测试哪个最准？94题全景版适合什么人？",
      "高考选专业或大学生转专业，怎么做职业测试更有用？",
      "工作几年想跨行转岗，职业测试能帮我避开哪些坑？",
    ]) expect(screen.getByText(question)).toBeVisible();
    expect(screen.getAllByText("国内岗位举例")).toHaveLength(6);
    expect(screen.getByRole("heading", { name: "题本结构、信度与常模" })).toBeVisible();

  });

  it("preserves canonical and cross-language metadata", () => {
    expect(freeAssessmentMetadata("career", "zh").title).toEqual({ absolute: "免费职业测试（94题完整版）：职业规划、工作方式与职业条件评估｜FermatMind" });
    for (const locale of ["zh", "en", "zh-TW"] as const) {
      const metadata = freeAssessmentMetadata("career", locale);
      expect(metadata.alternates?.canonical).toContain(`/${locale}/career/assessment`);
      expect(metadata.alternates?.languages).toMatchObject({ en: expect.stringContaining("/en/career/assessment"), "zh-CN": expect.stringContaining("/zh/career/assessment") });
    }
  });

  it.each(["en", "zh-TW"] as const)("keeps the correct Career94 and sole Jung form in %s", locale => {
    const takeLocale = locale === "zh-TW" ? "zh" : locale;
    for (const [assessment, expected] of [
      ["career", "/career/assessment/take"],
      ["jung", "/tests/jung-archetypes/take"],
    ] as const) {
      const landing = FreeAssessmentLanding({assessment, locale});
      const child: unknown = landing.props.children;
      expect(isValidElement(child)).toBe(true);
      const {entries, entryNote} = (child as ReactElement<{entries: Entry[]; entryNote?: string}>).props;
      expect(entries.map(entry => entry.href)).toEqual([`/${takeLocale}${expected}`]);
      if (locale === "zh-TW") expect(entryNote).toContain("簡體中文");
    }
  });
});
