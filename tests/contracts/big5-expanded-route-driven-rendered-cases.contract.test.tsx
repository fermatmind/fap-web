import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RichResultReport } from "@/components/result/RichResultReport";
import type { ReportResponse } from "@/lib/api/v0_3";
import { BIG5_RESULT_PAGE_V2_PAYLOAD_KEY } from "@/lib/big5/resultPageV2";
import goldenCases from "@/tests/fixtures/big5/result_page_v2/big5_route_driven_golden_cases_v0_1.json";
import goldenSummary from "@/tests/fixtures/big5/result_page_v2/big5_route_driven_golden_cases_summary_v0_1.json";
import pilotSurfaceMatrix from "@/tests/fixtures/big5/result_page_v2/pilot_rendered_qa_surface_matrix.v0_1.json";
import complexExplorerLowStructureEnvelope from "@/tests/fixtures/big5/result_page_v2/route_driven_complex_explorer_low_structure_pilot_payload_v0_1.payload.json";
import connectiveCoordinatorEnvelope from "@/tests/fixtures/big5/result_page_v2/route_driven_connective_coordinator_pilot_payload_v0_1.payload.json";
import o59CanonicalEnvelope from "@/tests/fixtures/big5/result_page_v2/route_driven_o59_canonical_pilot_payload_v0_1.payload.json";
import orderlySupporterEnvelope from "@/tests/fixtures/big5/result_page_v2/route_driven_orderly_supporter_pilot_payload_v0_1.payload.json";
import overloadedInternalizerEnvelope from "@/tests/fixtures/big5/result_page_v2/route_driven_overloaded_internalizer_pilot_payload_v0_1.payload.json";
import quietDeepWorkerEnvelope from "@/tests/fixtures/big5/result_page_v2/route_driven_quiet_deep_worker_pilot_payload_v0_1.payload.json";
import sharpExploratoryDriverEnvelope from "@/tests/fixtures/big5/result_page_v2/route_driven_sharp_exploratory_driver_pilot_payload_v0_1.payload.json";
import vigilantPerfectionistEnvelope from "@/tests/fixtures/big5/result_page_v2/route_driven_vigilant_perfectionist_pilot_payload_v0_1.payload.json";

type RouteDrivenEnvelope = {
  big5_result_page_v2: {
    profile_label_zh: string;
    modules: Array<{
      module_key: string;
      blocks?: Array<{
        content?: {
          title_zh?: string;
        };
      }>;
    }>;
  };
};

type GoldenCase = {
  case_id: string;
  golden_group: string;
  profile_family: string;
  metadata_non_leak_terms: string[];
};

type RenderedSurfaceStatus = {
  surface_key: string;
  status: "pass" | "fail" | "pending_surface";
};

const PROFILE_FIXTURES: Record<string, RouteDrivenEnvelope> = {
  complex_explorer_low_structure: complexExplorerLowStructureEnvelope as RouteDrivenEnvelope,
  connective_coordinator: connectiveCoordinatorEnvelope as RouteDrivenEnvelope,
  orderly_supporter: orderlySupporterEnvelope as RouteDrivenEnvelope,
  overloaded_internalizer: overloadedInternalizerEnvelope as RouteDrivenEnvelope,
  quiet_deep_worker: quietDeepWorkerEnvelope as RouteDrivenEnvelope,
  sensitive_independent_thinker: o59CanonicalEnvelope as RouteDrivenEnvelope,
  sharp_exploratory_driver: sharpExploratoryDriverEnvelope as RouteDrivenEnvelope,
  vigilant_perfectionist: vigilantPerfectionistEnvelope as RouteDrivenEnvelope,
};

const TESTED_VIEWPORTS = [
  ["desktop", 1440],
  ["mobile", 390],
] as const;

