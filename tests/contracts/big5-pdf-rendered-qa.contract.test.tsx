import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import pdfO59Envelope from "@/tests/fixtures/big5/result_page_v2/pdf_o59_route_driven_payload_v0_1.json";

type BigFiveV2PdfPayloadEnvelope = {
  big5_result_page_v2_pdf: {
    schema_version: string;
    surface_key: string;
    profile_label_zh: string;
    sections: Array<{
      module_key: string;
      blocks: Array<{
        block_key: string;
        block_kind: string;
        content: Record<string, unknown>;
      }>;
    }>;
  };
};

const MUST_RENDER_TERMS = [
  "敏锐的独立思考者",
  "开放性中位",
  "n_high_x_o_mid_high",
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
  "[object Object]",
  "A compact overview",
  "Norms Comparison",
  "Methodology and Access",
] as const;

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

function BigFiveV2PdfRenderedContract({ envelope }: { envelope: BigFiveV2PdfPayloadEnvelope }) {
  const payload = envelope.big5_result_page_v2_pdf;

  return (
    <article data-testid="big5-v2-pdf-rendered-contract" data-surface={payload.surface_key}>
      <h1>{payload.profile_label_zh}</h1>
      {payload.sections.map((section) => (
        <section key={section.module_key} data-module-key={section.module_key}>
          {section.blocks.map((block) => (
            <div key={block.block_key} data-block-kind={block.block_kind}>
              {visibleTextFromValue(block.content)}
            </div>
          ))}
        </section>
      ))}
    </article>
  );
}

describe("Big Five V2 PDF rendered QA contract", () => {
  it("renders the route-driven O59 PDF payload without fallback prose or metadata leaks", () => {
    const envelope = pdfO59Envelope as BigFiveV2PdfPayloadEnvelope;

    render(<BigFiveV2PdfRenderedContract envelope={envelope} />);

    expect(screen.getByTestId("big5-v2-pdf-rendered-contract")).toHaveAttribute("data-surface", "pdf");
    expect(envelope.big5_result_page_v2_pdf.schema_version).toBe("fap.big5.result_page_v2.pdf_payload.v0_1");
    expect(envelope.big5_result_page_v2_pdf.sections.map((section) => section.module_key)).not.toContain(
      "module_08_share_save"
    );

    const text = document.body.textContent ?? "";
    for (const term of MUST_RENDER_TERMS) {
      expect(text).toContain(term);
    }

    for (const term of MUST_NOT_RENDER_TERMS) {
      expect(text).not.toContain(term);
    }
  });

  it("keeps the PDF fixture backend-authored and route-driven only", () => {
    const encoded = JSON.stringify(pdfO59Envelope);

    expect(encoded).toContain("validated_route_driven_big5_result_page_v2_payload");
    expect(encoded).toContain('"frontend_authored_body_allowed":false');
    expect(encoded).toContain('"invalid_payload_behavior":"fail_closed"');
    expect(encoded).not.toContain("FRONTEND_FALLBACK_BODY_SHOULD_NOT_RENDER");

    for (const term of MUST_NOT_RENDER_TERMS) {
      expect(encoded).not.toContain(term);
    }
  });
});
