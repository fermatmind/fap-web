import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { PersonalityProjectionSection } from "@/lib/cms/personality";
import { normalizeProjectionSections, renderProjectionSections } from "@/lib/cms/personality-sections";

function section(overrides: Partial<PersonalityProjectionSection>): PersonalityProjectionSection {
  return {
    key: "overview",
    title: "Overview",
    render: "rich_text",
    bodyMd: "Default body",
    payload: null,
    isEnabled: true,
    source: "base",
    ...overrides,
  };
}

describe("personality projection section renderer contract", () => {
  it("keeps generic canonical keys instead of filtering them through the legacy allowlist", () => {
    const sections = normalizeProjectionSections([
      section({ key: "overview", title: "Overview" }),
      section({ key: "career.summary", title: "Career summary" }),
      section({ key: "growth.summary", title: "Growth summary" }),
      section({ key: "relationships.summary", title: "Relationships summary" }),
    ]);

    expect(sections.map((item) => item.key)).toEqual([
      "overview",
      "career.summary",
      "growth.summary",
      "relationships.summary",
    ]);
  });

  it("renders letters_intro payload with headline and per-letter content", () => {
    render(
      <div>
        {renderProjectionSections(
          [
            section({
              key: "letters_intro",
              title: "Letter-by-letter introduction",
              render: "letters_intro",
              bodyMd: "",
              payload: {
                headline: "How the four letters create the public profile.",
                letters: [
                  { letter: "I", title: "Introversion", description: "Starts with inward pattern synthesis." },
                  { letter: "N", title: "Intuition", description: "Tracks abstractions and future patterns." },
                ],
              },
            }),
          ],
          "zh"
        )}
      </div>
    );

    expect(screen.getByText("How the four letters create the public profile.")).toBeInTheDocument();
    expect(screen.getByText("字母拆解")).toBeInTheDocument();
    expect(screen.getByText("Introversion")).toBeInTheDocument();
    expect(screen.getByText("Tracks abstractions and future patterns.")).toBeInTheDocument();
  });

  it("removes inline letter suffixes for zh letter cards", () => {
    render(
      <div>
        {renderProjectionSections(
          [
            section({
              key: "letters_intro",
              title: "Letter-by-letter introduction",
              render: "letters_intro",
              bodyMd: "",
              payload: {
                headline: "内向 · 直觉 · 思考 · 规划 · 自信型",
                letters: [
                  { letter: "I", title: "内向（I）", description: "向内整理信息。" },
                  { letter: "A", title: "自信型（-A）", description: "更能稳定判断。" },
                ],
              },
            }),
          ],
          "zh"
        )}
      </div>
    );

    expect(screen.getByText("内向")).toBeInTheDocument();
    expect(screen.getByText("自信型")).toBeInTheDocument();
    expect(screen.queryByText("内向（I）")).not.toBeInTheDocument();
    expect(screen.queryByText("自信型（-A）")).not.toBeInTheDocument();
  });

  it("localizes generic zh projection headings", () => {
    render(
      <div>
        {renderProjectionSections(
          [
            section({ key: "overview", title: "Overview", bodyMd: "A compact type overview." }),
            section({ key: "growth.drainers", title: "Growth drainers", bodyMd: "Common energy drains." }),
          ],
          "zh"
        )}
      </div>
    );

    expect(screen.getByText("核心总览")).toBeInTheDocument();
    expect(screen.getByText("能量消耗")).toBeInTheDocument();
    expect(screen.queryByText("Overview")).not.toBeInTheDocument();
    expect(screen.queryByText("Growth drainers")).not.toBeInTheDocument();
  });

  it("renders trait_overview as a canonical dimension grid", () => {
    render(
      <div>
        {renderProjectionSections(
          [
            section({
              key: "trait_overview",
              title: "Trait overview",
              render: "trait_dimension_grid",
              bodyMd: "",
              payload: {
                summary: "Five canonical MBTI dimensions.",
                dimensions: [
                  {
                    id: "SN",
                    name: "Information",
                    axis_left: "Sensing",
                    axis_right: "Intuition",
                    summary: "Leans toward pattern reading.",
                    description: "Builds abstract models before locking details.",
                  },
                ],
              },
            }),
          ],
          "zh"
        )}
      </div>
    );

    expect(screen.getByText("维度总览")).toBeInTheDocument();
    expect(screen.queryByText("Five canonical MBTI dimensions.")).not.toBeInTheDocument();
    expect(screen.getByText("Information")).toBeInTheDocument();
    expect(screen.queryByText("Sensing / Intuition")).not.toBeInTheDocument();
    expect(screen.getByText("Builds abstract models before locking details.")).toBeInTheDocument();
  });

  it("renders career.preferred_roles with grouped examples", () => {
    render(
      <div>
        {renderProjectionSections(
          [
            section({
              key: "career.preferred_roles",
              title: "Preferred roles",
              render: "preferred_role_list",
              bodyMd: "",
              payload: {
                title: "Roles that reward long-cycle strategy.",
                intro: "Look for systems, leverage, and autonomy.",
                groups: [
                  {
                    groupTitle: "Strategic systems roles",
                    description: "High-fit roles when the brief values foresight.",
                    examples: ["Product strategist", "Research lead"],
                  },
                ],
              },
            }),
          ],
          "zh"
        )}
      </div>
    );

    expect(screen.getByText("偏好岗位簇")).toBeInTheDocument();
    expect(screen.getByText("Roles that reward long-cycle strategy.")).toBeInTheDocument();
    expect(screen.getByText("Strategic systems roles")).toBeInTheDocument();
    expect(screen.getByText("Product strategist")).toBeInTheDocument();
    expect(screen.getByText("Research lead")).toBeInTheDocument();
  });

  it("renders premium teaser sections without pretending to be full sections", () => {
    render(
      <div>
        {renderProjectionSections(
          [
            section({
              key: "growth.motivators",
              title: "Growth motivators",
              render: "premium_teaser",
              bodyMd: "Preview: recognition, purpose, and intellectual momentum.",
            }),
            section({
              key: "relationships.rel_advantages",
              title: "Relationship advantages",
              render: "premium_teaser",
              bodyMd: "Preview: steadiness, clarity, and selective loyalty.",
            }),
          ],
          "zh"
        )}
      </div>
    );

    expect(screen.getByText("成长动力")).toBeInTheDocument();
    expect(screen.getByText("Preview: recognition, purpose, and intellectual momentum.")).toBeInTheDocument();
    expect(screen.queryByText("Premium section preview")).not.toBeInTheDocument();
    expect(screen.queryByText("Unlock the full section in the premium experience.")).not.toBeInTheDocument();
  });
});
