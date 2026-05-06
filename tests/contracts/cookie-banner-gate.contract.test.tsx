import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LocaleProvider } from "@/components/i18n/LocaleContext";
import { CookieBanner } from "@/components/legal/CookieBanner";
import { COOKIE_BANNER_ENABLED } from "@/components/layout/siteChromeRules";

describe("cookie banner gate contract", () => {
  it("does not render the cookie banner while the global site chrome rule disables it", () => {
    expect(COOKIE_BANNER_ENABLED).toBe(false);

    render(
      <LocaleProvider locale="zh">
        <CookieBanner />
      </LocaleProvider>
    );

    expect(screen.queryByText("我们使用 Cookie 和分析工具来提升服务质量。")).toBeNull();
    expect(screen.queryByRole("button", { name: "接受" })).toBeNull();
    expect(screen.queryByRole("button", { name: "拒绝" })).toBeNull();
  });
});
