import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OrderReturnFallbackClient } from "@/components/commerce/OrderReturnFallbackClient";
import { RichResultReport } from "@/components/result/RichResultReport";
import { MbtiOfferComparisonSection } from "@/components/result/mbti/MbtiOfferComparisonSection";
import { MbtiResultShell, resolveMbtiCheckoutSku } from "@/components/result/mbti/MbtiResultShell";
import type { ReportResponse } from "@/lib/api/v0_3";
import { readPendingOrder, writePendingOrder } from "@/lib/commerce/pendingOrder";
import { buildMbtiResultProjectionViewModel } from "@/lib/mbti/publicProjection";
import { applyMbtiPhase2Fixture } from "@/tests/helpers/mbtiPhase2Fixture";
import type {
  HighlightCard,
  MbtiSectionUnlock,
  ReportSection,
  ResolvedOffer,
  RichResultHeadline,
} from "@/components/result/RichResultReport";
import reportReadyMbtiProjectionFixture from "@/tests/fixtures/report_ready.mbti.projection.json";

const hoisted = vi.hoisted(() => ({
  createAttemptShare: vi.fn(),
  createCheckoutOrOrder: vi.fn(),
  captureError: vi.fn(),
  trackEvent: vi.fn(),
  routerReplace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/zh/result/attempt-123",
  useRouter: () => ({
    replace: hoisted.routerReplace,
  }),
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: hoisted.trackEvent,
}));

vi.mock("@/lib/observability/sentry", () => ({
  captureError: hoisted.captureError,
}));

vi.mock("@/lib/api/v0_3", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/v0_3")>("@/lib/api/v0_3");

  return {
    ...actual,
    createAttemptShare: hoisted.createAttemptShare,
    createCheckoutOrOrder: hoisted.createCheckoutOrOrder,
  };
});

function createReportFixture(): ReportResponse {
  return applyMbtiPhase2Fixture(structuredClone(reportReadyMbtiProjectionFixture) as ReportResponse);
}

function createShellProps(reportData: ReportResponse) {
  const headline: RichResultHeadline = {
    badge: "费马人格档案",
    typeCode: "ENFP-T",
    displayName: "竞选者",
    supportingLine: "浪漫热情但易纠结的灵感派",
    summary: "这是用于 checkout wiring 的最小 MBTI shell 测试数据。",
    rarity: "约 6–8%",
  };
  const dimensions = [
    {
      code: "EI",
      label: "E / I",
      percent: 58,
      leftLabel: "外向 E",
      rightLabel: "内向 I",
      winnerLabel: "外向 E",
    },
  ];
  const highlights: HighlightCard[] = [
    {
      title: "优势亮点",
      body: "保持最小可渲染 highlights。",
      tips: ["继续阅读 offers 主位。"],
    },
  ];
  const sections: ReportSection[] = [
    {
      key: "career",
      title: "职业路径",
      access_level: "paid",
      blocks: [{ kind: "paragraph", title: "职业路径", body: "career" }],
    },
    {
      key: "growth",
      title: "成长提示",
      access_level: "paid",
      blocks: [{ kind: "paragraph", title: "成长提示", body: "growth" }],
    },
    {
      key: "traits",
      title: "人格概览",
      access_level: "paid",
      blocks: [{ kind: "paragraph", title: "人格概览", body: "overview" }],
    },
    {
      key: "relationships",
      title: "人际与亲密关系",
      access_level: "paid",
      blocks: [{ kind: "paragraph", title: "人际与亲密关系", body: "relationships" }],
    },
  ];
  const unlockOffer: ResolvedOffer = {
    key: "MBTI_REPORT_FULL",
    title: "完整人格报告",
    price: "¥1.99",
    description: "完整报告",
    modules: ["人格概览", "职业路径", "关系解读"],
    moduleCodes: ["core_full", "career", "relationships"],
  };
  const sectionUnlock: MbtiSectionUnlock = {
    teaser: "这一章保留为 teaser。",
    benefits: ["完整章节", "作者化 bridge"],
    offer: unlockOffer,
  };

  return {
    locale: "zh" as const,
    scaleCode: "MBTI" as const,
    reportData,
    projectionViewModel: buildMbtiResultProjectionViewModel(reportData),
    headline,
    tags: ["热情", "高敏感"],
    dimensions,
    highlights,
    sections,
    sectionUnlocks: {
      career: sectionUnlock,
      growth: sectionUnlock,
      traits: sectionUnlock,
      relationships: sectionUnlock,
    },
    offers: [
      {
        key: "MBTI_CAREER",
        title: "职业道路模块",
        price: "¥0.99",
        description: "职业模块",
        modules: ["职业路径"],
        moduleCodes: ["career"],
      },
      unlockOffer,
      {
        key: "MBTI_RELATIONSHIPS",
        title: "关系解读模块",
        price: "¥0.99",
        description: "关系模块",
        modules: ["关系解读"],
        moduleCodes: ["relationships"],
      },
    ],
  };
}

