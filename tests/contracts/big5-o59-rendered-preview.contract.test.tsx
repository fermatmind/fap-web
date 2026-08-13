import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RichResultReport } from "@/components/result/RichResultReport";
import type { ReportResponse } from "@/lib/api/v0_3";
import { BIG5_RESULT_PAGE_V2_PAYLOAD_KEY } from "@/lib/big5/resultPageV2";
import o59Envelope from "@/tests/fixtures/big5/result_page_v2/canonical_o59_core_body_preview.payload.json";
import { createRuntimeV2Payload } from "@/tests/fixtures/big5/runtimeV2Payload";

const TESTED_SURFACES = ["result_page_desktop", "result_page_mobile"] as const;
const M6_SECONDARY_SURFACES = ["pdf", "share_card", "history", "compare"] as const;

const MUST_NOT_RENDER_TERMS = [
  "private URL",
  "attempt id",
  "footer",
  "Big Five Report Engine",
  "PR3B",
  "AttemptReadController",
  "payload",
  "registry",
  "A compact overview",
  "Norms Comparison",
  "Methodology and Access",
  "N1 百分位",
  "[object Object]",
  "internal_metadata",
  "selector_basis",
  "frontend_fallback",
  "source_reference",
  "runtime_use",
  "production_use_allowed",
] as const;

function createO59Report(): ReportResponse {
  return {
    scale_code: "BIG5_OCEAN",
    report: {
      scale_code: "BIG5_OCEAN",
    },
    [BIG5_RESULT_PAGE_V2_PAYLOAD_KEY]: createRuntimeV2Payload(),
  } as ReportResponse;
}

function visibleText(): string {
  return document.body.textContent ?? "";
}

describe("Big Five V2 O59 rendered preview contract", () => {
  it("keeps the copied O59 fixture aligned to the eight source sections from the preview QA pack", () => {
    const payload = structuredClone(o59Envelope).big5_result_page_v2;
    const sectionKeys = new Set(
      payload.modules.flatMap((module) =>
        module.blocks
          .map((block) => block.source_section_key)
          .filter((sectionKey): sectionKey is string => typeof sectionKey === "string" && sectionKey.length > 0)
      )
    );

    expect(Array.from(sectionKeys).sort()).toEqual([
      "action_plan",
      "core_portrait",
      "domain_deep_dive",
      "domains_overview",
      "facet_details",
      "hero_summary",
      "methodology_and_access",
      "norms_comparison",
    ]);
  });

  it.each(TESTED_SURFACES)("%s renders the selected O59 runtime payload", (surface) => {
    window.innerWidth = surface === "result_page_mobile" ? 390 : 1440;

    render(<RichResultReport locale="zh" reportData={createO59Report()} />);

    expect(screen.getByTestId("big5-result-page-v2-shell")).toBeInTheDocument();
    expect(screen.getAllByRole("progressbar")).toHaveLength(5);
    expect(screen.queryByTestId("big5-core-only-shell")).not.toBeInTheDocument();
    expect(screen.queryByTestId("big5-result-shell")).not.toBeInTheDocument();

    const text = visibleText();
    for (const [label, score] of [["开放性", "59"], ["尽责性", "32"], ["外向性", "20"], ["宜人性", "55"], ["情绪性", "68"]]) {
      expect(text).toContain(label);
      expect(text).toContain(score);
    }
    expect(text).not.toContain("敏锐的独立思考者");
    expect(text).not.toContain("30 / 60 / 90 天路径");
    expect(text).not.toContain("此模块暂未启用");
    expect(text).not.toContain("pending_asset_resolution");
    for (const term of MUST_NOT_RENDER_TERMS) {
      expect(text).not.toContain(term);
    }
  });

  it("keeps secondary surface coverage delegated to the dedicated M6 rendered QA contracts", () => {
    expect(TESTED_SURFACES).toEqual(["result_page_desktop", "result_page_mobile"]);
    expect(M6_SECONDARY_SURFACES).toEqual(["pdf", "share_card", "history", "compare"]);
  });

  it("does not synthesize O59 body copy when the V2 payload is missing", () => {
    render(
      <RichResultReport
        locale="zh"
        reportData={{
          scale_code: "BIG5_OCEAN",
          report: {
            scale_code: "BIG5_OCEAN",
          },
        } as ReportResponse}
      />
    );

    expect(screen.queryByTestId("big5-result-page-v2-shell")).not.toBeInTheDocument();
    expect(visibleText()).not.toContain("敏锐的独立思考者");
  });
});
