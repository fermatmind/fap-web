import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Providers } from "@/app/providers";
import { queuePendingAnonLinkAttempt } from "@/lib/anon";
import { setFmToken } from "@/lib/auth/fmToken";

const hoisted = vi.hoisted(() => ({
  initAnalytics: vi.fn(),
  initSentry: vi.fn(),
}));

vi.mock("@/lib/analytics", () => ({
  initAnalytics: hoisted.initAnalytics,
}));

vi.mock("@/lib/observability/sentry", () => ({
  initSentry: hoisted.initSentry,
}));

describe("providers no longer auto-link anon attempts", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    window.localStorage.clear();
    window.sessionStorage.clear();
    hoisted.initAnalytics.mockReset();
    hoisted.initSentry.mockReset();
  });

  it("does not request link-anon while rendering the result page shell", async () => {
    setFmToken("fm_provider_result_123456");
    queuePendingAnonLinkAttempt("attempt_result_001");

    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    render(
      <Providers>
        <div>result page shell</div>
      </Providers>
    );

    await waitFor(() => {
      expect(hoisted.initSentry).toHaveBeenCalledTimes(1);
      expect(hoisted.initAnalytics).toHaveBeenCalledTimes(1);
    });

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("does not request link-anon while rendering the report page shell", async () => {
    setFmToken("fm_provider_report_123456");
    queuePendingAnonLinkAttempt("attempt_report_001");

    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    render(
      <Providers>
        <div>report page shell</div>
      </Providers>
    );

    await waitFor(() => {
      expect(hoisted.initSentry).toHaveBeenCalledTimes(1);
      expect(hoisted.initAnalytics).toHaveBeenCalledTimes(1);
    });

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
