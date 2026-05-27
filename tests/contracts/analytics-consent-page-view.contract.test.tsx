import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "@/components/i18n/LocaleContext";
import { CookieBanner } from "@/components/legal/CookieBanner";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";

const hoisted = vi.hoisted(() => ({
  pathname: "/zh/tests/mbti-personality-test-16-personality-types",
  trackEvent: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => hoisted.pathname,
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: hoisted.trackEvent,
}));

afterEach(() => {
  window.localStorage.clear();
  hoisted.trackEvent.mockReset();
});

describe("analytics consent page view replay contract", () => {
  it("does not send page view before consent and replays once after accept", async () => {
    render(
      <LocaleProvider locale="zh">
        <AnalyticsPageViewTracker eventName="view_landing" properties={{ locale: "zh" }} />
        <CookieBanner />
      </LocaleProvider>
    );

    expect(hoisted.trackEvent).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "接受" }));

    await waitFor(() => {
      expect(hoisted.trackEvent).toHaveBeenCalledTimes(1);
    });
    expect(hoisted.trackEvent).toHaveBeenCalledWith("view_landing", { locale: "zh" });

    window.dispatchEvent(new CustomEvent("fm:analytics-consent-updated", { detail: { analytics: "granted" } }));
    expect(hoisted.trackEvent).toHaveBeenCalledTimes(1);
  });

  it("does not replay page view after denied consent", async () => {
    render(
      <LocaleProvider locale="zh">
        <AnalyticsPageViewTracker eventName="view_landing" properties={{ locale: "zh" }} />
        <CookieBanner />
      </LocaleProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "拒绝" }));

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "拒绝" })).toBeNull();
    });
    expect(hoisted.trackEvent).not.toHaveBeenCalled();
  });
});
