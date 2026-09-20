import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EnneagramResultShell } from "@/components/result/enneagram/EnneagramResultShell";
import { assembleEnneagramResultViewModel } from "@/lib/enneagram/resultAssembler";
import { createSevenChapterReport } from "@/tests/contracts/helpers/enneagramSevenChapterFixture";

const api = vi.hoisted(() => ({ fetch: vi.fn(), assign: vi.fn(), day3: vi.fn(), day7: vi.fn() }));
vi.mock("@/lib/api/v0_3", async () => ({ ...(await vi.importActual<typeof import("@/lib/api/v0_3")>("@/lib/api/v0_3")), fetchEnneagramObservation: api.fetch, assignEnneagramObservation: api.assign, submitEnneagramObservationDay3: api.day3, submitEnneagramObservationDay7: api.day7 }));
vi.mock("@/components/big5/pdf/PdfDownloadButton", () => ({ PdfDownloadButton: () => null }));

const state = (extra: Record<string, unknown> = {}) => ({ version: "enneagram_observation_state.v1", attempt_id: "attempt-1", scale_code: "ENNEAGRAM", status: "active", tasks: [], ...extra });
function renderShell() { const viewModel = assembleEnneagramResultViewModel({ reportData: createSevenChapterReport({ locale: "zh-CN" }), locale: "zh", gate: { isFreeVariant: false } }); return render(<EnneagramResultShell locale="zh" attemptId="attempt-1" reportLocked={false} viewModel={viewModel} />); }

describe("Enneagram observation surface", () => {
  beforeEach(() => { api.fetch.mockResolvedValue({ observation_state_v1: null }); api.assign.mockResolvedValue({ observation_state_v1: state() }); api.day3.mockResolvedValue({ observation_state_v1: state({ day3_observation_feedback: { more_like: "top1" } }) }); api.day7.mockResolvedValue({ observation_state_v1: state({ day7_resonance_feedback: { final_resonance: "top2" }, user_confirmed_type: "6" }) }); });
  it("assigns the selected action into the seven-day observation evidence", async () => { renderShell(); expect(await screen.findByTestId("enneagram-observation-guidance")).toHaveTextContent("不会静默改写"); expect(screen.getByTestId("enneagram-observation-assign")).toBeDisabled(); fireEvent.click(screen.getByRole("button", { name: /Action 1-1/ })); fireEvent.click(screen.getByTestId("enneagram-observation-assign")); await waitFor(() => expect(api.assign).toHaveBeenCalledWith({ attemptId: "attempt-1", selectedActionId: "type-1-action-01" })); expect(await screen.findByTestId("enneagram-observation-day3-form")).toBeInTheDocument(); });
  it("submits Day 3 observable evidence", async () => { api.fetch.mockResolvedValue({ observation_state_v1: state() }); renderShell(); fireEvent.change(await screen.findByLabelText("证据句"), { target: { value: "在冲突中先核对了真实动机。" } }); fireEvent.click(screen.getByRole("button", { name: "提交 Day 3" })); await waitFor(() => expect(api.day3).toHaveBeenCalledWith({ attemptId: "attempt-1", payload: expect.objectContaining({ evidence_sentence: "在冲突中先核对了真实动机。" }) })); expect(await screen.findByTestId("enneagram-observation-day3-summary")).toBeInTheDocument(); });
  it("submits Day 7 self-observation without changing the result", async () => { api.fetch.mockResolvedValue({ observation_state_v1: state({ day3_observation_feedback: { more_like: "top1" } }) }); renderShell(); fireEvent.change(await screen.findByLabelText("自我观察确认号码"), { target: { value: "6" } }); fireEvent.click(screen.getByRole("button", { name: "提交 Day 7" })); await waitFor(() => expect(api.day7).toHaveBeenCalledWith({ attemptId: "attempt-1", payload: expect.objectContaining({ user_confirmed_type: "6" }) })); expect(await screen.findByTestId("enneagram-observation-user-confirmed")).toHaveTextContent("系统结果保持不变"); });
});
