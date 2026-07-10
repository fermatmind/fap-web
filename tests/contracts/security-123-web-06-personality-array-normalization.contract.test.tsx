import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CmsPersonalitySection, PersonalityProjectionSection } from "@/lib/cms/personality";
import {
  buildPersonalitySectionLinks,
  extractPersonalityFaqItems,
  extractProjectionFaqItems,
  renderPersonalitySections,
  renderProjectionSections,
} from "@/lib/cms/personality-sections";

function cmsSection(overrides: Partial<CmsPersonalitySection>): CmsPersonalitySection {
  return {
    sectionKey: "quick_answer",
    title: "Quick answer",
    renderVariant: "rich_text",
    bodyMd: "Backend-authored body",
    bodyHtml: "",
    payloadJson: null,
    sortOrder: 1,
    isEnabled: true,
    ...overrides,
  };
}

function projectionSection(overrides: Partial<PersonalityProjectionSection>): PersonalityProjectionSection {
  return {
    key: "faq",
    title: "FAQ",
    render: "faq",
    bodyMd: "Fallback body",
    payload: null,
    isEnabled: true,
    source: "cms",
    ...overrides,
  };
}

describe("SECURITY-123-WEB-06 personality CMS array normalization", () => {
  it("ignores malformed V8.5 FAQ, internal-link, and related arrays at the render boundary", () => {
    const sections = [
      cmsSection({
        sectionKey: "v8_5_ai_search_answer",
        title: "AI answer",
        renderVariant: "callout",
        payloadJson: {
          faq: [
            null,
            "malformed FAQ",
            42,
            [],
          ],
          internal_links: [
            null,
            "malformed link",
            [],
          ],
          items: [null, { href: "/en/account", anchor_text: "Private account" }],
          links: ["malformed related item", { title: "Related profile", slug: "infj-a" }],
          raw_row: {
            faq: [
              { question: "What is INTJ-A?", answer: "A backend-authored explanation." },
            ],
            internal_links: [
              { href: "/en/personality/intj-a-vs-intj-t", anchor_text: "Compare INTJ-A and INTJ-T" },
            ],
          },
        },
      }),
    ];

    expect(() => render(<div>{renderPersonalitySections(sections, "en")}</div>)).not.toThrow();
    expect(screen.getByText("What is INTJ-A?")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Compare INTJ-A and INTJ-T" })).toHaveAttribute(
      "href",
      "/en/personality/intj-a-vs-intj-t"
    );
    expect(screen.getByRole("link", { name: "Related profile" })).toHaveAttribute(
      "href",
      "/en/personality/infj-a"
    );
    expect(screen.queryByText("Private account")).not.toBeInTheDocument();
    expect(buildPersonalitySectionLinks(sections[0], "en")).toEqual([
      { title: "Related profile", href: "/en/personality/infj-a", summary: "" },
    ]);
    expect(extractPersonalityFaqItems(sections)).toEqual([
      { question: "What is INTJ-A?", answer: "A backend-authored explanation." },
    ]);
  });

  it("fails closed for malformed legacy and projection FAQ arrays", () => {
    const cmsSections = [
      cmsSection({
        sectionKey: "faq",
        title: "FAQ",
        renderVariant: "faq",
        payloadJson: {
          items: [null, "bad", [], { question: "Valid question", answer: "Valid answer" }],
        },
      }),
    ];
    const projectionSections = [
      projectionSection({
        payload: {
          items: [null, 0, "bad", { question: "Projection question", answer: "Projection answer" }],
        },
      }),
    ];

    expect(() => render(<div>{renderPersonalitySections(cmsSections, "en")}</div>)).not.toThrow();
    expect(() => render(<div>{renderProjectionSections(projectionSections, "en")}</div>)).not.toThrow();
    expect(extractPersonalityFaqItems(cmsSections)).toEqual([
      { question: "Valid question", answer: "Valid answer" },
    ]);
    expect(extractProjectionFaqItems(projectionSections)).toEqual([
      { question: "Projection question", answer: "Projection answer" },
    ]);
  });
});
