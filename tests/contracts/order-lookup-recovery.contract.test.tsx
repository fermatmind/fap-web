import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OrderLookupForm } from "@/components/support/OrderLookupForm";
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
  lookupOrder: vi.fn(),
  requestClaimReportEmail: vi.fn(),
  captureError: vi.fn(),
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
    lookupOrder: hoisted.lookupOrder,
    requestClaimReportEmail: hoisted.requestClaimReportEmail,
  };
});

vi.mock("@/lib/observability/sentry", () => ({
  captureError: hoisted.captureError,
}));

function createDict(): SiteDictionary {
  return {
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
    const pendingLookup = deferred<{
      ok: boolean;
      order_no: string;
    }>();
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
    });

    await waitFor(() => {
      expect(hoisted.routerPush).toHaveBeenCalledWith("/en/orders/ord_lookup_001");
    });
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
