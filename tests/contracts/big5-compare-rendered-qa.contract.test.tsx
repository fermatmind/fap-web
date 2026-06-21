import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import compareO59Envelope from "@/tests/fixtures/big5/result_page_v2/compare_o59_route_driven_payload_v0_1.json";

type BigFiveV2CompareSnapshotEnvelope = {
  big5_result_page_v2_compare_snapshot: {
    schema_version: string;
    surface_key: string;
    route_key: string;
    summary_zh: string;
    compare_policy: Record<string, unknown>;
  };
};

const MUST_RENDER_TERMS = [
  "O3_C2_E2_A3_N4",
  "我更适合用敏感、理解和低成本表达来观察自己的工作与恢复节奏。",
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
  "ready_for_pilot",
  "ready_for_runtime",
  "ready_for_production",
  "raw_score",
  "raw_scores",
  "standardized_scores",
  "score_vector",
  "percentile",
  "percentiles",
  "domains",
  "facets",
  "facet_vector",
  "domain_vector",
  "body_zh",
  "modules",
  "blocks",
  "诊断",
  "病症",
  "固定人格类型",
  "敏锐的独立思考者",
  "[object Object]",
] as const;

const M6_RENDERED_FORBIDDEN_TERMS = [
  "private URL",
  "attempt id",
  "footer",
  "Big Five Report Engine",
  "PR3B",
  "AttemptReadController",
  "payload",
  "registry",
] as const;

function BigFiveV2CompareRenderedContract({ envelope }: { envelope: BigFiveV2CompareSnapshotEnvelope }) {
  const payload = envelope.big5_result_page_v2_compare_snapshot;

  return (
    <article data-testid="big5-v2-compare-rendered-contract" data-surface={payload.surface_key}>
      <p>{payload.route_key}</p>
      <p>{payload.summary_zh}</p>
    </article>
  );
}

describe("Big Five V2 compare rendered QA contract", () => {
  it("renders only the backend compare-safe snapshot without raw detail or metadata leaks", () => {
    const envelope = compareO59Envelope as BigFiveV2CompareSnapshotEnvelope;

    render(<BigFiveV2CompareRenderedContract envelope={envelope} />);

    expect(screen.getByTestId("big5-v2-compare-rendered-contract")).toHaveAttribute("data-surface", "compare");
    expect(envelope.big5_result_page_v2_compare_snapshot.schema_version).toBe(
      "fap.big5.result_page_v2.compare_snapshot.v0_1",
    );

    const text = document.body.textContent ?? "";
    for (const term of MUST_RENDER_TERMS) {
      expect(text).toContain(term);
    }

    for (const term of [...MUST_NOT_RENDER_TERMS, ...M6_RENDERED_FORBIDDEN_TERMS]) {
      expect(text).not.toContain(term);
    }
  });

  it("keeps the compare fixture backend-authored, fail-closed, and summary-only", () => {
    const encoded = JSON.stringify(compareO59Envelope);

    expect(encoded).toContain("route_matrix.share_safe_summary_zh");
    expect(encoded).toContain('"frontend_authored_body_allowed":false');
    expect(encoded).toContain('"full_body_regeneration_allowed":false');
    expect(encoded).toContain('"sensitive_emotional_detail_allowed":false');
    expect(encoded).toContain('"invalid_payload_behavior":"fail_closed"');
    expect(encoded).not.toContain("FRONTEND_FALLBACK_BODY_SHOULD_NOT_RENDER");

    for (const term of MUST_NOT_RENDER_TERMS) {
      expect(encoded).not.toContain(term);
    }
  });
});
