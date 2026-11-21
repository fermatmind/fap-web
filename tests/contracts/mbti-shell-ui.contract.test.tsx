import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RichResultReport } from "@/components/result/RichResultReport";
import type { ReportResponse } from "@/lib/api/v0_3";
import { fetchPersonalityDesktopCloneContent } from "@/lib/cms/personality-desktop-clone";
import fixture from "@/tests/fixtures/report_ready.mbti.projection.json";
const mocks = vi.hoisted(() => ({ event: vi.fn(), share: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: () => "/zh/result/attempt-123" }));
vi.mock("@/lib/analytics", () => ({ trackEvent: mocks.event, trackObservableFunnelEvent: mocks.event }));
vi.mock("@/lib/cms/personality-desktop-clone", async () => ({ ...await vi.importActual("@/lib/cms/personality-desktop-clone"), fetchPersonalityDesktopCloneContent: vi.fn() }));
vi.mock("@/lib/api/v0_3", async () => ({ ...await vi.importActual("@/lib/api/v0_3"), createAttemptShare: mocks.share }));
vi.mock("@/lib/cms/personality-result-introduction", () => ({ fetchPersonalityResultIntroduction: vi.fn(async (fullCode: string) => ({ fullCode, contentHash: "a".repeat(64), paragraphs: ["Intro one", "Intro two"] })) }));
beforeEach(() => vi.clearAllMocks());
describe("MBTI shared result shell", () => {
  it.each([true, false])("renders the complete editorial report with legacy locked=%s", (locked) => {
    const report = { ...structuredClone(fixture), locked } as unknown as ReportResponse;
    render(<RichResultReport locale="en" reportData={report} />);
    for (const chapter of ["traits", "career", "growth", "relationships"]) expect(screen.getByTestId(`mbti-chapter-${chapter}`)).toBeInTheDocument();
    expect(screen.getByTestId("mbti-evidence-and-prompts")).toBeInTheDocument();
    expect(screen.queryByTestId("mbti-offer-comparison")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mbti-post-purchase-section")).not.toBeInTheDocument();
    expect(fetchPersonalityDesktopCloneContent).not.toHaveBeenCalled();
  });
  it.each([390, 768, 1440])("keeps one result shell at viewport width %i", (width) => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
    render(<RichResultReport locale="en" reportData={fixture as unknown as ReportResponse} />);
    expect(screen.getAllByTestId("mbti-desktop-clone-shell")).toHaveLength(1);
    expect(screen.queryByTestId("mbti-mobile-chrome")).not.toBeInTheDocument();
  });
  it("keeps the bounded result-view event and its existing identity fields", () => {
    render(<RichResultReport locale="zh" reportData={fixture as unknown as ReportResponse} />);
    expect(mocks.event).toHaveBeenCalledWith("view_result", expect.objectContaining({ attempt_id: "attempt-123", typeCode: "ENFP-T", type_code: "ENFP-T", locale: "zh" }));
  });
  it("keeps sample reading interactive while disabling personal share and PDF operations", async () => {
    render(<RichResultReport locale="en" reportData={fixture as unknown as ReportResponse} sampleMode />);
    await waitFor(() => expect(screen.getByTestId("mbti-result-intro")).toHaveAttribute("data-intro-state", "ready"));
    const share = within(screen.getByTestId("mbti-sticky-rail")).getByRole("button", { name: "Share result" });
    expect(share).toBeDisabled(); fireEvent.click(share);
    expect(mocks.share).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "Download PDF" })).not.toBeInTheDocument();
    expect(screen.getByTestId("mbti-chapter-career")).toBeInTheDocument();
  });
});
