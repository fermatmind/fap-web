import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LocaleProvider } from "@/components/i18n/LocaleContext";
import { CookieBanner } from "@/components/legal/CookieBanner";
import { COOKIE_BANNER_ENABLED } from "@/components/layout/siteChromeRules";

const CONSENT_KEY = "fm_consent_v1";

afterEach(() => {
  window.localStorage.clear();
});

describe("cookie banner gate contract", () => {
  it("renders the cookie banner while analytics consent is unknown", () => {
    expect(COOKIE_BANNER_ENABLED).toBe(true);

    render(
      <LocaleProvider locale="zh">
        <CookieBanner />
      </LocaleProvider>
    );

    expect(screen.getByText(/我们使用 Cookie 和分析工具来提升服务质量。/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "接受" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "拒绝" })).toBeInTheDocument();
  });

  it("stores granted analytics consent and hides after accept", () => {
    render(
      <LocaleProvider locale="zh">
        <CookieBanner />
      </LocaleProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "接受" }));

    expect(JSON.parse(window.localStorage.getItem(CONSENT_KEY) || "{}")).toMatchObject({
      analytics: "granted",
    });
    expect(screen.queryByRole("button", { name: "接受" })).toBeNull();
  });
});
