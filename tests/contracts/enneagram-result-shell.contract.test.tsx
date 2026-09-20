import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EnneagramResultShell } from "@/components/result/enneagram/EnneagramResultShell";
import { assembleEnneagramResultViewModel } from "@/lib/enneagram/resultAssembler";
import { createSevenChapterReport } from "@/tests/contracts/helpers/enneagramSevenChapterFixture";

const api = vi.hoisted(() => ({ fetch: vi.fn(), assign: vi.fn(), day3: vi.fn(), day7: vi.fn() }));
vi.mock("@/lib/api/v0_3", async () => ({ ...(await vi.importActual<typeof import("@/lib/api/v0_3")>("@/lib/api/v0_3")), fetchEnneagramObservation: api.fetch, assignEnneagramObservation: api.assign, submitEnneagramObservationDay3: api.day3, submitEnneagramObservationDay7: api.day7 }));
vi.mock("@/components/big5/pdf/PdfDownloadButton", () => ({ PdfDownloadButton: () => <button type="button">PDF</button> }));

function renderResult(options: Parameters<typeof createSevenChapterReport>[0] = {}) {
  const locale = options.locale === "zh-CN" ? "zh" : "en";
  const viewModel = assembleEnneagramResultViewModel({ reportData: createSevenChapterReport(options), locale, gate: { isFreeVariant: false } });
  return render(<EnneagramResultShell locale={locale} attemptId="attempt-1" reportLocked={false} viewModel={viewModel} />);
}

describe("Enneagram production seven-chapter shell", () => {
  beforeEach(() => { api.fetch.mockResolvedValue({ observation_state_v1: null }); api.assign.mockResolvedValue({ observation_state_v1: { version: "enneagram_observation_state.v1", attempt_id: "attempt-1", scale_code: "ENNEAGRAM", status: "active", tasks: [] } }); });

  it.each(["clear", "close_call", "diffuse", "low_quality"] as const)("renders the %s state with seven ordered chapters", async (scope) => {
    renderResult({ scope });
    expect(screen.getByTestId("enneagram-result-shell")).toHaveAttribute("data-interpretation-scope", scope);
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(7);
    expect(screen.getByRole("img", { name: /relative distribution/i })).toBeInTheDocument();
    expect(screen.queryByTestId("enneagram-pair-comparison")).toBe(scope === "close_call" ? screen.getByTestId("enneagram-pair-comparison") : null);
    await waitFor(() => expect(api.fetch).toHaveBeenCalled());
  });

  it("renders both close-call sides and keeps the comparison stable when the reading candidate changes", () => {
    renderResult({ scope: "close_call", top: [8, 3, 9] });
    const comparison = screen.getByTestId("enneagram-pair-comparison");
    expect(comparison).toHaveTextContent("Type 8 vs Type 3");
    expect(comparison).toHaveTextContent("core_motivation for type 8");
    expect(comparison).toHaveTextContent("core_motivation for type 3");
    fireEvent.click(screen.getByRole("button", { name: /#2 · Type 3/ }));
    expect(screen.getByTestId("enneagram-pair-comparison")).toHaveTextContent("Type 8 vs Type 3");
  });

  it("switches the reading candidate without mutating the scored result", () => {
    renderResult();
    expect(screen.getAllByText("Lead 1-2.1")).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: /#2 · Type 6/ }));
    expect(screen.getAllByText("Lead 6-2.1")).toHaveLength(2);
    expect(screen.getByTestId("enneagram-result-shell")).toHaveAttribute("data-interpretation-scope", "clear");
  });

  it.each([["enneagram_likert_105", "e105"], ["enneagram_forced_choice_144", "fc144"]] as const)("renders %s from real API data", (formCode, variant) => {
    renderResult({ formCode });
    expect(screen.getByTestId("enneagram-result-shell")).toHaveAttribute("data-form-variant", variant);
    expect(screen.getAllByText(/same model, separate score spaces/).length).toBeGreaterThan(0);
  });

  it("renders all twenty formal sections and the nine non-assigning theory levels", () => {
    renderResult();
    expect(document.querySelectorAll("[data-section-id]")).toHaveLength(20);
    expect(screen.getByText("THEORY · NOT AN ASSIGNMENT")).toBeInTheDocument();
    expect(screen.getByText("Level 9")).toBeInTheDocument();
  });

  it("connects action selection and observation assignment without rewriting results", async () => {
    renderResult();
    fireEvent.click(screen.getByRole("button", { name: /Action 1-1/ }));
    expect(screen.getByRole("button", { name: /Action 1-1/ })).toHaveAttribute("aria-pressed", "true");
    await waitFor(() => expect(screen.getByRole("button", { name: "Start observation" })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Start observation" }));
    await waitFor(() => expect(api.assign).toHaveBeenCalledWith({ attemptId: "attempt-1", selectedActionId: "type-1-action-01" }));
  });

  it.each([["en", "Enneagram type assessment results"], ["zh-CN", "九型人格类型测评结果"]] as const)("renders a complete %s page", (locale, title) => {
    renderResult({ locale });
    expect(screen.getByRole("heading", { level: 1, name: title })).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("[object Object]");
    expect(document.body).not.toHaveTextContent("previewContent");
  });
});
