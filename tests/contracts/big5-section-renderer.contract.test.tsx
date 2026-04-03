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
});
