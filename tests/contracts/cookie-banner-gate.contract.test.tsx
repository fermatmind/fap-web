import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LocaleProvider } from "@/components/i18n/LocaleContext";
import { CookieBanner } from "@/components/legal/CookieBanner";
import { COOKIE_BANNER_ENABLED } from "@/components/layout/siteChromeRules";

const CONSENT_KEY = "fm_consent_v1";

afterEach(() => {
  window.localStorage.clear();
});

describe("cookie banner gate contract", () => {
  it("renders the cookie banner while analytics consent is unknown after hydration", async () => {
    expect(COOKIE_BANNER_ENABLED).toBe(true);

    render(
      <LocaleProvider locale="zh">
        <CookieBanner />
      </LocaleProvider>
    );

    expect(await screen.findByText(/我们使用 Cookie 和分析工具来提升服务质量。/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "接受" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "拒绝" })).toBeInTheDocument();
  });

  it("stores granted analytics consent and hides after accept", async () => {
    render(
      <LocaleProvider locale="zh">
        <CookieBanner />
      </LocaleProvider>
    );

    fireEvent.click(await screen.findByRole("button", { name: "接受" }));

    expect(JSON.parse(window.localStorage.getItem(CONSENT_KEY) || "{}")).toMatchObject({
      analytics: "granted",
    });
    await waitFor(() => expect(screen.queryByRole("button", { name: "接受" })).toBeNull());
  });

  it("does not render a pre-hydration clickable banner before reading browser consent state", () => {
    window.localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({ analytics: "granted", updatedAt: "2026-05-28T00:00:00.000Z" })
    );

    render(
      <LocaleProvider locale="zh">
        <CookieBanner />
      </LocaleProvider>
    );

    expect(screen.queryByRole("button", { name: "接受" })).toBeNull();
  });
});
