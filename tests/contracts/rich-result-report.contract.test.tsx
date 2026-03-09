import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RichResultReport } from "@/components/result/RichResultReport";
import type { ReportResponse } from "@/lib/api/v0_3";

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/result/attempt-123",
}));

describe("RichResultReport", () => {
  it("renders only report-source free content for MBTI and does not leak gated sections", () => {
    const reportData: ReportResponse = {
      ok: true,
      locked: true,
      variant: "free",
      access_level: "free",
      modules_allowed: ["core_free"],
      offers: [
        {
          title: "MBTI Career Unlock",
          formatted_price: "$9.90",
          modules_included: ["career", "relationships"],
        },
      ],
      view_policy: {
        free_sections: ["traits"],
      },
      report: {
        scale_code: "MBTI",
        profile: {
          type_code: "ISTJ-A",
          type_name: "Logistician",
          tagline: "Steady systems builder",
          rarity: "About 11%",
          keywords: ["keyword-from-profile"],
          short_summary: "You prefer clear standards, stable progress, and dependable execution.",
        },
        tags: ["tag-from-report", "trustworthy"],
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
            access_level: "free",
            module_code: "core_free",
          },
          {
            title: "Paid growth highlight",
            text: "This should not render.",
            access_level: "paid",
            module_code: "growth",
          },
        ],
        sections: {
          traits: {
            locked: false,
            module_code: "core_free",
            cards: [
              {
                title: "Core trait read",
                desc: "You prefer stable systems and verified execution.",
                bullets: ["Stable delivery", "Clear standards"],
                tips: ["Document your playbooks."],
                tags: ["trait:core"],
                access_level: "free",
                module_code: "core_free",
              },
            ],
          },
          career: {
            locked: false,
            module_code: "career",
            cards: [
              {
                title: "Career operating mode",
                desc: "This paid career body must stay hidden.",
                access_level: "free",
                module_code: "career",
              },
            ],
          },
          relationships: {
            locked: false,
            module_code: "relationships",
            cards: [
              {
                title: "Relationship deep dive",
                desc: "This paid relationship body must stay hidden.",
                access_level: "free",
                module_code: "relationships",
              },
            ],
          },
        },
      },
    };

    render(<RichResultReport locale="en" reportData={reportData} />);

    expect(screen.getByText("ISTJ-A")).toBeInTheDocument();
    expect(screen.getByText("Steady systems builder")).toBeInTheDocument();
    expect(screen.getByText(/About 11%/)).toBeInTheDocument();
    expect(screen.getByText("tag-from-report")).toBeInTheDocument();
    expect(screen.getByText("trustworthy")).toBeInTheDocument();
    expect(screen.queryByText("keyword-from-profile")).not.toBeInTheDocument();

    expect(screen.getByText("Execution strength")).toBeInTheDocument();
    expect(screen.queryByText("Paid growth highlight")).not.toBeInTheDocument();
    expect(screen.getByText("Core trait read")).toBeInTheDocument();
    expect(screen.queryByText("Career operating mode")).not.toBeInTheDocument();
    expect(screen.queryByText("Relationship deep dive")).not.toBeInTheDocument();
    expect(screen.queryByText("This paid career body must stay hidden.")).not.toBeInTheDocument();
    expect(screen.queryByText("This paid relationship body must stay hidden.")).not.toBeInTheDocument();

    expect(screen.getByText("MBTI Career Unlock")).toBeInTheDocument();
    expect(screen.getByText("E / I")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "View personality profile" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Retake test" })).toHaveAttribute(
      "href",
      "/en/tests/mbti-personality-test-16-personality-types/take"
    );
    expect(screen.queryByText("Prefers explicit roles and reviewable workflows.")).not.toBeInTheDocument();
    expect(screen.queryByText("Reliable operator")).not.toBeInTheDocument();
  });
});
