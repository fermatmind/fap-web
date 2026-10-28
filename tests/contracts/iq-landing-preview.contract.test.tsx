import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { axe } from "jest-axe";
import { IqLandingPreview } from "@/components/tests/IqLandingPreview";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("IQ pre-test product preview", () => {
  it.each(["en", "zh"] as const)("lets %s visitors check the rule without creating a scored attempt", (locale) => {
    const fetch = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("A teaching example must not request an attempt"));
    render(<IqLandingPreview locale={locale} scoringHref="#iq-section-3" limitsHref="#iq-section-5" />);
    const choices = screen.getAllByRole("radio");
    const metrics = screen.getByTestId("iq-synthetic-result-metrics").textContent;
    expect(choices).toHaveLength(4);
    fireEvent.click(choices[0]);
    expect(screen.getByRole("status")).toHaveTextContent(locale === "en" ? "Check the counts again" : "再检查数量");
    fireEvent.click(choices[1]);
    expect(screen.getByRole("status")).toHaveTextContent(locale === "en" ? "B fits the stated rule" : "B符合给定规则");
    expect(screen.getByTestId("iq-synthetic-result-metrics").textContent).toBe(metrics);
    expect(fetch).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: /start|submit|开始|提交/i })).not.toBeInTheDocument();
  });

  it.each(["en", "zh"] as const)("separates %s synthetic score, model reference and item accuracy", (locale) => {
    const { container } = render(<IqLandingPreview locale={locale} />);
    const metrics = within(screen.getByTestId("iq-synthetic-result-metrics"));
    for (const value of ["8/30", "26.7%", "106", "65.54%"]) expect(metrics.getByText(value)).toBeInTheDocument();
    expect(container.textContent).toContain(locale === "en" ? "not your result or a real user's report" : "不是你的成绩，也不来自真实用户");
    expect(container.textContent).toContain(locale === "en" ? "not population rankings, formal IQ or Mensa eligibility" : "不是人口排名、正式IQ或门萨资格");
    expect(container.textContent).toContain("TXT");
    expect(container.textContent).toContain("Markdown");
    if (locale === "en") expect(container.textContent).not.toMatch(/\p{Script=Han}/u);
  });

  it("keeps instructions, diagrams, explanation and result numbers in server HTML without JavaScript", () => {
    const html = renderToStaticMarkup(<IqLandingPreview locale="en" scoringHref="#iq-section-3" limitsHref="#iq-section-5" />);
    expect(html).toContain("Row one: one, two, three hollow circles");
    expect(html).toContain("B&#x27;s three filled squares complete row two");
    expect(html).toContain("<details");
    expect(html).toContain("8/30");
    expect(html).toContain("65.54%");
    expect(html).toContain('href="#iq-section-3"');
    expect(html).toContain('href="#iq-section-5"');
    expect(html).toContain('href="#choose-version"');
  });

  it("omits method shortcuts when authoritative editorial targets are unavailable", () => {
    render(<IqLandingPreview locale="en" />);
    expect(screen.queryByRole("link", { name: "How scoring works" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Uses and limits" })).not.toBeInTheDocument();
  });

  it.each(["en", "zh"] as const)("has labeled %s radio controls and an accessible diagram", async (locale) => {
    const { container } = render(<IqLandingPreview locale={locale} />);
    expect(screen.getByRole("img")).toHaveAccessibleName();
    for (const radio of screen.getAllByRole("radio")) expect(radio).toHaveAccessibleName();
    const result = await axe(container);
    expect(result.violations).toEqual([]);
  });
});
