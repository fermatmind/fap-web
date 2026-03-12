import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ShareClient from "@/app/(localized)/[locale]/share/[id]/ShareClient";
import { generateMetadata } from "@/app/(localized)/[locale]/share/[id]/page";
import type { ShareSummaryResponse } from "@/lib/api/v0_3";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

const hoisted = vi.hoisted(() => ({
  pathname: "/en/share/share-123",
  search: "utm_source=wechat&utm_medium=organic&utm_campaign=spring",
  routerPush: vi.fn(),
  getShareSummary: vi.fn(),
  trackShareClick: vi.fn(),
  createMbtiCompareInvite: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => hoisted.pathname,
  useSearchParams: () => new URLSearchParams(hoisted.search),
  useRouter: () => ({
    push: hoisted.routerPush,
  }),
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
    createMbtiCompareInvite: hoisted.createMbtiCompareInvite,
  };
});

function createShareFixture(): ShareSummaryResponse {
  return {
    ok: true,
    share_id: "share-123",
    share_url: "https://example.com/en/share/share-123",
    id: "share-123",
    scale_code: "MBTI",
    locale: "en",
    type_code: "ENFP-T",
    type_name: "Campaigner",
    title: "Campaigner",
    subtitle: "Warm, imaginative, and emotionally alert",
    summary: "This public MBTI share page keeps only the lightweight result summary and never exposes paid content.",
    tagline: "A public-safe snapshot of this MBTI type.",
    rarity: {
      label: "Around 6-8%",
    },
    primary_cta_label: "Start MBTI test",
    primary_cta_path: "/en/tests/mbti-personality-test-16-personality-types/take",
    compare_enabled: true,
    compare_cta_label: "Invite a friend to compare",
    public_tags: ["Warm", "Idealistic", "Sensitive"],
    tags: ["type:ENFP-T", "Warm", "axis:EI", "role:explorer"],
    dimensions: [
      {
        code: "EI",
        label: "E / I",
        pct: 62,
      },
      {
        code: "SN",
        label: "S / N",
        percent: 74,
      },
    ],
    offers: [
      {
        title: "Unlock full report",
      },
    ],
    recommended_reads: [
      {
        title: "Paid-only reading",
      },
    ],
    paid_sections: [
      {
        title: "Career chapter",
      },
    ],
  };
}

