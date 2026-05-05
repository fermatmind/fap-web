import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RichResultReport } from "@/components/result/RichResultReport";
import type { ReportResponse } from "@/lib/api/v0_3";
import { BIG5_RESULT_PAGE_V2_PAYLOAD_KEY } from "@/lib/big5/resultPageV2";
import pilotEnvelope from "@/tests/fixtures/big5/result_page_v2/pilot_o59_staging_payload_v0_1.payload.json";
import pilotRenderedQaReport from "@/tests/fixtures/big5/result_page_v2/pilot_rendered_qa_report.v0_1.json";
import pilotSurfaceMatrix from "@/tests/fixtures/big5/result_page_v2/pilot_rendered_qa_surface_matrix.v0_1.json";

type SurfaceStatus = "pass" | "fail" | "pending_surface";

type PilotRenderedQaSurface = {
  surface_key: string;
  status: SurfaceStatus;
  coverage: string;
  viewport_width?: number;
  expected_visible_terms?: string[];
  forbidden_visible_terms?: string[];
  evidence: string[];
  pending_reason?: string;
};

const TESTED_SURFACES = ["result_page_desktop", "result_page_mobile"] as const;
const PENDING_SURFACES = ["pdf", "share_card", "history", "compare"] as const;

function createPilotReport(overrides: Partial<ReportResponse> = {}): ReportResponse {
  return {
    scale_code: "BIG5_OCEAN",
    report: {
      scale_code: "BIG5_OCEAN",
      sections: [
        {
          key: "hero_summary",
          title: "Legacy fallback section",
          blocks: [
            {
              kind: "paragraph",
              body: "FRONTEND_FALLBACK_BODY_SHOULD_NOT_RENDER",
            },
          ],
        },
      ],
    },
    [BIG5_RESULT_PAGE_V2_PAYLOAD_KEY]: structuredClone(pilotEnvelope).big5_result_page_v2,
    ...overrides,
  } as ReportResponse;
}

function surfacesByKey(): Record<string, PilotRenderedQaSurface> {
  const surfaces = pilotSurfaceMatrix.surfaces as PilotRenderedQaSurface[];

  return Object.fromEntries(
    surfaces.map((surface) => [surface.surface_key, surface])
  );
}

function visibleText(): string {
  return document.body.textContent ?? "";
}

describe("Big Five V2 pilot rendered QA contract", () => {
  it("keeps the pilot rendered QA matrix explicit about pass and pending surfaces", () => {
    const surfaces = surfacesByKey();

    expect(Object.keys(surfaces).sort()).toEqual([
      "compare",
      "history",
      "pdf",
      "result_page_desktop",
      "result_page_mobile",
      "share_card",
    ]);

    for (const surfaceKey of TESTED_SURFACES) {
      expect(surfaces[surfaceKey].status).toBe("pass");
      expect(surfaces[surfaceKey].coverage).toBe("fap_web_pilot_rendered_contract");
      expect(surfaces[surfaceKey].evidence).toEqual([
        "tests/contracts/big5-pilot-rendered-qa.contract.test.tsx",
      ]);
    }

    for (const surfaceKey of PENDING_SURFACES) {
      expect(surfaces[surfaceKey].status).toBe("pending_surface");
      expect(surfaces[surfaceKey].evidence).toEqual([]);
      expect(surfaces[surfaceKey].pending_reason).toBeTruthy();
    }

    expect(pilotSurfaceMatrix.status_counts).toEqual({
      pass: 2,
      pending_surface: 4,
      fail: 0,
    });
    expect(pilotRenderedQaReport.pending_surfaces).toEqual(PENDING_SURFACES);
    expect(pilotRenderedQaReport.pilot_rendered_qa.all_required_surfaces_passed).toBe(false);
    expect(pilotRenderedQaReport.pilot_rendered_qa.production_blocked).toBe(true);
  });

  it.each(TESTED_SURFACES)("%s renders the pilot payload without fallback, metadata, or anti-target leaks", (surfaceKey) => {
    const surface = surfacesByKey()[surfaceKey];
    window.innerWidth = surface.viewport_width ?? 1440;

    render(<RichResultReport locale="zh" reportData={createPilotReport()} />);

    expect(screen.getByTestId("big5-result-page-v2-shell")).toBeInTheDocument();
    expect(screen.queryByTestId("big5-result-shell")).not.toBeInTheDocument();

    const text = visibleText();
    for (const term of surface.expected_visible_terms ?? []) {
      expect(text).toContain(term);
    }

    for (const term of surface.forbidden_visible_terms ?? []) {
      expect(text).not.toContain(term);
    }

    expect(text).not.toContain("FRONTEND_FALLBACK_BODY_SHOULD_NOT_RENDER");
  });

  it("does not claim PDF, share, history, or compare pilot rendered coverage without harnesses", () => {
    const surfaces = surfacesByKey();

    expect(surfaces.pdf.coverage).toBe("no_pilot_pdf_render_harness");
    expect(surfaces.share_card.coverage).toBe("no_pilot_share_card_render_harness");
    expect(surfaces.history.coverage).toBe("no_pilot_history_surface_contract");
    expect(surfaces.compare.coverage).toBe("no_pilot_compare_surface_contract");
  });
});
