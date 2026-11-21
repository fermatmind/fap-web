import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MbtiCloneIdeaListBlock } from "@/components/result/mbti/clone/MbtiCloneIdeaListBlock";

describe("MBTI career exploration links", () => {
  it.each(["zh", "en"] as const)("opens the native career detail route in %s", locale => {
    render(<MbtiCloneIdeaListBlock locale={locale} testId="career-ideas" data={{
      title: "Career ideas", items: [{ title: "Registered nurses", description: "Explore nursing tasks.", careerSlug: "registered-nurses" }],
    }} />);
    expect(screen.getByRole("link", { name: "Registered nurses" })).toHaveAttribute("href", `/${locale}/career/jobs/registered-nurses`);
  });

  it("keeps ordinary work styles and invalid career identities as plain text", () => {
    render(<MbtiCloneIdeaListBlock testId="work-styles" data={{ title: "Work styles", items: [
      { title: "Clear responsibilities", description: "Understand your role." },
      { title: "Invalid career", description: "Do not navigate.", careerSlug: "https://example.com" },
      { title: "Traversal", description: "Do not navigate.", careerSlug: "../registered-nurses" },
    ] }} />);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    expect(screen.getByText("Clear responsibilities")).toBeVisible();
  });
});