describe("MBTI checkout wiring contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    Object.defineProperty(Element.prototype, "scrollIntoView", {
      configurable: true,
      value: vi.fn(),
    });
    window.history.replaceState(null, "", "/zh/result/attempt-123");
    window.localStorage.clear();
    window.sessionStorage.clear();
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("calls onCheckout from the offer comparison primary CTA", () => {
    const onCheckout = vi.fn();

    render(
      <MbtiOfferComparisonSection
        locale="zh"
        offers={[
          {
            key: "MBTI_REPORT_FULL",
            title: "完整人格报告",
            price: "¥1.99",
            description: "完整报告",
            modules: ["人格概览", "职业路径"],
            moduleCodes: ["core_full", "career", "relationships"],
          },
        ]}
        cta={{
          visible: true,
          kind: "upsell",
          title: "解锁完整 MBTI 报告",
          subtitle: "统一主位商业卡。",
          primary_label: "解锁完整报告",
          secondary_label: "先看免费版",
          benefit_bullets: ["权益一"],
          badge: "完整版",
          target_sku: "MBTI_REPORT_FULL",
          target_sku_effective: "MBTI_REPORT_FULL_199",
        }}
        onCheckout={onCheckout}
      />
    );

    fireEvent.click(screen.getByTestId("mbti-offers-primary-cta"));

    expect(onCheckout).toHaveBeenCalledTimes(1);
  });

  it("resolves checkout sku with the required priority", () => {
    const reportData = createReportFixture();
    const originalOffers = structuredClone(reportData.offers ?? []);

    expect(resolveMbtiCheckoutSku(reportData)).toBe("MBTI_REPORT_FULL_199");

    reportData.cta = {
      ...(reportData.cta ?? {
        visible: true,
        kind: "upsell",
        title: "",
        subtitle: "",
        primary_label: "",
        secondary_label: "",
        benefit_bullets: [],
        badge: "",
        target_sku: "",
        target_sku_effective: "",
      }),
      target_sku_effective: "",
    };
    expect(resolveMbtiCheckoutSku(reportData)).toBe("MBTI_REPORT_FULL_199");

    reportData.cta = {
      ...reportData.cta,
      target_sku: "MBTI_CAREER_99",
      target_sku_effective: "MBTI_CAREER_99",
    };
    expect(resolveMbtiCheckoutSku(reportData)).toBe("MBTI_REPORT_FULL_199");

    reportData.offers = [];
    reportData.cta = {
      ...reportData.cta,
      target_sku: "MBTI_REPORT_FULL",
      target_sku_effective: "",
    };
    expect(resolveMbtiCheckoutSku(reportData)).toBe("MBTI_REPORT_FULL_199");

    reportData.offers = originalOffers;
    reportData.cta = undefined;
    expect(resolveMbtiCheckoutSku(reportData)).toBe("MBTI_REPORT_FULL_199");
  });

  it("keeps sticky, mobile, footer, and chapter unlock surfaces as anchors", () => {
    const reportData = createReportFixture();
    reportData.cta = {
      ...(reportData.cta ?? {
        visible: true,
        kind: "upsell",
        title: "",
        subtitle: "",
        primary_label: "",
        secondary_label: "",
        benefit_bullets: [],
        badge: "",
        target_sku: "",
        target_sku_effective: "",
      }),
      primary_label: "解锁完整报告",
    };

    render(<RichResultReport locale="zh" reportData={reportData} />);

    const stickyRail = screen.getByTestId("mbti-sticky-rail");
    const mobileChrome = screen.getByTestId("mbti-mobile-chrome");
    const footer = screen.getByTestId("mbti-footer-cta");
    const careerChapter = screen.getByTestId("mbti-chapter-career");

    expect(within(stickyRail).getByRole("link", { name: "解锁完整报告" })).toHaveAttribute("href", "#offer-full");
    expect(within(mobileChrome).getByRole("link", { name: "解锁完整报告" })).toHaveAttribute("href", "#offer-full");
    expect(within(footer).getByRole("link", { name: "解锁完整报告" })).toHaveAttribute("href", "#offer-full");
    expect(within(careerChapter).getByRole("link", { name: "解锁完整报告" })).toHaveAttribute("href", "#offer-full");
    expect(screen.getByTestId("mbti-career-next-step-cta").getAttribute("href")).toContain(
      "/zh/career/recommendations/mbti/enfp-t?"
    );
    expect(screen.getByTestId("mbti-career-next-step-cta").getAttribute("href")).toContain(
      "carryover_focus_key=growth.next_actions"
    );
    expect(screen.getByTestId("mbti-hero-identity-line")).toHaveTextContent("Projection Campaigner");
    expect(screen.getByText("Projection-first summary that should replace the legacy hero copy on result pages.")).toBeInTheDocument();
    expect(within(screen.getByTestId("mbti-offer-comparison")).getByText("Projection fixture commerce title")).toBeInTheDocument();
    expect(screen.queryByTestId("mbti-post-purchase-section")).not.toBeInTheDocument();

    fireEvent.click(within(stickyRail).getByRole("link", { name: "解锁完整报告" }));
    fireEvent.click(within(mobileChrome).getByRole("link", { name: "解锁完整报告" }));
    fireEvent.click(within(footer).getByRole("link", { name: "解锁完整报告" }));
    fireEvent.click(within(careerChapter).getByRole("link", { name: "解锁完整报告" }));

    expect(hoisted.createCheckoutOrOrder).not.toHaveBeenCalled();
  });

  it("centers the offer section when unlock anchors are clicked or loaded from the hash", async () => {
    const reportData = createReportFixture();
    const firstRender = render(<MbtiResultShell {...createShellProps(reportData)} />);
    const scrollIntoViewMock = vi.mocked(Element.prototype.scrollIntoView);

    fireEvent.click(within(screen.getByTestId("mbti-sticky-rail")).getByRole("link", { name: "解锁完整报告" }));

    await waitFor(() => {
      expect(window.location.hash).toBe("#offer-full");
      expect(scrollIntoViewMock).toHaveBeenCalledWith(
        expect.objectContaining({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        })
      );
    });

    firstRender.unmount();
    scrollIntoViewMock.mockClear();
    window.history.replaceState(null, "", "/zh/result/attempt-123#offer-full");

    render(<MbtiResultShell {...createShellProps(reportData)} />);

    await waitFor(() => {
      expect(scrollIntoViewMock).toHaveBeenCalledWith(
        expect.objectContaining({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        })
      );
    });
  });

  it("resolves a formal share link before sharing and never copies the raw result URL", async () => {
    const reportData = createReportFixture();
    const navigatorShare = vi.fn().mockResolvedValue(undefined);

    hoisted.createAttemptShare.mockResolvedValue({
      ok: true,
      share_id: "share-mbti-001",
      share_url: "https://example.com/zh/share/share-mbti-001",
    });
    Object.defineProperty(window.navigator, "share", {
      configurable: true,
      value: navigatorShare,
    });

    render(<MbtiResultShell {...createShellProps(reportData)} />);

    fireEvent.click(within(screen.getByTestId("mbti-footer-cta")).getByRole("button", { name: "分享结果" }));

    await waitFor(() => {
      expect(hoisted.createAttemptShare).toHaveBeenCalledWith({
        attemptId: "attempt-123",
        locale: "zh",
      });
    });

    expect(navigatorShare).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "分享我的测试结果",
        text: "分享我的测试结果",
        url: "https://example.com/zh/share/share-mbti-001",
      })
    );
    expect(navigatorShare).not.toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining("/result/attempt-123"),
      })
    );
    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "share_result",
      expect.objectContaining({
        attemptIdMasked: "attemp...-123",
        typeCode: "ENFP-T",
        identity: "T",
        variantKey: "overview:EI.E.clear:identity.T:boundary.none",
        axisBands: "EI:clear|SN:clear|TF:boundary|JP:boundary|AT:clear",
      })
    );
    expect(window.navigator.clipboard.writeText).not.toHaveBeenCalled();
  });

  it("hydrates generic backend wait_url with checkout pay payload before navigating to the wait page", async () => {
    const reportData = createReportFixture();
    const onInternalNavigate = vi.fn();

    hoisted.createCheckoutOrOrder.mockResolvedValue({
      ok: true,
      order_no: "ord_html_1",
      attempt_id: "attempt-123",
      provider: "alipay",
      payment_recovery_token: "recovery_html_1",
      wait_url: "/pay/wait?order_no=ord_html_1&payment_recovery_token=recovery_html_1",
      result_url: "/result/attempt-123?from=payment",
      pay: {
        type: "html",
        value: "/api/v0.3/orders/ord_html_1/pay/alipay?scene=desktop",
        provider: "alipay",
      },
    });

    render(<MbtiResultShell {...createShellProps(reportData)} onInternalNavigate={onInternalNavigate} />);

    fireEvent.click(screen.getByTestId("mbti-offers-primary-cta"));

    await waitFor(() => {
      expect(hoisted.createCheckoutOrOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          attemptId: "attempt-123",
          sku: "MBTI_REPORT_FULL_199",
          region: "CN_MAINLAND",
        })
      );
    });

    const pendingOrder = readPendingOrder();
    expect(pendingOrder).toMatchObject({
      orderNo: "ord_html_1",
      attemptId: "attempt-123",
      sku: "MBTI_REPORT_FULL_199",
      provider: "alipay",
      paymentRecoveryToken: "recovery_html_1",
      resultUrl: "/result/attempt-123?from=payment",
    });
    const pendingWaitUrl = pendingOrder?.waitUrl ?? "";
    const waitUrl = new URL(pendingWaitUrl, "https://example.test");
    expect(waitUrl.pathname).toBe("/zh/pay/wait");
    expect(waitUrl.searchParams.get("order_no")).toBe("ord_html_1");
    expect(waitUrl.searchParams.get("pay_type")).toBe("html");
    expect(waitUrl.searchParams.get("pay_value")).toBe("/api/v0.3/orders/ord_html_1/pay/alipay?scene=desktop");
    expect(waitUrl.searchParams.get("provider")).toBe("alipay");
    expect(waitUrl.searchParams.get("payment_recovery_token")).toBe("recovery_html_1");

    const [navigatedWaitUrl] = onInternalNavigate.mock.calls.at(-1) ?? [];
    const navigatedUrl = new URL(String(navigatedWaitUrl ?? ""), "https://example.test");
    expect(navigatedUrl.pathname).toBe("/zh/pay/wait");
    expect(navigatedUrl.searchParams.get("order_no")).toBe("ord_html_1");
    expect(navigatedUrl.searchParams.get("pay_type")).toBe("html");
    expect(navigatedUrl.searchParams.get("pay_value")).toBe("/api/v0.3/orders/ord_html_1/pay/alipay?scene=desktop");
    expect(navigatedUrl.searchParams.get("provider")).toBe("alipay");
    expect(navigatedUrl.searchParams.get("payment_recovery_token")).toBe("recovery_html_1");
    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "click_unlock",
      expect.objectContaining({
        attemptIdMasked: "attemp...-123",
        sku: "MBTI_REPORT_FULL_199",
        axisBands: "EI:clear|SN:clear|TF:boundary|JP:boundary|AT:clear",
      })
    );
    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "create_order",
      expect.objectContaining({
        attemptIdMasked: "attemp...-123",
        orderNoMasked: "ord_html_1",
        sku: "MBTI_REPORT_FULL_199",
        axisBands: "EI:clear|SN:clear|TF:boundary|JP:boundary|AT:clear",
      })
    );
  });

  it("keeps checkout on wait flow even when the response only contains a legacy order number", async () => {
    const reportData = createReportFixture();
    const onInternalNavigate = vi.fn();

    hoisted.createCheckoutOrOrder.mockResolvedValue({
      ok: true,
      order_no: "ord_legacy_1",
      payment_recovery_token: "recovery_legacy_1",
      status: "pending",
    });

    render(<MbtiResultShell {...createShellProps(reportData)} onInternalNavigate={onInternalNavigate} />);

    fireEvent.click(screen.getByTestId("mbti-offers-primary-cta"));

    await waitFor(() => {
      expect(onInternalNavigate).toHaveBeenCalledWith(
        "/zh/pay/wait?order_no=ord_legacy_1&payment_recovery_token=recovery_legacy_1"
      );
    });
    expect(readPendingOrder()).toMatchObject({
      orderNo: "ord_legacy_1",
      attemptId: "attempt-123",
      sku: "MBTI_REPORT_FULL_199",
      waitUrl: "/zh/pay/wait?order_no=ord_legacy_1&payment_recovery_token=recovery_legacy_1",
      paymentRecoveryToken: "recovery_legacy_1",
    });
  });

  it("maps fetch-layer checkout failures to a localized service error", async () => {
    const reportData = createReportFixture();

    hoisted.createCheckoutOrOrder.mockRejectedValue(new TypeError("Failed to fetch"));

    render(<MbtiResultShell {...createShellProps(reportData)} />);

    fireEvent.click(screen.getByTestId("mbti-offers-primary-cta"));

    await waitFor(() => {
      expect(screen.getByTestId("mbti-offers-checkout-error")).toHaveTextContent("支付服务暂时不可用，请稍后重试。");
    });
    expect(hoisted.captureError).toHaveBeenCalledWith(
      expect.any(TypeError),
      expect.objectContaining({
        route: "/result/[attemptId]",
        scale_code: "MBTI",
        stage: "create_checkout",
        attempt_id: "attempt-123",
        sku: "MBTI_REPORT_FULL_199",
      })
    );
  });

  it("reuses pending order context on provider return pages when order_no is absent", async () => {
    writePendingOrder({
      orderNo: "ord_return_1",
      attemptId: "attempt-123",
      sku: "MBTI_REPORT_FULL_199",
      provider: "lemonsqueezy",
      waitUrl: "/zh/pay/wait?order_no=ord_return_1&payment_recovery_token=recovery_return_1",
      paymentRecoveryToken: "recovery_return_1",
      resultUrl: "/zh/result/attempt-123?from=payment",
    });

    render(<OrderReturnFallbackClient locale="zh" />);

    await waitFor(() => {
      expect(hoisted.routerReplace).toHaveBeenCalledWith(
        "/zh/pay/wait?order_no=ord_return_1&payment_recovery_token=recovery_return_1"
      );
    });
    expect(readPendingOrder()).toBeNull();
  });

  it("routes provider return pages with order_no and payment token back into wait flow", async () => {
    render(
      <OrderReturnFallbackClient
        locale="en"
        orderNo="ord_return_query_1"
        paymentRecoveryToken="recovery_return_query_1"
      />
    );

    await waitFor(() => {
      expect(hoisted.routerReplace).toHaveBeenCalledWith(
        "/en/pay/wait?order_no=ord_return_query_1&payment_recovery_token=recovery_return_query_1"
      );
    });
  });

  it("prefers explicit wait_url on provider return pages before falling back to lookup", async () => {
    render(
      <OrderReturnFallbackClient
        locale="en"
        orderNo="ord_return_wait_url_1"
        paymentRecoveryToken="recovery_return_wait_url_1"
        waitUrl="https://fermatmind.com/en/pay/wait?order_no=ord_return_wait_url_1&payment_recovery_token=recovery_return_wait_url_1"
      />
    );

    await waitFor(() => {
      expect(hoisted.routerReplace).toHaveBeenCalledWith(
        "/en/pay/wait?order_no=ord_return_wait_url_1&payment_recovery_token=recovery_return_wait_url_1"
      );
    });
  });
});
