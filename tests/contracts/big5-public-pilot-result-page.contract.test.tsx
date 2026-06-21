import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RichResultReport } from "@/components/result/RichResultReport";
import type { ReportResponse } from "@/lib/api/v0_3";
import {
  BIG5_RESULT_PAGE_V2_PAYLOAD_KEY,
  getBig5ResultPageV2Payload,
} from "@/lib/big5/resultPageV2";
import pilotSurfaceMatrix from "@/tests/fixtures/big5/result_page_v2/pilot_rendered_qa_surface_matrix.v0_1.json";
import o59CanonicalEnvelope from "@/tests/fixtures/big5/result_page_v2/route_driven_o59_canonical_pilot_payload_v0_1.payload.json";
import vigilantPerfectionistEnvelope from "@/tests/fixtures/big5/result_page_v2/route_driven_vigilant_perfectionist_pilot_payload_v0_1.payload.json";
import quietDeepWorkerEnvelope from "@/tests/fixtures/big5/result_page_v2/route_driven_quiet_deep_worker_pilot_payload_v0_1.payload.json";

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

const PUBLIC_RESULT_PAGE_FIXTURES: Array<{
  key: string;
  envelope: RouteDrivenEnvelope;
}> = [
  { key: "o59_canonical", envelope: o59CanonicalEnvelope as RouteDrivenEnvelope },
  { key: "vigilant_perfectionist", envelope: vigilantPerfectionistEnvelope as RouteDrivenEnvelope },
  { key: "quiet_deep_worker", envelope: quietDeepWorkerEnvelope as RouteDrivenEnvelope },
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

const PILOT_BODY_TERMS = [
  "你更像是在内部完成高强度扫描，再决定是否进入场景的人。",
  "当开放性处在中位时",
] as const;

function createPublicPilotReport(envelope: RouteDrivenEnvelope): ReportResponse {
  return {
    scale_code: "BIG5_OCEAN",
    report: {
      scale_code: "BIG5_OCEAN",
      sections: [
        {
          key: "legacy",
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

function mustRenderTerms(envelope: RouteDrivenEnvelope): string[] {
  const payload = envelope.big5_result_page_v2;
  const traitTitle = payload.modules.find((module) => module.module_key === "module_03_trait_deep_dive")
    ?.blocks?.[0]?.content?.title_zh;
  const scenarioTitle = payload.modules.find((module) => module.module_key === "module_06_application_matrix")
    ?.blocks?.[0]?.content?.title_zh;

  return [payload.profile_label_zh, traitTitle, scenarioTitle].filter((term): term is string => Boolean(term));
}

describe("Big Five V2 result-page-only public pilot contract", () => {
  it.each(PUBLIC_RESULT_PAGE_FIXTURES.flatMap((fixture) =>
    TESTED_VIEWPORTS.map(([viewport, width]) => [fixture.key, fixture.envelope, viewport, width] as const)
  ))("%s renders public pilot result page on %s without legacy fallback or metadata leaks", (_fixtureKey, envelope, _viewport, width) => {
    window.innerWidth = width;

    render(<RichResultReport locale="zh" reportData={createPublicPilotReport(envelope)} />);

    expect(screen.getByTestId("big5-result-page-v2-shell")).toBeInTheDocument();
    expect(screen.queryByTestId("big5-result-shell")).not.toBeInTheDocument();

    const text = visibleText();
    for (const term of mustRenderTerms(envelope)) {
      expect(text).toContain(term);
    }

    for (const term of MUST_NOT_RENDER_TERMS) {
      expect(text).not.toContain(term);
    }

    expect(text).not.toContain("FRONTEND_FALLBACK_BODY_SHOULD_NOT_RENDER");
  });

  it("keeps PDF, share card, history, and compare covered by backend fixture handoff evidence", () => {
    const surfaces = Object.fromEntries(
      (pilotSurfaceMatrix.surfaces as RenderedSurfaceStatus[]).map((surface) => [surface.surface_key, surface])
    );

    for (const surfaceKey of SECONDARY_SURFACES) {
      expect(surfaces[surfaceKey].status).toBe("pass");
    }
  });

  it("does not synthesize Big Five V2 public pilot body when the V2 payload is missing", () => {
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
    for (const term of PILOT_BODY_TERMS) {
      expect(visibleText()).not.toContain(term);
    }
  });

  it("rejects invalid public pilot V2 payloads instead of manufacturing replacement prose", () => {
    const invalidPayload = structuredClone(o59CanonicalEnvelope).big5_result_page_v2 as {
      modules: Array<{ blocks: Array<{ content: unknown }> }>;
    };
    invalidPayload.modules[0].blocks[0].content = {
      title_zh: "SHOULD_NOT_RENDER_INVALID_PUBLIC_PILOT_PAYLOAD",
      internal_metadata: {
        selector_basis: "forbidden",
      },
    };
    const report = {
      scale_code: "BIG5_OCEAN",
      report: {
        scale_code: "BIG5_OCEAN",
      },
      [BIG5_RESULT_PAGE_V2_PAYLOAD_KEY]: invalidPayload,
    } as ReportResponse;

    expect(getBig5ResultPageV2Payload(report)).toBeNull();

    render(<RichResultReport locale="zh" reportData={report} />);

    expect(screen.queryByTestId("big5-result-page-v2-shell")).not.toBeInTheDocument();
    expect(visibleText()).not.toContain("SHOULD_NOT_RENDER_INVALID_PUBLIC_PILOT_PAYLOAD");
    for (const term of PILOT_BODY_TERMS) {
      expect(visibleText()).not.toContain(term);
    }
  });
});
