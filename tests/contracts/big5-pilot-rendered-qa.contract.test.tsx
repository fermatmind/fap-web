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
const SECONDARY_SURFACES = ["pdf", "share_card", "history", "compare"] as const;

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
  it("keeps the pilot rendered QA matrix explicit about pass evidence for every surface", () => {
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
      expect(surfaces[surfaceKey].evidence.length).toBeGreaterThan(0);
    }

    for (const surfaceKey of SECONDARY_SURFACES) {
      expect(surfaces[surfaceKey].status).toBe("pass");
      expect(surfaces[surfaceKey].evidence.some((entry) => entry.startsWith("backend/app/Services/BigFive/ResultPageV2/"))).toBe(true);
      expect(surfaces[surfaceKey].evidence.some((entry) => entry.startsWith("backend/tests/Fixtures/big5_result_page_v2/"))).toBe(true);
      expect(surfaces[surfaceKey].evidence.some((entry) => entry.startsWith("fap-web/tests/contracts/big5-"))).toBe(true);
    }

    expect(pilotSurfaceMatrix.status_counts).toEqual({
      pass: 6,
      pending_surface: 0,
      fail: 0,
    });
    expect(pilotRenderedQaReport.pending_surfaces).toEqual([]);
    expect(pilotRenderedQaReport.pilot_readiness.all_required_surfaces_passed).toBe(true);
    expect(pilotRenderedQaReport.pilot_readiness.pilot_rendered_qa_complete).toBe(true);
    expect(pilotRenderedQaReport.pilot_readiness.production_blocked).toBe(true);
    expect(pilotRenderedQaReport.ready_for_runtime).toBe(false);
    expect(pilotRenderedQaReport.ready_for_production).toBe(false);
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

  it("claims secondary surface coverage only with backend fixture and fap-web rendered contract evidence", () => {
    const surfaces = surfacesByKey();

    expect(surfaces.pdf.coverage).toBe("backend_adapter_fixture_plus_fap_web_rendered_contract");
    expect(surfaces.share_card.coverage).toBe("backend_share_safe_fixture_plus_fap_web_rendered_contract");
    expect(surfaces.history.coverage).toBe("backend_history_snapshot_fixture_plus_fap_web_rendered_contract");
    expect(surfaces.compare.coverage).toBe("backend_compare_snapshot_fixture_plus_fap_web_rendered_contract");
  });
});
