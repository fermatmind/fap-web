import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import OrdersClient from "@/app/(localized)/[locale]/orders/[orderNo]/OrdersClient";
import type { MbtiAccessHubV1Raw } from "@/lib/mbti/accessHub";

const hoisted = vi.hoisted(() => ({
  getOrderStatus: vi.fn(),
  resendOrderDelivery: vi.fn(),
  fetchAttemptReportPdf: vi.fn(),
  trackEvent: vi.fn(),
  routerReplace: vi.fn(),
  createObjectURL: vi.fn(() => "blob:mbti-report"),
  revokeObjectURL: vi.fn(),
  openWindow: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/orders/ord_delivery_1",
  useRouter: () => ({
    replace: hoisted.routerReplace,
  }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: hoisted.trackEvent,
}));

vi.mock("@/lib/api/v0_3", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/v0_3")>("@/lib/api/v0_3");

  return {
    ...actual,
    getOrderStatus: hoisted.getOrderStatus,
    resendOrderDelivery: hoisted.resendOrderDelivery,
    fetchAttemptReportPdf: hoisted.fetchAttemptReportPdf,
  };
});

describe("OrdersClient delivery contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.fetchAttemptReportPdf.mockResolvedValue(new Blob(["pdf"], { type: "application/pdf" }));
    hoisted.resendOrderDelivery.mockResolvedValue({ ok: true, message: "Delivery email sent again." });
    globalThis.URL.createObjectURL = hoisted.createObjectURL;
    globalThis.URL.revokeObjectURL = hoisted.revokeObjectURL;
    vi.spyOn(window.HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    vi.spyOn(window, "open").mockImplementation(hoisted.openWindow);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders paid delivery actions from the contract and wires view report/download/resend", async () => {
    hoisted.getOrderStatus.mockResolvedValue({
      ok: true,
      order_no: "ord_delivery_1",
      status: "paid",
      attempt_id: "attempt-paid-1",
      mbti_access_hub_v1: createMbtiAccessHubRaw("attempt-paid-1", "ord_delivery_1"),
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
    expect(screen.getByTestId("order-delivery-contact-email")).toHaveTextContent("Purchase email on file");
    expect(screen.getByTestId("order-delivery-last-email-sent")).toHaveTextContent("2026");
    expect(screen.getByTestId("order-recover-with-email-link")).toHaveAttribute(
      "href",
      "/en/orders/lookup?orderNo=ord_delivery_1&mode=claim"
    );
    expect(screen.getByTestId("order-workspace-lite-entry")).toHaveAttribute("href", "/en/history/mbti");
    expect(screen.getByTestId("order-view-report").closest("a")).toHaveAttribute("href", "/en/result/attempt-paid-1");
    expect(screen.getByTestId("order-download-pdf")).toBeInTheDocument();
    expect(screen.getByTestId("order-resend-delivery")).toBeInTheDocument();

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
        locale: "en",
      })
    );
    expect(screen.getByText("Delivery email sent again.")).toBeInTheDocument();
  });

  it("shows missing purchase email state and exposes recovery entry without breaking other actions", async () => {
    hoisted.getOrderStatus.mockResolvedValue({
      ok: true,
      order_no: "ord_delivery_3",
      status: "paid",
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

    expect(hoisted.routerReplace).not.toHaveBeenCalled();
    expect(screen.getByTestId("order-delivery-contact-email")).toHaveTextContent("No purchase email on file");
    expect(screen.getByTestId("order-delivery-last-email-sent")).toHaveTextContent("2026");
    expect(screen.getByTestId("order-view-report").closest("a")).toHaveAttribute("href", "/en/result/attempt-paid-3");
    expect(screen.getByTestId("order-download-pdf")).toBeInTheDocument();
    expect(screen.getByTestId("order-resend-delivery")).toBeInTheDocument();
    expect(screen.getByTestId("order-recover-with-email-link")).toHaveAttribute(
      "href",
      "/en/orders/lookup?orderNo=ord_delivery_3&mode=claim"
    );
    expect(screen.getByTestId("order-workspace-lite-entry")).toHaveAttribute("href", "/en/history/mbti");
  });

  it("hides download and resend when the delivery contract does not allow them", async () => {
    hoisted.getOrderStatus.mockResolvedValue({
      ok: true,
      order_no: "ord_delivery_2",
      status: "paid",
      attempt_id: "attempt-paid-2",
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

    expect(screen.getByTestId("order-view-report")).toBeInTheDocument();
    expect(screen.queryByTestId("order-download-pdf")).not.toBeInTheDocument();
    expect(screen.queryByTestId("order-resend-delivery")).not.toBeInTheDocument();
  });
});

function createMbtiAccessHubRaw(
  attemptId: string,
  orderNo: string,
  overrides: {
    canDownloadPdf?: boolean;
    canRequestClaimEmail?: boolean;
    canResend?: boolean;
  } = {}
): MbtiAccessHubV1Raw {
  return {
    access_state: "ready",
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
