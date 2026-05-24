import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OrderLookupForm } from "@/components/support/OrderLookupForm";
import type { OrderLookupResponse } from "@/lib/api/v0_3";
import { readPendingOrder } from "@/lib/commerce/pendingOrder";
import type { MbtiAccessHubV1Raw } from "@/lib/mbti/accessHub";
import type { SiteDictionary } from "@/lib/i18n/types";

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
  pathname: "/en/orders/lookup",
  search: "",
  routerPush: vi.fn(),
  captureEmailContact: vi.fn(),
  fetchAttemptReportAccess: vi.fn(),
  lookupOrder: vi.fn(),
  requestClaimReportEmail: vi.fn(),
  captureError: vi.fn(),
  trackEvent: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => hoisted.pathname,
  useRouter: () => ({
    push: hoisted.routerPush,
  }),
  useSearchParams: () => new URLSearchParams(hoisted.search),
}));

vi.mock("@/lib/api/v0_3", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/v0_3")>("@/lib/api/v0_3");

  return {
    ...actual,
    captureEmailContact: hoisted.captureEmailContact,
    fetchAttemptReportAccess: hoisted.fetchAttemptReportAccess,
    lookupOrder: hoisted.lookupOrder,
    requestClaimReportEmail: hoisted.requestClaimReportEmail,
  };
});

