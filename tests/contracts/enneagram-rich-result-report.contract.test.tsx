import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RichResultReport, canRenderRichResultReport } from "@/components/result/RichResultReport";
import type { ReportResponse } from "@/lib/api/v0_3";
import forcedChoice144Fixture from "@/tests/fixtures/enneagram/report_forced_choice_144.projection.json";
import likert105Fixture from "@/tests/fixtures/enneagram/report_likert_105.projection.json";

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/result/attempt-enneagram-105",
}));

function asReport(fixture: unknown): ReportResponse {
  return structuredClone(fixture) as ReportResponse;
}

describe("enneagram rich result report contract", () => {
  it("adds Enneagram to the rich result whitelist and renders a dedicated result shell", () => {
    const reportData = asReport(likert105Fixture);

    expect(canRenderRichResultReport(reportData)).toBe(true);

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

    const shell = screen.getByTestId("enneagram-result-shell");
    expect(within(shell).getByTestId("enneagram-form-summary")).toHaveTextContent("Enneagram · 105-question Likert");
    expect(within(shell).getByTestId("enneagram-primary-type")).toHaveTextContent("Primary type · T1");
    expect(within(shell).getByTestId("enneagram-top-types")).toHaveTextContent("Type 1");
    expect(within(shell).getByTestId("enneagram-type-vector")).toHaveTextContent("Type 5");
    expect(within(shell).getByTestId("enneagram-pdf-entry")).toBeInTheDocument();
    expect(within(shell).getByText("Retake test")).toHaveAttribute(
      "href",
      "/en/tests/enneagram-personality-test-nine-types/take?form=enneagram_likert_105"
    );
    expect(screen.queryByTestId("mbti-result-shell")).not.toBeInTheDocument();
    expect(screen.queryByTestId("big5-result-shell")).not.toBeInTheDocument();
  });

  it("renders 105 and 144 through the same result route branch while preserving backend form identity", () => {
    const forcedChoiceReport = asReport(forcedChoice144Fixture);

    render(
      <RichResultReport
        locale="en"
        reportData={forcedChoiceReport}
        accessProjection={{
          attemptId: "attempt-enneagram-144",
          accessState: "ready",
          reportState: "ready",
          pdfState: "unavailable",
          unlockStage: "full",
          unlockSource: "payment",
          reasonCode: null,
          accessLevel: "full",
          variant: "full",
          projectionVersion: 1,
          modulesAllowed: ["enneagram_core", "enneagram_full"],
          modulesPreview: [],
          actions: {
            pageHref: "/en/result/attempt-enneagram-144",
            pdfHref: null,
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

    const shell = screen.getByTestId("enneagram-result-shell");
    expect(within(shell).getByTestId("enneagram-form-summary")).toHaveTextContent(
      "Enneagram · 144-question Forced-Choice"
    );
    expect(within(shell).getByTestId("enneagram-primary-type")).toHaveTextContent("Primary type · T5");
    expect(within(shell).getByText("Retake test")).toHaveAttribute(
      "href",
      "/en/tests/enneagram-personality-test-nine-types/take?form=enneagram_forced_choice_144"
    );
  });
});
