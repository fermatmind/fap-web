import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "@/components/i18n/LocaleContext";
import { CookieBanner } from "@/components/legal/CookieBanner";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { Providers } from "@/app/providers";

const hoisted = vi.hoisted(() => ({
  pathname: "/zh/tests/mbti-personality-test-16-personality-types",
  initAnalytics: vi.fn(),
  trackLandingPageView: vi.fn(),
  trackEvent: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => hoisted.pathname,
}));

vi.mock("@/lib/analytics", () => ({
  initAnalytics: hoisted.initAnalytics,
  trackLandingPageView: hoisted.trackLandingPageView,
  trackEvent: hoisted.trackEvent,
}));

vi.mock("@/lib/observability/sentry", () => ({
  initSentry: vi.fn(),
}));

afterEach(() => {
  window.localStorage.clear();
  hoisted.initAnalytics.mockReset();
  hoisted.trackLandingPageView.mockReset();
  hoisted.trackEvent.mockReset();
});

describe("analytics consent page view replay contract", () => {
  it("does not send page view before consent and replays once after accept", async () => {
    render(
      <Providers>
        <LocaleProvider locale="zh">
          <AnalyticsPageViewTracker eventName="view_landing" properties={{ locale: "zh" }} />
          <CookieBanner />
        </LocaleProvider>
      </Providers>
    );

    expect(hoisted.trackLandingPageView).not.toHaveBeenCalled();
    expect(hoisted.initAnalytics).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "接受" }));

    await waitFor(() => {
      expect(hoisted.trackLandingPageView).toHaveBeenCalledTimes(1);
      expect(hoisted.initAnalytics).toHaveBeenCalledTimes(2);
    });
    expect(hoisted.trackLandingPageView).toHaveBeenCalledWith({ locale: "zh" });
    expect(hoisted.trackEvent).not.toHaveBeenCalled();

    window.dispatchEvent(new CustomEvent("fm:analytics-consent-updated", { detail: { analytics: "granted" } }));
    expect(hoisted.trackLandingPageView).toHaveBeenCalledTimes(1);
    expect(hoisted.initAnalytics).toHaveBeenCalledTimes(3);
  });

  it("does not replay page view after denied consent", async () => {
    render(
      <Providers>
        <LocaleProvider locale="zh">
          <AnalyticsPageViewTracker eventName="view_landing" properties={{ locale: "zh" }} />
          <CookieBanner />
        </LocaleProvider>
      </Providers>
    );

    fireEvent.click(screen.getByRole("button", { name: "拒绝" }));

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "拒绝" })).toBeNull();
    });
    expect(hoisted.trackLandingPageView).not.toHaveBeenCalled();
    expect(hoisted.trackEvent).not.toHaveBeenCalled();
    expect(hoisted.initAnalytics).toHaveBeenCalledTimes(1);
  });
});
