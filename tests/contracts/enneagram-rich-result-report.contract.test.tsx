import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RichResultReport, canRenderRichResultReport } from "@/components/result/RichResultReport";
import type { ReportResponse } from "@/lib/api/v0_3";
import forcedChoice144Fixture from "@/tests/fixtures/enneagram/report_forced_choice_144.projection.json";
import likert105Fixture from "@/tests/fixtures/enneagram/report_likert_105.projection.json";
import { createSevenChapterReport } from "@/tests/contracts/helpers/enneagramSevenChapterFixture";

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/result/attempt-enneagram-105",
}));

function asReport(fixture: unknown): ReportResponse {
  return structuredClone(fixture) as ReportResponse;
}

function createRestrictedV2Report(): ReportResponse {
  const report = createSevenChapterReport();
  Object.assign(report, { attempt_id: "attempt-enneagram-preview", scale_code: "ENNEAGRAM", locked: false, variant: "full", access_level: "full", modules_allowed: ["enneagram_core", "enneagram_full"], modules_preview: [] });
  return report;
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

  it("routes an entitled canonical result into the production seven-chapter shell", () => {
    render(<RichResultReport locale="en" reportData={createRestrictedV2Report()} />);

    expect(screen.getByTestId("enneagram-result-shell")).toBeInTheDocument();
    expect(screen.getByText("body_for_clear")).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(7);
  });
});
