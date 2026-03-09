import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RichResultReport } from "@/components/result/RichResultReport";
import type { CmsPersonalityProfile } from "@/lib/cms/personality";
import type { ReportResponse } from "@/lib/api/v0_3";

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/result/attempt-123",
}));

describe("RichResultReport", () => {
  it("renders report-first MBTI content, adapts section cards, and merges non-duplicated CMS sections", () => {
    const reportData: ReportResponse = {
      ok: true,
      locked: true,
      summary: "A steady, systems-first profile.",
      offers: [
        {
          title: "MBTI Career Unlock",
          formatted_price: "$9.90",
          modules_included: ["career", "relationships"],
        },
      ],
      report: {
        scale_code: "MBTI",
        profile: {
          type_code: "ISTJ-A",
          type_name: "Logistician",
          tagline: "Steady systems builder",
          rarity: "About 11%",
          keywords: ["Reliable", "Structured"],
          short_summary: "You prefer clear standards, stable progress, and dependable execution.",
        },
        scores_pct: {
          EI: 40,
          SN: 67,
          TF: 80,
          JP: 100,
          AT: 100,
        },
        highlights: [
          {
            title: "Execution strength",
            text: "You keep plans moving with consistency.",
          },
        ],
        sections: {
          career: {
            locked: false,
            cards: [
              {
                title: "Career operating mode",
                desc: "You perform best where process and ownership are explicit.",
                bullets: ["Stable delivery", "Process thinking"],
                tips: ["Document your playbooks."],
                tags: ["career:operations"],
              },
            ],
          },
          relationships: {
            locked: true,
            cards: [
              {
                title: "Relationships",
                desc: "This module is locked.",
              },
            ],
          },
        },
      },
    };

    const personalityProfile: CmsPersonalityProfile = {
      id: 1,
      orgId: 0,
      scaleCode: "MBTI",
      typeCode: "ISTJ",
      slug: "istj",
      locale: "en",
      title: "ISTJ",
      subtitle: "",
      excerpt: "",
      status: "published",
      isPublic: true,
      isIndexable: true,
      publishedAt: null,
      updatedAt: null,
      seoMeta: null,
      heroKicker: "",
      heroQuote: "",
      heroImageUrl: null,
      sections: [
        {
          sectionKey: "work_style",
          title: "Work style",
          renderVariant: "rich_text",
          bodyMd: "Prefers explicit roles and reviewable workflows.",
          bodyHtml: "",
          payloadJson: null,
          sortOrder: 1,
          isEnabled: true,
        },
        {
          sectionKey: "strengths",
          title: "Strengths",
          renderVariant: "bullets",
          bodyMd: "",
          bodyHtml: "",
          payloadJson: {
            items: [{ title: "Reliable operator" }],
          },
          sortOrder: 2,
          isEnabled: true,
        },
        {
          sectionKey: "relationships",
          title: "Supplementary relationships",
          renderVariant: "rich_text",
          bodyMd: "This should stay hidden because report relationships already exists.",
          bodyHtml: "",
          payloadJson: null,
          sortOrder: 3,
          isEnabled: true,
        },
      ],
    };

    render(
      <RichResultReport
        locale="en"
        reportData={reportData}
        personalityProfile={personalityProfile}
      />
    );

    expect(screen.getByText("ISTJ-A")).toBeInTheDocument();
    expect(screen.getByText("Steady systems builder")).toBeInTheDocument();
    expect(screen.getByText(/About 11%/)).toBeInTheDocument();
    expect(screen.getByText("Reliable")).toBeInTheDocument();
    expect(screen.getByText("Structured")).toBeInTheDocument();
    expect(screen.getByText("Execution strength")).toBeInTheDocument();
    expect(screen.getByText("Career path")).toBeInTheDocument();
    expect(screen.getByText("Career operating mode")).toBeInTheDocument();
    expect(screen.getByText("Work style")).toBeInTheDocument();
    expect(screen.getByText("Strengths")).toBeInTheDocument();
    expect(screen.queryByText("Supplementary relationships")).not.toBeInTheDocument();
    expect(screen.getByText("MBTI Career Unlock")).toBeInTheDocument();
    expect(screen.getByText("E / I")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View personality profile" })).toHaveAttribute("href", "/en/personality/istj");
    expect(screen.getByRole("link", { name: "Retake test" })).toHaveAttribute(
      "href",
      "/en/tests/mbti-personality-test-16-personality-types/take"
    );
  });
});
