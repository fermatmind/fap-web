import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import manifest from "@/tests/fixtures/riasec/result_page_v2/render_preview_fixture_manifest.v0_1.json";
import resultEnvelope from "@/tests/fixtures/riasec/result_page_v2/result_page_ias_staging_payload.v0_1.json";
import pdfEnvelope from "@/tests/fixtures/riasec/result_page_v2/pdf_ias_staging_payload.v0_1.json";
import shareEnvelope from "@/tests/fixtures/riasec/result_page_v2/share_ias_staging_payload.v0_1.json";
import historyEnvelope from "@/tests/fixtures/riasec/result_page_v2/history_ias_staging_payload.v0_1.json";
import compareEnvelope from "@/tests/fixtures/riasec/result_page_v2/compare_ias_staging_payload.v0_1.json";

type SurfaceKey = "result_page" | "pdf" | "share" | "history" | "compare";

type ResultEnvelope = typeof resultEnvelope;
type PdfEnvelope = typeof pdfEnvelope;
type ShareEnvelope = typeof shareEnvelope;
type HistoryEnvelope = typeof historyEnvelope;
type CompareEnvelope = typeof compareEnvelope;

const SURFACE_FIXTURES: Record<SurfaceKey, unknown> = {
  result_page: resultEnvelope,
  pdf: pdfEnvelope,
  share: shareEnvelope,
  history: historyEnvelope,
  compare: compareEnvelope,
};

function visibleTextFromValue(value: unknown): string {
  if (value == null || typeof value === "boolean") {
    return "";
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(visibleTextFromValue).filter(Boolean).join("\n");
  }

  if (typeof value === "object") {
    return Object.values(value).map(visibleTextFromValue).filter(Boolean).join("\n");
  }

  return "";
}

function RiasecResultRenderedContract({ envelope }: { envelope: ResultEnvelope }) {
  const payload = envelope.riasec_result_page_v2;

  return (
    <article data-testid="riasec-v2-result-rendered-contract" data-surface={payload.surface_key}>
      <h1>{payload.profile.headline_zh}</h1>
      <p>{payload.profile.code}</p>
      <p>
        {payload.profile.primary_label_zh} {payload.profile.secondary_label_zh} {payload.profile.tertiary_label_zh}
      </p>
      <p>{payload.profile.summary_zh}</p>
      {payload.sections.map((section) => (
        <section key={section.module_key} data-module-key={section.module_key}>
          <h2>{section.title_zh}</h2>
          <p>{section.body_zh}</p>
        </section>
      ))}
    </article>
  );
}

function RiasecPdfRenderedContract({ envelope }: { envelope: PdfEnvelope }) {
  const payload = envelope.riasec_result_page_v2_pdf;

  return (
    <article data-testid="riasec-v2-pdf-rendered-contract" data-surface={payload.surface_key}>
      <h1>{payload.title_zh}</h1>
      <p>{payload.profile_code}</p>
      <p>{payload.summary_zh}</p>
      {payload.sections.map((section) => (
        <section key={section.module_key}>{section.content_zh}</section>
      ))}
    </article>
  );
}

function RiasecShareRenderedContract({ envelope }: { envelope: ShareEnvelope }) {
  const payload = envelope.riasec_result_page_v2_share_card;

  return (
    <article data-testid="riasec-v2-share-rendered-contract" data-surface={payload.surface_key}>
      <p>{payload.summary_zh}</p>
    </article>
  );
}

function RiasecHistoryRenderedContract({ envelope }: { envelope: HistoryEnvelope }) {
  const payload = envelope.riasec_result_page_v2_history_snapshot;

  return (
    <article data-testid="riasec-v2-history-rendered-contract" data-surface={payload.surface_key}>
      <p>{payload.profile_code}</p>
      <p>{payload.summary_zh}</p>
    </article>
  );
}

function RiasecCompareRenderedContract({ envelope }: { envelope: CompareEnvelope }) {
  const payload = envelope.riasec_result_page_v2_compare_snapshot;

  return (
    <article data-testid="riasec-v2-compare-rendered-contract" data-surface={payload.surface_key}>
      <p>{payload.profile_code}</p>
      <p>{payload.summary_zh}</p>
    </article>
  );
}

