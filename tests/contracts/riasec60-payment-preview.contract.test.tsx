import type { ComponentProps } from "react";
import { render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Riasec60PaymentPreview } from "@/components/result/riasec/Riasec60PaymentPreview";
import { loadRiasec60ReadingDesignModel, riasec60DesignModel } from "@/components/result/riasec/riasec60PreviewData";
import PreviewPage from "@/app/(localized)/[locale]/tests/holland-career-interest-test-riasec/preview/page";
import TraditionalPreviewPage from "@/app/(traditional)/zh-TW/tests/holland-career-interest-test-riasec/preview/page";
import { traditionalPath } from "@/lib/i18n/traditionalRoutes";

vi.mock("next/link", () => ({ default: ({ children, href, prefetch, ...props }: ComponentProps<"a"> & { prefetch?: boolean }) => { void prefetch; return <a href={href} {...props}>{children}</a>; } }));
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NOT_FOUND"); } }));
vi.mock("@/lib/career/riasecProfileMatch", () => ({ rankRiasecCareers: () => ({ jobs: [] }) }));
vi.mock("@/components/result/riasec/riasec60PreviewData", async importOriginal => {
  const actual = await importOriginal<typeof import("@/components/result/riasec/riasec60PreviewData")>();
  return { ...actual, loadRiasec60ReadingDesignModel: vi.fn(async locale => actual.riasec60DesignModel(locale)), loadRiasec60DesignReport: vi.fn(async locale => ({ model: actual.riasec60DesignModel(locale), premium: {
    dimensions: [{ label: "Interest reading", score: 80, detail: "Source-bound reading" }], preferences: [],
    condition_note: "Interest boundary", actions: ["A small experiment"], ai_prompt: "Exploration prompt",
  } })) };
});

afterEach(() => vi.unstubAllEnvs());

describe("Holland 60 local purchase preview", () => {
  it.each([
    ["zh", "霍兰德职业兴趣深度报告", "霍兰德职业兴趣测试 · 60 题"],
    ["en", "Holland career interest deep report", "Holland Career Interest Test · 60 questions"],
    ["zh-TW", "霍蘭德職業興趣深度報告", "霍蘭德職業興趣測試 · 60 題"],
  ] as const)("renders %s without an actionable checkout or Career94 measurement claims", async (locale, name, eyebrow) => {
    render(await Riasec60PaymentPreview({ locale }));
    const offer = within(await screen.findByRole("region", { name }, { timeout: 10000 }));
    expect(screen.getByText(eyebrow)).toBeVisible();
    const buttons = offer.getAllByRole("button");
    expect(buttons).toHaveLength(3);
    buttons.forEach(button => expect(button).toBeDisabled());
    expect(offer.getByRole("link", { name: /查看完整示例報告|查看完整示例报告|View the full sample report/u })).toHaveAttribute("href", `/${locale}/tests/holland-career-interest-test-riasec/preview?view=report`);
    expect(offer.queryByText(/工作偏好|work preference/u)).not.toBeInTheDocument();
    expect(screen.queryByText(/94 题|94 questions/u)).not.toBeInTheDocument();
  });

  it.each(["zh", "zh-TW", "en"] as const)("uses the actual reading renderer for the %s full sample", async locale => {
    const model = riasec60DesignModel(locale);
    expect(model.authority).toBeNull();
    expect(model.formCode).toBe("riasec_60");
    render(await Riasec60PaymentPreview({ locale, full: true, profile: "LOW" }));
    expect(loadRiasec60ReadingDesignModel).toHaveBeenLastCalledWith(locale, "IAR");
    expect(await screen.findByTestId("riasec-reading-report")).toBeVisible();
    expect(screen.getByRole("link", { name: /返回解锁页|返回解鎖頁|Back to the unlock page/u })).toHaveAttribute("href", `/${locale}/tests/holland-career-interest-test-riasec/preview`);
    expect(screen.queryByRole("navigation", { name: /切换分数样例|切換分數示例|Score examples/u })).not.toBeInTheDocument();
    expect(screen.getByText(/固定虚构分数|固定虛構分數|same for everyone/u)).toBeVisible();
    expect(screen.queryByText("Source-bound reading")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Alipay/u })).not.toBeInTheDocument();
  });

  it("keeps both preview routes and the Taiwan allowance out of production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    await expect(PreviewPage({ params: Promise.resolve({ locale: "en" }), searchParams: Promise.resolve({}) })).rejects.toThrow("NOT_FOUND");
    await expect(TraditionalPreviewPage({ searchParams: Promise.resolve({}) })).rejects.toThrow("NOT_FOUND");
    expect(traditionalPath("/zh-TW/tests/holland-career-interest-test-riasec/preview")).toBeNull();
    vi.stubEnv("NODE_ENV", "development");
    expect(traditionalPath("/zh-TW/tests/holland-career-interest-test-riasec/preview")).toBe("/zh-TW/tests/holland-career-interest-test-riasec/preview");
    await expect(PreviewPage({ params: Promise.resolve({ locale: "fr" }), searchParams: Promise.resolve({}) })).rejects.toThrow("NOT_FOUND");
  });
});
