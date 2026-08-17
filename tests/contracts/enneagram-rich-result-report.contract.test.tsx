import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RichResultReport, canRenderRichResultReport } from "@/components/result/RichResultReport";
import type { ReportResponse } from "@/lib/api/v0_3";
import forcedChoice144Fixture from "@/tests/fixtures/enneagram/report_forced_choice_144.projection.json";
import likert105Fixture from "@/tests/fixtures/enneagram/report_likert_105.projection.json";
import { bindCanonicalEnneagramReport } from "@/tests/contracts/helpers/enneagramCanonicalAuthority";

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/result/attempt-enneagram-105",
}));

function asReport(fixture: unknown): ReportResponse {
  return structuredClone(fixture) as ReportResponse;
}

function createRestrictedV2Report(): ReportResponse {
  return bindCanonicalEnneagramReport({
    ok: true,
    locale: "en",
    attempt_id: "attempt-enneagram-preview",
    scale_code: "ENNEAGRAM",
    locked: true,
    variant: "preview",
    access_level: "preview",
    modules_allowed: ["enneagram_core"],
    modules_preview: [],
    enneagram_form_v1: {
      form_code: "enneagram_likert_105",
      label: "105-question Likert",
      short_label: "105Q Likert",
      question_count: 105,
      estimated_minutes: 12,
      scale_code: "ENNEAGRAM",
    },
    report: {
      schema_version: "enneagram.report.v1",
      scale_code: "ENNEAGRAM",
      _meta: {
        enneagram_report_v2: {
          locale: "en",
          schema_version: "enneagram.report.v2",
          scale_code: "ENNEAGRAM",
          form: {
            form_code: "enneagram_likert_105",
            form_kind: "likert",
            methodology_variant: "e105_standard",
          },
          registry: {
            registry_version: "enneagram_registry.v1",
          },
          classification: {
            interpretation_scope: "clear",
            confidence_level: "high_confidence",
            interpretation_reason: "fixture",
          },
          pages: [
            {
              page_key: "page_1_result_overview",
              title: "Result overview",
              purpose: "preview-safe overview",
              visibility: "visible",
              modules: [
                {
                  module_key: "instant_summary",
                  module_code: "enneagram_core",
                  access_level: "free",
                  kind: "summary_card",
                  visibility: "visible",
                  state: "clear",
                  form_variant: "all",
                  content: {
                    locale: "en",
                    title: "Preview summary",
                    body: "Preview-safe Enneagram copy.",
                  },
                },
                {
                  module_key: "top3_cards",
                  module_code: "enneagram_core",
                  access_level: "free",
                  kind: "cards_grid",
                  visibility: "visible",
                  state: "clear",
                  form_variant: "all",
                  content: {
                    locale: "en",
                    cards: [
                      { type: "1", type_name_en: "Type 1" },
                      { type: "6", type_name_en: "Type 6" },
                      { type: "9", type_name_en: "Type 9" },
                    ],
                  },
                },
                {
                  module_key: "method_boundary",
                  module_code: "enneagram_core",
                  access_level: "free",
                  kind: "boundary_card",
                  visibility: "visible",
                  state: "clear",
                  form_variant: "e105",
                  content: {
                    locale: "en",
                    methodology_copy: "Canonical E105 method boundary.",
                  },
                },
              ],
            },
            {
              page_key: "page_2_work_reality",
              title: "Work reality",
              purpose: "paid work modules",
              visibility: "visible",
              modules: [
                {
                  module_key: "work_style_summary",
                  module_code: "enneagram_full",
                  access_level: "paid",
                  kind: "summary_card",
                  visibility: "visible",
                  state: "clear",
                  form_variant: "all",
                  content: {
                    locale: "en",
                    title: "Paid work style",
                    body: "Paid Enneagram work copy.",
                  },
                },
              ],
            },
          ],
          modules: [],
        },
      },
    },
  } as ReportResponse, "en");
}

describe("enneagram rich result report contract", () => {
  it("rejects legacy locale-less Enneagram payloads instead of rendering a private fallback", () => {
    const reportData = asReport(likert105Fixture);

    expect(canRenderRichResultReport(reportData)).toBe(false);

    render(
      <RichResultReport
        locale="en"
        reportData={reportData}
        accessProjection={{
          attemptId: "attempt-enneagram-105",
          accessState: "ready",
          reportState: "ready",
          pdfState: "ready",
          unlockStage: "full",
          unlockSource: "payment",
          reasonCode: null,
          accessLevel: "full",
          variant: "full",
          projectionVersion: 1,
          modulesAllowed: ["enneagram_core", "enneagram_full"],
          modulesPreview: [],
          actions: {
            pageHref: "/en/result/attempt-enneagram-105",
            pdfHref: "/api/v0.3/attempts/attempt-enneagram-105/report.pdf",
            waitHref: null,
            historyHref: "/en/history/enneagram",
            lookupHref: null,
          },
          meta: {
            producedAt: null,
            refreshedAt: null,
          },
        }}
      />
    );

    expect(screen.getByTestId("enneagram-canonical-payload-unavailable")).toBeInTheDocument();
    expect(screen.queryByTestId("enneagram-result-shell")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mbti-result-shell")).not.toBeInTheDocument();
    expect(screen.queryByTestId("big5-result-shell")).not.toBeInTheDocument();
  });

  it("rejects a locale-less 144 payload instead of treating it as a valid English private result", () => {
    const forcedChoiceReport = asReport(forcedChoice144Fixture);
    expect(canRenderRichResultReport(forcedChoiceReport)).toBe(false);
  });

  it("applies the rich result access gate before rendering locked Enneagram V2 pages", () => {
    render(<RichResultReport locale="en" reportData={createRestrictedV2Report()} />);

    expect(screen.getByTestId("enneagram-result-shell")).toBeInTheDocument();
    expect(screen.getByText("Preview-safe Enneagram copy.")).toBeInTheDocument();
    expect(screen.queryByText("Paid Enneagram work copy.")).not.toBeInTheDocument();
    expect(screen.queryByTestId("enneagram-v2-page-page_2_work_reality")).not.toBeInTheDocument();
  });
});
