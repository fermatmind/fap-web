import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SectionRenderer } from "@/components/big5/report/SectionRenderer";
import { BIG5_V1_STATE_MICROCOPY } from "@/lib/big5/microcopy";

describe("big5 section renderer contract", () => {
  it("uses microcopy norms missing text for percentile sections", () => {
    render(
      <SectionRenderer
        section={{
          key: "domains_overview",
          title: "Domains Overview",
          access_level: "free",
          blocks: [{ kind: "chart", metric_code: "O", body: "Percentile 81" }],
        }}
        locked={false}
        normsStatus="MISSING"
        locale="en"
        scaleCode="BIG5_OCEAN"
      />
    );

    expect(screen.getByText(BIG5_V1_STATE_MICROCOPY.norms.missing)).toBeInTheDocument();
  });

  it("does not show norms missing message when norms are available", () => {
    render(
      <SectionRenderer
        section={{
          key: "domains_overview",
          title: "Domains Overview",
          access_level: "free",
          blocks: [{ kind: "chart", metric_code: "O", body: "Percentile 81" }],
        }}
        locked={false}
        normsStatus="CALIBRATED"
        locale="en"
        scaleCode="BIG5_OCEAN"
      />
    );

    expect(screen.queryByText(BIG5_V1_STATE_MICROCOPY.norms.missing)).not.toBeInTheDocument();
  });

  it("shows norms missing message for facet_details key after taxonomy migration", () => {
    render(
      <SectionRenderer
        section={{
          key: "facet_details",
          title: "Facet Details",
          access_level: "free",
          blocks: [{ kind: "table_row", metric_code: "O5", body: "Percentile 81" }],
        }}
        locked={false}
        normsStatus="MISSING"
        locale="en"
        scaleCode="BIG5_OCEAN"
      />
    );

    expect(screen.getByText(BIG5_V1_STATE_MICROCOPY.norms.missing)).toBeInTheDocument();
  });

  it("renders section hierarchy metadata (step, page, subtitle) when provided", () => {
    render(
      <SectionRenderer
        section={{
          key: "core_portrait",
          title: "Core Portrait",
          subtitle: "Dominant trait structure and calibrated profile framing.",
          order: 5,
          page_slot: "page_5",
          access_level: "free",
          blocks: [{ kind: "paragraph", body: "Core profile read." }],
        }}
        locked={false}
        normsStatus="CALIBRATED"
        locale="en"
        scaleCode="BIG5_OCEAN"
      />
    );

    expect(screen.getByText("Step 5 · Page 5")).toBeInTheDocument();
    expect(screen.getByText("Dominant trait structure and calibrated profile framing.")).toBeInTheDocument();
  });

  it("adds Big Five section anchors and a contents affordance without changing section keys", () => {
    render(
      <SectionRenderer
        section={{
          key: "action_plan",
          title: "行动建议",
          subtitle: "按场景落到下一步动作。",
          order: 7,
          page_slot: "page_7",
          access_level: "free",
          blocks: [{ kind: "paragraph", body: "先选择一个场景动作。" }],
        }}
        locked={false}
        normsStatus="CALIBRATED"
        locale="zh"
        scaleCode="BIG5_OCEAN"
      />
    );

    expect(screen.getByTestId("big5-section-action_plan")).toHaveAttribute("id", "big5-section-action_plan");
    expect(screen.getByText("第 7 节 · 第 7 页")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "回到目录" })).toHaveAttribute("href", "#big5-on-this-page");
  });

  it("uses section-specific locked preview description from assembler metadata", () => {
    render(
      <SectionRenderer
        section={{
          key: "action_plan",
          title: "Action Plan",
          subtitle: "Near-term actions derived from your current trait profile.",
          access_level: "paid",
          locked_preview_description: "Unlock to reveal the full section and practical guidance.",
          locked_preview_cta: "Unlock full report",
          blocks: [],
        }}
        locked
        normsStatus="CALIBRATED"
        locale="en"
        scaleCode="BIG5_OCEAN"
      />
    );

    expect(screen.getByText("Unlock to reveal the full section and practical guidance.")).toBeInTheDocument();
    expect(screen.getByText("Unlock full report")).toBeInTheDocument();
  });

  it("renders preview blocks for mask_and_cta locked preview policy", () => {
    render(
      <SectionRenderer
        section={{
          key: "domain_deep_dive",
          title: "Domain Deep Dive",
          access_level: "paid",
          locked_preview_policy: "mask_and_cta",
          blocks: [{ kind: "paragraph", title: "Openness", body: "Higher Openness supports idea discovery." }],
        }}
        locked
        normsStatus="CALIBRATED"
        locale="en"
        scaleCode="BIG5_OCEAN"
      />
    );

    expect(screen.getByText("Higher Openness supports idea discovery.")).toBeInTheDocument();
  });

  it("suppresses debug-only Big Five engine/controller markers from user-facing blocks", () => {
    render(
      <SectionRenderer
        section={{
          key: "method_note",
          title: "Big Five Report Engine v2 registry PR3B",
          access_level: "free",
          blocks: [
            {
              kind: "metric_card",
              title: "AttemptReadController PR3A",
              body: "Keep this user-facing sentence. AttemptReadController Big Five Report Engine v2 registry PR2 PR1 payload facet glossary precision anomaly rules sentence-level modifier scenario action rule N-only production 已接入 production 接入",
              tags: ["PR3B", "stable summary", "payload", "facet glossary"],
            },
          ],
        }}
        locked={false}
        normsStatus="CALIBRATED"
        locale="en"
        scaleCode="BIG5_OCEAN"
      />
    );

    const html = document.body.textContent ?? "";
    expect(html).not.toContain("AttemptReadController");
    expect(html).not.toContain("Big Five Report Engine");
    expect(html).not.toContain("registry");
    expect(html).not.toContain("PR3B");
    expect(html).not.toContain("PR3A");
    expect(html).not.toContain("PR2");
    expect(html).not.toContain("PR1");
    expect(html).not.toContain("payload");
    expect(html).not.toContain("facet glossary");
    expect(html).not.toContain("precision anomaly rules");
    expect(html).not.toContain("sentence-level modifier");
    expect(html).not.toContain("scenario action rule");
    expect(html).not.toContain("N-only");
    expect(html).not.toContain("production 已接入");
    expect(html).not.toContain("production 接入");
    expect(html).toContain("Keep this user-facing sentence.");
    expect(html).toContain("stable summary");
  });
});