function renderSurface(surfaceKey: SurfaceKey): void {
  if (surfaceKey === "result_page") {
    render(<RiasecResultRenderedContract envelope={resultEnvelope} />);
    return;
  }

  if (surfaceKey === "pdf") {
    render(<RiasecPdfRenderedContract envelope={pdfEnvelope} />);
    return;
  }

  if (surfaceKey === "share") {
    render(<RiasecShareRenderedContract envelope={shareEnvelope} />);
    return;
  }

  if (surfaceKey === "history") {
    render(<RiasecHistoryRenderedContract envelope={historyEnvelope} />);
    return;
  }

  render(<RiasecCompareRenderedContract envelope={compareEnvelope} />);
}

describe("RIASEC result page V2 rendered preview handoff", () => {
  it("keeps the backend handoff manifest staging-only and production blocked", () => {
    expect(manifest.schema).toBe("fap.riasec.result_page_v2.render_preview_fixture_manifest.web.v0_1");
    expect(manifest.runtime_use).toBe("staging_only");
    expect(manifest.production_use_allowed).toBe(false);
    expect(manifest.ready_for_runtime).toBe(false);
    expect(manifest.ready_for_production).toBe(false);
    expect(manifest.cms_write_performed).toBe(false);
    expect(manifest.runtime_wrapper_enabled).toBe(false);
    expect(manifest.frontend_fallback_allowed).toBe(false);
    expect(manifest.backend_fixture_authority).toBe(true);
    expect(manifest.surfaces.map((surface) => surface.surface_key).sort()).toEqual([
      "compare",
      "history",
      "pdf",
      "result_page",
      "share",
    ]);
  });

  it.each(manifest.surfaces)("$surface_key renders expected backend fixture terms without forbidden visible leaks", (surface) => {
    const surfaceKey = surface.surface_key as SurfaceKey;

    renderSurface(surfaceKey);

    expect(screen.getByTestId(`riasec-v2-${surfaceKey === "result_page" ? "result" : surfaceKey}-rendered-contract`)).toHaveAttribute(
      "data-surface",
      surfaceKey === "share" ? "share" : surfaceKey,
    );

    const text = document.body.textContent ?? "";
    for (const term of surface.expected_terms) {
      expect(text).toContain(term);
    }

    for (const term of manifest.forbidden_visible_terms) {
      expect(text).not.toContain(term);
    }
  });

  it("keeps locked and free redaction assertions explicit for preview QA", () => {
    expect(manifest.access_redaction.locked).toEqual({
      full_body_visible: false,
      private_measurements_visible: false,
      norm_rank_visible: false,
      share_summary_visible: false,
    });
    expect(manifest.access_redaction.free).toEqual({
      full_body_visible: true,
      private_measurements_visible: false,
      norm_rank_visible: false,
      share_summary_visible: false,
    });

    const resultPayload = resultEnvelope.riasec_result_page_v2;
    expect(resultPayload.access_state.locked).toEqual(manifest.access_redaction.locked);
    expect(resultPayload.access_state.free).toEqual(manifest.access_redaction.free);
  });

  it("keeps public surface fixtures free of private measurement, fallback, and production activation fields", () => {
    for (const [surfaceKey, fixture] of Object.entries(SURFACE_FIXTURES)) {
      const encoded = JSON.stringify(fixture);

      expect(encoded).toContain(`"surface_key":"${surfaceKey === "share" ? "share" : surfaceKey}"`);
      expect(encoded).not.toContain("FRONTEND_FALLBACK_BODY_SHOULD_NOT_RENDER");
      expect(encoded).not.toContain("production_rollout");
      expect(encoded).not.toContain("production_activation");
      expect(encoded).not.toContain("runtime_wrapper_enabled");
      expect(encoded).not.toContain("source_reference");
      expect(encoded).not.toContain("selector_basis");
      expect(encoded).not.toContain("raw_score");
      expect(encoded).not.toContain("score_vector");
      expect(encoded).not.toContain("percentile");
      expect(encoded).not.toContain("share_block");
      expect(visibleTextFromValue(fixture)).not.toContain("[object Object]");
    }
  });
});
