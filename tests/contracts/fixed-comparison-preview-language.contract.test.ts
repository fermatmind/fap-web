import { execFileSync } from "node:child_process";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
import { generateMetadata } from "@/app/(localized)/[locale]/career-compare/[pair]/page";
import { listModularComparisonSpecs } from "@/lib/career/modularComparisons";
import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveLocaleSwitchHref, resolveTraditionalSwitchHref } from "@/components/i18n/useLocaleSwitchHref";

import { comparisonDisplayMarkdown, isFixedComparisonPreviewEnabled } from "@/lib/career/fixedComparisonPreview";

vi.mock("@/lib/career/fixedComparisonDraft", () => ({
  readFixedComparisonDraft: () => ({ title: "Markdown title", description: "Markdown description" }),
}));

afterEach(() => vi.unstubAllEnvs());

describe("Fixed comparison preview language identity", () => {
  it.each(["production", "development"])("opens the released reader by default in %s", environment => {
    vi.stubEnv("NODE_ENV", environment);
    vi.stubEnv("FERMATMIND_FIXED_COMPARE_ENABLED", undefined);
    expect(isFixedComparisonPreviewEnabled()).toBe(true);
    vi.stubEnv("FERMATMIND_FIXED_COMPARE_ENABLED", "0");
    expect(isFixedComparisonPreviewEnabled()).toBe(false);
    vi.stubEnv("FERMATMIND_FIXED_COMPARE_ENABLED", "1");
    expect(isFixedComparisonPreviewEnabled()).toBe(true);
  });
  const id = "computer-systems-analysts-vs-database-architects";
  it("preserves the pair when switching from Traditional to either source language", () => {
    expect(resolveLocaleSwitchHref(`/zh-TW/career-compare/${id}`, "en")).toBe(`/en/career-compare/${id}`);
    expect(resolveLocaleSwitchHref(`/zh-TW/career-compare/${id}`, "zh")).toBe(`/zh/career-compare/${id}`);
  });
  it("uses the rendered Traditional counterpart and rejects a different pair or external target", () => {
    const page = document.createElement("div");
    page.innerHTML = `<nav data-comparison-languages><a lang="zh-TW" href="/zh-TW/career-compare/${id}">繁體中文</a></nav>`;
    expect(resolveTraditionalSwitchHref(`/en/career-compare/${id}`, page)).toBe(`/zh-TW/career-compare/${id}`);
    expect(resolveTraditionalSwitchHref("/en/career-compare/another-pair", page)).toBe("/zh-TW/tests");
    page.querySelector("a")!.href = `https://other.example/zh-TW/career-compare/${id}`;
    expect(resolveTraditionalSwitchHref(`/en/career-compare/${id}`, page)).toBe("/zh-TW/tests");
  });
});

describe("Incomplete exercise display", () => {
  const prefix = Array.from({ length: 6 }, (_, i) => `## ${i + 1}\nKeep ${i}\n`).join("");
  it("hides an exercise without an answer, preserving other modules", () => {
    const input = `${prefix}## 7\nTry this\n## 8\nFAQ\n`;
    expect(comparisonDisplayMarkdown(input)).toBe(`${prefix}## 8\nFAQ\n`);
  });
  it.each(["样答", "樣答", "Sample answer"])("keeps an exercise with %s", label => {
    const input = `${prefix}## 7\n${label}\n## 8\nFAQ\n`;
    expect(comparisonDisplayMarkdown(input)).toBe(input);
  });
});

describe("Released fixed comparison boundary", () => {
  it("binds every three-language draft and context to the approved manifest", () => {
    expect(execFileSync(process.execPath, ["scripts/career/check-comparison-assets.mjs"], { encoding: "utf8" })).toContain("734 pairs, 2202 source/context bindings");
  });
  it.each(listModularComparisonSpecs())("indexes only the registered $locale/$pairId reader", async ({ locale, pairId }) => {
    vi.stubEnv("FERMATMIND_FIXED_COMPARE_ENABLED", "1");
    const path = `/${locale}/career-compare/${pairId}`;
    const metadata = await generateMetadata({ params: Promise.resolve({ locale, pair: pairId }) });
    expect(metadata.robots).toEqual({ index: true, follow: true });
    expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`);

    const response = await proxy(new NextRequest(`https://fermatmind.com${path}`));
    expect(response.status).toBe(200);
    expect(response.headers.get("x-robots-tag")).toBeNull();

    const staging = await proxy(new NextRequest(`https://staging.fermatmind.com${path}`));
    expect(staging.headers.get("x-robots-tag")).toBe("noindex, nofollow, noarchive");

    const reversePath = `/${locale}/career-compare/${pairId.split("-vs-").reverse().join("-vs-")}`;
    const reverse = await proxy(new NextRequest(`https://fermatmind.com${reversePath}`));
    expect(reverse.status).toBe(301);
    expect(new URL(reverse.headers.get("location")!).pathname).toBe(path);
    expect(reverse.headers.get("x-robots-tag")).toBe("noindex, follow");

    vi.stubEnv("FERMATMIND_FIXED_COMPARE_ENABLED", "0");
    const disabled = await proxy(new NextRequest(`https://fermatmind.com${path}`));
    expect(disabled.status).toBe(404);
  });

  it.each(["zh", "en", "zh-TW"])("serves %s with noindex and preserves canonical reverse redirects", async locale => {
    const id = "computer-systems-analysts-vs-database-architects";
    vi.stubEnv("FERMATMIND_FIXED_COMPARE_ENABLED", undefined);
    const metadata = await generateMetadata({ params: Promise.resolve({ locale, pair: id }) });
    expect(metadata.robots).toEqual({ index: false, follow: true });
    const index = await proxy(new NextRequest(`https://fermatmind.com/${locale}/career-compare`));
    expect(index.headers.get("x-robots-tag")).toBe("noindex, follow");
    const response = await proxy(new NextRequest(`https://fermatmind.com/${locale}/career-compare/${id}`));
    expect(response.status).toBe(200);
    expect(response.headers.get("x-robots-tag")).toBe("noindex, follow");
    const reverse = await proxy(new NextRequest(`https://fermatmind.com/${locale}/career-compare/database-architects-vs-computer-systems-analysts`));
    expect(reverse.status).toBe(301);
    expect(reverse.headers.get("x-robots-tag")).toBe("noindex, follow");
    expect(new URL(reverse.headers.get("location")!).pathname).toBe(`/${locale}/career-compare/${id}`);
    vi.stubEnv("FERMATMIND_FIXED_COMPARE_ENABLED", "0");
    const closed = await proxy(new NextRequest(`https://fermatmind.com/${locale}/career-compare/${id}`));
    expect(closed.status).toBe(404);
  });
});
