import { describe, expect, it } from "vitest";
import type { ReportResponse } from "@/lib/api/v0_3";
import { buildMbtiResultProjectionViewModel } from "@/lib/mbti/publicProjection";
import reportReadyMbtiProjectionFixture from "@/tests/fixtures/report_ready.mbti.projection.json";

describe("MBTI result section registry", () => {
  it("preserves the canonical A/T difference and FAQ sections in inventory order", () => {
    const report = structuredClone(reportReadyMbtiProjectionFixture) as ReportResponse;
    const projection = report.mbti_public_projection_v1 as {
      sections?: Array<Record<string, unknown>>;
    };

    projection.sections = [
      ...(projection.sections ?? []),
      {
        key: "faq",
        render: "bullets",
        title: "Frequently asked questions",
        payload: {
          items: [{ question: "Synthetic question", answer: "Synthetic answer" }],
        },
      },
      {
        key: "traits.at_difference",
        render: "rich_text",
        title: "A/T identity layer",
        body_md: "Synthetic A/T difference body.",
      },
    ];

    const viewModel = buildMbtiResultProjectionViewModel(report);
    const keys = viewModel.sections.map((section) => section.key);

    expect(keys).toContain("traits.at_difference");
    expect(keys).toContain("faq");
    expect(keys.indexOf("trait_overview")).toBeLessThan(keys.indexOf("traits.at_difference"));
    expect(keys.indexOf("traits.at_difference")).toBeLessThan(keys.indexOf("faq"));
    expect(keys.indexOf("faq")).toBeLessThan(keys.indexOf("career.summary"));
    expect(viewModel.sections.find((section) => section.key === "traits.at_difference")?.bodyMd).toBe(
      "Synthetic A/T difference body."
    );
    expect(viewModel.sections.find((section) => section.key === "faq")?.payload).toMatchObject({
      items: [{ question: "Synthetic question", answer: "Synthetic answer" }],
    });
  });
});
