import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ShareClient from "@/app/(localized)/[locale]/share/[id]/ShareClient";
import { generateMetadata } from "@/app/(localized)/[locale]/share/[id]/page";
import type { ShareSummaryResponse } from "@/lib/api/v0_3";

const hoisted = vi.hoisted(() => ({
  getShareSummary: vi.fn(),
  trackShareClick: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/share/share-123",
  useSearchParams: () => new URLSearchParams("utm_source=wechat&utm_campaign=spring"),
}));

vi.mock("@/lib/anon", () => ({
  getOrCreateAnonId: () => "anon_share_test",
}));

vi.mock("@/lib/api/v0_3", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/v0_3")>("@/lib/api/v0_3");

  return {
    ...actual,
    getShareSummary: hoisted.getShareSummary,
    trackShareClick: hoisted.trackShareClick,
  };
});

function createShareFixture(): ShareSummaryResponse {
  return {
    ok: true,
    id: "share-123",
    type_code: "ENFP-T",
    type_name: "竞选者型",
    subtitle: "浪漫热情但易纠结的灵感派",
    summary: "这是可公开展示的一段 MBTI 分享摘要，只保留轻量结论，不暴露付费章节。",
    rarity: {
      label: "约 6–8%",
    },
    public_tags: ["热情", "高敏感", "理想主义"],
    tags: ["type:ENFP-T", "热情"],
    dimensions: [
      {
        code: "EI",
        label: "E / I",
        percent: 62,
      },
      {
        code: "TF",
        label: "T / F",
        score: 0.74,
      },
    ],
    offers: [
      {
        title: "完整人格报告",
      },
    ],
    recommended_reads: [
      {
        title: "只对付费用户开放的阅读",
      },
    ],
    paid_sections: [
      {
        title: "职业路径完整章节",
      },
    ],
  };
}

describe("MBTI share consumer contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    window.sessionStorage.clear();
    Object.defineProperty(document, "referrer", {
      configurable: true,
      value: "https://example.com/en/result/attempt-123",
    });
    hoisted.getShareSummary.mockResolvedValue(createShareFixture());
    hoisted.trackShareClick.mockResolvedValue({ ok: true });
  });

  it("renders the lightweight public summary, tracks share click once, and does not leak paid content", async () => {
    render(<ShareClient locale="en" shareId="share-123" />);

    await waitFor(() => {
      expect(screen.getByTestId("mbti-share-summary-card")).toBeInTheDocument();
    });

    expect(screen.getByRole("heading", { name: "ENFP-T" })).toBeInTheDocument();
    expect(screen.getByText("竞选者型")).toBeInTheDocument();
    expect(screen.getByText("浪漫热情但易纠结的灵感派")).toBeInTheDocument();
    expect(screen.getByText("这是可公开展示的一段 MBTI 分享摘要，只保留轻量结论，不暴露付费章节。")).toBeInTheDocument();
    expect(screen.getByText("约 6–8%")).toBeInTheDocument();
    expect(screen.getByText("热情")).toBeInTheDocument();
    expect(screen.getByText("高敏感")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-share-dimension-bars")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start MBTI test" })).toHaveAttribute(
      "href",
      "/en/tests/mbti-personality-test-16-personality-types/take"
    );
    expect(screen.getByRole("link", { name: "Browse all tests" })).toHaveAttribute("href", "/en/tests");

    expect(screen.queryByText("完整人格报告")).not.toBeInTheDocument();
    expect(screen.queryByText("只对付费用户开放的阅读")).not.toBeInTheDocument();
    expect(screen.queryByText("职业路径完整章节")).not.toBeInTheDocument();
    expect(screen.queryByText("type:ENFP-T")).not.toBeInTheDocument();

    await waitFor(() => {
      expect(hoisted.trackShareClick).toHaveBeenCalledTimes(1);
    });

    expect(hoisted.trackShareClick).toHaveBeenCalledWith({
      shareId: "share-123",
      anonId: "anon_share_test",
      locale: "en",
      meta: {
        entrypoint: "share_page",
        landing_path: "/en/share/share-123?utm_source=wechat&utm_campaign=spring",
        referrer: "https://example.com/en/result/attempt-123",
        utm: {
          utm_source: "wechat",
          utm_campaign: "spring",
        },
        compare_intent: false,
      },
    });
  });

  it("keeps the share page noindexed and derives metadata from the share summary contract", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({
        locale: "zh",
        id: "share-123",
      }),
    });

    expect(hoisted.getShareSummary).toHaveBeenCalledWith({
      shareId: "share-123",
      locale: "zh",
      cache: "no-store",
    });
    expect(metadata.title).toBe("ENFP-T · 竞选者型｜MBTI 分享摘要");
    expect(metadata.description).toBe("浪漫热情但易纠结的灵感派");
    expect(metadata.robots).toMatchObject({
      index: false,
      follow: false,
      noarchive: true,
      nocache: true,
    });
    expect(metadata.openGraph).toMatchObject({
      title: "ENFP-T · 竞选者型｜MBTI 分享摘要",
      description: "浪漫热情但易纠结的灵感派",
      url: "http://localhost:3000/zh/share/share-123",
    });
    expect(metadata.twitter).toMatchObject({
      title: "ENFP-T · 竞选者型｜MBTI 分享摘要",
      description: "浪漫热情但易纠结的灵感派",
    });
  });
});
