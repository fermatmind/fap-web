import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import OrdersClient from "@/app/(localized)/[locale]/orders/[orderNo]/OrdersClient";
import { ApiError } from "@/lib/api-client";
import type { MbtiAccessHubV1Raw } from "@/lib/mbti/accessHub";

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
  getOrderStatus: vi.fn(),
  resendOrderDelivery: vi.fn(),
  fetchAttemptReportAccess: vi.fn(),
  recoverAlipayReturnContext: vi.fn(),
  fetchAttemptReportPdf: vi.fn(),
  trackEvent: vi.fn(),
  routerReplace: vi.fn(),
  pathname: "/en/orders/ord_delivery_1",
  searchParams: "",
  createObjectURL: vi.fn(() => "blob:mbti-report"),
  revokeObjectURL: vi.fn(),
  openWindow: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => hoisted.pathname,
  useRouter: () => ({
    replace: hoisted.routerReplace,
  }),
  useSearchParams: () => new URLSearchParams(hoisted.searchParams),
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: hoisted.trackEvent,
}));

vi.mock("@/lib/api/v0_3", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/v0_3")>("@/lib/api/v0_3");

  return {
    ...actual,
    fetchAttemptReportAccess: hoisted.fetchAttemptReportAccess,
    getOrderStatus: hoisted.getOrderStatus,
    recoverAlipayReturnContext: hoisted.recoverAlipayReturnContext,
    resendOrderDelivery: hoisted.resendOrderDelivery,
    fetchAttemptReportPdf: hoisted.fetchAttemptReportPdf,
  };
});

function createAccessProjection(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    ok: true,
    attempt_id: "attempt-paid-1",
    access_state: "ready",
    report_state: "ready",
    pdf_state: "ready",
    reason_code: "report_ready",
    projection_version: 1,
    actions: {
      page_href: "/result/attempt-paid-1",
      pdf_href: "/api/v0.3/attempts/attempt-paid-1/report.pdf",
      history_href: "/history/mbti",
      lookup_href: "/orders/lookup",
    },
    meta: {
      produced_at: "2026-03-22T10:00:00Z",
      refreshed_at: "2026-03-22T10:00:00Z",
    },
    ...overrides,
  };
}

function expectInlineActionOrder(container: HTMLElement, labels: string[]) {
  const orderedLabels = Array.from(container.children)
    .map((node) => node.textContent?.trim() ?? "")
    .filter(Boolean);

  expect(orderedLabels).toEqual(labels);
}