const MUST_NOT_RENDER_TERMS = [
  "frontend_fallback",
  "internal_metadata",
  "selector_basis",
  "source_reference",
  "production_use_allowed",
  "runtime_use",
  "review_status",
  "qa_notes",
  "[object Object]",
  "A compact overview",
  "Norms Comparison",
  "Methodology and Access",
] as const;

function createReport(envelope: RouteDrivenEnvelope): ReportResponse {
  return {
    scale_code: "BIG5_OCEAN",
    report: {
      scale_code: "BIG5_OCEAN",
      sections: [
        {
          key: "legacy",
          title: "Legacy fallback section",
          blocks: [{ kind: "paragraph", body: "FRONTEND_FALLBACK_BODY_SHOULD_NOT_RENDER" }],
        },
      ],
    },
    [BIG5_RESULT_PAGE_V2_PAYLOAD_KEY]: structuredClone(envelope).big5_result_page_v2,
  } as ReportResponse;
}

function visibleText(): string {
  return document.body.textContent ?? "";
}

function mustRenderTerms(envelope: RouteDrivenEnvelope): string[] {
  const payload = envelope.big5_result_page_v2;
  const traitTitle = payload.modules.find((module) => module.module_key === "module_03_trait_deep_dive")
    ?.blocks?.[0]?.content?.title_zh;
  const scenarioTitle = payload.modules.find((module) => module.module_key === "module_06_application_matrix")
    ?.blocks?.[0]?.content?.title_zh;

  return [payload.profile_label_zh, traitTitle, scenarioTitle].filter((term): term is string => Boolean(term));
}

describe("Big Five V2 expanded route-driven rendered cases", () => {
  const cases = goldenCases as GoldenCase[];
  const canonicalCases = cases.filter((entry) => entry.golden_group === "canonical_profile_family");

  it("tracks expanded backend golden case coverage without marking production ready", () => {
    expect(goldenSummary.case_count).toBe(16);
    expect(goldenSummary.canonical_profile_family_case_count).toBe(8);
    expect(goldenSummary.variant_case_count).toBe(8);
    expect(goldenSummary.runtime_use).toBe("staging_only");
    expect(goldenSummary.production_use_allowed).toBe(false);
    expect(goldenSummary.ready_for_pilot).toBe(false);
    expect(goldenSummary.ready_for_runtime).toBe(false);
    expect(goldenSummary.ready_for_production).toBe(false);
    expect(goldenSummary.production_go).toBe(false);
  });

  it.each(canonicalCases.flatMap((goldenCase) =>
    TESTED_VIEWPORTS.map(([viewport, width]) => [goldenCase.case_id, goldenCase, viewport, width] as const)
  ))("%s renders canonical route-driven payload on %s without metadata leaks", (_caseId, goldenCase, _viewport, width) => {
    const envelope = PROFILE_FIXTURES[goldenCase.profile_family];
    expect(envelope).toBeDefined();
    window.innerWidth = width;

    render(<RichResultReport locale="zh" reportData={createReport(envelope)} />);

    expect(screen.getByTestId("big5-result-page-v2-shell")).toBeInTheDocument();
    expect(screen.queryByTestId("big5-result-shell")).not.toBeInTheDocument();

    const text = visibleText();
    for (const term of mustRenderTerms(envelope)) {
      expect(text).toContain(term);
    }

    for (const term of [...MUST_NOT_RENDER_TERMS, ...goldenCase.metadata_non_leak_terms]) {
      expect(text).not.toContain(term);
    }

    expect(text).not.toContain("FRONTEND_FALLBACK_BODY_SHOULD_NOT_RENDER");
  });

  it("keeps expanded non-result-page surfaces pending rather than fake-passing", () => {
    const surfaces = Object.fromEntries(
      (pilotSurfaceMatrix.surfaces as RenderedSurfaceStatus[]).map((surface) => [surface.surface_key, surface])
    );

    for (const surfaceKey of ["pdf", "share_card", "history", "compare"]) {
      expect(surfaces[surfaceKey].status).toBe("pending_surface");
    }
  });
});