describe("MBTI share consumer contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    window.sessionStorage.clear();
    hoisted.pathname = "/en/share/share-123";
    hoisted.search = "utm_source=wechat&utm_medium=organic&utm_campaign=spring";
    Object.defineProperty(document, "referrer", {
      configurable: true,
      value: "https://example.com/en/result/attempt-123",
    });

    hoisted.getShareSummary.mockResolvedValue(createShareFixture());
    hoisted.trackShareClick.mockResolvedValue({
      ok: true,
      id: "click-123",
      share_id: "share-123",
      recorded_at: "2026-03-12T00:00:00.000Z",
    });
    hoisted.createMbtiCompareInvite.mockResolvedValue({
      ok: true,
      invite_id: "invite-456",
      share_id: "share-123",
      scale_code: "MBTI",
      locale: "en",
      status: "pending",
      take_path: "/en/tests/mbti-personality-test-16-personality-types/take",
      compare_path: "/en/compare/mbti/invite-456",
    });
  });

  it("renders the lightweight public summary, consumes dimensions.pct, and keeps paid content hidden", async () => {
    render(<ShareClient locale="en" shareId="share-123" />);

    await waitFor(() => {
      expect(screen.getByTestId("mbti-share-summary-card")).toBeInTheDocument();
    });

    expect(screen.getByRole("heading", { name: "ENFP-T" })).toBeInTheDocument();
    expect(screen.getByText("Campaigner")).toBeInTheDocument();
    expect(screen.getByText("Warm, imaginative, and emotionally alert")).toBeInTheDocument();
    expect(screen.getByText("This public MBTI share page keeps only the lightweight result summary and never exposes paid content.")).toBeInTheDocument();
    expect(screen.getByText("Around 6-8%")).toBeInTheDocument();
    expect(screen.getByText("Warm", { exact: true })).toBeInTheDocument();
    expect(screen.getByText("62%")).toBeInTheDocument();
    expect(screen.getByText("74%")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Invite a friend to compare" })).toBeInTheDocument();

    expect(screen.queryByText("Unlock full report")).not.toBeInTheDocument();
    expect(screen.queryByText("Paid-only reading")).not.toBeInTheDocument();
    expect(screen.queryByText("Career chapter")).not.toBeInTheDocument();
    expect(screen.queryByText("type:ENFP-T")).not.toBeInTheDocument();
    expect(screen.queryByText("axis:EI")).not.toBeInTheDocument();
    expect(screen.queryByText("role:explorer")).not.toBeInTheDocument();
  });

  it("sends normalized share-click meta.utm and writes dedupe only after click success", async () => {
    const pendingClick = deferred<{
      ok: boolean;
      id: string;
      share_id: string;
      recorded_at: string;
    }>();
    hoisted.trackShareClick.mockReturnValueOnce(pendingClick.promise);

    render(<ShareClient locale="en" shareId="share-123" />);

    await waitFor(() => {
      expect(hoisted.trackShareClick).toHaveBeenCalledTimes(1);
    });

    expect(hoisted.trackShareClick).toHaveBeenCalledWith({
      shareId: "share-123",
      anonId: "anon_share_test",
      locale: "en",
      meta: {
        entrypoint: "share_page",
        landing_path: "/en/share/share-123?utm_source=wechat&utm_medium=organic&utm_campaign=spring",
        referrer: "https://example.com/en/result/attempt-123",
        utm: {
          source: "wechat",
          medium: "organic",
          campaign: "spring",
          term: null,
          content: null,
        },
        compare_intent: false,
      },
    });

    const dedupeKey = "fm_share_click_v1:share-123:/en/share/share-123?utm_source=wechat&utm_medium=organic&utm_campaign=spring";
    expect(window.sessionStorage.getItem(dedupeKey)).toBeNull();

    pendingClick.resolve({
      ok: true,
      id: "click-123",
      share_id: "share-123",
      recorded_at: "2026-03-12T00:00:00.000Z",
    });

    await waitFor(() => {
      expect(window.sessionStorage.getItem(dedupeKey)).toBe("click-123");
    });

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Start MBTI test" })).toHaveAttribute(
        "href",
        "/en/tests/mbti-personality-test-16-personality-types/take?share_id=share-123&share_click_id=click-123&entrypoint=share_page&landing_path=%2Fen%2Fshare%2Fshare-123%3Futm_source%3Dwechat%26utm_medium%3Dorganic%26utm_campaign%3Dspring&referrer=https%3A%2F%2Fexample.com%2Fen%2Fresult%2Fattempt-123&utm_source=wechat&utm_medium=organic&utm_campaign=spring"
      );
    });
  });

  it("creates compare invite from the share page and routes into the take flow with full attribution query", async () => {
    render(<ShareClient locale="en" shareId="share-123" />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Invite a friend to compare" })).toBeEnabled();
    });

    fireEvent.click(screen.getByRole("button", { name: "Invite a friend to compare" }));

    await waitFor(() => {
      expect(hoisted.createMbtiCompareInvite).toHaveBeenCalledWith({
        shareId: "share-123",
        anonId: "anon_share_test",
        locale: "en",
        entrypoint: "share_page",
        referrer: "https://example.com/en/result/attempt-123",
        landingPath: "/en/share/share-123?utm_source=wechat&utm_medium=organic&utm_campaign=spring",
        compareIntent: true,
        shareClickId: "click-123",
        utm: {
          source: "wechat",
          medium: "organic",
          campaign: "spring",
          term: null,
          content: null,
        },
      });
    });

    await waitFor(() => {
      expect(hoisted.routerPush).toHaveBeenCalledWith(
        "/en/tests/mbti-personality-test-16-personality-types/take?share_id=share-123&compare_invite_id=invite-456&share_click_id=click-123&entrypoint=share_compare_invite&landing_path=%2Fen%2Fshare%2Fshare-123%3Futm_source%3Dwechat%26utm_medium%3Dorganic%26utm_campaign%3Dspring&referrer=https%3A%2F%2Fexample.com%2Fen%2Fresult%2Fattempt-123&compare_intent=true&utm_source=wechat&utm_medium=organic&utm_campaign=spring"
      );
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
    expect(metadata.title).toBe("ENFP-T · Campaigner｜FermatMind");
    expect(metadata.description).toBe(
      "This public MBTI share page keeps only the lightweight result summary and never exposes paid content."
    );
    expect(metadata.alternates?.canonical).toBe("http://localhost:3000/zh/share/share-123");
    expect(metadata.robots).toMatchObject({
      index: false,
      follow: false,
      noarchive: true,
      nocache: true,
    });
    expect(metadata.openGraph).toMatchObject({
      title: "ENFP-T · Campaigner｜FermatMind",
      description: "This public MBTI share page keeps only the lightweight result summary and never exposes paid content.",
      url: "http://localhost:3000/zh/share/share-123",
      images: ["http://localhost:3000/og/share/share-123"],
    });
    expect(metadata.twitter).toMatchObject({
      title: "ENFP-T · Campaigner｜FermatMind",
      description: "This public MBTI share page keeps only the lightweight result summary and never exposes paid content.",
      images: ["http://localhost:3000/og/share/share-123"],
    });
  });

  it("falls back from summary to subtitle to tagline and uses share title when type_name is missing", async () => {
    hoisted.getShareSummary.mockResolvedValueOnce({
      ...createShareFixture(),
      type_name: "",
      title: "Explorer Snapshot",
      summary: "",
      subtitle: "Subtitle fallback copy",
      tagline: "Tagline fallback copy",
    });

    const subtitleMetadata = await generateMetadata({
      params: Promise.resolve({
        locale: "en",
        id: "share-123",
      }),
    });

    expect(subtitleMetadata.title).toBe("Explorer Snapshot｜FermatMind");
    expect(subtitleMetadata.description).toBe("Subtitle fallback copy");

    hoisted.getShareSummary.mockResolvedValueOnce({
      ...createShareFixture(),
      summary: "",
      subtitle: "",
      tagline: "Tagline fallback copy",
    });

    const taglineMetadata = await generateMetadata({
      params: Promise.resolve({
        locale: "en",
        id: "share-123",
      }),
    });

    expect(taglineMetadata.description).toBe("Tagline fallback copy");
  });
});