describe("OrdersClient delivery contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.pathname = "/en/orders/ord_delivery_1";
    hoisted.searchParams = "";
    window.localStorage.clear();
    hoisted.fetchAttemptReportAccess.mockResolvedValue(createAccessProjection());
    hoisted.recoverAlipayReturnContext.mockResolvedValue({
      ok: true,
      order_no: "ord_return_recovery_default",
      payment_recovery_token: "recovery_return_default",
      wait_url:
        "/en/pay/wait?order_no=ord_return_recovery_default&payment_recovery_token=recovery_return_default",
    });
    hoisted.fetchAttemptReportPdf.mockResolvedValue(new Blob(["pdf"], { type: "application/pdf" }));
    hoisted.resendOrderDelivery.mockResolvedValue({ ok: true, message: "Delivery email sent again." });
    globalThis.URL.createObjectURL = hoisted.createObjectURL;
    globalThis.URL.revokeObjectURL = hoisted.revokeObjectURL;
    vi.spyOn(window.HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    vi.spyOn(window, "open").mockImplementation(hoisted.openWindow);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders a neutral loading state before the first order status response arrives", async () => {
    const pendingResponse = deferred<{
      ok: true;
      order_no: string;
      status: "pending";
    }>();
    hoisted.getOrderStatus.mockReturnValueOnce(pendingResponse.promise);

    render(<OrdersClient orderNo="ord_loading_1" />);

    expect(screen.getAllByText("Loading order status...")).toHaveLength(2);
    expect(screen.queryByText("Confirming your payment...")).not.toBeInTheDocument();
  });

  it("renders paid delivery actions from the contract and wires view report/download/resend", async () => {
    hoisted.getOrderStatus.mockResolvedValue({
      ok: true,
      order_no: "ord_delivery_1",
      status: "paid",
      attempt_id: "attempt-paid-1",
      mbti_form_v1: {
        form_code: "mbti_93",
        label: "93-question standard version",
        short_label: "93 questions",
        question_count: 93,
        estimated_minutes: 10,
        scale_code: "MBTI",
      },
      exact_result_entry: createAccessProjection({
        attempt_id: "attempt-paid-1",
        unlock_stage: "partial",
        unlock_source: "invite",
        invite_unlock_v1: {
          unlock_stage: "partial",
          unlock_source: "invite",
          completed_invitees: 1,
          required_invitees: 2,
          partial_scope: "career",
          label: "Invite unlock 1/2 · Career unlocked",
          short_label: "Invite unlock 1/2",
        },
      }),
      mbti_access_hub_v1: createMbtiAccessHubRaw("attempt-paid-1", "ord_delivery_1", {
        unlock_stage: "partial",
        unlock_source: "invite",
        invite_unlock_v1: {
          unlock_stage: "partial",
          unlock_source: "invite",
          completed_invitees: 1,
          required_invitees: 2,
          partial_scope: "career",
          label: "Invite unlock 1/2 · Career unlocked",
          short_label: "Invite unlock 1/2",
        },
      }),
      delivery: {
        contact_email_present: true,
        last_delivery_email_sent_at: "2026-03-11T10:30:00Z",
        can_request_claim_email: true,
        can_view_report: true,
        report_url: "/result/attempt-paid-1",
        can_download_pdf: true,
        report_pdf_url: "/api/v0.3/attempts/attempt-paid-1/report.pdf",
        can_resend: true,
      },
    });

    render(<OrdersClient orderNo="ord_delivery_1" />);

    await waitFor(() => {
      expect(screen.getByTestId("order-delivery-actions")).toBeInTheDocument();
    });

    expect(hoisted.routerReplace).toHaveBeenCalledWith("/en/result/attempt-paid-1");
    expect(screen.getByTestId("order-form-summary")).toHaveTextContent("MBTI · 93-question standard version");
    expect(screen.getByTestId("order-delivery-contact-email")).toHaveTextContent("Purchase email on file");
    expect(screen.getByTestId("order-delivery-last-email-sent")).toHaveTextContent("2026");
    expect(screen.getByTestId("order-recover-with-email-link")).toHaveAttribute(
      "href",
      "/en/orders/lookup?orderNo=ord_delivery_1&mode=claim"
    );
    expect(screen.getByTestId("order-back-to-result-link")).toHaveAttribute("href", "/en/result/attempt-paid-1");
    expect(screen.getByTestId("order-back-to-result-link").textContent).toContain("Back to my test result");
    expect(screen.getByTestId("order-back-to-result-link").querySelector("button")?.className).toContain("bg-[var(--fm-surface)]");
    expect(screen.getByTestId("order-refresh-button").className).toContain("bg-[var(--fm-cta-orange)]");
    expect(screen.getByTestId("order-invite-unlock-summary")).toHaveTextContent("Invite unlock 1/2");
    expect(screen.getByTestId("order-invite-unlock-summary")).toHaveTextContent("Invite unlock 1/2 · Career unlocked");
    expectInlineActionOrder(screen.getByTestId("order-wait-actions-paid-ready"), [
      "Back to my test result",
      "Refresh",
      "Contact support",
    ]);
    expect(screen.getByTestId("order-workspace-lite-entry")).toHaveAttribute("href", "/en/result/attempt-paid-1");
    expect(screen.queryByTestId("order-view-report")).not.toBeInTheDocument();
    expect(screen.getByTestId("order-download-pdf")).toBeInTheDocument();
    expect(screen.getByTestId("order-resend-delivery")).toBeInTheDocument();
    expect(hoisted.fetchAttemptReportAccess).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(hoisted.trackEvent).toHaveBeenCalledWith(
        "invite_staged_summary_viewed",
        expect.objectContaining({
          unlock_stage: "partial",
          unlock_source: "invite",
          completed_invitees: 1,
          required_invitees: 2,
          scale_code: "MBTI",
          locale: "en",
        })
      );
    });

    fireEvent.click(screen.getByTestId("order-download-pdf"));

    await waitFor(() => {
      expect(hoisted.openWindow).toHaveBeenCalledWith(
        "/api/v0.3/attempts/attempt-paid-1/report.pdf",
        "_blank",
        "noopener,noreferrer"
      );
    });
    expect(hoisted.fetchAttemptReportPdf).not.toHaveBeenCalled();
    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "pdf_download",
      expect.objectContaining({
        attempt_id: "attempt-paid-1",
        pdf_variant: "order_delivery_hub",
        locale: "en",
      })
    );

    fireEvent.click(screen.getByTestId("order-resend-delivery"));

    await waitFor(() => {
      expect(hoisted.resendOrderDelivery).toHaveBeenCalledWith({ orderNo: "ord_delivery_1" });
    });
    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "ui_card_interaction",
      expect.objectContaining({
        slug: "orders-client",
        visual_kind: "order_resend_delivery",
        interaction: "click",
        form_code: "mbti_93",
        locale: "en",
      })
    );
    expect(screen.getByText("Delivery email sent again.")).toBeInTheDocument();
  });

  it("renders backend-owned Big Five form summary and keeps analytics form_code aligned", async () => {
    hoisted.getOrderStatus.mockResolvedValue({
      ok: true,
      order_no: "ord_big5_delivery_1",
      status: "paid",
      attempt_id: "attempt-big5-paid-1",
      big5_form_v1: {
        form_code: "big5_90",
        label: "90-question standard version",
        short_label: "90 questions",
        question_count: 90,
        estimated_minutes: 11,
        scale_code: "BIG5_OCEAN",
      },
      exact_result_entry: createAccessProjection({
        attempt_id: "attempt-big5-paid-1",
        actions: {
          page_href: "/result/attempt-big5-paid-1",
          pdf_href: "/api/v0.3/attempts/attempt-big5-paid-1/report.pdf",
          history_href: "/history/big5",
          lookup_href: "/orders/lookup",
        },
      }),
      delivery: {
        contact_email_present: true,
        can_request_claim_email: true,
        can_view_report: true,
        report_url: "/result/attempt-big5-paid-1",
        can_download_pdf: true,
        report_pdf_url: "/api/v0.3/attempts/attempt-big5-paid-1/report.pdf",
        can_resend: true,
      },
    });

    render(<OrdersClient orderNo="ord_big5_delivery_1" />);

    await waitFor(() => {
      expect(screen.getByTestId("order-form-summary")).toHaveTextContent("Big Five · 90-question standard version");
    });

    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "payment_confirmed",
      expect.objectContaining({
        form_code: "big5_90",
      })
    );
    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "purchase_success",
      expect.objectContaining({
        form_code: "big5_90",
      })
    );
  });

  it("auto-enters a paid report from the unified access projection even when result_url is absent", async () => {
    const exactResultEntry = createAccessProjection({
      attempt_id: "attempt-paid-result-url-1",
      actions: {
        page_href: "/result/attempt-paid-result-url-1",
        pdf_href: "/api/v0.3/attempts/attempt-paid-result-url-1/report.pdf",
        history_href: "/history/mbti",
        lookup_href: "/orders/lookup",
      },
    });
    const paidWithoutResultUrl = {
      ok: true,
      order_no: "ord_paid_result_url_1",
      status: "paid",
      attempt_id: "attempt-paid-result-url-1",
      exact_result_entry: exactResultEntry,
      delivery: {
        can_view_report: true,
        report_url: "/result/attempt-paid-result-url-1",
        can_download_pdf: false,
        can_resend: false,
        can_request_claim_email: false,
        contact_email_present: true,
      },
    };
    hoisted.getOrderStatus.mockResolvedValue(paidWithoutResultUrl);

    render(<OrdersClient orderNo="ord_paid_result_url_1" />);

    await waitFor(() => {
      expect(hoisted.routerReplace).toHaveBeenCalledWith("/en/result/attempt-paid-result-url-1");
    });
    expect(hoisted.fetchAttemptReportAccess).not.toHaveBeenCalled();
  });

  it("does not auto-enter externally projected report URLs", async () => {
    const exactResultEntry = createAccessProjection({
      attempt_id: "attempt-paid-external-result-1",
      actions: {
        page_href: "https://evil.example/result/attempt-paid-external-result-1",
        pdf_href: "/api/v0.3/attempts/attempt-paid-external-result-1/report.pdf",
        history_href: "/history/mbti",
        lookup_href: "/orders/lookup",
      },
    });
    hoisted.getOrderStatus.mockResolvedValue({
      ok: true,
      order_no: "ord_paid_external_result_1",
      status: "paid",
      attempt_id: "attempt-paid-external-result-1",
      exact_result_entry: exactResultEntry,
      delivery: {
        can_view_report: true,
        report_url: "https://evil.example/result/attempt-paid-external-result-1",
        can_download_pdf: false,
        can_resend: false,
        can_request_claim_email: false,
        contact_email_present: true,
      },
    });

    render(<OrdersClient orderNo="ord_paid_external_result_1" />);

    await waitFor(() => {
      expect(screen.getByTestId("order-paid-processing-state")).toBeInTheDocument();
    });

    expect(hoisted.routerReplace).not.toHaveBeenCalledWith("https://evil.example/result/attempt-paid-external-result-1");
    expect(screen.getByTestId("order-back-to-result-link")).toHaveAttribute(
      "href",
      "/en/result/attempt-paid-external-result-1"
    );
    expect(screen.queryByTestId("order-workspace-lite-entry")).not.toBeInTheDocument();
  });

  it("falls back to report-access mbti_form_v1 when the order payload omits the top-level summary", async () => {
    hoisted.fetchAttemptReportAccess.mockResolvedValueOnce(
      createAccessProjection({
        attempt_id: "attempt-paid-fallback-1",
        mbti_form_v1: {
          form_code: "mbti_144",
          label: "144-question full version",
          short_label: "144 questions",
          question_count: 144,
          estimated_minutes: 15,
          scale_code: "MBTI",
        },
        actions: {
          page_href: "/result/attempt-paid-fallback-1",
          pdf_href: "/api/v0.3/attempts/attempt-paid-fallback-1/report.pdf",
          history_href: "/history/mbti",
          lookup_href: "/orders/lookup",
        },
      })
    );
    const fallbackResponse = {
      ok: true,
      order_no: "ord_delivery_fallback_1",
      status: "paid",
      attempt_id: "attempt-paid-fallback-1",
      delivery: {
        can_view_report: true,
        report_url: "/result/attempt-paid-fallback-1",
        can_download_pdf: false,
        can_resend: false,
        can_request_claim_email: false,
        contact_email_present: true,
      },
    };
    hoisted.getOrderStatus.mockResolvedValueOnce(fallbackResponse);
    hoisted.getOrderStatus.mockResolvedValueOnce(fallbackResponse);

    render(<OrdersClient orderNo="ord_delivery_fallback_1" />);

    await waitFor(() => {
      expect(screen.getByTestId("order-form-summary")).toHaveTextContent("MBTI · 144-question full version");
    });
    expect(hoisted.fetchAttemptReportAccess).toHaveBeenCalledWith({
      attemptId: "attempt-paid-fallback-1",
      locale: "en",
    });
  });

  it("rescues legacy /orders return paths back into canonical wait flow when pending order context is available", async () => {
    window.localStorage.setItem(
      "fm_pending_order_v1",
      JSON.stringify({
        orderNo: "ord_legacy_return_1",
        attemptId: "attempt-legacy-return-1",
        sku: "mbti-full-report",
        provider: "alipay",
        waitUrl: "/en/pay/wait?order_no=ord_legacy_return_1&payment_recovery_token=recovery_legacy_return_1",
        paymentRecoveryToken: "recovery_legacy_return_1",
        resultUrl: "/en/result/attempt-legacy-return-1",
        updatedAt: "2026-04-02T12:00:00Z",
      })
    );
    hoisted.pathname = "/en/orders/ord_legacy_return_1";
    hoisted.getOrderStatus.mockResolvedValue({
      ok: true,
      order_no: "ord_legacy_return_1",
      status: "pending",
    });

    render(<OrdersClient orderNo="ord_legacy_return_1" />);

    await waitFor(() => {
      expect(hoisted.routerReplace).toHaveBeenCalledWith(
        "/en/pay/wait?order_no=ord_legacy_return_1&payment_recovery_token=recovery_legacy_return_1"
      );
    });
  });

  it("canonicalizes legacy /orders paths with a recovery token onto /pay/wait before showing recovery-only UI", async () => {
    hoisted.pathname = "/en/orders/ord_legacy_return_2";
    hoisted.getOrderStatus.mockResolvedValue({
      ok: true,
      order_no: "ord_legacy_return_2",
      status: "pending",
    });

    render(<OrdersClient orderNo="ord_legacy_return_2" paymentRecoveryToken="recovery_legacy_return_2" />);

    await waitFor(() => {
      expect(hoisted.routerReplace).toHaveBeenCalledWith(
        "/en/pay/wait?order_no=ord_legacy_return_2&payment_recovery_token=recovery_legacy_return_2"
      );
    });
  });

  it("recovers legacy /orders return paths from signed Alipay params when local context is gone", async () => {
    hoisted.pathname = "/en/orders/ord_legacy_return_3";
    hoisted.searchParams = "out_trade_no=ord_legacy_return_3&trade_no=ali_trade_return_3&sign=signed_payload";
    hoisted.recoverAlipayReturnContext.mockResolvedValueOnce({
      ok: true,
      order_no: "ord_legacy_return_3",
      payment_recovery_token: "recovery_legacy_return_3",
      wait_url:
        "/en/pay/wait?order_no=ord_legacy_return_3&payment_recovery_token=recovery_legacy_return_3",
    });
    hoisted.getOrderStatus.mockResolvedValue({
      ok: true,
      order_no: "ord_legacy_return_3",
      status: "pending",
    });

    render(<OrdersClient orderNo="ord_legacy_return_3" />);

    await waitFor(() => {
      expect(hoisted.recoverAlipayReturnContext).toHaveBeenCalledWith({
        orderNo: "ord_legacy_return_3",
        query: {
          out_trade_no: "ord_legacy_return_3",
          trade_no: "ali_trade_return_3",
          sign: "signed_payload",
          order_no: "ord_legacy_return_3",
        },
      });
    });
    await waitFor(() => {
      expect(hoisted.routerReplace).toHaveBeenCalledWith(
        "/en/pay/wait?order_no=ord_legacy_return_3&payment_recovery_token=recovery_legacy_return_3"
      );
    });
  });

  it("shows missing purchase email state and exposes recovery entry without breaking other actions", async () => {
    const exactResultEntry = createAccessProjection({
      attempt_id: "attempt-paid-3",
      actions: {
        page_href: "/result/attempt-paid-3",
        pdf_href: "/api/v0.3/attempts/attempt-paid-3/report.pdf",
        history_href: "/history/mbti",
        lookup_href: "/orders/lookup",
      },
      pdf_state: "unavailable",
    });
    hoisted.getOrderStatus.mockResolvedValue({
      ok: true,
      order_no: "ord_delivery_3",
      status: "paid",
      exact_result_entry: exactResultEntry,
      mbti_access_hub_v1: createMbtiAccessHubRaw("attempt-paid-3", "ord_delivery_3", {
        canRequestClaimEmail: true,
      }),
      delivery: {
        contact_email_present: false,
        last_delivery_email_sent_at: "2026-03-10T08:00:00Z",
        can_request_claim_email: true,
        can_view_report: true,
        report_url: "/result/attempt-paid-3",
        can_download_pdf: false,
        can_resend: true,
      },
    });

    render(<OrdersClient orderNo="ord_delivery_3" />);

    await waitFor(() => {
      expect(screen.getByTestId("order-delivery-actions")).toBeInTheDocument();
    });

    expect(hoisted.routerReplace).toHaveBeenCalledWith("/en/result/attempt-paid-3");
    expect(screen.getByTestId("order-delivery-contact-email")).toHaveTextContent("No purchase email on file");
    expect(screen.getByTestId("order-delivery-last-email-sent")).toHaveTextContent("2026");
    expect(screen.getByTestId("order-workspace-lite-entry")).toHaveAttribute("href", "/en/result/attempt-paid-3");
    expect(screen.getByTestId("order-back-to-result-link")).toHaveAttribute("href", "/en/result/attempt-paid-3");
    expect(screen.queryByTestId("order-view-report")).not.toBeInTheDocument();
    expect(screen.queryByTestId("order-download-pdf")).not.toBeInTheDocument();
    expect(screen.getByTestId("order-resend-delivery")).toBeInTheDocument();
    expect(screen.getByTestId("order-recover-with-email-link")).toHaveAttribute(
      "href",
      "/en/orders/lookup?orderNo=ord_delivery_3&mode=claim"
    );
    expect(hoisted.fetchAttemptReportAccess).not.toHaveBeenCalled();
  });

  it("hides download and resend when the delivery contract does not allow them", async () => {
    const exactResultEntry = createAccessProjection({
      attempt_id: "attempt-paid-2",
      actions: {
        page_href: "/result/attempt-paid-2",
        history_href: "/history/mbti",
        lookup_href: "/orders/lookup",
      },
      pdf_state: "unavailable",
    });
    hoisted.getOrderStatus.mockResolvedValue({
      ok: true,
      order_no: "ord_delivery_2",
      status: "paid",
      attempt_id: "attempt-paid-2",
      exact_result_entry: exactResultEntry,
      delivery: {
        contact_email_present: true,
        can_request_claim_email: false,
        can_view_report: true,
        report_url: "/result/attempt-paid-2",
        can_download_pdf: false,
        can_resend: false,
      },
    });

    render(<OrdersClient orderNo="ord_delivery_2" />);

    await waitFor(() => {
      expect(screen.getByTestId("order-delivery-actions")).toBeInTheDocument();
    });

    expect(screen.getByTestId("order-workspace-lite-entry")).toHaveAttribute("href", "/en/result/attempt-paid-2");
    expect(screen.getByTestId("order-back-to-result-link")).toHaveAttribute("href", "/en/result/attempt-paid-2");
    expect(screen.queryByTestId("order-view-report")).not.toBeInTheDocument();
    expect(screen.queryByTestId("order-download-pdf")).not.toBeInTheDocument();
    expect(screen.queryByTestId("order-resend-delivery")).not.toBeInTheDocument();
  });

  it("keeps paid-but-not-ready orders on the wait flow and removes the history primary CTA", async () => {
    hoisted.getOrderStatus.mockResolvedValue({
      ok: true,
      order_no: "ord_paid_processing_1",
      status: "paid",
      attempt_id: "attempt-paid-processing-1",
      exact_result_entry: createAccessProjection({
        attempt_id: "attempt-paid-processing-1",
        access_state: "locked",
        report_state: "pending",
        pdf_state: "unavailable",
        actions: {
          page_href: "/result/attempt-paid-processing-1",
          wait_href: "/result/attempt-paid-processing-1",
          history_href: "/history/mbti",
          lookup_href: "/orders/lookup",
        },
      }),
      mbti_access_hub_v1: createMbtiAccessHubRaw("attempt-paid-processing-1", "ord_paid_processing_1"),
      delivery: {
        can_view_report: false,
        can_download_pdf: false,
        can_resend: false,
        can_request_claim_email: false,
        contact_email_present: true,
      },
    });

    render(<OrdersClient orderNo="ord_paid_processing_1" />);

    await waitFor(() => {
      expect(screen.getByTestId("order-paid-processing-state")).toBeInTheDocument();
    });

    expect(screen.getByTestId("order-paid-processing-state")).toHaveTextContent(
      "Payment completed. Your report is still generating or restoring. Refresh in a few seconds."
    );
    expect(screen.getByTestId("order-back-to-result-link")).toHaveAttribute("href", "/en/result/attempt-paid-processing-1");
    expect(screen.getByTestId("order-back-to-result-link").querySelector("button")?.className).toContain("bg-[var(--fm-surface)]");
    expect(screen.getByTestId("order-refresh-button").className).toContain("bg-[var(--fm-cta-orange)]");
    expectInlineActionOrder(screen.getByTestId("order-wait-actions-paid-processing"), [
      "Back to my test result",
      "Refresh",
      "Contact support",
    ]);
    expect(screen.queryByTestId("order-delivery-actions")).not.toBeInTheDocument();
    expect(screen.queryByTestId("order-workspace-lite-entry")).not.toBeInTheDocument();
    expect(hoisted.routerReplace).not.toHaveBeenCalled();
    expect(hoisted.fetchAttemptReportAccess).not.toHaveBeenCalled();
  });

  it("recovers pending payment actions from order status when the URL has no pay params", async () => {
    hoisted.getOrderStatus.mockResolvedValue({
      ok: true,
      order_no: "ord_pending_pay_1",
      status: "pending",
      attempt_id: "ord_pending_pay_attempt_1",
      provider: "alipay",
      payment_recovery_token: "recovery_pending_pay_1",
      wait_url: "/en/pay/wait?order_no=ord_pending_pay_1&payment_recovery_token=recovery_pending_pay_1",
      pay: {
        type: "html",
        value: "/api/v0.3/orders/ord_pending_pay_1/pay/alipay?scene=desktop",
        provider: "alipay",
      },
    });

    render(<OrdersClient orderNo="ord_pending_pay_1" paymentRecoveryToken="recovery_pending_pay_1" />);

    await waitFor(() => {
      expect(screen.getByText("Complete your payment")).toBeInTheDocument();
    });

    expect(hoisted.getOrderStatus).toHaveBeenCalledWith({
      orderNo: "ord_pending_pay_1",
      includePaymentAction: true,
      locale: "en",
      paymentRecoveryToken: "recovery_pending_pay_1",
    });
    expect(screen.getByText("Provider: alipay")).toBeInTheDocument();
    expect(screen.getByText("Continue payment in the provider page, then return to this tab.")).toBeInTheDocument();
    expect(screen.getByTestId("order-back-to-result-link")).toHaveAttribute("href", "/en/result/ord_pending_pay_attempt_1");
    expectInlineActionOrder(screen.getByTestId("order-wait-actions-pending"), [
      "Back to my test result",
      "Refresh",
      "Contact support",
    ]);

    fireEvent.click(screen.getByRole("button", { name: "Open payment page" }));

    expect(hoisted.openWindow).toHaveBeenCalledWith(
      "/api/v0.3/orders/ord_pending_pay_1/pay/alipay?scene=desktop",
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("does not expose unsafe pending payment action URLs from order status", async () => {
    hoisted.getOrderStatus.mockResolvedValue({
      ok: true,
      order_no: "ord_pending_pay_unsafe_1",
      status: "pending",
      attempt_id: "attempt-pending-pay-unsafe-1",
      provider: "alipay",
      pay: {
        type: "html",
        value: "https://pay.example.invalid/checkout",
        provider: "alipay",
      },
    });

    render(<OrdersClient orderNo="ord_pending_pay_unsafe_1" paymentRecoveryToken="recovery_pending_pay_unsafe_1" />);

    await waitFor(() => {
      expect(screen.getByTestId("order-wait-actions-pending")).toBeInTheDocument();
    });

    expect(screen.queryByRole("button", { name: "Open payment page" })).not.toBeInTheDocument();
    expect(hoisted.openWindow).not.toHaveBeenCalled();
  });

  it("keeps requesting payment actions while a pending order still has no pay payload", async () => {
    vi.useFakeTimers();
    const pendingWithoutPay = {
      ok: true,
      order_no: "ord_pending_pay_2",
      status: "pending",
      attempt_id: "attempt-pending-pay-2",
      payment_recovery_token: "recovery_pending_pay_2",
      wait_url: "/en/pay/wait?order_no=ord_pending_pay_2&payment_recovery_token=recovery_pending_pay_2",
    };
    const pendingWithPay = {
      ok: true,
      order_no: "ord_pending_pay_2",
      status: "pending",
      provider: "alipay",
      pay: {
        type: "html",
        value: "/api/v0.3/orders/ord_pending_pay_2/pay/alipay?scene=desktop",
        provider: "alipay",
      },
    };
    let invocation = 0;
    hoisted.getOrderStatus.mockImplementation(async () => {
      invocation += 1;
      return invocation === 1 ? pendingWithoutPay : pendingWithPay;
    });

    render(<OrdersClient orderNo="ord_pending_pay_2" paymentRecoveryToken="recovery_pending_pay_2" />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(hoisted.getOrderStatus.mock.calls.length).toBeGreaterThanOrEqual(1);
    expect(hoisted.getOrderStatus).toHaveBeenNthCalledWith(1, {
      orderNo: "ord_pending_pay_2",
      includePaymentAction: true,
      locale: "en",
      paymentRecoveryToken: "recovery_pending_pay_2",
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    expect(hoisted.getOrderStatus.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(
      hoisted.getOrderStatus.mock.calls.slice(0, 2).every(([payload]) => {
        return (
          payload?.orderNo === "ord_pending_pay_2"
          && payload?.includePaymentAction === true
          && payload?.locale === "en"
          && payload?.paymentRecoveryToken === "recovery_pending_pay_2"
        );
      })
    ).toBe(true);

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText("Complete your payment")).toBeInTheDocument();
    expect(screen.getByTestId("order-back-to-result-link")).toHaveAttribute("href", "/en/result/attempt-pending-pay-2");
  });

  it("routes ownership 404 into order lookup recovery instead of leaving the page pending", async () => {
    hoisted.getOrderStatus.mockRejectedValue(
      new ApiError({
        status: 404,
        errorCode: "NOT_FOUND",
        message: "order not found.",
      })
    );

    render(<OrdersClient orderNo="ord_missing_owner_1" />);

    await waitFor(() => {
      expect(screen.getByTestId("order-recovery-required")).toBeInTheDocument();
    });

    expect(screen.getByTestId("order-recovery-required")).toHaveTextContent(
      "This order is not available under the current identity."
    );
    expect(screen.getByText("You may have switched browsers, devices, or anonymous identities. Use order lookup to recover this payment flow.")).toBeInTheDocument();
    expect(screen.queryByText("Payment confirmation timed out. Please refresh or contact support.")).not.toBeInTheDocument();
    expect(screen.getByTestId("order-recovery-lookup-link")).toHaveAttribute(
      "href",
      "/en/orders/lookup?orderNo=ord_missing_owner_1"
    );
    expect(screen.queryByText("Confirming your payment...")).not.toBeInTheDocument();
  });

  it("routes identity mismatch 403 into recovery guidance without showing the pending shell", async () => {
    hoisted.getOrderStatus.mockRejectedValue(
      new ApiError({
        status: 403,
        errorCode: "IDENTITY_MISMATCH",
        message: "identity mismatch.",
      })
    );

    render(<OrdersClient orderNo="ord_identity_mismatch_1" />);

    await waitFor(() => {
      expect(screen.getByTestId("order-recovery-required")).toBeInTheDocument();
    });

    expect(screen.getByTestId("order-recovery-required")).toHaveTextContent(
      "This order belongs to a different signed-in identity."
    );
    expect(
      screen.getByText("Sign in with the account used for purchase, or use order lookup if you checked out as a guest.")
    ).toBeInTheDocument();
    expect(screen.queryByText("Payment confirmation timed out. Please refresh or contact support.")).not.toBeInTheDocument();
    expect(screen.queryByText("Confirming your payment...")).not.toBeInTheDocument();
  });
});

function createMbtiAccessHubRaw(
  attemptId: string,
  orderNo: string,
  overrides: {
    canDownloadPdf?: boolean;
    canRequestClaimEmail?: boolean;
    canResend?: boolean;
    unlock_stage?: "locked" | "partial" | "full" | string;
    unlock_source?: "none" | "invite" | "payment" | "mixed" | string;
    invite_unlock_v1?: Record<string, unknown> | null;
  } = {}
): MbtiAccessHubV1Raw {
  return {
    access_state: "ready",
    unlock_stage: overrides.unlock_stage ?? "locked",
    unlock_source: overrides.unlock_source ?? "none",
    invite_unlock_v1: overrides.invite_unlock_v1 ?? null,
    report_access: {
      can_view_report: true,
      attempt_id: attemptId,
      order_no: orderNo,
      report_url: `/result/${attemptId}`,
      source: "order_delivery",
    },
    pdf_access: {
      can_download_pdf: overrides.canDownloadPdf ?? true,
      report_pdf_url: `/api/v0.3/attempts/${attemptId}/report.pdf`,
      source: "order_delivery",
    },
    recovery: {
      can_lookup_order: true,
      can_request_claim_email: overrides.canRequestClaimEmail ?? true,
      can_resend: overrides.canResend ?? true,
      attempt_id: attemptId,
      share_id: null,
      compare_invite_id: null,
    },
    workspace_lite: {
      has_entry: true,
      entry_kind: "mbti_history",
      attempt_id: attemptId,
    },
  };
}
