import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
import { accountText, accountDataLocale } from "@/lib/account/displayLocale";
import { accountNavigationPath } from "@/lib/account/navigation";
import { accountLanguageHref } from "@/lib/i18n/accountDisplayRoutes";
import { traditionalPath, TRADITIONAL_PUBLIC_PATHS, traditionalEquivalent } from "@/lib/i18n/traditionalRoutes";
import { shouldIncludeInSitemap, shouldNoindex } from "@/lib/seo/indexingPolicy";
import { getBrowserAnalyticsSuppressionDecision } from "@/lib/tracking/browserAnalyticsSuppression";
import { AccountLink } from "@/components/account/AccountLink";

describe("Taiwan account boundary", () => {
  it("keeps third-language display separate from existing guest and history data locale", () => {
    expect(accountDataLocale("zh-TW")).toBe("zh");
    expect(accountDataLocale("zh")).toBe("zh");
    expect(accountDataLocale("en")).toBe("en");
    expect(accountText("zh-TW", "账号设置")).toBe("帳號設定");
    expect(accountText("zh", "账号设置")).toBe("账号设置");
    expect(() => accountText("zh-TW", "unknown reader data")).toThrow();
  });
  it("carries a valid proof only into the three fixed private account pages", () => {
    const proof = "a".repeat(64);
    expect(accountLanguageHref("zh-TW", "settings", proof)).toBe(`/zh-TW/account?section=settings#verify=${proof}`);
    expect(accountLanguageHref("en", "overview", proof)).toBe(`/en/account#verify=${proof}`);
    expect(accountLanguageHref("zh", "reports&email=private", "bad&token=value")).toBe("/zh/account");
    expect(accountLanguageHref("zh-TW", "reports", "short")).toBe("/zh-TW/account?section=reports");
  });
  it("links unavailable reports to an explicitly labelled existing language", () => {
    const path = accountNavigationPath("/result/synthetic-attempt", "zh-TW");
    expect(path).toBe("/zh/result/synthetic-attempt");
    expect(accountNavigationPath("/account?section=settings#account-email", "zh-TW")).toBe("/zh-TW/account?section=settings#account-email");
    expect(accountNavigationPath("/about", "zh-TW")).toBe("/zh-TW/about");
    expect(accountNavigationPath("/", "zh-TW")).toBe("/zh-TW");
    const html = renderToStaticMarkup(<AccountLink displayLocale="zh-TW" href={path}>檢視結果</AccountLink>);
    expect(html).toContain("簡體中文");
    expect(html).toContain('hrefLang="zh-CN"');
    for (const bad of ["https://external.invalid", "//external.invalid", "/\\external.invalid", "/\n/external.invalid"]) {
      expect(() => accountNavigationPath(bad, "zh-TW")).toThrow();
    }
  });
  it.each(["en", "zh", "zh-TW"] as const)("keeps %s account out of search and analytics", locale => {
    const path = `/${locale}/account`;
    expect(traditionalPath(path)).toBe("/zh-TW/account");
    expect(traditionalEquivalent(path)).toBeNull();
    expect(TRADITIONAL_PUBLIC_PATHS).not.toContain("/account");
    expect(shouldNoindex(path, null)).toBe(true);
    expect(shouldIncludeInSitemap(path)).toBe(false);
    expect(getBrowserAnalyticsSuppressionDecision({ pathname: path, search: "" }).suppressed).toBe(true);
  });
  it("applies the existing private Google sign-in policy to the exact Taiwan account route", async () => {
    const response = await proxy(new NextRequest("https://example.com/zh-TW/account"));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("x-robots-tag")).toContain("noindex");
    expect(response.headers.get("cross-origin-opener-policy")).toBe("same-origin-allow-popups");
    expect(response.headers.get("referrer-policy")).toBe("strict-origin-when-cross-origin");
    expect(response.headers.get("x-middleware-request-x-fm-private-analytics-suppressed")).toBe("true");
    const csp = response.headers.get("content-security-policy-report-only") ?? response.headers.get("content-security-policy");
    expect(csp).toContain("https://accounts.google.com");
  });
});
