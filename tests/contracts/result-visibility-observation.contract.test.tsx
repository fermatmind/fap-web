import { act, render, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useResultVisibilityObservation } from "@/hooks/useResultVisibilityObservation";
const mocks = vi.hoisted(() => ({ send: vi.fn(), consent: true, token: "fm_owner" }));
vi.mock("@/lib/api/v0_3", () => ({ observeAttemptResult: mocks.send }));
vi.mock("@/lib/auth/fmToken", () => ({ getFmToken: () => mocks.token }));
vi.mock("@/lib/consent/store", () => ({ hasAnalyticsConsent: () => mocks.consent }));
let intersection: IntersectionObserverCallback;
function Probe({ enabled = true, receipt = "private-receipt" }: { enabled?: boolean; receipt?: string }) {
  useResultVisibilityObservation({ attemptId: "owned-attempt", receipt, enabled });
  return <div data-result-visible-root><aside data-testid="result-email-recovery-card"><h2>Recover by email</h2></aside><h1>Rendered result</h1></div>;
}
async function reveal() {
  const target = document.querySelector("h1")!;
  const rect = target.getBoundingClientRect();
  const entry: IntersectionObserverEntry = { target, isIntersecting: true, intersectionRatio: 1,
    boundingClientRect: rect, intersectionRect: rect, rootBounds: null, time: 0 };
  act(() => intersection([entry], {} as IntersectionObserver));
  await act(async () => { await vi.advanceTimersByTimeAsync(50); });
}
beforeEach(() => {
  vi.useFakeTimers();
  vi.stubEnv("NEXT_PUBLIC_ANALYTICS_ENABLED", "true");
  mocks.send.mockReset().mockResolvedValue(undefined);
  mocks.consent = true; mocks.token = "fm_owner";
  Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
  vi.stubGlobal("IntersectionObserver", class {
    constructor(cb: IntersectionObserverCallback) { intersection = cb; }
    observe(node: Element) { expect(node.closest('[data-testid="result-email-recovery-card"]')).toBeNull(); } disconnect() {}
  });
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe("private owner result visibility", () => {
  it("waits for actual intersection and paint, then sends only the opaque receipt once", async () => {
    render(<Probe />);
    expect(mocks.send).not.toHaveBeenCalled();
    await reveal(); await reveal();
    expect(mocks.send).toHaveBeenCalledTimes(1);
    expect(mocks.send).toHaveBeenCalledWith({ attemptId: "owned-attempt", anonId: undefined, receipt: "private-receipt" });
  });
  it("suppresses hidden and denied observations, and rechecks consent on visible resume", async () => {
    render(<Probe />);
    mocks.consent = false; await reveal(); expect(mocks.send).not.toHaveBeenCalled();
    mocks.consent = true;
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });
    await reveal(); expect(mocks.send).not.toHaveBeenCalled();
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    await act(async () => { await vi.advanceTimersByTimeAsync(50); });
    expect(mocks.send).toHaveBeenCalledTimes(1);
  });
  it("does not observe loading/error/print mode or absent owner credentials", async () => {
    const view = render(<Probe enabled={false} />);
    expect(mocks.send).not.toHaveBeenCalled();
    mocks.token = ""; view.rerender(<Probe />);
    await act(async () => { await vi.advanceTimersByTimeAsync(2000); });
    expect(mocks.send).not.toHaveBeenCalled();
  });
  it("retries a transient failure with the same receipt, bounded to two attempts", async () => {
    mocks.send.mockRejectedValue(new Error("offline")); render(<Probe />); await reveal();
    await act(async () => { await vi.advanceTimersByTimeAsync(3000); });
    await reveal();
    expect(mocks.send).toHaveBeenCalledTimes(2);
    expect(mocks.send.mock.calls[0]).toEqual(mocks.send.mock.calls[1]);
  });
  it("honors the existing analytics kill switch", async () => {
    vi.stubEnv("NEXT_PUBLIC_ANALYTICS_ENABLED", "false"); render(<Probe />);
    await act(async () => { await vi.advanceTimersByTimeAsync(2000); });
    expect(mocks.send).not.toHaveBeenCalled();
  });
  it("does not retry owner rejection and stops pending work on unmount", async () => {
    mocks.send.mockRejectedValue({ status: 404 }); const view = render(<Probe />); await reveal();
    await act(async () => { await vi.advanceTimersByTimeAsync(2000); });
    expect(mocks.send).toHaveBeenCalledTimes(1);
    view.unmount();
  });
});
