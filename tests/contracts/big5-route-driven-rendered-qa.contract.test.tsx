import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RichResultReport } from "@/components/result/RichResultReport";
import type { ReportResponse } from "@/lib/api/v0_3";
import { BIG5_RESULT_PAGE_V2_PAYLOAD_KEY } from "@/lib/big5/resultPageV2";
import pilotSurfaceMatrix from "@/tests/fixtures/big5/result_page_v2/pilot_rendered_qa_surface_matrix.v0_1.json";
import o59CanonicalEnvelope from "@/tests/fixtures/big5/result_page_v2/route_driven_o59_canonical_pilot_payload_v0_1.payload.json";
import sensitiveIndependentThinkerEnvelope from "@/tests/fixtures/big5/result_page_v2/route_driven_sensitive_independent_thinker_pilot_payload_v0_1.payload.json";
import vigilantPerfectionistEnvelope from "@/tests/fixtures/big5/result_page_v2/route_driven_vigilant_perfectionist_pilot_payload_v0_1.payload.json";
import complexExplorerLowStructureEnvelope from "@/tests/fixtures/big5/result_page_v2/route_driven_complex_explorer_low_structure_pilot_payload_v0_1.payload.json";
import quietDeepWorkerEnvelope from "@/tests/fixtures/big5/result_page_v2/route_driven_quiet_deep_worker_pilot_payload_v0_1.payload.json";
import connectiveCoordinatorEnvelope from "@/tests/fixtures/big5/result_page_v2/route_driven_connective_coordinator_pilot_payload_v0_1.payload.json";
import sharpExploratoryDriverEnvelope from "@/tests/fixtures/big5/result_page_v2/route_driven_sharp_exploratory_driver_pilot_payload_v0_1.payload.json";
import orderlySupporterEnvelope from "@/tests/fixtures/big5/result_page_v2/route_driven_orderly_supporter_pilot_payload_v0_1.payload.json";
import overloadedInternalizerEnvelope from "@/tests/fixtures/big5/result_page_v2/route_driven_overloaded_internalizer_pilot_payload_v0_1.payload.json";

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

type RenderedSurfaceStatus = {
  surface_key: string;
  status: "pass" | "fail" | "pending_surface";
};

const ROUTE_DRIVEN_FIXTURES: Array<{
  key: string;
  envelope: RouteDrivenEnvelope;
}> = [
  { key: "o59_canonical", envelope: o59CanonicalEnvelope as RouteDrivenEnvelope },
  { key: "sensitive_independent_thinker", envelope: sensitiveIndependentThinkerEnvelope as RouteDrivenEnvelope },
  { key: "vigilant_perfectionist", envelope: vigilantPerfectionistEnvelope as RouteDrivenEnvelope },
  { key: "complex_explorer_low_structure", envelope: complexExplorerLowStructureEnvelope as RouteDrivenEnvelope },
  { key: "quiet_deep_worker", envelope: quietDeepWorkerEnvelope as RouteDrivenEnvelope },
  { key: "connective_coordinator", envelope: connectiveCoordinatorEnvelope as RouteDrivenEnvelope },
  { key: "sharp_exploratory_driver", envelope: sharpExploratoryDriverEnvelope as RouteDrivenEnvelope },
  { key: "orderly_supporter", envelope: orderlySupporterEnvelope as RouteDrivenEnvelope },
  { key: "overloaded_internalizer", envelope: overloadedInternalizerEnvelope as RouteDrivenEnvelope },
];

const TESTED_VIEWPORTS = [
  ["desktop", 1440],
  ["mobile", 390],
] as const;

const SECONDARY_SURFACES = ["pdf", "share_card", "history", "compare"] as const;

const MUST_NOT_RENDER_TERMS = [
  "private URL",
  "attempt id",
  "footer",
  "Big Five Report Engine",
  "PR3B",
  "AttemptReadController",
  "payload",
  "registry",
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

function createRouteDrivenReport(envelope: RouteDrivenEnvelope): ReportResponse {
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
    [BIG5_RESULT_PAGE_V2_PAYLOAD_KEY]: structuredClone(envelope).big5_result_page_v2,
  } as ReportResponse;
}

function visibleText(): string {
  return document.body.textContent ?? "";
}

function expectedVisibleTerms(envelope: RouteDrivenEnvelope): string[] {
  const payload = envelope.big5_result_page_v2;
  const profileLabel = payload.profile_label_zh;
  const traitTitle = payload.modules.find((module) => module.module_key === "module_03_trait_deep_dive")
    ?.blocks?.[0]?.content?.title_zh;
  const scenarioTitle = payload.modules.find((module) => module.module_key === "module_06_application_matrix")
    ?.blocks?.[0]?.content?.title_zh;

  return [profileLabel, traitTitle, scenarioTitle].filter((term): term is string => Boolean(term));
}

describe("Big Five V2 route-driven rendered QA contract", () => {
  it("covers O59 plus eight route-driven profile-family fixtures", () => {
    expect(ROUTE_DRIVEN_FIXTURES.map((fixture) => fixture.key).sort()).toEqual([
      "complex_explorer_low_structure",
      "connective_coordinator",
      "o59_canonical",
      "orderly_supporter",
      "overloaded_internalizer",
      "quiet_deep_worker",
      "sensitive_independent_thinker",
      "sharp_exploratory_driver",
      "vigilant_perfectionist",
    ]);
  });

  it.each(ROUTE_DRIVEN_FIXTURES.flatMap((fixture) =>
    TESTED_VIEWPORTS.map(([viewport, width]) => [fixture.key, fixture.envelope, viewport, width] as const)
  ))("%s renders route-driven pilot payload on %s without fallback or metadata leaks", (_fixtureKey, envelope, _viewport, width) => {
    window.innerWidth = width;

    render(<RichResultReport locale="zh" reportData={createRouteDrivenReport(envelope)} />);

    expect(screen.getByTestId("big5-result-page-v2-shell")).toBeInTheDocument();
    expect(screen.queryByTestId("big5-result-shell")).not.toBeInTheDocument();

    const text = visibleText();
    for (const term of expectedVisibleTerms(envelope)) {
      expect(text).toContain(term);
    }

    for (const term of MUST_NOT_RENDER_TERMS) {
      expect(text).not.toContain(term);
    }

    expect(text).not.toContain("FRONTEND_FALLBACK_BODY_SHOULD_NOT_RENDER");
  });

  it("keeps PDF, share, history, and compare covered by backend fixture handoff evidence", () => {
    const surfaces = Object.fromEntries(
      (pilotSurfaceMatrix.surfaces as RenderedSurfaceStatus[]).map((surface) => [surface.surface_key, surface])
    );

    for (const surfaceKey of SECONDARY_SURFACES) {
      expect(surfaces[surfaceKey].status).toBe("pass");
    }
  });
});