function createAccessProjection(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    ok: true,
    attempt_id: "attempt-lookup-hub-1",
    access_state: "ready",
    report_state: "ready",
    pdf_state: "ready",
    reason_code: "report_ready",
    projection_version: 1,
    actions: {
      page_href: "/result/attempt-lookup-hub-1",
      pdf_href: "/api/v0.3/attempts/attempt-lookup-hub-1/report.pdf",
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

vi.mock("@/lib/observability/sentry", () => ({
  captureError: hoisted.captureError,
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: hoisted.trackEvent,
}));

function createDict(): SiteDictionary {
  return {
    orders: {
      contactSupport: "Contact support",
      paymentActionTitle: "Complete your payment",
      paymentProviderLabel: "Provider",
      qrCodeHint: "Scan this QR code in your payment app to complete checkout.",
      qrCodeGenerating: "Generating secure QR code...",
      qrCodeUnavailable: "Unable to render QR code. Please refresh and try again.",
      openPaymentHint: "Continue payment in the provider page, then return to this tab.",
      openPaymentPage: "Open payment page",
    },
    support: {
      lookup: "Order lookup",
    },
  } as SiteDictionary;
}

function renderForm() {
  return render(<OrderLookupForm locale="en" dict={createDict()} />);
}

function createCaptureResponse(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    ok: true,
    subscriber_status: "active",
    captured_at: "2026-03-12T09:30:00Z",
    marketing_consent: false,
    transactional_recovery_enabled: true,
    ...overrides,
  };
}

async function fillLookupForm({
  orderNo = "ord_lookup_001",
  email = "buyer@example.com",
}: {
  orderNo?: string;
  email?: string;
} = {}) {
  fireEvent.change(screen.getByTestId("order-lookup-order-no"), {
    target: { value: orderNo },
  });
  fireEvent.change(screen.getByTestId("order-lookup-email"), {
    target: { value: email },
  });
}

describe("OrderLookupForm recovery contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.pathname = "/en/orders/lookup";
    hoisted.search = "";
    hoisted.captureEmailContact.mockResolvedValue(createCaptureResponse());
    hoisted.fetchAttemptReportAccess.mockResolvedValue(createAccessProjection());
    hoisted.lookupOrder.mockResolvedValue({
      ok: true,
      order_no: "ord_lookup_001",
    });
    hoisted.requestClaimReportEmail.mockResolvedValue({
      ok: true,
      message: "Not exposed.",
    });
    Object.defineProperty(document, "referrer", {
      configurable: true,
      value: "https://example.com/en/help/faq",
    });
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it("renders a marketing consent consumer with a default opt-in of false", () => {
    renderForm();

    expect(screen.getByTestId("order-lookup-marketing-consent-consumer")).toHaveTextContent(
      "Receive product and marketing updates"
    );
    expect(screen.getByTestId("order-lookup-marketing-consent-consumer")).toHaveTextContent(
      "This does not affect report recovery or delivery emails."
    );
    expect(screen.getByTestId("order-lookup-marketing-consent")).not.toBeChecked();
  });

  it("captures email contact before lookup submit", async () => {
    renderForm();
    await fillLookupForm();

    fireEvent.click(screen.getByTestId("order-lookup-submit"));

    await waitFor(() => {
      expect(hoisted.lookupOrder).toHaveBeenCalledWith({
        orderNo: "ord_lookup_001",
        email: "buyer@example.com",
        locale: "en",
      });
    });

    expect(hoisted.captureEmailContact).toHaveBeenCalledWith({
      email: "buyer@example.com",
      locale: "en",
      surface: "lookup",
      order_no: "ord_lookup_001",
      attempt_id: undefined,
      share_id: undefined,
      compare_invite_id: undefined,
      entrypoint: "order_lookup",
      referrer: "https://example.com/en/help/faq",
      landing_path: "/en/orders/lookup",
      utm: undefined,
      marketing_consent: false,
    });
    expect(hoisted.captureEmailContact.mock.invocationCallOrder[0]).toBeLessThan(
      hoisted.lookupOrder.mock.invocationCallOrder[0]
    );
  });

  it("captures email contact before claim submit", async () => {
    renderForm();
    await fillLookupForm();
    fireEvent.click(screen.getByTestId("order-lookup-marketing-consent"));

    fireEvent.click(screen.getByTestId("order-claim-submit"));

    await waitFor(() => {
      expect(hoisted.requestClaimReportEmail).toHaveBeenCalledTimes(1);
    });

    expect(hoisted.captureEmailContact).toHaveBeenCalledWith({
      email: "buyer@example.com",
      locale: "en",
      surface: "lookup",
      order_no: "ord_lookup_001",
      attempt_id: undefined,
      share_id: undefined,
      compare_invite_id: undefined,
      entrypoint: "order_lookup",
      referrer: "https://example.com/en/help/faq",
      landing_path: "/en/orders/lookup",
      utm: undefined,
      marketing_consent: true,
    });
    expect(hoisted.captureEmailContact.mock.invocationCallOrder[0]).toBeLessThan(
      hoisted.requestClaimReportEmail.mock.invocationCallOrder[0]
    );
  });

  it("consumes the capture foundation response before lookup completes", async () => {
    const pendingLookup = deferred<OrderLookupResponse>();
    hoisted.lookupOrder.mockReturnValueOnce(pendingLookup.promise);
    hoisted.captureEmailContact.mockResolvedValueOnce(
      createCaptureResponse({
        subscriber_status: "unsubscribed",
        captured_at: "2026-03-12T10:45:00Z",
        marketing_consent: false,
        transactional_recovery_enabled: true,
      })
    );

    renderForm();
    await fillLookupForm();

    fireEvent.click(screen.getByTestId("order-lookup-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("order-lookup-capture-foundation")).toBeInTheDocument();
    });

    expect(screen.getByTestId("order-lookup-capture-subscriber-status")).toHaveTextContent("Unsubscribed");
    expect(screen.getByTestId("order-lookup-capture-captured-at")).toHaveAttribute(
      "datetime",
      "2026-03-12T10:45:00Z"
    );
    expect(screen.getByTestId("order-lookup-capture-marketing-consent")).toHaveTextContent("Disabled");
    expect(screen.getByTestId("order-lookup-capture-report-recovery")).toHaveTextContent("Enabled");

    pendingLookup.resolve({
      ok: true,
      order_no: "ord_lookup_001",
      status: "pending",
    });

    await waitFor(() => {
      expect(screen.getByTestId("order-lookup-hit-actions")).toBeInTheDocument();
    });
    expect(hoisted.routerPush).not.toHaveBeenCalled();
  });

  it("shows backend-owned MBTI form summary on a successful lookup hit", async () => {
    hoisted.lookupOrder.mockResolvedValueOnce({
      ok: true,
      order_no: "ord_lookup_001",
      status: "paid",
      attempt_id: "attempt-lookup-hub-1",
      mbti_form_v1: {
        form_code: "mbti_144",
        label: "144-question full version",
        short_label: "144 questions",
        question_count: 144,
        estimated_minutes: 15,
        scale_code: "MBTI",
      },
      delivery: {
        can_view_report: true,
        report_url: "/result/attempt-lookup-hub-1",
        can_download_pdf: true,
        report_pdf_url: "/api/v0.3/attempts/attempt-lookup-hub-1/report.pdf",
        can_resend: true,
        can_request_claim_email: true,
        contact_email_present: true,
        last_delivery_email_sent_at: null,
      },
    });

    renderForm();
    await fillLookupForm();

    fireEvent.click(screen.getByTestId("order-lookup-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("order-lookup-form-summary")).toHaveTextContent("MBTI · 144-question full version");
    });
    expect(hoisted.fetchAttemptReportAccess).toHaveBeenCalledWith({
      attemptId: "attempt-lookup-hub-1",
      locale: "en",
    });
  });

  it("shows backend-owned Big Five form summary on a successful lookup hit", async () => {
    hoisted.lookupOrder.mockResolvedValueOnce({
      ok: true,
      order_no: "ord_lookup_big5_001",
      status: "paid",
      attempt_id: "attempt-lookup-big5-1",
      big5_form_v1: {
        form_code: "big5_120",
        label: "120-question full version",
        short_label: "120 questions",
        question_count: 120,
        estimated_minutes: 14,
        scale_code: "BIG5_OCEAN",
      },
      delivery: {
        can_view_report: true,
        report_url: "/result/attempt-lookup-big5-1",
        can_download_pdf: false,
        can_resend: false,
        can_request_claim_email: false,
        contact_email_present: true,
      },
    });

    renderForm();
    await fillLookupForm({
      orderNo: "ord_lookup_big5_001",
      email: "buyer@example.com",
    });

    fireEvent.click(screen.getByTestId("order-lookup-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("order-lookup-form-summary")).toHaveTextContent("Big Five · 120-question full version");
    });
  });

  it("falls back to report-access mbti_form_v1 when the lookup payload omits the top-level summary", async () => {
    hoisted.fetchAttemptReportAccess.mockResolvedValueOnce(
      createAccessProjection({
        attempt_id: "attempt-lookup-hub-fallback-1",
        mbti_form_v1: {
          form_code: "mbti_93",
          label: "93-question standard version",
          short_label: "93 questions",
          question_count: 93,
          estimated_minutes: 10,
          scale_code: "MBTI",
        },
      })
    );
    hoisted.lookupOrder.mockResolvedValueOnce({
      ok: true,
      order_no: "ord_lookup_fallback_001",
      status: "paid",
      attempt_id: "attempt-lookup-hub-fallback-1",
      delivery: {
        can_view_report: true,
        report_url: "/result/attempt-lookup-hub-fallback-1",
        can_download_pdf: false,
        can_request_claim_email: false,
      },
    });

    renderForm();
    await fillLookupForm({
      orderNo: "ord_lookup_fallback_001",
      email: "fallback@example.com",
    });

    fireEvent.click(screen.getByTestId("order-lookup-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("order-lookup-form-summary")).toHaveTextContent("MBTI · 93-question standard version");
    });
  });

  it("falls back to report-access big5_form_v1 when the lookup payload omits the top-level summary", async () => {
    hoisted.fetchAttemptReportAccess.mockResolvedValueOnce(
      createAccessProjection({
        attempt_id: "attempt-lookup-big5-fallback-1",
        big5_form_v1: {
          form_code: "big5_90",
          label: "90-question standard version",
          short_label: "90 questions",
          question_count: 90,
          estimated_minutes: 11,
          scale_code: "BIG5_OCEAN",
        },
        actions: {
          page_href: "/result/attempt-lookup-big5-fallback-1",
          pdf_href: "/api/v0.3/attempts/attempt-lookup-big5-fallback-1/report.pdf",
          history_href: "/history/big5",
          lookup_href: "/orders/lookup",
        },
      })
    );
    hoisted.lookupOrder.mockResolvedValueOnce({
      ok: true,
      order_no: "ord_lookup_big5_fallback_001",
      status: "paid",
      attempt_id: "attempt-lookup-big5-fallback-1",
      delivery: {
        can_view_report: true,
        report_url: "/result/attempt-lookup-big5-fallback-1",
        can_download_pdf: false,
        can_request_claim_email: false,
      },
    });

    renderForm();
    await fillLookupForm({
      orderNo: "ord_lookup_big5_fallback_001",
      email: "fallback@example.com",
    });

    fireEvent.click(screen.getByTestId("order-lookup-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("order-lookup-form-summary")).toHaveTextContent("Big Five · 90-question standard version");
    });
  });

  it("prefers mbti_access_hub_v1 on lookup hits and keeps recovery actions on the lookup surface", async () => {
    hoisted.fetchAttemptReportAccess.mockResolvedValueOnce(
      createAccessProjection({
        attempt_id: "attempt-lookup-hub-1",
        actions: {
          page_href: "/result/attempt-lookup-hub-1",
          pdf_href: "/api/v0.3/attempts/attempt-lookup-hub-1/report.pdf",
          history_href: "/history/mbti",
          lookup_href: "/orders/lookup",
        },
      })
    );
    hoisted.lookupOrder.mockResolvedValueOnce({
      ok: true,
      order_no: "ord_lookup_hub_001",
      mbti_access_hub_v1: createLookupHubRaw("attempt-lookup-hub-1", "ord_lookup_hub_001", {
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
    });

    renderForm();
    await fillLookupForm({
      orderNo: "ord_lookup_hub_001",
      email: "hub@example.com",
    });

    fireEvent.click(screen.getByTestId("order-lookup-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("order-lookup-hit-actions")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByTestId("order-lookup-hit-report")).toHaveAttribute("href", "/en/result/attempt-lookup-hub-1");
    });

    expect(hoisted.routerPush).not.toHaveBeenCalled();
    expect(screen.getByTestId("order-lookup-hit-order")).toHaveAttribute("href", "/en/orders/ord_lookup_hub_001");
    expect(screen.getByTestId("order-lookup-invite-unlock-summary")).toHaveTextContent("Invite unlock 1/2");
    expect(screen.getByTestId("order-lookup-invite-unlock-summary")).toHaveTextContent("Invite unlock 1/2 · Career unlocked");
    expect(screen.getByTestId("order-lookup-hit-pdf")).toBeInTheDocument();
    expect(screen.getByTestId("order-lookup-hit-claim")).toBeInTheDocument();
    expect(screen.getByTestId("order-lookup-hit-history")).toHaveAttribute("href", "/en/history/mbti");
    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "invite_staged_summary_viewed",
      expect.objectContaining({
        unlock_stage: "partial",
        unlock_source: "invite",
        completed_invitees: 1,
        required_invitees: 2,
        entry_surface: "order_lookup",
        locale: "en",
      })
    );
  });

  it("renders pending payment recovery inline on lookup hits instead of redirecting back to the order page", async () => {
    hoisted.lookupOrder.mockResolvedValueOnce({
      ok: true,
      order_no: "ord_lookup_pending_001",
      status: "pending",
      provider: "wechatpay",
      pay: {
        type: "qr",
        value: "weixin://wxpay/bizpayurl?pr=lookup_pending",
        provider: "wechatpay",
      },
      delivery: {
        can_request_claim_email: false,
        can_view_report: false,
        can_download_pdf: false,
      },
    });

    renderForm();
    await fillLookupForm({
      orderNo: "ord_lookup_pending_001",
      email: "buyer@example.com",
    });

    fireEvent.click(screen.getByTestId("order-lookup-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("order-lookup-hit-payment-action")).toBeInTheDocument();
    });

    expect(hoisted.routerPush).not.toHaveBeenCalled();
    expect(screen.getByText("Provider: wechatpay")).toBeInTheDocument();
    expect(screen.getByText("Order matched. Continue the payment here.")).toBeInTheDocument();
    expect(screen.getByText("Scan this QR code in your payment app to complete checkout.")).toBeInTheDocument();
  });

  it("routes pending alipay lookup recovery back into the generic wait flow", async () => {
    hoisted.lookupOrder.mockResolvedValueOnce({
      ok: true,
      order_no: "ord_lookup_pending_alipay_001",
      status: "pending",
      provider: "alipay",
      payment_recovery_token: "recovery_lookup_pending_alipay_001",
      wait_url: "/pay/wait?order_no=ord_lookup_pending_alipay_001&payment_recovery_token=recovery_lookup_pending_alipay_001",
      result_url: "/result/attempt-lookup-pending-alipay-1?from=payment",
      pay: {
        type: "html",
        value: "/api/v0.3/orders/ord_lookup_pending_alipay_001/pay/alipay?scene=desktop",
        provider: "alipay",
      },
      delivery: {
        can_request_claim_email: false,
        can_view_report: false,
        can_download_pdf: false,
      },
    });

    renderForm();
    await fillLookupForm({
      orderNo: "ord_lookup_pending_alipay_001",
      email: "buyer@example.com",
    });

    fireEvent.click(screen.getByTestId("order-lookup-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("order-lookup-hit-open-payment")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("order-lookup-hit-open-payment"));

    await waitFor(() => {
      expect(hoisted.routerPush).toHaveBeenCalledTimes(1);
    });
    const [waitHref] = hoisted.routerPush.mock.calls.at(-1) ?? [];
    const waitUrl = new URL(String(waitHref ?? ""), "https://example.test");
    expect(waitUrl.pathname).toBe("/en/pay/wait");
    expect(waitUrl.searchParams.get("order_no")).toBe("ord_lookup_pending_alipay_001");
    expect(waitUrl.searchParams.get("pay_type")).toBe("html");
    expect(waitUrl.searchParams.get("pay_value")).toBe(
      "/api/v0.3/orders/ord_lookup_pending_alipay_001/pay/alipay?scene=desktop"
    );
    expect(waitUrl.searchParams.get("provider")).toBe("alipay");
    expect(waitUrl.searchParams.get("payment_recovery_token")).toBe("recovery_lookup_pending_alipay_001");
    expect(readPendingOrder()).toEqual(
      expect.objectContaining({
        orderNo: "ord_lookup_pending_alipay_001",
        attemptId: null,
        sku: null,
        provider: "alipay",
        waitUrl: String(waitHref),
        paymentRecoveryToken: "recovery_lookup_pending_alipay_001",
        resultUrl: null,
      })
    );
  });

  it("requests the claim report email after capture on claim submit", async () => {
    renderForm();
    await fillLookupForm({
      orderNo: "ord_claim_001",
      email: "claim@example.com",
    });

    fireEvent.click(screen.getByTestId("order-claim-submit"));

    await waitFor(() => {
      expect(hoisted.requestClaimReportEmail).toHaveBeenCalledWith({
        order_no: "ord_claim_001",
        email: "claim@example.com",
        locale: "en",
        surface: "lookup",
        entrypoint: "order_lookup",
        referrer: "https://example.com/en/help/faq",
        landing_path: "/en/orders/lookup",
        utm: undefined,
        share_id: undefined,
        compare_invite_id: undefined,
      });
    });
  });

  it("shows blind success copy after claim succeeds", async () => {
    renderForm();
    await fillLookupForm();

    fireEvent.click(screen.getByTestId("order-claim-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("order-lookup-feedback")).toHaveTextContent(
        "We’ve received the request. When the order matches, the report link will be sent to the purchase email."
      );
    });
  });

  it("prefills order number from the query string", async () => {
    hoisted.search = "orderNo=ord_prefilled_001";

    renderForm();

    await waitFor(() => {
      expect(screen.getByTestId("order-lookup-order-no")).toHaveValue("ord_prefilled_001");
    });
  });

  it("enters claim-priority mode from mode=claim", async () => {
    hoisted.search = "orderNo=ord_prefilled_001&mode=claim";

    renderForm();

    await waitFor(() => {
      expect(screen.getByTestId("order-claim-submit")).toHaveAttribute("data-priority", "primary");
    });
    expect(screen.getByTestId("order-lookup-submit")).toHaveAttribute("data-priority", "secondary");
    expect(screen.getByTestId("order-claim-submit")).toHaveFocus();
  });

  it("does not leak existence or mismatch copy after claim success", async () => {
    hoisted.requestClaimReportEmail.mockResolvedValueOnce({
      ok: true,
      message: "Email mismatch for that order.",
    });

    renderForm();
    await fillLookupForm({
      orderNo: "ord_claim_404",
      email: "wrong@example.com",
    });

    fireEvent.click(screen.getByTestId("order-claim-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("order-lookup-feedback")).toHaveTextContent("We’ve received the request.");
    });

    expect(screen.queryByText("Email mismatch for that order.")).not.toBeInTheDocument();
    expect(screen.queryByText(/order not found/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/mismatch/i)).not.toBeInTheDocument();
  });
});

function createLookupHubRaw(
  attemptId: string,
  orderNo: string,
  overrides: {
    unlock_stage?: "locked" | "partial" | "full" | string;
    unlock_source?: "none" | "invite" | "payment" | "mixed" | string;
    invite_unlock_v1?: Record<string, unknown> | null;
  } = {}
): MbtiAccessHubV1Raw {
  return {
    access_state: "recovery_available",
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
      can_download_pdf: true,
      report_pdf_url: `/api/v0.3/attempts/${attemptId}/report.pdf`,
      source: "order_delivery",
    },
    recovery: {
      can_lookup_order: true,
      can_request_claim_email: true,
      can_resend: false,
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
